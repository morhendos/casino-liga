"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ShieldCheck, UserCog, Info } from "lucide-react";
import { ROLES } from "@/lib/auth/role-utils";

// Define available roles in the system
const AVAILABLE_ROLES = [
  {
    id: ROLES.ADMIN,
    name: 'Admin',
    description: 'Full access to all features including league management and user administration',
    icon: ShieldCheck,
    permissions: [
      'Create and manage leagues',
      'Manage user accounts and roles',
      'Access admin dashboard',
      'View all system data'
    ]
  },
  {
    id: ROLES.PLAYER,
    name: 'Player',
    description: 'Standard user with access to participate in leagues and manage own teams',
    icon: UserCog,
    permissions: [
      'Join existing leagues',
      'Create and manage teams',
      'View own matches and rankings',
      'Submit match results'
    ]
  }
];

export function RoleManagement() {
  return (
    <div className="space-y-6">
      <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About Role System</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                The system uses a role-based access control model where each user can have one or more roles.
                Each role grants specific permissions in the application.
              </p>
              <p className="mt-2">
                To assign roles to users, use the User Management tab.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {AVAILABLE_ROLES.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <role.icon className="h-5 w-5 mr-2 text-primary" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      {role.permissions.map((permission, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-amber-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">Custom Roles</h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                Custom roles are not supported in the current version. Contact the system administrator
                if you need additional role types for your organization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
