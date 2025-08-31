from rest_framework import serializers
from .models import DietPlan, Food, Meal, MealFood, DietPlanProgress

class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = '__all__'

class MealFoodSerializer(serializers.ModelSerializer):
    food_name = serializers.CharField(source='food.name', read_only=True)
    food_category = serializers.CharField(source='food.category', read_only=True)
    calories = serializers.SerializerMethodField()
    protein = serializers.SerializerMethodField()
    carbs = serializers.SerializerMethodField()
    fat = serializers.SerializerMethodField()
    
    class Meta:
        model = MealFood
        fields = ['id', 'food', 'food_name', 'food_category', 'quantity_grams', 
                 'calories', 'protein', 'carbs', 'fat']
    
    def get_calories(self, obj):
        return round(obj.calculate_calories(), 2)
    
    def get_protein(self, obj):
        return round(obj.calculate_protein(), 2)
    
    def get_carbs(self, obj):
        return round(obj.calculate_carbs(), 2)
    
    def get_fat(self, obj):
        return round(obj.calculate_fat(), 2)

class MealSerializer(serializers.ModelSerializer):
    meal_foods = MealFoodSerializer(many=True, read_only=True)
    
    class Meta:
        model = Meal
        fields = ['id', 'day_number', 'meal_type', 'name', 'description', 
                 'total_calories', 'is_completed', 'completion_date', 'meal_foods']

class DietPlanProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietPlanProgress
        fields = '__all__'
        read_only_fields = ['diet_plan']

class DietPlanSerializer(serializers.ModelSerializer):
    progress = DietPlanProgressSerializer(read_only=True)
    meals_count = serializers.SerializerMethodField()
    completed_meals_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DietPlan
        fields = ['id', 'name', 'plan_type', 'duration_days', 'daily_calorie_target',
                 'is_active', 'start_date', 'end_date', 'created_at', 'progress',
                 'meals_count', 'completed_meals_count']
        read_only_fields = ['user']
    
    def get_meals_count(self, obj):
        return obj.meals.count()
    
    def get_completed_meals_count(self, obj):
        return obj.meals.filter(is_completed=True).count()
