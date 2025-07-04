'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
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
  ChevronLeft,
  Menu,
  LogOut,
  Shield,
  MapPin,
  Award,
  X,
  User,
  Bell,
  Star,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Globe,
  Database,
  UserCheck,
  BookOpenCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModernSidebarProps {
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

interface MenuGroup {
  id: string;
  title: string;
  titleKH: string;
  icon: React.ComponentType<any>;
  badge?: string;
  items: MenuItem[];
  permission?: string;
  roles?: string[];
}

interface MenuItem {
  id: string;
  name: string;
  nameKH: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  permission: string;
  description?: string;
  isNew?: boolean;
  isPopular?: boolean;
}

const menuGroups: MenuGroup[] = [
  {
    id: 'overview',
    title: 'Overview',
    titleKH: 'ទិដ្ឋភាពទូទៅ',
    icon: LayoutDashboard,
    items: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        nameKH: 'ផ្ទាំងគ្រប់គ្រង',
        href: '/dashboard',
        icon: LayoutDashboard,
        permission: 'dashboard.read',
        description: 'System overview and key metrics'
      },
      {
        id: 'analytics',
        name: 'Analytics',
        nameKH: 'វិភាគទិន្នន័យ',
        href: '/dashboard/analytics',
        icon: BarChart3,
        permission: 'reports.read',
        description: 'Detailed performance analysis',
        isPopular: true
      }
    ]
  },
  {
    id: 'assessments',
    title: 'Assessments',
    titleKH: 'ការវាយតម្លៃ',
    icon: GraduationCap,
    badge: 'Core',
    items: [
      {
        id: 'student-assessment',
        name: 'Student Assessment',
        nameKH: 'ការវាយតម្លៃសិស្ស',
        href: '/dashboard/assessment-entry',
        icon: BookOpenCheck,
        permission: 'assessments.create',
        description: 'Conduct TaRL assessments',
        isNew: true
      },
      {
        id: 'assessment-results',
        name: 'Results',
        nameKH: 'លទ្ធផល',
        href: '/dashboard/results',
        icon: Target,
        permission: 'assessments.read',
        description: 'View assessment outcomes'
      },
      {
        id: 'student-selection',
        name: 'Student Selection',
        nameKH: 'ការជ្រើសរើសសិស្ស',
        href: '/dashboard/student-selection',
        icon: UserCheck,
        permission: 'assessments.read',
        description: 'Select students for intervention'
      }
    ]
  },
  {
    id: 'participants',
    title: 'Participants',
    titleKH: 'អ្នកចូលរួម',
    icon: Users,
    badge: '2M+',
    items: [
      {
        id: 'students',
        name: 'Students',
        nameKH: 'សិស្ស',
        href: '/dashboard/students',
        icon: Users,
        permission: 'students.read',
        badge: '2M+',
        description: 'Student profiles and progress'
      },
      {
        id: 'teachers',
        name: 'Teachers',
        nameKH: 'គ្រូបង្រៀន',
        href: '/dashboard/teachers',
        icon: BookOpen,
        permission: 'teachers.read',
        badge: '63K+',
        description: 'Teacher management'
      },
      {
        id: 'schools',
        name: 'Schools',
        nameKH: 'សាលារៀន',
        href: '/dashboard/schools',
        icon: School,
        permission: 'schools.read',
        badge: '7K+',
        description: 'School administration'
      }
    ]
  },
  {
    id: 'reports',
    title: 'Reports & Data',
    titleKH: 'របាយការណ៍ និងទិន្នន័យ',
    icon: FileText,
    items: [
      {
        id: 'performance-reports',
        name: 'Performance Reports',
        nameKH: 'របាយការណ៍ដំណើរការ',
        href: '/dashboard/reports',
        icon: FileText,
        permission: 'reports.read',
        description: 'Detailed performance analysis'
      },
      {
        id: 'progress-tracking',
        name: 'Progress Tracking',
        nameKH: 'តាមដានវឌ្ឍនភាព',
        href: '/dashboard/progress',
        icon: TrendingUp,
        permission: 'reports.read',
        description: 'Student progress over time'
      },
      {
        id: 'data-export',
        name: 'Data Export',
        nameKH: 'នាំចេញទិន្នន័យ',
        href: '/dashboard/export',
        icon: Database,
        permission: 'reports.read',
        description: 'Export data for analysis'
      }
    ]
  },
  {
    id: 'administration',
    title: 'Administration',
    titleKH: 'រដ្ឋបាល',
    icon: Shield,
    roles: ['administrator', 'super_admin'],
    items: [
      {
        id: 'user-management',
        name: 'User Management',
        nameKH: 'គ្រប់គ្រងអ្នកប្រើប្រាស់',
        href: '/dashboard/users',
        icon: Shield,
        permission: 'users.read',
        description: 'Manage system users'
      },
      {
        id: 'provinces',
        name: 'Provinces',
        nameKH: 'ខេត្ត',
        href: '/dashboard/provinces',
        icon: MapPin,
        permission: 'admin.read',
        description: 'Geographic administration'
      },
      {
        id: 'system-settings',
        name: 'System Settings',
        nameKH: 'ការកំណត់ប្រព័ន្ធ',
        href: '/dashboard/settings',
        icon: Settings,
        permission: 'settings.read',
        description: 'System configuration'
      }
    ]
  }
];

export default function ModernSidebar({ user, onLogout, mobileOpen, onMobileToggle, onCollapsedChange }: ModernSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['overview']);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

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

  const handleToggle = () => {
    if (isMobile && onMobileToggle) {
      onMobileToggle();
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleNavClick = () => {
    if (isMobile && onMobileToggle) {
      onMobileToggle();
    }
  };

  const toggleGroup = (groupId: string) => {
    if (collapsed && !isMobile) return;
    
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const filteredGroups = menuGroups.filter(group => {
    // Check role-based access
    if (group.roles && !group.roles.some(role => user.roles.includes(role))) {
      return false;
    }
    
    // Check if user has permission for any item in the group
    return group.items.some(item => user.permissions.includes(item.permission));
  });

  const sidebarContent = (
    <div className="flex flex-col h-screen bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <AnimatePresence>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center space-x-3"
            >
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 font-hanuman">TaRL System</h2>
                <p className="text-xs text-gray-500 font-hanuman">ប្រព័ន្ធ TaRL</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {isMobile ? <X className="h-5 w-5" /> : 
           collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* User Profile */}
      <div className={cn(
        "p-3 border-b border-gray-100",
        collapsed && !isMobile && "px-2"
      )}>
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 p-3">
          <div className={cn(
            "flex items-center space-x-3",
            collapsed && !isMobile && "justify-center"
          )}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white flex-shrink-0 relative">
              {user.firstName ? user.firstName[0] : user.username[0].toUpperCase()}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            <AnimatePresence>
              {(!collapsed || isMobile) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="font-semibold text-gray-900 text-sm truncate font-hanuman">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate font-hanuman">{user.email}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.roles.slice(0, 1).map((role) => (
                      <Badge 
                        key={role} 
                        className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 font-hanuman"
                      >
                        {role.replace('_', ' ')}
                      </Badge>
                    ))}
                    {user.roles.length > 1 && (
                      <Badge className="text-xs bg-gray-100 text-gray-600 border-0 font-hanuman">
                        +{user.roles.length - 1}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex-1 min-h-0">
        <nav className="h-full p-3 space-y-1 overflow-hidden">
          {filteredGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.id);
            const hasAccessibleItems = group.items.some(item => user.permissions.includes(item.permission));
            
            if (!hasAccessibleItems) return null;

            return (
              <div key={group.id} className="space-y-0.5">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all duration-200 group",
                    isExpanded ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    collapsed && !isMobile && "justify-center"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <group.icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isExpanded ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                    )} />
                    
                    <AnimatePresence>
                      {(!collapsed || isMobile) && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex items-center space-x-2"
                        >
                          <span className="font-medium text-sm font-hanuman">{group.title}</span>
                          {group.badge && (
                            <Badge className="text-xs bg-blue-100 text-blue-700 border-0 font-hanuman">
                              {group.badge}
                            </Badge>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {(!collapsed || isMobile) && (
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  )}
                </button>

                {/* Group Items */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1"
                    >
                      {group.items
                        .filter(item => user.permissions.includes(item.permission))
                        .map((item) => {
                          const isActive = pathname === item.href;
                          
                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              onClick={handleNavClick}
                              className={cn(
                                "flex items-center p-2 rounded-lg text-sm transition-all duration-200 group relative",
                                isActive
                                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                                collapsed && !isMobile && "justify-center px-2"
                              )}
                            >
                              <item.icon className={cn(
                                "h-4 w-4 flex-shrink-0",
                                (!collapsed || isMobile) ? "mr-3" : "",
                                isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                              )} />
                              
                              <AnimatePresence>
                                {(!collapsed || isMobile) && (
                                  <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="flex-1 flex items-center justify-between"
                                  >
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <span className="font-medium font-hanuman">{item.name}</span>
                                        {item.isNew && (
                                          <Badge className="text-xs bg-green-100 text-green-700 border-0 font-hanuman">
                                            New
                                          </Badge>
                                        )}
                                        {item.isPopular && (
                                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                        )}
                                      </div>
                                    </div>
                                    
                                    {item.badge && (
                                      <Badge className={cn(
                                        "text-xs border-0 font-hanuman",
                                        isActive 
                                          ? "bg-white/20 text-white" 
                                          : "bg-gray-100 text-gray-600"
                                      )}>
                                        {item.badge}
                                      </Badge>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Link>
                          );
                        })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-hanuman h-10",
            collapsed && !isMobile && "justify-center px-2"
          )}
          onClick={onLogout}
        >
          <LogOut className={cn(
            "h-4 w-4",
            (!collapsed || isMobile) && "mr-3"
          )} />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </Button>
        
        <AnimatePresence>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-center mt-2"
            >
              <p className="text-xs text-gray-400 font-hanuman">v2.0 • Made with ❤️ for Cambodia</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // Mobile: Overlay sidebar
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onMobileToggle}
          />
        )}
        
        {/* Sidebar */}
        <motion.div 
          initial={{ x: -320 }}
          animate={{ x: mobileOpen ? 0 : -320 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-y-0 left-0 z-50 w-80 md:hidden"
        >
          {sidebarContent}
        </motion.div>
      </>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <motion.div 
      animate={{ width: collapsed ? 80 : 320 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed top-0 left-0 z-40 hidden md:block h-screen"
    >
      {sidebarContent}
    </motion.div>
  );
}