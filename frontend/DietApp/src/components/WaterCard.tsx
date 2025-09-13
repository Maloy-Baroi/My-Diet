import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from 'react-native-elements';
import { useWaterTracking } from '../hooks/useWaterTracking';

interface WaterCardProps {
  onPress?: () => void;
  compact?: boolean;
}

const WaterCard: React.FC<WaterCardProps> = ({ onPress, compact = false }) => {
  const { waterData, getProgressPercentage, isGoalReached, getRemainingAmount, loading } = useWaterTracking();

  if (loading) {
    return (
      <Card containerStyle={[styles.card, compact && styles.compactCard]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Card>
    );
  }

  const progressPercentage = getProgressPercentage();
  const remaining = getRemainingAmount();
  const goalReached = isGoalReached();

  if (compact) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card containerStyle={styles.compactCard}>
          <View style={styles.compactHeader}>
            <View style={styles.compactIcon}>
              <Ionicons name="water" size={20} color="#2196F3" />
            </View>
            <View style={styles.compactInfo}>
              <Text style={styles.compactTitle}>Water Intake</Text>
              <Text style={styles.compactValue}>
                {waterData.totalIntake}ml / {waterData.dailyGoal}ml
              </Text>
            </View>
            <View style={styles.compactProgress}>
              <Text style={[styles.compactPercentage, goalReached && styles.goalReachedText]}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progressPercentage}%`,
                  backgroundColor: goalReached ? '#4CAF50' : '#2196F3'
                }
              ]} 
            />
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card containerStyle={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="water" size={24} color="#2196F3" />
            <Text style={styles.title}>Water Intake</Text>
          </View>
          <TouchableOpacity onPress={onPress}>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.statsContainer}>
            
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{waterData.dailyGoal}ml</Text>
              <Text style={styles.statLabel}>Goal</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, goalReached && styles.goalReachedText]}>
                {Math.round(progressPercentage)}%
              </Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progressPercentage}%`,
                  backgroundColor: goalReached ? '#4CAF50' : '#2196F3'
                }
              ]} 
            />
          </View>

          <Text style={styles.statusText}>
            {goalReached 
              ? '🎉 Daily goal achieved!' 
              : `${remaining}ml remaining to reach goal`
            }
          </Text>
          
          {waterData.entries.length > 0 && (
            <Text style={styles.entriesText}>
              {waterData.entries.length} {waterData.entries.length === 1 ? 'entry' : 'entries'} today
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    margin: 16,
  },
  compactCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    margin: 8,
    paddingVertical: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  content: {
    gap: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  entriesText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
  },
  goalReachedText: {
    color: '#4CAF50',
  },
  // Compact card styles
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  compactValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  compactProgress: {
    alignItems: 'center',
  },
  compactPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});

export default WaterCard;
