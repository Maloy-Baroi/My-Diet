import apiService from './apiService';
import { 
  NutritionGoal, 
  NutritionTracking, 
  PaginatedResponse 
} from '../types';

class NutritionService {
  // Nutrition goals
  async getNutritionGoals(): Promise<PaginatedResponse<NutritionGoal>> {
    try {
      return await apiService.get<PaginatedResponse<NutritionGoal>>('/nutrition-goals/');
    } catch (error) {
      throw error;
    }
  }

  async createNutritionGoal(goalData: Partial<NutritionGoal>): Promise<NutritionGoal> {
    try {
      return await apiService.post<NutritionGoal>('/nutrition-goals/', goalData);
    } catch (error) {
      throw error;
    }
  }

  async updateNutritionGoal(id: number, goalData: Partial<NutritionGoal>): Promise<NutritionGoal> {
    try {
      return await apiService.patch<NutritionGoal>(`/nutrition-goals/${id}/`, goalData);
    } catch (error) {
      throw error;
    }
  }

  async deleteNutritionGoal(id: number): Promise<void> {
    try {
      await apiService.delete(`/nutrition-goals/${id}/`);
    } catch (error) {
      throw error;
    }
  }

  // Nutrition tracking
  async getNutritionTracking(date?: string): Promise<PaginatedResponse<NutritionTracking>> {
    try {
      const params = date ? { date } : {};
      return await apiService.get<PaginatedResponse<NutritionTracking>>('/nutrition-tracking/', params);
    } catch (error) {
      throw error;
    }
  }

  async addNutritionTracking(trackingData: Partial<NutritionTracking>): Promise<NutritionTracking> {
    try {
      return await apiService.post<NutritionTracking>('/nutrition-tracking/', trackingData);
    } catch (error) {
      throw error;
    }
  }

  async updateNutritionTracking(id: number, trackingData: Partial<NutritionTracking>): Promise<NutritionTracking> {
    try {
      return await apiService.patch<NutritionTracking>(`/nutrition-tracking/${id}/`, trackingData);
    } catch (error) {
      throw error;
    }
  }

  // Get today's nutrition
  async getTodayNutrition(): Promise<NutritionTracking> {
    try {
      return await apiService.get<NutritionTracking>('/nutrition-tracking/today/');
    } catch (error) {
      throw error;
    }
  }

  // Get nutrition analytics
  async getNutritionAnalytics(period: '7d' | '30d' | '90d'): Promise<any> {
    try {
      return await apiService.get(`/nutrition-tracking/analytics/`, { period });
    } catch (error) {
      throw error;
    }
  }

  // Water tracking
  async addWaterIntake(amount: number): Promise<any> {
    try {
      return await apiService.post('/nutrition-tracking/water/', { amount });
    } catch (error) {
      throw error;
    }
  }

  async getWaterIntake(date?: string): Promise<any> {
    try {
      const params = date ? { date } : {};
      return await apiService.get('/nutrition-tracking/water/', params);
    } catch (error) {
      throw error;
    }
  }

  // Macro distribution
  async getMacroDistribution(period: '7d' | '30d' | '90d'): Promise<any> {
    try {
      return await apiService.get('/nutrition-tracking/macros/', { period });
    } catch (error) {
      throw error;
    }
  }

  // Calorie prediction
  async getCaloriePrediction(): Promise<any> {
    try {
      return await apiService.get('/nutrition-tracking/prediction/');
    } catch (error) {
      throw error;
    }
  }
}

export const nutritionService = new NutritionService();
export default nutritionService;
