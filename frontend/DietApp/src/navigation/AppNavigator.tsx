import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

// Main Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import DietPlanScreen from '../screens/diet/DietPlanScreen';
import NutritionScreen from '../screens/nutrition/NutritionScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Additional Screens
import MealPlannerScreen from '../screens/diet/MealPlannerScreen';
import FoodSearchScreen from '../screens/nutrition/FoodSearchScreen';
import CalorieTrackerScreen from '../screens/nutrition/CalorieTrackerScreen';
import WeightTrackerScreen from '../screens/progress/WeightTrackerScreen';
import AchievementsScreen from '../screens/progress/AchievementsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Auth Stack Navigator
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Diet':
            iconName = focused ? 'restaurant' : 'restaurant-outline';
            break;
          case 'Nutrition':
            iconName = focused ? 'nutrition' : 'nutrition-outline';
            break;
          case 'Progress':
            iconName = focused ? 'trending-up' : 'trending-up-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'home-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Diet" component={DietPlanScreen} />
    <Tab.Screen name="Nutrition" component={NutritionScreen} />
    <Tab.Screen name="Progress" component={ProgressScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Main Stack Navigator (for authenticated users)
const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MainTabs" 
      component={MainTabs} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="MealPlanner" 
      component={MealPlannerScreen}
      options={{ title: 'Meal Planner' }}
    />
    <Stack.Screen 
      name="FoodSearch" 
      component={FoodSearchScreen}
      options={{ title: 'Food Search' }}
    />
    <Stack.Screen 
      name="CalorieTracker" 
      component={CalorieTrackerScreen}
      options={{ title: 'Calorie Tracker' }}
    />
    <Stack.Screen 
      name="WeightTracker" 
      component={WeightTrackerScreen}
      options={{ title: 'Weight Tracker' }}
    />
    <Stack.Screen 
      name="Achievements" 
      component={AchievementsScreen}
      options={{ title: 'Achievements' }}
    />
    <Stack.Screen 
      name="Notifications" 
      component={NotificationsScreen}
      options={{ title: 'Notifications' }}
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
  </Stack.Navigator>
);

// Root Navigator
const RootNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    // You can return a loading screen component here
    return null;
  }

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  // Check if user needs onboarding (first time user without complete profile)
  if (user && (!user.height || !user.weight || !user.goal)) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    );
  }

  return <MainStack />;
};

// App Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
