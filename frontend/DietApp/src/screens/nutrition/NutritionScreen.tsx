import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Card, { StatCard } from '../../components/Card';
import Loading from '../../components/Loading';
import { NutritionTracking, NutritionGoal } from '../../types';
import { nutritionService } from '../../services/nutritionService';
import { formatMacros, formatCalories } from '../../utils/numberUtils';
import { formatDate } from '../../utils/dateUtils';

const { width } = Dimensions.get('window');

const NutritionScreen: React.FC = () => {
  const navigation = useNavigation();
  const [todayNutrition, setTodayNutrition] = useState<NutritionTracking | null>(null);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNutritionData();
  }, []);

  const loadNutritionData = async () => {
    try {
      setIsLoading(true);
      const [todayData, goalsData] = await Promise.all([
        nutritionService.getTodayNutrition(),
        nutritionService.getNutritionGoals().then(response => response.results[0])
      ]);
      
      setTodayNutrition(todayData);
      setNutritionGoals(goalsData);
    } catch (error) {
      console.error('Failed to load nutrition data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addWater = async (amount: number) => {
    try {
      await nutritionService.addWaterIntake(amount);
      await loadNutritionData(); // Refresh data
    } catch (error) {
      console.error('Failed to add water:', error);
    }
  };

  if (isLoading) {
    return <Loading message="Loading nutrition data..." />;
  }

  const calorieProgress = todayNutrition && nutritionGoals 
    ? (todayNutrition.calories / nutritionGoals.daily_calories) * 100 
    : 0;

  const proteinProgress = todayNutrition && nutritionGoals 
    ? (todayNutrition.protein / nutritionGoals.protein_grams) * 100 
    : 0;

  const carbsProgress = todayNutrition && nutritionGoals 
    ? (todayNutrition.carbs / nutritionGoals.carbs_grams) * 100 
    : 0;

  const fatProgress = todayNutrition && nutritionGoals 
    ? (todayNutrition.fat / nutritionGoals.fat_grams) * 100 
    : 0;

  const waterProgress = todayNutrition && nutritionGoals 
    ? (todayNutrition.water / nutritionGoals.water_liters) * 100 
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nutrition</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('CalorieTracker' as never)}
          style={styles.headerButton}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Today's Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Calories"
              value={todayNutrition?.calories || 0}
              unit={`/${nutritionGoals?.daily_calories || 0}`}
              change={calorieProgress}
              changeLabel="% of goal"
              icon="flame-outline"
              color="#FF6B35"
            />
            <StatCard
              title="Water"
              value={todayNutrition?.water || 0}
              unit={`/${nutritionGoals?.water_liters || 0}L`}
              change={waterProgress}
              changeLabel="% of goal"
              icon="water-outline"
              color="#00D4AA"
            />
          </View>
        </View>

        {/* Macronutrients */}
        <Card title="Macronutrients" icon="nutrition-outline" style={styles.card}>
          <View style={styles.macroContainer}>
            <MacroProgressBar
              label="Protein"
              current={todayNutrition?.protein || 0}
              target={nutritionGoals?.protein_grams || 0}
              color="#007AFF"
              unit="g"
            />
            <MacroProgressBar
              label="Carbs"
              current={todayNutrition?.carbs || 0}
              target={nutritionGoals?.carbs_grams || 0}
              color="#34C759"
              unit="g"
            />
            <MacroProgressBar
              label="Fat"
              current={todayNutrition?.fat || 0}
              target={nutritionGoals?.fat_grams || 0}
              color="#FF9500"
              unit="g"
            />
            <MacroProgressBar
              label="Fiber"
              current={todayNutrition?.fiber || 0}
              target={nutritionGoals?.fiber_grams || 0}
              color="#8E8E93"
              unit="g"
            />
          </View>
        </Card>

        {/* Water Intake */}
        <Card title="Water Intake" icon="water-outline" style={styles.card}>
          <View style={styles.waterSection}>
            <View style={styles.waterProgress}>
              <Text style={styles.waterAmount}>
                {todayNutrition?.water || 0}L / {nutritionGoals?.water_liters || 0}L
              </Text>
              <View style={styles.waterBar}>
                <View 
                  style={[
                    styles.waterFill,
                    { width: `${Math.min(waterProgress, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.waterPercentage}>
                {Math.round(waterProgress)}% of daily goal
              </Text>
            </View>
            
            <View style={styles.waterButtons}>
              <TouchableOpacity 
                style={styles.waterButton}
                onPress={() => addWater(0.25)}
              >
                <Text style={styles.waterButtonText}>+250ml</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.waterButton}
                onPress={() => addWater(0.5)}
              >
                <Text style={styles.waterButtonText}>+500ml</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.waterButton}
                onPress={() => addWater(1)}
              >
                <Text style={styles.waterButtonText}>+1L</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Calorie Distribution */}
        <Card title="Calorie Distribution" icon="pie-chart-outline" style={styles.card}>
          <View style={styles.calorieDistribution}>
            {todayNutrition && (
              <>
                <CalorieBar
                  label="Protein"
                  calories={todayNutrition.protein * 4}
                  total={todayNutrition.calories}
                  color="#007AFF"
                />
                <CalorieBar
                  label="Carbs"
                  calories={todayNutrition.carbs * 4}
                  total={todayNutrition.calories}
                  color="#34C759"
                />
                <CalorieBar
                  label="Fat"
                  calories={todayNutrition.fat * 9}
                  total={todayNutrition.calories}
                  color="#FF9500"
                />
              </>
            )}
          </View>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions" style={styles.card}>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('CalorieTracker' as never)}
            >
              <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Log Food</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('FoodSearch' as never)}
            >
              <Ionicons name="search-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Food Search</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => {
                // Navigate to barcode scanner
              }}
            >
              <Ionicons name="qr-code-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Scan Barcode</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => {
                // Navigate to goals settings
              }}
            >
              <Ionicons name="settings-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Goals</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

interface MacroProgressBarProps {
  label: string;
  current: number;
  target: number;
  color: string;
  unit: string;
}

const MacroProgressBar: React.FC<MacroProgressBarProps> = ({
  label,
  current,
  target,
  color,
  unit,
}) => {
  const percentage = target > 0 ? (current / target) * 100 : 0;

  return (
    <View style={styles.macroItem}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>
          {formatMacros(current, unit)} / {formatMacros(target, unit)}
        </Text>
      </View>
      <View style={styles.macroProgressBar}>
        <View 
          style={[
            styles.macroProgressFill,
            { 
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: color 
            }
          ]} 
        />
      </View>
      <Text style={styles.macroPercentage}>{Math.round(percentage)}%</Text>
    </View>
  );
};

interface CalorieBarProps {
  label: string;
  calories: number;
  total: number;
  color: string;
}

const CalorieBar: React.FC<CalorieBarProps> = ({
  label,
  calories,
  total,
  color,
}) => {
  const percentage = total > 0 ? (calories / total) * 100 : 0;

  return (
    <View style={styles.calorieItem}>
      <View style={styles.calorieHeader}>
        <View style={styles.calorieLabelContainer}>
          <View style={[styles.colorIndicator, { backgroundColor: color }]} />
          <Text style={styles.calorieLabel}>{label}</Text>
        </View>
        <Text style={styles.calorieValue}>
          {formatCalories(calories)} ({Math.round(percentage)}%)
        </Text>
      </View>
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
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  macroContainer: {
    // Macro nutrients container
  },
  macroItem: {
    marginBottom: 20,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  macroValue: {
    fontSize: 14,
    color: '#8E8E93',
  },
  macroProgressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 4,
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  macroPercentage: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
  waterSection: {
    // Water section styles
  },
  waterProgress: {
    marginBottom: 20,
  },
  waterAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 12,
  },
  waterBar: {
    height: 12,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
    marginBottom: 8,
  },
  waterFill: {
    height: '100%',
    backgroundColor: '#00D4AA',
    borderRadius: 6,
  },
  waterPercentage: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  waterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  waterButton: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00D4AA',
  },
  waterButtonText: {
    color: '#00D4AA',
    fontWeight: '500',
    fontSize: 14,
  },
  calorieDistribution: {
    // Calorie distribution styles
  },
  calorieItem: {
    marginBottom: 16,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  calorieLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  calorieValue: {
    fontSize: 14,
    color: '#8E8E93',
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
});

export default NutritionScreen;
