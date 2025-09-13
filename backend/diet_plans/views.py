import logging

from dateutil.utils import today
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

                    # Use get_or_create to avoid UNIQUE constraint errors
                    todo_item, created = ToDoList.objects.get_or_create(
                        user=request.user,
                        date_of_meal=day_date,
                        meal_time=meal_time,
                        defaults={
                            'meal': meal_content,
                            'day': day_number,
                            'is_completed': False
                        }
                    )

                    # If the item already exists, update it with new meal content
                    if not created:
                        todo_item.meal = meal_content
                        todo_item.day = day_number
                        todo_item.is_completed = False  # Reset completion status
                        todo_item.save()

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

    def get(self, request):
        try:
            today_date = datetime.now().date()

            # Find meal plans that are currently active (today falls within start_date and end_date)
            meal_plans = GenerateMeal.objects.filter(
                user=request.user,
                start_date__lte=today_date,
                end_date__gte=today_date
            )

            if meal_plans.exists():
                if meal_plans.count() > 1:
                    # If multiple active plans, choose the one marked as running or the most recent one
                    meal_plan = meal_plans.filter(is_running=True).order_by('-start_date').first()
                    if not meal_plan:
                        meal_plan = meal_plans.order_by('-start_date').first()
                else:
                    meal_plan = meal_plans.first()
            else:
                return Response({
                    'error': 'No active meal plan found'
                }, status=status.HTTP_404_NOT_FOUND)

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


class ToDoListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get the to-do diet list for the authenticated user
        """
        # Fetch to-do list items for the user for today
        try:
            today = datetime.now().date()
            todo_items = ToDoList.objects.filter(user=request.user, date_of_meal=today)

            # Serialize the data
            serialized_items = [
                {
                    'id': item.id,
                    'meal': item.meal,
                    'day': item.day,
                    'meal_time': item.meal_time,
                    'date_of_meal': item.date_of_meal.strftime('%Y-%m-%d'),
                    'is_completed': item.is_completed
                }
                for item in todo_items
            ]

            return Response({
                'todo_list': serialized_items
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving to-do diet list: {str(e)}", exc_info=True)
            return Response({
                'error': 'Failed to retrieve to-do diet list',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request):
        """
        Update the completion status of to-do diet items.
        Requires all 4 items for today to be sent together and all must be completed.
        """
        try:
            items_data = request.data.get('items', [])

            if not items_data:
                return Response({
                    'error': 'Items array is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if exactly 4 items are provided
            if len(items_data) != 4:
                return Response({
                    'error': 'Exactly 4 items must be provided (Breakfast, Lunch, Dinner, Snacks)'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Extract item IDs and completion statuses
            item_ids = []
            completion_statuses = []

            for item_data in items_data:
                item_id = item_data.get('id')
                is_completed = item_data.get('is_completed')

                if item_id is None or is_completed is None:
                    return Response({
                        'error': 'Each item must have id and is_completed fields'
                    }, status=status.HTTP_400_BAD_REQUEST)

                item_ids.append(item_id)
                completion_statuses.append(is_completed)

            # Verify all items belong to the user and are for today
            today = datetime.now().date()
            todo_items = ToDoList.objects.filter(
                id__in=item_ids,
                user=request.user,
                date_of_meal=today
            )

            if todo_items.count() != 4:
                return Response({
                    'error': 'All 4 items must belong to you and be for today'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if all items are marked as completed
            all_completed = all(completion_statuses)

            if not all_completed:
                return Response({
                    'error': 'All 4 items must be marked as completed to update'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Update all items since validation passed
            updated_items = []
            for item_data in items_data:
                item_id = item_data['id']
                is_completed = item_data['is_completed']

                todo_item = todo_items.get(id=item_id)
                todo_item.is_completed = is_completed
                todo_item.save()

                updated_items.append({
                    'id': todo_item.id,
                    'meal': todo_item.meal,
                    'day': todo_item.day,
                    'meal_time': todo_item.meal_time,
                    'date_of_meal': todo_item.date_of_meal.strftime('%Y-%m-%d'),
                    'is_completed': todo_item.is_completed
                })

            return Response({
                'message': 'All to-do items updated successfully',
                'items': updated_items
            }, status=status.HTTP_200_OK)

        except ToDoList.DoesNotExist:
            return Response({
                'error': 'One or more to-do items not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error updating to-do diet items: {str(e)}", exc_info=True)
            return Response({
                'error': 'Failed to update to-do diet items',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
