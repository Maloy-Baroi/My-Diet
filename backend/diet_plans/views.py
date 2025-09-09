import logging
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import datetime, timedelta
from django.utils.dateparse import parse_date
import json

from diet_plans.models import GenerateMeal, ToDoList

logger = logging.getLogger(__name__)


class SaveAIDietPlanAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Save AI-generated diet plan from frontend TypeScript service
        """
        try:
            logger.info(f"Saving AI-generated diet plan for user {request.user.id}")
            data = request.data

            # Extract data from the request
            days_data = data.get('days', [])
            start_date = data.get('start_date')
            end_date = data.get('end_date')
            meal_type = data.get('meal_type', 'Regular')
            goal = data.get('goal', 'weight_loss')

            if not days_data:
                return Response({
                    'error': 'No meal plan data provided'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Parse dates
            try:
                start_date_obj = parse_date(start_date) if start_date else None
                end_date_obj = parse_date(end_date) if end_date else None
            except Exception as date_error:
                logger.error(f"Date parsing error: {date_error}")
                return Response({
                    'error': 'Invalid date format'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Convert days data to the format expected by GenerateMeal model
            ai_generated_data = {}
            for day_data in days_data:
                day_key = f"Day {day_data.get('day', 1)}"
                ai_generated_data[day_key] = {
                    "Breakfast": [day_data.get('breakfast', '')],
                    "Lunch": [day_data.get('lunch', '')],
                    "Dinner": [day_data.get('dinner', '')],
                    "Snacks": [day_data.get('snacks', '')]
                }

            # Create the meal plan using existing GenerateMeal model
            meal_plan = GenerateMeal.objects.create(
                user=request.user,
                start_date=start_date_obj,
                end_date=end_date_obj,
                meal_type=meal_type,
                ai_generated_data=json.dumps(ai_generated_data)
            )

            # Create ToDoList entries for each day and meal time
            meal_times = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

            for day_data in days_data:
                day_number = day_data.get('day', 1)
                day_date = parse_date(day_data.get('date'))

                for meal_time in meal_times:
                    meal_content = day_data.get(meal_time.lower(), '')

                    # Create ToDoList entry for this meal
                    ToDoList.objects.create(
                        user=request.user,
                        meal=meal_content,
                        day=day_number,
                        meal_time=meal_time,
                        date_of_meal=day_date,
                        is_completed=False
                    )

            logger.info(f"Successfully saved AI diet plan with ID: {meal_plan.id}")

            return Response({
                'message': 'AI diet plan saved successfully',
                'meal_plan_id': meal_plan.id,
                'start_date': start_date,
                'end_date': end_date,
                'meal_type': meal_type,
                'total_days': len(days_data)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error saving AI diet plan: {str(e)}", exc_info=True)
            return Response({
                'error': 'Failed to save AI diet plan',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Keep the existing views but remove Celery dependencies
class GetGeneratedMealPlanAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, meal_plan_id):
        """
        Get the generated meal plan details by ID
        """
        try:
            meal_plan = GenerateMeal.objects.get(id=meal_plan_id, user=request.user)

            # Parse the JSON data
            ai_data = json.loads(meal_plan.ai_generated_data)

            # Convert to the format expected by frontend
            daily_plans = []
            for day_key, meals in ai_data.items():
                if day_key.startswith('Day '):
                    day_number = int(day_key.split(' ')[1])
                    # Calculate the date for this day
                    day_date = meal_plan.start_date + timedelta(days=day_number - 1)

                    daily_plans.append({
                        'day': day_number,
                        'date': day_date.strftime('%Y-%m-%d'),
                        'breakfast': meals.get('Breakfast', [''])[0],
                        'lunch': meals.get('Lunch', [''])[0],
                        'dinner': meals.get('Dinner', [''])[0],
                        'snacks': meals.get('Snacks', [''])[0]
                    })

            # Sort by day number
            daily_plans.sort(key=lambda x: x['day'])

            return Response({
                'id': meal_plan.id,
                'daily_plans': daily_plans,
                'start_date': meal_plan.start_date.strftime('%Y-%m-%d'),
                'end_date': meal_plan.end_date.strftime('%Y-%m-%d'),
                'meal_type': meal_plan.meal_type
            }, status=status.HTTP_200_OK)

        except GenerateMeal.DoesNotExist:
            return Response({
                'error': 'Meal plan not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error retrieving meal plan: {str(e)}", exc_info=True)
            return Response({
                'error': 'Failed to retrieve meal plan',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
