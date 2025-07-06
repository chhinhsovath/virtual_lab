import { useState, useCallback } from 'react';
import axios from 'axios';

interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

export function useMCP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listTools = useCallback(async (): Promise<MCPTool[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/mcp', {
        action: 'listTools',
      });
      
      return response.data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list tools';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const callTool = useCallback(async (toolName: string, args: any): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/mcp', {
        action: 'callTool',
        params: {
          toolName,
          arguments: args,
        },
      });
      
      return response.data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to call tool';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const listResources = useCallback(async (): Promise<MCPResource[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/mcp', {
        action: 'listResources',
      });
      
      return response.data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list resources';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const readResource = useCallback(async (uri: string): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/mcp', {
        action: 'readResource',
        params: { uri },
      });
      
      return response.data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to read resource';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Convenience methods for specific tools
  const queryDatabase = useCallback(async (query: string, params?: any[]): Promise<any> => {
    return callTool('query_database', { query, params });
  }, [callTool]);

  const getStudentAssessment = useCallback(async (studentId: string, cycle?: string): Promise<any> => {
    return callTool('get_student_assessment', { studentId, cycle });
  }, [callTool]);

  const getSimulationData = useCallback(async (subject: string, topic?: string): Promise<any> => {
    return callTool('get_simulation_data', { subject, topic });
  }, [callTool]);

  return {
    loading,
    error,
    listTools,
    callTool,
    listResources,
    readResource,
    queryDatabase,
    getStudentAssessment,
    getSimulationData,
  };
}