import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WaterEntry {
  id: string;
  amount: number;
  time: string;
  timestamp: number;
}

export interface DailyWaterData {
  date: string;
  entries: WaterEntry[];
  totalIntake: number;
  dailyGoal: number;
}

const WATER_STORAGE_KEY = 'water_tracking_data';

// Get today's date in YYYY-MM-DD format
export const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Get cached water data for today
export const getTodayWaterData = async (): Promise<DailyWaterData> => {
  try {
    const todayDate = getTodayDateString();
    const storedData = await AsyncStorage.getItem(WATER_STORAGE_KEY);
    
    if (storedData) {
      const parsedData: DailyWaterData = JSON.parse(storedData);
      
      // If stored data is from today, return it
      if (parsedData.date === todayDate) {
        return parsedData;
      }
    }
    
    // Return empty data for today if no data exists or data is from previous day
    return {
      date: todayDate,
      entries: [],
      totalIntake: 0,
      dailyGoal: 4000, // Default daily goal
    };
  } catch (error) {
    console.error('Error getting today water data:', error);
    return {
      date: getTodayDateString(),
      entries: [],
      totalIntake: 0,
      dailyGoal: 4000,
    };
  }
};

// Save water data for today
export const saveTodayWaterData = async (data: DailyWaterData): Promise<void> => {
  try {
    await AsyncStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving water data:', error);
    throw error;
  }
};

// Add a water entry
export const addWaterEntry = async (amount: number): Promise<DailyWaterData> => {
  try {
    const currentData = await getTodayWaterData();
    
    const newEntry: WaterEntry = {
      id: Date.now().toString(),
      amount,
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: Date.now(),
    };

    const updatedData: DailyWaterData = {
      ...currentData,
      entries: [newEntry, ...currentData.entries],
      totalIntake: currentData.totalIntake + amount,
    };

    await saveTodayWaterData(updatedData);
    return updatedData;
  } catch (error) {
    console.error('Error adding water entry:', error);
    throw error;
  }
};

// Remove a water entry
export const removeWaterEntry = async (entryId: string): Promise<DailyWaterData> => {
  try {
    const currentData = await getTodayWaterData();
    
    const entryToRemove = currentData.entries.find(entry => entry.id === entryId);
    if (!entryToRemove) {
      throw new Error('Entry not found');
    }

    const updatedEntries = currentData.entries.filter(entry => entry.id !== entryId);
    const updatedData: DailyWaterData = {
      ...currentData,
      entries: updatedEntries,
      totalIntake: currentData.totalIntake - entryToRemove.amount,
    };

    await saveTodayWaterData(updatedData);
    return updatedData;
  } catch (error) {
    console.error('Error removing water entry:', error);
    throw error;
  }
};

// Reset daily water data
export const resetDailyWaterData = async (): Promise<DailyWaterData> => {
  try {
    const emptyData: DailyWaterData = {
      date: getTodayDateString(),
      entries: [],
      totalIntake: 0,
      dailyGoal: 4000,
    };

    await saveTodayWaterData(emptyData);
    return emptyData;
  } catch (error) {
    console.error('Error resetting water data:', error);
    throw error;
  }
};

// Get water progress percentage
export const getWaterProgressPercentage = (totalIntake: number, dailyGoal: number): number => {
  return Math.min((totalIntake / dailyGoal) * 100, 100);
};

// Update daily goal
export const updateDailyGoal = async (newGoal: number): Promise<DailyWaterData> => {
  try {
    const currentData = await getTodayWaterData();
    const updatedData: DailyWaterData = {
      ...currentData,
      dailyGoal: newGoal,
    };

    await saveTodayWaterData(updatedData);
    return updatedData;
  } catch (error) {
    console.error('Error updating daily goal:', error);
    throw error;
  }
};
