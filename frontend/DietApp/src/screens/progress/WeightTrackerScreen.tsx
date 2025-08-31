import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WeightTrackerScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight Tracker</Text>
      <Text style={styles.subtitle}>Log and track your weight progress</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
});

export default WeightTrackerScreen;
