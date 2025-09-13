from datetime import date, timedelta
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import json
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class Food(models.Model):
    """Food model to store food items with basic nutritional information"""
    name = models.CharField(max_length=255, unique=True)
    calories_per_100g = models.FloatField(help_text="Calories per 100 grams")
    protein_per_100g = models.FloatField(default=0, help_text="Protein in grams per 100g")
    carbs_per_100g = models.FloatField(default=0, help_text="Carbohydrates in grams per 100g")
    fat_per_100g = models.FloatField(default=0, help_text="Fat in grams per 100g")
    fiber_per_100g = models.FloatField(default=0, help_text="Fiber in grams per 100g")
    category = models.CharField(max_length=100, blank=True,
                                help_text="Food category (e.g., vegetables, fruits, grains)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class GenerateMeal(models.Model):
    MEAL_TYPE_CHOICES = [('Regular', 'Regular'), ('Ramadan', 'Ramadan')]
    generated_at = models.DateTimeField(auto_now_add=True)
    meal_type = models.CharField(max_length=50, choices=MEAL_TYPE_CHOICES)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    ai_generated_data = models.TextField()  # store the big dict as JSON
    is_running = models.BooleanField(default=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_meals')

    def __str__(self):
        return f"{self.user.username} - {self.meal_type} ({self.start_date} to {self.end_date})"

    def get_user_restrictions(self):
        """Helper method to safely get user dietary restrictions"""
        try:
            # Safely handle None values and empty strings
            allergies = []
            restrictions = []
            dislikes = []

            if hasattr(self.user, 'allergies') and self.user.allergies:
                allergies = [a.strip().lower() for a in self.user.allergies.split(',') if a.strip()]

            if hasattr(self.user, 'dietary_restrictions') and self.user.dietary_restrictions:
                restrictions = [r.strip().lower() for r in self.user.dietary_restrictions.split(',') if r.strip()]

            if hasattr(self.user, 'disliked_foods') and self.user.disliked_foods:
                dislikes = [d.strip().lower() for d in self.user.disliked_foods.split(',') if d.strip()]

            return set(allergies + restrictions + dislikes)
        except Exception as e:
            logger.warning(f"Error getting user restrictions: {e}")
            return set()

    def get_replacement_map(self):
        """Get replacement map with cascading replacement logic"""
        base_replacement_map = {
            "beef": "chicken",
            "pork": "chicken",
            "lamb": "chicken",
            "shrimp": "tofu",
            "fish": "chicken",  # Changed from egg to avoid circular dependency
            "eggplant": "zucchini",
            "peanut": "sunflower seeds",
            "milk": "soy milk",
            "egg": "tofu scramble",
            "cheese": "vegan cheese",
            "butter": "olive oil",
            "cream": "coconut milk",
        }
        return base_replacement_map

    def find_safe_replacement(self, restricted_item, restricted_items, replacement_map, max_depth=3):
        """Find a safe replacement that isn't also restricted"""
        if max_depth <= 0:
            return "vegetables"  # Safe fallback

        primary_replacement = replacement_map.get(restricted_item, "vegetables")

        # Check if the replacement is also restricted
        for restriction in restricted_items:
            if restriction in primary_replacement.lower():
                # The replacement is also restricted, try to find another one
                return self.find_safe_replacement(restriction, restricted_items, replacement_map, max_depth - 1)

        return primary_replacement

    def replace_meal_item(self, meal_item, restricted_items, replacement_map):
        """Replace a meal item if it contains restricted ingredients"""
        if not meal_item or not isinstance(meal_item, str):
            return meal_item

        meal_lower = meal_item.lower()
        replacement_made = False
        result_meal = meal_item

        # Check each restriction
        for restricted in restricted_items:
            if restricted in meal_lower:
                # Find a safe replacement
                safe_replacement = self.find_safe_replacement(restricted, restricted_items, replacement_map)

                # Replace the restricted item in the meal name
                result_meal = result_meal.replace(restricted, safe_replacement)
                replacement_made = True

                # Update meal_lower for subsequent checks
                meal_lower = result_meal.lower()

        return result_meal

    def process_dietary_restrictions(self, data):
        """Process dietary restrictions and modify meal data"""
        try:
            if not isinstance(data, dict):
                logger.warning("AI generated data is not a dictionary")
                return data

            restricted_items = self.get_user_restrictions()
            if not restricted_items:
                return data  # No restrictions to process

            replacement_map = self.get_replacement_map()

            # Process each day's meals
            days = data.get("days", [])
            if not isinstance(days, list):
                logger.warning("Days data is not a list")
                return data

            for day in days:
                if not isinstance(day, dict):
                    continue

                meals = day.get("meals", [])
                if not isinstance(meals, list):
                    continue

                # Replace meals
                new_meals = []
                for meal in meals:
                    if isinstance(meal, str):
                        replaced_meal = self.replace_meal_item(meal, restricted_items, replacement_map)
                        new_meals.append(replaced_meal)
                    elif isinstance(meal, dict):
                        # Handle case where meal is a dictionary with details
                        if 'name' in meal:
                            meal['name'] = self.replace_meal_item(meal['name'], restricted_items, replacement_map)
                        new_meals.append(meal)
                    else:
                        new_meals.append(meal)

                day["meals"] = new_meals

            return data

        except Exception as e:
            logger.error(f"Error processing dietary restrictions: {e}")
            return data  # Return original data if processing fails

    def save(self, *args, **kwargs):
        # Only auto-fill dates if not provided
        if not self.start_date:
            self.start_date = timezone.now().date() + timedelta(days=1)
        if not self.end_date:
            self.end_date = self.start_date + timedelta(days=29)

        # process dietary restrictions and modify ai_generated_data
        if self.ai_generated_data:
            data = json.loads(self.ai_generated_data)

            # Collect restrictions
            allergies = [a.strip().lower() for a in (self.user.allergies or "").split(',') if a]
            restrictions = [r.strip().lower() for r in (self.user.dietary_restrictions or "").split(',') if r]
            dislikes = [d.strip().lower() for d in (self.user.disliked_foods or "").split(',') if d]

            # Replacement map (could be moved to settings or a config file)
            replacement_map = {
                "beef": "chicken",  # Hindus / no beef
                "pork": "chicken",  # Muslims / Jewish dietary law
                "eggplant": "zucchini",  # allergy or dislike
                "peanut": "sunflower seeds",
                "shrimp": "tofu",
                "lamb": "turkey",
                "fish": "mushroom",
                "milk": "soy milk",
                "egg": "tofu scramble"
            }

            restricted_items = set(allergies + restrictions + dislikes)

            def replace_item(item):
                for restricted in restricted_items:
                    if restricted in item.lower():
                        return replacement_map.get(restricted, "vegetables")
                return item

            # Assume ai_generated_data is a dict like { "days": [ { "meals": ["beef curry", "eggplant stew"] } ] }
            if isinstance(data, dict):
                for day in data.get("days", []):
                    meals = day.get("meals", [])
                    new_meals = [replace_item(meal) for meal in meals]
                    day["meals"] = new_meals

            self.ai_generated_data = json.dumps(data)

        super().save(*args, **kwargs)


class ToDoList(models.Model):
    MEAL_TIME_CHOICES = [('Breakfast', 'Breakfast'), ('Lunch', 'Lunch'), ('Dinner', 'Dinner'), ('Snacks', 'Snacks')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='todo_lists')
    meal = models.TextField()  # JSON string of items for that meal_time
    day = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(30)])
    meal_time = models.CharField(max_length=50, choices=MEAL_TIME_CHOICES)
    date_of_meal = models.DateField()
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Prevent duplicates for a user on the same date & meal_time
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'date_of_meal', 'meal_time'],
                name='uniq_user_date_mealtime'
            )
        ]

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} • {self.date_of_meal} • {self.meal_time} • {'Done' if self.is_completed else 'Pending'}"


class UserMealProfile(models.Model):
    GOAL_CHOICES = [
        ('weight_loss', 'Weight Loss'),
        ('muscle_gain', 'Muscle Gain'),
        ('maintenance', 'Maintenance'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meal_profiles')
    meal_round = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(3)])
    new_weight = models.FloatField(help_text="Weight in kg")
    new_height = models.FloatField(help_text="Height in cm")
    generated_meal = models.ForeignKey(GenerateMeal, on_delete=models.CASCADE, related_name='meal_profiles')
    goal = models.CharField(max_length=255, choices=GOAL_CHOICES)