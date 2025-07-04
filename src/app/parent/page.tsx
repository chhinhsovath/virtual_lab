'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/auth';
import { ParentPortal } from '@/components/parent/parent-portal';

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
          if (!userData.roles.includes('parent') && !userData.roles.includes('guardian')) {
            // Redirect non-parents to appropriate dashboard
            if (userData.roles.includes('student')) {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-700 font-medium">Loading parent portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <ParentPortal user={user} />;
}