// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O';
  height?: number;
  weight?: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'extra_active';
  goal: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'muscle_gain' | 'health_improvement';
  target_weight?: number;
  allergies?: string;
  medical_conditions?: string;
  dietary_restrictions?: string;
  preferred_cuisines?: string;
  disliked_foods?: string;
  created_at: string;
  updated_at: string;
}

// Diet Plan Types
export interface DietPlan {
  id: number;
  user: number;
  name: string;
  plan_type: 'regular' | 'ramadan' | 'weight_loss' | 'weight_gain' | 'muscle_gain';
  duration_days: number;
  daily_calorie_target: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
}

// Food Types
export interface Food {
  id: number;
  name: string;
  category: 'grains' | 'proteins' | 'dairy' | 'fruits' | 'vegetables' | 'fats' | 'beverages' | 'snacks';
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
}

// Meal Types
export interface Meal {
  id: number;
  diet_plan: number;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  total_calories: number;
  notes?: string;
}

export interface FoodItem {
  id: number;
  food: Food;
  quantity: number;
  unit: string;
  calories: number;
}

// Progress Types
export interface WeightLog {
  id: number;
  user: number;
  weight: number;
  date: string;
  notes?: string;
}

export interface CalorieLog {
  id: number;
  user: number;
  date: string;
  calories_consumed: number;
  calories_burned: number;
  net_calories: number;
}

// Nutrition Types
export interface NutritionGoal {
  id: number;
  user: number;
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  fiber_grams: number;
  water_liters: number;
  is_active: boolean;
}

export interface NutritionTracking {
  id: number;
  user: number;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
}

// Notification Types
export interface UserNotification {
  id: number;
  user: number;
  title: string;
  message: string;
  notification_type: 'meal_reminder' | 'water_reminder' | 'exercise_reminder' | 'achievement' | 'general';
  is_read: boolean;
  created_at: string;
}

// Achievement Types
export interface Achievement {
  id: number;
  user: number;
  name: string;
  description: string;
  badge_icon: string;
  achieved_at: string;
}

// Dashboard Types
export interface DashboardData {
  user_profile: User;
  current_weight: number;
  weight_change: number;
  weekly_weight_logs: WeightLog[];
  today_nutrition: NutritionTracking;
  nutrition_goals: NutritionGoal;
  recent_achievements: Achievement[];
  active_diet_plan: DietPlan;
  upcoming_meals: Meal[];
  calorie_trend: CalorieLog[];
}

// Auth Types
export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
