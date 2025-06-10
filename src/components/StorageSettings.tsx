// src/components/Settings.tsx or wherever your main settings component is
// This integrates perfectly with your existing StorageSettings component

import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Settings as SettingsIcon,
  Database,
  Sync,
  Filter,
  Lock,
  FileText,
  AlertTriangle
} from 'lucide-react';

// Import your existing component
import { StorageSettings } from './StorageSettings';

// Import new components
import { SyncStatus } from './SyncStatus';
import { ErrorDashboard } from './ErrorDashboard';
import { LoggingControls } from './LoggingControls';
import { SelectiveSyncInterface } from './SelectiveSyncComponents';
import { ActiveLocksPanel } from './ProjectLockComponents';

export function Settings() {
  const { storageConfig, setStorageConfig, storageService, syncErrors } = useAppContext();
  const [activeTab, setActiveTab] = useState('storage');

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your application preferences, storage, and sync settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <Sync className="h-4 w-4" />
            Sync Status
          </TabsTrigger>
          <TabsTrigger value="selective" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Selective Sync
          </TabsTrigger>
          <TabsTrigger value="locks" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Project Locks
          </TabsTrigger>
          <TabsTrigger value="logging" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Logging
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-2 relative">
            <AlertTriangle className="h-4 w-4" />
            Errors
            {syncErrors.length > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                {syncErrors.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Storage Configuration - Your existing component */}
        <TabsContent value="storage">
          <StorageSettings 
            config={storageConfig} 
            onConfigChange={setStorageConfig} 
          />
        </TabsContent>

        {/* Sync Status - Enhanced version of your existing SyncStatus */}
        <TabsContent value="sync">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sync className="h-5 w-5" />
                  Synchronization Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SyncStatus storageService={storageService} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Selective Sync - NEW */}
        <TabsContent value="selective">
          <SelectiveSyncInterface />
        </TabsContent>

        {/* Project Locks - NEW */}
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

        {/* Logging Configuration - NEW */}
        <TabsContent value="logging">
          <LoggingControls />
        </TabsContent>

        {/* Error Dashboard - NEW */}
        <TabsContent value="errors">
          <ErrorDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}