from django.contrib import admin
from .models import PrayerTime


@admin.register(PrayerTime)
class PrayerTimeAdmin(admin.ModelAdmin):
    list_display = ['date', 'city', 'country', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
    list_filter = ['city', 'country', 'date']
    search_fields = ['city', 'country', 'date']
    ordering = ['-date']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Date Information', {
            'fields': ('date', 'readable_date', 'hijri_date', 'hijri_month_en', 'hijri_month_ar', 'hijri_year')
        }),
        ('Prayer Times', {
            'fields': ('fajr', 'sunrise', 'dhuhr', 'asr', 'sunset', 'maghrib', 'isha', 'imsak', 'midnight')
        }),
        ('Location', {
            'fields': ('city', 'country', 'latitude', 'longitude')
        }),
        ('Method & School', {
            'fields': ('calculation_method', 'school')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
