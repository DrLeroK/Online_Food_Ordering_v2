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
            # Get cart items
            cart_items = CartItems.objects.filter(user=request.user)
            if not cart_items.exists():
                return Response(
                    {"error": "Cart is empty"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create order
            order = Order.objects.create(
                user=request.user,
                delivery_option=request.data.get('delivery_option', 'pickup'),
                delivery_address=request.data.get('delivery_address'),
                delivery_time=request.data.get('delivery_time'),
                pickup_time=request.data.get('pickup_time'),
                total_price=sum(item.item.price * item.quantity for item in cart_items),
                status='pending'
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
            amount = request.data.get('amount')
            if not amount:
                return Response(
                    {"error": "Amount is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Generate a unique transaction reference
            tx_ref = f"chapa-tx-{uuid.uuid4().hex}"

            # Prepare payload for Chapa API
            payload = {
                "amount": amount,
                "currency": "ETB",
                "email": request.user.email,
                "first_name": request.user.first_name if request.user.first_name else "Customer",
                "last_name": request.user.last_name if request.user.last_name else "",
                "tx_ref": tx_ref,
                "callback_url": settings.CHAPA_WEBHOOK_URL,
                "return_url": settings.CHAPA_RETURN_URL,
            }

            if request.user.phone_number:
                payload["phone_number"] = request.user.phone_number

            # Headers with API key
            headers = {
                "Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}",
                "Content-Type": "application/json",
            }

            # Initialize payment with Chapa API
            response = requests.post(settings.CHAPA_API_URL, json=payload, headers=headers)
            response_data = response.json()

            if response.status_code == 200 and response_data['status'] == 'success':
                # Save transaction to DB
                PaymentTransaction.objects.create(
                    tx_ref=tx_ref,
                    amount=amount,
                    email=request.user.email,
                    first_name=payload['first_name'],
                    last_name=payload['last_name'],
                    phone_number=request.user.phone_number,
                    user=request.user
                )
                
                return Response({
                    "checkout_url": response_data['data']['checkout_url']
                })
            else:
                return Response(
                    {"error": "Payment initiation failed"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@csrf_exempt
def payment_webhook(request):
    if request.method == 'POST':
        # Get transaction reference from callback
        tx_ref = request.POST.get('tx_ref')
        
        try:
            # Verify transaction with Chapa
            verify_url = f"{settings.CHAPA_VERIFY_URL}{tx_ref}"
            headers = {"Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}"}
            
            response = requests.get(verify_url, headers=headers)
            response_data = response.json()

            if response.status_code == 200 and response_data['status'] == 'success':
                # Update transaction status in DB
                transaction = PaymentTransaction.objects.get(tx_ref=tx_ref)
                transaction.status = "success"
                transaction.save()

                # Update order status if exists
                orders = Order.objects.filter(
                    user=transaction.user,
                    status='pending',
                    created_at__gte=timezone.now() - timezone.timedelta(hours=1)
                ).order_by('-created_at')

                if orders.exists():
                    order = orders.first()
                    order.status = 'paid'
                    order.save()
                
                return HttpResponse(status=200)
            else:
                return HttpResponse(status=400)

        except Exception as e:
            return HttpResponse(status=500)

    return HttpResponse(status=405)

def payment_success(request):
    return render(request, 'payments/payment_success.html')