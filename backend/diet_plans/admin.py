from django.contrib import admin
from .models import DietPlan, Food, Meal, MealFood, DietPlanProgress

@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'calories_per_100g', 'is_vegetarian', 'is_vegan', 'is_halal']
    list_filter = ['category', 'is_vegetarian', 'is_vegan', 'is_halal']
    search_fields = ['name']

class MealFoodInline(admin.TabularInline):
    model = MealFood
    extra = 1

@admin.register(Meal)
class MealAdmin(admin.ModelAdmin):
    list_display = ['diet_plan', 'day_number', 'meal_type', 'name', 'is_completed']
    list_filter = ['meal_type', 'is_completed', 'diet_plan__plan_type']
    inlines = [MealFoodInline]

@admin.register(DietPlan)
class DietPlanAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'plan_type', 'is_active', 'start_date', 'end_date']
    list_filter = ['plan_type', 'is_active']
    search_fields = ['user__username', 'name']

@admin.register(DietPlanProgress)
class DietPlanProgressAdmin(admin.ModelAdmin):
    list_display = ['diet_plan', 'current_day', 'completed_days', 'skipped_days', 'total_resets']
