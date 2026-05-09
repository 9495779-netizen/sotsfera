import { apiClient } from './client';
import type { BriefingRecord, BriefingJournal, PaginatedResponse } from '@/types';

export const briefingsApi = {
  getRecords: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<BriefingRecord>>('/briefings/records', { params }).then((r) => r.data),

  conduct: (dto: { employeeId: string; typeId: string; conductedAt: string; instructorId?: string }) =>
    apiClient.post<BriefingRecord>('/briefings/conduct', dto).then((r) => r.data),

  bulkConduct: (dto: { employeeIds: string[]; typeId: string; conductedAt: string }) =>
    apiClient.post('/briefings/conduct/bulk', dto).then((r) => r.data),

  getUpcoming: (days = 30) =>
    apiClient.get<BriefingRecord[]>('/briefings/upcoming', { params: { days } }).then((r) => r.data),

  getJournals: () =>
    apiClient.get<BriefingJournal[]>('/briefings/journals').then((r) => r.data),

  createJournal: (dto: { journalType: string; periodStart: string; periodEnd: string }) =>
    apiClient.post<BriefingJournal>('/briefings/journals', dto).then((r) => r.data),
};
