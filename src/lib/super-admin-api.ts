import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './auth';
import { activityLogger } from './activity-logger';
import { pool } from './db';

export interface ApiContext {
  user: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
  sessionId: string;
  requestId: string;
}

type ApiHandler = (
  request: NextRequest,
  context: ApiContext,
  params?: any
) => Promise<NextResponse>;

export function withSuperAdmin(handler: ApiHandler) {
  return async function (
    request: NextRequest,
    params?: any
  ): Promise<NextResponse> {
    const requestId = crypto.randomUUID();
    request.headers.set('x-request-id', requestId);
    activityLogger.startTimer(requestId);

    try {
      // Get session
      const session = await getSession(request);
      if (!session) {
        const response = NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
        
        await activityLogger.logApiRequest(
          request,
          { status: 401 },
          undefined,
          undefined
        );
        
        return response;
      }

      // Check super admin role
      if (session.user.role !== 'super_admin') {
        const response = NextResponse.json(
          { error: 'Forbidden - Super Admin access required' },
          { status: 403 }
        );
        
        await activityLogger.logApiRequest(
          request,
          { status: 403 },
          session.user.id,
          session.sessionId
        );

        await activityLogger.logSecurityEvent(
          'UNAUTHORIZED_SUPER_ADMIN_ACCESS',
          session.user.id,
          activityLogger['getIpAddress'](request),
          {
            attemptedUrl: request.url,
            userRole: session.user.role
          },
          'high'
        );
        
        return response;
      }

      // Create context
      const context: ApiContext = {
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          permissions: session.user.permissions
        },
        sessionId: session.sessionId,
        requestId
      };

      // Call handler
      const response = await handler(request, context, params);

      // Log successful request
      await activityLogger.logApiRequest(
        request,
        { 
          status: response.status,
          body: response.status < 400 ? await response.clone().json().catch(() => null) : null
        },
        session.user.id,
        session.sessionId
      );

      return response;
    } catch (error) {
      console.error('Super Admin API Error:', error);

      const errorResponse = NextResponse.json(
        { 
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );

      await activityLogger.logApiRequest(
        request,
        { status: 500 },
        undefined,
        undefined,
        error instanceof Error ? error : new Error('Unknown error')
      );

      return errorResponse;
    }
  };
}

// Rate limiting for super admin APIs
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
) {
  return function (handler: ApiHandler): ApiHandler {
    return async function (
      request: NextRequest,
      context: ApiContext,
      params?: any
    ): Promise<NextResponse> {
      const key = `${context.user.id}:${request.url}`;
      const now = Date.now();
      
      const limit = rateLimitMap.get(key);
      if (!limit || now > limit.resetTime) {
        rateLimitMap.set(key, {
          count: 1,
          resetTime: now + windowMs
        });
      } else {
        limit.count++;
        
        if (limit.count > maxRequests) {
          await activityLogger.logSecurityEvent(
            'RATE_LIMIT_EXCEEDED',
            context.user.id,
            activityLogger['getIpAddress'](request),
            {
              endpoint: request.url,
              requests: limit.count,
              limit: maxRequests
            },
            'medium'
          );

          return NextResponse.json(
            { error: 'Too Many Requests' },
            { status: 429 }
          );
        }
      }

      return handler(request, context, params);
    };
  };
}

// Pagination helper
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

// Response helpers
export function successResponse(data: any, meta?: any): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta })
  });
}

export function errorResponse(
  message: string,
  status: number = 400,
  errors?: any
): NextResponse {
  return NextResponse.json({
    success: false,
    error: message,
    ...(errors && { errors })
  }, { status });
}

// Database transaction helper
export async function withTransaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Validation helpers
export function validateRequiredFields(
  data: any,
  fields: string[]
): { valid: boolean; missing: string[] } {
  const missing = fields.filter(field => !data[field]);
  return {
    valid: missing.length === 0,
    missing
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Search and filter helpers
export interface SearchFilters {
  search?: string;
  filters: Record<string, any>;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export function parseSearchFilters(searchParams: URLSearchParams): SearchFilters {
  const search = searchParams.get('search') || undefined;
  const orderBy = searchParams.get('orderBy') || undefined;
  const orderDirection = (searchParams.get('orderDirection')?.toUpperCase() || 'ASC') as 'ASC' | 'DESC';
  
  const filters: Record<string, any> = {};
  for (const [key, value] of searchParams.entries()) {
    if (!['search', 'page', 'limit', 'orderBy', 'orderDirection'].includes(key)) {
      filters[key] = value;
    }
  }
  
  return { search, filters, orderBy, orderDirection };
}

// Bulk operation helper
export async function processBulkOperation<T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  options: {
    batchSize?: number;
    onProgress?: (processed: number, total: number) => void;
    userId: string;
    operationType: string;
  }
): Promise<{ successCount: number; errorCount: number; errors: any[] }> {
  const { batchSize = 10, onProgress, userId, operationType } = options;
  const errors: any[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (item, index) => {
        try {
          await processor(item);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            index: i + index,
            item,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      })
    );

    if (onProgress) {
      onProgress(i + batch.length, items.length);
    }
  }

  await activityLogger.logBulkOperation(
    userId,
    operationType,
    items.length,
    successCount,
    errorCount,
    { errors: errors.slice(0, 10) } // Log first 10 errors
  );

  return { successCount, errorCount, errors };
}

// Export helper
export async function generateCSV(
  data: any[],
  columns: { key: string; label: string }[]
): Promise<string> {
  if (data.length === 0) return '';

  // Header
  const header = columns.map(col => `"${col.label}"`).join(',');
  
  // Rows
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [header, ...rows].join('\n');
}