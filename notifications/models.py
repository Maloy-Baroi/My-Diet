from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationTemplate(models.Model):
    NOTIFICATION_TYPES = [
        ('meal_reminder', 'Meal Reminder'),
        ('water_reminder', 'Water Reminder'),
        ('weight_log', 'Weight Log Reminder'),
        ('achievement', 'Achievement Notification'),
        ('plan_reset', 'Plan Reset Alert'),
        ('motivation', 'Motivational Message'),
    ]
    
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=100)
    message = models.TextField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.notification_type} - {self.title}"

class UserNotification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    template = models.ForeignKey(NotificationTemplate, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    scheduled_time = models.DateTimeField(null=True, blank=True)
    sent_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

class UserNotificationSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings')
    meal_reminders = models.BooleanField(default=True)
    water_reminders = models.BooleanField(default=True)
    weight_log_reminders = models.BooleanField(default=True)
    achievement_notifications = models.BooleanField(default=True)
    motivational_messages = models.BooleanField(default=True)
    
    # Timing preferences
    breakfast_reminder_time = models.TimeField(default='08:00:00')
    lunch_reminder_time = models.TimeField(default='13:00:00')
    dinner_reminder_time = models.TimeField(default='19:00:00')
    water_reminder_interval = models.IntegerField(default=2, help_text="Hours between water reminders")
