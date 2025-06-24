from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import UserSerializer, RegisterSerializer
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

import logging

logger = logging.getLogger(__name__)



# ========================================================================= #
# User Management Views
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        # Generates standard HTTP headers for a successful resource creation response
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UpdateProfileView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class DeleteAccountView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class LogoutView(generics.GenericAPIView):
    """
    Secure logout endpoint that blacklists refresh tokens
    and clears client-side tokens.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = None

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            
            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                    logger.info(f"User {request.user.id} logged out successfully")
                except TokenError as e:
                    logger.warning(f"Invalid refresh token during logout: {e}")
                    # Continue with logout even if token is invalid

            response = Response(
                {"detail": "Successfully logged out."},
                status=status.HTTP_200_OK
            )
            
            # Clear cookies if used
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            
            # Security headers
            response['Cache-Control'] = 'no-store'
            response['X-Content-Type-Options'] = 'nosniff'
            
            return response
            
        except Exception as e:
            logger.error(f"Logout error for user {request.user.id}: {e}")
            return Response(
                {"detail": "Failed to logout."},
                status=status.HTTP_400_BAD_REQUEST
            )
    

# class LogoutView(generics.GenericAPIView):
#     permission_classes = [permissions.IsAuthenticated]
#     serializer_class = None

#     def post(self, request):
#         try:
#             refresh_token = request.data.get('refresh_token')
#             if refresh_token:
#                 token = RefreshToken(refresh_token)
#                 token.blacklist()
            
#             # Clear the client-side tokens by returning empty tokens
#             response = Response({
#                 "message": "Successfully logged out."
#             }, status=status.HTTP_200_OK)
            
#             # You may also want to delete the refresh token cookie if you're using cookies
#             return response
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        