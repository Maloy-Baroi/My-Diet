from rest_framework import serializers
from .models import WeightLog, CalorieLog, Achievement

class WeightLogSerializer(serializers.ModelSerializer):
    bmi = serializers.SerializerMethodField()
    
    class Meta:
        model = WeightLog
        fields = ['id', 'weight', 'date_recorded', 'notes', 'bmi', 'created_at']
        read_only_fields = ['user']
    
    def get_bmi(self, obj):
        if obj.user.height:
            height_m = obj.user.height / 100
            return round(obj.weight / (height_m ** 2), 2)
        return None

class CalorieLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalorieLog
        fields = '__all__'
        read_only_fields = ['user']

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'
        read_only_fields = ['user', 'earned_date']
