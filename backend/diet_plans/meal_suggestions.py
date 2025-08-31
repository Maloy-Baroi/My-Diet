from .models import Food
import random


class MealSuggestionEngine:
    """Generate meal suggestions and alternatives"""
    
    def __init__(self, user):
        self.user = user
    
    def suggest_meal_alternatives(self, original_meal):
        """Suggest alternatives for a specific meal"""
        alternatives = {}
        
        for meal_food in original_meal.meal_foods.all():
            food_alternatives = self.find_food_alternatives(meal_food.food)
            alternatives[meal_food.food.name] = food_alternatives
        
        return alternatives

    def find_food_alternatives(self, original_food):
        """Find suitable alternatives for a specific food"""
        # Find foods in same category with similar calories
        similar_foods = Food.objects.filter(
            category=original_food.category
        ).exclude(id=original_food.id)
        
        # Apply user dietary restrictions
        if 'vegetarian' in self.user.dietary_restrictions.lower():
            similar_foods = similar_foods.filter(is_vegetarian=True)
        if 'vegan' in self.user.dietary_restrictions.lower():
            similar_foods = similar_foods.filter(is_vegan=True)
        
        # Filter by allergies
        if self.user.allergies:
            allergies = [a.strip().lower() for a in self.user.allergies.split(',')]
            for allergy in allergies:
                similar_foods = similar_foods.exclude(common_allergens__icontains=allergy)
        
        # Filter by disliked foods
        if self.user.disliked_foods:
            disliked = [f.strip().lower() for f in self.user.disliked_foods.split(',')]
            for food in disliked:
                similar_foods = similar_foods.exclude(name__icontains=food)
        
        # Sort by calorie similarity
        calorie_range = 50  # +/- 50 calories
        alternatives = similar_foods.filter(
            calories_per_100g__gte=original_food.calories_per_100g - calorie_range,
            calories_per_100g__lte=original_food.calories_per_100g + calorie_range
        )
        
        # Return top 3 alternatives
        return list(alternatives[:3])
    
    def suggest_quick_meals(self, meal_type, target_calories):
        """Suggest quick and easy meals for busy users"""
        quick_meal_templates = {
            'breakfast': [
                {'name': 'Oatmeal Bowl', 'prep_time': 5, 'foods': ['oats', 'banana', 'milk']},
                {'name': 'Egg Toast', 'prep_time': 10, 'foods': ['eggs', 'bread', 'vegetables']},
                {'name': 'Smoothie', 'prep_time': 5, 'foods': ['fruits', 'yogurt', 'milk']},
            ],
            'lunch': [
                {'name': 'Rice Bowl', 'prep_time': 15, 'foods': ['rice', 'lentils', 'vegetables']},
                {'name': 'Chicken Salad', 'prep_time': 10, 'foods': ['chicken', 'vegetables', 'fruits']},
                {'name': 'Sandwich', 'prep_time': 8, 'foods': ['bread', 'proteins', 'vegetables']},
            ],
            'dinner': [
                {'name': 'Fish Curry', 'prep_time': 25, 'foods': ['fish', 'rice', 'vegetables']},
                {'name': 'Chicken Rice', 'prep_time': 30, 'foods': ['chicken', 'rice', 'vegetables']},
                {'name': 'Vegetable Curry', 'prep_time': 20, 'foods': ['vegetables', 'rice', 'lentils']},
            ]
        }
        
        templates = quick_meal_templates.get(meal_type, [])
        suggestions = []
        
        for template in templates:
            meal_suggestion = {
                'name': template['name'],
                'prep_time': template['prep_time'],
                'estimated_calories': target_calories,
                'foods': self.map_template_to_foods(template['foods'], target_calories)
            }
            suggestions.append(meal_suggestion)
        
        return suggestions
    
    def map_template_to_foods(self, food_categories, target_calories):
        """Map food categories to actual foods from database"""
        mapped_foods = []
        calories_per_category = target_calories / len(food_categories)
        
        for category_hint in food_categories:
            # Try to find foods matching the category hint
            foods = self.filter_foods_by_preferences()
            
            # Simple mapping logic
            if 'rice' in category_hint:
                foods = foods.filter(name__icontains='rice')
            elif 'chicken' in category_hint:
                foods = foods.filter(name__icontains='chicken')
            elif 'fish' in category_hint:
                foods = foods.filter(name__icontains='fish')
            elif 'vegetables' in category_hint:
                foods = foods.filter(category='vegetables')
            elif 'fruits' in category_hint:
                foods = foods.filter(category='fruits')
            elif 'lentils' in category_hint:
                foods = foods.filter(name__icontains='lentil')
            elif 'oats' in category_hint:
                foods = foods.filter(name__icontains='oat')
            elif 'eggs' in category_hint:
                foods = foods.filter(name__icontains='egg')
            elif 'bread' in category_hint:
                foods = foods.filter(name__icontains='bread')
            elif 'milk' in category_hint:
                foods = foods.filter(name__icontains='milk')
            elif 'yogurt' in category_hint:
                foods = foods.filter(name__icontains='yogurt')
            elif 'proteins' in category_hint:
                foods = foods.filter(category='proteins')
            
            if foods.exists():
                selected_food = random.choice(foods)
                quantity = (calories_per_category * 100) / selected_food.calories_per_100g
                mapped_foods.append({
                    'food': selected_food,
                    'quantity_grams': min(quantity, 300)  # Max 300g per food
                })
        
        return mapped_foods
    
    def filter_foods_by_preferences(self):
        """Filter foods based on user preferences"""
        foods = Food.objects.all()
        
        # Apply dietary restrictions
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
    
    def get_seasonal_suggestions(self, season):
        """Get seasonal food suggestions"""
        seasonal_foods = {
            'spring': ['spinach', 'cauliflower', 'peas', 'strawberry'],
            'summer': ['mango', 'watermelon', 'cucumber', 'tomato'],
            'monsoon': ['rice', 'fish', 'ginger', 'turmeric'],
            'winter': ['orange', 'carrot', 'cabbage', 'sweet potato']
        }
        
        season_foods = seasonal_foods.get(season, [])
        suggestions = []
        
        for food_name in season_foods:
            foods = Food.objects.filter(name__icontains=food_name)
            if foods.exists():
                suggestions.extend(list(foods))
        
        return suggestions
    
    def calculate_meal_nutrition_score(self, meal):
        """Calculate nutrition score for a meal (0-100)"""
        total_foods = meal.meal_foods.count()
        if total_foods == 0:
            return 0
        
        score_factors = {
            'variety': min(total_foods * 10, 30),  # Max 30 points for variety
            'protein': 0,
            'vegetables': 0,
            'balance': 0
        }
        
        # Check for protein sources
        protein_foods = meal.meal_foods.filter(food__category='proteins')
        if protein_foods.exists():
            score_factors['protein'] = 25
        
        # Check for vegetables/fruits
        veggie_foods = meal.meal_foods.filter(
            food__category__in=['vegetables', 'fruits']
        )
        if veggie_foods.exists():
            score_factors['vegetables'] = 20
        
        # Check for balanced macronutrients
        total_calories = sum([mf.calculate_calories() for mf in meal.meal_foods.all()])
        total_protein = sum([mf.calculate_protein() for mf in meal.meal_foods.all()])
        total_carbs = sum([mf.calculate_carbs() for mf in meal.meal_foods.all()])
        total_fat = sum([mf.calculate_fat() for mf in meal.meal_foods.all()])
        
        if total_calories > 0:
            protein_percentage = (total_protein * 4) / total_calories * 100
            carbs_percentage = (total_carbs * 4) / total_calories * 100
            fat_percentage = (total_fat * 9) / total_calories * 100
            
            # Check if macros are in healthy ranges
            if 15 <= protein_percentage <= 25 and 45 <= carbs_percentage <= 65 and 20 <= fat_percentage <= 35:
                score_factors['balance'] = 25
            elif 10 <= protein_percentage <= 30 and 40 <= carbs_percentage <= 70 and 15 <= fat_percentage <= 40:
                score_factors['balance'] = 15
        
        return sum(score_factors.values())
