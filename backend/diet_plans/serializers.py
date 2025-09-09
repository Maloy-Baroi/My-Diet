from rest_framework import serializers
# from .models import DietPlan, Food, DailyMeal, MealItem, DietPlanProgress

class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = [
            'id', 'name', 'bengali_name', 'category',
            'calories_per_100g', 'protein_per_100g', 'carbs_per_100g',
            'fat_per_100g', 'fiber_per_100g', 'sodium_per_100g',
            'is_vegetarian', 'is_vegan', 'is_halal', 'is_low_sodium'
        ]

class MealItemSerializer(serializers.ModelSerializer):
    food_details = FoodSerializer(source='food', read_only=True)

    class Meta:
        model = MealItem
        fields = [
            'id', 'food_name', 'quantity_text', 'quantity_grams',
            'quantity_pieces', 'calculated_calories', 'calculated_protein',
            'calculated_carbs', 'calculated_fat', 'order', 'food_details'
        ]

class DailyMealSerializer(serializers.ModelSerializer):
    meal_items = MealItemSerializer(many=True, read_only=True)
    meal_type_display = serializers.CharField(source='get_meal_type_display', read_only=True)

    class Meta:
        model = DailyMeal
        fields = [
            'id', 'day_number', 'meal_type', 'meal_type_display',
            'created_at', 'meal_items'
        ]

class DietPlanProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietPlanProgress
        fields = [
            'current_day', 'completed_days', 'skipped_days', 'total_resets',
            'breakfast_completed', 'lunch_completed', 'dinner_completed',
            'snacks_completed', 'last_updated'
        ]

class DietPlanSerializer(serializers.ModelSerializer):
    progress = DietPlanProgressSerializer(read_only=True)
    plan_type_display = serializers.CharField(source='get_plan_type_display', read_only=True)
    total_meals = serializers.SerializerMethodField()

    class Meta:
        model = DietPlan
        fields = [
            'id', 'name', 'plan_type', 'plan_type_display', 'duration_days',
            'daily_calorie_target', 'is_active', 'start_date', 'end_date',
            'created_at', 'updated_at', 'ai_plan_data', 'progress', 'total_meals'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_total_meals(self, obj):
        """Calculate total number of meals in the plan"""
        return obj.daily_meals.count()

class DietPlanCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating diet plans with AI data"""
    ai_plan_data = serializers.JSONField()

    class Meta:
        model = DietPlan
        fields = [
            'name', 'plan_type', 'duration_days', 'daily_calorie_target',
            'start_date', 'end_date', 'ai_plan_data'
        ]
