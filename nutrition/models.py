from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class NutritionGoal(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='nutrition_goals')
    daily_calorie_goal = models.IntegerField()
    protein_goal_grams = models.FloatField()
    carbs_goal_grams = models.FloatField()
    fat_goal_grams = models.FloatField()
    fiber_goal_grams = models.FloatField(default=25)
    water_goal_ml = models.IntegerField(default=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - Nutrition Goals"

class MicronutrientTarget(models.Model):
    NUTRIENT_CHOICES = [
        ('vitamin_c', 'Vitamin C'),
        ('vitamin_d', 'Vitamin D'),
        ('calcium', 'Calcium'),
        ('iron', 'Iron'),
        ('magnesium', 'Magnesium'),
        ('potassium', 'Potassium'),
        ('zinc', 'Zinc'),
        ('folate', 'Folate'),
        ('vitamin_b12', 'Vitamin B12'),
    ]
    
    nutrition_goal = models.ForeignKey(NutritionGoal, on_delete=models.CASCADE, related_name='micronutrient_targets')
    nutrient = models.CharField(max_length=20, choices=NUTRIENT_CHOICES)
    daily_target = models.FloatField()
    unit = models.CharField(max_length=10, default='mg')
    
    class Meta:
        unique_together = ['nutrition_goal', 'nutrient']

class FoodNutritionProfile(models.Model):
    """Extended nutrition profile for foods"""
    food = models.OneToOneField('diet_plans.Food', on_delete=models.CASCADE, related_name='nutrition_profile')
    
    # Vitamins (per 100g)
    vitamin_c_mg = models.FloatField(default=0)
    vitamin_d_iu = models.FloatField(default=0)
    vitamin_a_iu = models.FloatField(default=0)
    vitamin_e_mg = models.FloatField(default=0)
    vitamin_k_mcg = models.FloatField(default=0)
    
    # B Vitamins
    thiamine_mg = models.FloatField(default=0)
    riboflavin_mg = models.FloatField(default=0)
    niacin_mg = models.FloatField(default=0)
    vitamin_b6_mg = models.FloatField(default=0)
    folate_mcg = models.FloatField(default=0)
    vitamin_b12_mcg = models.FloatField(default=0)
    
    # Minerals
    calcium_mg = models.FloatField(default=0)
    iron_mg = models.FloatField(default=0)
    magnesium_mg = models.FloatField(default=0)
    phosphorus_mg = models.FloatField(default=0)
    potassium_mg = models.FloatField(default=0)
    sodium_mg = models.FloatField(default=0)
    zinc_mg = models.FloatField(default=0)
    
    # Other nutrients
    omega3_g = models.FloatField(default=0)
    cholesterol_mg = models.FloatField(default=0)
    sugar_g = models.FloatField(default=0)
    
    def __str__(self):
        return f"Nutrition Profile - {self.food.name}"

class NutritionTracking(models.Model):
    """Daily nutrition tracking"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='nutrition_tracking')
    date_recorded = models.DateField()
    
    # Macronutrients achieved
    calories_consumed = models.FloatField(default=0)
    protein_consumed = models.FloatField(default=0)
    carbs_consumed = models.FloatField(default=0)
    fat_consumed = models.FloatField(default=0)
    fiber_consumed = models.FloatField(default=0)
    sugar_consumed = models.FloatField(default=0)
    
    # Goal achievement percentages
    calorie_goal_percentage = models.FloatField(default=0)
    protein_goal_percentage = models.FloatField(default=0)
    carbs_goal_percentage = models.FloatField(default=0)
    fat_goal_percentage = models.FloatField(default=0)
    
    # Overall nutrition score (0-100)
    nutrition_score = models.FloatField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'date_recorded']
        ordering = ['-date_recorded']
