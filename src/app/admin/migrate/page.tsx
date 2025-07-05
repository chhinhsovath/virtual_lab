'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Database, CheckCircle, AlertCircle } from 'lucide-react';

export default function MigratePage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runMigration = async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ migration: 'fix_student_id_types' })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Migration failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Database Migration
          </CardTitle>
          <CardDescription>
            Run database migrations to fix student ID type issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              This migration will update the database schema to support both UUID and integer student IDs.
              Only administrators can run this migration.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h3 className="font-semibold">Migration: Fix Student ID Types</h3>
            <p className="text-sm text-gray-600">This migration will:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Add student_uuid columns to student-related tables</li>
              <li>Make student_id columns nullable</li>
              <li>Create indexes for better performance</li>
              <li>Enable support for UUID-based user authentication</li>
            </ul>
          </div>

          <Button 
            onClick={runMigration} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Running Migration...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Run Migration
              </>
            )}
          </Button>

          {result && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <p className="font-semibold text-green-800">{result.message}</p>
                {result.verification && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Verified columns:</p>
                    <div className="mt-1 text-xs font-mono bg-white p-2 rounded border">
                      {result.verification.map((col: any, idx: number) => (
                        <div key={idx}>
                          {col.table_name}.{col.column_name} ({col.data_type})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}