import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';
import Card, { StatCard } from '../../components/Card';
import Loading from '../../components/Loading';
import WaterCard from '../../components/WaterCard';
import { formatWeight, formatCalories, formatPercentage } from '../../utils/numberUtils';
import { calculateBMI, getBMICategory } from '../../utils/healthUtils';
import { formatDateDisplay } from '../../utils/dateUtils';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { dashboardData, isLoading, error, refreshDashboard } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshDashboard();
    setRefreshing(false);
  };

  if (isLoading && !dashboardData) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error && !dashboardData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={refreshDashboard} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentBMI = user?.weight && user?.height ? calculateBMI(user.weight, user.height) : 0;
  const bmiCategory = getBMICategory(currentBMI);
  
  const todayNutrition = dashboardData?.today_nutrition;
  const nutritionGoals = dashboardData?.nutrition_goals;
  const calorieProgress = todayNutrition && nutritionGoals 
    ? (todayNutrition.calories / nutritionGoals.daily_calories) * 100 
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.username}>{user?.first_name || user?.username}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Notifications' as never)}
          style={styles.notificationButton}
        >
          <Ionicons name="notifications-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            {/* <StatCard
              title="Calories"
              value={todayNutrition?.calories || 0}
              unit="cal"
              change={calorieProgress}
              changeLabel="% of goal"
              icon="flame-outline"
              color="#FF6B35"
            /> */}
            <StatCard
              title="Weight"
              value={formatWeight(user?.weight || 0, 'kg').replace(' kg', '')}
              unit="kg"
              change={dashboardData?.weight_change}
              changeLabel="kg this week"
              icon="fitness-outline"
              color="#007AFF"
            />
          </View>

          <View style={styles.statsGrid}>
            {/* <StatCard
              title="Water"
              value={todayNutrition?.water || 0}
              unit="L"
              icon="water-outline"
              color="#00D4AA"
            /> */}
            <StatCard
              title="BMI"
              value={currentBMI.toFixed(1)}
              unit={bmiCategory}
              icon="body-outline"
              color="#FF9500"
            />
          </View>
        </View>

        {/* Nutrition Progress */}
        {todayNutrition && nutritionGoals && (
          <Card title="Nutrition Progress" icon="nutrition-outline" style={styles.card}>
            <View style={styles.nutritionProgress}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Calories</Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { 
                          width: `${Math.min(calorieProgress, 100)}%`,
                          backgroundColor: '#FF6B35'
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {todayNutrition.calories}/{nutritionGoals.daily_calories}
                  </Text>
                </View>
              </View>

              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Protein</Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { 
                          width: `${Math.min((todayNutrition.protein / nutritionGoals.protein_grams) * 100, 100)}%`,
                          backgroundColor: '#007AFF'
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {todayNutrition.protein}g/{nutritionGoals.protein_grams}g
                  </Text>
                </View>
              </View>

              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { 
                          width: `${Math.min((todayNutrition.carbs / nutritionGoals.carbs_grams) * 100, 100)}%`,
                          backgroundColor: '#34C759'
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {todayNutrition.carbs}g/{nutritionGoals.carbs_grams}g
                  </Text>
                </View>
              </View>

              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Fat</Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { 
                          width: `${Math.min((todayNutrition.fat / nutritionGoals.fat_grams) * 100, 100)}%`,
                          backgroundColor: '#FF9500'
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {todayNutrition.fat}g/{nutritionGoals.fat_grams}g
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Active Diet Plan */}
        {dashboardData?.active_diet_plan && (
          <Card title="Active Diet Plan" icon="restaurant-outline" style={styles.card}>
            <View style={styles.dietPlanInfo}>
              <Text style={styles.dietPlanName}>
                {dashboardData.active_diet_plan.name}
              </Text>
              <Text style={styles.dietPlanType}>
                {dashboardData.active_diet_plan.plan_type.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={styles.dietPlanCalories}>
                Daily Target: {formatCalories(dashboardData.active_diet_plan.daily_calorie_target)}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.viewPlanButton}
              onPress={() => navigation.navigate('Diet' as never)}
            >
              <Text style={styles.viewPlanText}>View Plan</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" />
            </TouchableOpacity>
          </Card>
        )}

        {/* Upcoming Meals */}
        {dashboardData?.upcoming_meals && dashboardData.upcoming_meals.length > 0 && (
          <Card title="Today's Meals" icon="time-outline" style={styles.card}>
            {dashboardData.upcoming_meals.slice(0, 3).map((meal, index) => (
              <View key={meal.id} style={styles.mealItem}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealType}>
                    {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                  </Text>
                  <Text style={styles.mealCalories}>
                    {formatCalories(meal.total_calories)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.viewAllMealsButton}
              onPress={() => navigation.navigate('MealPlanner' as never)}
            >
              <Text style={styles.viewAllMealsText}>View All Meals</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Recent Achievements */}
        {dashboardData?.recent_achievements && dashboardData.recent_achievements.length > 0 && (
          <Card title="Recent Achievements" icon="trophy-outline" style={styles.card}>
            {dashboardData.recent_achievements.slice(0, 3).map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <View style={styles.achievementIcon}>
                  <Text style={styles.achievementEmoji}>{achievement.badge_icon}</Text>
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementDesc}>{achievement.description}</Text>
                  <Text style={styles.achievementDate}>
                    {formatDateDisplay(achievement.achieved_at)}
                  </Text>
                </View>
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.viewAchievementsButton}
              onPress={() => navigation.navigate('Achievements' as never)}
            >
              <Text style={styles.viewAchievementsText}>View All Achievements</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Water Intake Card */}
        <WaterCard onPress={() => navigation.navigate('WaterTracker' as never)} />

        {/* Quick Actions */}
        <Card title="Quick Actions" style={styles.card}>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('WaterTracker' as never)}
            >
              <Ionicons name="water-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Log Water</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Exercise' as never)}
            >
              <Ionicons name="barbell-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Log Exercise</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('PrayerTime' as never)}
            >
              <FontAwesome5 name="mosque" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Prayer Times</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Grocery' as never)}
            >
              <Ionicons name="cart-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Buy Groceries</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  notificationButton: {
    padding: 8,
  },
  content: {
    flex: 1,
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  nutritionProgress: {
    // Already styled in child components
  },
  macroItem: {
    marginBottom: 16,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
    width: 80,
    textAlign: 'right',
  },
  dietPlanInfo: {
    marginBottom: 16,
  },
  dietPlanName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  dietPlanType: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  dietPlanCalories: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  viewPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  viewPlanText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 4,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  mealCalories: {
    fontSize: 14,
    color: '#8E8E93',
  },
  viewAllMealsButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllMealsText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  achievementDesc: {
    fontSize: 14,
    color: '#8E8E93',
  },
  achievementDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  viewAchievementsButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAchievementsText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (width - 80) / 2,
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default DashboardScreen;
