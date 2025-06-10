// src/components/ProjectLockComponents.tsx - UI components for project lock management
import React, { useState } from 'react';
import { ProjectLock } from '../types/sync';
import { useLock } from '../contexts/LockContext';
import { useAppContext } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import {
  Lock,
  Unlock,
  Clock,
  User,
  Shield,
  AlertTriangle,
  Plus,
  Minus
} from 'lucide-react';

// Project Lock Dialog for creating/managing locks
interface ProjectLockDialogProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
  existingLock?: ProjectLock | null;
}

export const ProjectLockDialog: React.FC<ProjectLockDialogProps> = ({
  projectId,
  projectName,
  isOpen,
  onClose,
  existingLock
}) => {
  const [duration, setDuration] = useState(4); // hours
  const [reason, setReason] = useState('Working offline');
  const { lockProject, unlockProject, extendLock, isLocking } = useLock();
  const { user } = useAppContext();

  const handleLock = async () => {
    const success = await lockProject(projectId, reason, duration * 60 * 60 * 1000);
    if (success) {
      onClose();
    }
  };

  const handleUnlock = async () => {
    const success = await unlockProject(projectId);
    if (success) {
      onClose();
    }
  };

  const handleExtend = async (additionalHours: number) => {
    const success = await extendLock(projectId, additionalHours * 60);
    if (success) {
      onClose();
    }
  };

  const isOwnLock = existingLock?.locked_by_user_id === user?.id;
  const timeLeft = existingLock ? 
    Math.max(0, new Date(existingLock.expires_at).getTime() - Date.now()) : 0;
  const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {existingLock ? 'Manage Project Lock' : 'Lock Project'}
          </DialogTitle>
          <DialogDescription>
            {existingLock ? 
              `Manage the lock on "${projectName}"` :
              `Lock "${projectName}" for offline work`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {existingLock ? (
            // Existing lock management
            <div className="space-y-4">
              <Alert className={isOwnLock ? "border-blue-200 bg-blue-50" : "border-orange-200 bg-orange-50"}>
                <User className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {isOwnLock ? 'You have' : existingLock.locked_by_name + ' has'} locked this project
                    </div>
                    <div className="text-sm">
                      Reason: {existingLock.lock_reason || 'No reason provided'}
                    </div>
                    <div className="text-sm">
                      Expires in {hoursLeft} hours ({new Date(existingLock.expires_at).toLocaleString()})
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {isOwnLock && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Extend Lock</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExtend(1)}
                      disabled={isLocking}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      1h
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExtend(2)}
                      disabled={isLocking}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      2h
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExtend(4)}
                      disabled={isLocking}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      4h
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // New lock creation
            <div className="space-y-4">
              <div>
                <Label htmlFor="duration" className="text-sm font-medium">
                  Lock Duration
                </Label>
                <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason" className="text-sm font-medium">
                  Reason for locking
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Working offline, major restructuring, client presentation..."
                  rows={3}
                />
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Note:</strong> While locked, other users won't be able to edit this project. 
                  You can unlock it manually or it will auto-unlock after {duration} hours.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            {existingLock && isOwnLock && (
              <Button
                onClick={handleUnlock}
                disabled={isLocking}
                variant="destructive"
                className="flex-1 flex items-center gap-2"
              >
                <Unlock className="h-4 w-4" />
                {isLocking ? 'Unlocking...' : 'Unlock Now'}
              </Button>
            )}
            
            {!existingLock && (
              <Button
                onClick={handleLock}
                disabled={isLocking}
                className="flex-1 flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                {isLocking ? 'Locking...' : 'Lock Project'}
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              {existingLock ? 'Close' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Project Lock Banner - shows when a project is locked
interface ProjectLockBannerProps {
  lock: ProjectLock;
  onUnlock?: () => void;
  onAdminUnlock?: () => void;
  onManage?: () => void;
  isAdmin?: boolean;
  className?: string;
}

export const ProjectLockBanner: React.FC<ProjectLockBannerProps> = ({ 
  lock, 
  onUnlock, 
  onAdminUnlock, 
  onManage,
  isAdmin = false,
  className = ""
}) => {
  const { user } = useAppContext();
  const isOwnLock = lock.locked_by_user_id === user?.id;
  const timeLeft = Math.max(0, new Date(lock.expires_at).getTime() - Date.now());
  const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));

  return (
    <Alert className={`border-red-200 bg-red-50 ${className}`}>
      <Lock className="h-4 w-4 text-red-600" />
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-medium text-red-800">
              Project Locked
            </div>
            <div className="text-sm text-red-700 mt-1">
              {isOwnLock ? 'You have' : `${lock.locked_by_name} has`} locked this project
              {lock.lock_reason && ` for: ${lock.lock_reason}`}
            </div>
            <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Expires in {hoursLeft} hours ({new Date(lock.expires_at).toLocaleString()})
            </div>
          </div>

          <div className="flex gap-2">
            {isOwnLock && onManage && (
              <Button
                size="sm"
                onClick={onManage}
                className="flex items-center gap-1"
              >
                <Lock className="h-3 w-3" />
                Manage
              </Button>
            )}
            
            {isOwnLock && onUnlock && (
              <Button
                size="sm"
                variant="destructive"
                onClick={onUnlock}
                className="flex items-center gap-1"
              >
                <Unlock className="h-3 w-3" />
                Unlock
              </Button>
            )}
            
            {!isOwnLock && isAdmin && onAdminUnlock && (
              <Button
                size="sm"
                variant="outline"
                onClick={onAdminUnlock}
                className="flex items-center gap-1 border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <Shield className="h-3 w-3" />
                Admin Unlock
              </Button>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
};

// Lock Status Indicator - compact indicator for lists/cards
interface LockStatusIndicatorProps {
  projectId: string;
  className?: string;
}

export const LockStatusIndicator: React.FC<LockStatusIndicatorProps> = ({ 
  projectId, 
  className = "" 
}) => {
  const { checkLockStatus } = useLock();
  const { user } = useAppContext();
  const lock = checkLockStatus(projectId);

  if (!lock) return null;

  const isOwnLock = lock.locked_by_user_id === user?.id;
  const timeLeft = Math.max(0, new Date(lock.expires_at).getTime() - Date.now());
  const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));

  return (
    <Badge 
      variant={isOwnLock ? "default" : "destructive"} 
      className={`flex items-center gap-1 ${className}`}
    >
      <Lock className="h-3 w-3" />
      {isOwnLock ? 'Your Lock' : 'Locked'}
      <span className="text-xs">({hoursLeft}h)</span>
    </Badge>
  );
};

// Active Locks Management Panel
export const ActiveLocksPanel: React.FC = () => {
  const { locks, getUserLocks, unlockProject, adminUnlockProject } = useLock();
  const { user, projects, getUserById } = useAppContext();
  const [isUnlocking, setIsUnlocking] = useState<string | null>(null);

  if (!user) return null;

  const userLocks = getUserLocks();
  const isAdmin = getUserById(user.id)?.role === 'admin';
  const allActiveLocks = isAdmin ? locks : userLocks;

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const handleUnlock = async (projectId: string, isAdminAction = false) => {
    setIsUnlocking(projectId);
    try {
      if (isAdminAction) {
        await adminUnlockProject(projectId);
      } else {
        await unlockProject(projectId);
      }
    } finally {
      setIsUnlocking(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Active Project Locks ({allActiveLocks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allActiveLocks.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <Lock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No active locks</div>
          </div>
        ) : (
          <div className="space-y-3">
            {allActiveLocks.map(lock => {
              const isOwnLock = lock.locked_by_user_id === user.id;
              const timeLeft = Math.max(0, new Date(lock.expires_at).getTime() - Date.now());
              const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
              
              return (
                <div key={lock.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {getProjectName(lock.project_id)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isOwnLock ? 'You' : lock.locked_by_name} • {lock.lock_reason || 'No reason'}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      Expires in {hoursLeft} hours
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isOwnLock && (
                      <Badge variant="default" className="text-xs">
                        Your Lock
                      </Badge>
                    )}
                    
                    <Button
                      size="sm"
                      variant={isOwnLock ? "destructive" : "outline"}
                      onClick={() => handleUnlock(lock.project_id, !isOwnLock)}
                      disabled={isUnlocking === lock.project_id}
                      className="flex items-center gap-1"
                    >
                      {isUnlocking === lock.project_id ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Unlocking...
                        </>
                      ) : (
                        <>
                          {isOwnLock ? <Unlock className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                          {isOwnLock ? 'Unlock' : 'Admin Unlock'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Hook for easier lock management in components
export const useProjectLock = (projectId: string) => {
  const { 
    checkLockStatus, 
    isProjectLocked, 
    canEditProject, 
    lockProject, 
    unlockProject,
    adminUnlockProject 
  } = useLock();
  const { user, getUserById } = useAppContext();
  
  const lock = checkLockStatus(projectId);
  const isLocked = isProjectLocked(projectId);
  const canEdit = canEditProject(projectId);
  const isOwnLock = lock?.locked_by_user_id === user?.id;
  const isAdmin = user ? getUserById(user.id)?.role === 'admin' : false;

  return {
    lock,
    isLocked,
    canEdit,
    isOwnLock,
    isAdmin,
    lockProject: (reason?: string, duration?: number) => lockProject(projectId, reason, duration),
    unlockProject: () => unlockProject(projectId),
    adminUnlockProject: () => adminUnlockProject(projectId)
  };
};