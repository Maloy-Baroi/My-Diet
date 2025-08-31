import apiService from './apiService';
import { 
  DietPlan, 
  Food, 
  Meal, 
  PaginatedResponse 
} from '../types';

class DietPlanService {
  // Get all diet plans for user
  async getDietPlans(): Promise<PaginatedResponse<DietPlan>> {
    try {
      return await apiService.get<PaginatedResponse<DietPlan>>('/diet-plans/');
    } catch (error) {
      throw error;
    }
  }

  // Get specific diet plan
  async getDietPlan(id: number): Promise<DietPlan> {
    try {
      return await apiService.get<DietPlan>(`/diet-plans/${id}/`);
    } catch (error) {
      throw error;
    }
  }

  // Create new diet plan
  async createDietPlan(dietPlanData: Partial<DietPlan>): Promise<DietPlan> {
    try {
      return await apiService.post<DietPlan>('/diet-plans/', dietPlanData);
    } catch (error) {
      throw error;
    }
  }

  // Update diet plan
  async updateDietPlan(id: number, dietPlanData: Partial<DietPlan>): Promise<DietPlan> {
    try {
      return await apiService.patch<DietPlan>(`/diet-plans/${id}/`, dietPlanData);
    } catch (error) {
      throw error;
    }
  }

  // Delete diet plan
  async deleteDietPlan(id: number): Promise<void> {
    try {
      await apiService.delete(`/diet-plans/${id}/`);
    } catch (error) {
      throw error;
    }
  }

  // Generate AI diet plan
  async generateAIDietPlan(preferences: any): Promise<DietPlan> {
    try {
      return await apiService.post<DietPlan>('/diet-plans/generate_ai_plan/', preferences);
    } catch (error) {
      throw error;
    }
  }

  // Get recommended meals
  async getRecommendedMeals(dietPlanId: number, date: string): Promise<Meal[]> {
    try {
      return await apiService.get<Meal[]>(`/diet-plans/${dietPlanId}/recommended_meals/`, {
        date
      });
    } catch (error) {
      throw error;
    }
  }

  // Get meal suggestions
  async getMealSuggestions(preferences: any): Promise<Meal[]> {
    try {
      return await apiService.post<Meal[]>('/diet-plans/meal_suggestions/', preferences);
    } catch (error) {
      throw error;
    }
  }
}

class FoodService {
  // Get all foods
  async getFoods(search?: string, category?: string): Promise<PaginatedResponse<Food>> {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (category) params.category = category;
      
      return await apiService.get<PaginatedResponse<Food>>('/foods/', params);
    } catch (error) {
      throw error;
    }
  }

  // Get specific food
  async getFood(id: number): Promise<Food> {
    try {
      return await apiService.get<Food>(`/foods/${id}/`);
    } catch (error) {
      throw error;
    }
  }

  // Search foods by barcode
  async searchByBarcode(barcode: string): Promise<Food> {
    try {
      return await apiService.get<Food>(`/foods/search_barcode/`, { barcode });
    } catch (error) {
      throw error;
    }
  }

  // Get nutrition info for food
  async getNutritionInfo(foodId: number, quantity: number): Promise<any> {
    try {
      return await apiService.get(`/foods/${foodId}/nutrition_info/`, { quantity });
    } catch (error) {
      throw error;
    }
  }

  // Get food categories
  async getFoodCategories(): Promise<string[]> {
    try {
      return await apiService.get<string[]>('/foods/categories/');
    } catch (error) {
      throw error;
    }
  }
}

export const dietPlanService = new DietPlanService();
export const foodService = new FoodService();
export { DietPlanService, FoodService };
