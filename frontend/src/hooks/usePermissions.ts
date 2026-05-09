import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role as UserRole);
  };

  const isAdmin = hasRole('platform_admin');
  const isOtSpecialist = hasRole('ot_specialist', 'director');
  const isDeptHead = hasRole('dept_head');
  const isWorker = hasRole('worker');

  return { hasRole, isAdmin, isOtSpecialist, isDeptHead, isWorker, role: user?.role };
}
