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

            # Determine return URL based on platform
            user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
            is_mobile_app = 'flutter' in user_agent or 'mobile' in user_agent
            
            if is_mobile_app:
                return_url = f"{settings.MOBILE_APP_DEEP_LINK}?status=success&tx_ref={tx_ref}"
            else:
                return_url = f"{settings.WEB_APP_URL}/payment-success?status=success&tx_ref={tx_ref}"

            # Check if Chapa API key is available
            if not settings.CHAPA_SECRET_KEY:
                # For testing purposes, return a mock checkout URL
                print("Warning: CHAPA_SECRET_KEY not set. Using mock payment for testing.")
                
                # Save transaction to DB for testing
                PaymentTransaction.objects.create(
                    tx_ref=tx_ref,
                    amount=amount,
                    email=request.user.email,
                    first_name=request.user.first_name if request.user.first_name else "Customer",
                    last_name=request.user.last_name if request.user.last_name else "",
                    phone_number=request.user.phone_number,
                    user=request.user
                )
                
                # Return a mock checkout URL that redirects to the deep link
                mock_checkout_url = f"http://localhost:8000/payments/webhook/?trx_ref={tx_ref}&status=success"
                return Response({
                    "checkout_url": mock_checkout_url
                })

            # Prepare payload for Chapa API
            payload = {
                "amount": amount,
                "currency": "ETB",
                "email": request.user.email,
                "first_name": request.user.first_name if request.user.first_name else "Customer",
                "last_name": request.user.last_name if request.user.last_name else "",
                "tx_ref": tx_ref,
                "callback_url": settings.CHAPA_WEBHOOK_URL,
                "return_url": return_url,
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
    if request.method in ['POST', 'GET']:
        # Get transaction reference from callback
        tx_ref = request.GET.get('trx_ref') or request.POST.get('tx_ref')
        status = request.GET.get('status') or request.POST.get('status')
        
        if not tx_ref:
            return HttpResponse(status=400)
        
        try:
            # For mock payments, just update the transaction status
            if status == 'success':
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
                
                # For GET requests (mock payments), redirect to success page
                if request.method == 'GET':
                    return redirect(f'/payments/success/?status=success&tx_ref={tx_ref}')
                
                return HttpResponse(status=200)
            else:
                # For failed payments
                if request.method == 'GET':
                    return redirect(f'/payments/failure/?status=failed&tx_ref={tx_ref}')
                return HttpResponse(status=400)

        except PaymentTransaction.DoesNotExist:
            print(f"Transaction not found: {tx_ref}")
            if request.method == 'GET':
                return redirect(f'/payments/failure/?error=Transaction not found&tx_ref={tx_ref}')
            return HttpResponse(status=404)
        except Exception as e:
            print(f"Webhook error: {e}")
            if request.method == 'GET':
                return redirect(f'/payments/failure/?error=Webhook error&tx_ref={tx_ref}')
            return HttpResponse(status=500)

    return HttpResponse(status=405)

def payment_success(request):
    """Payment success page for web users"""
    tx_ref = request.GET.get('tx_ref')
    status = request.GET.get('status', 'success')
    
    context = {
        'status': status,
        'tx_ref': tx_ref,
    }
    
    return render(request, 'payments/payment_success.html', context)

def payment_failure(request):
    """Payment failure page for web users"""
    tx_ref = request.GET.get('tx_ref')
    error = request.GET.get('error', 'Payment failed')
    
    context = {
        'status': 'failed',
        'tx_ref': tx_ref,
        'error': error,
    }
    
    return render(request, 'payments/payment_success.html', context)