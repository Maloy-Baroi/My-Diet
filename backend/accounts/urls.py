from django.urls import path
from .views import UserProfileViewSet, CustomTokenObtainPairView, CustomTokenRefreshView

urlpatterns = [
    # Authentication endpoints
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),

    # User profile endpoints
    path('users/', UserProfileViewSet.as_view({'get': 'list', 'post': 'create'}), name='user-list'),
    path('users/<int:pk>/', UserProfileViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='user-detail'),
    path('users/profile/', UserProfileViewSet.as_view({'get': 'profile', 'patch': 'profile'}), name='user-profile'),
    path('users/update-profile/', UserProfileViewSet.as_view({'patch': 'update_profile'}), name='user-update-profile'),
]
