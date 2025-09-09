from django.urls import path
from .views import NutritionGoalViewSet, NutritionTrackingViewSet

urlpatterns = [
    # Nutrition goal endpoints
    path('nutrition-goals/', NutritionGoalViewSet.as_view({'get': 'list', 'post': 'create'}), name='nutrition-goal-list'),
    path('nutrition-goals/<int:pk>/', NutritionGoalViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='nutrition-goal-detail'),
    path('nutrition-goals/calculate-goals/', NutritionGoalViewSet.as_view({'post': 'calculate_goals'}), name='nutrition-goal-calculate'),

    # Nutrition tracking endpoints
    path('nutrition-tracking/', NutritionTrackingViewSet.as_view({'get': 'list', 'post': 'create'}), name='nutrition-tracking-list'),
    path('nutrition-tracking/<int:pk>/', NutritionTrackingViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='nutrition-tracking-detail'),
    path('nutrition-tracking/nutrition-analysis/', NutritionTrackingViewSet.as_view({'get': 'nutrition_analysis'}), name='nutrition-tracking-analysis'),
    path('nutrition-tracking/deficiency-alerts/', NutritionTrackingViewSet.as_view({'get': 'deficiency_alerts'}), name='nutrition-tracking-deficiency-alerts'),
]
