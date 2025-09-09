from django.urls import path
from diet_plans.views import GenerateDietPlanAPIView, DietPlanTaskStatusAPIView

urlpatterns = [
    # Diet plan endpoints
    path('generate/', GenerateDietPlanAPIView.as_view(), name='generate-diet-plan'),
    path('task-status/<str:task_id>/', DietPlanTaskStatusAPIView.as_view(), name='diet-plan-task-status'),
]
