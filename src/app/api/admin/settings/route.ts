import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { withSuperAdmin } from '@/lib/super-admin-api';
import { activityLogger } from '@/lib/activity-logger';

export const GET = withSuperAdmin(async (request: NextRequest) => {
  const client = await pool.connect();
  
  try {
    // Get all system settings
    const query = `
      SELECT 
        setting_key,
        setting_value,
        setting_type,
        is_public
      FROM system_settings
      WHERE is_public = true OR is_public = false
      ORDER BY setting_key
    `;

    const result = await client.query(query);

    // Transform flat settings into nested structure
    const settings = {
      general: {},
      security: {},
      features: {},
      email: {},
      integrations: {}
    };

    result.rows.forEach(row => {
      const [category, ...keyParts] = row.setting_key.split('.');
      const key = keyParts.join('.');
      
      if (settings[category as keyof typeof settings]) {
        // Parse value based on type
        let value = row.setting_value;
        if (row.setting_type === 'boolean') {
          value = value === 'true';
        } else if (row.setting_type === 'number') {
          value = parseFloat(value);
        } else if (row.setting_type === 'json') {
          try {
            value = JSON.parse(value);
          } catch {
            // Keep as string if JSON parse fails
          }
        }
        
        (settings[category as keyof typeof settings] as any)[key] = value;
      }
    });

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
});

export const PUT = withSuperAdmin(async (request: NextRequest) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const settings = await request.json();

    // Flatten nested settings into key-value pairs
    const flatSettings: Array<{
      key: string;
      value: any;
      type: string;
    }> = [];

    Object.entries(settings).forEach(([category, categorySettings]) => {
      Object.entries(categorySettings as any).forEach(([key, value]) => {
        const settingKey = `${category}.${key}`;
        let settingType = 'string';
        let settingValue = value;

        if (typeof value === 'boolean') {
          settingType = 'boolean';
          settingValue = value.toString();
        } else if (typeof value === 'number') {
          settingType = 'number';
          settingValue = value.toString();
        } else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          settingType = 'json';
          settingValue = JSON.stringify(value);
        } else {
          settingValue = value?.toString() || '';
        }

        flatSettings.push({
          key: settingKey,
          value: settingValue,
          type: settingType
        });
      });
    });

    // Upsert each setting
    for (const setting of flatSettings) {
      const upsertQuery = `
        INSERT INTO system_settings (
          setting_key,
          setting_value,
          setting_type,
          updated_at,
          updated_by
        ) VALUES ($1, $2, $3, NOW(), $4)
        ON CONFLICT (setting_key) DO UPDATE SET
          setting_value = EXCLUDED.setting_value,
          setting_type = EXCLUDED.setting_type,
          updated_at = EXCLUDED.updated_at,
          updated_by = EXCLUDED.updated_by
      `;

      await client.query(upsertQuery, [
        setting.key,
        setting.value,
        setting.type,
        request.headers.get('x-user-id') || 'system'
      ]);
    }

    await client.query('COMMIT');

    // Log activity
    await activityLogger.logUserAction(
      'settings.update',
      request.headers.get('x-user-id') || 'system',
      'settings',
      undefined,
      { updated_count: flatSettings.length }
    );

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
});