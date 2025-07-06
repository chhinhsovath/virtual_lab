import { pool } from './db';
import { NextRequest } from 'next/server';

export interface ActivityLogEntry {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  status?: 'success' | 'failure' | 'error';
  errorMessage?: string;
  durationMs?: number;
}

export class ActivityLogger {
  private static instance: ActivityLogger;
  private startTimes: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  startTimer(requestId: string): void {
    this.startTimes.set(requestId, Date.now());
  }

  getElapsedTime(requestId: string): number {
    const startTime = this.startTimes.get(requestId);
    if (!startTime) return 0;
    
    const elapsed = Date.now() - startTime;
    this.startTimes.delete(requestId);
    return elapsed;
  }

  async log(entry: ActivityLogEntry): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO activity_logs (
          user_id, action, resource_type, resource_id, 
          details, ip_address, user_agent, session_id,
          status, error_message, duration_ms
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          entry.userId || null,
          entry.action,
          entry.resourceType || null,
          entry.resourceId || null,
          entry.details ? JSON.stringify(entry.details) : null,
          entry.ipAddress || null,
          entry.userAgent || null,
          entry.sessionId || null,
          entry.status || 'success',
          entry.errorMessage || null,
          entry.durationMs || null
        ]
      );
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw - logging failures shouldn't break the application
    } finally {
      client.release();
    }
  }

  async logApiRequest(
    request: NextRequest,
    response: { status: number; body?: any },
    userId?: string,
    sessionId?: string,
    error?: Error
  ): Promise<void> {
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
    const durationMs = this.getElapsedTime(requestId);

    const details: Record<string, any> = {
      method: request.method,
      url: request.url,
      pathname: new URL(request.url).pathname,
      query: Object.fromEntries(new URL(request.url).searchParams),
      responseStatus: response.status,
      requestSize: request.headers.get('content-length') || '0',
    };

    // Don't log sensitive data
    const pathname = new URL(request.url).pathname;
    if (!pathname.includes('/auth/') && !pathname.includes('/api/auth/')) {
      details.requestBody = await this.sanitizeBody(request);
    }

    await this.log({
      userId,
      action: `API_${request.method}_${pathname}`,
      resourceType: 'api',
      resourceId: requestId,
      details,
      ipAddress: this.getIpAddress(request),
      userAgent: request.headers.get('user-agent') || undefined,
      sessionId,
      status: error ? 'error' : response.status >= 400 ? 'failure' : 'success',
      errorMessage: error?.message,
      durationMs
    });
  }

  async logUserAction(
    action: string,
    userId: string,
    resourceType?: string,
    resourceId?: string,
    details?: Record<string, any>,
    status: 'success' | 'failure' | 'error' = 'success',
    errorMessage?: string
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resourceType,
      resourceId,
      details,
      status,
      errorMessage
    });
  }

  async logLogin(
    userId: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    await this.log({
      userId: success ? userId : undefined,
      action: 'USER_LOGIN',
      resourceType: 'auth',
      details: { 
        success,
        timestamp: new Date().toISOString()
      },
      ipAddress,
      userAgent,
      status: success ? 'success' : 'failure',
      errorMessage
    });
  }

  async logLogout(
    userId: string,
    sessionId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'USER_LOGOUT',
      resourceType: 'auth',
      details: { 
        sessionId,
        timestamp: new Date().toISOString()
      },
      ipAddress,
      userAgent,
      sessionId,
      status: 'success'
    });
  }

  async logDataModification(
    userId: string,
    tableName: string,
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    recordId: string,
    changes?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      action: `DATA_${operation}`,
      resourceType: tableName,
      resourceId: recordId,
      details: {
        operation,
        changes: this.sanitizeChanges(changes),
        timestamp: new Date().toISOString()
      },
      status: 'success'
    });
  }

  async logBulkOperation(
    userId: string,
    operationType: string,
    totalRecords: number,
    successCount: number,
    errorCount: number,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      action: `BULK_${operationType.toUpperCase()}`,
      resourceType: 'bulk_operation',
      details: {
        totalRecords,
        successCount,
        errorCount,
        ...details
      },
      status: errorCount > 0 ? 'failure' : 'success'
    });
  }

  async logSecurityEvent(
    action: string,
    userId?: string,
    ipAddress?: string,
    details?: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    await this.log({
      userId,
      action: `SECURITY_${action.toUpperCase()}`,
      resourceType: 'security',
      details: {
        severity,
        ...details,
        timestamp: new Date().toISOString()
      },
      ipAddress,
      status: 'success'
    });
  }

  // Utility methods
  private getIpAddress(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
           request.headers.get('x-real-ip') ||
           request.headers.get('cf-connecting-ip') ||
           'unknown';
  }

  private async sanitizeBody(request: NextRequest): Promise<any> {
    try {
      const contentType = request.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return null;
      }

      const body = await request.clone().json();
      return this.sanitizeObject(body);
    } catch {
      return null;
    }
  }

  private sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credit_card', 'ssn'];
    const sanitized = { ...obj };

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeObject(sanitized[key]);
      }
    }

    return sanitized;
  }

  private sanitizeChanges(changes?: Record<string, any>): Record<string, any> | undefined {
    if (!changes) return undefined;
    return this.sanitizeObject(changes);
  }

  // Analytics methods
  async getUserActivitySummary(userId: string, date: Date): Promise<void> {
    const client = await pool.connect();
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      await client.query(`
        INSERT INTO user_activity_summary (user_id, activity_date, login_count, api_calls, data_modifications)
        VALUES ($1, $2, 0, 0, 0)
        ON CONFLICT (user_id, activity_date) DO NOTHING
      `, [userId, dateStr]);

      // This would typically be called by a scheduled job to aggregate data
    } finally {
      client.release();
    }
  }

  // System health logging
  async logSystemHealth(
    metricType: string,
    value: number,
    unit?: string,
    details?: Record<string, any>
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO system_health_metrics (
          metric_type, metric_value, metric_unit, details
        ) VALUES ($1, $2, $3, $4)`,
        [metricType, value, unit || null, details ? JSON.stringify(details) : null]
      );
    } catch (error) {
      console.error('Failed to log system health metric:', error);
    } finally {
      client.release();
    }
  }
}

// Export singleton instance
export const activityLogger = ActivityLogger.getInstance();