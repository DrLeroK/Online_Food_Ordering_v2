import uuid
from django.db import models
from django.shortcuts import reverse
from django.utils import timezone
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator


User = get_user_model()


# a model for the menu items
class Item(models.Model):

    LABELS = (
        ('bestseller', 'BestSeller'),
        ('new', 'New'),
        ('spicy🔥', 'Spicy🔥'),
    )   

    LABEL_COLOUR = (
        ('danger', 'danger'),
        ('success', 'success'),
        ('primary', 'primary'),
        ('info', 'info')
    )

    CATEGORIES = (
    ('burger', 'Burger'),
    ('side', 'Side'),
    ('drink', 'Drink'),
    ('dessert', 'Dessert'),
    ('pizza', 'Pizza'),
    ('salad', 'Salad'),
    ('sandwich', 'Sandwich'),
    ('pasta', 'Pasta'),
    )
    
    SIZES = (
        ('s', 'Small'),
        ('m', 'Medium'),
        ('l', 'Large'),
    )

    title = models.CharField(max_length=150)
    description = models.CharField(max_length=250, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORIES, default='Burger')
    size = models.CharField(max_length=1, choices=SIZES, blank=True, null=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='images/', 
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])],
        help_text="Upload images in JPG/PNG/WEBP format")
    labels = models.CharField(max_length=25, choices=LABELS, blank=True)
    label_colour = models.CharField(max_length=15, choices=LABEL_COLOUR, blank=True)
    slug = models.SlugField(unique=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)


    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            unique_suffix = uuid.uuid4().hex[:6]  # ensures uniqueness
            self.slug = slugify(f"{self.title}-{unique_suffix}")
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("core:items-detail", kwargs={
            'slug': self.slug
        })


# a model for the reviews
class Reviews(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True)
    rslug = models.SlugField()
    review = models.TextField()
    posted_on = models.DateTimeField(default=timezone.now)  # Change from DateField to DateTimeField

    class Meta:
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'

    def __str__(self):
        return self.review


# a model for the orders
class Order(models.Model):

    DELIVERY_CHOICES = [
        ('pickup', 'Pickup'),
        ('delivery', 'Delivery'),
    ]

    BRANCH_CHOICES = [
        ('atlas1', 'Atlas Burger 1 - Main Branch'),
        ('atlas2', 'Atlas Burger 2 - Downtown'),
    ]
    
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    delivery_option = models.CharField(max_length=20, choices=DELIVERY_CHOICES, default='pickup')
    pickup_time = models.DateTimeField(null=True, blank=True, default=timezone.now)
    # Added a field for pickup branch
    pickup_branch = models.CharField(max_length=20, choices=BRANCH_CHOICES, blank=True, null=True)
    delivery_time = models.DateTimeField(null=True, blank=True, default=timezone.now)
    delivery_address = models.TextField(null=True, blank=True)

    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active', null=False, blank=False)
    cancelled_at = models.DateTimeField(null=True, blank=True)  # Add this field
    admin_notes = models.TextField(blank=True, default='')  # Add this field
    cancel_reason = models.TextField(blank=True, default='')  # Add this field
    delivery_date = models.DateTimeField(null=True, blank=True, default=timezone.now)  # Add this field

    def __str__(self):
        return f"Order #{self.id} - {self.get_delivery_option_display()}"
    
    def clean(self):
        if not self.status:
            raise ValidationError({'status': 'Status is required'})
        
        if self.delivery_option == 'delivery' and not (self.delivery_address or (self.latitude and self.longitude)):
                raise ValidationError({
                    'delivery_address': 'Either delivery address or location coordinates are required for delivery'
                })


# a model for the cart items
class CartItems(models.Model):
    ORDER_STATUS = (
        ('Active', 'Active'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True)
    ordered = models.BooleanField(default=False)
    quantity = models.IntegerField(default=1)
    ordered_date = models.DateTimeField(default=timezone.now)  # Changed to DateTimeField
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='Active', null=False, blank=False)
    delivery_date = models.DateTimeField(default=timezone.now)  # Changed to DateTimeField
    # ForeignKey to Order model
    order = models.ForeignKey(Order, on_delete=models.CASCADE, 
        related_name='cartitems_set',
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = 'Cart Item'
        verbose_name_plural = 'Cart Items'

    def __str__(self):
        return f"{self.quantity} x {self.item.title}"
    
    
    # Add this property to calculate total price at model level
    # @property decorator, which allows you to use the method like an attribute, it's read only
    @property
    def total_price(self):
        return self.quantity * self.item.price

