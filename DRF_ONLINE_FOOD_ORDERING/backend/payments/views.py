import requests
import uuid
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction
import logging
from core.models import Order, CartItems
from .models import PaymentTransaction

logger = logging.getLogger(__name__)

from django.utils import timezone
from django.db import transaction
from core.models import CartItems, Order

def create_order_from_cart(user, data):
    """
    Creates an order from user's cart items and clears them.
    
    Parameters:
        user: User instance
        data: dict containing delivery_option, times, address, location, branch
    
    Returns:
        Order instance
    Raises:
        ValueError: if cart is empty or validation fails
    """

    with transaction.atomic():
        cart_items = list(
            CartItems.objects.select_for_update()
            .filter(user=user, ordered=False)
            .select_related('item')
        )

        if not cart_items:
            raise ValueError("Your cart is empty")

        delivery_option = data.get('delivery_option', 'pickup')
        delivery_time = data.get('delivery_time')
        pickup_time = data.get('pickup_time')
        delivery_address = data.get('delivery_address', '')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        pickup_branch = data.get('pickup_branch')

        now = timezone.now()
        if delivery_option == 'pickup' and not pickup_time:
            pickup_time = now
        elif delivery_option == 'delivery' and not delivery_time:
            delivery_time = now

        if delivery_option == 'delivery' and not delivery_address and not (latitude and longitude):
            raise ValueError("Delivery address or coordinates required for delivery")

        if delivery_option == 'pickup' and not pickup_branch:
            raise ValueError("Pickup branch is required for pickup orders")

        total_price = sum(item.quantity * item.item.price for item in cart_items)

        order = Order.objects.create(
            user=user,
            delivery_option=delivery_option,
            pickup_time=pickup_time,
            delivery_time=delivery_time,
            delivery_address=delivery_address if delivery_option == 'delivery' else None,
            latitude=latitude if delivery_option == 'delivery' else None,
            longitude=longitude if delivery_option == 'delivery' else None,
            pickup_branch=pickup_branch if delivery_option == 'pickup' else None,
            total_price=total_price
        )

        for item in cart_items:
            item.ordered = True
            item.order = order
            item.status = 'Active'
            item.ordered_date = timezone.now()
            item.save()

        # Increment score
        user.score += 1
        user.save()

        return order


class PaymentInitiateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            cart_items = CartItems.objects.filter(user=request.user, ordered=False)
            if not cart_items.exists():
                return Response({"error": "Cart is empty"}, status=400)

            # Calculate total amount
            amount = sum(item.total_price for item in cart_items)
            tx_ref = f"chapa-{uuid.uuid4().hex}"

            # Support dynamic return_url for deeplink/mobile
            return_url = request.data.get('return_url')
            if not return_url:
                return_url = f"{settings.WEB_APP_URL}/payment-success?tx_ref={tx_ref}"
            callback_url = f"{settings.DOMAIN_URL}/payments/webhook/"

            # Save intent (delivery data) in metadata
            transaction = PaymentTransaction.objects.create(
                tx_ref=tx_ref,
                amount=amount,
                email=request.user.email,
                first_name=request.user.first_name or "Customer",
                last_name=request.user.last_name or "",
                phone_number=request.user.phone_number,
                user=request.user,
                metadata={
                    "delivery_option": request.data.get("delivery_option", "pickup"),
                    "delivery_address": request.data.get("delivery_address"),
                    "delivery_time": request.data.get("delivery_time"),
                    "pickup_time": request.data.get("pickup_time")
                }
            )

            payload = {
                "amount": str(amount),
                "currency": "ETB",
                "email": transaction.email,
                "first_name": transaction.first_name,
                "last_name": transaction.last_name,
                "phone_number": transaction.phone_number,
                "tx_ref": tx_ref,
                "callback_url": callback_url,
                "return_url": return_url,
            }

            headers = {
                "Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}",
                "Content-Type": "application/json"
            }

            response = requests.post(settings.CHAPA_API_URL, json=payload, headers=headers)
            data = response.json()

            if response.status_code != 200 or data.get("status") != "success":
                logger.error(f"Failed to initiate payment: {data}")
                return Response({"error": "Failed to initiate payment", "details": data}, status=400)

            return Response({
                "checkout_url": data['data']['checkout_url']
            })

        except Exception as e:
            logger.error(f"Payment initiation error: {e}")
            return Response({"error": str(e)}, status=500)

# webhook for chapa payments
@csrf_exempt
def payment_webhook(request):
    from django.views.decorators.http import require_http_methods
    with transaction.atomic():
        tx_ref = request.GET.get('tx_ref') or request.POST.get('tx_ref')
        status_param = request.GET.get('status') or request.POST.get('status')

        if not tx_ref:
            logger.error("Webhook error: Missing tx_ref")
            return JsonResponse({"error": "Missing tx_ref"}, status=400)

        try:
            transaction_obj = PaymentTransaction.objects.select_for_update().get(tx_ref=tx_ref)

            # If already processed
            if transaction_obj.status == "success":
                return JsonResponse({"status": "already processed"}, status=200)

            # VERIFY payment with Chapa
            verify_url = f"https://api.chapa.co/v1/transaction/verify/{tx_ref}"
            headers = {
                "Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}"
            }
            verify_response = requests.get(verify_url, headers=headers).json()

            if verify_response.get("status") != "success":
                transaction_obj.status = "failed"
                transaction_obj.save(update_fields=["status"])
                logger.error(f"Payment verification failed: {verify_response}")
                return JsonResponse({"error": "Payment verification failed", "details": verify_response}, status=400)

            # CREATE order now (payment is verified)
            user = transaction_obj.user
            cart_items = CartItems.objects.filter(user=user, ordered=False)

            if not cart_items.exists():
                logger.error("Webhook error: Cart is empty at order creation")
                return JsonResponse({"error": "Cart is empty at order creation"}, status=400)

            meta = transaction_obj.metadata
            order = create_order_from_cart(user, meta, transaction_obj.amount, status='paid')

            # Update transaction
            transaction_obj.status = 'success'
            transaction_obj.order = order
            transaction_obj.save()

            # Return JSON response for all requests (API-first approach)
            return JsonResponse({
                "status": "success", 
                "order_id": order.id,
                "tx_ref": tx_ref,
                "redirect_url": f"{settings.WEB_APP_URL}/payment-success?tx_ref={tx_ref}&status=success"
            })

        except PaymentTransaction.DoesNotExist:
            logger.error(f"Webhook error: Transaction not found for tx_ref {tx_ref}")
            return JsonResponse({"error": "Transaction not found"}, status=404)
        except Exception as e:
            logger.error(f"Webhook error: {e}")
            return JsonResponse({"error": str(e)}, status=500)

def payment_success(request):
    """Handle payment success - return JSON for React frontend"""
    tx_ref = request.GET.get('tx_ref')
    status = request.GET.get('status')
    
    return JsonResponse({
        'status': 'success',
        'tx_ref': tx_ref,
        'message': 'Payment completed successfully',
        'redirect_url': f"{settings.WEB_APP_URL}/payment-success?tx_ref={tx_ref}&status=success"
    })

def payment_failure(request):
    """Handle payment failure - return JSON for React frontend"""
    tx_ref = request.GET.get('tx_ref')
    error = request.GET.get('error', 'Payment failed')
    
    return JsonResponse({
        'status': 'failed',
        'tx_ref': tx_ref,
        'error': error,
        'redirect_url': f"{settings.WEB_APP_URL}/payment-failure?tx_ref={tx_ref}&error={error}"
    })
