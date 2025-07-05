// Shared types for authentication that can be used on both client and server

export interface SchoolAccess {
  schoolId: number;
  accessType: 'read' | 'write' | 'admin';
  subject?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  roles?: string[];  // For Cambodia Virtual Lab STEM system compatibility
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  // Cambodia Virtual Lab STEM system specific fields
  username?: string;
  firstName?: string; // For Cambodia Virtual Lab STEM system compatibility
  lastName?: string;  // For Cambodia Virtual Lab STEM system compatibility
  schoolId?: number;
  provinceId?: number;
  subject?: string;
  schoolAccess: SchoolAccess[];
  permissions: string[];
  // LMS specific fields
  lmsRoleId?: string;
  preferredLanguage?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Date;
  teacherId?: string;
}