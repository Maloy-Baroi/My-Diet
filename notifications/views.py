from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import UserNotification, UserNotificationSettings
from .serializers import UserNotificationSerializer, UserNotificationSettingsSerializer

class UserNotificationViewSet(viewsets.ModelViewSet):
    serializer_class = UserNotificationSerializer
    
    def get_queryset(self):
        return UserNotification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        self.get_queryset().update(is_read=True)
        return Response({'message': 'All notifications marked as read'})

class NotificationSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = UserNotificationSettingsSerializer
    
    def get_queryset(self):
        settings, created = UserNotificationSettings.objects.get_or_create(
            user=self.request.user
        )
        return UserNotificationSettings.objects.filter(user=self.request.user)
    
    def get_object(self):
        settings, created = UserNotificationSettings.objects.get_or_create(
            user=self.request.user
        )
        return settings
