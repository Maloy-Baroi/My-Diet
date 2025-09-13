from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from .serializers import UserProfileSerializer, UserRegistrationSerializer

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view that returns user data along with tokens
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            username = request.data.get('username')
            user = User.objects.get(username=username)
            user_serializer = UserProfileSerializer(user)
            response.data['user'] = user_serializer.data
        return response

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    Logout view that blacklists the refresh token
    """
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    Alternative login view
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        user_serializer = UserProfileSerializer(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': user_serializer.data
        }, status=status.HTTP_200_OK)
    else:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    View to retrieve and update user profile including photo upload
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        """Handle partial updates including file uploads"""
        return self.partial_update(request, *args, **kwargs)

class UserRegistrationView(generics.CreateAPIView):
    """
    View to handle user registration
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile_detail(request):
    """
    Alternative endpoint to get user profile details
    """
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_profile_photo(request):
    """
    Dedicated endpoint for profile photo upload
    """
    if 'profile_photo' not in request.FILES:
        return Response(
            {'error': 'No photo file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = request.user
    user.profile_photo = request.FILES['profile_photo']
    user.save()

    serializer = UserProfileSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)
