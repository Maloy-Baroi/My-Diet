from django.urls import path
from .views import UserNotificationViewSet, NotificationSettingsViewSet

urlpatterns = [
    # Notification endpoints
    path('notifications/', UserNotificationViewSet.as_view({'get': 'list', 'post': 'create'}), name='notification-list'),
    path('notifications/<int:pk>/', UserNotificationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='notification-detail'),
    path('notifications/<int:pk>/mark-as-read/', UserNotificationViewSet.as_view({'post': 'mark_as_read'}), name='notification-mark-read'),
    path('notifications/mark-all-read/', UserNotificationViewSet.as_view({'post': 'mark_all_read'}), name='notification-mark-all-read'),

    # Notification settings endpoints
    path('notification-settings/', NotificationSettingsViewSet.as_view({'get': 'list', 'post': 'create'}), name='notification-settings-list'),
    path('notification-settings/<int:pk>/', NotificationSettingsViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='notification-settings-detail'),
]
