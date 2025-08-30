from django.core.management.base import BaseCommand
from diet_plans.models import Food

class Command(BaseCommand):
    help = 'Populate database with common Bangladeshi foods'
    
    def handle(self, *args, **options):
        foods_data = [
            # Grains & Cereals
            {'name': 'Basmati Rice', 'category': 'grains', 'calories_per_100g': 130, 'protein_per_100g': 2.7, 'carbs_per_100g': 28, 'fat_per_100g': 0.3, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Brown Rice', 'category': 'grains', 'calories_per_100g': 123, 'protein_per_100g': 2.6, 'carbs_per_100g': 25, 'fat_per_100g': 0.9, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Roti (Whole Wheat)', 'category': 'grains', 'calories_per_100g': 240, 'protein_per_100g': 8.1, 'carbs_per_100g': 46, 'fat_per_100g': 3.3, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Oats', 'category': 'grains', 'calories_per_100g': 389, 'protein_per_100g': 16.9, 'carbs_per_100g': 66, 'fat_per_100g': 6.9, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Bread (White)', 'category': 'grains', 'calories_per_100g': 265, 'protein_per_100g': 9, 'carbs_per_100g': 49, 'fat_per_100g': 3.2, 'is_halal': True, 'is_vegetarian': True, 'common_allergens': 'gluten'},
            {'name': 'Quinoa', 'category': 'grains', 'calories_per_100g': 120, 'protein_per_100g': 4.4, 'carbs_per_100g': 22, 'fat_per_100g': 1.9, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            
            # Proteins
            {'name': 'Chicken Breast', 'category': 'proteins', 'calories_per_100g': 165, 'protein_per_100g': 31, 'carbs_per_100g': 0, 'fat_per_100g': 3.6, 'is_halal': True},
            {'name': 'Fish (Rohu)', 'category': 'proteins', 'calories_per_100g': 97, 'protein_per_100g': 16.6, 'carbs_per_100g': 0, 'fat_per_100g': 3, 'is_halal': True},
            {'name': 'Fish (Hilsa)', 'category': 'proteins', 'calories_per_100g': 200, 'protein_per_100g': 25, 'carbs_per_100g': 0, 'fat_per_100g': 12, 'is_halal': True},
            {'name': 'Eggs', 'category': 'proteins', 'calories_per_100g': 155, 'protein_per_100g': 13, 'carbs_per_100g': 1.1, 'fat_per_100g': 11, 'is_halal': True, 'is_vegetarian': True, 'common_allergens': 'eggs'},
            {'name': 'Lentils (Red Dal)', 'category': 'proteins', 'calories_per_100g': 116, 'protein_per_100g': 9, 'carbs_per_100g': 20, 'fat_per_100g': 0.4, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Lentils (Masoor Dal)', 'category': 'proteins', 'calories_per_100g': 353, 'protein_per_100g': 25, 'carbs_per_100g': 60, 'fat_per_100g': 1.1, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Chickpeas', 'category': 'proteins', 'calories_per_100g': 164, 'protein_per_100g': 8.9, 'carbs_per_100g': 27, 'fat_per_100g': 2.6, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Black Beans', 'category': 'proteins', 'calories_per_100g': 132, 'protein_per_100g': 8.9, 'carbs_per_100g': 23, 'fat_per_100g': 0.5, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Beef', 'category': 'proteins', 'calories_per_100g': 250, 'protein_per_100g': 26, 'carbs_per_100g': 0, 'fat_per_100g': 15, 'is_halal': True},
            {'name': 'Mutton', 'category': 'proteins', 'calories_per_100g': 294, 'protein_per_100g': 25, 'carbs_per_100g': 0, 'fat_per_100g': 21, 'is_halal': True},
            
            # Vegetables
            {'name': 'Spinach', 'category': 'vegetables', 'calories_per_100g': 23, 'protein_per_100g': 2.9, 'carbs_per_100g': 3.6, 'fat_per_100g': 0.4, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Broccoli', 'category': 'vegetables', 'calories_per_100g': 25, 'protein_per_100g': 3, 'carbs_per_100g': 5, 'fat_per_100g': 0.4, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Cauliflower', 'category': 'vegetables', 'calories_per_100g': 25, 'protein_per_100g': 1.9, 'carbs_per_100g': 5, 'fat_per_100g': 0.3, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Potato', 'category': 'vegetables', 'calories_per_100g': 77, 'protein_per_100g': 2, 'carbs_per_100g': 17, 'fat_per_100g': 0.1, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Sweet Potato', 'category': 'vegetables', 'calories_per_100g': 86, 'protein_per_100g': 1.6, 'carbs_per_100g': 20, 'fat_per_100g': 0.1, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Carrot', 'category': 'vegetables', 'calories_per_100g': 41, 'protein_per_100g': 0.9, 'carbs_per_100g': 10, 'fat_per_100g': 0.2, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Cabbage', 'category': 'vegetables', 'calories_per_100g': 25, 'protein_per_100g': 1.3, 'carbs_per_100g': 6, 'fat_per_100g': 0.1, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Tomato', 'category': 'vegetables', 'calories_per_100g': 18, 'protein_per_100g': 0.9, 'carbs_per_100g': 3.9, 'fat_per_100g': 0.2, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Cucumber', 'category': 'vegetables', 'calories_per_100g': 16, 'protein_per_100g': 0.7, 'carbs_per_100g': 4, 'fat_per_100g': 0.1, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Bell Pepper', 'category': 'vegetables', 'calories_per_100g': 31, 'protein_per_100g': 1, 'carbs_per_100g': 7, 'fat_per_100g': 0.3, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            
            # Fruits
            {'name': 'Banana', 'category': 'fruits', 'calories_per_100g': 89, 'protein_per_100g': 1.1, 'carbs_per_100g': 23, 'fat_per_100g': 0.3, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Apple', 'category': 'fruits', 'calories_per_100g': 52, 'protein_per_100g': 0.3, 'carbs_per_100g': 14, 'fat_per_100g': 0.2, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Orange', 'category': 'fruits', 'calories_per_100g': 43, 'protein_per_100g': 0.9, 'carbs_per_100g': 11, 'fat_per_100g': 0.1, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Mango', 'category': 'fruits', 'calories_per_100g': 60, 'protein_per_100g': 0.8, 'carbs_per_100g': 15, 'fat_per_100g': 0.4, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Watermelon', 'category': 'fruits', 'calories_per_100g': 30, 'protein_per_100g': 0.6, 'carbs_per_100g': 8, 'fat_per_100g': 0.2, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Strawberry', 'category': 'fruits', 'calories_per_100g': 32, 'protein_per_100g': 0.7, 'carbs_per_100g': 8, 'fat_per_100g': 0.3, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Grapes', 'category': 'fruits', 'calories_per_100g': 69, 'protein_per_100g': 0.7, 'carbs_per_100g': 18, 'fat_per_100g': 0.2, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Pineapple', 'category': 'fruits', 'calories_per_100g': 50, 'protein_per_100g': 0.5, 'carbs_per_100g': 13, 'fat_per_100g': 0.1, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            
            # Dairy
            {'name': 'Milk (Full Fat)', 'category': 'dairy', 'calories_per_100g': 61, 'protein_per_100g': 3.2, 'carbs_per_100g': 4.8, 'fat_per_100g': 3.3, 'is_halal': True, 'is_vegetarian': True, 'common_allergens': 'milk'},
            {'name': 'Yogurt (Plain)', 'category': 'dairy', 'calories_per_100g': 59, 'protein_per_100g': 10, 'carbs_per_100g': 3.6, 'fat_per_100g': 0.4, 'is_halal': True, 'is_vegetarian': True, 'common_allergens': 'milk'},
            {'name': 'Paneer', 'category': 'dairy', 'calories_per_100g': 265, 'protein_per_100g': 18, 'carbs_per_100g': 1.2, 'fat_per_100g': 20, 'is_halal': True, 'is_vegetarian': True, 'common_allergens': 'milk'},
            {'name': 'Cheese (Cheddar)', 'category': 'dairy', 'calories_per_100g': 402, 'protein_per_100g': 25, 'carbs_per_100g': 1.3, 'fat_per_100g': 33, 'is_halal': True, 'is_vegetarian': True, 'common_allergens': 'milk'},
            
            # Fats & Oils
            {'name': 'Olive Oil', 'category': 'fats', 'calories_per_100g': 884, 'protein_per_100g': 0, 'carbs_per_100g': 0, 'fat_per_100g': 100, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Coconut Oil', 'category': 'fats', 'calories_per_100g': 862, 'protein_per_100g': 0, 'carbs_per_100g': 0, 'fat_per_100g': 99, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Almonds', 'category': 'fats', 'calories_per_100g': 579, 'protein_per_100g': 21, 'carbs_per_100g': 22, 'fat_per_100g': 50, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True, 'common_allergens': 'nuts'},
            {'name': 'Walnuts', 'category': 'fats', 'calories_per_100g': 654, 'protein_per_100g': 15, 'carbs_per_100g': 14, 'fat_per_100g': 65, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True, 'common_allergens': 'nuts'},
            
            # Beverages
            {'name': 'Green Tea', 'category': 'beverages', 'calories_per_100g': 1, 'protein_per_100g': 0, 'carbs_per_100g': 0, 'fat_per_100g': 0, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Black Coffee', 'category': 'beverages', 'calories_per_100g': 2, 'protein_per_100g': 0.3, 'carbs_per_100g': 0, 'fat_per_100g': 0, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
            {'name': 'Coconut Water', 'category': 'beverages', 'calories_per_100g': 19, 'protein_per_100g': 0.7, 'carbs_per_100g': 3.7, 'fat_per_100g': 0.2, 'is_halal': True, 'is_vegetarian': True, 'is_vegan': True},
        ]
        
        created_count = 0
        for food_data in foods_data:
            food, created = Food.objects.get_or_create(
                name=food_data['name'],
                defaults=food_data
            )
            if created:
                created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully populated {created_count} new foods out of {len(foods_data)} total foods')
        )
