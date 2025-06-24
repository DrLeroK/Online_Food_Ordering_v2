# permissions.py
from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to access it.
    """
    def has_object_permission(self, request, view, obj):
        # Admin has all permissions
        if request.user.is_staff:
            return True
            
        # Check if the object has an owner and if it's the current user
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
            
        return False

class IsAdmin(permissions.BasePermission):
    """
    Only allows admin users
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff