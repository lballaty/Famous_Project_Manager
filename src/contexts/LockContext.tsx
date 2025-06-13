// src/contexts/LockContext.tsx - Project lock management context
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProjectLock, LogCategory } from '../types/sync';
import { createSupabaseClient } from '../lib/supabase';
import { useAppContext } from './AppContext';
import { syncLogger } from '../utils/logger';
import { useToast } from '../hooks/use-toast';

interface LockContextType {
  locks: ProjectLock[];
  isLocking: boolean;
  lockProject: (projectId: string, reason?: string, duration?: number) => Promise<boolean>;
  unlockProject: (projectId: string) => Promise<boolean>;
  adminUnlockProject: (projectId: string) => Promise<boolean>;
  extendLock: (projectId: string, additionalMinutes?: number) => Promise<boolean>;
  checkLockStatus: (projectId: string) => ProjectLock | null;
  isProjectLocked: (projectId: string) => boolean;
  canEditProject: (projectId: string) => boolean;
  getUserLocks: (userId?: string) => ProjectLock[];
  refreshLocks: () => Promise<void>;
  cleanupExpiredLocks: () => Promise<void>;
}

const LockContext = createContext<LockContextType | undefined>(undefined);

export const useLock = () => {
  const context = useContext(LockContext);
  if (!context) {
    throw new Error('useLock must be used within a LockProvider');
  }
  return context;
};

export const LockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locks, setLocks] = useState<ProjectLock[]>([]);
  const [isLocking, setIsLocking] = useState(false);
  const { user } = useAppContext();
  const { toast } = useToast();

  // Check for active locks on mount and periodically
  useEffect(() => {
    refreshLocks();
    const interval = setInterval(refreshLocks, 30000); // Check every 30 seconds
    const cleanupInterval = setInterval(cleanupExpiredLocks, 60000); // Cleanup every minute
    
    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, []);

  const refreshLocks = async () => {
    try {
      syncLogger.debug(LogCategory.DATABASE, 'Refreshing project locks');
      
      const { data, error } = await supabase
        .from('project_locks')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('locked_at', { ascending: false });
      
      if (error) throw error;
      
      setLocks(data || []);
      
      syncLogger.info(LogCategory.DATABASE, 'Project locks refreshed', { 
        lockCount: data?.length || 0 
      });
    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Failed to refresh locks', { 
        error: error.message 
      });
    }
  };

  const cleanupExpiredLocks = async () => {
    try {
      const { error } = await supabase.rpc('cleanup_expired_locks');
      
      if (error) throw error;
      
      // Refresh locks after cleanup
      await refreshLocks();
      
      syncLogger.debug(LogCategory.DATABASE, 'Expired locks cleaned up');
    } catch (error) {
      syncLogger.warn(LogCategory.DATABASE, 'Failed to cleanup expired locks', { 
        error: error.message 
      });
    }
  };

  const lockProject = async (
    projectId: string, 
    reason = 'Working offline', 
    duration = 4 * 60 * 60 * 1000 // 4 hours default
  ): Promise<boolean> => {
    if (!user) {
      syncLogger.error(LogCategory.AUTH, 'Cannot lock project - no user authenticated');
      return false;
    }

    setIsLocking(true);
    
    try {
      syncLogger.info(LogCategory.DATABASE, 'Attempting to lock project', {
        projectId,
        userId: user.id,
        reason,
        duration
      });

      // Check if already locked by someone else
      const existingLock = locks.find(lock => 
        lock.project_id === projectId && 
        lock.is_active &&
        new Date(lock.expires_at) > new Date()
      );

      if (existingLock && existingLock.locked_by_user_id !== user.id) {
        const errorMessage = `Project locked by ${existingLock.locked_by_name}`;
        syncLogger.warn(LogCategory.DATABASE, 'Project already locked by another user', {
          projectId,
          lockedBy: existingLock.locked_by_user_id,
          lockedByName: existingLock.locked_by_name
        });
        
        toast({
          title: "Project Locked",
          description: errorMessage,
          variant: "destructive"
        });
        
        return false;
      }

      const expiresAt = new Date(Date.now() + duration);
      
      // If user already has a lock, update it
      if (existingLock && existingLock.locked_by_user_id === user.id) {
        const { error } = await supabase
          .from('project_locks')
          .update({
            expires_at: expiresAt.toISOString(),
            lock_reason: reason,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingLock.id);

        if (error) throw error;
        
        syncLogger.info(LogCategory.DATABASE, 'Project lock updated', {
          projectId,
          lockId: existingLock.id
        });
      } else {
        // Create new lock
        const { error } = await supabase
          .from('project_locks')
          .insert({
            project_id: projectId,
            locked_by_user_id: user.id,
            locked_by_email: user.email!,
            locked_by_name: user.name || user.email!,
            expires_at: expiresAt.toISOString(),
            lock_reason: reason,
            is_active: true
          });

        if (error) {
          // Handle unique constraint violation (project already locked)
          if (error.code === '23505') {
            syncLogger.warn(LogCategory.DATABASE, 'Project lock conflict detected', {
              projectId,
              error: error.message
            });
            
            // Refresh locks and try again
            await refreshLocks();
            return false;
          }
          throw error;
        }
        
        syncLogger.info(LogCategory.DATABASE, 'Project lock created', {
          projectId,
          expiresAt: expiresAt.toISOString()
        });
      }

      await refreshLocks();
      
      toast({
        title: "Project Locked",
        description: `Project locked for ${Math.round(duration / (60 * 60 * 1000))} hours`
      });
      
      return true;

    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Failed to lock project', {
        error: error.message,
        projectId,
        userId: user.id
      });
      
      toast({
        title: "Lock Failed",
        description: error instanceof Error ? error.message : "Failed to lock project",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLocking(false);
    }
  };

  const unlockProject = async (projectId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      syncLogger.info(LogCategory.DATABASE, 'Attempting to unlock project', {
        projectId,
        userId: user.id
      });

      const { error } = await supabase
        .from('project_locks')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .eq('locked_by_user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      await refreshLocks();
      
      syncLogger.info(LogCategory.DATABASE, 'Project unlocked successfully', {
        projectId
      });
      
      toast({
        title: "Project Unlocked",
        description: "Project is now available for editing by others"
      });
      
      return true;

    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Failed to unlock project', {
        error: error.message,
        projectId,
        userId: user.id
      });
      
      toast({
        title: "Unlock Failed",
        description: error instanceof Error ? error.message : "Failed to unlock project",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const adminUnlockProject = async (projectId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      syncLogger.info(LogCategory.DATABASE, 'Admin attempting to unlock project', {
        projectId,
        adminUserId: user.id
      });

      const { data, error } = await supabase.rpc('admin_unlock_project', {
        p_project_id: projectId,
        p_admin_user_id: user.id
      });

      if (error) throw error;
      
      if (!data) {
        throw new Error('Insufficient permissions or project not found');
      }

      await refreshLocks();
      
      syncLogger.info(LogCategory.DATABASE, 'Project unlocked by admin', {
        projectId,
        adminUserId: user.id
      });
      
      toast({
        title: "Project Unlocked",
        description: "Project unlocked by administrator"
      });
      
      return true;

    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Admin unlock failed', {
        error: error.message,
        projectId,
        adminUserId: user.id
      });
      
      toast({
        title: "Admin Unlock Failed",
        description: error instanceof Error ? error.message : "Failed to unlock project",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const extendLock = async (projectId: string, additionalMinutes = 60): Promise<boolean> => {
    if (!user) return false;

    try {
      syncLogger.info(LogCategory.DATABASE, 'Attempting to extend project lock', {
        projectId,
        userId: user.id,
        additionalMinutes
      });

      const { data, error } = await supabase.rpc('extend_project_lock', {
        p_project_id: projectId,
        p_user_id: user.id,
        p_additional_minutes: additionalMinutes
      });

      if (error) throw error;
      
      if (!data) {
        throw new Error('No active lock found to extend');
      }

      await refreshLocks();
      
      syncLogger.info(LogCategory.DATABASE, 'Project lock extended', {
        projectId,
        additionalMinutes
      });
      
      toast({
        title: "Lock Extended",
        description: `Lock extended by ${additionalMinutes} minutes`
      });
      
      return true;

    } catch (error) {
      syncLogger.error(LogCategory.DATABASE, 'Failed to extend lock', {
        error: error.message,
        projectId,
        userId: user.id
      });
      
      toast({
        title: "Extension Failed",
        description: error instanceof Error ? error.message : "Failed to extend lock",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const checkLockStatus = (projectId: string): ProjectLock | null => {
    return locks.find(lock => 
      lock.project_id === projectId && 
      lock.is_active &&
      new Date(lock.expires_at) > new Date()
    ) || null;
  };

  const isProjectLocked = (projectId: string): boolean => {
    return checkLockStatus(projectId) !== null;
  };

  const canEditProject = (projectId: string): boolean => {
    const lock = checkLockStatus(projectId);
    return !lock || lock.locked_by_user_id === user?.id;
  };

  const getUserLocks = (userId?: string): ProjectLock[] => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return [];
    
    return locks.filter(lock => 
      lock.locked_by_user_id === targetUserId &&
      lock.is_active &&
      new Date(lock.expires_at) > new Date()
    );
  };

  const value: LockContextType = {
    locks,
    isLocking,
    lockProject,
    unlockProject,
    adminUnlockProject,
    extendLock,
    checkLockStatus,
    isProjectLocked,
    canEditProject,
    getUserLocks,
    refreshLocks,
    cleanupExpiredLocks
  };

  return (
    <LockContext.Provider value={value}>
      {children}
    </LockContext.Provider>
  );
};