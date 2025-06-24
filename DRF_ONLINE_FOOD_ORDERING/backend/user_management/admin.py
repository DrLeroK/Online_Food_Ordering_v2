from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


# Custom User Admin to manage the User model in the Django admin interface
class CustomUserAdmin(UserAdmin):
    # Configuration for list display
    list_display = ('username', 'email', 'phone_number', 'first_name', 'last_name', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('username', 'email', 'phone_number', 'first_name', 'last_name')
    ordering = ('username',)
    filter_horizontal = ('groups', 'user_permissions',)

    # Fieldsets for add/edit forms
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'phone_number')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    # Fieldsets for add form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'phone_number', 'password1', 'password2'),
        }),
    )

    # Custom validation
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        
        # Make phone_number required in admin
        form.base_fields['phone_number'].required = True
        
        # Custom clean methods can be added here if needed
        return form

    # Additional security features
    def get_readonly_fields(self, request, obj=None):
        # Prevent changing username for existing users
        if obj:
            return self.readonly_fields + ('username', 'email', 'phone_number')
        return self.readonly_fields

    # Action to deactivate users
    actions = ['deactivate_users']

    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} users were deactivated')
    deactivate_users.short_description = _("Deactivate selected users")


# Register the custom User model with our CustomUserAdmin
admin.site.register(User, CustomUserAdmin)