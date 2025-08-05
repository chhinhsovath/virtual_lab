'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import ModernSidebar from '../../components/dashboard/ModernSidebar';
import ModernSuperAdminDashboard from '../../components/dashboard/ModernSuperAdminDashboard';
import { TeacherEngagementDashboard } from '../../components/dashboard/TeacherEngagementDashboard';
import { useLanguage } from '../../components/LanguageProvider';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import {
  Bell,
  Menu
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles: string[];
  permissions: string[];
  schoolAccess: Array<{
    schoolId: number;
    accessType: string;
    subject: string;
  }>;
  teacherId?: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const { t, getFontClass } = useLanguage();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          const userData = data.user;
          
          // Check if user is a student and redirect to student portal
          if (userData.roles?.includes('student') || userData.role === 'student') {
            router.push('/student');
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  // Check if user is super admin
  const isSuperAdmin = user.roles.includes('super_admin');

  // If super admin, show comprehensive dashboard
  if (isSuperAdmin) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <ModernSidebar 
          user={user} 
          onLogout={handleLogout} 
          mobileOpen={mobileMenuOpen}
          onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          onCollapsedChange={setSidebarCollapsed}
        />

        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-80'}`}>
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
                
                <div>
                  <h1 className={`text-xl md:text-2xl font-bold text-gray-900 ${getFontClass()}`}>
                    {t('dashboard.welcome')}, {user.firstName || user.username}! ✨
                  </h1>
                  <p className={`text-sm text-gray-600 mt-1 hidden sm:block ${getFontClass()}`}>
                    {t('role.super_admin')} {t('dashboard.title')} - {t('dashboard.overview')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                </Button>
                <div className="text-right">
                  <p className={`text-sm font-medium text-gray-900 ${getFontClass()}`}>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className={`text-xs text-gray-600 ${getFontClass()}`}>
                    {t('ui.today')}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Super Admin Dashboard Content */}
          <main className="flex-1 p-4 md:p-8">
            <ModernSuperAdminDashboard />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - handles both desktop and mobile */}
      <ModernSidebar 
        user={user} 
        onLogout={handleLogout} 
        mobileOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-80'}`}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              
              <div>
                <h1 className={`text-xl md:text-2xl font-bold text-gray-900 ${getFontClass()}`}>
                  {t('dashboard.welcome')}, {user.firstName || user.username}! ✨
                </h1>
                <p className={`text-sm text-gray-600 mt-1 hidden sm:block ${getFontClass()}`}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <TeacherEngagementDashboard user={user} />
        </main>
      </div>
    </div>
  );
}