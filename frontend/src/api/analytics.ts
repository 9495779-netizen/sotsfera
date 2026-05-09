import { apiClient } from './client';
import type { DashboardMetrics } from '@/types';

export const analyticsApi = {
  getDashboard: () =>
    apiClient.get<DashboardMetrics>('/analytics/dashboard').then((r) => r.data),

  getUpcoming: (limit = 10) =>
    apiClient.get('/analytics/upcoming', { params: { limit } }).then((r) => r.data),

  getByDepartment: () =>
    apiClient.get('/analytics/by-department').then((r) => r.data),

  exportBriefings: (from?: string, to?: string) =>
    apiClient.get('/analytics/export/briefings', {
      params: { from, to },
      responseType: 'blob',
    }).then((r) => r.data as Blob),
};
