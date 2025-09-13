import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { formatDateDisplay } from '../../utils/dateUtils';
import { todoService, TodoItem, MealTask } from '../../services/todoService';
import mealReminderService, { MealReminder } from '../../services/mealReminderService';

const TodoAlarmScreen: React.FC = () => {
  const [todayDate, setTodayDate] = useState<string>('');
  const [mealTasks, setMealTasks] = useState<MealTask[]>([]);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [localCompletions, setLocalCompletions] = useState<{[key: string]: boolean}>({});
  const [activeReminders, setActiveReminders] = useState<MealReminder[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    const today = new Date();
    setTodayDate(formatDateDisplay(today));
    
    // Initialize notifications
    setupNotifications();
    
    // Load today's tasks
    loadTodayTasks();

    // Notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      mealReminderService.handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Setup notification permissions and register
  const setupNotifications = async () => {
    try {
      const token = await mealReminderService.registerForPushNotifications();
      if (token) {
        setNotificationsEnabled(true);
        console.log('Notifications enabled');
      } else {
        setNotificationsEnabled(false);
        console.log('Notifications disabled or not available');
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
      setNotificationsEnabled(false);
    }
  };

  const loadTodayTasks = async () => {
    try {
      setLoading(true);
      
      // Try new API endpoint first
      try {
        const todoResponse = await todoService.getTodoItems();
        console.log('Raw API response:', todoResponse);
        
        if (todoResponse && todoResponse.todo_list) {
          setTodoItems(todoResponse.todo_list);
          let tasks = todoService.convertTodoItemsToMealTasks(todoResponse.todo_list);
          
          // Apply local completions to the tasks
          tasks = tasks.map(task => ({
            ...task,
            completed: localCompletions[task.id] !== undefined 
              ? localCompletions[task.id] 
              : task.completed
          }));
          
          setMealTasks(tasks);
          console.log('Loaded todos from new API:', todoResponse.todo_list.length, 'items');
          
          // Schedule meal reminders if notifications are enabled
          if (notificationsEnabled) {
            await mealReminderService.scheduleAllMealReminders(tasks);
            setActiveReminders(mealReminderService.getActiveReminders());
          }
        } else {
          console.log('API response missing todo_list, trying legacy API');
          throw new Error('Invalid API response structure');
        }
      } catch (newApiError) {
        console.log('New API failed, trying legacy API:', newApiError);
        
        // Fallback to legacy API
        try {
          const todoData = await todoService.getTodayTodoList();
          const tasks = todoService.convertToFrontendFormat(todoData);
          setMealTasks(tasks);
          console.log('Loaded todos from legacy API');
        } catch (legacyApiError) {
          console.log('Legacy API also failed:', legacyApiError);
          throw legacyApiError;
        }
      }
      
    } catch (error) {
      console.error('Error loading todo tasks:', error);
      // Fallback to default tasks if both APIs fail
      setTodoItems([]); // Ensure todoItems is never undefined
      setMealTasks([]);
      Alert.alert('Info', 'Using offline data. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodayTasks();
    setRefreshing(false);
  };

  // Helper function to check if a meal can be completed based on the sequential order
  const canCompleteMeal = (taskType: string, currentLocalCompletions: {[key: string]: boolean}): { canComplete: boolean, missingMeal: string | null } => {
    // Define the meal order: Breakfast -> Snacks -> Lunch -> Dinner
    const mealOrder = ['Breakfast', 'Snacks', 'Lunch', 'Dinner'];
    const normalizedOrder = ['breakfast', 'snacks', 'lunch', 'dinner'];
    
    // Map the task type to the normalized order
    const taskTypeMap: {[key: string]: string} = {
      'breakfast': 'breakfast',
      'snacks': 'snacks',
      'lunch': 'lunch', 
      'dinner': 'dinner'
    };

    const currentMealType = taskTypeMap[taskType.toLowerCase()] || taskType.toLowerCase();
    const currentIndex = normalizedOrder.indexOf(currentMealType);
    
    if (currentIndex === -1) {
      return { canComplete: true, missingMeal: null }; // Unknown meal type, allow it
    }

    // Check if all previous meals are completed
    for (let i = 0; i < currentIndex; i++) {
      const prevMealType = mealOrder[i];
      
      // Find the task ID for this meal type
      const prevMealTask = mealTasks.find(task => 
        task.title.toLowerCase() === prevMealType.toLowerCase()
      );
      
      if (prevMealTask) {
        const isCompletedLocally = currentLocalCompletions[prevMealTask.id] === true;
        const isCompletedFromServer = prevMealTask.completed && !currentLocalCompletions.hasOwnProperty(prevMealTask.id);
        
        if (!isCompletedLocally && !isCompletedFromServer) {
          return { canComplete: false, missingMeal: prevMealType };
        }
      }
    }
    
    return { canComplete: true, missingMeal: null };
  };

  const handleTaskCompletion = async (taskId: string) => {
    const task = mealTasks.find(t => t.id === taskId);
    if (!task) return;

    // Check if this is a real API item (numeric ID) or default item
    const numericId = parseInt(taskId);
    const isApiItem = !isNaN(numericId) && todoItems && todoItems.length > 0;

    if (isApiItem) {
      // For API items, check if we're trying to complete the meal
      const newCompletionState = !task.completed;
      
      if (newCompletionState) {
        // Check if this meal can be completed based on sequential order
        const currentLocalCompletions = {
          ...localCompletions,
          [taskId]: newCompletionState
        };
        
        const { canComplete, missingMeal } = canCompleteMeal(task.title, currentLocalCompletions);
        
        if (!canComplete && missingMeal) {
          Alert.alert(
            'Order Required',
            `Please complete ${missingMeal} first. Meals must be completed in order: Breakfast → Snacks → Lunch → Dinner`,
            [{ text: 'OK' }]
          );
          return;
        }
      }
      
      // Update local completions cache
      setLocalCompletions(prev => ({
        ...prev,
        [taskId]: newCompletionState
      }));
      
      // Update meal tasks UI optimistically
      setMealTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? { ...t, completed: newCompletionState } : t
        )
      );

      // Show immediate feedback
      const message = newCompletionState ? 
        `✓ ${task.title} marked as completed locally!` : 
        `${task.title} marked as incomplete locally`;
      
      // Check if all 4 meals are now completed locally
      const updatedLocalCompletions = {
        ...localCompletions,
        [taskId]: newCompletionState
      };
      
      // Get all meal task IDs from API items
      const apiMealTaskIds = mealTasks
        .filter(t => !isNaN(parseInt(t.id)))
        .map(t => t.id);
      
      const allMealsCompleted = apiMealTaskIds.length === 4 && 
        apiMealTaskIds.every(id => updatedLocalCompletions[id] === true);
      
      if (allMealsCompleted) {
        // All 4 meals are completed locally, auto-trigger backend sync
        Alert.alert(
          'All Meals Complete!',
          'You have completed all 4 meals locally. Syncing with server now...',
          [
            {
              text: 'Sync Now',
              onPress: async () => {
                try {
                  await todoService.completeAllMealsForToday(todoItems);
                  
                  // Update todo items as completed
                  setTodoItems(prevItems =>
                    prevItems.map(t => ({ ...t, is_completed: true }))
                  );
                  
                  // Clear local completions cache since we've synced
                  setLocalCompletions({});
                  
                  // Cancel reminders for completed meals
                  await mealReminderService.clearAllReminders();
                  setActiveReminders([]);
                  
                  Alert.alert('Success', 'All meals synced with server!');
                  
                  // Refresh data
                  await loadTodayTasks();
                } catch (error) {
                  console.error('Error syncing all meals:', error);
                  Alert.alert('Sync Error', error instanceof Error ? error.message : 'Failed to sync with server. Your progress is saved locally.');
                }
              }
            }
          ]
        );
      } else {
        // Show count of completed meals
        const completedCount = apiMealTaskIds.filter(id => updatedLocalCompletions[id] === true).length;
        Alert.alert('Progress Saved', `${message}\n\n${completedCount} of 4 meals completed locally.`);
      }
      
    } else {
      // For default/legacy items, use the old behavior
      try {
        // Optimistically update UI
        setMealTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          )
        );

        // Use legacy API for default tasks
        const today = new Date().toISOString().split('T')[0];
        await todoService.updateMealCompletion(today, task.type, !task.completed);
        console.log('Updated todo using legacy API (default task)');
        
        // Show success message
        const message = !task.completed ? 
          `✓ ${task.title} marked as completed!` : 
          `${task.title} marked as incomplete`;
        Alert.alert('Updated', message);
        
      } catch (error) {
        console.error('Error updating task completion:', error);
        // Revert optimistic update
        setMealTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === taskId ? { ...t, completed: task.completed } : t
          )
        );
        Alert.alert('Error', 'Failed to update task. Please try again.');
      }
    }
  };

  const handleTaskDetails = (task: MealTask) => {
    const reminderStatus = activeReminders.find(r => r.mealType === task.type);
    const reminderText = reminderStatus ? 
      `\n🔔 Reminder: ${reminderStatus.isEnabled ? 'ON' : 'OFF'} at ${reminderStatus.time}` : 
      '\n🔔 No reminder set';
    
    Alert.alert(
      `${task.title} Details`,
      `Time: ${task.time}\nMeal: ${task.details}${reminderText}`,
      [
        { text: 'Set Reminder', onPress: () => handleSetReminder(task) },
        reminderStatus && reminderStatus.isEnabled ? 
          { text: 'Cancel Reminder', onPress: () => handleToggleReminder(reminderStatus.id) } : 
          null,
        { text: 'OK' }
      ].filter(Boolean) as any
    );
  };

  const handleTodoItemDetails = (item: TodoItem) => {
    const details = [
      `Meal: ${item.meal}`,
      `Meal Time: ${item.meal_time}`,
      `Date: ${item.date_of_meal}`,
      `Day: ${item.day}`,
      `Status: ${item.is_completed ? 'Completed' : 'Pending'}`,
    ].filter(Boolean).join('\n');

    Alert.alert('Todo Details', details, [{ text: 'OK' }]);
  };

  const handleTodoItemCompletion = async (itemId: number) => {
    const item = todoItems.find(t => t.id === itemId);
    if (!item) return;

    // The backend requires all 4 items to be completed together
    Alert.alert(
      'Complete All Meals',
      'The system requires all 4 meals (Breakfast, Lunch, Dinner, Snacks) to be completed together. Would you like to mark all meals as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete All',
          onPress: async () => {
            try {
              await todoService.completeAllMealsForToday(todoItems);
              
              // Update all todo items as completed
              setTodoItems(prevItems =>
                prevItems.map(t => ({ ...t, is_completed: true }))
              );
              
              // Update all meal tasks as completed
              setMealTasks(prevTasks =>
                prevTasks.map(t => ({ ...t, completed: true }))
              );
              
              Alert.alert('Success', 'All meals marked as completed!');
              
              // Refresh data
              await loadTodayTasks();
            } catch (error) {
              console.error('Error completing all meals:', error);
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to complete all meals. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleSetReminder = async (task: MealTask) => {
    if (!notificationsEnabled) {
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications in your device settings to set meal reminders.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Setup Notifications', onPress: setupNotifications }
        ]
      );
      return;
    }

    Alert.alert(
      'Set Meal Reminder',
      `Set a reminder for ${task.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Default Time',
          onPress: async () => {
            try {
              const notificationId = await mealReminderService.scheduleMealReminder(task);
              if (notificationId) {
                setActiveReminders(mealReminderService.getActiveReminders());
                Alert.alert('Reminder Set', `Reminder set for ${task.title} at ${task.time}`);
              } else {
                Alert.alert('Error', 'Failed to set reminder');
              }
            } catch (error) {
              console.error('Error setting reminder:', error);
              Alert.alert('Error', 'Failed to set reminder. Please try again.');
            }
          }
        },
        {
          text: 'Custom Time',
          onPress: () => showCustomTimeDialog(task)
        },
        {
          text: '15 min before',
          onPress: async () => {
            try {
              const message = `Your ${task.title.toLowerCase()} is in 15 minutes!`;
              const notificationId = await mealReminderService.scheduleCustomReminder(task, message, 15);
              if (notificationId) {
                Alert.alert('Reminder Set', `Reminder set 15 minutes before ${task.title}`);
              }
            } catch (error) {
              console.error('Error setting custom reminder:', error);
              Alert.alert('Error', 'Failed to set reminder');
            }
          }
        }
      ]
    );
  };

  const showCustomTimeDialog = (task: MealTask) => {
    Alert.prompt(
      'Custom Reminder Time',
      'Enter time (e.g., 12:30 PM):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set Reminder',
          onPress: async (customTime) => {
            if (customTime) {
              try {
                const notificationId = await mealReminderService.scheduleMealReminder(task, customTime);
                if (notificationId) {
                  setActiveReminders(mealReminderService.getActiveReminders());
                  Alert.alert('Reminder Set', `Custom reminder set for ${task.title} at ${customTime}`);
                } else {
                  Alert.alert('Error', 'Invalid time format. Please use format like "12:30 PM"');
                }
              } catch (error) {
                console.error('Error setting custom reminder:', error);
                Alert.alert('Error', 'Failed to set custom reminder');
              }
            }
          }
        }
      ],
      'plain-text',
      task.time
    );
  };

  const handleToggleReminder = async (reminderId: string) => {
    try {
      await mealReminderService.toggleReminder(reminderId);
      setActiveReminders(mealReminderService.getActiveReminders());
      Alert.alert('Reminder Updated', 'Reminder has been toggled');
    } catch (error) {
      console.error('Error toggling reminder:', error);
      Alert.alert('Error', 'Failed to update reminder');
    }
  };

  const handleSetAllReminders = async () => {
    if (!notificationsEnabled) {
      Alert.alert('Notifications Disabled', 'Please enable notifications first');
      return;
    }

    Alert.alert(
      'Set All Reminders',
      'This will set reminders for all incomplete meals at their scheduled times.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set Reminders',
          onPress: async () => {
            try {
              const incompleteMeals = mealTasks.filter(task => !task.completed);
              if (incompleteMeals.length === 0) {
                Alert.alert('No Meals', 'All meals are already completed!');
                return;
              }

              await mealReminderService.scheduleAllMealReminders(incompleteMeals);
              setActiveReminders(mealReminderService.getActiveReminders());
              
              Alert.alert(
                'Reminders Set',
                `Set ${incompleteMeals.length} meal reminder${incompleteMeals.length !== 1 ? 's' : ''}`
              );
            } catch (error) {
              console.error('Error setting all reminders:', error);
              Alert.alert('Error', 'Failed to set reminders');
            }
          }
        }
      ]
    );
  };

  const handleCompleteAllMeals = async () => {
    try {
      if (!todoItems || todoItems.length === 0) {
        Alert.alert('No Meals', 'No meals found for today.');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const todayItems = todoItems.filter(item => item.date_of_meal === today);
      
      if (todayItems.length !== 4) {
        Alert.alert('Incomplete', `Expected 4 meals for today, found ${todayItems.length}. Please check your meal plan.`);
        return;
      }

      const allAlreadyCompleted = todayItems.every(item => item.is_completed);
      
      if (allAlreadyCompleted) {
        Alert.alert('Already Complete', 'All meals for today are already completed on the server!');
        return;
      }

      Alert.alert(
        'Complete All Meals',
        'Are you sure you want to mark all meals as completed and sync with server?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Complete All',
            onPress: async () => {
              try {
                // First, update local cache to mark all as completed
                const apiMealTaskIds = mealTasks
                  .filter(t => !isNaN(parseInt(t.id)))
                  .map(t => t.id);
                
                const newLocalCompletions: {[key: string]: boolean} = {};
                apiMealTaskIds.forEach(id => {
                  newLocalCompletions[id] = true;
                });
                
                setLocalCompletions(prev => ({
                  ...prev,
                  ...newLocalCompletions
                }));
                
                // Update UI
                setMealTasks(prevTasks =>
                  prevTasks.map(t => ({ ...t, completed: true }))
                );
                
                // Sync with backend
                await todoService.completeAllMealsForToday(todoItems);
                
                // Update todo items state
                setTodoItems(prevItems =>
                  prevItems.map(t => ({ ...t, is_completed: true }))
                );
                
                // Clear local cache since we've synced with server
                setLocalCompletions({});
                
                Alert.alert('Success', 'All meals marked as completed and synced with server!');
                
                // Refresh data
                await loadTodayTasks();
              } catch (error) {
                console.error('Error completing all meals:', error);
                Alert.alert('Error', error instanceof Error ? error.message : 'Failed to complete all meals. Your local progress is saved.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in handleCompleteAllMeals:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
        return 'sunny-outline';
      case 'lunch':
        return 'partly-sunny-outline';
      case 'dinner':
        return 'moon-outline';
      default:
        return 'restaurant-outline';
    }
  };

  const getMealColor = (type: string) => {
    switch (type) {
      case 'breakfast':
        return '#FF9500';
      case 'lunch':
        return '#007AFF';
      case 'dinner':
        return '#5856D6';
      default:
        return '#8E8E93';
    }
  };

  const completedTasks = (mealTasks || []).filter(task => task.completed).length;
  const progressPercentage = mealTasks?.length ? (completedTasks / mealTasks.length) * 100 : 0;
  
  // Count local completions
  const localCompletionCount = Object.values(localCompletions).filter(Boolean).length;
  const hasLocalCompletions = localCompletionCount > 0;

  // Helper function to check if a meal is disabled
  const isMealDisabled = (task: MealTask): boolean => {
    if (task.completed) return false; // Already completed tasks are not disabled
    
    const currentLocalCompletions = localCompletions;
    const { canComplete } = canCompleteMeal(task.title, currentLocalCompletions);
    return !canComplete;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Today's Meal Plan</Text>
        <Text style={styles.dateText}>{todayDate}</Text>
      </View>

      {/* Progress Card */}
      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Ionicons name="checkmark-circle" size={24} color="#34C759" />
          <Text style={styles.progressTitle}>Daily Progress</Text>
        </View>
        <View style={styles.progressContent}>
          <Text style={styles.progressText}>
            {completedTasks} of {mealTasks?.length || 0} meals completed
          </Text>
          {hasLocalCompletions && (
            <Text style={styles.localProgressText}>
              ({localCompletionCount} completed locally, pending sync)
            </Text>
          )}
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
        </View>
      </Card>

      {/* Active Reminders Card */}
      {notificationsEnabled && activeReminders.length > 0 && (
        <Card style={styles.remindersCard}>
          <View style={styles.remindersHeader}>
            <Ionicons name="alarm-outline" size={24} color="#007AFF" />
            <Text style={styles.remindersTitle}>Active Reminders</Text>
          </View>
          <View style={styles.remindersContent}>
            {activeReminders.map((reminder, index) => (
              <View key={reminder.id} style={styles.reminderItem}>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderMeal}>{reminder.title}</Text>
                  <Text style={styles.reminderTime}>🔔 {reminder.time}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleToggleReminder(reminder.id)}
                  style={styles.reminderToggle}
                >
                  <Ionicons
                    name={reminder.isEnabled ? 'notifications' : 'notifications-off'}
                    size={20}
                    color={reminder.isEnabled ? '#34C759' : '#8E8E93'}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Notification Setup Card */}
      {!notificationsEnabled && (
        <Card style={styles.notificationSetupCard}>
          <View style={styles.notificationSetupContent}>
            <Ionicons name="notifications-off-outline" size={48} color="#FF9500" />
            <Text style={styles.notificationSetupTitle}>Enable Meal Reminders</Text>
            <Text style={styles.notificationSetupText}>
              Get notified when it's time for your meals. Enable notifications to never miss a meal again!
            </Text>
            <Button
              title="Enable Notifications"
              variant="primary"
              size="small"
              style={styles.enableNotificationsButton}
              onPress={setupNotifications}
            />
          </View>
        </Card>
      )}

      {/* Meal Tasks */}
      <View style={styles.tasksContainer}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        {loading ? (
          <Card style={styles.taskCard}>
            <View style={styles.loadingContainer}>
              <Ionicons name="hourglass-outline" size={48} color="#8E8E93" />
              <Text style={styles.loadingText}>Loading today's meals...</Text>
            </View>
          </Card>
        ) : (
          mealTasks.map((task) => {
            const isDisabled = isMealDisabled(task);
            
            return (
            <Card key={task.id} style={[styles.taskCard, isDisabled && styles.disabledTaskCard]}>
              <TouchableOpacity
                style={[styles.taskContent, isDisabled && styles.disabledTaskContent]}
                onPress={() => handleTaskDetails(task)}
                disabled={isDisabled}
              >
                <View style={styles.taskHeader}>
                  <View style={[styles.taskIcon, isDisabled && styles.disabledTaskIcon]}>
                    <Ionicons
                      name={getMealIcon(task.type)}
                      size={24}
                      color={isDisabled ? '#C7C7CC' : getMealColor(task.type)}
                    />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, isDisabled && styles.disabledText]}>
                      {task.title}
                      {isDisabled && ' (Complete previous meals first)'}
                    </Text>
                    <Text style={[styles.taskTime, isDisabled && styles.disabledText]}>{task.time}</Text>
                    <Text style={[styles.taskDetails, isDisabled && styles.disabledText]} numberOfLines={2}>
                      {task.details}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.completionButton,
                      task.completed && styles.completedButton,
                      isDisabled && styles.disabledCompletionButton,
                    ]}
                    onPress={() => handleTaskCompletion(task.id)}
                    disabled={isDisabled && !task.completed}
                  >
                    <Ionicons
                      name={task.completed ? 'checkmark-circle' : isDisabled ? 'lock-closed' : 'ellipse-outline'}
                      size={32}
                      color={task.completed ? '#34C759' : isDisabled ? '#C7C7CC' : '#8E8E93'}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              
              {task.completed && (
                <View style={styles.completedOverlay}>
                  <Text style={styles.completedText}>✓ Completed</Text>
                </View>
              )}
            </Card>
            )
          })
        )}
      </View>

      {/* All Todo Items */}
      {todoItems && todoItems.length > 0 && (
        <View style={styles.tasksContainer}>
          <Text style={styles.sectionTitle}>All Todo Items</Text>
          {todoItems.map((item) => (
            <Card key={item.id} style={styles.taskCard}>
              <TouchableOpacity
                style={styles.taskContent}
                onPress={() => handleTodoItemDetails(item)}
              >
                <View style={styles.taskHeader}>
                  <View style={styles.taskIcon}>
                    <Ionicons
                      name={item.is_completed ? 'checkmark-circle' : 'list-outline'}
                      size={24}
                      color={item.is_completed ? '#34C759' : '#007AFF'}
                    />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{item.meal_time}: {item.meal}</Text>
                    <Text style={styles.taskDate}>Date: {item.date_of_meal}</Text>
                    <Text style={styles.taskDate}>Day: {item.day}</Text>
                  </View>
                  {/* <TouchableOpacity
                    style={[
                      styles.completionButton,
                      item.is_completed && styles.completedButton,
                    ]}
                    onPress={() => handleTodoItemCompletion(item.id)}
                  >
                    <Ionicons
                      name={item.is_completed ? 'checkmark-circle' : 'ellipse-outline'}
                      size={32}
                      color={item.is_completed ? '#34C759' : '#8E8E93'}
                    />
                  </TouchableOpacity> */}
                </View>
              </TouchableOpacity>
              
              {item.is_completed && (
                <View style={styles.completedOverlay}>
                  <Text style={styles.completedText}>✓ Completed</Text>
                </View>
              )}
            </Card>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Text style={styles.actionsTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <Button
            title={hasLocalCompletions ? "Sync All" : "Complete All"}
            variant="primary"
            size="small"
            style={styles.actionButton}
            onPress={handleCompleteAllMeals}
          />
        </View>
        {hasLocalCompletions && (
          <Text style={styles.syncNotice}>
            You have {localCompletionCount} meal{localCompletionCount !== 1 ? 's' : ''} completed locally. Tap "Sync All" to save to server.
          </Text>
        )}
        <View style={styles.actionsRow}>
          <Button
            title="Weekly Stats"
            variant="secondary"
            size="small"
            style={styles.actionButton}
            onPress={() => Alert.alert('Stats', 'Weekly statistics coming soon!')}
          />
          {notificationsEnabled && (
            <Button
              title="Set All Reminders"
              variant="outline"
              size="small"
              style={styles.actionButton}
              onPress={handleSetAllReminders}
            />
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  progressCard: {
    margin: 16,
  },
  remindersCard: {
    margin: 16,
    marginTop: 0,
  },
  remindersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  remindersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  remindersContent: {
    gap: 8,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderMeal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  reminderTime: {
    fontSize: 14,
    color: '#007AFF',
  },
  reminderToggle: {
    padding: 4,
  },
  notificationSetupCard: {
    margin: 16,
    marginTop: 0,
  },
  notificationSetupContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  notificationSetupTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  notificationSetupText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  enableNotificationsButton: {
    minWidth: 200,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  localProgressText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  tasksContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
    marginTop: 8,
  },
  taskCard: {
    marginBottom: 12,
    position: 'relative',
  },
  disabledTaskCard: {
    opacity: 0.6,
    backgroundColor: '#F8F8F8',
  },
  taskContent: {
    opacity: 1,
  },
  disabledTaskContent: {
    opacity: 0.7,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  disabledTaskIcon: {
    backgroundColor: '#F8F8F8',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  disabledText: {
    color: '#C7C7CC',
  },
  taskTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  taskDetails: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  taskDate: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
    marginTop: 2,
  },
  completionButton: {
    padding: 8,
  },
  disabledCompletionButton: {
    opacity: 0.5,
  },
  completedButton: {
    // Additional styles for completed state if needed
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  actionsCard: {
    margin: 16,
    marginBottom: 32,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  syncNotice: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
});

export default TodoAlarmScreen;
