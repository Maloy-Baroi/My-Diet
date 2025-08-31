import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { Meal } from '../../types';
import { formatDate, formatDateDisplay } from '../../utils/dateUtils';
import { formatCalories } from '../../utils/numberUtils';

const MealPlannerScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMealsForDate(selectedDate);
  }, [selectedDate]);

  const loadMealsForDate = async (date: string) => {
    try {
      setIsLoading(true);
      // TODO: Implement meal loading
      // const mealsData = await mealService.getMealsForDate(date);
      // setMeals(mealsData);
      setMeals([]); // Placeholder
    } catch (error) {
      console.error('Failed to load meals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDateSelect = (date: any) => {
    setSelectedDate(date.dateString);
  };

  const addMeal = (mealType: string) => {
    Alert.alert(
      'Add Meal',
      `Add ${mealType} for ${formatDateDisplay(selectedDate)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add', onPress: () => {
          // TODO: Navigate to meal creation
        }}
      ]
    );
  };

  const mealTypes = [
    { type: 'breakfast', label: 'Breakfast', icon: 'sunny-outline', color: '#FF9500' },
    { type: 'lunch', label: 'Lunch', icon: 'partly-sunny-outline', color: '#34C759' },
    { type: 'dinner', label: 'Dinner', icon: 'moon-outline', color: '#007AFF' },
    { type: 'snack', label: 'Snacks', icon: 'cafe-outline', color: '#FF3B30' },
  ];

  const totalCalories = meals.reduce((sum, meal) => sum + meal.total_calories, 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Calendar */}
        <Card title="Select Date" style={styles.card}>
          <Calendar
            onDayPress={onDateSelect}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: '#007AFF'
              }
            }}
            theme={{
              selectedDayBackgroundColor: '#007AFF',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#007AFF',
              arrowColor: '#007AFF',
            }}
          />
        </Card>

        {/* Selected Date Info */}
        <Card style={styles.card}>
          <View style={styles.dateInfo}>
            <Text style={styles.selectedDateText}>
              {formatDateDisplay(selectedDate)}
            </Text>
            <Text style={styles.totalCaloriesText}>
              Total: {formatCalories(totalCalories)}
            </Text>
          </View>
        </Card>

        {/* Meals for Selected Date */}
        {isLoading ? (
          <Loading message="Loading meals..." />
        ) : (
          <View style={styles.mealsSection}>
            {mealTypes.map((mealType) => {
              const mealForType = meals.find(meal => meal.meal_type === mealType.type);
              
              return (
                <Card key={mealType.type} style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <View style={styles.mealTypeInfo}>
                      <Ionicons 
                        name={mealType.icon as any} 
                        size={24} 
                        color={mealType.color} 
                      />
                      <Text style={styles.mealTypeLabel}>{mealType.label}</Text>
                    </View>
                    
                    {mealForType ? (
                      <Text style={styles.mealCalories}>
                        {formatCalories(mealForType.total_calories)}
                      </Text>
                    ) : (
                      <TouchableOpacity
                        onPress={() => addMeal(mealType.label)}
                        style={styles.addMealButton}
                      >
                        <Ionicons name="add" size={20} color="#007AFF" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {mealForType ? (
                    <View style={styles.mealContent}>
                      {mealForType.foods.map((foodItem, index) => (
                        <View key={index} style={styles.foodItem}>
                          <Text style={styles.foodName}>
                            {foodItem.food.name}
                          </Text>
                          <Text style={styles.foodDetails}>
                            {foodItem.quantity}{foodItem.unit} - {formatCalories(foodItem.calories)}
                          </Text>
                        </View>
                      ))}
                      
                      {mealForType.notes && (
                        <Text style={styles.mealNotes}>{mealForType.notes}</Text>
                      )}
                    </View>
                  ) : (
                    <View style={styles.emptyMeal}>
                      <Text style={styles.emptyMealText}>
                        No {mealType.label.toLowerCase()} planned
                      </Text>
                      <Button
                        title={`Add ${mealType.label}`}
                        onPress={() => addMeal(mealType.label)}
                        variant="outline"
                        size="small"
                        style={styles.addMealButtonFull}
                      />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* Quick Actions */}
        <Card title="Quick Actions" style={styles.card}>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="copy-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Copy Previous Day</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="shuffle-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Generate Suggestions</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  dateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  totalCaloriesText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  mealsSection: {
    paddingHorizontal: 16,
  },
  mealCard: {
    marginVertical: 4,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 12,
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  addMealButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealContent: {
    // Content for existing meals
  },
  foodItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  foodDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  mealNotes: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  emptyMeal: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyMealText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  addMealButtonFull: {
    paddingHorizontal: 24,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    padding: 16,
  },
  quickActionText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MealPlannerScreen;
