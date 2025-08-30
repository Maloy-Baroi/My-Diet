from collections import defaultdict


def generate_grocery_list(diet_plan, days=7):
    """Generate grocery list for specified number of days"""
    grocery_list = defaultdict(float)
    
    # Get meals for the specified days
    meals = diet_plan.meals.filter(day_number__lte=days)
    
    for meal in meals:
        for meal_food in meal.meal_foods.all():
            grocery_list[meal_food.food.name] += meal_food.quantity_grams
    
    # Convert to list format
    formatted_list = []
    for food_name, total_quantity in grocery_list.items():
        formatted_list.append({
            'food': food_name,
            'quantity_grams': round(total_quantity, 1),
            'estimated_cost': calculate_estimated_cost(food_name, total_quantity)
        })
    
    return formatted_list


def calculate_estimated_cost(food_name, quantity_grams):
    """Calculate estimated cost for food item (mock implementation)"""
    # This would typically connect to a pricing database
    base_prices = {
        'rice': 0.15,  # per 100g
        'chicken': 2.50,
        'fish': 3.00,
        'vegetables': 0.80,
        'fruits': 1.20,
        'lentils': 0.50,
        'milk': 0.40,
        'eggs': 0.30,
    }
    
    # Simple lookup by food name keywords
    estimated_price_per_100g = 1.00  # default
    for keyword, price in base_prices.items():
        if keyword in food_name.lower():
            estimated_price_per_100g = price
            break
    
    return round((quantity_grams / 100) * estimated_price_per_100g, 2)
