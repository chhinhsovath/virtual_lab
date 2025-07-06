'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/auth';
import { ParentPortal } from '../../components/parent/parent-portal';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

export default function ParentPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          const userData = data.user;
          
          // Check if user has parent or guardian role
          if (userData.role !== 'parent' && userData.role !== 'guardian') {
            // Redirect non-parents to appropriate dashboard
            if (userData.role === 'student') {
              router.push('/student');
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

  return <ParentPortal user={user} />;
}