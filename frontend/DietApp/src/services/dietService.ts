import apiService from './apiService';
import aiDietService, { UserDietProfile, ProcessedDietPlan } from './aiDietService';
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
      return await apiService.get<PaginatedResponse<DietPlan>>('/diet/');
    } catch (error) {
      throw error;
    }
  }

  // Get specific diet plan
  async getDietPlan(id: number): Promise<DietPlan> {
    try {
      return await apiService.get<DietPlan>(`/diet/${id}/`);
    } catch (error) {
      throw error;
    }
  }

  // Create new diet plan
  async createDietPlan(dietPlanData: Partial<DietPlan>): Promise<DietPlan> {
    try {
      return await apiService.post<DietPlan>('/diet/', dietPlanData);
    } catch (error) {
      throw error;
    }
  }

  // Update diet plan
  async updateDietPlan(id: number, dietPlanData: Partial<DietPlan>): Promise<DietPlan> {
    try {
      return await apiService.patch<DietPlan>(`/diet/${id}/`, dietPlanData);
    } catch (error) {
      throw error;
    }
  }

  // Delete diet plan
  async deleteDietPlan(id: number): Promise<void> {
    try {
      await apiService.delete(`/diet/${id}/`);
    } catch (error) {
      throw error;
    }
  }

  // Generate AI diet plan (legacy method - will be deprecated)
  async generateAIDietPlanLegacy(preferences: any): Promise<DietPlan> {
    try {
      return await apiService.post<DietPlan>('/diet/generate/', preferences);
    } catch (error) {
      throw error;
    }
  }

  // Generate diet plan using your Django backend
  async generateDietPlan(mealType: 'Regular' | 'Ramadan', goal: 'weight_loss' | 'muscle_gain' | 'maintenance'): Promise<{
    message: string;
    meal_plan_id: number;
    start_date: string;
    end_date: string;
    meal_type: string;
  }> {
    try {
      return await apiService.post('/diet/generate/', {
        meal_type: mealType,
        goal: goal,
      });
    } catch (error) {
      throw error;
    }
  }

  // Get generated meal plan details
  async getGeneratedMealPlan(mealPlanId: number): Promise<{
    id: number;
    daily_plans: Array<{
      day: number;
      date: string;
      breakfast: string;
      lunch: string;
      dinner: string;
    }>;
    start_date: string;
    end_date: string;
    meal_type: string;
  }> {
    try {
      return await apiService.get(`/diet/generate/${mealPlanId}/`);
    } catch (error) {
      throw error;
    }
  }

  // Get recommended meals
  async getRecommendedMeals(dietPlanId: number, date: string): Promise<Meal[]> {
    try {
      return await apiService.get<Meal[]>(`/diet/${dietPlanId}/recommended_meals/`, {
        date
      });
    } catch (error) {
      throw error;
    }
  }

  // Get meal suggestions
  async getMealSuggestions(preferences: any): Promise<Meal[]> {
    try {
      return await apiService.post<Meal[]>('/diet/meal_suggestions/', preferences);
    } catch (error) {
      throw error;
    }
  }

  // Generate AI diet plan using TypeScript service
  async generateAIDietPlan(userProfile: UserDietProfile): Promise<ProcessedDietPlan> {
    try {
      // Generate diet plan using AI service
      const aiDietPlan = await aiDietService.generateDietPlan(userProfile);

      // Process the AI response into the format expected by backend
      const startDate = new Date();
      const processedPlan = aiDietService.processDietPlan(
        aiDietPlan,
        startDate,
        'Regular',
        userProfile.goal
      );

      return processedPlan;
    } catch (error) {
      throw error;
    }
  }

  // Save AI-generated diet plan to backend
  async saveAIDietPlan(processedPlan: ProcessedDietPlan): Promise<{
    message: string;
    meal_plan_id: number;
    start_date: string;
    end_date: string;
    meal_type: string;
  }> {
    try {
      return await apiService.post('/diet/save-ai-plan/', processedPlan);
    } catch (error) {
      throw error;
    }
  }

  // Combined method: Generate and save AI diet plan
  async generateAndSaveAIDietPlan(userProfile: UserDietProfile): Promise<{
    message: string;
    meal_plan_id: number;
    start_date: string;
    end_date: string;
    meal_type: string;
  }> {
    try {
      // Generate the AI diet plan
      const processedPlan = await this.generateAIDietPlan(userProfile);

      // Save it to the backend
      const result = await this.saveAIDietPlan(processedPlan);

      return result;
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
