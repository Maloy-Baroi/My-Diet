# New Screens Implementation

## Overview
Two new screens have been implemented as per your design specifications:

### 1. To-do Alarm Screen (`TodoAlarmScreen.tsx`)
**Location**: `/src/screens/todo/TodoAlarmScreen.tsx`

**Features**:
- ✅ Today's date display
- ✅ Daily progress tracking (shows completed meals out of total)
- ✅ Breakfast, Lunch, and Dinner task cards with:
  - Meal type icons (sun for breakfast, partly-sunny for lunch, moon for dinner)
  - Completion status (tap to mark done/undone)
  - Meal details and timing
  - Visual completion overlay
- ✅ Quick actions (Refresh, Weekly Stats)
- ✅ Pull-to-refresh functionality
- ✅ Integration with Django backend via `todoService`

**Backend Integration**:
- Connects to Django `ToDoList` model
- Updates meal completion status in real-time
- Supports setting meal reminders
- Fallback to offline data if API unavailable

### 2. Diet Screen (`DietPlanScreen.tsx` - Updated)
**Location**: `/src/screens/diet/DietPlanScreen.tsx`

**Features**:
- ✅ "Generate Diet Plan" button as prominently displayed
- ✅ 30-day meal plan list with 3 meals per day
- ✅ Each day shows:
  - Day number and date
  - Breakfast, lunch, and dinner details
  - Completion status icon
- ✅ Summary statistics (30 days, 90 meals, regenerate option)
- ✅ Loading states and error handling
- ✅ Integration with Django backend

**Backend Integration**:
- Calls Django `GenerateDietPlanAPIView` endpoint
- Supports both Regular and Ramadan meal types
- Handles different goals (weight_loss, muscle_gain, maintenance)
- Fetches detailed meal plans from backend
- Fallback to sample data if API unavailable

## Services Created

### 1. Todo Service (`todoService.ts`)
**Location**: `/src/services/todoService.ts`

**Methods**:
- `getTodayTodoList()` - Get today's meal tasks
- `getTodoListByDate(date)` - Get tasks for specific date
- `updateMealCompletion()` - Mark meals as complete/incomplete
- `setMealReminder()` - Set meal reminders
- `getWeeklyStats()` - Get completion statistics
- `convertToFrontendFormat()` - Convert backend data to frontend format

### 2. Updated Diet Service (`dietService.ts`)
**Added Methods**:
- `generateDietPlan(mealType, goal)` - Generate new diet plan
- `getGeneratedMealPlan(id)` - Get detailed meal plan by ID

## Navigation Integration
Both screens are integrated into the main tab navigation:
- **Todo** tab added with checkmark icon
- **Diet** tab updated with new functionality
- Consistent navigation patterns maintained

## API Endpoints Expected

### Todo/Alarm Screen
```
GET /api/todo-list/{date}/          # Get todo list for date
PATCH /api/todo-list/{date}/        # Update meal completion
POST /api/todo-list/set-reminder/   # Set meal reminder
GET /api/todo-list/weekly-stats/    # Get weekly statistics
```

### Diet Plan Screen
```
POST /api/diet/generate/           # Generate new diet plan
GET /api/diet/generated/{id}/      # Get generated meal plan details
```

## Error Handling
Both screens include comprehensive error handling:
- Network connectivity issues
- API failures with fallback data
- User-friendly error messages
- Retry mechanisms

## Styling
Both screens follow the app's design system:
- Consistent color scheme
- Card-based layouts
- iOS-style icons and animations
- Responsive design
- Accessibility considerations

## Usage Examples

### Generating a Diet Plan
```typescript
// User taps "Generate Diet Plan" button
// API call to Django backend with user preferences
// 30-day meal plan generated and displayed
// Each day shows breakfast, lunch, dinner
```

### Managing Daily Tasks
```typescript
// User opens Todo screen
// Today's meal tasks loaded from backend
// User can mark meals as complete
// Progress tracked and displayed
// Reminders can be set for meals
```

## Future Enhancements
- Push notifications for meal reminders
- Weekly/monthly progress analytics
- Custom meal preferences
- Offline synchronization
- Meal photo uploads
- Social sharing features
