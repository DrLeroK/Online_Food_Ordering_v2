from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count, Prefetch
from django.db import transaction
from django.db.models.functions import TruncDay
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAdminUser

from rest_framework.pagination import PageNumberPagination


from .models import Item, CartItems, Reviews, Order

from .serializers import (
    ItemSerializer, 
    ReviewSerializer,
    CartItemSerializer,
    OrderSerializer
)



# Item Views
class ItemListCreateView(generics.ListCreateAPIView):
    """List all items or create new item (admin only)"""
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    pagination_class = PageNumberPagination
    page_size = 20


    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an item (admin owner only)"""
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    # def get_permissions(self):
    #     if self.request.method in ['PUT', 'PATCH', 'DELETE']:
    #         return [permissions.IsAdminUser()]
    #     return [permissions.AllowAny()]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]  # Allow anyone to view
        return [permissions.IsAdminUser()] 

    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


# Review Views
class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Reviews.objects.filter(item__slug=self.kwargs['slug'])

    def perform_create(self, serializer):
        item = get_object_or_404(Item, slug=self.kwargs['slug'])
        serializer.save(
            user=self.request.user,
            item=item,
            rslug=self.kwargs['slug'],
            review=self.request.data.get('review')
        )


# Cart Views
class CartListView(generics.ListCreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItems.objects.filter(
            user=self.request.user, 
            ordered=False
        ).select_related('item')

    def create(self, request, *args, **kwargs):
        item = get_object_or_404(Item, slug=kwargs.get('slug'))
        
        cart_item, created = CartItems.objects.get_or_create(
            item=item,
            user=request.user,
            ordered=False,
            defaults={'quantity': 1}
        )
        
        if not created:
            cart_item.quantity += 1
            cart_item.save()
        
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CartDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItems.objects.filter(user=self.request.user, ordered=False)

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class ClearCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        CartItems.objects.filter(user=request.user, ordered=False).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class RemoveFromCartView(generics.DestroyAPIView):
    """Remove specific item from cart (completely, not just decrease quantity)"""
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CartItems.objects.filter(
            user=self.request.user,
            ordered=False
        )
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        item_title = instance.item.title
        self.perform_destroy(instance)
        return Response(
            {"detail": f"Removed {item_title} from cart"},
            status=status.HTTP_200_OK
        )
    


class OrderCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        try:
            with transaction.atomic():
                # Lock the cart items to prevent concurrent modifications
                cart_items = CartItems.objects.select_for_update().filter(
                    user=request.user,
                    ordered=False
                )
                
                if not cart_items.exists():
                    return Response(
                        {"message": "Your cart is empty"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                delivery_option = request.data.get('delivery_option', 'pickup')
                delivery_time = request.data.get('delivery_time')
                pickup_time = request.data.get('pickup_time')
                delivery_address = request.data.get('delivery_address', '')
                latitude = request.data.get('latitude')
                longitude = request.data.get('longitude')
                pickup_branch = request.data.get('pickup_branch')

                # Set default times if not provided
                now = timezone.now()
                if delivery_option == 'pickup' and not pickup_time:
                    pickup_time = now
                elif delivery_option == 'delivery' and not delivery_time:
                    delivery_time = now

                # Validate delivery option specific requirements
                if delivery_option == 'delivery' and not delivery_address and not (latitude and longitude):
                    return Response(
                        {"message": "Either delivery address or location coordinates are required for delivery"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if delivery_option == 'pickup' and not pickup_branch:
                    return Response(
                        {"message": "Pickup branch is required for pickup orders"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Create order
                order = Order.objects.create(
                    user=request.user,
                    delivery_option=delivery_option,
                    pickup_time=pickup_time,
                    delivery_time=delivery_time,
                    delivery_address=delivery_address if delivery_option == 'delivery' else None,
                    latitude=latitude if delivery_option == 'delivery' else None,
                    longitude=longitude if delivery_option == 'delivery' else None,
                    pickup_branch=pickup_branch if delivery_option == 'pickup' else None,
                    total_price=sum(item.quantity * item.item.price for item in cart_items)
                )

                # Increment user score
                user = request.user
                user.score += 1
                user.save()

                # Update cart items
                cart_items.update(
                    ordered=True,
                    order=order,
                    status='Active'
                )

                serializer = OrderSerializer(order, context={'request': request})
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



# class OrderCreateView(APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     @transaction.atomic
#     def post(self, request):
#         try:
#             with transaction.atomic():
#                 # Lock the cart items to prevent concurrent modifications
#                 cart_items = CartItems.objects.select_for_update().filter(
#                     user=request.user,
#                     ordered=False
#                 )
                
#                 if not cart_items.exists():
#                     return Response(
#                         {"message": "Your cart is empty"},
#                         status=status.HTTP_400_BAD_REQUEST
#                     )

#                 delivery_option = request.data.get('delivery_option', 'pickup')
#                 delivery_time = request.data.get('delivery_time')
#                 pickup_time = request.data.get('pickup_time')
#                 delivery_address = request.data.get('delivery_address', '')

#                 # Set default times if not provided
#                 now = timezone.now()
#                 if delivery_option == 'pickup' and not pickup_time:
#                     pickup_time = now
#                 elif delivery_option == 'delivery' and not delivery_time:
#                     delivery_time = now

#                 # Create order
#                 order = Order.objects.create(
#                     user=request.user,
#                     delivery_option=delivery_option,
#                     pickup_time=pickup_time,
#                     delivery_time=delivery_time,
#                     delivery_address=delivery_address if delivery_option == 'delivery' else None,
#                     total_price=sum(item.quantity * item.item.price for item in cart_items)
#                 )

#                 # Increment user score
#                 user = request.user
#                 user.score += 1
#                 user.save()

#                 # Update cart items
#                 cart_items.update(
#                     ordered=True,
#                     order=order,
#                     status='Active'
#                 )

#                 serializer = OrderSerializer(order)
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             return Response(
#                 {"error": "Failed to process order. Please try again."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def get_serializer_context(self):
#         context = super().get_serializer_context()
#         context['request'] = self.request
#         return context



class OrderHistoryView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)\
            .prefetch_related('cartitems_set', 'cartitems_set__item')\
            .order_by('-created_at') 


# Admin Views
# =============================================================

class AdminOrderViewSet(viewsets.ModelViewSet):
    """
    Complete admin order management system with:
    - Order listing/filtering
    - Status updates
    - Cancellations
    - Analytics dashboard
    """
    serializer_class = OrderSerializer
    authentication_classes = [JWTAuthentication]  # Explicitly set JWT auth
    permission_classes = [IsAdminUser]  # Requires both authentication AND staff status
    # queryset = Order.objects.all().order_by('-created_at')
    queryset = Order.objects.all().prefetch_related(
        Prefetch('cartitems_set', queryset=CartItems.objects.select_related('item'))
    ).order_by('-created_at')
    

    # Override get_queryset to allow filtering by date and status
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Date filtering
        if 'start_date' in self.request.query_params:
            queryset = queryset.filter(
                created_at__date__gte=self.request.query_params['start_date']
            )
        if 'end_date' in self.request.query_params:
            queryset = queryset.filter(
                created_at__date__lte=self.request.query_params['end_date']
            )
            
        # Status filtering
        if 'status' in self.request.query_params:
            queryset = queryset.filter(
                status=self.request.query_params['status']
            )
            
        return queryset


    # cancel order action
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Admin-specific order cancellation"""
        order = self.get_object()
        
        # Validate cancel reason if required
        cancel_reason = request.data.get('cancel_reason', '')
        if not cancel_reason:
            return Response(
                {"error": "Cancel reason is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update order status and cancellation details
        order.status = 'Cancelled'
        order.cancel_reason = cancel_reason
        order.cancelled_at = timezone.now()
        order.save()
        
        # Return full order details
        serializer = self.get_serializer(order)
        return Response({
            'status': 'Order cancelled',
            'order': serializer.data
        }, status=status.HTTP_200_OK)


    # Update order status action
    @action(detail=True, methods=['post', 'patch'])
    @transaction.atomic
    def update_status(self, request, pk=None):
        """
        Thread-safe order status update endpoint.
        Prevents race conditions with select_for_update() and atomic transactions.
        """
        try:
            # Lock the order row in the database until the transaction completes
            with transaction.atomic():
                order = Order.objects.select_for_update().get(pk=pk)
                
                # Validate status
                if 'status' not in request.data:
                    return Response(
                        {"error": "Status field is required"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                valid_statuses = dict(Order.STATUS_CHOICES).keys()
                if request.data['status'] not in valid_statuses:
                    return Response(
                        {"error": f"Invalid status. Valid choices: {list(valid_statuses)}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Handle status-specific logic
                new_status = request.data['status']
                if new_status == 'Cancelled':
                    order.cancelled_at = timezone.now()
                    order.cancel_reason = request.data.get('cancel_reason', '')
                elif new_status == 'Delivered':
                    order.delivery_date = timezone.now()

                # Update status and save
                order.status = new_status
                order.save()

                # Return updated order
                serializer = self.get_serializer(order)
                return Response(serializer.data)

        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    

    # Get popular items action
    @action(detail=False, methods=['get'])
    def popular_items(self, request):
        """Get top selling items"""
        top_items = CartItems.objects.filter(
            ordered=True
        ).values('item__title', 'item__id', 'item__price') \
        .annotate(count=Count('item')) \
        .order_by('-count')[:10]
        
        return Response(top_items)

    # dashboard action
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Admin dashboard analytics"""
        print("Current user:", request.user)  # Debug user
        print("Is staff:", request.user.is_staff)  # Debug staff status
        print("Total orders:", self.queryset.count())  # Debug order count
        today = timezone.now().date()
        last_week = today - timedelta(days=7)
        
        stats = {
            'total_orders': self.queryset.count(),

            'recent_orders': self.queryset.filter(
                created_at__date__gte=last_week
            ).count(),

            'total_revenue': self.queryset.aggregate(
                Sum('total_price')
            )['total_price__sum'] or 0,

            'status_distribution': self.queryset.values('status')
                .annotate(count=Count('status'))
                .order_by('-count'),

            'popular_items': CartItems.objects.filter(
                ordered=True
            ).values('item__title')
                .annotate(count=Count('item'))
                .order_by('-count')[:5]
        }
        return Response(stats)
    


    # In your AdminOrderViewSet

    @action(detail=False, methods=['get'])
    def sales_analytics(self, request):
        """Returns weekly/monthly sales analytics"""
        time_range = request.query_params.get('range', 'weekly')
        
        if time_range == 'weekly':
            # Get data for last 7 days
            date_from = timezone.now() - timedelta(days=7)
            orders = Order.objects.filter(created_at__gte=date_from)
            
            # Group by day
            data = orders.annotate(
                day=TruncDay('created_at')
            ).values('day').annotate(
                order_count=Count('id'),
                total_revenue=Sum('total_price')
            ).order_by('day')
            
            # Format response
            result = {
                'labels': [entry['day'].strftime('%a') for entry in data],
                'orders': [entry['order_count'] for entry in data],
                'revenue': [float(entry['total_revenue'] or 0) for entry in data]
            }
        else:
            # Monthly data
            date_from = timezone.now() - timedelta(days=30)
            orders = Order.objects.filter(created_at__gte=date_from)
            
            # Group by day
            data = orders.annotate(
                day=TruncDay('created_at')
            ).values('day').annotate(
                order_count=Count('id'),
                total_revenue=Sum('total_price')
            ).order_by('day')
            
            # Format response
            result = {
                'labels': [entry['day'].strftime('%b %d') for entry in data],
                'orders': [entry['order_count'] for entry in data],
                'revenue': [float(entry['total_revenue'] or 0) for entry in data]
            }
        
        return Response(result)
