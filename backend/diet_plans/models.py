from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class DietPlan(models.Model):
    PLAN_TYPE_CHOICES = [
        ('regular', 'Regular Diet'),
        ('ramadan', 'Ramadan Diet'),
        ('weight_loss', 'Weight Loss'),
        ('weight_gain', 'Weight Gain'),
        ('muscle_gain', 'Muscle Gain'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='diet_plans')
    name = models.CharField(max_length=200)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPE_CHOICES, default='regular')
    duration_days = models.IntegerField(default=30)
    daily_calorie_target = models.IntegerField()
    is_active = models.BooleanField(default=True)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.name}"

class Food(models.Model):
    FOOD_CATEGORY_CHOICES = [
        ('grains', 'Grains & Cereals'),
        ('proteins', 'Proteins'),
        ('dairy', 'Dairy'),
        ('fruits', 'Fruits'),
        ('vegetables', 'Vegetables'),
        ('fats', 'Fats & Oils'),
        ('beverages', 'Beverages'),
        ('snacks', 'Snacks'),
    ]
    
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=FOOD_CATEGORY_CHOICES)
    calories_per_100g = models.FloatField()
    protein_per_100g = models.FloatField(default=0)
    carbs_per_100g = models.FloatField(default=0)
    fat_per_100g = models.FloatField(default=0)
    fiber_per_100g = models.FloatField(default=0)
    is_halal = models.BooleanField(default=True)
    is_vegetarian = models.BooleanField(default=False)
    is_vegan = models.BooleanField(default=False)
    common_allergens = models.TextField(blank=True, help_text="Comma-separated allergens")
    
    def __str__(self):
        return self.name

class Meal(models.Model):
    MEAL_TYPE_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
        ('suhoor', 'Suhoor'),
        ('iftar', 'Iftar'),
    ]
    
    diet_plan = models.ForeignKey(DietPlan, on_delete=models.CASCADE, related_name='meals')
    day_number = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(30)])
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPE_CHOICES)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    total_calories = models.FloatField()
    is_completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['diet_plan', 'day_number', 'meal_type']
        ordering = ['day_number', 'meal_type']
    
    def __str__(self):
        return f"Day {self.day_number} - {self.meal_type} - {self.name}"

class MealFood(models.Model):
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE, related_name='meal_foods')
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    quantity_grams = models.FloatField()
    
    def calculate_calories(self):
        return (self.food.calories_per_100g * self.quantity_grams) / 100
    
    def calculate_protein(self):
        return (self.food.protein_per_100g * self.quantity_grams) / 100
    
    def calculate_carbs(self):
        return (self.food.carbs_per_100g * self.quantity_grams) / 100
    
    def calculate_fat(self):
        return (self.food.fat_per_100g * self.quantity_grams) / 100

class DietPlanProgress(models.Model):
    diet_plan = models.OneToOneField(DietPlan, on_delete=models.CASCADE, related_name='progress')
    current_day = models.IntegerField(default=1)
    completed_days = models.IntegerField(default=0)
    skipped_days = models.IntegerField(default=0)
    total_resets = models.IntegerField(default=0)
    last_reset_date = models.DateTimeField(null=True, blank=True)
    
    def reset_plan(self):
        from django.utils import timezone
        self.current_day = 1
        self.completed_days = 0
        self.total_resets += 1
        self.last_reset_date = timezone.now()
        self.save()
        
        # Mark all meals as incomplete
        self.diet_plan.meals.update(is_completed=False, completion_date=None)
