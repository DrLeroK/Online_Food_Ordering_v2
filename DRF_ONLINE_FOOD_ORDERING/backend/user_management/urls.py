from django.urls import path
from .views import (
    UserListView, UserDetailView,
    RegisterView, UpdateProfileView,
    DeleteAccountView, LogoutView,
)


urlpatterns = [
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/me/', UserDetailView.as_view(), name='user-detail'),
    path('register/', RegisterView.as_view(), name='register'),
    path('update/', UpdateProfileView.as_view(), name='update-profile'),
    path('delete/', DeleteAccountView.as_view(), name='delete-account'),
    path('logout/', LogoutView.as_view(), name='logout'),
]