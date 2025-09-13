from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication endpoints
    path('login/', views.login_view, name='login'),
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', views.logout_view, name='logout'),

    # User management endpoints
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('users/profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/detail/', views.user_profile_detail, name='profile-detail'),
    path('profile/upload-photo/', views.upload_profile_photo, name='upload-photo'),
]
