import { useState, useEffect } from 'react';
import { 
  DailyWaterData,
  getTodayWaterData,
  addWaterEntry as addWaterEntryService,
  removeWaterEntry as removeWaterEntryService,
  resetDailyWaterData,
  getWaterProgressPercentage
} from '../services/waterTrackingService';

export const useWaterTracking = () => {
  const [waterData, setWaterData] = useState<DailyWaterData>({
    date: '',
    entries: [],
    totalIntake: 0,
    dailyGoal: 4000,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load water data
  const loadWaterData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodayWaterData();
      setWaterData(data);
    } catch (err) {
      console.error('Error loading water data:', err);
      setError('Failed to load water tracking data');
    } finally {
      setLoading(false);
    }
  };

  // Add water entry
  const addWaterEntry = async (amount: number) => {
    try {
      setError(null);
      const updatedData = await addWaterEntryService(amount);
      setWaterData(updatedData);
      return updatedData;
    } catch (err) {
      console.error('Error adding water entry:', err);
      setError('Failed to log water intake');
      throw err;
    }
  };

  // Remove water entry
  const removeWaterEntry = async (entryId: string) => {
    try {
      setError(null);
      const updatedData = await removeWaterEntryService(entryId);
      setWaterData(updatedData);
      return updatedData;
    } catch (err) {
      console.error('Error removing water entry:', err);
      setError('Failed to remove water entry');
      throw err;
    }
  };

  // Reset daily data
  const resetDaily = async () => {
    try {
      setError(null);
      const resetData = await resetDailyWaterData();
      setWaterData(resetData);
      return resetData;
    } catch (err) {
      console.error('Error resetting water data:', err);
      setError('Failed to reset water data');
      throw err;
    }
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    return getWaterProgressPercentage(waterData.totalIntake, waterData.dailyGoal);
  };

  // Check if goal is reached
  const isGoalReached = () => {
    return waterData.totalIntake >= waterData.dailyGoal;
  };

  // Get remaining amount to reach goal
  const getRemainingAmount = () => {
    return Math.max(waterData.dailyGoal - waterData.totalIntake, 0);
  };

  // Load data on mount
  useEffect(() => {
    loadWaterData();
  }, []);

  return {
    waterData,
    loading,
    error,
    loadWaterData,
    addWaterEntry,
    removeWaterEntry,
    resetDaily,
    getProgressPercentage,
    isGoalReached,
    getRemainingAmount,
  };
};
