import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { StatusType } from '@/types';

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '—';
  return format(d, 'dd.MM.yyyy', { locale: ru });
}

export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '—';
  return format(d, 'dd.MM.yyyy HH:mm', { locale: ru });
}

export function daysUntil(date: string | Date | undefined | null): number | null {
  if (!date) return null;
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return null;
  return differenceInDays(d, new Date());
}

export function deadlineStatus(date: string | Date | undefined | null): StatusType {
  const days = daysUntil(date);
  if (days === null) return 'neutral';
  if (days < 0) return 'danger';
  if (days <= 3) return 'danger';
  if (days <= 14) return 'warning';
  return 'ok';
}

export function formatDaysLeft(days: number | null): string {
  if (days === null) return '—';
  if (days < 0) return `просрочено ${Math.abs(days)} дн.`;
  if (days === 0) return 'сегодня';
  return `${days} дн.`;
}

export const BRIEFING_STATUS_LABELS: Record<string, string> = {
  запланирован: 'Запланирован',
  проведён: 'Проведён',
  просрочен: 'Просрочен',
};

export const EXAM_TYPE_LABELS: Record<string, string> = {
  предварительный: 'Предварительный',
  периодический: 'Периодический',
};

export const CONCLUSION_LABELS: Record<string, string> = {
  годен: 'Годен',
  'не годен': 'Не годен',
  'годен с ограничениями': 'Годен с ограничениями',
};
