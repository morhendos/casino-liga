"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Search, CheckCircle2, XCircle, UserCircle, Users } from "lucide-react";
import { ROLES } from "@/lib/auth/role-utils";

interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  roles: Array<{
    id: string;
    name: string;
  }>;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface UserManagementProps {
  onUpdate?: () => void;
}

export function UserManagement({ onUpdate }: UserManagementProps) {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      let url = '/api/admin/users';
      
      // Add search params if provided
      const params = new URLSearchParams();
      if (searchTerm) {
        if (searchTerm.includes('@')) {
          params.append('email', searchTerm);
        } else {
          params.append('name', searchTerm);
        }
      }
      
      if (roleFilter) {
        params.append('roleId', roleFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      const data = await response.json();
      
      if (data.users) {
        // Process the users to ensure IDs are normalized
        const processedUsers = data.users.map((user: any) => ({
          ...user,
          id: user._id || user.id
        }));
        setUsers(processedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = () => {
    fetchUsers();
  };

  const hasRole = (user: User, roleId: string) => {
    return user.roles.some(role => role.id === roleId);
  };

  const getRoleBadges = (user: User) => {
    return user.roles.map(role => (
      <Badge 
        key={role.id} 
        variant={role.id === ROLES.ADMIN ? "default" : "outline"}
        className="mr-1"
      >
        {role.name}
      </Badge>
    ));
  };

  const updateUserRoles = async (userId: string, roles: Array<{id: string, name: string}>) => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          roles
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user roles');
      }
      
      // Update local state to reflect the changes
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, roles };
        }
        return user;
      }));
      
      setUserToEdit(null);
      toast.success('User roles updated successfully');
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating user roles:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user roles');
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (user: User, roleId: string, roleName: string) => {
    const hasTheRole = hasRole(user, roleId);
    let newRoles;
    
    if (hasTheRole) {
      // Prevent removing the last role
      if (user.roles.length === 1) {
        toast.error("User must have at least one role");
        return;
      }
      
      // Remove the role
      newRoles = user.roles.filter(role => role.id !== roleId);
    } else {
      // Add the role
      newRoles = [...user.roles, { id: roleId, name: roleName }];
    }
    
    updateUserRoles(user.id, newRoles);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center space-x-2">
          <Input
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch} type="button">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All roles</SelectItem>
            <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
            <SelectItem value={ROLES.PLAYER}>Player</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <div className="py-8 text-muted-foreground animate-pulse">
                        Loading users...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {getRoleBadges(user)}
                      </TableCell>
                      <TableCell>
                        {user.emailVerified ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={saving}
                            onClick={() => toggleRole(user, ROLES.ADMIN, 'admin')}
                          >
                            {hasRole(user, ROLES.ADMIN) ? "Remove Admin" : "Make Admin"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <div className="py-8">
                        <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
