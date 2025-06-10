import { useState, useEffect } from 'react';
import { UserRole } from '../types/sync';

export const useRoles = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = () => {
    const stored = localStorage.getItem('userRoles');
    if (stored) {
      setUserRoles(JSON.parse(stored));
    } else {
      // Default admin role for first user
      if (currentUser.id) {
        const defaultRole: UserRole = {
          userId: currentUser.id,
          role: 'admin'
        };
        setUserRoles([defaultRole]);
        localStorage.setItem('userRoles', JSON.stringify([defaultRole]));
      }
    }
  };

  const getUserRole = (userId: string, projectId?: string): 'admin' | 'contributor' | 'viewer' => {
    const globalRole = userRoles.find(r => r.userId === userId && !r.projectId);
    const projectRole = projectId ? userRoles.find(r => r.userId === userId && r.projectId === projectId) : null;
    
    return projectRole?.role || globalRole?.role || 'viewer';
  };

  const getCurrentUserRole = (projectId?: string) => {
    return getUserRole(currentUser.id, projectId);
  };

  const canEdit = (projectId?: string) => {
    const role = getCurrentUserRole(projectId);
    return role === 'admin' || role === 'contributor';
  };

  const canDelete = (projectId?: string) => {
    return getCurrentUserRole(projectId) === 'admin';
  };

  const canManageUsers = () => {
    return getCurrentUserRole() === 'admin';
  };

  const updateUserRole = (userId: string, role: 'admin' | 'contributor' | 'viewer', projectId?: string) => {
    if (!canManageUsers()) return false;

    const newRole: UserRole = { userId, role, projectId };
    const updated = userRoles.filter(r => !(r.userId === userId && r.projectId === projectId));
    updated.push(newRole);
    
    setUserRoles(updated);
    localStorage.setItem('userRoles', JSON.stringify(updated));
    return true;
  };

  return {
    userRoles,
    getUserRole,
    getCurrentUserRole,
    canEdit,
    canDelete,
    canManageUsers,
    updateUserRole
  };
};