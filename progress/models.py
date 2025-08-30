from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class WeightLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weight_logs')
    weight = models.FloatField()
    date_recorded = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'date_recorded']
        ordering = ['-date_recorded']

class CalorieLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='calorie_logs')
    date_recorded = models.DateField()
    total_calories_consumed = models.FloatField()
    total_calories_burned = models.FloatField(default=0)
    protein_consumed = models.FloatField(default=0)
    carbs_consumed = models.FloatField(default=0)
    fat_consumed = models.FloatField(default=0)
    water_intake_ml = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'date_recorded']
        ordering = ['-date_recorded']

class Achievement(models.Model):
    ACHIEVEMENT_TYPES = [
        ('streak_7', '7 Day Streak'),
        ('streak_14', '14 Day Streak'),
        ('streak_30', '30 Day Streak'),
        ('weight_goal', 'Weight Goal Achieved'),
        ('consistency', 'Consistency Champion'),
        ('healthy_eating', 'Healthy Eating'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField()
    badge_icon = models.CharField(max_length=50, default='🏆')
    earned_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'achievement_type']
