import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { formatDateDisplay, addDays } from '../../utils/dateUtils';
import { dietPlanService } from '../../services/dietService';

interface DietDay {
  id: string;
  date: Date;
  dayNumber: number;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  generated: boolean;
}

const DietPlanScreen: React.FC = () => {
  const [dietDays, setDietDays] = useState<DietDay[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDietPlan = async () => {
    setIsGenerating(true);
    
    try {
      // Call the Django backend API using the service
      const response = await dietPlanService.generateDietPlan('Regular', 'weight_loss');
      
      // Fetch the detailed meal plan
      const mealPlanData = await dietPlanService.getGeneratedMealPlan(response.meal_plan_id);
      
      // Convert the backend data to frontend format
      const today = new Date(response.start_date);
      const newDietDays: DietDay[] = [];
      
      // Use the daily_plans from the backend response
      if (mealPlanData.daily_plans && mealPlanData.daily_plans.length > 0) {
        mealPlanData.daily_plans.forEach((dayData, index) => {
          const date = addDays(today, index);
          newDietDays.push({
            id: `day-${index + 1}`,
            date,
            dayNumber: index + 1,
            meals: {
              breakfast: dayData.breakfast || 'Healthy breakfast option',
              lunch: dayData.lunch || 'Nutritious lunch option',
              dinner: dayData.dinner || 'Balanced dinner option',
            },
            generated: true,
          });
        });
      } else {
        // Fallback if no daily plans are returned
        for (let i = 0; i < 30; i++) {
          const date = addDays(today, i);
          newDietDays.push({
            id: `day-${i + 1}`,
            date,
            dayNumber: i + 1,
            meals: {
              breakfast: 'Personalized breakfast option',
              lunch: 'Personalized lunch option',
              dinner: 'Personalized dinner option',
            },
            generated: true,
          });
        }
      }
      
      setDietDays(newDietDays);
      Alert.alert(
        'Success', 
        `Your personalized ${mealPlanData.daily_plans.length}-day diet plan has been generated successfully!`
      );
      
    } catch (error) {
      console.error('Error generating diet plan:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to generate diet plan. Please try again.'
      );
      
      // Fallback: Generate sample data if API fails
      const today = new Date();
      const fallbackDietDays: DietDay[] = [];
      
      const sampleMeals = {
        breakfast: [
          'Oatmeal with berries and nuts',
          'Greek yogurt with granola and honey',
          'Avocado toast with poached eggs',
          'Smoothie bowl with mixed fruits',
          'Whole grain cereal with almond milk',
          'Banana pancakes with maple syrup',
          'Scrambled eggs with spinach and tomatoes',
        ],
        lunch: [
          'Grilled chicken salad with mixed greens',
          'Quinoa bowl with roasted vegetables',
          'Turkey and avocado wrap',
          'Lentil soup with whole grain bread',
          'Fish tacos with cabbage slaw',
          'Vegetable stir-fry with brown rice',
          'Chicken and hummus wrap',
        ],
        dinner: [
          'Baked salmon with sweet potato',
          'Lean beef stir-fry with quinoa',
          'Grilled chicken with steamed vegetables',
          'Baked cod with brown rice',
          'Turkey meatballs with whole wheat pasta',
          'Vegetable curry with basmati rice',
          'Herb-crusted pork with roasted vegetables',
        ],
      };
      
      for (let i = 0; i < 30; i++) {
        const date = addDays(today, i);
        fallbackDietDays.push({
          id: `day-${i + 1}`,
          date,
          dayNumber: i + 1,
          meals: {
            breakfast: sampleMeals.breakfast[i % sampleMeals.breakfast.length],
            lunch: sampleMeals.lunch[i % sampleMeals.lunch.length],
            dinner: sampleMeals.dinner[i % sampleMeals.dinner.length],
          },
          generated: true,
        });
      }
      
      setDietDays(fallbackDietDays);
      Alert.alert('Sample Plan', 'Using sample diet plan. Please check your internet connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderDietDay = ({ item }: { item: DietDay }) => (
    <Card style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <View style={styles.dayInfo}>
          <Text style={styles.dayNumber}>Day {item.dayNumber}</Text>
          <Text style={styles.dayDate}>{formatDateDisplay(item.date)}</Text>
        </View>
        <Ionicons
          name={item.generated ? 'checkmark-circle' : 'time-outline'}
          size={24}
          color={item.generated ? '#34C759' : '#8E8E93'}
        />
      </View>
      
      <View style={styles.mealsContainer}>
        <View style={styles.mealRow}>
          <View style={styles.mealIcon}>
            <Ionicons name="sunny-outline" size={20} color="#FF9500" />
          </View>
          <View style={styles.mealInfo}>
            <Text style={styles.mealType}>Breakfast</Text>
            <Text style={styles.mealDetails}>{item.meals.breakfast}</Text>
          </View>
        </View>
        
        <View style={styles.mealRow}>
          <View style={styles.mealIcon}>
            <Ionicons name="partly-sunny-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.mealInfo}>
            <Text style={styles.mealType}>Lunch</Text>
            <Text style={styles.mealDetails}>{item.meals.lunch}</Text>
          </View>
        </View>
        
        <View style={styles.mealRow}>
          <View style={styles.mealIcon}>
            <Ionicons name="moon-outline" size={20} color="#5856D6" />
          </View>
          <View style={styles.mealInfo}>
            <Text style={styles.mealType}>Dinner</Text>
            <Text style={styles.mealDetails}>{item.meals.dinner}</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diet Plan</Text>
        <Text style={styles.subtitle}>
          {dietDays.length > 0 ? '30-Day Meal Plan' : 'Generate your personalized diet plan'}
        </Text>
      </View>
      
      {dietDays.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="restaurant-outline" size={80} color="#8E8E93" />
          <Text style={styles.emptyTitle}>No Diet Plan Yet</Text>
          <Text style={styles.emptyDescription}>
            Generate a personalized 30-day diet plan with 3 meals per day
          </Text>
          <Button
            title="Generate Diet Plan"
            onPress={generateDietPlan}
            loading={isGenerating}
            style={styles.generateButton}
          />
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Card style={styles.summary}>
              <View style={styles.summaryContent}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>30</Text>
                  <Text style={styles.summaryLabel}>Days</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>90</Text>
                  <Text style={styles.summaryLabel}>Meals</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <TouchableOpacity onPress={generateDietPlan} disabled={isGenerating}>
                    <Ionicons name="refresh-outline" size={24} color="#007AFF" />
                  </TouchableOpacity>
                  <Text style={styles.summaryLabel}>Regenerate</Text>
                </View>
              </View>
            </Card>
          </View>
          
          <FlatList
            data={dietDays}
            renderItem={renderDietDay}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
    </View>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  generateButton: {
    width: '100%',
    maxWidth: 300,
  },
  summaryCard: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  summary: {
    marginBottom: 0,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  dayCard: {
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayInfo: {
    flex: 1,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  dayDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  mealsContainer: {
    marginTop: 8,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  mealDetails: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 16,
  },
});

export default DietPlanScreen;
