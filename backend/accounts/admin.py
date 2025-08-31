from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Personal Info', {
            'fields': ('phone_number', 'date_of_birth', 'gender', 'height', 'weight')
        }),
        ('Diet Preferences', {
            'fields': ('activity_level', 'goal', 'target_weight', 'allergies', 
                      'medical_conditions', 'dietary_restrictions', 'preferred_cuisines', 
                      'disliked_foods')
        }),
    )
    
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff']
