import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { syncEngine } from '../lib/syncEngine';
import { SyncStatus } from '../types/sync';
import { Wifi, WifiOff, RefreshCw, Download, Trash2, Clock } from 'lucide-react';

interface SyncStatusIndicatorProps {
  className?: string;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ className }) => {
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>(syncEngine.getSyncStatus());
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [syncing, setSyncing] = React.useState(false);
  const [preparing, setPreparing] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const interval = setInterval(() => {
      setSyncStatus(syncEngine.getSyncStatus());
    }, 1000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSyncNow = async () => {
    setSyncing(true);
    await syncEngine.syncNow();
    setSyncing(false);
    setSyncStatus(syncEngine.getSyncStatus());
  };

  const handlePrepareOffline = async () => {
    setPreparing(true);
    await syncEngine.prepareForOffline();
    setPreparing(false);
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    syncEngine.updateSyncSettings({ autoSyncEnabled: enabled });
    setSyncStatus(syncEngine.getSyncStatus());
  };

  const handleToggleClearOnSync = (enabled: boolean) => {
    syncEngine.updateSyncSettings({ clearLocalOnSync: enabled });
    setSyncStatus(syncEngine.getSyncStatus());
  };

  return (
    <Card className={`w-80 ${className}`}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          
          {syncStatus.offlineChanges > 0 && (
            <Badge variant="secondary">
              {syncStatus.offlineChanges} unsynced
            </Badge>
          )}
        </div>

        {syncStatus.lastSynced && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last synced: {new Date(syncStatus.lastSynced).toLocaleTimeString()}
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <Button 
            onClick={handleSyncNow} 
            disabled={!isOnline || syncing || syncStatus.pending}
            className="w-full"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Button>

          <Button 
            onClick={handlePrepareOffline} 
            disabled={!isOnline || preparing}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Download className={`h-4 w-4 mr-2 ${preparing ? 'animate-pulse' : ''}`} />
            {preparing ? 'Preparing...' : 'Prepare for Offline'}
          </Button>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Auto-sync</span>
            <Switch 
              checked={syncStatus.autoSyncEnabled}
              onCheckedChange={handleToggleAutoSync}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Clear cache on sync</span>
            <Switch 
              checked={syncStatus.clearLocalOnSync}
              onCheckedChange={handleToggleClearOnSync}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};