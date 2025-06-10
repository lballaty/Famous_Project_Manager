// src/components/SyncStatus.tsx - Sync status and controls
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  Upload, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Settings,
  Database
} from 'lucide-react';
import { HybridStorageService, SyncStatus as SyncStatusType } from '../lib/hybridStorage';
import { useToast } from '../hooks/use-toast';

interface SyncStatusProps {
  storageService: HybridStorageService;
  className?: string;
}

export function SyncStatus({ storageService, className }: SyncStatusProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>(storageService.getSyncStatus());
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [isManualSyncInProgress, setIsManualSyncInProgress] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = storageService.onSyncStatusChange(setSyncStatus);
    return unsubscribe;
  }, [storageService]);

  const getStatusColor = () => {
    if (syncStatus.syncInProgress) return 'text-blue-600';
    if (syncStatus.isOnline) return 'text-green-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (syncStatus.syncInProgress) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (syncStatus.isOnline) return <Wifi className="h-4 w-4" />;
    return <WifiOff className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (syncStatus.syncInProgress) return 'Syncing...';
    if (syncStatus.isOnline) return 'Online';
    return 'Offline';
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleManualSyncToCloud = async () => {
    setIsManualSyncInProgress(true);
    try {
      await storageService.forceSyncToSupabase();
      toast({
        title: "Sync Successful",
        description: "All local changes have been uploaded to the cloud"
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync to cloud",
        variant: "destructive"
      });
    } finally {
      setIsManualSyncInProgress(false);
    }
  };

  const handleManualSyncFromCloud = async () => {
    setIsManualSyncInProgress(true);
    try {
      await storageService.forceSyncFromSupabase();
      toast({
        title: "Sync Successful",
        description: "Latest data has been downloaded from the cloud"
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync from cloud",
        variant: "destructive"
      });
    } finally {
      setIsManualSyncInProgress(false);
    }
  };

  // Compact status indicator for header/toolbar
  const CompactStatus = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setSyncDialogOpen(true)}
      className={`flex items-center gap-2 ${className}`}
    >
      <span className={getStatusColor()}>
        {getStatusIcon()}
      </span>
      <span className="text-sm">{getStatusText()}</span>
      {syncStatus.pendingChanges > 0 && (
        <Badge variant="secondary" className="h-5 text-xs">
          {syncStatus.pendingChanges}
        </Badge>
      )}
    </Button>
  );

  return (
    <>
      <CompactStatus />

      {/* Detailed Sync Dialog */}
      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sync Status
            </DialogTitle>
            <DialogDescription>
              Manage data synchronization between local storage and cloud database
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Connection Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  Connection Status
                  <span className={`flex items-center gap-1 text-sm ${getStatusColor()}`}>
                    {getStatusIcon()}
                    {getStatusText()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last sync:</span>
                    <span>{formatLastSync(syncStatus.lastSyncTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending changes:</span>
                    <span>{syncStatus.pendingChanges}</span>
                  </div>
                  {syncStatus.lastError && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {syncStatus.lastError}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sync Progress */}
            {syncStatus.syncInProgress && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Synchronizing...</span>
                    </div>
                    <Progress value={undefined} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Changes Alert */}
            {syncStatus.pendingChanges > 0 && !syncStatus.isOnline && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  You have {syncStatus.pendingChanges} pending changes that will sync automatically when connection is restored.
                </AlertDescription>
              </Alert>
            )}

            {/* Success State */}
            {syncStatus.isOnline && syncStatus.pendingChanges === 0 && !syncStatus.lastError && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  All data is synchronized and up to date.
                </AlertDescription>
              </Alert>
            )}

            {/* Manual Sync Controls */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Manual Sync</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSyncToCloud}
                  disabled={!syncStatus.isOnline || isManualSyncInProgress || syncStatus.syncInProgress}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-3 w-3" />
                  Upload
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSyncFromCloud}
                  disabled={!syncStatus.isOnline || isManualSyncInProgress || syncStatus.syncInProgress}
                  className="flex items-center gap-2"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload pushes local changes to cloud. Download overwrites local data with cloud data.
              </p>
            </div>

            {/* Storage Mode Info */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Storage Mode</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>Hybrid Mode:</strong> Data is stored locally and synced to the cloud when available.
                </p>
                <p>
                  When offline, all changes are saved locally and will automatically sync when connection is restored.
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSyncDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Simplified status indicator for sidebars or minimal spaces
export function SyncStatusBadge({ storageService }: { storageService: HybridStorageService }) {
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>(storageService.getSyncStatus());

  useEffect(() => {
    const unsubscribe = storageService.onSyncStatusChange(setSyncStatus);
    return unsubscribe;
  }, [storageService]);

  const getStatusColor = () => {
    if (syncStatus.syncInProgress) return 'bg-blue-100 text-blue-800';
    if (syncStatus.isOnline) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusIcon = () => {
    if (syncStatus.syncInProgress) return <RefreshCw className="h-3 w-3 animate-spin" />;
    if (syncStatus.isOnline) return <Wifi className="h-3 w-3" />;
    return <WifiOff className="h-3 w-3" />;
  };

  return (
    <Badge className={`flex items-center gap-1 ${getStatusColor()}`}>
      {getStatusIcon()}
      {syncStatus.syncInProgress ? 'Syncing' : syncStatus.isOnline ? 'Online' : 'Offline'}
      {syncStatus.pendingChanges > 0 && (
        <span className="ml-1 px-1 bg-white/20 rounded text-xs">
          {syncStatus.pendingChanges}
        </span>
      )}
    </Badge>
  );
}

// Hook for components that need sync status
export function useSyncStatus(storageService: HybridStorageService) {
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>(storageService.getSyncStatus());

  useEffect(() => {
    const unsubscribe = storageService.onSyncStatusChange(setSyncStatus);
    return unsubscribe;
  }, [storageService]);

  return syncStatus;
}