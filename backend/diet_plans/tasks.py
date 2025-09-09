import logging
from celery import shared_task
from django.contrib.auth import get_user_model
from datetime import datetime
from services.ai_served_diet_plan import generate_meal_suggestions
from services.save_data import save_30_day_plan_for_user
from diet_plans.models import GenerateMeal

User = get_user_model()
logger = logging.getLogger(__name__)


@shared_task(bind=True, time_limit=900, soft_time_limit=840)  # 15 min hard limit, 14 min soft limit
def generate_diet_plan_async(self, user_id, goal, meal_type):
    """
    Asynchronous task to generate diet plan using AI
    Time limit: 15 minutes (for 5-10 min AI processing + buffer)
    """
    task_id = self.request.id
    logger.info(f"=== TASK STARTED === Task ID: {task_id}")
    logger.info(f"Task received with user_id: {user_id}, goal: {goal}, meal_type: {meal_type}")

    try:
        # Update task status
        logger.info("Updating task state to PROGRESS...")
        self.update_state(
            state='PROGRESS',
            meta={
                'status': 'Starting diet plan generation...',
                'progress': 10,
                'step': 'initialization'
            }
        )

        logger.info("Fetching user data...")
        try:
            user = User.objects.get(id=user_id)
            logger.info(f"Successfully retrieved user: {user.email if hasattr(user, 'email') else user.username}")
        except User.DoesNotExist:
            logger.error(f"User with id {user_id} does not exist")
            raise ValueError(f"User with id {user_id} not found")
        except Exception as e:
            logger.error(f"Error fetching user: {str(e)}")
            raise

        # Prepare user data
        logger.info("Preparing user data...")
        self.update_state(
            state='PROGRESS',
            meta={
                'status': 'Preparing user data...',
                'progress': 20,
                'step': 'data_preparation'
            }
        )

        age = datetime.today().year - user.date_of_birth.year
        gender = user.gender
        height_cm = user.height
        weight_kg = user.weight
        activity_level = user.activity_level

        medical_conditions = user.medical_conditions.split(
            ', ') if user.medical_conditions and user.medical_conditions.strip().lower() != 'none' else []
        food_restrictions = user.allergies.split(
            ', ') if user.allergies and user.allergies.strip().lower() != 'none' else []
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
        logger.info(f"User data prepared successfully: {user_data}")

        # Update task status before AI call
        self.update_state(
            state='PROGRESS',
            meta={
                'status': 'Generating meal plan with AI (this may take 5-10 minutes)...',
                'progress': 30,
                'step': 'ai_generation'
            }
        )

        logger.info("=== CALLING AI SERVICE ===")
        logger.info("This may take 5-10 minutes...")

        # Generate diet plan using AI
        diet_plan = generate_meal_suggestions(user_data)
        logger.info("=== AI SERVICE COMPLETED ===")
        logger.info(f"Diet plan generated successfully. Plan type: {type(diet_plan)}")

        # Update task status
        self.update_state(
            state='PROGRESS',
            meta={
                'status': 'Saving diet plan to database...',
                'progress': 80,
                'step': 'saving_data'
            }
        )

        logger.info("Saving diet plan to database...")
        # Save the generated plan
        generated_meal = save_30_day_plan_for_user(user=user, plan_dict=diet_plan, meal_type=meal_type)
        logger.info(f"Diet plan saved successfully with ID: {generated_meal.id}")

        # Final success state
        result = {
            'status': 'SUCCESS',
            'message': 'Diet plan generated successfully',
            'meal_plan_id': generated_meal.id,
            'start_date': str(generated_meal.start_date),
            'end_date': str(generated_meal.end_date),
            'meal_type': meal_type,
            'progress': 100,
            'step': 'completed'
        }

        logger.info(f"=== TASK COMPLETED SUCCESSFULLY === Task ID: {task_id}")
        logger.info(f"Result: {result}")

        return result

    except Exception as e:
        error_msg = str(e)
        logger.error(f"=== TASK FAILED === Task ID: {task_id}")
        logger.error(f"Error: {error_msg}", exc_info=True)

        # Update task status with error
        self.update_state(
            state='FAILURE',
            meta={
                'status': 'Failed to generate diet plan',
                'error': error_msg,
                'progress': 0,
                'step': 'failed'
            }
        )

        # Re-raise the exception so Celery marks the task as failed
        raise e