from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ItemListCreateView, ItemDetailView,
    ReviewListCreateView, CartListView, 
    CartDetailView, ClearCartView, 
    RemoveFromCartView, OrderCreateView, 
    OrderHistoryView, AdminOrderViewSet
)

app_name = 'core'


router = DefaultRouter()
router.register(r'api/admin/orders', AdminOrderViewSet, basename='admin-orders')


urlpatterns = [
    # Menu Items Endpoints
    path('menu/items/', ItemListCreateView.as_view(), name='items-list'),
    path('menu/items/<slug:slug>/', ItemDetailView.as_view(), name='items-detail'),
    

    # Review Endpoints
    path('menu/items/<slug:slug>/reviews/', ReviewListCreateView.as_view(), name='review-list'),

    # Cart Endpoints
    path('cart/items/add/<slug:slug>/', CartListView.as_view(), name='add-to-cart'),
    path('cart/', CartListView.as_view(), name='cart-list'),
    path('cart/clear/', ClearCartView.as_view(), name='cart-clear'),
    path('cart/items/<int:pk>/', CartDetailView.as_view(), name='cart-detail'),
    path('cart/items/<int:pk>/remove/', RemoveFromCartView.as_view(), name='remove-from-cart'),
    

    # Order Endpoints
    path('orders/', OrderCreateView.as_view(), name='order-create'),
    path('orders/history/', OrderHistoryView.as_view(), name='order-history'),

    # Admin Endpoints
    # ======================================================================================
    path('api/admin/dashboard/', AdminOrderViewSet.as_view({'get': 'dashboard'}), 
         name='admin-dashboard'),
    path('api/admin/popular-items/', AdminOrderViewSet.as_view({'get': 'popular_items'}),
         name='admin-popular-items'),

    path('api/admin/sales-analytics/', AdminOrderViewSet.as_view({'get': 'sales_analytics'}), 
         name='admin-sales-analytics'),

    
] + router.urls
