import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from 'react-native-elements';

interface ComingSoonProps {
  title: string;
  icon: string;
  description: string;
  features: string[];
  onGoBack: () => void;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title, 
  icon, 
  description, 
  features, 
  onGoBack 
}) => {
  return (
    <View style={styles.container}>
      <Card containerStyle={styles.card}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name={icon as any} size={50} color="#007AFF" />
          </View>
        </View>
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        </View>
        
        <Text style={styles.featuresTitle}>Planned Features:</Text>
        <View style={styles.featuresList}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity style={styles.goBackButton} onPress={onGoBack}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );
};

// Prayer Times Component
export const PrayerTimes: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ComingSoon
      title="Prayer Times"
      icon="moon-outline"
      description="Stay connected with your spiritual routine with accurate prayer times based on your location."
      features={[
        "Accurate prayer times for your location",
        "Qibla direction compass",
        "Prayer notifications and reminders",
        "Islamic calendar integration",
        "Customizable prayer time calculations",
        "Offline prayer times support"
      ]}
      onGoBack={() => navigation.goBack()}
    />
  );
};

// Buy Groceries Component
export const BuyGroceries: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ComingSoon
      title="Buy Groceries"
      icon="storefront-outline"
      description="Smart grocery shopping made easy with personalized lists and local store integration."
      features={[
        "Smart grocery list generation",
        "Integration with local grocery stores",
        "Price comparison across stores",
        "Healthy food recommendations",
        "Meal plan to grocery list conversion",
        "Delivery and pickup options",
        "Budget tracking and savings tips"
      ]}
      onGoBack={() => navigation.goBack()}
    />
  );
};

// Exercise Tracker Component
export const ExerciseTracker: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ComingSoon
      title="Exercise Tracker"
      icon="barbell-outline"
      description="Track your workouts, monitor your progress, and achieve your fitness goals with our comprehensive exercise tracking system."
      features={[
        "Custom workout creation and logging",
        "Exercise library with detailed instructions",
        "Progress tracking and analytics",
        "Workout history and statistics",
        "Integration with fitness wearables",
        "Social sharing and challenges",
        "Personal trainer recommendations",
        "Calorie burn estimation"
      ]}
      onGoBack={() => navigation.goBack()}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  comingSoonBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 24,
  },
  comingSoonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  goBackButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 100,
  },
  goBackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});