from django.db import models


class PrayerTime(models.Model):
    # Date information
    date = models.DateField()
    readable_date = models.CharField(max_length=100, blank=True)

    # Hijri date information
    hijri_date = models.CharField(max_length=20, blank=True)
    hijri_month_en = models.CharField(max_length=20, blank=True)
    hijri_month_ar = models.CharField(max_length=20, blank=True)
    hijri_year = models.CharField(max_length=10, blank=True)

    # Prayer times (stored as time fields)
    fajr = models.TimeField()
    sunrise = models.TimeField()
    dhuhr = models.TimeField()
    asr = models.TimeField()
    sunset = models.TimeField()
    maghrib = models.TimeField()
    isha = models.TimeField()
    imsak = models.TimeField(null=True, blank=True)
    midnight = models.TimeField(null=True, blank=True)

    # Location information
    city = models.CharField(max_length=100, default='Dhaka')
    country = models.CharField(max_length=100, default='Bangladesh')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    # Method and meta information
    calculation_method = models.CharField(max_length=100, blank=True)
    school = models.CharField(max_length=50, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['date', 'city', 'country']
        ordering = ['-date']

    def __str__(self):
        return f"Prayer times for {self.city}, {self.country} on {self.date}"
