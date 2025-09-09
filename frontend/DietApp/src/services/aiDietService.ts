import { GoogleGenerativeAI } from '@google/generative-ai';

// Types for AI diet generation
export interface UserDietProfile {
  age: number;
  gender: 'M' | 'F' | 'O';
  height_cm: number;
  weight_kg: number;
  activity_level: 'sedentary' | 'lightly active' | 'moderately active' | 'very active';
  goal: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintain_weight';
  medical_conditions: string[];
  food_restrictions: string[];
  food_preferences: string[];
}

export interface DayMeals {
  Breakfast: string[];
  Lunch: string[];
  Dinner: string[];
  Snacks: string[];
}

export interface AIDietPlan {
  [key: string]: DayMeals; // "Day 1", "Day 2", etc.
}

export interface ProcessedDietPlan {
  days: Array<{
    day: number;
    date: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  }>;
  start_date: string;
  end_date: string;
  meal_type: string;
  goal: string;
}

class AIDietService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    // You should store the API key in environment variables or secure storage
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || 'AIzaSyD_9oqsnMEgT_9Vx2-BH0LKcAwTdlC8jmE';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Generate AI diet plan using Google Gemini with retry logic
   */
  async generateDietPlan(userProfile: UserDietProfile): Promise<AIDietPlan> {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const prompt = this.createPrompt(userProfile);

        console.log(`Generating AI diet plan... (Attempt ${attempt}/${maxRetries})`);

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('AI response received, parsing...');

        // Clean and parse the JSON response
        const cleanResponse = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
        const dietPlan: AIDietPlan = JSON.parse(cleanResponse);

        return dietPlan;
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);

        if (error instanceof Error && error.message.includes('overloaded')) {
          if (attempt < maxRetries) {
            console.log(`API overloaded, retrying in ${retryDelay}ms...`);
            await this.delay(retryDelay * attempt); // Exponential backoff
            continue;
          } else {
            // All retries failed, use fallback
            console.log('All API attempts failed, using fallback diet plan...');
            return this.getFallbackDietPlan(userProfile);
          }
        } else {
          // For other errors, don't retry
          throw new Error(`Failed to generate diet plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // This should never be reached, but just in case
    throw new Error('Failed to generate diet plan after all attempts');
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fallback diet plan when API is unavailable
   */
  private getFallbackDietPlan(userProfile: UserDietProfile): AIDietPlan {
    console.log('Generating fallback diet plan...');

    const breakfastOptions = [
      ['Oatmeal: 50g', 'Banana: 1 medium', 'Almonds: 15g'],
      ['Greek yogurt: 150g', 'Berries: 100g', 'Honey: 1 tbsp'],
      ['Whole grain toast: 2 slices', 'Avocado: 1/2 medium', 'Egg: 1 boiled'],
      ['Smoothie with spinach: 1 cup', 'Protein powder: 1 scoop', 'Apple: 1 medium'],
      ['Brown rice: 60g', 'Lentils: 50g', 'Vegetables: 100g'],
      ['Quinoa: 50g', 'Mixed nuts: 20g', 'Orange: 1 medium'],
      ['Chia pudding: 150g', 'Mango: 100g', 'Coconut flakes: 10g']
    ];

    const lunchOptions = [
      ['Grilled chicken: 120g', 'Brown rice: 80g', 'Mixed vegetables: 150g'],
      ['Fish curry: 150g', 'Quinoa: 70g', 'Salad: 100g'],
      ['Lentil soup: 200ml', 'Whole grain bread: 2 slices', 'Cucumber: 100g'],
      ['Turkey wrap: 1 large', 'Hummus: 2 tbsp', 'Carrot sticks: 100g'],
      ['Vegetable stir-fry: 200g', 'Tofu: 100g', 'Brown rice: 80g'],
      ['Grilled salmon: 120g', 'Sweet potato: 150g', 'Green beans: 100g'],
      ['Chicken salad: 180g', 'Mixed greens: 100g', 'Olive oil: 1 tbsp']
    ];

    const dinnerOptions = [
      ['Baked fish: 120g', 'Roasted vegetables: 200g', 'Quinoa: 60g'],
      ['Chicken curry: 150g', 'Brown rice: 70g', 'Yogurt: 100g'],
      ['Vegetable soup: 250ml', 'Grilled chicken: 100g', 'Salad: 100g'],
      ['Beef stir-fry: 120g', 'Mixed vegetables: 150g', 'Brown rice: 60g'],
      ['Baked chicken: 120g', 'Sweet potato: 150g', 'Broccoli: 100g'],
      ['Fish curry: 150g', 'Cauliflower rice: 100g', 'Green salad: 100g'],
      ['Lentil curry: 200g', 'Whole grain roti: 2 pieces', 'Cucumber raita: 100g']
    ];

    const snackOptions = [
      ['Mixed nuts: 25g', 'Apple: 1 small'],
      ['Greek yogurt: 100g', 'Berries: 50g'],
      ['Hummus: 2 tbsp', 'Carrot sticks: 100g'],
      ['Banana: 1 medium', 'Peanut butter: 1 tbsp'],
      ['Almonds: 20g', 'Orange: 1 small'],
      ['Cottage cheese: 100g', 'Cucumber: 50g'],
      ['Trail mix: 30g', 'Water: 1 glass']
    ];

    const fallbackPlan: AIDietPlan = {};

    for (let day = 1; day <= 30; day++) {
      fallbackPlan[`Day ${day}`] = {
        Breakfast: breakfastOptions[day % breakfastOptions.length],
        Lunch: lunchOptions[day % lunchOptions.length],
        Dinner: dinnerOptions[day % dinnerOptions.length],
        Snacks: snackOptions[day % snackOptions.length]
      };
    }

    return fallbackPlan;
  }

  /**
   * Process AI diet plan into format expected by backend
   */
  processDietPlan(aiDietPlan: AIDietPlan, startDate: Date, mealType: string, goal: string): ProcessedDietPlan {
    const days: Array<{
      day: number;
      date: string;
      breakfast: string;
      lunch: string;
      dinner: string;
      snacks: string;
    }> = [];

    let dayNumber = 1;
    for (const dayKey in aiDietPlan) {
      if (dayKey.startsWith('Day ')) {
        const dayMeals = aiDietPlan[dayKey];
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (dayNumber - 1));

        days.push({
          day: dayNumber,
          date: currentDate.toISOString().split('T')[0],
          breakfast: dayMeals.Breakfast.join(', '),
          lunch: dayMeals.Lunch.join(', '),
          dinner: dayMeals.Dinner.join(', '),
          snacks: dayMeals.Snacks.join(', '),
        });

        dayNumber++;
      }
    }

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 29); // 30 days total

    return {
      days,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      meal_type: mealType,
      goal: goal,
    };
  }

  /**
   * Create prompt for AI diet generation
   */
  private createPrompt(userProfile: UserDietProfile): string {
    return `
Given the following user data:
Age: ${userProfile.age}
Gender: ${userProfile.gender}
Height: ${userProfile.height_cm} cm
Weight: ${userProfile.weight_kg} kg
Activity Level: ${userProfile.activity_level}
Goal: ${userProfile.goal}
Medical Conditions: ${userProfile.medical_conditions.join(', ') || 'None'}
Food Restrictions: ${userProfile.food_restrictions.join(', ') || 'None'}
Food Preferences: ${userProfile.food_preferences.join(', ') || 'None'}

Generate a 30-day diet plan in the exact format of a JSON object. The JSON should have 'Day 1' through 'Day 30' as keys. Each day should be an object with keys 'Breakfast', 'Lunch', 'Dinner', and 'Snacks'. Each meal should be an array of strings, with each string representing a food item and its quantity (e.g., 'Rice (brown, raw): 60g'). 

The diet plan must be:
- Nutritionally balanced and suitable for the user's goals
- Consider medical conditions and food restrictions
- Include Bangladeshi cuisine where appropriate
- Provide variety across the 30 days
- Include proper portion sizes

The output must be a valid JSON object with no additional text before or after.

Example format:
{
  "Day 1": {
    "Breakfast": ["Oatmeal: 50g", "Banana: 1 medium"],
    "Lunch": ["Brown rice: 80g", "Chicken breast: 100g"],
    "Dinner": ["Quinoa: 60g", "Salmon: 120g"],
    "Snacks": ["Almonds: 20g", "Apple: 1 medium"]
  },
  "Day 2": {
    ...
  }
}
`.trim();
  }

  /**
   * Get default user profile (you might want to get this from user storage or API)
   */
  getDefaultUserProfile(): UserDietProfile {
    return {
      age: 25,
      gender: 'M',
      height_cm: 170,
      weight_kg: 70,
      activity_level: 'moderately active',
      goal: 'weight_loss',
      medical_conditions: [],
      food_restrictions: [],
      food_preferences: [],
    };
  }
}

export const aiDietService = new AIDietService();
export default aiDietService;
