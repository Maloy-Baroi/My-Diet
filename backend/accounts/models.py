from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    ACTIVITY_LEVEL_CHOICES = [
        ('sedentary', 'Sedentary'),
        ('light', 'Light Exercise'),
        ('moderate', 'Moderate Exercise'),
        ('active', 'Very Active'),
        ('extra_active', 'Extra Active'),
    ]
    
    GOAL_CHOICES = [
        ('lose_weight', 'Lose Weight'),
        ('maintain_weight', 'Maintain Weight'),
        ('gain_weight', 'Gain Weight'),
        ('muscle_gain', 'Muscle Gain'),
        ('health_improvement', 'Health Improvement'),
    ]
    
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    height = models.FloatField(validators=[MinValueValidator(50), MaxValueValidator(300)], null=True, blank=True, help_text="Height in cm")
    weight = models.FloatField(validators=[MinValueValidator(20), MaxValueValidator(500)], null=True, blank=True, help_text="Weight in kg")
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_LEVEL_CHOICES, default='sedentary')
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES, default='maintain_weight')
    target_weight = models.FloatField(null=True, blank=True, help_text="Target weight in kg")
    
    # Health Information
    allergies = models.TextField(blank=True, help_text="Comma-separated list of allergies")
    medical_conditions = models.TextField(blank=True, help_text="Comma-separated list of medical conditions")
    dietary_restrictions = models.TextField(blank=True, help_text="Vegetarian, Vegan, Halal, etc.")
    
    # Preferences
    preferred_cuisines = models.TextField(blank=True, help_text="Comma-separated list of preferred cuisines")
    disliked_foods = models.TextField(blank=True, help_text="Comma-separated list of disliked foods")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def calculate_bmi(self):
        if self.height and self.weight:
            height_m = self.height / 100
            return round(self.weight / (height_m ** 2), 2)
        return None
    
    def calculate_bmr(self):
        """Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation"""
        if not all([self.weight, self.height, self.date_of_birth, self.gender]):
            return None
        
        from datetime import date
        age = (date.today() - self.date_of_birth).days // 365
        
        if self.gender == 'M':
            bmr = 10 * self.weight + 6.25 * self.height - 5 * age + 5
        else:
            bmr = 10 * self.weight + 6.25 * self.height - 5 * age - 161
        
        activity_multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'extra_active': 1.9,
        }
        
        return round(bmr * activity_multipliers.get(self.activity_level, 1.2), 2)

