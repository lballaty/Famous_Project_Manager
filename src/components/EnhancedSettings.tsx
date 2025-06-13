import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Settings, Database, RotateCw, Filter, Lock, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { StorageSettings } from './StorageSettings';
import { SyncStatus } from './SyncStatus';
import { SelectiveSyncInterface } from './SelectiveSyncComponents';
import { ActiveLocksPanel } from './ProjectLockComponents';
import { LoggingControls } from './LoggingControls';
import { ErrorDashboard } from './ErrorDashboard';

interface EnhancedSettingsProps {
  storageConfig: any;
  setStorageConfig: (config: any) => void;
  storageService: any;
  syncErrors: any[];
}

export function EnhancedSettings({
  storageConfig,
  setStorageConfig,
  storageService,
  syncErrors,
}: EnhancedSettingsProps) {
  const [settingsTab, setSettingsTab] = useState<'storage' | 'RotateCw' | 'selective' | 'locks' | 'logging' | 'errors'>('storage');

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 md:h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your application preferences, storage, and sync settings
        </p>
      </div>

      <Tabs value={settingsTab} onValueChange={setSettingsTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="storage" className="flex items-center gap-1 md:gap-2">
            <Database className="h-3 w-3 md:h-4 w-4" />
            <span className="text-xs md:text-sm">Storage</span>
          </TabsTrigger>

          <TabsTrigger value="RotateCw" className="flex items-center gap-1 md:gap-2">
            <RotateCw className="h-3 w-3 md:h-4 w-4" />
            <span className="text-xs md:text-sm">Sync</span>
          </TabsTrigger>

          <TabsTrigger value="selective" className="flex items-center gap-1 md:gap-2">
            <Filter className="h-3 w-3 md:h-4 w-4" />
            <span className="text-xs md:text-sm">Selective</span>
          </TabsTrigger>

          <TabsTrigger value="locks" className="flex items-center gap-1 md:gap-2">
            <Lock className="h-3 w-3 md:h-4 w-4" />
            <span className="text-xs md:text-sm">Locks</span>
          </TabsTrigger>

          <TabsTrigger value="logging" className="flex items-center gap-1 md:gap-2">
            <FileText className="h-3 w-3 md:h-4 w-4" />
            <span className="text-xs md:text-sm">Logging</span>
          </TabsTrigger>

          <TabsTrigger value="errors" className="flex items-center gap-1 md:gap-2 relative">
            <AlertTriangle className="h-3 w-3 md:h-4 w-4" />
            <span className="text-xs md:text-sm">Errors</span>
            {syncErrors.length > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs">
                {syncErrors.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="storage">
          <StorageSettings config={storageConfig} onConfigChange={setStorageConfig} />
        </TabsContent>

        <TabsContent value="RotateCw">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCw className="h-5 w-5" />
                Synchronization Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SyncStatus storageService={storageService} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="selective">
          <SelectiveSyncInterface />
        </TabsContent>

        <TabsContent value="locks">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Project Lock Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Lock projects to prevent editing conflicts when working offline or making major changes.
                </p>
              </CardContent>
            </Card>

            <ActiveLocksPanel />

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground space-y-2">
                  <div><strong>How Project Locks Work:</strong></div>
                  <div>• Lock a project before working offline to prevent conflicts</div>
                  <div>• Other users can't edit locked projects</div>
                  <div>• Locks automatically expire after the set duration</div>
                  <div>• Admins can force unlock if needed</div>
                  <div>• You can extend or remove your own locks anytime</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logging">
          <LoggingControls />
        </TabsContent>

        <TabsContent value="errors">
          <ErrorDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
