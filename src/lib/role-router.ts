import { User } from './auth';
import { ROLES } from './permissions';

export interface RoleRoute {
  role: string;
  defaultPath: string;
  name: string;
}

export const ROLE_ROUTES: RoleRoute[] = [
  {
    role: ROLES.SUPER_ADMIN,
    defaultPath: '/dashboard',
    name: 'Super Admin Dashboard'
  },
  {
    role: ROLES.ADMIN,
    defaultPath: '/dashboard',
    name: 'Administrator Dashboard'
  },
  {
    role: ROLES.PRINCIPAL,
    defaultPath: '/dashboard',
    name: 'Principal Dashboard'
  },
  {
    role: ROLES.CLUSTER_MENTOR,
    defaultPath: '/dashboard',
    name: 'Cluster Mentor Dashboard'
  },
  {
    role: ROLES.TEACHER,
    defaultPath: '/dashboard',
    name: 'Teacher Dashboard'
  },
  {
    role: ROLES.ASSISTANT_TEACHER,
    defaultPath: '/dashboard',
    name: 'Assistant Teacher Dashboard'
  },
  {
    role: ROLES.LIBRARIAN,
    defaultPath: '/dashboard',
    name: 'Librarian Dashboard'
  },
  {
    role: ROLES.COUNSELOR,
    defaultPath: '/dashboard',
    name: 'Counselor Dashboard'
  },
  {
    role: ROLES.STUDENT,
    defaultPath: '/student',
    name: 'Student Portal'
  },
  {
    role: ROLES.PARENT,
    defaultPath: '/parent',
    name: 'Parent Portal'
  },
  {
    role: ROLES.GUARDIAN,
    defaultPath: '/parent',
    name: 'Guardian Portal'
  },
  {
    role: ROLES.VIEWER,
    defaultPath: '/dashboard',
    name: 'Viewer Dashboard'
  }
];

export function getDefaultRouteForUser(user: User): string {
  // Get the highest priority role
  const userRoles = user.roles;
  
  // Role priority order (higher index = higher priority)
  const rolePriority = [
    ROLES.VIEWER,
    ROLES.STUDENT,
    ROLES.PARENT,
    ROLES.GUARDIAN,
    ROLES.ASSISTANT_TEACHER,
    ROLES.LIBRARIAN,
    ROLES.COUNSELOR,
    ROLES.TEACHER,
    ROLES.CLUSTER_MENTOR,
    ROLES.PRINCIPAL,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN
  ];
  
  // Find the highest priority role the user has
  let highestRole = null;
  let highestPriority = -1;
  
  for (const role of userRoles || []) {
    const priority = rolePriority.indexOf(role as any);
    if (priority > highestPriority) {
      highestPriority = priority;
      highestRole = role as any;
    }
  }
  
  // Find the route for the highest role
  const roleRoute = ROLE_ROUTES.find(route => route.role === highestRole);
  
  return roleRoute?.defaultPath || '/dashboard';
}

export function getDashboardNameForUser(user: User): string {
  const userRoles = user.roles || [];
  
  // Check for specific roles in priority order
  if (userRoles?.includes(ROLES.SUPER_ADMIN)) {
    return 'Super Administrator Dashboard';
  }
  if (userRoles?.includes(ROLES.ADMIN)) {
    return 'Administrator Dashboard';
  }
  if (userRoles?.includes(ROLES.PRINCIPAL)) {
    return 'Principal Dashboard';
  }
  if (userRoles?.includes(ROLES.CLUSTER_MENTOR)) {
    return 'Cluster Mentor Dashboard';
  }
  if (userRoles?.includes(ROLES.TEACHER)) {
    return 'Teacher Dashboard';
  }
  if (userRoles?.includes(ROLES.ASSISTANT_TEACHER)) {
    return 'Assistant Teacher Dashboard';
  }
  if (userRoles?.includes(ROLES.LIBRARIAN)) {
    return 'Librarian Dashboard';
  }
  if (userRoles?.includes(ROLES.COUNSELOR)) {
    return 'Counselor Dashboard';
  }
  if (userRoles?.includes(ROLES.STUDENT)) {
    return 'Student Portal';
  }
  if (userRoles?.includes(ROLES.PARENT)) {
    return 'Parent Portal';
  }
  if (userRoles?.includes(ROLES.GUARDIAN)) {
    return 'Guardian Portal';
  }
  if (userRoles?.includes(ROLES.VIEWER)) {
    return 'Viewer Dashboard';
  }
  
  return 'Dashboard';
}

export function getUserRoleDisplay(user: User): string {
  const userRoles = user.roles;
  
  // Show the highest priority role
  if (userRoles?.includes(ROLES.SUPER_ADMIN)) return 'Super Administrator';
  if (userRoles?.includes(ROLES.ADMIN)) return 'Administrator';
  if (userRoles?.includes(ROLES.PRINCIPAL)) return 'Principal';
  if (userRoles?.includes(ROLES.CLUSTER_MENTOR)) return 'Cluster Mentor';
  if (userRoles?.includes(ROLES.TEACHER)) return 'Teacher';
  if (userRoles?.includes(ROLES.ASSISTANT_TEACHER)) return 'Assistant Teacher';
  if (userRoles?.includes(ROLES.LIBRARIAN)) return 'Librarian';
  if (userRoles?.includes(ROLES.COUNSELOR)) return 'Counselor';
  if (userRoles?.includes(ROLES.STUDENT)) return 'Student';
  if (userRoles?.includes(ROLES.PARENT)) return 'Parent';
  if (userRoles?.includes(ROLES.GUARDIAN)) return 'Guardian';
  if (userRoles?.includes(ROLES.VIEWER)) return 'Viewer';
  
  return 'User';
}

export function canAccessRoute(user: User, pathname: string): boolean {
  // Basic route access control
  const userRoles = user.roles;
  
  // Student portal - only students
  if (pathname.startsWith('/student')) {
    return userRoles.includes(ROLES.STUDENT);
  }
  
  // Parent portal - parents and guardians
  if (pathname.startsWith('/parent')) {
    return userRoles.includes(ROLES.PARENT) || userRoles.includes(ROLES.GUARDIAN);
  }
  
  // Admin routes - admin and super admin only
  if (pathname.startsWith('/dashboard/admin')) {
    return userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.SUPER_ADMIN);
  }
  
  // General dashboard - all authenticated users
  if (pathname.startsWith('/dashboard')) {
    return true;
  }
  
  return true;
}