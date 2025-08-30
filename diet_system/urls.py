from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from accounts.views import UserProfileViewSet
from diet_plans.views import DietPlanViewSet, FoodViewSet
from progress.views import WeightLogViewSet, CalorieLogViewSet, AchievementViewSet
from notifications.views import UserNotificationViewSet, NotificationSettingsViewSet
from nutrition.views import NutritionGoalViewSet, NutritionTrackingViewSet
from api.dashboard_views import ComprehensiveDashboardView

router = DefaultRouter()
router.register(r'users', UserProfileViewSet, basename='users')
router.register(r'diet-plans', DietPlanViewSet, basename='diet-plans')
router.register(r'foods', FoodViewSet)
router.register(r'weight-logs', WeightLogViewSet, basename='weight-logs')
router.register(r'calorie-logs', CalorieLogViewSet, basename='calorie-logs')
router.register(r'achievements', AchievementViewSet, basename='achievements')
router.register(r'notifications', UserNotificationViewSet, basename='notifications')
router.register(r'notification-settings', NotificationSettingsViewSet, basename='notification-settings')
router.register(r'nutrition-goals', NutritionGoalViewSet, basename='nutrition-goals')
router.register(r'nutrition-tracking', NutritionTrackingViewSet, basename='nutrition-tracking')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),
    path('api/', include(router.urls)),
    path('api/dashboard/', ComprehensiveDashboardView.as_view(), name='dashboard'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
