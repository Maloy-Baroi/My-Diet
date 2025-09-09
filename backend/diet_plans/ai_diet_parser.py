import re
from datetime import date, timedelta
from django.db import transaction
# from .models import DietPlan, DailyMeal, MealItem, DietPlanProgress, Food

class AIDialPlanParser:
    """Service to parse AI-generated diet plan JSON and create database records"""
    
    def __init__(self):
        self.quantity_patterns = [
            (r'(\d+(?:\.\d+)?)\s*g', 'grams'),
            (r'(\d+(?:\.\d+)?)\s*kg', 'kilograms'),
            (r'(\d+)\s*pc[s]?', 'pieces'),
            (r'(\d+)\s*cup[s]?', 'cups'),
            (r'(\d+)\s*slice[s]?', 'slices'),
            (r'(\d+)\s*tbsp', 'tablespoons'),
            (r'(\d+)\s*tsp', 'teaspoons'),
        ]
    
    def parse_quantity(self, quantity_text):
        """Parse quantity text and return grams and pieces"""
        quantity_grams = None
        quantity_pieces = None
        
        # Convert to lowercase for easier parsing
        text = quantity_text.lower().strip()
        
        for pattern, unit_type in self.quantity_patterns:
            match = re.search(pattern, text)
            if match:
                value = float(match.group(1))
                
                if unit_type == 'grams':
                    quantity_grams = value
                elif unit_type == 'kilograms':
                    quantity_grams = value * 1000
                elif unit_type in ['pieces', 'slices']:
                    quantity_pieces = int(value)
                    # Estimate grams for common items
                    if 'egg' in text:
                        quantity_grams = value * 50  # Average egg ~50g
                    elif 'roti' in text or 'bread' in text:
                        quantity_grams = value * 40  # Average roti ~40g
                    elif 'banana' in text:
                        quantity_grams = value * 120  # Average banana ~120g
                elif unit_type == 'cups':
                    # Rough conversion - varies by ingredient
                    if 'rice' in text:
                        quantity_grams = value * 185  # 1 cup cooked rice ~185g
                    elif 'tea' in text or 'coffee' in text:
                        quantity_grams = value * 240  # 1 cup liquid ~240ml
                    else:
                        quantity_grams = value * 200  # Generic estimate
                elif unit_type == 'tablespoons':
                    quantity_grams = value * 15  # 1 tbsp ~15g
                elif unit_type == 'teaspoons':
                    quantity_grams = value * 5   # 1 tsp ~5g
                
                break
        
        return quantity_grams, quantity_pieces
    
    def extract_food_name(self, food_item_text):
        """Extract clean food name from the AI text"""
        # Split by colon to separate food name from quantity
        if ':' in food_item_text:
            food_name = food_item_text.split(':')[0].strip()
        else:
            # Try to remove quantity from the end
            food_name = re.sub(r'\s*\d+.*$', '', food_item_text).strip()
        
        # Clean up common variations
        food_name = food_name.replace('(', '').replace(')', '')
        food_name = re.sub(r'\s+', ' ', food_name).strip()
        
        return food_name
    
    def find_matching_food(self, food_name):
        """Try to find a matching Food object in the database"""
        try:
            # Try exact match first
            return Food.objects.get(name__iexact=food_name)
        except Food.DoesNotExist:
            try:
                # Try partial match
                return Food.objects.filter(name__icontains=food_name.split()[0]).first()
            except:
                return None
    
    @transaction.atomic
    def create_diet_plan_from_json(self, user, plan_data, plan_name="AI Generated Diet Plan"):
        """Create a complete diet plan from AI JSON data"""
        
        # Create the main diet plan
        diet_plan = DietPlan.objects.create(
            user=user,
            name=plan_name,
            plan_type='ai_generated',
            duration_days=30,
            daily_calorie_target=2000,  # Default, can be calculated later
            start_date=date.today(),
            end_date=date.today() + timedelta(days=29),
            ai_plan_data=plan_data
        )
        
        # Create progress tracker
        DietPlanProgress.objects.create(diet_plan=diet_plan)
        
        # Process each day in the JSON
        for day_key, day_data in plan_data.items():
            # Extract day number from key like "Day 1"
            day_number = int(day_key.split()[1])
            
            # Process each meal type for this day
            for meal_type, meal_items in day_data.items():
                meal_type_lower = meal_type.lower()
                
                # Create DailyMeal record
                daily_meal = DailyMeal.objects.create(
                    diet_plan=diet_plan,
                    day_number=day_number,
                    meal_type=meal_type_lower
                )
                
                # Process each food item in the meal
                for order, food_item_text in enumerate(meal_items):
                    # Extract food name and quantity
                    food_name = self.extract_food_name(food_item_text)
                    quantity_text = food_item_text.split(':')[1].strip() if ':' in food_item_text else food_item_text
                    
                    # Parse quantity
                    quantity_grams, quantity_pieces = self.parse_quantity(quantity_text)
                    
                    # Try to find matching food in database
                    matching_food = self.find_matching_food(food_name)
                    
                    # Create MealItem
                    meal_item = MealItem.objects.create(
                        daily_meal=daily_meal,
                        food_name=food_name,
                        quantity_text=quantity_text,
                        quantity_grams=quantity_grams,
                        quantity_pieces=quantity_pieces,
                        food=matching_food,
                        order=order
                    )
                    
                    # Calculate nutrition if possible
                    if matching_food and quantity_grams:
                        meal_item.calculate_nutrition()
        
        return diet_plan
    
    def get_day_meals(self, diet_plan, day_number):
        """Get all meals for a specific day"""
        return DailyMeal.objects.filter(
            diet_plan=diet_plan,
            day_number=day_number
        ).prefetch_related('meal_items')
    
    def get_meal_items_with_nutrition(self, daily_meal):
        """Get meal items with calculated nutrition"""
        items = []
        total_calories = 0
        total_protein = 0
        total_carbs = 0
        total_fat = 0
        
        for item in daily_meal.meal_items.all():
            item_data = {
                'food_name': item.food_name,
                'quantity_text': item.quantity_text,
                'calories': item.calculated_calories or 0,
                'protein': item.calculated_protein or 0,
                'carbs': item.calculated_carbs or 0,
                'fat': item.calculated_fat or 0,
            }
            items.append(item_data)
            
            total_calories += item_data['calories']
            total_protein += item_data['protein']
            total_carbs += item_data['carbs']
            total_fat += item_data['fat']
        
        return {
            'items': items,
            'total_calories': total_calories,
            'total_protein': total_protein,
            'total_carbs': total_carbs,
            'total_fat': total_fat,
        }
