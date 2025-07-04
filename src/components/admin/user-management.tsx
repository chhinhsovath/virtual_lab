'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/auth';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS, ROLES } from '@/lib/permissions';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Download,
  Upload,
  UserPlus,
  Shield,
  School,
  GraduationCap,
  BookOpen
} from 'lucide-react';

interface UserManagementProps {
  user: User;
}

interface SystemUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive: boolean;
  roles: string[];
  schoolAccess: Array<{
    schoolId: number;
    schoolName: string;
    accessType: 'read' | 'write' | 'admin';
    subject?: string;
  }>;
  studentId?: string;
  parentId?: string;
  academicStatus?: string;
  enrollmentDate?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
}

interface School {
  id: number;
  name: string;
}

export function UserManagement({ user }: UserManagementProps) {
  const permissions = usePermissions(user);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, schoolsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/schools')
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (schoolsRes.ok) setSchools(await schoolsRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        fetchData();
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async (userId: string, userData: any) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        fetchData();
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userIds: selectedUsers })
      });

      if (response.ok) {
        fetchData();
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const filteredUsers = users.filter(systemUser => {
    const matchesSearch = systemUser.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         systemUser.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${systemUser.firstName} ${systemUser.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || systemUser.roles.includes(roleFilter);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && systemUser.isActive) ||
                         (statusFilter === 'inactive' && !systemUser.isActive);
    const matchesSchool = schoolFilter === 'all' || 
                         systemUser.schoolAccess.some(access => access.schoolId.toString() === schoolFilter);
    
    return matchesSearch && matchesRole && matchesStatus && matchesSchool;
  });

  const getUserTypeStats = () => {
    const stats = {
      total: users.length,
      students: users.filter(u => u.roles.includes('student')).length,
      teachers: users.filter(u => u.roles.includes('teacher')).length,
      parents: users.filter(u => u.roles.includes('parent') || u.roles.includes('guardian')).length,
      admin: users.filter(u => u.roles.includes('admin') || u.roles.includes('super_admin')).length,
      active: users.filter(u => u.isActive).length
    };
    return stats;
  };

  const stats = getUserTypeStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <PermissionGuard
      user={user}
      permission={PERMISSIONS.PAGES.USER_MANAGEMENT}
      fallbackComponent={
        <div className="text-center p-8">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to manage users.</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600">Manage all system users, roles, and permissions</p>
          </div>
          
          <div className="flex gap-2">
            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleBulkAction('activate')}>
                  Activate ({selectedUsers.length})
                </Button>
                <Button variant="outline" onClick={() => handleBulkAction('deactivate')}>
                  Deactivate ({selectedUsers.length})
                </Button>
              </div>
            )}
            
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <PermissionGuard user={user} permission={PERMISSIONS.USERS.CREATE} showError={false}>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the system with appropriate roles and permissions
                    </DialogDescription>
                  </DialogHeader>
                  <UserForm
                    schools={schools}
                    onSubmit={handleCreateUser}
                    onCancel={() => setIsCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </PermissionGuard>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-2xl font-bold">{stats.students}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Teachers</p>
                  <p className="text-2xl font-bold">{stats.teachers}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Parents</p>
                  <p className="text-2xl font-bold">{stats.parents}</p>
                </div>
                <UserPlus className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold">{stats.admin}</p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <Users className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name, email, or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.values(ROLES).map((role) => (
                    <SelectItem key={role} value={role}>{role.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="School" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id.toString()}>{school.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>School Access</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((systemUser) => (
                  <TableRow key={systemUser.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(systemUser.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers(prev => [...prev, systemUser.id]);
                          } else {
                            setSelectedUsers(prev => prev.filter(id => id !== systemUser.id));
                          }
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {systemUser.firstName?.[0]}{systemUser.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {systemUser.firstName} {systemUser.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{systemUser.username}</div>
                          {systemUser.email && (
                            <div className="text-xs text-gray-400">{systemUser.email}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {systemUser.roles.map((role) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {systemUser.schoolAccess.slice(0, 2).map((access) => (
                          <div key={access.schoolId} className="text-xs">
                            <span className="font-medium">{access.schoolName}</span>
                            <Badge variant="outline" className="ml-1 text-xs">
                              {access.accessType}
                            </Badge>
                          </div>
                        ))}
                        {systemUser.schoolAccess.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{systemUser.schoolAccess.length - 2} more
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={systemUser.isActive ? 'default' : 'secondary'}>
                          {systemUser.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {systemUser.academicStatus && (
                          <div className="text-xs text-gray-500">{systemUser.academicStatus}</div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {systemUser.lastLoginAt 
                          ? new Date(systemUser.lastLoginAt).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-1">
                        <PermissionGuard user={user} permission={PERMISSIONS.USERS.UPDATE} showError={false}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingUser(systemUser)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>

                        <PermissionGuard user={user} permission={PERMISSIONS.USERS.DELETE} showError={false}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteUser(systemUser.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information, roles, and permissions
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <UserForm
                user={editingUser}
                schools={schools}
                onSubmit={(data) => handleUpdateUser(editingUser.id, data)}
                onCancel={() => setEditingUser(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}

function UserForm({ 
  user, 
  schools, 
  onSubmit, 
  onCancel 
}: { 
  user?: SystemUser; 
  schools: School[]; 
  onSubmit: (data: any) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    password: '',
    roles: user?.roles || [],
    isActive: user?.isActive ?? true,
    schoolAccess: user?.schoolAccess || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, roles: [...prev.roles, role] }));
    } else {
      setFormData(prev => ({ ...prev, roles: prev.roles.filter(r => r !== role) }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="schools">School Access</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          {!user && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="space-y-3">
            <Label>User Roles</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(ROLES).map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={role}
                    checked={formData.roles.includes(role)}
                    onCheckedChange={(checked) => handleRoleChange(role, checked as boolean)}
                  />
                  <Label htmlFor={role} className="text-sm font-normal cursor-pointer">
                    {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked as boolean }))}
            />
            <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
              Active User
            </Label>
          </div>
        </TabsContent>

        <TabsContent value="schools" className="space-y-4">
          <div className="text-center py-4 text-gray-500">
            <School className="mx-auto h-8 w-8 mb-2" />
            <p className="text-sm">School access management will be implemented here.</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          {user ? 'Update User' : 'Create User'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}