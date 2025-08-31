# My-Diet System

A comprehensive Django-based diet management system with AI-powered meal planning, nutrition tracking, and progress monitoring.

## Features

### Core Functionality
- **User Management**: Custom user profiles with health metrics and preferences
- **AI Diet Planning**: Intelligent meal plan generation based on user goals and preferences  
- **Nutrition Tracking**: Detailed calorie and macronutrient monitoring
- **Progress Monitoring**: Weight tracking, achievements, and analytics
- **Smart Notifications**: Meal reminders and motivational messages

### Specialized Features  
- **Ramadan Diet Plans**: Specialized meal planning for Suhoor and Iftar
- **Dietary Restrictions**: Support for vegetarian, vegan, halal diets
- **Allergy Management**: Automatic food filtering based on allergies
- **Regional Cuisine**: Focus on Bangladeshi foods and cuisines

## Project Structure

```
My-Diet/
├── diet_system/           # Django project settings
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── asgi.py
│   └── celery.py         # Celery configuration
├── accounts/             # User management app
│   ├── models.py         # Custom User model
│   ├── views.py          # User profile views
│   ├── serializers.py    # User serializers
│   └── admin.py          # User admin
├── diet_plans/           # Diet planning app
│   ├── models.py         # DietPlan, Food, Meal models
│   ├── views.py          # Diet plan views
│   ├── serializers.py    # Diet plan serializers
│   ├── ai_engine.py      # AI meal planning engine
│   ├── admin.py          # Diet plan admin
│   └── management/       # Management commands
│       └── commands/
│           └── populate_foods.py
├── nutrition/            # Nutrition tracking app
│   ├── models.py         # Nutrition goals and tracking
│   ├── views.py          # Nutrition views
│   ├── serializers.py    # Nutrition serializers
│   └── analytics.py      # Nutrition analysis engine
├── progress/             # Progress tracking app
│   ├── models.py         # Weight logs, achievements
│   ├── views.py          # Progress views
│   └── serializers.py    # Progress serializers
├── notifications/        # Notification system
│   ├── models.py         # Notification models
│   ├── views.py          # Notification views
│   ├── serializers.py    # Notification serializers
│   └── tasks.py          # Celery tasks
├── api/                  # API utilities
│   └── dashboard_views.py # Dashboard API
├── requirements.txt      # Python dependencies
├── manage.py            # Django management script
├── .env.example         # Environment variables template
└── README.md           # This file
```

## Installation

### Prerequisites
- Python 3.8+
- PostgreSQL
- Redis (for Celery)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd My-Diet
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis credentials
   ```

5. **Database setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Populate initial data**
   ```bash
   python manage.py populate_foods
   ```

7. **Run the development server**
   ```bash
   python manage.py runserver
   ```

8. **Start Celery (in separate terminal)**
   ```bash
   celery -A diet_system worker --loglevel=info
   celery -A diet_system beat --loglevel=info
   ```

## API Endpoints

### Authentication
- `POST /api/auth/users/` - Register new user
- `POST /api/auth/jwt/create/` - Login (get JWT tokens)
- `POST /api/auth/jwt/refresh/` - Refresh JWT token

### User Management
- `GET /api/users/profile/` - Get user profile
- `PATCH /api/users/update_profile/` - Update profile

### Diet Plans
- `GET /api/diet-plans/` - List user's diet plans
- `POST /api/diet-plans/generate_ai_plan/` - Generate AI diet plan
- `GET /api/diet-plans/{id}/daily_meals/?day=1` - Get meals for specific day
- `POST /api/diet-plans/{id}/complete_meal/` - Mark meal as completed

### Nutrition
- `GET /api/nutrition-goals/` - Get nutrition goals
- `POST /api/nutrition-goals/calculate_goals/` - Calculate personalized goals
- `GET /api/nutrition-tracking/nutrition_analysis/` - Get nutrition analysis

### Progress
- `GET /api/weight-logs/` - List weight logs
- `POST /api/weight-logs/` - Log weight
- `GET /api/weight-logs/weight_trend/` - Get weight trend data
- `POST /api/calorie-logs/log_water/` - Log water intake

### Dashboard
- `GET /api/dashboard/` - Get comprehensive dashboard data

## Key Features

### AI Diet Planning Engine
The system includes an intelligent meal planning engine that:
- Considers user goals (weight loss/gain, muscle building)
- Respects dietary restrictions and allergies
- Provides variety in meal selection
- Adjusts for special diets (Ramadan, vegetarian, etc.)

### Nutrition Analysis
Advanced nutrition tracking with:
- Macro and micronutrient analysis
- Goal achievement percentages
- Personalized recommendations
- Deficiency risk assessment

### Progress Monitoring
Comprehensive progress tracking including:
- Weight trend analysis
- Achievement system
- BMI calculations
- Goal progress visualization

### Smart Notifications
Automated notification system for:
- Meal reminders
- Water intake reminders
- Achievement notifications
- Motivational messages

## Technology Stack

- **Backend**: Django 4.2, Django REST Framework
- **Database**: PostgreSQL
- **Cache/Message Broker**: Redis
- **Task Queue**: Celery
- **Authentication**: JWT (Simple JWT)
- **API Documentation**: DRF built-in browsable API

## Configuration

### Environment Variables
See `.env.example` for required environment variables:
- Database credentials
- Redis URL
- Django secret key
- Debug settings

### Celery Tasks
The system uses Celery for background tasks:
- Sending meal reminders
- Water intake reminders
- Nutrition analysis
- Achievement processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the repository.