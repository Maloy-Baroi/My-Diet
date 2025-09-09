from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from celery.result import AsyncResult

from diet_plans.tasks import generate_diet_plan_async

class GenerateDietPlanAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        meal_type = request.data.get('meal_type')
        goal = request.data.get('goal')

        if meal_type not in ['Regular', 'Ramadan']:
            return Response({'error': 'Invalid meal type'}, status=status.HTTP_400_BAD_REQUEST)

        if goal not in ['weight_loss', 'muscle_gain', 'maintenance']:
            return Response({'error': 'Invalid goal'}, status=status.HTTP_400_BAD_REQUEST)

        # Start the asynchronous task
        task = generate_diet_plan_async.delay(request.user.id, meal_type)

        return Response({
            'message': 'Diet plan generation started',
            'task_id': task.id,
            'status': 'PENDING'
        }, status=status.HTTP_202_ACCEPTED)


class DietPlanTaskStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id):
        """
        Check the status of a diet plan generation task
        """
        try:
            task_result = AsyncResult(task_id)

            if task_result.state == 'PENDING':
                response = {
                    'state': task_result.state,
                    'status': 'Task is waiting to be processed...'
                }
            elif task_result.state == 'PROGRESS':
                response = {
                    'state': task_result.state,
                    'status': task_result.info.get('status', 'In progress...')
                }
            elif task_result.state == 'SUCCESS':
                response = {
                    'state': task_result.state,
                    'result': task_result.info
                }
            else:  # FAILURE
                response = {
                    'state': task_result.state,
                    'status': task_result.info.get('status', 'Task failed'),
                    'error': task_result.info.get('error', 'Unknown error')
                }

            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': 'Failed to get task status',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
