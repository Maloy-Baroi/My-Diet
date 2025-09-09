from django.urls import path
from diet_plans.views import SaveAIDietPlanAPIView, GetGeneratedMealPlanAPIView

urlpatterns = [
    # Diet plan endpoints
    path('save-ai-plan/', SaveAIDietPlanAPIView.as_view(), name='save-ai-diet-plan'),
    path('generate/<int:meal_plan_id>/', GetGeneratedMealPlanAPIView.as_view(), name='get-generated-meal-plan'),
]
