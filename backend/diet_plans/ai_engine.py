import random
from datetime import date, timedelta
from .models import Food, DietPlan, Meal, MealFood, DietPlanProgress

class DietAIEngine:
    """AI Engine for generating personalized diet plans"""
    
    def __init__(self, user):
        self.user = user
        self.bmr = user.calculate_bmr()
        self.daily_calories = self.calculate_daily_calories()
    
    def calculate_daily_calories(self):
        """Calculate daily calorie needs based on goal"""
        if not self.bmr:
            return 2000  # Default
        
        goal_adjustments = {
            'lose_weight': -500,
            'maintain_weight': 0,
            'gain_weight': 500,
            'muscle_gain': 300,
            'health_improvement': 0,
        }
        
        adjustment = goal_adjustments.get(self.user.goal, 0)
        return max(1200, self.bmr + adjustment)  # Minimum 1200 calories
    
    def filter_foods_by_preferences(self):
        """Filter foods based on user preferences and restrictions"""
        foods = Food.objects.all()
        
        # Filter by dietary restrictions
        if 'vegetarian' in self.user.dietary_restrictions.lower():
            foods = foods.filter(is_vegetarian=True)
        if 'vegan' in self.user.dietary_restrictions.lower():
            foods = foods.filter(is_vegan=True)
        
        # Filter by allergies
        if self.user.allergies:
            allergies = [a.strip().lower() for a in self.user.allergies.split(',')]
            for allergy in allergies:
                foods = foods.exclude(common_allergens__icontains=allergy)
        
        # Filter by disliked foods
        if self.user.disliked_foods:
            disliked = [f.strip().lower() for f in self.user.disliked_foods.split(',')]
            for food in disliked:
                foods = foods.exclude(name__icontains=food)
        
        return foods
    
    def generate_meal_plan(self, meal_type, target_calories):
        """Generate a single meal plan"""
        available_foods = self.filter_foods_by_preferences()
        
        # Meal composition guidelines
        meal_compositions = {
            'breakfast': {'proteins': 0.25, 'carbs': 0.45, 'fats': 0.15, 'fruits': 0.15},
            'lunch': {'proteins': 0.30, 'carbs': 0.40, 'vegetables': 0.20, 'fats': 0.10},
            'dinner': {'proteins': 0.35, 'carbs': 0.30, 'vegetables': 0.25, 'fats': 0.10},
            'snack': {'fruits': 0.50, 'proteins': 0.30, 'fats': 0.20},
            'suhoor': {'proteins': 0.30, 'carbs': 0.40, 'fruits': 0.20, 'fats': 0.10},
            'iftar': {'fruits': 0.30, 'proteins': 0.25, 'carbs': 0.35, 'fats': 0.10},
        }
        
        composition = meal_compositions.get(meal_type, meal_compositions['lunch'])
        selected_foods = []
        
        for category, percentage in composition.items():
            category_calories = target_calories * percentage
            category_foods = available_foods.filter(category=category)
            
            if category_foods.exists():
                food = random.choice(category_foods)
                quantity_needed = (category_calories * 100) / food.calories_per_100g
                selected_foods.append({
                    'food': food,
                    'quantity': min(quantity_needed, 500)  # Max 500g per food item
                })
        
        return selected_foods
    
    def generate_30_day_plan(self, plan_type='regular'):
        """Generate complete 30-day diet plan"""
        # Create diet plan
        diet_plan = DietPlan.objects.create(
            user=self.user,
            name=f"{plan_type.title()} Diet Plan",
            plan_type=plan_type,
            duration_days=30,
            daily_calorie_target=int(self.daily_calories),
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30)
        )
        
        # Create progress tracker
        DietPlanProgress.objects.create(diet_plan=diet_plan)
        
        # Generate meals for 30 days
        meal_types = self.get_meal_types_for_plan(plan_type)
        
        for day in range(1, 31):
            for meal_type, calorie_percentage in meal_types.items():
                meal_calories = self.daily_calories * calorie_percentage
                
                # Create meal
                meal = Meal.objects.create(
                    diet_plan=diet_plan,
                    day_number=day,
                    meal_type=meal_type,
                    name=f"Day {day} {meal_type.title()}",
                    total_calories=meal_calories
                )
                
                # Add foods to meal
                meal_foods = self.generate_meal_plan(meal_type, meal_calories)
                for food_data in meal_foods:
                    MealFood.objects.create(
                        meal=meal,
                        food=food_data['food'],
                        quantity_grams=food_data['quantity']
                    )
        
        return diet_plan
    
    def get_meal_types_for_plan(self, plan_type):
        """Get meal types and calorie distribution based on plan type"""
        if plan_type == 'ramadan':
            return {
                'suhoor': 0.40,
                'iftar': 0.50,
                'snack': 0.10,
            }
        else:
            return {
                'breakfast': 0.25,
                'lunch': 0.35,
                'dinner': 0.30,
                'snack': 0.10,
            }
