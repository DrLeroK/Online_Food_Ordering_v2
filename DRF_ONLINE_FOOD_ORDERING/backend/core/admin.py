from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import Item, Reviews, CartItems

class ItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'price', 'display_image', 'created_by', 'status_indicator')
    list_filter = ('category', 'labels', 'created_by')
    search_fields = ('title', 'description')
    readonly_fields = ('slug', 'created_by')
    list_per_page = 25
    actions = ['mark_as_bestseller', 'mark_as_new']

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'category', 'size', 'price')
        }),
        ('Media & Presentation', {
            'fields': ('image', 'labels', 'label_colour')
        }),
        ('System Information', {
            'fields': ('slug', 'created_by'),
            'classes': ('collapse',)
        }),
    )

    def display_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" />', obj.image.url)
        return "-"
    display_image.short_description = 'Image Preview'

    def status_indicator(self, obj):
        if obj.labels == 'bestseller':
            return format_html('<span style="color: red;">★ Bestseller</span>')
        elif obj.labels == 'new':
            return format_html('<span style="color: green;">🆕 New</span>')
        return "-"
    status_indicator.short_description = 'Status'

    def save_model(self, request, obj, form, change):
        if not obj.pk:  # Only set created_by if this is a new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def mark_as_bestseller(self, request, queryset):
        updated = queryset.update(labels='bestseller', label_colour='danger')
        self.message_user(request, f'{updated} items marked as bestseller')
    mark_as_bestseller.short_description = "Mark selected as bestseller"

    def mark_as_new(self, request, queryset):
        updated = queryset.update(labels='new', label_colour='success')
        self.message_user(request, f'{updated} items marked as new')
    mark_as_new.short_description = "Mark selected as new"

class ReviewsAdmin(admin.ModelAdmin):
    list_display = ('truncated_review', 'user', 'item_link', 'posted_on')
    list_filter = ('posted_on', 'item')
    search_fields = ('review', 'user__username', 'item__title')
    readonly_fields = ('rslug', 'posted_on')
    date_hierarchy = 'posted_on'

    def truncated_review(self, obj):
        return obj.review[:50] + '...' if len(obj.review) > 50 else obj.review
    truncated_review.short_description = 'Review'

    def item_link(self, obj):
        if obj.item:
            url = reverse("admin:core_item_change", args=[obj.item.id])
            return format_html('<a href="{}">{}</a>', url, obj.item.title)
        return "-"
    item_link.short_description = 'Item'

class CartItemsAdmin(admin.ModelAdmin):
    list_display = ('user', 'item', 'quantity', 'total_price', 'status_badge', 'delivery_date')
    list_filter = ('status', 'ordered', 'delivery_date')
    search_fields = ('user__username', 'item__title')
    readonly_fields = ('ordered_date',)
    # list_editable = ('status', 'quantity')
    actions = ['mark_as_delivered']

    fieldsets = (
        ('Order Information', {
            'fields': ('user', 'item', 'quantity')
        }),
        ('Status & Delivery', {
            'fields': ('status', 'ordered', 'delivery_date')
        }),
        ('System Information', {
            'fields': ('ordered_date',),
            'classes': ('collapse',)
        }),
    )

    def total_price(self, obj):
        return f"${obj.quantity * obj.item.price:.2f}"
    total_price.short_description = 'Total'

    def status_badge(self, obj):
        color = 'green' if obj.status == 'Delivered' else 'orange'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 10px;">{}</span>',
            color, obj.status
        )
    status_badge.short_description = 'Status'

    def mark_as_delivered(self, request, queryset):
        updated = queryset.update(status='Delivered', delivery_date=timezone.now().date())
        self.message_user(request, f'{updated} orders marked as delivered')
    mark_as_delivered.short_description = "Mark selected as delivered"

admin.site.register(Item, ItemAdmin)
admin.site.register(Reviews, ReviewsAdmin)
admin.site.register(CartItems, CartItemsAdmin)