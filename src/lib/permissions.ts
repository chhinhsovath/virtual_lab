export const PERMISSIONS = {
  // User Management
  USERS: {
    CREATE: 'users.create',
    READ: 'users.read',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
    MANAGE_ROLES: 'users.manage_roles',
    MANAGE_PERMISSIONS: 'users.manage_permissions',
    IMPORT: 'users.import',
    EXPORT: 'users.export'
  },
  
  // Role Management
  ROLES: {
    CREATE: 'roles.create',
    READ: 'roles.read',
    UPDATE: 'roles.update',
    DELETE: 'roles.delete',
    MANAGE_PERMISSIONS: 'roles.manage_permissions'
  },
  
  // Assessment Management
  ASSESSMENTS: {
    CREATE: 'assessments.create',
    READ: 'assessments.read',
    UPDATE: 'assessments.update',
    DELETE: 'assessments.delete',
    EXPORT: 'assessments.export',
    GRADE: 'assessments.grade',
    PUBLISH: 'assessments.publish'
  },
  
  // Student Management
  STUDENTS: {
    CREATE: 'students.create',
    READ: 'students.read',
    UPDATE: 'students.update',
    DELETE: 'students.delete',
    SELECT: 'students.select',
    EXPORT: 'students.export',
    ENROLL: 'students.enroll',
    MANAGE_PROGRESS: 'students.manage_progress',
    VIEW_GRADES: 'students.view_grades'
  },
  
  // Course/Class Management
  COURSES: {
    CREATE: 'courses.create',
    READ: 'courses.read',
    UPDATE: 'courses.update',
    DELETE: 'courses.delete',
    MANAGE_ENROLLMENT: 'courses.manage_enrollment',
    MANAGE_CONTENT: 'courses.manage_content',
    PUBLISH: 'courses.publish'
  },
  
  // Content Management
  CONTENT: {
    CREATE: 'content.create',
    READ: 'content.read',
    UPDATE: 'content.update',
    DELETE: 'content.delete',
    PUBLISH: 'content.publish',
    MANAGE_VERSIONS: 'content.manage_versions'
  },
  
  // Grades Management
  GRADES: {
    CREATE: 'grades.create',
    READ: 'grades.read',
    UPDATE: 'grades.update',
    DELETE: 'grades.delete',
    EXPORT: 'grades.export',
    PUBLISH: 'grades.publish'
  },
  
  // Attendance Management
  ATTENDANCE: {
    CREATE: 'attendance.create',
    READ: 'attendance.read',
    UPDATE: 'attendance.update',
    DELETE: 'attendance.delete',
    EXPORT: 'attendance.export'
  },
  
  // Communication
  COMMUNICATION: {
    SEND_MESSAGE: 'communication.send_message',
    READ_MESSAGE: 'communication.read_message',
    SEND_ANNOUNCEMENT: 'communication.send_announcement',
    MANAGE_NOTIFICATIONS: 'communication.manage_notifications'
  },
  
  // School Management
  SCHOOLS: {
    CREATE: 'schools.create',
    READ: 'schools.read',
    UPDATE: 'schools.update',
    DELETE: 'schools.delete',
    MANAGE_ACCESS: 'schools.manage_access',
    MANAGE_CLASSES: 'schools.manage_classes'
  },
  
  // Reports
  REPORTS: {
    READ: 'reports.read',
    EXPORT: 'reports.export',
    CREATE_CUSTOM: 'reports.create_custom',
    ACADEMIC: 'reports.academic',
    ADMINISTRATIVE: 'reports.administrative'
  },
  
  // System Administration
  SYSTEM: {
    BACKUP: 'system.backup',
    RESTORE: 'system.restore',
    LOGS: 'system.logs',
    SETTINGS: 'system.settings',
    MAINTENANCE: 'system.maintenance'
  },
  
  // Page Access
  PAGES: {
    DASHBOARD: 'pages.dashboard',
    USER_MANAGEMENT: 'pages.user_management',
    ROLE_MANAGEMENT: 'pages.role_management',
    STUDENT_MANAGEMENT: 'pages.student_management',
    COURSE_MANAGEMENT: 'pages.course_management',
    CONTENT_MANAGEMENT: 'pages.content_management',
    ASSESSMENT_ENTRY: 'pages.assessment_entry',
    GRADE_BOOK: 'pages.grade_book',
    ATTENDANCE: 'pages.attendance',
    REPORTS: 'pages.reports',
    COMMUNICATION: 'pages.communication',
    SETTINGS: 'pages.settings',
    ADMIN_PANEL: 'pages.admin_panel',
    STUDENT_PORTAL: 'pages.student_portal',
    PARENT_PORTAL: 'pages.parent_portal'
  }
} as const;

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PRINCIPAL: 'principal',
  CLUSTER_MENTOR: 'cluster_mentor',
  TEACHER: 'teacher',
  ASSISTANT_TEACHER: 'assistant_teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  GUARDIAN: 'guardian',
  LIBRARIAN: 'librarian',
  COUNSELOR: 'counselor',
  VIEWER: 'viewer'
} as const;

export const CRUD_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete'
} as const;

export const ACCESS_TYPES = {
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin'
} as const;

export const SUBJECTS = {
  KHMER: 'khmer',
  MATH: 'math',
  ALL: 'all'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];
export type Role = typeof ROLES[keyof typeof ROLES];
export type CrudAction = typeof CRUD_ACTIONS[keyof typeof CRUD_ACTIONS];
export type AccessType = typeof ACCESS_TYPES[keyof typeof ACCESS_TYPES];
export type Subject = typeof SUBJECTS[keyof typeof SUBJECTS];

export interface PagePermission {
  page: string;
  requiredPermission?: Permission;
  requiredRole?: Role;
  customCheck?: (user: any) => boolean;
  fallbackPage?: string;
}

export const PAGE_PERMISSIONS: Record<string, PagePermission> = {
  '/dashboard': {
    page: 'dashboard',
    requiredPermission: PERMISSIONS.PAGES.DASHBOARD
  },
  '/dashboard/users': {
    page: 'user_management',
    requiredPermission: PERMISSIONS.PAGES.USER_MANAGEMENT
  },
  '/dashboard/roles': {
    page: 'role_management',
    requiredPermission: PERMISSIONS.PAGES.ROLE_MANAGEMENT
  },
  '/dashboard/students': {
    page: 'student_management',
    requiredPermission: PERMISSIONS.PAGES.STUDENT_MANAGEMENT
  },
  '/dashboard/courses': {
    page: 'course_management',
    requiredPermission: PERMISSIONS.PAGES.COURSE_MANAGEMENT
  },
  '/dashboard/content': {
    page: 'content_management',
    requiredPermission: PERMISSIONS.PAGES.CONTENT_MANAGEMENT
  },
  '/dashboard/assessments': {
    page: 'assessment_entry',
    requiredPermission: PERMISSIONS.PAGES.ASSESSMENT_ENTRY
  },
  '/dashboard/gradebook': {
    page: 'grade_book',
    requiredPermission: PERMISSIONS.PAGES.GRADE_BOOK
  },
  '/dashboard/attendance': {
    page: 'attendance',
    requiredPermission: PERMISSIONS.PAGES.ATTENDANCE
  },
  '/dashboard/communication': {
    page: 'communication',
    requiredPermission: PERMISSIONS.PAGES.COMMUNICATION
  },
  '/dashboard/reports': {
    page: 'reports',
    requiredPermission: PERMISSIONS.PAGES.REPORTS
  },
  '/dashboard/settings': {
    page: 'settings',
    requiredPermission: PERMISSIONS.PAGES.SETTINGS
  },
  '/dashboard/admin': {
    page: 'admin_panel',
    requiredPermission: PERMISSIONS.PAGES.ADMIN_PANEL,
    requiredRole: ROLES.SUPER_ADMIN
  },
  '/student': {
    page: 'student_portal',
    requiredPermission: PERMISSIONS.PAGES.STUDENT_PORTAL,
    requiredRole: ROLES.STUDENT,
    fallbackPage: '/dashboard'
  },
  '/parent': {
    page: 'parent_portal',
    requiredPermission: PERMISSIONS.PAGES.PARENT_PORTAL,
    customCheck: (user) => user.roles.includes(ROLES.PARENT) || user.roles.includes(ROLES.GUARDIAN),
    fallbackPage: '/dashboard'
  }
};

export interface ResourcePermissionConfig {
  resource: string;
  permissions: {
    [key in CrudAction]?: Permission;
  };
  customChecks?: {
    [key: string]: (user: any, resourceId?: string) => boolean;
  };
}

export const RESOURCE_PERMISSIONS: Record<string, ResourcePermissionConfig> = {
  users: {
    resource: 'users',
    permissions: {
      [CRUD_ACTIONS.CREATE]: PERMISSIONS.USERS.CREATE,
      [CRUD_ACTIONS.READ]: PERMISSIONS.USERS.READ,
      [CRUD_ACTIONS.UPDATE]: PERMISSIONS.USERS.UPDATE,
      [CRUD_ACTIONS.DELETE]: PERMISSIONS.USERS.DELETE
    }
  },
  roles: {
    resource: 'roles',
    permissions: {
      [CRUD_ACTIONS.CREATE]: PERMISSIONS.ROLES.CREATE,
      [CRUD_ACTIONS.READ]: PERMISSIONS.ROLES.READ,
      [CRUD_ACTIONS.UPDATE]: PERMISSIONS.ROLES.UPDATE,
      [CRUD_ACTIONS.DELETE]: PERMISSIONS.ROLES.DELETE
    }
  },
  students: {
    resource: 'students',
    permissions: {
      [CRUD_ACTIONS.CREATE]: PERMISSIONS.STUDENTS.CREATE,
      [CRUD_ACTIONS.READ]: PERMISSIONS.STUDENTS.READ,
      [CRUD_ACTIONS.UPDATE]: PERMISSIONS.STUDENTS.UPDATE,
      [CRUD_ACTIONS.DELETE]: PERMISSIONS.STUDENTS.DELETE
    },
    customChecks: {
      [CRUD_ACTIONS.READ]: (user, resourceId) => {
        // Students can only read their own data
        if (user.roles.includes(ROLES.STUDENT)) {
          return user.studentId === resourceId;
        }
        // Parents can read their children's data
        if (user.roles.includes(ROLES.PARENT) || user.roles.includes(ROLES.GUARDIAN)) {
          return user.childrenIds?.includes(resourceId);
        }
        return true;
      }
    }
  },
  courses: {
    resource: 'courses',
    permissions: {
      [CRUD_ACTIONS.CREATE]: PERMISSIONS.COURSES.CREATE,
      [CRUD_ACTIONS.READ]: PERMISSIONS.COURSES.READ,
      [CRUD_ACTIONS.UPDATE]: PERMISSIONS.COURSES.UPDATE,
      [CRUD_ACTIONS.DELETE]: PERMISSIONS.COURSES.DELETE
    }
  },
  content: {
    resource: 'content',
    permissions: {
      [CRUD_ACTIONS.CREATE]: PERMISSIONS.CONTENT.CREATE,
      [CRUD_ACTIONS.READ]: PERMISSIONS.CONTENT.READ,
      [CRUD_ACTIONS.UPDATE]: PERMISSIONS.CONTENT.UPDATE,
      [CRUD_ACTIONS.DELETE]: PERMISSIONS.CONTENT.DELETE
    }
  },
  assessments: {
    resource: 'assessments',
    permissions: {
      [CRUD_ACTIONS.CREATE]: PERMISSIONS.ASSESSMENTS.CREATE,
      [CRUD_ACTIONS.READ]: PERMISSIONS.ASSESSMENTS.READ,
      [CRUD_ACTIONS.UPDATE]: PERMISSIONS.ASSESSMENTS.UPDATE,
      [CRUD_ACTIONS.DELETE]: PERMISSIONS.ASSESSMENTS.DELETE
    }
  },
  grades: {
    resource: 'grades',
    permissions: {
      [CRUD_ACTIONS.CREATE]: PERMISSIONS.GRADES.CREATE,
      [CRUD_ACTIONS.READ]: PERMISSIONS.GRADES.READ,
      [CRUD_ACTIONS.UPDATE]: PERMISSIONS.GRADES.UPDATE,
      [CRUD_ACTIONS.DELETE]: PERMISSIONS.GRADES.DELETE
    },
    customChecks: {
      [CRUD_ACTIONS.READ]: (user, resourceId) => {
        // Students can only read their own grades
        if (user.roles.includes(ROLES.STUDENT)) {
          return user.studentId === resourceId;
        }
        // Parents can read their children's grades
        if (user.roles.includes(ROLES.PARENT) || user.roles.includes(ROLES.GUARDIAN)) {
          return user.childrenIds?.includes(resourceId);
        }
        return true;
      }
    }
  },
  attendance: {
    resource: 'attendance',
    permissions: {
      [CRUD_ACTIONS.CREATE]: PERMISSIONS.ATTENDANCE.CREATE,
      [CRUD_ACTIONS.READ]: PERMISSIONS.ATTENDANCE.READ,
      [CRUD_ACTIONS.UPDATE]: PERMISSIONS.ATTENDANCE.UPDATE,
      [CRUD_ACTIONS.DELETE]: PERMISSIONS.ATTENDANCE.DELETE
    }
  },
  schools: {
    resource: 'schools',
    permissions: {
      [CRUD_ACTIONS.CREATE]: PERMISSIONS.SCHOOLS.CREATE,
      [CRUD_ACTIONS.READ]: PERMISSIONS.SCHOOLS.READ,
      [CRUD_ACTIONS.UPDATE]: PERMISSIONS.SCHOOLS.UPDATE,
      [CRUD_ACTIONS.DELETE]: PERMISSIONS.SCHOOLS.DELETE
    }
  }
};

export const PERMISSION_HIERARCHY = {
  [ACCESS_TYPES.READ]: 1,
  [ACCESS_TYPES.WRITE]: 2,
  [ACCESS_TYPES.ADMIN]: 3
};

export const ROLE_HIERARCHY = {
  [ROLES.STUDENT]: 1,
  [ROLES.PARENT]: 1,
  [ROLES.GUARDIAN]: 1,
  [ROLES.VIEWER]: 2,
  [ROLES.ASSISTANT_TEACHER]: 3,
  [ROLES.TEACHER]: 4,
  [ROLES.LIBRARIAN]: 4,
  [ROLES.COUNSELOR]: 4,
  [ROLES.CLUSTER_MENTOR]: 5,
  [ROLES.PRINCIPAL]: 6,
  [ROLES.ADMIN]: 7,
  [ROLES.SUPER_ADMIN]: 8
};

// User type definitions for LMS
export interface StudentProfile {
  studentId: string;
  enrollmentDate: Date;
  graduationDate?: Date;
  currentGrade: string;
  classId?: string;
  parentIds?: string[];
  guardianIds?: string[];
  academicStatus: 'active' | 'inactive' | 'suspended' | 'graduated';
}

export interface ParentProfile {
  parentId: string;
  childrenIds: string[];
  relationship: 'parent' | 'guardian' | 'emergency_contact';
  primaryContact: boolean;
}

export interface TeacherProfile {
  teacherId: string;
  subjects: string[];
  classIds: string[];
  qualifications: string[];
  hireDate: Date;
}

export interface ClassEnrollment {
  classId: string;
  courseId: string;
  studentId: string;
  enrollmentDate: Date;
  status: 'enrolled' | 'completed' | 'dropped' | 'pending';
  grade?: string;
}

// LMS-specific permission configurations
export const LMS_PERMISSIONS = {
  STUDENT_SELF_ACCESS: {
    VIEW_OWN_PROFILE: 'student.view_own_profile',
    UPDATE_OWN_PROFILE: 'student.update_own_profile',
    VIEW_OWN_GRADES: 'student.view_own_grades',
    VIEW_OWN_ATTENDANCE: 'student.view_own_attendance',
    VIEW_OWN_ASSIGNMENTS: 'student.view_own_assignments',
    SUBMIT_ASSIGNMENTS: 'student.submit_assignments',
    VIEW_COURSE_CONTENT: 'student.view_course_content'
  },
  PARENT_ACCESS: {
    VIEW_CHILD_PROFILE: 'parent.view_child_profile',
    VIEW_CHILD_GRADES: 'parent.view_child_grades',
    VIEW_CHILD_ATTENDANCE: 'parent.view_child_attendance',
    VIEW_CHILD_ASSIGNMENTS: 'parent.view_child_assignments',
    COMMUNICATE_TEACHERS: 'parent.communicate_teachers',
    VIEW_SCHOOL_ANNOUNCEMENTS: 'parent.view_school_announcements'
  },
  TEACHER_CLASS_ACCESS: {
    MANAGE_OWN_CLASSES: 'teacher.manage_own_classes',
    GRADE_STUDENTS: 'teacher.grade_students',
    TAKE_ATTENDANCE: 'teacher.take_attendance',
    CREATE_ASSIGNMENTS: 'teacher.create_assignments',
    COMMUNICATE_PARENTS: 'teacher.communicate_parents',
    VIEW_CLASS_REPORTS: 'teacher.view_class_reports'
  }
};