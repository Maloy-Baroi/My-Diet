from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from api.dashboard_views import ComprehensiveDashboardView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/diet/', include('diet_plans.urls')),
    path('api/progress/', include('progress.urls')),
    path('api/notification/', include('notifications.urls')),
    path('api/nutrition/', include('nutrition.urls')),
    path('api/dashboard/', ComprehensiveDashboardView.as_view(), name='dashboard'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
