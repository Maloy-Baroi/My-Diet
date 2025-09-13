from django.urls import path
from diet_plans.views import SaveAIDietPlanAPIView, GetGeneratedMealPlanAPIView, ToDoListAPIView

app_name = 'diet_plans'

urlpatterns = [
    # Diet plan endpoints
    path('save-ai-plan/', SaveAIDietPlanAPIView.as_view(), name='save-ai-plan'),
    path('running-meal-plan/', GetGeneratedMealPlanAPIView.as_view(), name='get-meal-plan'),
    path('todo/', ToDoListAPIView.as_view(), name='todo-list'),
]
