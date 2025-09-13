from rest_framework import serializers
from django.contrib.auth import get_user_model
from datetime import date

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    bmi = serializers.SerializerMethodField()
    bmr = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'profile_photo', 'phone_number', 'date_of_birth', 'gender',
            'height', 'weight', 'activity_level', 'goal', 'target_weight',
            'allergies', 'medical_conditions', 'dietary_restrictions',
            'preferred_cuisines', 'disliked_foods', 'age', 'bmi', 'bmr',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'username', 'created_at', 'updated_at', 'age', 'bmi', 'bmr']

    def get_age(self, obj):
        if obj.date_of_birth:
            today = date.today()
            return today.year - obj.date_of_birth.year - ((today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day))
        return None

    def get_bmi(self, obj):
        return obj.calculate_bmi()

    def get_bmr(self, obj):
        return obj.calculate_bmr()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Password and password confirmation do not match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
