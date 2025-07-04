import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth';
import { checkPagePermission, checkResourcePermission, checkSchoolResourcePermission } from '../../../../lib/permission-utils';
import { CrudAction, AccessType } from '../../../../lib/permissions';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    const session = await getSession(sessionToken);
    
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { type, ...params } = body;

    let result;

    switch (type) {
      case 'page':
        result = checkPagePermission(session.user, params.pathname);
        break;
        
      case 'resource':
        result = checkResourcePermission(
          session.user, 
          params.resource, 
          params.action as CrudAction, 
          params.resourceId
        );
        break;
        
      case 'school_resource':
        result = checkSchoolResourcePermission(
          session.user,
          params.resource,
          params.action as CrudAction,
          params.schoolId,
          params.requiredAccess as AccessType
        );
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid permission check type' }, { status: 400 });
    }

    return NextResponse.json({
      allowed: result.allowed,
      reason: result.reason,
      fallbackPage: result.fallbackPage
    });

  } catch (error) {
    console.error('Permission check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    const session = await getSession(sessionToken);
    
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const pathname = searchParams.get('pathname');
    const resource = searchParams.get('resource');
    const action = searchParams.get('action') as CrudAction;
    const schoolId = searchParams.get('schoolId');
    const requiredAccess = searchParams.get('requiredAccess') as AccessType;

    let result;

    if (type === 'page' && pathname) {
      result = checkPagePermission(session.user, pathname);
    } else if (type === 'resource' && resource && action) {
      result = checkResourcePermission(session.user, resource, action);
    } else if (type === 'school_resource' && resource && action && schoolId) {
      result = checkSchoolResourcePermission(
        session.user,
        resource,
        action,
        parseInt(schoolId),
        requiredAccess || 'read'
      );
    } else {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    return NextResponse.json({
      allowed: result.allowed,
      reason: result.reason,
      fallbackPage: result.fallbackPage
    });

  } catch (error) {
    console.error('Permission check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}