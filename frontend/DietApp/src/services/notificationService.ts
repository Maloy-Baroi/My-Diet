import apiService from './apiService';
import { 
  UserNotification, 
  PaginatedResponse 
} from '../types';

class NotificationService {
  // Get user notifications
  async getNotifications(): Promise<PaginatedResponse<UserNotification>> {
    try {
      return await apiService.get<PaginatedResponse<UserNotification>>('/notifications/');
    } catch (error) {
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(id: number): Promise<UserNotification> {
    try {
      return await apiService.patch<UserNotification>(`/notifications/${id}/`, { is_read: true });
    } catch (error) {
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      await apiService.post('/notifications/mark_all_read/');
    } catch (error) {
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(id: number): Promise<void> {
    try {
      await apiService.delete(`/notifications/${id}/`);
    } catch (error) {
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<{ count: number }> {
    try {
      return await apiService.get<{ count: number }>('/notifications/unread_count/');
    } catch (error) {
      throw error;
    }
  }

  // Notification settings
  async getNotificationSettings(): Promise<any> {
    try {
      return await apiService.get('/notification-settings/');
    } catch (error) {
      throw error;
    }
  }

  async updateNotificationSettings(settings: any): Promise<any> {
    try {
      return await apiService.patch('/notification-settings/', settings);
    } catch (error) {
      throw error;
    }
  }

  // Schedule notification
  async scheduleNotification(notificationData: any): Promise<void> {
    try {
      await apiService.post('/notifications/schedule/', notificationData);
    } catch (error) {
      throw error;
    }
  }

  // Cancel scheduled notification
  async cancelScheduledNotification(id: string): Promise<void> {
    try {
      await apiService.delete(`/notifications/scheduled/${id}/`);
    } catch (error) {
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
