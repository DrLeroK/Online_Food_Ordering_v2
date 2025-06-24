from rest_framework import serializers
from .models import Item, Reviews, CartItems, Order
from django.contrib.auth import get_user_model
from django.utils import timezone


#  Serializers for our models
User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'score']
        ref_name = 'CoreUser'


class ItemSerializer(serializers.ModelSerializer):
    absolute_url = serializers.SerializerMethodField()
    created_by = UserSerializer(read_only=True)
    price = serializers.DecimalField(max_digits=6, decimal_places=2, coerce_to_string=False)
    # `coerce_to_string=False`: Keep it as a **numeric value** in JSON instead of string (`19.99` not `"19.99"`)
    image = serializers.ImageField(required=False)
    
    class Meta:
        model = Item
        fields = [
            'id', 'title', 'description', 'category', 'size', 
            'price', 'image', 'labels', 'label_colour', 'slug',
            'created_by', 'absolute_url'
        ]
        read_only_fields = ['slug', 'created_by']
    
    def get_absolute_url(self, obj):
        return obj.get_absolute_url()
    
    # Added now
    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    item = serializers.PrimaryKeyRelatedField(read_only=True)
    posted_on = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    
    class Meta:
        model = Reviews
        fields = ['id', 'user', 'item', 'rslug', 'review', 'posted_on']
        read_only_fields = ['rslug', 'posted_on', 'user', 'item']


class CartItemSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    item = ItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(),
        source='item',
        write_only=True
    )
    # - Allows **clients to submit an `item_id`** when creating/updating a cart item.
    # - This field is:
    # - **Write-only** → it will NOT appear in the API response.
    # - **Mapped to the `item` field** in the model via `source='item'`.

    total_price = serializers.SerializerMethodField()
    ordered_date = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    delivery_date = serializers.DateTimeField(format="%Y-%m-%d %H:%M", required=False)
    
    class Meta:
        model = CartItems
        fields = [
            'id', 'user', 'item', 'item_id', 'ordered', 
            'quantity', 'ordered_date', 'status', 
            'delivery_date', 'total_price'
        ]
        read_only_fields = ['user', 'ordered_date']
    
    def get_total_price(self, obj):
        return obj.quantity * obj.item.price
    
    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1")
        return value
    
    # JSON OUTPUT

    #     {
    # "id": 12,
    # "user": {
    #     "id": 1,
    #     "username": "latera"
    # },
    # "item": {
    #     "id": 3,
    #     "title": "Pizza",
    #     "price": "9.99",
    #     ...
    # },
    # "ordered": false,
    # "quantity": 2,
    # "ordered_date": "2025-05-25 15:32",
    # "status": "Active",
    # "delivery_date": "2025-05-27 18:00",
    # "total_price": 19.98
    # }


class CartStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItems
        fields = ['status', 'delivery_date']


class OrderItemSerializer(serializers.ModelSerializer):
    item = serializers.SerializerMethodField()
    item_id = serializers.SerializerMethodField()
    item_title = serializers.SerializerMethodField()
    item_price = serializers.SerializerMethodField()
    item_image = serializers.SerializerMethodField()

    class Meta:
        model = CartItems
        fields = [
            'id', 'item', 'item_id', 'item_title', 'item_price',
            'quantity', 'status', 'item_image'
        ]

    def get_item(self, obj):
        if obj.item:
            return {
                'id': obj.item.id,
                'title': obj.item.title,
                'price': str(obj.item.price),
            }
        return {
            'id': None,
            'title': '[Deleted Item]',
            'price': '0.00'
        }

    def get_item_id(self, obj):
        return obj.item.id if obj.item else None

    def get_item_title(self, obj):
        return obj.item.title if obj.item else '[Deleted Item]'

    def get_item_price(self, obj):
        return str(obj.item.price) if obj.item else '0.00'

    def get_item_image(self, obj):
        if not obj.item or not obj.item.image:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.item.image.url)
        return obj.item.image.url



# In your core/serializers.py

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, source='cartitems_set')
    customer = UserSerializer(source='user', read_only=True)
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    delivery_option_display = serializers.CharField(
        source='get_delivery_option_display', 
        read_only=True
    )
    pickup_branch_display = serializers.CharField(
        source='get_pickup_branch_display',
        read_only=True
    )

    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    cancelled_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    delivery_date = serializers.DateTimeField(format="%Y-%m-%d %H:%M", required=False)
    pickup_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M", required=False)
    delivery_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M", required=False)
    
    admin_notes = serializers.CharField(write_only=True, required=False, allow_blank=True)
    cancel_reason = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'created_at', 'status',
            'total_price', 'delivery_option', 'delivery_option_display',
            'pickup_branch', 'pickup_branch_display', 'delivery_address',
            'latitude', 'longitude', 'items', 'delivery_date', 'cancelled_at',
            'pickup_time', 'delivery_time', 'admin_notes', 'cancel_reason'
        ]
        read_only_fields = [
            'created_at', 'cancelled_at', 'total_price',
            'delivery_date', 'customer'
        ]
        extra_kwargs = {
            'admin_notes': {'write_only': True},
            'cancel_reason': {'write_only': True},
            'status': {'required': True}
        }
    
    def validate(self, data):
        if 'status' not in data:
            raise serializers.ValidationError({"status": "This field is required"})
        
        delivery_option = data.get('delivery_option', self.instance.delivery_option if self.instance else None)
        
        if delivery_option == 'delivery':
            if not (data.get('delivery_address') or (data.get('latitude') and data.get('longitude'))):
                raise serializers.ValidationError({
                    'delivery_address': 'Either address or location coordinates are required for delivery'
                })
            if not data.get('delivery_time'):
                raise serializers.ValidationError({
                    'delivery_time': 'Delivery time is required for delivery orders'
                })
                
        if delivery_option == 'pickup':
            if not data.get('pickup_branch'):
                raise serializers.ValidationError({
                    'pickup_branch': 'Pickup branch is required for pickup orders'
                })
            if not data.get('pickup_time'):
                raise serializers.ValidationError({
                    'pickup_time': 'Pickup time is required for pickup orders'
                })
    
        return data

# class OrderSerializer(serializers.ModelSerializer):
#     items = OrderItemSerializer(many=True, source='cartitems_set')
#     customer = UserSerializer(source='user', read_only=True)
#     status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
#     delivery_option_display = serializers.CharField(
#         source='get_delivery_option_display', 
#         read_only=True
#     )

#     created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
#     cancelled_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
#     delivery_date = serializers.DateTimeField(format="%Y-%m-%d %H:%M", required=False)
#     pickup_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M", required=False)
#     delivery_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M", required=False)
    
#     # Admin-only fields
#     admin_notes = serializers.CharField(
#         write_only=True, 
#         required=False,
#         allow_blank=True
#     )
#     cancel_reason = serializers.CharField(
#         write_only=True, 
#         required=False,
#         allow_blank=True
#     )

#     pickup_branch = serializers.ChoiceField(
#         choices=Order.PICKUP_BRANCHES,
#         required=False,
#         allow_null=True
#     )
#     latitude = serializers.DecimalField(
#         max_digits=9, 
#         decimal_places=6, 
#         required=False, 
#         allow_null=True
#     )
#     longitude = serializers.DecimalField(
#         max_digits=9, 
#         decimal_places=6, 
#         required=False, 
#         allow_null=True
#     )
#     location_accuracy = serializers.FloatField(
#         required=False, 
#         allow_null=True
#     )

#     class Meta:
#         model = Order
#         fields = [
#             'id', 'customer', 'created_at', 'status',
#             'total_price', 'delivery_option', 'delivery_option_display',
#             'delivery_address', 'items', 'delivery_date', 'cancelled_at',
#             'pickup_time', 'delivery_time', 'admin_notes', 'cancel_reason',
#             'pickup_branch', 'latitude', 'longitude', 'location_accuracy'
#         ]
#         read_only_fields = [
#             'created_at', 'cancelled_at', 'total_price',
#             'delivery_date', 'customer'
#         ]
#         extra_kwargs = {
#             'admin_notes': {'write_only': True},
#             'cancel_reason': {'write_only': True},
#             'status': {'required': True}
#         }
    

#     def validate(self, data):
#         if 'status' not in data:
#             raise serializers.ValidationError({"status": "This field is required"})
        
#         # Add datetime validation
#         if data.get('delivery_option') == 'delivery' and not data.get('delivery_time'):
#             raise serializers.ValidationError({"delivery_time": "Delivery time is required for delivery orders"})
        
#         if data.get('delivery_option') == 'pickup' and not data.get('pickup_time'):
#             raise serializers.ValidationError({"pickup_time": "Pickup time is required for pickup orders"})
    
#         return data

#     def update(self, instance, validated_data):
#         # Handle status changes
#         new_status = validated_data.get('status')
        
#         if new_status == 'Cancelled':
#             instance.cancelled_at = timezone.now()
#             instance.cancel_reason = validated_data.get('cancel_reason', '')
        
#         elif new_status == 'Delivered':
#             instance.delivery_date = timezone.now()
        
#         # Save admin notes if provided
#         if 'admin_notes' in validated_data:
#             instance.admin_notes = validated_data['admin_notes']
        
#         instance.status = new_status
#         instance.save()
#         return instance