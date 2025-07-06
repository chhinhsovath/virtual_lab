import { useState, useEffect } from 'react';

interface GuestUser {
  id: string;
  role: string;
  isGuest: boolean;
}

interface GuestSessionState {
  user: GuestUser | null;
  isLoading: boolean;
  simulationsAccessed: number;
  maxGuestSimulations: number;
}

export function useGuestSession() {
  const [sessionState, setSessionState] = useState<GuestSessionState>({
    user: null,
    isLoading: false,
    simulationsAccessed: 0,
    maxGuestSimulations: 1
  });

  const createGuestSession = async () => {
    setSessionState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setSessionState(prev => ({
          ...prev,
          user: { ...data.user, isGuest: true },
          isLoading: false
        }));
        
        // Store guest session info in localStorage
        localStorage.setItem('guestSession', JSON.stringify({
          userId: data.user.id,
          created: new Date().toISOString(),
          simulationsAccessed: 0
        }));
        
        return data.user;
      } else {
        throw new Error(data.error || 'Failed to create guest session');
      }
    } catch (error) {
      console.error('Failed to create guest session:', error);
      setSessionState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const trackSimulationAccess = () => {
    const guestData = localStorage.getItem('guestSession');
    if (guestData) {
      try {
        const parsed = JSON.parse(guestData);
        const newCount = (parsed.simulationsAccessed || 0) + 1;
        
        localStorage.setItem('guestSession', JSON.stringify({
          ...parsed,
          simulationsAccessed: newCount
        }));
        
        setSessionState(prev => ({
          ...prev,
          simulationsAccessed: newCount
        }));

        // Log simulation access for analytics
        if (typeof window !== 'undefined') {
          fetch('/api/analytics/guest-simulation-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              guestId: parsed.userId,
              simulationCount: newCount,
              timestamp: new Date().toISOString()
            })
          }).catch(err => console.warn('Analytics logging failed:', err));
        }
        
        return newCount;
      } catch (error) {
        console.error('Error tracking simulation access:', error);
      }
    }
    return 0;
  };

  const shouldShowEnrollmentPrompt = () => {
    return sessionState.simulationsAccessed >= sessionState.maxGuestSimulations;
  };

  const getGuestSessionInfo = () => {
    const guestData = localStorage.getItem('guestSession');
    if (guestData) {
      try {
        return JSON.parse(guestData);
      } catch (error) {
        console.error('Error parsing guest session:', error);
      }
    }
    return null;
  };

  const clearGuestSession = () => {
    localStorage.removeItem('guestSession');
    setSessionState({
      user: null,
      isLoading: false,
      simulationsAccessed: 0,
      maxGuestSimulations: 1
    });
  };

  // Load guest session info on mount
  useEffect(() => {
    const guestInfo = getGuestSessionInfo();
    if (guestInfo) {
      setSessionState(prev => ({
        ...prev,
        simulationsAccessed: guestInfo.simulationsAccessed || 0
      }));
    }
  }, []);

  return {
    ...sessionState,
    createGuestSession,
    trackSimulationAccess,
    shouldShowEnrollmentPrompt,
    getGuestSessionInfo,
    clearGuestSession
  };
}