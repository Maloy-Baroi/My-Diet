from celery import shared_task
from django.utils import timezone
from datetime import time, timedelta
from .models import UserNotification, NotificationTemplate, UserNotificationSettings
from django.contrib.auth import get_user_model

User = get_user_model()

@shared_task
def send_meal_reminders():
    """Send meal reminders based on user preferences"""
    current_time = timezone.now().time()
    
    for settings in UserNotificationSettings.objects.filter(meal_reminders=True):
        user = settings.user
        
        # Check if it's time for any meal reminder
        meal_times = {
            'breakfast': settings.breakfast_reminder_time,
            'lunch': settings.lunch_reminder_time,
            'dinner': settings.dinner_reminder_time,
        }
        
        for meal_type, meal_time in meal_times.items():
            if abs((current_time.hour * 60 + current_time.minute) - 
                   (meal_time.hour * 60 + meal_time.minute)) <= 5:  # 5 minute window
                
                # Check if user has an active diet plan
                active_plan = user.diet_plans.filter(is_active=True).first()
                if active_plan:
                    template = NotificationTemplate.objects.filter(
                        notification_type='meal_reminder'
                    ).first()
                    
                    if template:
                        UserNotification.objects.create(
                            user=user,
                            template=template,
                            title=f"{meal_type.title()} Reminder",
                            message=f"Time for your {meal_type}! Check your diet plan.",
                            sent_time=timezone.now()
                        )

@shared_task
def send_water_reminders():
    """Send water intake reminders"""
    for settings in UserNotificationSettings.objects.filter(water_reminders=True):
        # Send water reminder every X hours as per user preference
        UserNotification.objects.create(
            user=settings.user,
            template_id=1,  # Assuming water reminder template exists
            title="💧 Stay Hydrated",
            message="Don't forget to drink water! Aim for 8 glasses a day.",
            sent_time=timezone.now()
        )
