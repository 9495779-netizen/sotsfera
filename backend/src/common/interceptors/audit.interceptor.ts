import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

const MUTABLE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();

    if (!MUTABLE_METHODS.has(req.method)) return next.handle();

    const user = req.user;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: async () => {
          await this.writeLog(req, user, context.switchToHttp().getResponse().statusCode);
        },
        error: async (err) => {
          await this.writeLog(req, user, err.status || 500);
        },
      }),
    );
  }

  private async writeLog(req: any, user: any, statusCode: number) {
    try {
      const log = this.auditRepo.create({
        orgId: user?.orgId,
        userId: user?.sub,
        method: req.method,
        path: req.url,
        payload: req.body,
        ipAddress: req.ip,
        statusCode,
      });
      await this.auditRepo.save(log);
    } catch {
      // Аудит не должен ломать основной поток
    }
  }
}
