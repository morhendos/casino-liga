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
import { ShieldCheck, UserCog, Info, AlertCircle } from "lucide-react";
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

function RoleManagement() {
  return (
    <div className="space-y-6">
      {/* Updated info box with dark mode support */}
      <div className="rounded-md bg-blue-50 dark:bg-blue-950/40 p-4 border border-blue-200 dark:border-blue-700/50">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-400 dark:text-blue-300" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">About Role System</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
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
      
      {/* Completely redesigned "Custom Roles" section with a modern, sophisticated appearance */}
      <Card className="bg-gradient-to-br from-amber-50/90 to-amber-50/70 dark:from-gray-800/80 dark:to-gray-900/90 backdrop-blur-sm border-amber-200/50 dark:border-gray-700/50 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-orange-500 dark:from-amber-500 dark:to-amber-600"></div>
        <CardContent className="p-5">
          <div className="flex">
            <div className="flex-shrink-0 mr-4">
              <div className="rounded-full p-2 bg-amber-100/70 dark:bg-amber-500/10 backdrop-blur-sm">
                <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2 tracking-wide">Custom Roles</h3>
              <p className="text-sm text-amber-700 dark:text-gray-300 leading-relaxed">
                Custom roles are not supported in the current version. Contact the system administrator
                if you need additional role types for your organization.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Change from named export to default export
export default RoleManagement;