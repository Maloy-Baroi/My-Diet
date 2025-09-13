import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from 'react-native-elements';
import { useWaterTracking } from '../../hooks/useWaterTracking';

const { width } = Dimensions.get('window');

const WaterTracker: React.FC = () => {
  const { 
    waterData, 
    loading, 
    error, 
    addWaterEntry, 
    removeWaterEntry, 
    resetDaily, 
    getProgressPercentage,
    isGoalReached 
  } = useWaterTracking();
  
  const [selectedAmount, setSelectedAmount] = useState(250);
  const quickAmounts = [125, 250, 500, 750, 1000];

  const addWater = async (amount: number) => {
    try {
      const updatedData = await addWaterEntry(amount);

      // Check if goal is reached
      if (isGoalReached()) {
        Alert.alert(
          '🎉 Congratulations!',
          'You\'ve reached your daily water goal!',
          [{ text: 'Great!', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to log water intake');
    }
  };

  const removeWater = (id: string) => {
    Alert.alert(
      'Remove Entry',
      'Are you sure you want to remove this water entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeWaterEntry(id);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove water entry');
            }
          },
        },
      ]
    );
  };

  const handleResetDaily = () => {
    Alert.alert(
      'Reset Daily Progress',
      'Are you sure you want to reset your daily water intake?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetDaily();
            } catch (error) {
              Alert.alert('Error', 'Failed to reset water data');
            }
          },
        },
      ]
    );
  };

  const getWaveHeight = () => {
    const percentage = getProgressPercentage();
    return (percentage / 100) * 200; // Max height of 200px
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading water data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Progress Card */}
      <Card containerStyle={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Daily Water Goal</Text>
          <TouchableOpacity onPress={handleResetDaily}>
            <Ionicons name="refresh-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Water Glass Visual */}
        <View style={styles.glassContainer}>
          <View style={styles.glass}>
            <View 
              style={[
                styles.water, 
                { 
                  height: getWaveHeight(),
                  backgroundColor: getProgressPercentage() >= 100 ? '#4CAF50' : '#2196F3'
                }
              ]} 
            />
            <View style={styles.glassOverlay}>
              <Text style={styles.intakeText}>
                {waterData.totalIntake}ml
              </Text>
              <Text style={styles.goalText}>
                of {waterData.dailyGoal}ml
              </Text>
              <Text style={styles.percentageText}>
                {Math.round(getProgressPercentage())}%
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${getProgressPercentage()}%`,
                backgroundColor: getProgressPercentage() >= 100 ? '#4CAF50' : '#2196F3'
              }
            ]} 
          />
        </View>
        
        <Text style={styles.remainingText}>
          {waterData.dailyGoal - waterData.totalIntake > 0 
            ? `${waterData.dailyGoal - waterData.totalIntake}ml remaining` 
            : 'Goal achieved! 🎉'
          }
        </Text>
      </Card>

      {/* Quick Add Buttons */}
      <Card containerStyle={styles.quickAddCard}>
        <Text style={styles.cardTitle}>Quick Add</Text>
        <View style={styles.quickAmounts}>
          {quickAmounts.map(amount => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.quickButton,
                selectedAmount === amount && styles.selectedButton
              ]}
              onPress={() => {
                setSelectedAmount(amount);
                addWater(amount);
              }}
            >
              <Ionicons 
                name="water" 
                size={20} 
                color={selectedAmount === amount ? '#fff' : '#2196F3'} 
              />
              <Text style={[
                styles.quickButtonText,
                selectedAmount === amount && styles.selectedButtonText
              ]}>
                {amount}ml
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Today's Entries */}
      <Card containerStyle={styles.entriesCard}>
        <Text style={styles.cardTitle}>Today's Entries</Text>
        {waterData.entries.length === 0 ? (
          <View style={styles.noEntriesContainer}>
            <Ionicons name="water-outline" size={50} color="#ccc" />
            <Text style={styles.noEntriesText}>No water logged yet today</Text>
            <Text style={styles.noEntriesSubtext}>Tap a quick add button to get started!</Text>
          </View>
        ) : (
          <View style={styles.entriesList}>
            {waterData.entries.map(entry => (
              <View key={entry.id} style={styles.entryItem}>
                <View style={styles.entryInfo}>
                  <Ionicons name="water" size={20} color="#2196F3" />
                  <Text style={styles.entryAmount}>{entry.amount}ml</Text>
                  <Text style={styles.entryTime}>{entry.time}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeWater(entry.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={16} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Tips Card */}
      <Card containerStyle={styles.tipsCard}>
        <Text style={styles.cardTitle}>💡 Hydration Tips</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tipText}>• Start your day with a glass of water</Text>
          <Text style={styles.tipText}>• Drink water before, during, and after exercise</Text>
          <Text style={styles.tipText}>• Keep a water bottle with you</Text>
          <Text style={styles.tipText}>• Set reminders throughout the day</Text>
          <Text style={styles.tipText}>• Eat water-rich fruits and vegetables</Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  progressCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  glassContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  glass: {
    width: 120,
    height: 200,
    borderWidth: 3,
    borderColor: '#2196F3',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f8f9ff',
  },
  water: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 5,
    opacity: 0.7,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intakeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  goalText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  remainingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  quickAddCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    minWidth: '18%',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: '#2196F3',
  },
  quickButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  selectedButtonText: {
    color: '#fff',
  },
  entriesCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noEntriesContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noEntriesText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },
  noEntriesSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  entriesList: {
    maxHeight: 300,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  entryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  entryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  entryTime: {
    fontSize: 14,
    color: '#666',
    marginLeft: 'auto',
    marginRight: 16,
  },
  removeButton: {
    padding: 8,
  },
  tipsCard: {
    margin: 16,
    marginBottom: 32,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipsList: {
    paddingLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default WaterTracker;