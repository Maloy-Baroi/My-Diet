import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { MealTask } from './todoService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface MealReminder {
  id: string;
  mealType: string;
  title: string;
  time: string;
  notificationId?: string;
  isEnabled: boolean;
}

class MealReminderService {
  private reminders: MealReminder[] = [];

  // Register for push notifications
  async registerForPushNotifications(): Promise<string | null> {
    let token = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('meal-reminders', {
        name: 'Meal Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      // For local notifications, we don't need a push token
      // Just return a success indicator
      token = { data: 'local-notifications-enabled' };
      console.log('Local notifications enabled');
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token?.data || null;
  }

  // Schedule a meal reminder notification
  async scheduleMealReminder(
    mealTask: MealTask,
    customTime?: string
  ): Promise<string | null> {
    try {
      const reminderTime = customTime || mealTask.time;
      const [time, period] = reminderTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      // Convert to 24-hour format
      let hour24 = hours;
      if (period?.toUpperCase() === 'PM' && hours !== 12) {
        hour24 += 12;
      } else if (period?.toUpperCase() === 'AM' && hours === 12) {
        hour24 = 0;
      }

      // Create notification trigger for today
      const now = new Date();
      const triggerDate = new Date();
      triggerDate.setHours(hour24, minutes, 0, 0);
      
      // If the time has already passed today, schedule for tomorrow
      if (triggerDate <= now) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🍽️ ${mealTask.title} Time!`,
          body: `It's time for your ${mealTask.title.toLowerCase()}. ${mealTask.details}`,
          data: {
            mealType: mealTask.type,
            mealId: mealTask.id,
            screen: 'TodoAlarm',
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: triggerDate,
          repeats: true,
        },
      });

      // Store the reminder
      const reminder: MealReminder = {
        id: `${mealTask.id}_${Date.now()}`,
        mealType: mealTask.type,
        title: mealTask.title,
        time: reminderTime,
        notificationId,
        isEnabled: true,
      };

      this.reminders.push(reminder);
      console.log(`Scheduled ${mealTask.title} reminder for ${triggerDate.toLocaleString()}`);
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling meal reminder:', error);
      return null;
    }
  }

  // Schedule all meal reminders
  async scheduleAllMealReminders(mealTasks: MealTask[]): Promise<void> {
    try {
      // Clear existing reminders first
      await this.clearAllReminders();

      const validMealTasks = mealTasks.filter(task => task.time && !task.completed);
      
      for (const mealTask of validMealTasks) {
        await this.scheduleMealReminder(mealTask);
      }

      console.log(`Scheduled ${validMealTasks.length} meal reminders`);
    } catch (error) {
      console.error('Error scheduling all meal reminders:', error);
    }
  }

  // Cancel a specific reminder
  async cancelReminder(reminderId: string): Promise<void> {
    try {
      const reminder = this.reminders.find(r => r.id === reminderId);
      if (reminder && reminder.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
        this.reminders = this.reminders.filter(r => r.id !== reminderId);
        console.log(`Cancelled reminder: ${reminder.title}`);
      }
    } catch (error) {
      console.error('Error cancelling reminder:', error);
    }
  }

  // Clear all reminders
  async clearAllReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.reminders = [];
      console.log('Cleared all meal reminders');
    } catch (error) {
      console.error('Error clearing all reminders:', error);
    }
  }

  // Get all active reminders
  getActiveReminders(): MealReminder[] {
    return this.reminders.filter(r => r.isEnabled);
  }

  // Toggle reminder on/off
  async toggleReminder(reminderId: string): Promise<void> {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (reminder) {
      if (reminder.isEnabled && reminder.notificationId) {
        // Disable - cancel the notification
        await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
        reminder.isEnabled = false;
        reminder.notificationId = undefined;
      } else {
        // Enable - reschedule the notification
        // Note: You'd need the original MealTask to reschedule
        reminder.isEnabled = true;
      }
    }
  }

  // Handle notification response (when user taps notification)
  handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    console.log('Notification tapped:', data);
    
    // You can navigate to specific screen or perform actions here
    if (data.screen === 'TodoAlarm') {
      // Navigate to TodoAlarm screen
      console.log(`Opening meal reminder for ${data.mealType}`);
    }
  }

  // Get scheduled notifications (for debugging)
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Quick reminder - schedule notification in X minutes
  async scheduleQuickReminder(
    title: string,
    body: string,
    delayMinutes: number = 5
  ): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: {
        seconds: delayMinutes * 60,
      },
    });

    console.log(`Quick reminder scheduled for ${delayMinutes} minutes`);
    return notificationId;
  }

  // Update meal reminder when meal is completed
  async onMealCompleted(mealId: string): Promise<void> {
    const reminders = this.reminders.filter(r => r.id.startsWith(mealId));
    for (const reminder of reminders) {
      await this.cancelReminder(reminder.id);
    }
  }

  // Schedule reminder with custom message
  async scheduleCustomReminder(
    mealTask: MealTask,
    customMessage: string,
    minutesBefore: number = 0
  ): Promise<string | null> {
    try {
      const reminderTime = mealTask.time;
      const [time, period] = reminderTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      // Convert to 24-hour format
      let hour24 = hours;
      if (period?.toUpperCase() === 'PM' && hours !== 12) {
        hour24 += 12;
      } else if (period?.toUpperCase() === 'AM' && hours === 12) {
        hour24 = 0;
      }

      // Create notification trigger
      const now = new Date();
      const triggerDate = new Date();
      triggerDate.setHours(hour24, minutes - minutesBefore, 0, 0);
      
      // If the time has already passed today, schedule for tomorrow
      if (triggerDate <= now) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 Meal Reminder`,
          body: customMessage,
          data: {
            mealType: mealTask.type,
            mealId: mealTask.id,
            screen: 'TodoAlarm',
          },
          sound: 'default',
        },
        trigger: {
          date: triggerDate,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling custom reminder:', error);
      return null;
    }
  }
}

export const mealReminderService = new MealReminderService();
export default mealReminderService;
