from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import date, timedelta
from django.db.models import Avg, Count, Q
from .models import WeightLog, CalorieLog, Achievement
from .serializers import WeightLogSerializer, CalorieLogSerializer, AchievementSerializer

class WeightLogViewSet(viewsets.ModelViewSet):
    serializer_class = WeightLogSerializer
    
    def get_queryset(self):
        return WeightLog.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        # Check for weight goal achievement
        self.check_weight_goal_achievement()
    
    def check_weight_goal_achievement(self):
        """Check if user achieved their weight goal"""
        user = self.request.user
        if user.target_weight:
            latest_weight = self.get_queryset().first()
            if latest_weight:
                if user.goal == 'lose_weight' and latest_weight.weight <= user.target_weight:
                    self.create_achievement('weight_goal', 'Weight Goal Achieved!', 
                                          'Congratulations on reaching your target weight!')
                elif user.goal == 'gain_weight' and latest_weight.weight >= user.target_weight:
                    self.create_achievement('weight_goal', 'Weight Goal Achieved!', 
                                          'Great job on reaching your target weight!')
    
    def create_achievement(self, achievement_type, title, description):
        """Create achievement for user"""
        Achievement.objects.get_or_create(
            user=self.request.user,
            achievement_type=achievement_type,
            defaults={
                'title': title,
                'description': description,
                'badge_icon': '🎯'
            }
        )
    
    @action(detail=False, methods=['get'])
    def weight_trend(self, request):
        """Get weight trend data for charts"""
        logs = self.get_queryset()[:30]  # Last 30 entries
        
        trend_data = []
        for log in reversed(logs):
            bmi = None
            if request.user.height:
                height_m = request.user.height / 100
                bmi = round(log.weight / (height_m ** 2), 2)
            
            trend_data.append({
                'date': log.date_recorded,
                'weight': log.weight,
                'bmi': bmi
            })
        
        return Response(trend_data)

class CalorieLogViewSet(viewsets.ModelViewSet):
    serializer_class = CalorieLogSerializer
    
    def get_queryset(self):
        return CalorieLog.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def weekly_summary(self, request):
        """Get weekly calorie summary"""
        end_date = date.today()
        start_date = end_date - timedelta(days=7)
        
        logs = self.get_queryset().filter(
            date_recorded__range=[start_date, end_date]
        )
        
        summary = logs.aggregate(
            avg_calories=Avg('total_calories_consumed'),
            avg_protein=Avg('protein_consumed'),
            avg_carbs=Avg('carbs_consumed'),
            avg_fat=Avg('fat_consumed'),
            avg_water=Avg('water_intake_ml')
        )
        
        # Calculate daily breakdown
        daily_data = []
        for i in range(7):
            log_date = start_date + timedelta(days=i)
            day_log = logs.filter(date_recorded=log_date).first()
            daily_data.append({
                'date': log_date,
                'calories': day_log.total_calories_consumed if day_log else 0,
                'protein': day_log.protein_consumed if day_log else 0,
                'carbs': day_log.carbs_consumed if day_log else 0,
                'fat': day_log.fat_consumed if day_log else 0,
                'water': day_log.water_intake_ml if day_log else 0,
            })
        
        return Response({
            'summary': summary,
            'daily_breakdown': daily_data
        })
    
    @action(detail=False, methods=['get'])
    def today_stats(self, request):
        """Get today's nutrition stats"""
        today_log = self.get_queryset().filter(date_recorded=date.today()).first()
        
        if today_log:
            serializer = self.get_serializer(today_log)
            return Response(serializer.data)
        else:
            # Return empty stats for today
            return Response({
                'date_recorded': date.today(),
                'total_calories_consumed': 0,
                'total_calories_burned': 0,
                'protein_consumed': 0,
                'carbs_consumed': 0,
                'fat_consumed': 0,
                'water_intake_ml': 0,
            })

    @action(detail=False, methods=['post'])
    def log_water(self, request):
        """Log water intake"""
        water_amount = request.data.get('water_amount_ml', 0)
        today = date.today()
        
        calorie_log, created = CalorieLog.objects.get_or_create(
            user=request.user,
            date_recorded=today,
            defaults={'total_calories_consumed': 0}
        )
        
        calorie_log.water_intake_ml += water_amount
        calorie_log.save()
        
        return Response({
            'message': 'Water intake logged successfully',
            'total_water_today': calorie_log.water_intake_ml
        })

class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AchievementSerializer
    
    def get_queryset(self):
        return Achievement.objects.filter(user=self.request.user)
