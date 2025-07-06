import { pool } from './db';

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  url?: string;
  timestamp?: Date;
}

export class Logger {
  private static instance: Logger;
  
  private constructor() {}
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  async log(entry: LogEntry): Promise<void> {
    const logData = {
      ...entry,
      timestamp: entry.timestamp || new Date(),
    };

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      const color = this.getLogColor(entry.level);
      console.log(
        `${color}[${entry.level.toUpperCase()}]${this.resetColor()} ${entry.message}`,
        entry.context ? entry.context : ''
      );
    }

    // Database logging for persistent storage
    try {
      await this.logToDatabase(logData);
    } catch (error) {
      console.error('Failed to log to database:', error);
    }
  }

  private async logToDatabase(entry: LogEntry): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO activity_logs (
          user_id, session_id, level, message, context, 
          user_agent, ip_address, url, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        entry.userId || null,
        entry.sessionId || null,
        entry.level,
        entry.message,
        entry.context ? JSON.stringify(entry.context) : null,
        entry.userAgent || null,
        entry.ipAddress || null,
        entry.url || null,
        entry.timestamp
      ]);
    } catch (error) {
      // Create table if it doesn't exist
      if (error.code === '42P01') {
        await this.createLogTable(client);
        // Retry the insert
        await client.query(`
          INSERT INTO activity_logs (
            user_id, session_id, level, message, context, 
            user_agent, ip_address, url, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          entry.userId || null,
          entry.sessionId || null,
          entry.level,
          entry.message,
          entry.context ? JSON.stringify(entry.context) : null,
          entry.userAgent || null,
          entry.ipAddress || null,
          entry.url || null,
          entry.timestamp
        ]);
      } else {
        throw error;
      }
    } finally {
      client.release();
    }
  }

  private async createLogTable(client: any): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id UUID,
        session_id TEXT,
        level VARCHAR(10) NOT NULL,
        message TEXT NOT NULL,
        context JSONB,
        user_agent TEXT,
        ip_address INET,
        url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_session_id ON activity_logs(session_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
    `);
  }

  private getLogColor(level: string): string {
    switch (level) {
      case 'error': return '\x1b[31m'; // Red
      case 'warn': return '\x1b[33m';  // Yellow
      case 'info': return '\x1b[36m';  // Cyan
      case 'debug': return '\x1b[90m'; // Gray
      default: return '\x1b[0m';       // Reset
    }
  }

  private resetColor(): string {
    return '\x1b[0m';
  }

  // Convenience methods
  async info(message: string, context?: Record<string, any>, metadata?: Partial<LogEntry>): Promise<void> {
    await this.log({ level: 'info', message, context, ...metadata });
  }

  async warn(message: string, context?: Record<string, any>, metadata?: Partial<LogEntry>): Promise<void> {
    await this.log({ level: 'warn', message, context, ...metadata });
  }

  async error(message: string, context?: Record<string, any>, metadata?: Partial<LogEntry>): Promise<void> {
    await this.log({ level: 'error', message, context, ...metadata });
  }

  async debug(message: string, context?: Record<string, any>, metadata?: Partial<LogEntry>): Promise<void> {
    await this.log({ level: 'debug', message, context, ...metadata });
  }

  // Guest session specific logging
  async logGuestAction(action: string, details: Record<string, any>, sessionId?: string): Promise<void> {
    await this.info(`Guest action: ${action}`, {
      action,
      ...details,
      isGuest: true
    }, {
      sessionId,
      userId: `guest_${sessionId?.substring(0, 8) || 'unknown'}`
    });
  }

  // User journey tracking
  async logUserJourney(step: string, userType: 'guest' | 'authenticated', details: Record<string, any>): Promise<void> {
    await this.info(`User journey: ${step}`, {
      step,
      userType,
      ...details,
      timestamp: new Date().toISOString()
    });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export middleware helper
export function createLoggerMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const sessionId = req.cookies?.session;
      const userId = req.headers['x-user-id'];
      
      logger.info(`${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        userAgent: req.headers['user-agent'],
        ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress
      }, {
        sessionId,
        userId,
        userAgent: req.headers['user-agent'],
        ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress,
        url: req.url
      });
    });
    
    next();
  };
}