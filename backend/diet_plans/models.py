from datetime import date, timezone
from datetime import timedelta
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
import json

User = get_user_model()

class Food(models.Model):
    """Food model to store food items with basic nutritional information"""
    name = models.CharField(max_length=255, unique=True)
    calories_per_100g = models.FloatField(help_text="Calories per 100 grams")
    protein_per_100g = models.FloatField(default=0, help_text="Protein in grams per 100g")
    carbs_per_100g = models.FloatField(default=0, help_text="Carbohydrates in grams per 100g")
    fat_per_100g = models.FloatField(default=0, help_text="Fat in grams per 100g")
    fiber_per_100g = models.FloatField(default=0, help_text="Fiber in grams per 100g")
    category = models.CharField(max_length=100, blank=True, help_text="Food category (e.g., vegetables, fruits, grains)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class GenerateMeal(models.Model):
    MEAL_TYPE_CHOICES = [('Regular','Regular'), ('Ramadan','Ramadan')]
    generated_at = models.DateTimeField(auto_now_add=True)
    meal_type = models.CharField(max_length=50, choices=MEAL_TYPE_CHOICES)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    ai_generated_data = models.TextField()  # store the big dict as JSON
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_meals')

    def __str__(self):
        return f"{self.user.username} - {self.meal_type} ({self.start_date} to {self.end_date})"

    def save(self, *args, **kwargs):
        # Only auto-fill dates if not provided
        if not self.start_date:
            # day after "now" in your server TZ (or use user's TZ if you track it)
            self.start_date = timezone.localdate() + timedelta(days=1)
        if not self.end_date:
            # Day 1..Day 30 inclusive => +29
            self.end_date = self.start_date + timedelta(days=29)
        super().save(*args, **kwargs)


class ToDoList(models.Model):
    MEAL_TIME_CHOICES = [('Breakfast','Breakfast'), ('Lunch','Lunch'), ('Dinner','Dinner'), ('Snacks','Snacks')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='todo_lists')
    meal = models.TextField()  # JSON string of items for that meal_time
    day = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(30)])
    meal_time = models.CharField(max_length=50, choices=MEAL_TIME_CHOICES)
    date_of_meal = models.DateField()
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Prevent duplicates for a user on the same date & meal_time
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'date_of_meal', 'meal_time'],
                name='uniq_user_date_mealtime'
            )
        ]

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} • {self.date_of_meal} • {self.meal_time} • {'Done' if self.is_completed else 'Pending'}"

class UserMealProfile(models.Model):
    GOAL_CHOICES = [
        ('weight_loss', 'Weight Loss'),
        ('muscle_gain', 'Muscle Gain'),
        ('maintenance', 'Maintenance'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meal_profiles')
    meal_round = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(3)])
    new_weight = models.FloatField(help_text="Weight in kg")
    new_height = models.FloatField(help_text="Height in cm")
    generated_meal = models.ForeignKey(GenerateMeal, on_delete=models.CASCADE, related_name='meal_profiles')
    goal = models.CharField(max_length=255, choices=GOAL_CHOICES)
