import { UserRole } from '../../users/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  orgId: string | null;
  iat?: number;
  exp?: number;
}
