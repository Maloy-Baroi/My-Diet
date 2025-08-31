class RecipeEngine:
    """Generate simple recipes for meals"""
    
    def __init__(self):
        self.recipes = {
            'rice_dal': {
                'name': 'Rice and Dal',
                'ingredients': ['rice', 'lentils', 'turmeric', 'salt'],
                'instructions': [
                    'Wash and cook rice separately',
                    'Boil lentils with turmeric and salt',
                    'Serve hot with vegetables'
                ],
                'prep_time': 25,
                'difficulty': 'easy'
            },
            'chicken_curry': {
                'name': 'Simple Chicken Curry',
                'ingredients': ['chicken', 'onion', 'tomato', 'spices'],
                'instructions': [
                    'Cut chicken into pieces',
                    'Sauté onions until golden',
                    'Add tomatoes and spices',
                    'Add chicken and cook until done'
                ],
                'prep_time': 35,
                'difficulty': 'medium'
            },
            'vegetable_stir_fry': {
                'name': 'Mixed Vegetable Stir Fry',
                'ingredients': ['mixed vegetables', 'oil', 'garlic', 'soy sauce'],
                'instructions': [
                    'Heat oil in pan',
                    'Add garlic and vegetables',
                    'Stir fry for 5-7 minutes',
                    'Season with soy sauce'
                ],
                'prep_time': 15,
                'difficulty': 'easy'
            }
        }
    
    def get_recipe_for_meal(self, meal):
        """Get recipe suggestions for a meal"""
        meal_foods = [mf.food.name.lower() for mf in meal.meal_foods.all()]
        
        # Simple matching logic
        if any('rice' in food for food in meal_foods) and any('lentil' in food for food in meal_foods):
            return self.recipes['rice_dal']
        elif any('chicken' in food for food in meal_foods):
            return self.recipes['chicken_curry']
        elif any('vegetable' in food for food in meal_foods):
            return self.recipes['vegetable_stir_fry']
        
        return self.generate_basic_recipe(meal)
    
    def generate_basic_recipe(self, meal):
        """Generate basic cooking instructions for any meal"""
        instructions = []
        ingredients = [mf.food.name for mf in meal.meal_foods.all()]
        
        # Group ingredients by category
        proteins = [ing for ing in ingredients if 'chicken' in ing.lower() or 'fish' in ing.lower() or 'egg' in ing.lower()]
        carbs = [ing for ing in ingredients if 'rice' in ing.lower() or 'bread' in ing.lower()]
        vegetables = [ing for ing in ingredients if any(cat in ing.lower() for cat in ['vegetable', 'spinach', 'carrot', 'potato'])]
        
        if proteins:
            instructions.append(f"Cook {', '.join(proteins)} until done")
        if carbs:
            instructions.append(f"Prepare {', '.join(carbs)} as per package instructions")
        if vegetables:
            instructions.append(f"Steam or sauté {', '.join(vegetables)}")
        
        instructions.append("Combine all ingredients and serve hot")
        
        return {
            'name': f"Custom {meal.name}",
            'ingredients': ingredients,
            'instructions': instructions,
            'prep_time': 20,
            'difficulty': 'easy'
        }
