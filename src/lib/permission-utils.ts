import type { User } from '@/types/auth';
import { hasPermission, hasRole, canAccessSchool } from './auth';
import { 
  Permission, 
  Role, 
  CrudAction, 
  AccessType,
  PagePermission, 
  ResourcePermissionConfig,
  PAGE_PERMISSIONS,
  RESOURCE_PERMISSIONS,
  PERMISSION_HIERARCHY,
  ROLE_HIERARCHY,
  PERMISSIONS,
  ROLES
} from './permissions';

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  fallbackPage?: string;
}

export class PermissionManager {
  constructor(private user: User) {}

  checkPageAccess(pathname: string): PermissionCheckResult {
    const pageConfig = PAGE_PERMISSIONS[pathname];
    
    if (!pageConfig) {
      return { allowed: true };
    }

    if (pageConfig.requiredRole && !hasRole(this.user, pageConfig.requiredRole)) {
      return {
        allowed: false,
        reason: `Required role: ${pageConfig.requiredRole}`,
        fallbackPage: pageConfig.fallbackPage || '/dashboard'
      };
    }

    if (pageConfig.requiredPermission && !hasPermission(this.user, (pageConfig.requiredPermission as string).split('.')[0], (pageConfig.requiredPermission as string).split('.')[1])) {
      return {
        allowed: false,
        reason: `Required permission: ${pageConfig.requiredPermission}`,
        fallbackPage: pageConfig.fallbackPage || '/dashboard'
      };
    }

    if (pageConfig.customCheck && !pageConfig.customCheck(this.user)) {
      return {
        allowed: false,
        reason: 'Custom check failed',
        fallbackPage: pageConfig.fallbackPage || '/dashboard'
      };
    }

    return { allowed: true };
  }

  checkResourceAccess(resource: string, action: CrudAction, resourceId?: string): PermissionCheckResult {
    const resourceConfig = RESOURCE_PERMISSIONS[resource];
    
    if (!resourceConfig) {
      return { allowed: false, reason: 'Unknown resource' };
    }

    const requiredPermission = resourceConfig.permissions[action];
    
    if (!requiredPermission) {
      return { allowed: false, reason: `Action '${action}' not allowed on resource '${resource}'` };
    }

    const [permissionResource, permissionAction] = (requiredPermission as string).split('.');
    
    if (!hasPermission(this.user, permissionResource, permissionAction)) {
      return {
        allowed: false,
        reason: `Missing permission: ${requiredPermission}`
      };
    }

    if (resourceConfig.customChecks && resourceId) {
      const customCheck = resourceConfig.customChecks[action];
      if (customCheck && !customCheck(this.user, resourceId)) {
        return {
          allowed: false,
          reason: 'Custom authorization check failed'
        };
      }
    }

    return { allowed: true };
  }

  checkSchoolResourceAccess(resource: string, action: CrudAction, schoolId: number, requiredAccess: AccessType = 'read'): PermissionCheckResult {
    const resourceCheck = this.checkResourceAccess(resource, action);
    if (!resourceCheck.allowed) {
      return resourceCheck;
    }

    if (!canAccessSchool(this.user, schoolId, requiredAccess)) {
      return {
        allowed: false,
        reason: `Insufficient school access. Required: ${requiredAccess}`
      };
    }

    return { allowed: true };
  }

  hasRole(role: Role): boolean {
    return hasRole(this.user, role);
  }

  hasPermission(resource: string, action: string): boolean {
    return hasPermission(this.user, resource, action);
  }

  hasAnyRole(roles: Role[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => {
      const [resource, action] = (permission as string).split('.');
      return this.hasPermission(resource, action);
    });
  }

  hasMinimumRole(role: Role): boolean {
    const userMaxRole = Math.max(...(this.user.roles || []).map(r => ROLE_HIERARCHY[r as Role] || 0));
    const requiredLevel = ROLE_HIERARCHY[role];
    return userMaxRole >= requiredLevel;
  }

  hasMinimumAccess(schoolId: number, requiredAccess: AccessType): boolean {
    const schoolAccess = this.user.schoolAccess.find(access => access.schoolId === schoolId);
    if (!schoolAccess) return false;

    const userAccessLevel = PERMISSION_HIERARCHY[schoolAccess.accessType];
    const requiredLevel = PERMISSION_HIERARCHY[requiredAccess];
    
    return userAccessLevel >= requiredLevel;
  }

  getAccessiblePages(): string[] {
    return Object.keys(PAGE_PERMISSIONS).filter(pathname => {
      return this.checkPageAccess(pathname).allowed;
    });
  }

  getResourceActions(resource: string): CrudAction[] {
    const resourceConfig = RESOURCE_PERMISSIONS[resource];
    if (!resourceConfig) return [];

    return Object.keys(resourceConfig.permissions)
      .filter(action => {
        const permission = resourceConfig.permissions[action as CrudAction];
        if (!permission) return false;
        
        const [permissionResource, permissionAction] = (permission as string).split('.');
        return this.hasPermission(permissionResource, permissionAction);
      }) as CrudAction[];
  }

  getAccessibleSchools(requiredAccess: AccessType = 'read'): number[] {
    const accessLevels = { read: 1, write: 2, admin: 3 };
    const requiredLevel = accessLevels[requiredAccess];

    return this.user.schoolAccess
      .filter(access => accessLevels[access.accessType] >= requiredLevel)
      .map(access => access.schoolId);
  }

  canManageUser(targetUserId: string): boolean {
    if (this.hasRole(ROLES.SUPER_ADMIN)) {
      return true;
    }
    
    if (this.user.id === targetUserId && this.hasPermission('users', 'update')) {
      return true;
    }
    
    return this.hasPermission('users', 'update') && this.hasRole(ROLES.ADMIN);
  }

  canAssignRole(targetRole: Role): boolean {
    if (!this.hasPermission('users', 'manage_roles')) {
      return false;
    }

    const userMaxRoleLevel = Math.max(...(this.user.roles || []).map(r => ROLE_HIERARCHY[r as Role] || 0));
    const targetRoleLevel = ROLE_HIERARCHY[targetRole];
    
    return userMaxRoleLevel > targetRoleLevel;
  }
}

export function createPermissionManager(user: User): PermissionManager {
  return new PermissionManager(user);
}

export function checkPagePermission(user: User, pathname: string): PermissionCheckResult {
  const manager = createPermissionManager(user);
  return manager.checkPageAccess(pathname);
}

export function checkResourcePermission(user: User, resource: string, action: CrudAction, resourceId?: string): PermissionCheckResult {
  const manager = createPermissionManager(user);
  return manager.checkResourceAccess(resource, action, resourceId);
}

export function checkSchoolResourcePermission(user: User, resource: string, action: CrudAction, schoolId: number, requiredAccess: AccessType = 'read'): PermissionCheckResult {
  const manager = createPermissionManager(user);
  return manager.checkSchoolResourceAccess(resource, action, schoolId, requiredAccess);
}

export function requirePermission(user: User, permission: Permission): void {
  const [resource, action] = (permission as string).split('.');
  if (!hasPermission(user, resource, action)) {
    throw new Error(`Access denied. Required permission: ${permission}`);
  }
}

export function requireRole(user: User, role: Role): void {
  if (!hasRole(user, role)) {
    throw new Error(`Access denied. Required role: ${role}`);
  }
}

export function requireSchoolAccess(user: User, schoolId: number, requiredAccess: AccessType = 'read'): void {
  if (!canAccessSchool(user, schoolId, requiredAccess)) {
    throw new Error(`Access denied. Required school access: ${requiredAccess} for school ${schoolId}`);
  }
}