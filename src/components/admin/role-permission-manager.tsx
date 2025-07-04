'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/auth';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS, ROLES, Permission, Role } from '@/lib/permissions';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Plus, Trash2, Shield, Users } from 'lucide-react';

interface RoleData {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  permissions: Permission[];
}

interface UserRoleData {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
  isActive: boolean;
}

interface RolePermissionManagerProps {
  user: User;
}

export function RolePermissionManager({ user }: RolePermissionManagerProps) {
  const permissions = usePermissions(user);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [userRoles, setUserRoles] = useState<UserRoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchUserRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const response = await fetch('/api/admin/user-roles');
      if (response.ok) {
        const data = await response.json();
        setUserRoles(data.userRoles);
      }
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
    }
  };

  const handleRoleUpdate = async (roleId: string, permissions: Permission[]) => {
    try {
      const response = await fetch(`/api/admin/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions })
      });

      if (response.ok) {
        fetchRoles();
      }
    } catch (error) {
      console.error('Failed to update role permissions:', error);
    }
  };

  const handleUserRoleUpdate = async (userId: string, roles: Role[]) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles })
      });

      if (response.ok) {
        fetchUserRoles();
      }
    } catch (error) {
      console.error('Failed to update user roles:', error);
    }
  };

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
      permission={PERMISSIONS.ROLES.READ}
      fallbackComponent={
        <div className="text-center p-8">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to manage roles and permissions.</p>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Role & Permission Management</h2>
            <p className="text-gray-600">Manage system roles and user permissions</p>
          </div>
          
          <PermissionGuard user={user} permission={PERMISSIONS.ROLES.CREATE} showError={false}>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Create a new role with specific permissions
                  </DialogDescription>
                </DialogHeader>
                <CreateRoleForm onSuccess={() => { fetchRoles(); setIsDialogOpen(false); }} />
              </DialogContent>
            </Dialog>
          </PermissionGuard>
        </div>

        <Tabs defaultValue="roles" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="users">User Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-6">
            <div className="grid gap-6">
              {roles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  user={user}
                  onUpdate={handleRoleUpdate}
                  onRefresh={fetchRoles}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserRoleTable
              userRoles={userRoles}
              user={user}
              onUpdate={handleUserRoleUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}

function RoleCard({ role, user, onUpdate, onRefresh }: {
  role: RoleData;
  user: User;
  onUpdate: (roleId: string, permissions: Permission[]) => void;
  onRefresh: () => void;
}) {
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(role.permissions);
  const [isEditing, setIsEditing] = useState(false);

  const allPermissions = Object.values(PERMISSIONS).flatMap(category => 
    Object.values(category)
  ) as Permission[];

  const handlePermissionToggle = (permission: Permission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = () => {
    onUpdate(role.id, selectedPermissions);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedPermissions(role.permissions);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Badge variant={role.isActive ? "default" : "secondary"}>
              {role.displayName}
            </Badge>
            <span className="text-sm text-gray-500">({role.name})</span>
          </CardTitle>
          <CardDescription>{role.description}</CardDescription>
        </div>
        
        <div className="flex gap-2">
          <PermissionGuard user={user} permission={PERMISSIONS.ROLES.UPDATE} showError={false}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </PermissionGuard>
        </div>
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {allPermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${role.id}-${permission}`}
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={() => handlePermissionToggle(permission)}
                  />
                  <Label
                    htmlFor={`${role.id}-${permission}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {permission}
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} size="sm">Save Changes</Button>
              <Button onClick={handleCancel} variant="outline" size="sm">Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {role.permissions.map((permission) => (
              <Badge key={permission} variant="outline" className="text-xs">
                {permission}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UserRoleTable({ userRoles, user, onUpdate }: {
  userRoles: UserRoleData[];
  user: User;
  onUpdate: (userId: string, roles: Role[]) => void;
}) {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

  const allRoles = Object.values(ROLES) as Role[];

  const handleEdit = (userData: UserRoleData) => {
    setEditingUser(userData.userId);
    setSelectedRoles(userData.roles);
  };

  const handleSave = (userId: string) => {
    onUpdate(userId, selectedRoles);
    setEditingUser(null);
  };

  const handleCancel = () => {
    setEditingUser(null);
    setSelectedRoles([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Role Assignments
        </CardTitle>
        <CardDescription>
          Manage role assignments for system users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Current Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRoles.map((userData) => (
              <TableRow key={userData.userId}>
                <TableCell>
                  <div>
                    <div className="font-medium">{userData.username}</div>
                    {(userData.firstName || userData.lastName) && (
                      <div className="text-sm text-gray-500">
                        {userData.firstName} {userData.lastName}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {editingUser === userData.userId ? (
                    <div className="space-y-2">
                      {allRoles.map((role) => (
                        <div key={role} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${userData.userId}-${role}`}
                            checked={selectedRoles.includes(role)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRoles(prev => [...prev, role]);
                              } else {
                                setSelectedRoles(prev => prev.filter(r => r !== role));
                              }
                            }}
                          />
                          <Label htmlFor={`${userData.userId}-${role}`} className="text-sm">
                            {role}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {userData.roles.map((role) => (
                        <Badge key={role} variant="outline">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={userData.isActive ? "default" : "secondary"}>
                    {userData.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <PermissionGuard user={user} permission={PERMISSIONS.USERS.MANAGE_ROLES} showError={false}>
                    {editingUser === userData.userId ? (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => handleSave(userData.userId)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleEdit(userData)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </PermissionGuard>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CreateRoleForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
        setFormData({ name: '', displayName: '', description: '' });
      }
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Role Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., custom_role"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={formData.displayName}
          onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
          placeholder="e.g., Custom Role"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the role's purpose and scope"
        />
      </div>
      
      <Button type="submit" className="w-full">
        Create Role
      </Button>
    </form>
  );
}