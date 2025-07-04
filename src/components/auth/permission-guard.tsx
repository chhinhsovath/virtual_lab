'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/auth';
import { createPermissionManager, PermissionCheckResult } from '@/lib/permission-utils';
import { Permission, Role, CrudAction, AccessType } from '@/lib/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  user: User;
  permission?: Permission;
  role?: Role;
  resource?: string;
  action?: CrudAction;
  schoolId?: number;
  requiredAccess?: AccessType;
  fallbackComponent?: React.ReactNode;
  redirectTo?: string;
  showError?: boolean;
}

export function PermissionGuard({
  children,
  user,
  permission,
  role,
  resource,
  action,
  schoolId,
  requiredAccess = 'read',
  fallbackComponent,
  redirectTo,
  showError = true
}: PermissionGuardProps) {
  const router = useRouter();
  const [checkResult, setCheckResult] = useState<PermissionCheckResult>({ allowed: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const manager = createPermissionManager(user);
    let result: PermissionCheckResult = { allowed: false };

    if (permission) {
      const [permResource, permAction] = permission.split('.');
      result = {
        allowed: manager.hasPermission(permResource, permAction),
        reason: !manager.hasPermission(permResource, permAction) ? `Missing permission: ${permission}` : undefined
      };
    } else if (role) {
      result = {
        allowed: manager.hasRole(role),
        reason: !manager.hasRole(role) ? `Missing role: ${role}` : undefined
      };
    } else if (resource && action) {
      if (schoolId !== undefined) {
        result = manager.checkSchoolResourceAccess(resource, action, schoolId, requiredAccess);
      } else {
        result = manager.checkResourceAccess(resource, action);
      }
    } else {
      result = { allowed: true };
    }

    setCheckResult(result);
    setIsLoading(false);

    if (!result.allowed && redirectTo) {
      router.push(redirectTo);
    }
  }, [user, permission, role, resource, action, schoolId, requiredAccess, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!checkResult.allowed) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    if (!showError) {
      return null;
    }

    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Access Denied</div>
          {checkResult.reason && (
            <div className="text-gray-600 text-sm">{checkResult.reason}</div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface ConditionalRenderProps {
  user: User;
  permission?: Permission;
  role?: Role;
  resource?: string;
  action?: CrudAction;
  schoolId?: number;
  requiredAccess?: AccessType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ConditionalRender({
  user,
  permission,
  role,
  resource,
  action,
  schoolId,
  requiredAccess = 'read',
  children,
  fallback
}: ConditionalRenderProps) {
  const manager = createPermissionManager(user);
  let allowed = false;

  if (permission) {
    const [permResource, permAction] = permission.split('.');
    allowed = manager.hasPermission(permResource, permAction);
  } else if (role) {
    allowed = manager.hasRole(role);
  } else if (resource && action) {
    if (schoolId !== undefined) {
      allowed = manager.checkSchoolResourceAccess(resource, action, schoolId, requiredAccess).allowed;
    } else {
      allowed = manager.checkResourceAccess(resource, action).allowed;
    }
  }

  return allowed ? <>{children}</> : <>{fallback}</>;
}

interface PageGuardProps {
  children: React.ReactNode;
  user: User;
  pathname: string;
  fallbackComponent?: React.ReactNode;
}

export function PageGuard({ children, user, pathname, fallbackComponent }: PageGuardProps) {
  const router = useRouter();
  const [checkResult, setCheckResult] = useState<PermissionCheckResult>({ allowed: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const manager = createPermissionManager(user);
    const result = manager.checkPageAccess(pathname);
    
    setCheckResult(result);
    setIsLoading(false);

    if (!result.allowed && result.fallbackPage) {
      router.push(result.fallbackPage);
    }
  }, [user, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!checkResult.allowed) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Page Access Denied</div>
          {checkResult.reason && (
            <div className="text-gray-600 text-sm">{checkResult.reason}</div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}