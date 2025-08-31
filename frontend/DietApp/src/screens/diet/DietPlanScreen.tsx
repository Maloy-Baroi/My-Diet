import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { DietPlan } from '../../types';
import { dietPlanService } from '../../services/dietService';
import { formatDateDisplay } from '../../utils/dateUtils';
import { formatCalories } from '../../utils/numberUtils';

const DietPlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadDietPlans();
  }, []);

  const loadDietPlans = async () => {
    try {
      setIsLoading(true);
      const response = await dietPlanService.getDietPlans();
      setDietPlans(response.results);
    } catch (error) {
      console.error('Failed to load diet plans:', error);
      Alert.alert('Error', 'Failed to load diet plans');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIPlan = async () => {
    try {
      setIsGenerating(true);
      Alert.alert(
        'AI Diet Plan Generator',
        'This will create a personalized diet plan based on your profile. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Generate',
            onPress: async () => {
              try {
                const newPlan = await dietPlanService.generateAIDietPlan({});
                setDietPlans(prev => [newPlan, ...prev]);
                Alert.alert('Success', 'New AI diet plan generated!');
              } catch (error) {
                Alert.alert('Error', 'Failed to generate AI diet plan');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate AI diet plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const navigateToMealPlanner = () => {
    navigation.navigate('MealPlanner' as never);
  };

  if (isLoading) {
    return <Loading message="Loading diet plans..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diet Plans</Text>
        <TouchableOpacity 
          onPress={navigateToMealPlanner}
          style={styles.headerButton}
        >
          <Ionicons name="calendar-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* AI Generator Card */}
        <Card title="AI Diet Plan Generator" icon="sparkles-outline" style={styles.card}>
          <Text style={styles.aiDescription}>
            Let our AI create a personalized diet plan based on your goals, preferences, and health information.
          </Text>
          <Button
            title="Generate AI Plan"
            onPress={generateAIPlan}
            loading={isGenerating}
            disabled={isGenerating}
            style={styles.generateButton}
          />
        </Card>

        {/* Active Plans */}
        {dietPlans.filter(plan => plan.is_active).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Plans</Text>
            {dietPlans
              .filter(plan => plan.is_active)
              .map(plan => (
                <DietPlanCard
                  key={plan.id}
                  plan={plan}
                  onPress={() => {
                    // Navigate to plan details
                  }}
                />
              ))}
          </View>
        )}

        {/* All Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Plans</Text>
          {dietPlans.length === 0 ? (
            <Card style={styles.card}>
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={48} color="#8E8E93" />
                <Text style={styles.emptyTitle}>No Diet Plans Yet</Text>
                <Text style={styles.emptyMessage}>
                  Generate your first AI diet plan or create a custom one to get started.
                </Text>
              </View>
            </Card>
          ) : (
            dietPlans.map(plan => (
              <DietPlanCard
                key={plan.id}
                plan={plan}
                onPress={() => {
                  // Navigate to plan details
                }}
              />
            ))
          )}
        </View>

        {/* Quick Actions */}
        <Card title="Quick Actions" style={styles.card}>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={navigateToMealPlanner}
            >
              <Ionicons name="calendar-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Meal Planner</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('FoodSearch' as never)}
            >
              <Ionicons name="search-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Food Database</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

interface DietPlanCardProps {
  plan: DietPlan;
  onPress: () => void;
}

const DietPlanCard: React.FC<DietPlanCardProps> = ({ plan, onPress }) => {
  const getPlanTypeColor = (type: string) => {
    switch (type) {
      case 'weight_loss': return '#FF3B30';
      case 'weight_gain': return '#34C759';
      case 'muscle_gain': return '#007AFF';
      case 'ramadan': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const formatPlanType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.planCard}>
        <View style={styles.planHeader}>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.planMeta}>
              <View style={[
                styles.planTypeTag,
                { backgroundColor: `${getPlanTypeColor(plan.plan_type)}20` }
              ]}>
                <Text style={[
                  styles.planTypeText,
                  { color: getPlanTypeColor(plan.plan_type) }
                ]}>
                  {formatPlanType(plan.plan_type)}
                </Text>
              </View>
              {plan.is_active && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>Active</Text>
                </View>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </View>

        <View style={styles.planDetails}>
          <View style={styles.planStat}>
            <Text style={styles.planStatLabel}>Daily Calories</Text>
            <Text style={styles.planStatValue}>
              {formatCalories(plan.daily_calorie_target)}
            </Text>
          </View>
          <View style={styles.planStat}>
            <Text style={styles.planStatLabel}>Duration</Text>
            <Text style={styles.planStatValue}>{plan.duration_days} days</Text>
          </View>
          <View style={styles.planStat}>
            <Text style={styles.planStatLabel}>Start Date</Text>
            <Text style={styles.planStatValue}>
              {formatDateDisplay(plan.start_date)}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  aiDescription: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
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
  planCard: {
    marginBottom: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  planTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeTag: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  planDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planStat: {
    flex: 1,
    alignItems: 'center',
  },
  planStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  planStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
});

export default DietPlanScreen;
