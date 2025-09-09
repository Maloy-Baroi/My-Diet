import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { formatDateDisplay } from '../../utils/dateUtils';
import { todoService, TodoItem } from '../../services/todoService';

interface MealTask {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  title: string;
  completed: boolean;
  time: string;
  details: string;
}

const TodoAlarmScreen: React.FC = () => {
  const [todayDate, setTodayDate] = useState<string>('');
  const [mealTasks, setMealTasks] = useState<MealTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const today = new Date();
    setTodayDate(formatDateDisplay(today));
    loadTodayTasks();
  }, []);

  const loadTodayTasks = async () => {
    try {
      setLoading(true);
      const todoData = await todoService.getTodayTodoList();
      const tasks = todoService.convertToFrontendFormat(todoData);
      setMealTasks(tasks);
    } catch (error) {
      console.error('Error loading todo tasks:', error);
      // Fallback to default tasks if API fails
      setMealTasks([
        {
          id: '1',
          type: 'breakfast',
          title: 'Breakfast',
          completed: false,
          time: '08:00 AM',
          details: 'Oatmeal with fruits and nuts',
        },
        {
          id: '2',
          type: 'lunch',
          title: 'Lunch',
          completed: false,
          time: '01:00 PM',
          details: 'Grilled chicken with quinoa and vegetables',
        },
        {
          id: '3',
          type: 'dinner',
          title: 'Dinner',
          completed: false,
          time: '07:00 PM',
          details: 'Salmon with sweet potato and broccoli',
        },
      ]);
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

  const handleTaskCompletion = async (taskId: string) => {
    const task = mealTasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      // Optimistically update UI
      setMealTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      );

      // Update backend
      const today = new Date().toISOString().split('T')[0];
      await todoService.updateMealCompletion(today, task.type, !task.completed);
      
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
  };

  const handleTaskDetails = (task: MealTask) => {
    Alert.alert(
      `${task.title} Details`,
      `Time: ${task.time}\nMeal: ${task.details}`,
      [
        { text: 'Set Reminder', onPress: () => handleSetReminder(task) },
        { text: 'OK' }
      ]
    );
  };

  const handleSetReminder = async (task: MealTask) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await todoService.setMealReminder(today, task.type, task.time);
      Alert.alert('Reminder Set', `Reminder set for ${task.title} at ${task.time}`);
    } catch (error) {
      console.error('Error setting reminder:', error);
      Alert.alert('Error', 'Failed to set reminder. Please try again.');
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

  const completedTasks = mealTasks.filter(task => task.completed).length;
  const progressPercentage = (completedTasks / mealTasks.length) * 100;

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
            {completedTasks} of {mealTasks.length} meals completed
          </Text>
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

      {/* Meal Tasks */}
      <View style={styles.tasksContainer}>
        {loading ? (
          <Card style={styles.taskCard}>
            <View style={styles.loadingContainer}>
              <Ionicons name="hourglass-outline" size={48} color="#8E8E93" />
              <Text style={styles.loadingText}>Loading today's meals...</Text>
            </View>
          </Card>
        ) : (
          mealTasks.map((task) => (
            <Card key={task.id} style={styles.taskCard}>
              <TouchableOpacity
                style={styles.taskContent}
                onPress={() => handleTaskDetails(task)}
              >
                <View style={styles.taskHeader}>
                  <View style={styles.taskIcon}>
                    <Ionicons
                      name={getMealIcon(task.type)}
                      size={24}
                      color={getMealColor(task.type)}
                    />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskTime}>{task.time}</Text>
                    <Text style={styles.taskDetails} numberOfLines={2}>
                      {task.details}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.completionButton,
                      task.completed && styles.completedButton,
                    ]}
                    onPress={() => handleTaskCompletion(task.id)}
                  >
                    <Ionicons
                      name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                      size={32}
                      color={task.completed ? '#34C759' : '#8E8E93'}
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
          ))
        )}
      </View>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Text style={styles.actionsTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <Button
            title="Refresh"
            variant="outline"
            size="small"
            style={styles.actionButton}
            onPress={onRefresh}
            loading={refreshing}
          />
          <Button
            title="Weekly Stats"
            variant="secondary"
            size="small"
            style={styles.actionButton}
            onPress={() => Alert.alert('Stats', 'Weekly statistics coming soon!')}
          />
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
  taskCard: {
    marginBottom: 12,
    position: 'relative',
  },
  taskContent: {
    opacity: 1,
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
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
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
  completionButton: {
    padding: 8,
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
