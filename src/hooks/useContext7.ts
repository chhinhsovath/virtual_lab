import { useState, useCallback } from 'react';
import axios from 'axios';
import type { Context7Document } from '@/lib/context7';

export interface SearchOptions {
  topK?: number;
  filter?: Record<string, any>;
  includeMetadata?: boolean;
}

export function useContext7() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAPI = useCallback(async (action: string, params?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/context7', {
        action,
        params,
      });
      
      return response.data;
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.error || err.message 
        : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const indexDocument = useCallback(async (document: Context7Document) => {
    return callAPI('index', { document });
  }, [callAPI]);

  const indexDocuments = useCallback(async (documents: Context7Document[]) => {
    return callAPI('indexBatch', { documents });
  }, [callAPI]);

  const search = useCallback(async (query: string, options?: SearchOptions) => {
    const result = await callAPI('search', { query, options });
    return result.data;
  }, [callAPI]);

  const getDocument = useCallback(async (id: string) => {
    const result = await callAPI('getDocument', { id });
    return result.data;
  }, [callAPI]);

  const deleteDocument = useCallback(async (id: string) => {
    return callAPI('deleteDocument', { id });
  }, [callAPI]);

  const updateMetadata = useCallback(async (id: string, metadata: Record<string, any>) => {
    return callAPI('updateMetadata', { id, metadata });
  }, [callAPI]);

  const indexStudent = useCallback(async (student: {
    id: string;
    name: string;
    grade: string;
    schoolId: string;
    assessments?: any[];
  }) => {
    return callAPI('indexStudent', { student });
  }, [callAPI]);

  const indexAssessment = useCallback(async (assessment: {
    id: string;
    studentId: string;
    subject: string;
    cycle: string;
    level: string;
    score?: number;
    date: string;
  }) => {
    return callAPI('indexAssessment', { assessment });
  }, [callAPI]);

  const indexSimulation = useCallback(async (simulation: {
    id: string;
    title: string;
    subject: string;
    topic: string;
    description: string;
    grade?: string;
    difficulty?: string;
  }) => {
    return callAPI('indexSimulation', { simulation });
  }, [callAPI]);

  const getStudentRecommendations = useCallback(async (studentId: string, subject?: string) => {
    const result = await callAPI('getRecommendations', { studentId, subject });
    return result.data;
  }, [callAPI]);

  const findSimilarStudents = useCallback(async (studentId: string, limit?: number) => {
    const result = await callAPI('findSimilarStudents', { studentId, limit });
    return result.data;
  }, [callAPI]);

  return {
    loading,
    error,
    indexDocument,
    indexDocuments,
    search,
    getDocument,
    deleteDocument,
    updateMetadata,
    indexStudent,
    indexAssessment,
    indexSimulation,
    getStudentRecommendations,
    findSimilarStudents,
  };
}