from rest_framework import serializers
from django.contrib.auth import get_user_model
from datetime import date

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    bmi = serializers.SerializerMethodField()
    bmr = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'date_of_birth', 'gender', 'height', 'weight',
            'activity_level', 'goal', 'target_weight', 'allergies',
            'medical_conditions', 'dietary_restrictions', 'preferred_cuisines',
            'disliked_foods', 'bmi', 'bmr', 'age', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'bmi', 'bmr', 'age']
    
    def get_bmi(self, obj):
        return obj.calculate_bmi()
    
    def get_bmr(self, obj):
        return obj.calculate_bmr()
    
    def get_age(self, obj):
        if obj.date_of_birth:
            return (date.today() - obj.date_of_birth).days // 365
        return None
