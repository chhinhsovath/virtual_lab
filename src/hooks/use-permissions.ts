'use client';

import { useMemo } from 'react';
import type { User } from '@/types/auth';
import { createPermissionManager } from '@/lib/permission-utils';
import { Permission, Role, CrudAction, AccessType } from '@/lib/permissions';

export function usePermissions(user: User) {
  const manager = useMemo(() => createPermissionManager(user), [user]);

  return {
    // Basic permission checks
    hasPermission: (resource: string, action: string) => manager.hasPermission(resource, action),
    hasRole: (role: Role) => manager.hasRole(role),
    hasAnyRole: (roles: Role[]) => manager.hasAnyRole(roles),
    hasAnyPermission: (permissions: Permission[]) => manager.hasAnyPermission(permissions),
    hasMinimumRole: (role: Role) => manager.hasMinimumRole(role),
    
    // Page access checks
    canAccessPage: (pathname: string) => manager.checkPageAccess(pathname).allowed,
    getAccessiblePages: () => manager.getAccessiblePages(),
    
    // Resource access checks
    canAccessResource: (resource: string, action: CrudAction, resourceId?: string) => 
      manager.checkResourceAccess(resource, action, resourceId).allowed,
    getResourceActions: (resource: string) => manager.getResourceActions(resource),
    
    // School access checks
    canAccessSchool: (schoolId: number, requiredAccess: AccessType = 'read') => 
      manager.hasMinimumAccess(schoolId, requiredAccess),
    canAccessSchoolResource: (resource: string, action: CrudAction, schoolId: number, requiredAccess: AccessType = 'read') => 
      manager.checkSchoolResourceAccess(resource, action, schoolId, requiredAccess).allowed,
    getAccessibleSchools: (requiredAccess: AccessType = 'read') => manager.getAccessibleSchools(requiredAccess),
    
    // User management checks
    canManageUser: (targetUserId: string) => manager.canManageUser(targetUserId),
    canAssignRole: (targetRole: Role) => manager.canAssignRole(targetRole),
    
    // Utility functions
    isAdmin: () => manager.hasAnyRole(['admin', 'super_admin']),
    isSuperAdmin: () => manager.hasRole('super_admin'),
    isTeacher: () => manager.hasRole('teacher'),
    isClusterMentor: () => manager.hasRole('cluster_mentor'),
    
    // Raw manager for advanced use cases
    manager
  };
}

export function useResourcePermissions(user: User, resource: string) {
  const manager = useMemo(() => createPermissionManager(user), [user]);
  
  return useMemo(() => ({
    canCreate: manager.checkResourceAccess(resource, 'create').allowed,
    canRead: manager.checkResourceAccess(resource, 'read').allowed,
    canUpdate: manager.checkResourceAccess(resource, 'update').allowed,
    canDelete: manager.checkResourceAccess(resource, 'delete').allowed,
    availableActions: manager.getResourceActions(resource)
  }), [manager, resource]);
}

export function useSchoolPermissions(user: User, schoolId: number) {
  const manager = useMemo(() => createPermissionManager(user), [user]);
  
  return useMemo(() => ({
    canRead: manager.hasMinimumAccess(schoolId, 'read'),
    canWrite: manager.hasMinimumAccess(schoolId, 'write'),
    canAdmin: manager.hasMinimumAccess(schoolId, 'admin'),
    accessLevel: user.schoolAccess.find(access => access.schoolId === schoolId)?.accessType || null,
    subject: user.schoolAccess.find(access => access.schoolId === schoolId)?.subject || null
  }), [manager, schoolId, user.schoolAccess]);
}