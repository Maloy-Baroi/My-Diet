import apiService from './apiService';

export interface TodoItem {
  id: number;
  date_of_meal: string;
  day: number;
  is_completed: boolean;
  meal: string;
  meal_time: string;
}

export interface TodoListResponse {
  todo_list: TodoItem[];
}

// Legacy interface for backward compatibility
export interface LegacyTodoListResponse {
  id: number;
  user: number;
  date: string;
  breakfast_completed: boolean;
  lunch_completed: boolean;
  dinner_completed: boolean;
  breakfast_time?: string;
  lunch_time?: string;
  dinner_time?: string;
  breakfast_details?: string;
  lunch_details?: string;
  dinner_details?: string;
  created_at: string;
  updated_at: string;
}

// Frontend format for meal tasks
export interface MealTask {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  title: string;
  completed: boolean;
  time: string;
  details: string;
}

class TodoService {
  // Get all todo items (new API endpoint)
  async getTodoItems(): Promise<TodoListResponse> {
    try {
      const response = await apiService.get<TodoListResponse>('/diet/todo/');
      console.log('TodoService.getTodoItems response:', response);
      
      // Ensure response has the expected structure
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid API response: response is not an object');
      }
      
      if (!response.todo_list || !Array.isArray(response.todo_list)) {
        console.log('API response missing todo_list array, creating empty todo_list');
        return {
          todo_list: [],
        };
      }
      
      return response;
    } catch (error) {
      console.error('TodoService.getTodoItems error:', error);
      throw error;
    }
  }

  // Update multiple todo items completion status (new API endpoint)
  // NOTE: Backend requires ALL 4 items and ALL must be completed to update
  async updateMultipleTodoCompletion(items: Array<{id: number, is_completed: boolean}>): Promise<{message: string, items: TodoItem[]}> {
    try {
      // Validate that exactly 4 items are provided
      if (items.length !== 4) {
        throw new Error('Exactly 4 items must be provided (Breakfast, Lunch, Dinner, Snacks)');
      }

      // Validate that all items are marked as completed
      const allCompleted = items.every(item => item.is_completed);
      if (!allCompleted) {
        throw new Error('All 4 items must be marked as completed to update');
      }

      return await apiService.patch<{message: string, items: TodoItem[]}>('/diet/todo/', {
        items
      });
    } catch (error) {
      throw error;
    }
  }

  // Complete all meals for today (convenience method)
  async completeAllMealsForToday(todoItems: TodoItem[]): Promise<{message: string, items: TodoItem[]}> {
    try {
      // Filter today's items
      const today = new Date().toISOString().split('T')[0];
      const todayItems = todoItems.filter(item => item.date_of_meal === today);

      if (todayItems.length !== 4) {
        throw new Error(`Expected 4 meals for today, found ${todayItems.length}`);
      }

      // Mark all items as completed
      const itemsToUpdate = todayItems.map(item => ({
        id: item.id,
        is_completed: true
      }));

      return await this.updateMultipleTodoCompletion(itemsToUpdate);
    } catch (error) {
      throw error;
    }
  }

  // Get today's todo list (legacy endpoint - keeping for backward compatibility)
  async getTodayTodoList(): Promise<LegacyTodoListResponse> {
    try {
      const today = new Date().toISOString().split('T')[0];
      return await apiService.get<LegacyTodoListResponse>(`/todo-list/${today}/`);
    } catch (error) {
      throw error;
    }
  }

  // Get todo list for specific date (legacy)
  async getTodoListByDate(date: string): Promise<LegacyTodoListResponse> {
    try {
      return await apiService.get<LegacyTodoListResponse>(`/todo-list/${date}/`);
    } catch (error) {
      throw error;
    }
  }

  // Update meal completion status (legacy)
  async updateMealCompletion(
    date: string, 
    mealType: 'breakfast' | 'lunch' | 'dinner', 
    completed: boolean
  ): Promise<LegacyTodoListResponse> {
    try {
      const updateData = {
        [`${mealType}_completed`]: completed,
      };
      return await apiService.patch<LegacyTodoListResponse>(`/todo-list/${date}/`, updateData);
    } catch (error) {
      throw error;
    }
  }

  // Create or update todo list for a date (legacy)
  async createOrUpdateTodoList(date: string, data: Partial<LegacyTodoListResponse>): Promise<LegacyTodoListResponse> {
    try {
      return await apiService.post<LegacyTodoListResponse>('/todo-list/', {
        date,
        ...data,
      });
    } catch (error) {
      throw error;
    }
  }

  // Get todo list for date range (legacy)
  async getTodoListRange(startDate: string, endDate: string): Promise<LegacyTodoListResponse[]> {
    try {
      return await apiService.get<LegacyTodoListResponse[]>('/todo-list/', {
        start_date: startDate,
        end_date: endDate,
      });
    } catch (error) {
      throw error;
    }
  }

  // Convert new API response to meal task format
  convertTodoItemsToMealTasks(todoItems: TodoItem[] | undefined): MealTask[] {
    const today = new Date().toISOString().split('T')[0];
    
    // Handle undefined or null todoItems
    if (!todoItems || !Array.isArray(todoItems)) {
      console.log('TodoItems is undefined or not an array, using default meals');
      return this.getDefaultMealTasks();
    }
    
    // Filter today's items and create meal tasks
    const todayItems = todoItems.filter(item => 
      item.date_of_meal === today
    );

    // Group items by meal_time and convert to MealTask format
    const mealTasks: MealTask[] = [];
    
    // Process each meal type
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
    
    mealTypes.forEach(mealType => {
      const mealItem = todayItems.find(item => 
        item.meal_time === mealType
      );

      if (mealItem) {
        const type = mealType.toLowerCase() as 'breakfast' | 'lunch' | 'dinner';
        // Handle snacks as a special case
        const taskType = type === 'snacks' ? 'dinner' : type; // Map snacks to dinner for now
        
        mealTasks.push({
          id: mealItem.id.toString(),
          type: taskType,
          title: mealType,
          completed: mealItem.is_completed,
          time: this.getMealTime(mealType),
          details: mealItem.meal,
        });
      }
    });

    // If no items found, return default meal tasks
    if (mealTasks.length === 0) {
      return this.getDefaultMealTasks();
    }

    return mealTasks;
  }

  // Helper method to get default meal times
  private getMealTime(mealType: string): string {
    switch (mealType) {
      case 'Breakfast':
        return '08:00 AM';
      case 'Lunch':
        return '01:00 PM';
      case 'Dinner':
        return '07:00 PM';
      case 'Snacks':
        return '10:00 AM';
      default:
        return '12:00 PM';
    }
  }

  // Get default meal tasks
  private getDefaultMealTasks(): MealTask[] {
    return [
      {
        id: 'breakfast',
        type: 'breakfast',
        title: 'Breakfast',
        completed: false,
        time: '08:00 AM',
        details: 'Healthy breakfast meal',
      },
      {
        id: 'lunch',
        type: 'lunch',
        title: 'Lunch',
        completed: false,
        time: '01:00 PM',
        details: 'Nutritious lunch meal',
      },
      {
        id: 'dinner',
        type: 'dinner',
        title: 'Dinner',
        completed: false,
        time: '07:00 PM',
        details: 'Balanced dinner meal',
      },
    ];
  }

  // Convert backend response to frontend format (legacy)
  convertToFrontendFormat(backendData: LegacyTodoListResponse): MealTask[] {
    const items: MealTask[] = [
      {
        id: '1',
        type: 'breakfast',
        title: 'Breakfast',
        completed: backendData.breakfast_completed,
        time: backendData.breakfast_time || '08:00 AM',
        details: backendData.breakfast_details || 'Healthy breakfast meal',
      },
      {
        id: '2',
        type: 'lunch',
        title: 'Lunch',
        completed: backendData.lunch_completed,
        time: backendData.lunch_time || '01:00 PM',
        details: backendData.lunch_details || 'Nutritious lunch meal',
      },
      {
        id: '3',
        type: 'dinner',
        title: 'Dinner',
        completed: backendData.dinner_completed,
        time: backendData.dinner_time || '07:00 PM',
        details: backendData.dinner_details || 'Balanced dinner meal',
      },
    ];

    return items;
  }

  // Get weekly completion stats
  async getWeeklyStats(): Promise<{
    week_start: string;
    week_end: string;
    total_meals: number;
    completed_meals: number;
    completion_percentage: number;
    daily_stats: Array<{
      date: string;
      completed_meals: number;
      total_meals: number;
    }>;
  }> {
    try {
      return await apiService.get('/todo-list/weekly-stats/');
    } catch (error) {
      throw error;
    }
  }

  // Set meal reminder
  async setMealReminder(
    date: string,
    mealType: 'breakfast' | 'lunch' | 'dinner',
    time: string
  ): Promise<void> {
    try {
      await apiService.post('/todo-list/set-reminder/', {
        date,
        meal_type: mealType,
        time,
      });
    } catch (error) {
      throw error;
    }
  }
}

export const todoService = new TodoService();
export default todoService;
