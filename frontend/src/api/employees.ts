import { apiClient } from './client';
import type { Employee, PaginatedResponse } from '@/types';

export interface EmployeeFilter {
  deptId?: string;
  positionId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const employeesApi = {
  getAll: (params: EmployeeFilter) =>
    apiClient.get<PaginatedResponse<Employee>>('/employees', { params }).then((r) => r.data),

  getOne: (id: string) =>
    apiClient.get<Employee>(`/employees/${id}`).then((r) => r.data),

  create: (dto: Partial<Employee>) =>
    apiClient.post<Employee>('/employees', dto).then((r) => r.data),

  update: (id: string, dto: Partial<Employee>) =>
    apiClient.put<Employee>(`/employees/${id}`, dto).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/employees/${id}`),

  importExcel: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.post<{ created: number; errors: string[] }>('/employees/import/excel', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};
