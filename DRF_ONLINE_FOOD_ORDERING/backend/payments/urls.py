from django.urls import path
from .views import (
    PaymentInitiateView, 
    payment_webhook, 
    payment_success,
    payment_failure
)

urlpatterns = [
    path('initiate/', PaymentInitiateView.as_view(), name='payment-initiate'),
    path('webhook/', payment_webhook, name='payment-webhook'),
    path('success/', payment_success, name='payment-success'),
    path('failure/', payment_failure, name='payment-failure'),
] 