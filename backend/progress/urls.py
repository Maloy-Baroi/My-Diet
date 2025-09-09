from django.urls import path
from .views import WeightLogViewSet, CalorieLogViewSet, AchievementViewSet

urlpatterns = [
    # Weight log endpoints
    path('weight-logs/', WeightLogViewSet.as_view({'get': 'list', 'post': 'create'}), name='weight-log-list'),
    path('weight-logs/<int:pk>/', WeightLogViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='weight-log-detail'),
    path('weight-logs/weight-trend/', WeightLogViewSet.as_view({'get': 'weight_trend'}), name='weight-log-trend'),

    # Calorie log endpoints
    path('calorie-logs/', CalorieLogViewSet.as_view({'get': 'list', 'post': 'create'}), name='calorie-log-list'),
    path('calorie-logs/<int:pk>/', CalorieLogViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='calorie-log-detail'),
    path('calorie-logs/weekly-summary/', CalorieLogViewSet.as_view({'get': 'weekly_summary'}), name='calorie-log-weekly-summary'),
    path('calorie-logs/today-stats/', CalorieLogViewSet.as_view({'get': 'today_stats'}), name='calorie-log-today-stats'),
    path('calorie-logs/log-water/', CalorieLogViewSet.as_view({'post': 'log_water'}), name='calorie-log-water'),

    # Achievement endpoints
    path('achievements/', AchievementViewSet.as_view({'get': 'list'}), name='achievement-list'),
    path('achievements/<int:pk>/', AchievementViewSet.as_view({'get': 'retrieve'}), name='achievement-detail'),
]
