from celery import shared_task
from django.contrib.auth import get_user_model
from datetime import datetime
from services.ai_served_diet_plan import generate_meal_suggestions
from services.save_data import save_30_day_plan_for_user
from diet_plans.models import GenerateMeal

User = get_user_model()

@shared_task(bind=True)
def generate_diet_plan_async(self, user_id, meal_type):
    """
    Asynchronous task to generate diet plan using AI
    """
    try:
        # Update task status
        self.update_state(state='PROGRESS', meta={'status': 'Starting diet plan generation...'})
        
        user = User.objects.get(id=user_id)
        
        # Prepare user data
        age = datetime.today().year - user.date_of_birth.year
        gender = user.gender
        height_cm = user.height
        weight_kg = user.weight
        activity_level = user.activity_level
        goal = user.goal
        
        medical_conditions = user.medical_conditions.split(
            ', ') if user.medical_conditions.strip().lower() != 'none' else []
        food_restrictions = user.allergies.split(', ') if user.allergies.strip().lower() != 'none' else []
        food_preferences = ['Bangladeshi']

        user_data = {
            "age": age,
            "gender": gender,
            "height_cm": height_cm,
            "weight_kg": weight_kg,
            "activity_level": activity_level,
            "goal": goal,
            "medical_conditions": medical_conditions,
            "food_restrictions": food_restrictions,
            "food_preferences": food_preferences,
        }

        # Update task status
        self.update_state(state='PROGRESS', meta={'status': 'Calling AI service...'})
        
        # Generate diet plan using AI
        diet_plan = generate_meal_suggestions(user_data)
        
        # Update task status
        self.update_state(state='PROGRESS', meta={'status': 'Saving diet plan...'})
        
        # Save the generated plan
        generated_meal = save_30_day_plan_for_user(user=user, plan_dict=diet_plan, meal_type=meal_type)
        
        return {
            'status': 'SUCCESS',
            'message': 'Diet plan generated successfully',
            'meal_plan_id': generated_meal.id,
            'start_date': str(generated_meal.start_date),
            'end_date': str(generated_meal.end_date),
            'meal_type': meal_type
        }
        
    except Exception as e:
        # Update task status with error
        self.update_state(
            state='FAILURE',
            meta={
                'status': 'Failed to generate diet plan',
                'error': str(e)
            }
        )
        raise e
