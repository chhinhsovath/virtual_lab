'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/auth';
import { STEMStudentPortal } from '../../components/student/stem-student-portal';

export default function StudentPage() {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700 font-medium">Loading student portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <STEMStudentPortal user={user} />;
}