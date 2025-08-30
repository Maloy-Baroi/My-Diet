from datetime import date, timedelta
from django.db.models import Avg, Sum
from .models import NutritionGoal, NutritionTracking
from progress.models import CalorieLog

class NutritionAnalyzer:
    """Advanced nutrition analysis and recommendations"""
    
    def __init__(self, user):
        self.user = user
        self.nutrition_goal = self.get_or_create_goals()
    
    def get_or_create_goals(self):
        """Get or create nutrition goals for user"""
        goal, created = NutritionGoal.objects.get_or_create(
            user=self.user,
            defaults={
                'daily_calorie_goal': self.user.calculate_bmr() or 2000,
                'protein_goal_grams': 50,
                'carbs_goal_grams': 250,
                'fat_goal_grams': 65,
            }
        )
        return goal
    
    def generate_weekly_analysis(self):
        """Generate comprehensive weekly nutrition analysis"""
        end_date = date.today()
        start_date = end_date - timedelta(days=7)
        
        # Get weekly calorie logs
        weekly_logs = CalorieLog.objects.filter(
            user=self.user,
            date_recorded__range=[start_date, end_date]
        )
        
        if not weekly_logs.exists():
            return {'message': 'No nutrition data found for the past week'}
        
        # Calculate averages
        averages = weekly_logs.aggregate(
            avg_calories=Avg('total_calories_consumed'),
            avg_protein=Avg('protein_consumed'),
            avg_carbs=Avg('carbs_consumed'),
            avg_fat=Avg('fat_consumed'),
            avg_water=Avg('water_intake_ml')
        )
        
        # Calculate goal achievement
        goal_achievement = {
            'calories': (averages['avg_calories'] / self.nutrition_goal.daily_calorie_goal) * 100 if averages['avg_calories'] else 0,
            'protein': (averages['avg_protein'] / self.nutrition_goal.protein_goal_grams) * 100 if averages['avg_protein'] else 0,
            'carbs': (averages['avg_carbs'] / self.nutrition_goal.carbs_goal_grams) * 100 if averages['avg_carbs'] else 0,
            'fat': (averages['avg_fat'] / self.nutrition_goal.fat_goal_grams) * 100 if averages['avg_fat'] else 0,
            'water': (averages['avg_water'] / self.nutrition_goal.water_goal_ml) * 100 if averages['avg_water'] else 0,
        }
        
        # Generate insights
        insights = self.generate_insights(goal_achievement, averages)
        
        # Calculate nutrition score
        nutrition_score = self.calculate_nutrition_score(goal_achievement)
        
        return {
            'period': f"{start_date} to {end_date}",
            'averages': averages,
            'goals': {
                'calories': self.nutrition_goal.daily_calorie_goal,
                'protein': self.nutrition_goal.protein_goal_grams,
                'carbs': self.nutrition_goal.carbs_goal_grams,
                'fat': self.nutrition_goal.fat_goal_grams,
                'water': self.nutrition_goal.water_goal_ml,
            },
            'goal_achievement': goal_achievement,
            'nutrition_score': nutrition_score,
            'insights': insights,
            'recommendations': self.generate_recommendations(goal_achievement)
        }
    
    def calculate_nutrition_score(self, goal_achievement):
        """Calculate overall nutrition score (0-100)"""
        scores = []
        
        for nutrient, percentage in goal_achievement.items():
            if percentage == 0:
                scores.append(0)
            elif 80 <= percentage <= 120:  # Perfect range
                scores.append(100)
            elif 60 <= percentage < 80 or 120 < percentage <= 140:  # Good range
                scores.append(80)
            elif 40 <= percentage < 60 or 140 < percentage <= 160:  # Fair range
                scores.append(60)
            else:  # Poor range
                scores.append(30)
        
        return round(sum(scores) / len(scores), 1) if scores else 0
    
    def generate_insights(self, goal_achievement, averages):
        """Generate nutrition insights"""
        insights = []
        
        # Calorie insights
        calorie_achievement = goal_achievement['calories']
        if calorie_achievement < 80:
            insights.append("You're consuming fewer calories than recommended. This might slow your metabolism.")
        elif calorie_achievement > 120:
            insights.append("You're exceeding your calorie goals. Consider portion control.")
        else:
            insights.append("Your calorie intake is well-balanced!")
        
        # Protein insights
        protein_achievement = goal_achievement['protein']
        if protein_achievement < 70:
            insights.append("Low protein intake detected. Add more lean proteins to your diet.")
        elif protein_achievement > 150:
            insights.append("Very high protein intake. Ensure you're getting enough carbs and fats.")
        
        # Water insights
        water_achievement = goal_achievement['water']
        if water_achievement < 60:
            insights.append("Increase your water intake for better hydration and metabolism.")
        
        return insights
    
    def generate_recommendations(self, goal_achievement):
        """Generate personalized nutrition recommendations"""
        recommendations = []
        
        # Macro balance recommendations
        if goal_achievement['protein'] < 80:
            recommendations.append({
                'type': 'increase_protein',
                'message': 'Add more fish, eggs, or lentils to your meals',
                'priority': 'high'
            })
        
        if goal_achievement['carbs'] > 130:
            recommendations.append({
                'type': 'reduce_carbs',
                'message': 'Consider replacing some rice with vegetables',
                'priority': 'medium'
            })
        
        if goal_achievement['water'] < 70:
            recommendations.append({
                'type': 'increase_water',
                'message': 'Set hourly water reminders to improve hydration',
                'priority': 'high'
            })
        
        return recommendations
    
    def check_deficiency_risks(self):
        """Check for potential nutrition deficiencies"""
        risks = []
        
        # Analyze recent nutrition data
        recent_logs = CalorieLog.objects.filter(
            user=self.user,
            date_recorded__gte=date.today() - timedelta(days=14)
        )
        
        if recent_logs.exists():
            avg_protein = recent_logs.aggregate(Avg('protein_consumed'))['protein_consumed__avg'] or 0
            
            # Check protein deficiency risk
            if avg_protein < self.nutrition_goal.protein_goal_grams * 0.7:
                risks.append({
                    'nutrient': 'protein',
                    'risk_level': 'moderate',
                    'message': 'Your protein intake has been consistently low',
                    'recommendation': 'Include more fish, chicken, eggs, or lentils in your diet'
                })
        
        # Add more deficiency checks based on user profile
        if self.user.gender == 'F':
            risks.append({
                'nutrient': 'iron',
                'risk_level': 'watch',
                'message': 'Women are at higher risk for iron deficiency',
                'recommendation': 'Include iron-rich foods like spinach, red meat, or fortified cereals'
            })
        
        return risks
