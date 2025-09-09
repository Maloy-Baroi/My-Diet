import apiService from './apiService';

export interface TodoItem {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  title: string;
  completed: boolean;
  time: string;
  details: string;
  date: string;
  user_id?: number;
}

export interface TodoListResponse {
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

class TodoService {
  // Get today's todo list
  async getTodayTodoList(): Promise<TodoListResponse> {
    try {
      const today = new Date().toISOString().split('T')[0];
      return await apiService.get<TodoListResponse>(`/todo-list/${today}/`);
    } catch (error) {
      throw error;
    }
  }

  // Get todo list for specific date
  async getTodoListByDate(date: string): Promise<TodoListResponse> {
    try {
      return await apiService.get<TodoListResponse>(`/todo-list/${date}/`);
    } catch (error) {
      throw error;
    }
  }

  // Update meal completion status
  async updateMealCompletion(
    date: string, 
    mealType: 'breakfast' | 'lunch' | 'dinner', 
    completed: boolean
  ): Promise<TodoListResponse> {
    try {
      const updateData = {
        [`${mealType}_completed`]: completed,
      };
      return await apiService.patch<TodoListResponse>(`/todo-list/${date}/`, updateData);
    } catch (error) {
      throw error;
    }
  }

  // Create or update todo list for a date
  async createOrUpdateTodoList(date: string, data: Partial<TodoListResponse>): Promise<TodoListResponse> {
    try {
      return await apiService.post<TodoListResponse>('/todo-list/', {
        date,
        ...data,
      });
    } catch (error) {
      throw error;
    }
  }

  // Get todo list for date range
  async getTodoListRange(startDate: string, endDate: string): Promise<TodoListResponse[]> {
    try {
      return await apiService.get<TodoListResponse[]>('/todo-list/', {
        start_date: startDate,
        end_date: endDate,
      });
    } catch (error) {
      throw error;
    }
  }

  // Convert backend response to frontend format
  convertToFrontendFormat(backendData: TodoListResponse): TodoItem[] {
    const items: TodoItem[] = [
      {
        id: '1',
        type: 'breakfast',
        title: 'Breakfast',
        completed: backendData.breakfast_completed,
        time: backendData.breakfast_time || '08:00 AM',
        details: backendData.breakfast_details || 'Healthy breakfast meal',
        date: backendData.date,
        user_id: backendData.user,
      },
      {
        id: '2',
        type: 'lunch',
        title: 'Lunch',
        completed: backendData.lunch_completed,
        time: backendData.lunch_time || '01:00 PM',
        details: backendData.lunch_details || 'Nutritious lunch meal',
        date: backendData.date,
        user_id: backendData.user,
      },
      {
        id: '3',
        type: 'dinner',
        title: 'Dinner',
        completed: backendData.dinner_completed,
        time: backendData.dinner_time || '07:00 PM',
        details: backendData.dinner_details || 'Balanced dinner meal',
        date: backendData.date,
        user_id: backendData.user,
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
