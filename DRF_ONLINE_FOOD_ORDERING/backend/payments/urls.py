from django.urls import path
from .views import (
    PaymentAndOrderCreateView, 
    PaymentInitiateView, 
    payment_webhook, 
    payment_success
)

urlpatterns = [
    path('create-order/', PaymentAndOrderCreateView.as_view(), name='create-order'),
    path('initiate/', PaymentInitiateView.as_view(), name='payment-initiate'),
    path('webhook/', payment_webhook, name='payment-webhook'),
    path('success/', payment_success, name='payment-success'),
] 