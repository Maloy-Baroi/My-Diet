from django.db.models import Q
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

from .serializers import UserProfileSerializer

User = get_user_model()


class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'list'] or self.request.method == 'POST':
            # Allow POST requests without authentication (for registration)
            permission_classes = [AllowAny]
        else:
            # Require authentication for GET, PATCH, PUT, DELETE
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        # Only return queryset if user is authenticated
        if self.request.user.is_authenticated:
            return User.objects.filter(id=self.request.user.id)
        # For unauthenticated requests (like registration), return empty queryset
        return User.objects.none()

    def get_object(self):
        # Only return user object if authenticated
        if self.request.user.is_authenticated:
            return self.request.user
        return None

    def create(self, request, *args, **kwargs):
        """Handle user registration (POST request without authentication)"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get', 'patch'])
    def profile(self, request):
        """Get or update current user profile (requires authentication)"""
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)

        elif request.method == 'PATCH':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):

    @swagger_auto_schema(operation_summary="Login")
    def post(self, request, *args, **kwargs):
        username_or_email = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

        if not username_or_email or not password:
            return Response({
                'detail': 'Username/email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Try to retrieve user by username or email
            user = User.objects.get(
                Q(username=username_or_email) | Q(email=username_or_email)
            )

            # Check if the provided password matches the stored password
            if user.check_password(password):
                # Generate tokens
                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token

                # Get user groups
                groups = [i.name for i in user.groups.all()]
                permissions = user.user_permissions.all()

                # permission_serializers = PermissionSerializer(permissions, many=True)
                return Response({
                    'refresh': str(refresh),
                    'access': str(access_token),
                    'groups': groups,
                    'username': f"{user.first_name} {user.last_name}",
                    # 'permissions': permission_serializers
                }, status=status.HTTP_200_OK)
            else:
                # If password is incorrect, return an error response
                return Response({
                    'detail': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)

        except User.DoesNotExist:
            # If the user does not exist, return an error response
            return Response({
                'detail': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

class CustomTokenRefreshView(TokenRefreshView):

    @swagger_auto_schema(operation_summary="Refresh Token Generator")
    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')

        if refresh_token is None:
            return Response({'detail': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)
            access_token = refresh.access_token

            return Response({
                'access': str(access_token),
            }, status=status.HTTP_200_OK)

        except TokenError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
