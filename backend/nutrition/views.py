from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date, timedelta
from .models import NutritionGoal, NutritionTracking
from .serializers import NutritionGoalSerializer, NutritionTrackingSerializer
from .analytics import NutritionAnalyzer

class NutritionGoalViewSet(viewsets.ModelViewSet):
    serializer_class = NutritionGoalSerializer
    
    def get_queryset(self):
        return NutritionGoal.objects.filter(user=self.request.user)
    
    def get_object(self):
        goal, created = NutritionGoal.objects.get_or_create(
            user=self.request.user,
            defaults={
                'daily_calorie_goal': self.request.user.calculate_bmr() or 2000,
                'protein_goal_grams': 50,
                'carbs_goal_grams': 250,
                'fat_goal_grams': 65,
            }
        )
        return goal
    
    @action(detail=False, methods=['post'])
    def calculate_goals(self, request):
        """Calculate nutrition goals based on user profile"""
        user = request.user
        bmr = user.calculate_bmr()
        
        if not bmr:
            return Response(
                {'error': 'Unable to calculate goals. Please complete your profile.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate macronutrient goals
        calorie_goal = int(bmr)
        protein_goal = round((calorie_goal * 0.15) / 4, 1)  # 15% of calories from protein
        carbs_goal = round((calorie_goal * 0.55) / 4, 1)    # 55% of calories from carbs
        fat_goal = round((calorie_goal * 0.30) / 9, 1)      # 30% of calories from fat
        
        # Update or create nutrition goals
        goal, created = NutritionGoal.objects.update_or_create(
            user=user,
            defaults={
                'daily_calorie_goal': calorie_goal,
                'protein_goal_grams': protein_goal,
                'carbs_goal_grams': carbs_goal,
                'fat_goal_grams': fat_goal,
            }
        )
        
        serializer = self.get_serializer(goal)
        return Response(serializer.data)

class NutritionTrackingViewSet(viewsets.ModelViewSet):
    serializer_class = NutritionTrackingSerializer
    
    def get_queryset(self):
        return NutritionTracking.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def nutrition_analysis(self, request):
        """Get comprehensive nutrition analysis"""
        analyzer = NutritionAnalyzer(request.user)
        analysis = analyzer.generate_weekly_analysis()
        return Response(analysis)
    
    @action(detail=False, methods=['get'])
    def deficiency_alerts(self, request):
        """Check for potential nutrition deficiencies"""
        analyzer = NutritionAnalyzer(request.user)
        alerts = analyzer.check_deficiency_risks()
        return Response(alerts)
