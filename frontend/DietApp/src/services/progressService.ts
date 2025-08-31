import apiService from './apiService';
import { 
  WeightLog, 
  CalorieLog, 
  Achievement, 
  PaginatedResponse 
} from '../types';

class ProgressService {
  // Weight tracking
  async getWeightLogs(): Promise<PaginatedResponse<WeightLog>> {
    try {
      return await apiService.get<PaginatedResponse<WeightLog>>('/weight-logs/');
    } catch (error) {
      throw error;
    }
  }

  async addWeightLog(weightData: Partial<WeightLog>): Promise<WeightLog> {
    try {
      return await apiService.post<WeightLog>('/weight-logs/', weightData);
    } catch (error) {
      throw error;
    }
  }

  async updateWeightLog(id: number, weightData: Partial<WeightLog>): Promise<WeightLog> {
    try {
      return await apiService.patch<WeightLog>(`/weight-logs/${id}/`, weightData);
    } catch (error) {
      throw error;
    }
  }

  async deleteWeightLog(id: number): Promise<void> {
    try {
      await apiService.delete(`/weight-logs/${id}/`);
    } catch (error) {
      throw error;
    }
  }

  // Calorie tracking
  async getCalorieLogs(): Promise<PaginatedResponse<CalorieLog>> {
    try {
      return await apiService.get<PaginatedResponse<CalorieLog>>('/calorie-logs/');
    } catch (error) {
      throw error;
    }
  }

  async addCalorieLog(calorieData: Partial<CalorieLog>): Promise<CalorieLog> {
    try {
      return await apiService.post<CalorieLog>('/calorie-logs/', calorieData);
    } catch (error) {
      throw error;
    }
  }

  async updateCalorieLog(id: number, calorieData: Partial<CalorieLog>): Promise<CalorieLog> {
    try {
      return await apiService.patch<CalorieLog>(`/calorie-logs/${id}/`, calorieData);
    } catch (error) {
      throw error;
    }
  }

  // Achievements
  async getAchievements(): Promise<PaginatedResponse<Achievement>> {
    try {
      return await apiService.get<PaginatedResponse<Achievement>>('/achievements/');
    } catch (error) {
      throw error;
    }
  }

  // Progress analytics
  async getWeightProgress(period: '7d' | '30d' | '90d' | '1y'): Promise<any> {
    try {
      return await apiService.get(`/weight-logs/progress/`, { period });
    } catch (error) {
      throw error;
    }
  }

  async getCalorieProgress(period: '7d' | '30d' | '90d' | '1y'): Promise<any> {
    try {
      return await apiService.get(`/calorie-logs/progress/`, { period });
    } catch (error) {
      throw error;
    }
  }

  // Goal tracking
  async getGoalProgress(): Promise<any> {
    try {
      return await apiService.get('/progress/goals/');
    } catch (error) {
      throw error;
    }
  }
}

export const progressService = new ProgressService();
export default progressService;
