import apiService from './apiService';
import { DashboardData } from '../types';

class DashboardService {
  // Get comprehensive dashboard data
  async getDashboardData(): Promise<DashboardData> {
    try {
      return await apiService.get<DashboardData>('/dashboard/');
    } catch (error) {
      throw error;
    }
  }

  // Get dashboard summary
  async getDashboardSummary(): Promise<any> {
    try {
      return await apiService.get('/dashboard/summary/');
    } catch (error) {
      throw error;
    }
  }

  // Get quick stats
  async getQuickStats(): Promise<any> {
    try {
      return await apiService.get('/dashboard/quick_stats/');
    } catch (error) {
      throw error;
    }
  }

  // Get recent activity
  async getRecentActivity(): Promise<any> {
    try {
      return await apiService.get('/dashboard/recent_activity/');
    } catch (error) {
      throw error;
    }
  }

  // Get progress overview
  async getProgressOverview(): Promise<any> {
    try {
      return await apiService.get('/dashboard/progress/');
    } catch (error) {
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
