-- Super Admin Infrastructure Migration
-- This migration adds comprehensive super admin functionality to Virtual Lab Cambodia

-- 1. Activity Logs Table
-- Tracks all user activities for audit and monitoring
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'error')),
  error_message TEXT,
  duration_ms INTEGER, -- Time taken for the action in milliseconds
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. System Settings Table
-- Stores configurable system settings
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  is_sensitive BOOLEAN DEFAULT false, -- For settings that should be encrypted
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Report Templates Table
-- Stores report configurations for various reports
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('school', 'teacher', 'student', 'assessment', 'provincial', 'custom')),
  template_config JSONB NOT NULL, -- Stores report configuration (columns, filters, etc.)
  is_system BOOLEAN DEFAULT false, -- System reports cannot be deleted
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Scheduled Reports Table
-- For automated report generation
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  schedule_config JSONB NOT NULL, -- Cron expression or schedule details
  recipients JSONB NOT NULL, -- Email addresses or user IDs
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. System Health Metrics Table
-- Stores system performance and health metrics
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('cpu', 'memory', 'database', 'api', 'error_rate', 'response_time')),
  metric_value DECIMAL(10,2) NOT NULL,
  metric_unit VARCHAR(20),
  threshold_warning DECIMAL(10,2),
  threshold_critical DECIMAL(10,2),
  details JSONB,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. User Activity Summary Table
-- Aggregated user activity for dashboard
CREATE TABLE IF NOT EXISTS user_activity_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  login_count INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  data_modifications INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP,
  session_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, activity_date)
);

-- 7. Bulk Operations Table
-- Track bulk operations performed by super admin
CREATE TABLE IF NOT EXISTS bulk_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('user_import', 'user_update', 'permission_update', 'data_export', 'data_cleanup')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_details JSONB,
  operation_config JSONB, -- Configuration for the operation
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Permission Templates Table
-- Predefined permission sets for easy role assignment
CREATE TABLE IF NOT EXISTS permission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  role VARCHAR(50) NOT NULL,
  permissions JSONB NOT NULL, -- Array of permission strings
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Notification Queue Table
-- For system notifications to users
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  send_after TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Data Backup Records Table
-- Track system backups
CREATE TABLE IF NOT EXISTS data_backup_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type VARCHAR(50) NOT NULL CHECK (backup_type IN ('full', 'incremental', 'selective')),
  backup_size_mb DECIMAL(10,2),
  backup_location VARCHAR(500),
  tables_included TEXT[],
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'verified')),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  verified_at TIMESTAMP,
  retention_days INTEGER DEFAULT 30,
  created_by UUID REFERENCES users(id),
  error_message TEXT
);

-- Create indexes for performance
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_system_health_metrics_type_time ON system_health_metrics(metric_type, recorded_at);
CREATE INDEX idx_user_activity_summary_date ON user_activity_summary(activity_date);
CREATE INDEX idx_notification_queue_recipient ON notification_queue(recipient_id, status);
CREATE INDEX idx_bulk_operations_status ON bulk_operations(status);

-- Insert default system settings
INSERT INTO system_settings (key, value, description, category) VALUES
  ('session_timeout', '{"hours": 24}', 'Session timeout duration', 'security'),
  ('max_login_attempts', '{"attempts": 5}', 'Maximum login attempts before lockout', 'security'),
  ('password_policy', '{"min_length": 8, "require_uppercase": true, "require_number": true}', 'Password complexity requirements', 'security'),
  ('data_retention', '{"activity_logs_days": 90, "health_metrics_days": 30}', 'Data retention periods', 'maintenance'),
  ('email_notifications', '{"enabled": true, "from_address": "noreply@virtuallab.edu.kh"}', 'Email notification settings', 'notifications'),
  ('system_maintenance', '{"mode": false, "message": null}', 'System maintenance mode', 'general'),
  ('api_rate_limits', '{"default": 100, "super_admin": 1000}', 'API rate limits per minute', 'security'),
  ('report_generation', '{"max_records": 10000, "timeout_seconds": 300}', 'Report generation limits', 'performance')
ON CONFLICT (key) DO NOTHING;

-- Insert default permission templates
INSERT INTO permission_templates (name, description, role, permissions, is_system) VALUES
  ('Super Admin Full Access', 'Complete system access for super administrators', 'super_admin', 
   '["*"]'::jsonb, true),
  ('Admin Standard Access', 'Standard administrative access', 'admin',
   '["users.read", "users.write", "schools.read", "schools.write", "reports.read", "reports.write", "settings.read"]'::jsonb, true),
  ('Teacher Standard Access', 'Standard teacher access', 'teacher',
   '["dashboard.read", "students.read", "assessments.read", "assessments.write", "reports.read"]'::jsonb, true),
  ('Student Standard Access', 'Standard student access', 'student',
   '["dashboard.read", "assessments.read", "simulations.read", "simulations.write"]'::jsonb, true)
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permission_templates_updated_at BEFORE UPDATE ON permission_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to log user activities
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details)
    VALUES (
        COALESCE(NEW.updated_by, NEW.created_by),
        TG_OP,
        TG_TABLE_NAME,
        NEW.id,
        to_jsonb(NEW)
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add comments for documentation
COMMENT ON TABLE activity_logs IS 'Comprehensive audit trail of all user activities in the system';
COMMENT ON TABLE system_settings IS 'Configurable system-wide settings managed by super admin';
COMMENT ON TABLE report_templates IS 'Reusable report configurations for various report types';
COMMENT ON TABLE scheduled_reports IS 'Automated report generation schedules';
COMMENT ON TABLE system_health_metrics IS 'System performance and health monitoring data';
COMMENT ON TABLE user_activity_summary IS 'Aggregated user activity data for analytics';
COMMENT ON TABLE bulk_operations IS 'Track and manage bulk operations performed by administrators';
COMMENT ON TABLE permission_templates IS 'Predefined permission sets for easy role management';
COMMENT ON TABLE notification_queue IS 'System notification queue for user communications';
COMMENT ON TABLE data_backup_records IS 'Track system backup operations and history';