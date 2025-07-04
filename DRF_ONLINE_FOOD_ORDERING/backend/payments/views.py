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
from core.models import Order, CartItems
from .models import PaymentTransaction

class PaymentAndOrderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            print(f"DEBUG: Received data: {request.data}")
            print(f"DEBUG: User: {request.user}")
            
            # Get cart items
            cart_items = CartItems.objects.filter(user=request.user)
            print(f"DEBUG: Cart items count: {cart_items.count()}")
            
            if not cart_items.exists():
                return Response(
                    {"error": "Cart is empty"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create order
            delivery_option = request.data.get('delivery_option', 'pickup')
            print(f"DEBUG: Delivery option: {delivery_option}")
            
            try:
                order = Order.objects.create(
                    user=request.user,
                    delivery_option=delivery_option,
                    delivery_address=request.data.get('delivery_address'),
                    delivery_time=request.data.get('delivery_time'),
                    pickup_time=request.data.get('pickup_time'),
                    pickup_branch='atlas1' if delivery_option == 'pickup' else None,  # Set default branch for pickup
                    total_price=sum(item.item.price * item.quantity for item in cart_items),
                    status='pending'
                )
                print(f"DEBUG: Order created successfully with ID: {order.id}")
            except Exception as order_error:
                print(f"DEBUG: Order creation failed: {order_error}")
                return Response(
                    {"error": f"Order creation failed: {str(order_error)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Associate cart items with order
            for cart_item in cart_items:
                cart_item.order = order
                cart_item.save()

            return Response({"order_id": order.id}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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

            # Return & callback URLs
            return_url = f"{settings.WEB_APP_URL}/payment-success?tx_ref={tx_ref}"
            callback_url = f"{settings.DOMAIN_URL}/payments/webhook/"

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
                return Response({"error": "Failed to initiate payment"}, status=400)

            return Response({
                "checkout_url": data['data']['checkout_url']
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)


@csrf_exempt
def payment_webhook(request):
    tx_ref = request.GET.get('tx_ref') or request.POST.get('tx_ref')
    status_param = request.GET.get('status') or request.POST.get('status')

    if not tx_ref:
        return HttpResponse(status=400)

    try:
        transaction = PaymentTransaction.objects.select_for_update().get(tx_ref=tx_ref)

        # If already processed
        if transaction.status == "success":
            return HttpResponse(status=200)

        # VERIFY payment with Chapa
        verify_url = f"https://api.chapa.co/v1/transaction/verify/{tx_ref}"
        headers = {
            "Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}"
        }
        verify_response = requests.get(verify_url, headers=headers).json()

        if verify_response.get("status") != "success":
            transaction.status = "failed"
            transaction.save(update_fields=["status"])
            return HttpResponse(status=400)

        # CREATE order now (payment is verified)
        user = transaction.user
        cart_items = CartItems.objects.filter(user=user, ordered=False)

        if not cart_items.exists():
            return HttpResponse(status=400)

        meta = transaction.metadata
        order = Order.objects.create(
            user=user,
            delivery_option=meta.get('delivery_option', 'pickup'),
            delivery_address=meta.get('delivery_address'),
            delivery_time=meta.get('delivery_time'),
            pickup_time=meta.get('pickup_time'),
            pickup_branch='atlas1' if meta.get('delivery_option') == 'pickup' else None,
            total_price=transaction.amount,
            status='paid'
        )

        for item in cart_items:
            item.order = order
            item.ordered = True
            item.status = 'Processing'
            item.ordered_date = timezone.now()
            item.save()

        # Update transaction
        transaction.status = 'success'
        transaction.order = order
        transaction.save()

        if request.method == 'GET':
            return redirect(f'/payments/success/?status=success&tx_ref={tx_ref}')
        return HttpResponse(status=200)

    except PaymentTransaction.DoesNotExist:
        return HttpResponse(status=404)
    except Exception as e:
        print(f"Webhook error: {e}")
        return HttpResponse(status=500)
