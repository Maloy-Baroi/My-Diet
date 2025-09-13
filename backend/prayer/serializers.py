from rest_framework import serializers
from .models import PrayerTime


class PrayerTimeSerializer(serializers.ModelSerializer):
    # Read-only fields for formatted output
    fajr_formatted = serializers.SerializerMethodField()
    sunrise_formatted = serializers.SerializerMethodField()
    dhuhr_formatted = serializers.SerializerMethodField()
    asr_formatted = serializers.SerializerMethodField()
    maghrib_formatted = serializers.SerializerMethodField()
    isha_formatted = serializers.SerializerMethodField()

    class Meta:
        model = PrayerTime
        fields = [
            'id', 'date', 'readable_date',
            'hijri_date', 'hijri_month_en', 'hijri_month_ar', 'hijri_year',
            'fajr', 'sunrise', 'dhuhr', 'asr', 'sunset', 'maghrib', 'isha',
            'imsak', 'midnight',
            'fajr_formatted', 'sunrise_formatted', 'dhuhr_formatted',
            'asr_formatted', 'maghrib_formatted', 'isha_formatted',
            'city', 'country', 'latitude', 'longitude',
            'calculation_method', 'school',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_fajr_formatted(self, obj):
        return obj.fajr.strftime('%I:%M %p') if obj.fajr else None

    def get_sunrise_formatted(self, obj):
        return obj.sunrise.strftime('%I:%M %p') if obj.sunrise else None

    def get_dhuhr_formatted(self, obj):
        return obj.dhuhr.strftime('%I:%M %p') if obj.dhuhr else None

    def get_asr_formatted(self, obj):
        return obj.asr.strftime('%I:%M %p') if obj.asr else None

    def get_maghrib_formatted(self, obj):
        return obj.maghrib.strftime('%I:%M %p') if obj.maghrib else None

    def get_isha_formatted(self, obj):
        return obj.isha.strftime('%I:%M %p') if obj.isha else None


class PrayerTimeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating prayer times from external API data"""

    class Meta:
        model = PrayerTime
        fields = '__all__'

    def create(self, validated_data):
        # Use get_or_create to avoid duplicates
        prayer_time, created = PrayerTime.objects.get_or_create(
            date=validated_data['date'],
            city=validated_data.get('city', 'Dhaka'),
            country=validated_data.get('country', 'Bangladesh'),
            defaults=validated_data
        )
        return prayer_time
