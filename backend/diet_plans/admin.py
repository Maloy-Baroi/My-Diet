from django.contrib import admin
from .models import *

@admin.register(GenerateMeal)
class GenerateMealAdmin(admin.ModelAdmin):
    list_display = ('user', 'meal_type', 'start_date', 'end_date', 'generated_at', 'is_running')
    search_fields = ('user__username', 'meal_type')
    list_filter = ('meal_type', 'generated_at')
    readonly_fields = ('generated_at', 'start_date', 'end_date')

@admin.register(ToDoList)
class ToDoListAdmin(admin.ModelAdmin):
    list_display = ('user', 'meal_time', 'day', 'date_of_meal', 'is_completed')
    search_fields = ('user__username', 'meal_time', 'meal')
    list_filter = ('meal_time', 'is_completed', 'date_of_meal')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(UserMealProfile)
class UserMealProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'meal_round', 'new_weight', 'new_height', 'goal')
    search_fields = ('user__username', 'goal')
    list_filter = ('goal', 'meal_round')

@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    list_display = ('name', 'calories_per_100g', 'protein_per_100g', 'category', 'created_at')
    search_fields = ('name', 'category')
    list_filter = ('category', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
