'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { User, LogOut, BarChart3, FileText, Users, Menu, X, GraduationCap, Settings, Bell, ChevronDown, FlaskConical } from 'lucide-react';
import { type Session } from '../lib/auth';
import { toast } from 'sonner';

interface DashboardNavProps {
  session: Session;
}

export function DashboardNav({ session }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/');
      } else {
        toast.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    }
  };

  // Role-based navigation items
  const getAllNavItems = () => {
    const baseItems = [
      {
        href: '/dashboard',
        label: 'Dashboard',
        labelKh: 'ផ្ទាំងព័ត៌មាន',
        icon: BarChart3,
        exact: true,
        roles: ['teacher', 'cluster_mentor', 'admin'],
      },
      {
        href: '/dashboard/results',
        label: 'Results & Reports',
        labelKh: 'លទ្ធផល និងរបាយការណ៍',
        icon: BarChart3,
        roles: ['teacher', 'cluster_mentor', 'admin'],
      },
    ];

    // Teacher-specific items
    if (session.user.roles?.includes('teacher')) {
      baseItems.splice(1, 0, 
        {
          href: '/dashboard/assessment-entry',
          label: 'Assessment Entry',
          labelKh: 'បញ្ចូលការវាយតម្លៃ',
          icon: FileText,
          roles: ['teacher'],
        },
        {
          href: '/dashboard/student-selection',
          label: 'Student Selection',
          labelKh: 'ជ្រើសរើសសិស្ស',
          icon: Users,
          roles: ['teacher'],
        },
        {
          href: '/dashboard/simulations',
          label: 'STEM Simulations',
          labelKh: 'ការពិសោធន៍ STEM',
          icon: FlaskConical,
          roles: ['teacher'],
        }
      );
    }

    // Admin-specific items
    if (session.user.roles?.includes('admin')) {
      baseItems.push({
        href: '/dashboard/admin',
        label: 'Administration',
        labelKh: 'គ្រប់គ្រង',
        icon: Settings,
        roles: ['admin'],
      });
    }

    return baseItems.filter(item => item.roles.some(role => session.user.roles?.includes(role)));
  };

  const navItems = getAllNavItems();

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-lg">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Enhanced Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity min-w-0">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex-shrink-0">
                <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-800 truncate">
                  <span className="hidden sm:inline">Cambodia Virtual Lab STEM</span>
                  <span className="sm:hidden">Lab STEM</span>
                </h1>
                <p className="font-khmer text-xs sm:text-sm text-slate-600 truncate">មន្ទីរពិសោធន៍និម្មិតកម្ពុជា</p>
              </div>
            </Link>
          </div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center space-x-2 px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 lg:h-5 lg:w-5 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="font-medium text-xs lg:text-sm">{item.label}</span>
                  {active && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Enhanced User Menu */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative h-8 w-8 sm:h-10 sm:w-10">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold hidden sm:inline">2</span>
              </div>
            </Button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 px-2 sm:px-3 py-1.5 sm:py-2 h-auto hover:bg-slate-50 rounded-xl transition-all duration-200">
                  <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 sm:p-2 rounded-lg">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="font-medium text-slate-800 text-sm">
                        {session.user.roles?.includes('admin') ? 'Administrator' :
                         session.user.roles?.includes('cluster_mentor') ? `Mentor ${session.user.id}` :
                         `Teacher ${session.user.teacherId}`}
                      </p>
                      <div className="flex items-center space-x-1">
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-0 capitalize">
                          {session.user.roles?.[0]?.replace('_', ' ')}
                        </Badge>
                        {session.user.schoolAccess[0]?.subject && (
                          <Badge variant="outline" className="text-xs border-slate-200">
                            {session.user.schoolAccess[0].subject}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <div className="px-3 py-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Teacher {session.user.teacherId}</p>
                      <p className="text-sm text-slate-500 capitalize">{session.user.roles?.[0]}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-0">
                      {session.user.roles?.[0]}
                    </Badge>
                    {session.user.schoolAccess[0]?.subject && (
                      <Badge variant="outline" className="text-xs border-slate-200">
                        {session.user.schoolAccess[0].subject}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="py-2">
                  <DropdownMenuItem className="rounded-lg p-3 cursor-pointer hover:bg-slate-50">
                    <Settings className="h-4 w-4 mr-3 text-slate-500" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="rounded-lg p-3 cursor-pointer hover:bg-red-50 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enhanced Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-1.5 sm:p-2 rounded-xl hover:bg-slate-50 h-8 w-8 sm:h-10 sm:w-10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-slate-50/50 backdrop-blur-sm">
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <div className={`p-1.5 sm:p-2 rounded-lg ${active ? 'bg-blue-200' : 'bg-slate-200'}`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base">{item.label}</div>
                      <div className="font-khmer text-xs sm:text-sm text-slate-500 truncate">
                        {item.labelKh}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile User Info */}
            <div className="px-4 pb-4 pt-2 border-t border-slate-200">
              <div className="bg-white/80 p-4 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Teacher {session.user.teacherId}</p>
                    <p className="text-sm text-slate-500 capitalize">{session.user.roles?.[0]}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0">
                    {session.user.roles?.[0]}
                  </Badge>
                  {session.user.schoolAccess[0]?.subject && (
                    <Badge variant="outline" className="border-slate-200">
                      {session.user.schoolAccess[0].subject}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}