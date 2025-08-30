from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .models import DietPlan, Food, Meal, MealFood, DietPlanProgress
from .serializers import DietPlanSerializer, FoodSerializer, MealSerializer
from .ai_engine import DietAIEngine
from .meal_suggestions import MealSuggestionEngine
from .recipes import RecipeEngine
from .utils import generate_grocery_list

class FoodViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'is_vegetarian', 'is_vegan', 'is_halal']

class DietPlanViewSet(viewsets.ModelViewSet):
    serializer_class = DietPlanSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['plan_type', 'is_active']
    
    def get_queryset(self):
        return DietPlan.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def generate_ai_plan(self, request):
        """Generate AI-powered diet plan"""
        plan_type = request.data.get('plan_type', 'regular')
        
        # Deactivate existing plans
        self.get_queryset().update(is_active=False)
        
        # Generate new plan using AI engine
        ai_engine = DietAIEngine(request.user)
        diet_plan = ai_engine.generate_30_day_plan(plan_type)
        
        serializer = self.get_serializer(diet_plan)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def daily_meals(self, request, pk=None):
        """Get meals for a specific day"""
        diet_plan = self.get_object()
        day_number = request.query_params.get('day', 1)
        
        meals = diet_plan.meals.filter(day_number=day_number)
        serializer = MealSerializer(meals, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete_meal(self, request, pk=None):
        """Mark a meal as completed"""
        diet_plan = self.get_object()
        meal_id = request.data.get('meal_id')
        
        try:
            meal = diet_plan.meals.get(id=meal_id)
            meal.is_completed = True
            meal.completion_date = timezone.now()
            meal.save()
            
            # Check if all meals for the day are completed
            day_meals = diet_plan.meals.filter(day_number=meal.day_number)
            if day_meals.filter(is_completed=True).count() == day_meals.count():
                # Move to next day
                progress = diet_plan.progress
                progress.completed_days += 1
                if progress.current_day < 30:
                    progress.current_day += 1
                progress.save()
            
            return Response({'message': 'Meal marked as completed'})
        except Meal.DoesNotExist:
            return Response({'error': 'Meal not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def skip_day(self, request, pk=None):
        """Handle day skipping and reset plan"""
        diet_plan = self.get_object()
        progress = diet_plan.progress
        
        progress.skipped_days += 1
        progress.reset_plan()
        
        return Response({
            'message': 'Plan reset due to skipped day',
            'current_day': progress.current_day,
            'total_resets': progress.total_resets
        })
    
    @action(detail=True, methods=['get'])
    def meal_alternatives(self, request, pk=None):
        """Get meal alternatives for a specific meal"""
        diet_plan = self.get_object()
        meal_id = request.query_params.get('meal_id')
        
        if not meal_id:
            return Response({'error': 'meal_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            meal = diet_plan.meals.get(id=meal_id)
            suggestion_engine = MealSuggestionEngine(request.user)
            alternatives = suggestion_engine.suggest_meal_alternatives(meal)
            
            return Response({
                'meal': meal.name,
                'alternatives': alternatives
            })
        except Meal.DoesNotExist:
            return Response({'error': 'Meal not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def quick_meals(self, request):
        """Get quick meal suggestions"""
        meal_type = request.query_params.get('meal_type', 'breakfast')
        target_calories = int(request.query_params.get('calories', 500))
        
        suggestion_engine = MealSuggestionEngine(request.user)
        suggestions = suggestion_engine.suggest_quick_meals(meal_type, target_calories)
        
        return Response({
            'meal_type': meal_type,
            'target_calories': target_calories,
            'suggestions': suggestions
        })
    
    @action(detail=False, methods=['get'])
    def seasonal_foods(self, request):
        """Get seasonal food suggestions"""
        season = request.query_params.get('season', 'summer')
        
        suggestion_engine = MealSuggestionEngine(request.user)
        seasonal_foods = suggestion_engine.get_seasonal_suggestions(season)
        
        serializer = FoodSerializer(seasonal_foods, many=True)
        return Response({
            'season': season,
            'foods': serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def grocery_list(self, request, pk=None):
        """Generate grocery list for the diet plan"""
        diet_plan = self.get_object()
        days = int(request.query_params.get('days', 7))
        
        grocery_list = generate_grocery_list(diet_plan, days)
        
        return Response({
            'diet_plan': diet_plan.name,
            'days': days,
            'grocery_list': grocery_list
        })
    
    @action(detail=True, methods=['get'])
    def meal_nutrition_score(self, request, pk=None):
        """Get nutrition score for a specific meal"""
        diet_plan = self.get_object()
        meal_id = request.query_params.get('meal_id')
        
        if not meal_id:
            return Response({'error': 'meal_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            meal = diet_plan.meals.get(id=meal_id)
            suggestion_engine = MealSuggestionEngine(request.user)
            score = suggestion_engine.calculate_meal_nutrition_score(meal)
            
            return Response({
                'meal': meal.name,
                'nutrition_score': score,
                'score_description': self.get_score_description(score)
            })
        except Meal.DoesNotExist:
            return Response({'error': 'Meal not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'])
    def meal_recipe(self, request, pk=None):
        """Get recipe for a specific meal"""
        diet_plan = self.get_object()
        meal_id = request.query_params.get('meal_id')
        
        if not meal_id:
            return Response({'error': 'meal_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            meal = diet_plan.meals.get(id=meal_id)
            recipe_engine = RecipeEngine()
            recipe = recipe_engine.get_recipe_for_meal(meal)
            
            return Response({
                'meal': meal.name,
                'recipe': recipe
            })
        except Meal.DoesNotExist:
            return Response({'error': 'Meal not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def get_score_description(self, score):
        """Get description for nutrition score"""
        if score >= 80:
            return "Excellent - Well balanced and nutritious meal"
        elif score >= 60:
            return "Good - Decent nutrition with room for improvement"
        elif score >= 40:
            return "Average - Consider adding more variety or nutrients"
        else:
            return "Poor - This meal lacks proper nutrition balance"
