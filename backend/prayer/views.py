from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime, date
from .models import PrayerTime
from .serializers import PrayerTimeSerializer, PrayerTimeCreateSerializer
import requests

# Create your views here.


class PrayerTimeListView(generics.ListAPIView):
    """List all prayer times with optional date filtering"""
    serializer_class = PrayerTimeSerializer

    def get_queryset(self):
        queryset = PrayerTime.objects.all()
        date_param = self.request.query_params.get('date', None)
        city = self.request.query_params.get('city', 'Dhaka')
        country = self.request.query_params.get('country', 'Bangladesh')

        queryset = queryset.filter(city=city, country=country)

        if date_param:
            try:
                filter_date = datetime.strptime(date_param, '%Y-%m-%d').date()
                queryset = queryset.filter(date=filter_date)
            except ValueError:
                pass

        return queryset


class PrayerTimeDetailView(generics.RetrieveAPIView):
    """Get prayer times for a specific date"""
    serializer_class = PrayerTimeSerializer
    lookup_field = 'date'

    def get_queryset(self):
        city = self.request.query_params.get('city', 'Dhaka')
        country = self.request.query_params.get('country', 'Bangladesh')
        return PrayerTime.objects.filter(city=city, country=country)


@api_view(['POST'])
def fetch_and_save_prayer_times(request):
    """
    Fetch prayer times from external API and save to database
    Expected payload: {
        "date": "YYYY-MM-DD",
        "city": "Dhaka",
        "country": "Bangladesh",
        "latitude": 23.8103,
        "longitude": 90.4125
    }
    """
    try:
        # Extract data from request
        request_date = request.data.get('date', date.today().strftime('%Y-%m-%d'))
        city = request.data.get('city', 'Dhaka')
        country = request.data.get('country', 'Bangladesh')
        latitude = request.data.get('latitude', 23.8103)
        longitude = request.data.get('longitude', 90.4125)

        # Check if prayer times already exist
        try:
            existing_prayer = PrayerTime.objects.get(
                date=request_date,
                city=city,
                country=country
            )
            serializer = PrayerTimeSerializer(existing_prayer)
            return Response({
                'success': True,
                'message': 'Prayer times already exist',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except PrayerTime.DoesNotExist:
            pass

        # Fetch from external API (Aladhan API)
        api_url = f"http://api.aladhan.com/v1/timings/{request_date}"
        params = {
            'latitude': latitude,
            'longitude': longitude,
            'method': 1,  # University of Islamic Sciences, Karachi
            'school': 0  # Shafi (or specify based on Bangladesh preference)
        }

        response = requests.get(api_url, params=params, timeout=10)
        response.raise_for_status()

        api_data = response.json()

        if api_data.get('code') != 200:
            return Response({
                'success': False,
                'message': 'Failed to fetch prayer times from external API'
            }, status=status.HTTP_400_BAD_REQUEST)

        timings = api_data['data']['timings']
        date_info = api_data['data']['date']
        meta_info = api_data['data']['meta']

        # Convert time strings to time objects
        def parse_time(time_str):
            # Remove timezone info if present (e.g., "05:30 (+06)" -> "05:30")
            time_clean = time_str.split(' ')[0]
            return datetime.strptime(time_clean, '%H:%M').time()

        # Prepare data for serializer
        prayer_data = {
            'date': datetime.strptime(request_date, '%Y-%m-%d').date(),
            'readable_date': date_info['readable'],
            'hijri_date': date_info['hijri']['date'],
            'hijri_month_en': date_info['hijri']['month']['en'],
            'hijri_month_ar': date_info['hijri']['month']['ar'],
            'hijri_year': date_info['hijri']['year'],
            'fajr': parse_time(timings['Fajr']),
            'sunrise': parse_time(timings['Sunrise']),
            'dhuhr': parse_time(timings['Dhuhr']),
            'asr': parse_time(timings['Asr']),
            'sunset': parse_time(timings['Sunset']),
            'maghrib': parse_time(timings['Maghrib']),
            'isha': parse_time(timings['Isha']),
            'imsak': parse_time(timings['Imsak']) if 'Imsak' in timings else None,
            'midnight': parse_time(timings['Midnight']) if 'Midnight' in timings else None,
            'city': city,
            'country': country,
            'latitude': latitude,
            'longitude': longitude,
            'calculation_method': meta_info.get('method', {}).get('name', ''),
            'school': meta_info.get('school', '')
        }

        # Create prayer time record
        serializer = PrayerTimeCreateSerializer(data=prayer_data)
        if serializer.is_valid():
            prayer_time = serializer.save()
            response_serializer = PrayerTimeSerializer(prayer_time)

            return Response({
                'success': True,
                'message': 'Prayer times fetched and saved successfully',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'message': 'Invalid data',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    except requests.exceptions.RequestException as e:
        return Response({
            'success': False,
            'message': f'Failed to fetch from external API: {str(e)}'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    except Exception as e:
        return Response({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_or_fetch_prayer_times(request):
    """
    Get prayer times from database or fetch from API if not available
    """
    request_date = request.GET.get('date', date.today().strftime('%Y-%m-%d'))
    city = request.GET.get('city', 'Dhaka')
    country = request.GET.get('country', 'Bangladesh')

    try:
        # Try to get from database first
        prayer_time = PrayerTime.objects.get(
            date=request_date,
            city=city,
            country=country
        )
        serializer = PrayerTimeSerializer(prayer_time)
        return Response({
            'success': True,
            'source': 'database',
            'data': serializer.data
        })

    except PrayerTime.DoesNotExist:
        # If not in database, fetch from API
        fetch_data = {
            'date': request_date,
            'city': city,
            'country': country,
            'latitude': request.GET.get('latitude', 23.8103),
            'longitude': request.GET.get('longitude', 90.4125)
        }

        # Create a new request object for the fetch_and_save function
        from django.http import QueryDict
        from rest_framework.request import Request
        from django.test.client import RequestFactory

        factory = RequestFactory()
        fetch_request = factory.post('/api/prayer-times/fetch/', fetch_data, format='json')
        fetch_request = Request(fetch_request)
        fetch_request._full_data = fetch_data

        response = fetch_and_save_prayer_times(fetch_request)

        if response.status_code == 201:
            response_data = response.data
            response_data['source'] = 'external_api'
            return Response(response_data)
        else:
            return response
