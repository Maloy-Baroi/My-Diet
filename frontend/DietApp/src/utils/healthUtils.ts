import { User } from '../types';

// BMI Calculation
export const calculateBMI = (weight: number, height: number): number => {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const getBMIColor = (bmi: number): string => {
  if (bmi < 18.5) return '#3498db'; // Blue
  if (bmi < 25) return '#27ae60'; // Green
  if (bmi < 30) return '#f39c12'; // Orange
  return '#e74c3c'; // Red
};

// BMR (Basal Metabolic Rate) Calculation using Mifflin-St Jeor Equation
export const calculateBMR = (user: User): number => {
  if (!user.weight || !user.height || !user.date_of_birth) {
    return 0;
  }

  const age = new Date().getFullYear() - new Date(user.date_of_birth).getFullYear();
  
  let bmr: number;
  if (user.gender === 'M') {
    bmr = 10 * user.weight + 6.25 * user.height - 5 * age + 5;
  } else {
    bmr = 10 * user.weight + 6.25 * user.height - 5 * age - 161;
  }
  
  return bmr;
};

// TDEE (Total Daily Energy Expenditure) Calculation
export const calculateTDEE = (user: User): number => {
  const bmr = calculateBMR(user);
  
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extra_active: 1.9,
  };
  
  return bmr * activityMultipliers[user.activity_level];
};

// Daily calorie needs based on goal
export const calculateDailyCalorieNeeds = (user: User): number => {
  const tdee = calculateTDEE(user);
  
  switch (user.goal) {
    case 'lose_weight':
      return tdee - 500; // 1 lb per week loss
    case 'gain_weight':
    case 'muscle_gain':
      return tdee + 300; // Moderate surplus
    case 'maintain_weight':
    case 'health_improvement':
    default:
      return tdee;
  }
};

// Macronutrient distribution
export const calculateMacroDistribution = (calories: number, goal: string) => {
  let proteinRatio: number;
  let fatRatio: number;
  let carbRatio: number;

  switch (goal) {
    case 'lose_weight':
      proteinRatio = 0.35;
      fatRatio = 0.25;
      carbRatio = 0.40;
      break;
    case 'muscle_gain':
      proteinRatio = 0.30;
      fatRatio = 0.25;
      carbRatio = 0.45;
      break;
    case 'gain_weight':
      proteinRatio = 0.25;
      fatRatio = 0.30;
      carbRatio = 0.45;
      break;
    default:
      proteinRatio = 0.25;
      fatRatio = 0.30;
      carbRatio = 0.45;
      break;
  }

  return {
    protein: Math.round((calories * proteinRatio) / 4), // 4 cal per gram
    fat: Math.round((calories * fatRatio) / 9), // 9 cal per gram
    carbs: Math.round((calories * carbRatio) / 4), // 4 cal per gram
  };
};

// Water intake calculation
export const calculateWaterIntake = (weight: number, activityLevel: string): number => {
  // Base water intake: 35ml per kg of body weight
  let baseWater = weight * 35;
  
  // Activity level multiplier
  const activityMultipliers = {
    sedentary: 1.0,
    light: 1.1,
    moderate: 1.2,
    active: 1.3,
    extra_active: 1.4,
  };
  
  return Math.round(baseWater * (activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.0));
};

// Progress calculation
export const calculateWeightProgress = (startWeight: number, currentWeight: number, targetWeight: number) => {
  const totalToLose = Math.abs(startWeight - targetWeight);
  const lostSoFar = Math.abs(startWeight - currentWeight);
  const percentage = totalToLose > 0 ? (lostSoFar / totalToLose) * 100 : 0;
  
  return {
    totalToLose,
    lostSoFar,
    percentage: Math.min(percentage, 100),
    remaining: Math.max(totalToLose - lostSoFar, 0),
  };
};

// Ideal weight calculation (using various formulas)
export const calculateIdealWeight = (height: number, gender: 'M' | 'F' | 'O'): number => {
  // Using Robinson formula
  const heightInInches = height / 2.54;
  
  if (gender === 'M') {
    return 52 + 1.9 * (heightInInches - 60);
  } else {
    return 49 + 1.7 * (heightInInches - 60);
  }
};

// Body fat percentage estimation (using BMI and other factors)
export const estimateBodyFatPercentage = (bmi: number, age: number, gender: 'M' | 'F' | 'O'): number => {
  // Using Deurenberg formula
  let bodyFat: number;
  
  if (gender === 'M') {
    bodyFat = 1.20 * bmi + 0.23 * age - 16.2;
  } else {
    bodyFat = 1.20 * bmi + 0.23 * age - 5.4;
  }
  
  return Math.max(bodyFat, 0);
};
