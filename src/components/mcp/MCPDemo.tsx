'use client';

import React, { useState } from 'react';
import { useMCP } from '@/hooks/useMCP';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export function MCPDemo() {
  const { loading, error, listTools, getStudentAssessment, getSimulationData, queryDatabase } = useMCP();
  
  const [studentId, setStudentId] = useState('');
  const [cycle, setCycle] = useState('baseline');
  const [subject, setSubject] = useState('physics');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM tbl_child LIMIT 5');
  const [result, setResult] = useState<any>(null);

  const handleListTools = async () => {
    try {
      const tools = await listTools();
      setResult({ type: 'tools', data: tools });
    } catch (err) {
      console.error('Failed to list tools:', err);
    }
  };

  const handleGetAssessment = async () => {
    if (!studentId) {
      alert('Please enter a student ID');
      return;
    }
    
    try {
      const assessment = await getStudentAssessment(studentId, cycle);
      setResult({ type: 'assessment', data: assessment });
    } catch (err) {
      console.error('Failed to get assessment:', err);
    }
  };

  const handleGetSimulation = async () => {
    try {
      const simulation = await getSimulationData(subject);
      setResult({ type: 'simulation', data: simulation });
    } catch (err) {
      console.error('Failed to get simulation:', err);
    }
  };

  const handleQueryDatabase = async () => {
    if (!sqlQuery) {
      alert('Please enter a SQL query');
      return;
    }
    
    try {
      const queryResult = await queryDatabase(sqlQuery);
      setResult({ type: 'query', data: queryResult });
    } catch (err) {
      console.error('Failed to query database:', err);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MCP Server Integration Demo</CardTitle>
          <CardDescription>
            Test the Model Context Protocol server integration with Virtual Lab
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* List Tools */}
          <div className="space-y-2">
            <Button onClick={handleListTools} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              List Available Tools
            </Button>
          </div>

          {/* Student Assessment */}
          <div className="space-y-2">
            <Label>Get Student Assessment</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
              <Select value={cycle} onValueChange={setCycle}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baseline">Baseline</SelectItem>
                  <SelectItem value="midline">Midline</SelectItem>
                  <SelectItem value="endline">Endline</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGetAssessment} disabled={loading}>
                Get Assessment
              </Button>
            </div>
          </div>

          {/* Simulation Data */}
          <div className="space-y-2">
            <Label>Get Simulation Data</Label>
            <div className="flex gap-2">
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="stem">STEM</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGetSimulation} disabled={loading}>
                Get Simulation
              </Button>
            </div>
          </div>

          {/* Database Query */}
          <div className="space-y-2">
            <Label>Database Query</Label>
            <Textarea
              placeholder="Enter SQL query..."
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={3}
            />
            <Button onClick={handleQueryDatabase} disabled={loading}>
              Execute Query
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">Error: {error}</p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="space-y-2">
              <Label>Result ({result.type}):</Label>
              <pre className="rounded-md bg-gray-100 p-4 overflow-auto max-h-96">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}