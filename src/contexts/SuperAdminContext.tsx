'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  first_name: string;
  last_name: string;
  first_name_km?: string;
  last_name_km?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  login_count: number;
  active_sessions: number;
  school_access: Array<{
    school_id: number;
    access_level: string;
    subjects?: string[];
  }>;
}

export interface Session {
  id: string;
  session_token: string;
  user_uuid: string;
  email: string;
  username: string;
  role: string;
  first_name: string;
  last_name: string;
  expires_at: string;
  ip_address: string;
  user_agent: any;
  created_at: string;
  status: 'active' | 'expired';
  activity_count: number;
  last_activity_at?: string;
  session_duration_seconds: number;
}

export interface School {
  id: number;
  school_name: string;
  school_name_kh: string;
  school_code: string;
  province: string;
  teachers: number;
  students: number;
  assessments: number;
}

export interface SystemSettings {
  session_timeout: { hours: number };
  max_login_attempts: { attempts: number };
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_number: boolean;
  };
  data_retention: {
    activity_logs_days: number;
    health_metrics_days: number;
  };
  email_notifications: {
    enabled: boolean;
    from_address: string;
  };
  system_maintenance: {
    mode: boolean;
    message?: string;
  };
  api_rate_limits: {
    default: number;
    super_admin: number;
  };
  report_generation: {
    max_records: number;
    timeout_seconds: number;
  };
}

// State
interface SuperAdminState {
  users: User[];
  sessions: Session[];
  schools: School[];
  settings: SystemSettings | null;
  loading: {
    users: boolean;
    sessions: boolean;
    schools: boolean;
    settings: boolean;
  };
  error: {
    users: string | null;
    sessions: string | null;
    schools: string | null;
    settings: string | null;
  };
  filters: {
    users: Record<string, any>;
    sessions: Record<string, any>;
  };
  pagination: {
    users: { page: number; limit: number; total: number; totalPages: number };
    sessions: { page: number; limit: number; total: number; totalPages: number };
  };
}

// Actions
type SuperAdminAction =
  | { type: 'SET_USERS'; payload: { users: User[]; pagination: any } }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'REMOVE_USER'; payload: string }
  | { type: 'SET_SESSIONS'; payload: { sessions: Session[]; pagination: any } }
  | { type: 'REMOVE_SESSION'; payload: string }
  | { type: 'REMOVE_SESSIONS'; payload: string[] }
  | { type: 'SET_SCHOOLS'; payload: School[] }
  | { type: 'SET_SETTINGS'; payload: SystemSettings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<SystemSettings> }
  | { type: 'SET_LOADING'; payload: { key: keyof SuperAdminState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof SuperAdminState['error']; value: string | null } }
  | { type: 'SET_FILTER'; payload: { key: 'users' | 'sessions'; filters: Record<string, any> } }
  | { type: 'CLEAR_FILTERS'; payload: 'users' | 'sessions' }
  | { type: 'SET_PAGE'; payload: { key: 'users' | 'sessions'; page: number } };

// Initial state
const initialState: SuperAdminState = {
  users: [],
  sessions: [],
  schools: [],
  settings: null,
  loading: {
    users: false,
    sessions: false,
    schools: false,
    settings: false
  },
  error: {
    users: null,
    sessions: null,
    schools: null,
    settings: null
  },
  filters: {
    users: {},
    sessions: {}
  },
  pagination: {
    users: { page: 1, limit: 20, total: 0, totalPages: 0 },
    sessions: { page: 1, limit: 20, total: 0, totalPages: 0 }
  }
};

// Reducer
function superAdminReducer(state: SuperAdminState, action: SuperAdminAction): SuperAdminState {
  switch (action.type) {
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload.users,
        pagination: {
          ...state.pagination,
          users: action.payload.pagination
        }
      };

    case 'ADD_USER':
      return {
        ...state,
        users: [action.payload, ...state.users],
        pagination: {
          ...state.pagination,
          users: {
            ...state.pagination.users,
            total: state.pagination.users.total + 1
          }
        }
      };

    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        )
      };

    case 'REMOVE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        pagination: {
          ...state.pagination,
          users: {
            ...state.pagination.users,
            total: Math.max(0, state.pagination.users.total - 1)
          }
        }
      };

    case 'SET_SESSIONS':
      return {
        ...state,
        sessions: action.payload.sessions,
        pagination: {
          ...state.pagination,
          sessions: action.payload.pagination
        }
      };

    case 'REMOVE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(session => session.id !== action.payload),
        pagination: {
          ...state.pagination,
          sessions: {
            ...state.pagination.sessions,
            total: Math.max(0, state.pagination.sessions.total - 1)
          }
        }
      };

    case 'REMOVE_SESSIONS':
      return {
        ...state,
        sessions: state.sessions.filter(
          session => !action.payload.includes(session.id)
        ),
        pagination: {
          ...state.pagination,
          sessions: {
            ...state.pagination.sessions,
            total: Math.max(0, state.pagination.sessions.total - action.payload.length)
          }
        }
      };

    case 'SET_SCHOOLS':
      return {
        ...state,
        schools: action.payload
      };

    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.payload
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: state.settings
          ? { ...state.settings, ...action.payload }
          : null
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: {
          ...state.error,
          [action.payload.key]: action.payload.value
        }
      };

    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.filters
        }
      };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload]: {}
        }
      };

    case 'SET_PAGE':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          [action.payload.key]: {
            ...state.pagination[action.payload.key],
            page: action.payload.page
          }
        }
      };

    default:
      return state;
  }
}

// Context
interface SuperAdminContextType {
  state: SuperAdminState;
  dispatch: React.Dispatch<SuperAdminAction>;
  actions: {
    fetchUsers: (filters?: Record<string, any>) => Promise<void>;
    createUser: (userData: any) => Promise<User>;
    updateUser: (userId: string, userData: any) => Promise<User>;
    deleteUser: (userId: string, hardDelete?: boolean) => Promise<void>;
    fetchSessions: (filters?: Record<string, any>) => Promise<void>;
    terminateSession: (sessionId: string, reason?: string) => Promise<void>;
    terminateSessions: (sessionIds: string[], reason?: string) => Promise<void>;
    fetchSchools: () => Promise<void>;
    fetchSettings: () => Promise<void>;
    updateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  };
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

// Provider
export function SuperAdminProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(superAdminReducer, initialState);

  // API helper
  const apiCall = useCallback(async (
    path: string,
    options?: RequestInit
  ) => {
    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }, []);

  // Actions
  const actions = {
    fetchUsers: useCallback(async (filters?: Record<string, any>) => {
      dispatch({ type: 'SET_LOADING', payload: { key: 'users', value: true } });
      dispatch({ type: 'SET_ERROR', payload: { key: 'users', value: null } });

      try {
        const params = new URLSearchParams({
          page: state.pagination.users.page.toString(),
          limit: state.pagination.users.limit.toString(),
          ...state.filters.users,
          ...filters
        });

        const result = await apiCall(`/api/admin/users?${params}`);
        
        dispatch({
          type: 'SET_USERS',
          payload: {
            users: result.data.users,
            pagination: result.meta.pagination
          }
        });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: {
            key: 'users',
            value: error instanceof Error ? error.message : 'Failed to fetch users'
          }
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key: 'users', value: false } });
      }
    }, [apiCall, state.pagination.users, state.filters.users]),

    createUser: useCallback(async (userData: any): Promise<User> => {
      const result = await apiCall('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      const newUser = result.data.user;
      dispatch({ type: 'ADD_USER', payload: newUser });
      return newUser;
    }, [apiCall]),

    updateUser: useCallback(async (userId: string, userData: any): Promise<User> => {
      const result = await apiCall(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });

      const updatedUser = result.data.user;
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      return updatedUser;
    }, [apiCall]),

    deleteUser: useCallback(async (userId: string, hardDelete = false) => {
      await apiCall(`/api/admin/users/${userId}?hard=${hardDelete}`, {
        method: 'DELETE'
      });

      dispatch({ type: 'REMOVE_USER', payload: userId });
    }, [apiCall]),

    fetchSessions: useCallback(async (filters?: Record<string, any>) => {
      dispatch({ type: 'SET_LOADING', payload: { key: 'sessions', value: true } });
      dispatch({ type: 'SET_ERROR', payload: { key: 'sessions', value: null } });

      try {
        const params = new URLSearchParams({
          page: state.pagination.sessions.page.toString(),
          limit: state.pagination.sessions.limit.toString(),
          ...state.filters.sessions,
          ...filters
        });

        const result = await apiCall(`/api/admin/sessions?${params}`);
        
        dispatch({
          type: 'SET_SESSIONS',
          payload: {
            sessions: result.data.sessions,
            pagination: result.meta.pagination
          }
        });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: {
            key: 'sessions',
            value: error instanceof Error ? error.message : 'Failed to fetch sessions'
          }
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key: 'sessions', value: false } });
      }
    }, [apiCall, state.pagination.sessions, state.filters.sessions]),

    terminateSession: useCallback(async (sessionId: string, reason?: string) => {
      await apiCall(`/api/admin/sessions/${sessionId}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason })
      });

      dispatch({ type: 'REMOVE_SESSION', payload: sessionId });
    }, [apiCall]),

    terminateSessions: useCallback(async (sessionIds: string[], reason?: string) => {
      await apiCall('/api/admin/sessions', {
        method: 'DELETE',
        body: JSON.stringify({ sessionIds, reason })
      });

      dispatch({ type: 'REMOVE_SESSIONS', payload: sessionIds });
    }, [apiCall]),

    fetchSchools: useCallback(async () => {
      dispatch({ type: 'SET_LOADING', payload: { key: 'schools', value: true } });
      dispatch({ type: 'SET_ERROR', payload: { key: 'schools', value: null } });

      try {
        const result = await apiCall('/api/schools');
        dispatch({ type: 'SET_SCHOOLS', payload: result.data });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: {
            key: 'schools',
            value: error instanceof Error ? error.message : 'Failed to fetch schools'
          }
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key: 'schools', value: false } });
      }
    }, [apiCall]),

    fetchSettings: useCallback(async () => {
      dispatch({ type: 'SET_LOADING', payload: { key: 'settings', value: true } });
      dispatch({ type: 'SET_ERROR', payload: { key: 'settings', value: null } });

      try {
        const result = await apiCall('/api/admin/settings');
        dispatch({ type: 'SET_SETTINGS', payload: result.data });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: {
            key: 'settings',
            value: error instanceof Error ? error.message : 'Failed to fetch settings'
          }
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key: 'settings', value: false } });
      }
    }, [apiCall]),

    updateSettings: useCallback(async (settings: Partial<SystemSettings>) => {
      const result = await apiCall('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });

      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    }, [apiCall])
  };

  return (
    <SuperAdminContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </SuperAdminContext.Provider>
  );
}

// Hook
export function useSuperAdmin() {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within SuperAdminProvider');
  }
  return context;
}