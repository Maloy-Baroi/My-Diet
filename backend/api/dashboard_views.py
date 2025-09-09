from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date, timedelta
from django.db.models import Sum, Avg, Count
# from diet_plans.models import DietPlan, Meal
from progress.models import WeightLog, CalorieLog, Achievement
from notifications.models import UserNotification

class ComprehensiveDashboardView(APIView):
    """Enhanced dashboard with comprehensive user insights"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        today = date.today()

        # User basic info
        user_info = {
            'name': user.first_name or user.username,
            'email': user.email,
            'age': self.calculate_age(user.date_of_birth) if user.date_of_birth else None,
            'bmi': user.calculate_bmi(),
            'bmr': user.calculate_bmr(),
            'goal': user.get_goal_display(),
            'current_weight': user.weight,
            'target_weight': user.target_weight,
        }

        # Today's meals and progress
        today_meals = []
        today_completion = 0

        # Recent achievements
        recent_achievements = user.achievements.all()[:5].values(
            'title', 'description', 'badge_icon', 'earned_date'
        )
        
        # Unread notifications
        unread_notifications = user.notifications.filter(is_read=False)[:5].values(
            'id', 'title', 'message', 'created_at'
        )
        
        # Health insights
        health_insights = self.generate_health_insights(user)
        
        dashboard_data = {
            'user_info': user_info,
            'today_meals': today_meals,
            'today_completion_percentage': today_completion,
            'recent_achievements': list(recent_achievements),
            'unread_notifications': list(unread_notifications),
            'health_insights': health_insights,
        }
        
        return Response(dashboard_data)
    
    def calculate_age(self, birth_date):
        """Calculate age from birth date"""
        if birth_date:
            return (date.today() - birth_date).days // 365
        return None
    
    def get_weekly_stats(self, user, start_date, end_date):
        """Get weekly statistics"""
        weekly_logs = CalorieLog.objects.filter(
            user=user,
            date_recorded__range=[start_date, end_date]
        )
        
        stats = weekly_logs.aggregate(
            avg_calories=Avg('total_calories_consumed'),
            total_water=Sum('water_intake_ml'),
            avg_protein=Avg('protein_consumed'),
            avg_carbs=Avg('carbs_consumed'),
            avg_fat=Avg('fat_consumed')
        )
        
        # Weight change
        weight_change = 0
        recent_weights = user.weight_logs.filter(
            date_recorded__range=[start_date, end_date]
        ).order_by('date_recorded')
        
        if recent_weights.count() >= 2:
            weight_change = recent_weights.last().weight - recent_weights.first().weight
        
        return {
            'avg_daily_calories': round(stats['avg_calories'] or 0, 1),
            'total_water_liters': round((stats['total_water'] or 0) / 1000, 1),
            'avg_protein': round(stats['avg_protein'] or 0, 1),
            'avg_carbs': round(stats['avg_carbs'] or 0, 1),
            'avg_fat': round(stats['avg_fat'] or 0, 1),
            'weight_change_kg': round(weight_change, 2),
            'days_logged': weekly_logs.count()
        }
    
    def generate_health_insights(self, user):
        """Generate personalized health insights"""
        insights = []
        
        # BMI insights
        bmi = user.calculate_bmi()
        if bmi:
            if bmi < 18.5:
                insights.append({
                    'type': 'warning',
                    'message': 'Your BMI indicates you may be underweight. Consider consulting a healthcare provider.',
                    'action': 'Increase healthy calorie intake'
                })
            elif bmi > 25:
                insights.append({
                    'type': 'info',
                    'message': 'Your BMI suggests you could benefit from weight management.',
                    'action': 'Focus on balanced nutrition and regular exercise'
                })
            else:
                insights.append({
                    'type': 'success',
                    'message': 'Your BMI is in the healthy range!',
                    'action': 'Maintain your current healthy lifestyle'
                })
        
        # Goal-specific insights
        if user.goal == 'lose_weight':
            insights.append({
                'type': 'tip',
                'message': 'For healthy weight loss, aim for 0.5-1kg per week.',
                'action': 'Maintain a moderate calorie deficit'
            })
        elif user.goal == 'muscle_gain':
            insights.append({
                'type': 'tip',
                'message': 'Protein intake should be 1.6-2.2g per kg of body weight for muscle gain.',
                'action': 'Ensure adequate protein at each meal'
            })
        
        return insights
    
    def get_quick_actions(self, user, active_plan):
        """Get quick action buttons for dashboard"""
        actions = [
            {'label': 'Log Weight', 'endpoint': '/api/weight-logs/', 'method': 'POST'},
            {'label': 'Log Water', 'endpoint': '/api/calorie-logs/log_water/', 'method': 'POST'},
            {'label': 'View Today\'s Meals', 'endpoint': f'/api/diet-plans/{active_plan.id}/daily_meals/' if active_plan else None, 'method': 'GET'},
        ]
        
        if not active_plan:
            actions.append({
                'label': 'Generate Diet Plan',
                'endpoint': '/api/diet-plans/generate_ai_plan/',
                'method': 'POST'
            })
        
        return [action for action in actions if action['endpoint']]
