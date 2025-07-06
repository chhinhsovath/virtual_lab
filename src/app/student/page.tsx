'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/auth';
import { EnhancedStudentDashboard } from '../../components/student/enhanced-student-dashboard';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

export default function StudentPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          const userData = data.user;
          
          // Check if user has student role
          if (!userData.roles.includes('student')) {
            // Redirect non-students to appropriate dashboard
            if (userData.roles.includes('parent') || userData.roles.includes('guardian')) {
              router.push('/parent');
            } else {
              router.push('/dashboard');
            }
            return;
          }
          
          setUser(userData);
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Session fetch error:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return <EnhancedStudentDashboard user={user} />;
}