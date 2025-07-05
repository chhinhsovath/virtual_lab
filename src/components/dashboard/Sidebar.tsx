'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BarChart3,
  FileText,
  Settings,
  School,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Bell,
  ChevronLeft,
  Menu,
  LogOut,
  Shield,
  MapPin,
  Award,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface SidebarProps {
  user: {
    firstName?: string;
    lastName?: string;
    username: string;
    email?: string;
    roles: string[];
    permissions: string[];
  };
  onLogout: () => void;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'dashboard.read'
  },
  {
    name: 'Students',
    href: '/dashboard/students',
    icon: Users,
    permission: 'students.read',
    badge: '2M+'
  },
  {
    name: 'Assessments',
    href: '/dashboard/assessments',
    icon: GraduationCap,
    permission: 'assessments.read'
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    permission: 'reports.read'
  },
  {
    name: 'Schools',
    href: '/dashboard/schools',
    icon: School,
    permission: 'schools.read',
    badge: '7K+'
  },
  {
    name: 'Teachers',
    href: '/dashboard/teachers',
    icon: BookOpen,
    permission: 'teachers.read',
    badge: '63K+'
  },
  {
    name: 'Learning Goals',
    href: '/dashboard/goals',
    icon: Target,
    permission: 'assessments.read'
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
    permission: 'reports.read'
  },
  {
    name: 'Progress Tracking',
    href: '/dashboard/progress',
    icon: TrendingUp,
    permission: 'reports.read'
  },
  {
    name: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar,
    permission: 'dashboard.read'
  }
];

const adminNavigation = [
  {
    name: 'User Management',
    href: '/dashboard/users',
    icon: Shield,
    permission: 'users.read'
  },
  {
    name: 'Provinces',
    href: '/dashboard/provinces',
    icon: MapPin,
    permission: 'admin.read'
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    permission: 'settings.read'
  }
];

export default function Sidebar({ user, onLogout, mobileOpen, onMobileToggle, onCollapsedChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(collapsed);
    }
  }, [collapsed, onCollapsedChange]);

  const filteredNavigation = navigation.filter(item => 
    user.permissions.includes(item.permission)
  );

  const filteredAdminNavigation = adminNavigation.filter(item =>
    user.permissions.includes(item.permission)
  );

  const isAdmin = user.roles.some(role => 
    ['administrator', 'super_admin'].includes(role)
  );

  const handleNavClick = () => {
    if (isMobile && onMobileToggle) {
      onMobileToggle();
    }
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className={cn(
          "flex items-center space-x-3 transition-opacity",
          !isMobile && collapsed && "opacity-0"
        )}>
          <div className="bg-blue-600 p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white font-hanuman">Cambodia Virtual Lab</h2>
            <p className="text-xs text-slate-400 font-hanuman">មន្ទីរពិសោធន៍និម្មិតកម្ពុជា</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={isMobile && onMobileToggle ? onMobileToggle : () => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {isMobile ? <X className="h-5 w-5" /> : 
           collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* User Info */}
      <div className={cn(
        "px-4 py-3 border-b border-slate-800 bg-slate-800/50",
        !isMobile && collapsed && "px-2"
      )}>
        <div className={cn(
          "flex items-center space-x-3",
          !isMobile && collapsed && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white flex-shrink-0">
            {user.firstName ? user.firstName[0] : user.username[0].toUpperCase()}
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {user.roles.slice(0, 2).map((role) => (
                  <Badge 
                    key={role} 
                    variant="secondary" 
                    className="text-xs bg-slate-700 text-slate-200 border-0"
                  >
                    {role.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800",
                  !isMobile && collapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn(
                  "flex-shrink-0",
                  (!isMobile && collapsed) ? "h-5 w-5" : "h-5 w-5 mr-3"
                )} />
                {(isMobile || !collapsed) && (
                  <span className="flex-1">{item.name}</span>
                )}
                {(isMobile || !collapsed) && item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="ml-auto bg-slate-700 text-slate-200 border-0 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        {/* Admin Section */}
        {isAdmin && filteredAdminNavigation.length > 0 && (
          <>
            <div className={cn(
              "my-4 px-3",
              !isMobile && collapsed && "px-0"
            )}>
              <div className="border-t border-slate-800"></div>
            </div>
            <div className="space-y-1">
              {(isMobile || !collapsed) && (
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Administration
                </p>
              )}
              {filteredAdminNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:text-white hover:bg-slate-800",
                      !isMobile && collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className={cn(
                      "flex-shrink-0",
                      (!isMobile && collapsed) ? "h-5 w-5" : "h-5 w-5 mr-3"
                    )} />
                    {(isMobile || !collapsed) && (
                      <span className="flex-1">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800",
            !isMobile && collapsed && "justify-center px-2"
          )}
          onClick={onLogout}
        >
          <LogOut className={cn(
            "h-5 w-5",
            (isMobile || !collapsed) && "mr-3"
          )} />
          {(isMobile || !collapsed) && <span>Logout</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile: Overlay sidebar */}
      <>
        {/* Overlay */}
        {isMobile && mobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onMobileToggle}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col h-full bg-slate-900 text-slate-100 transition-transform duration-300 md:hidden w-64",
          isMobile && mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {sidebarContent}
        </div>
      </>

      {/* Desktop: Static sidebar */}
      <div className={cn(
        "fixed left-0 top-0 hidden md:flex flex-col h-screen bg-slate-900 text-slate-100 transition-all duration-300 z-30",
        collapsed ? "w-20" : "w-64"
      )}>
        {sidebarContent}
      </div>
    </>
  );
}