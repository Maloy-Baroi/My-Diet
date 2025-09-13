from django.urls import path
from . import views

urlpatterns = [
    path('prayer-times/', views.PrayerTimeListView.as_view(), name='prayer-times-list'),
    path('prayer-times/<str:date>/', views.PrayerTimeDetailView.as_view(), name='prayer-times-detail'),
    path('prayer-times/fetch/', views.fetch_and_save_prayer_times, name='fetch-prayer-times'),
    path('prayer-times/get-or-fetch/', views.get_or_fetch_prayer_times, name='get-or-fetch-prayer-times'),
]
