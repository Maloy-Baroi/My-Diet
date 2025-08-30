from rest_framework import serializers
from .models import NutritionGoal, MicronutrientTarget, FoodNutritionProfile, NutritionTracking

class MicronutrientTargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MicronutrientTarget
        fields = ['nutrient', 'daily_target', 'unit']

class NutritionGoalSerializer(serializers.ModelSerializer):
    micronutrient_targets = MicronutrientTargetSerializer(many=True, read_only=True)
    
    class Meta:
        model = NutritionGoal
        fields = ['id', 'daily_calorie_goal', 'protein_goal_grams', 'carbs_goal_grams', 
                 'fat_goal_grams', 'fiber_goal_grams', 'water_goal_ml', 
                 'micronutrient_targets', 'created_at', 'updated_at']
        read_only_fields = ['user']

class FoodNutritionProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodNutritionProfile
        fields = '__all__'

class NutritionTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionTracking
        fields = '__all__'
        read_only_fields = ['user', 'nutrition_score']
