// src/components/ErrorDashboard.tsx - Error management dashboard using your existing UI patterns
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { SyncError } from '../types/sync';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import {
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Trash2,
  Clock,
  Wifi,
  WifiOff,
  Server,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export function ErrorDashboard() {
  const { 
    syncErrors, 
    syncMetrics, 
    clearSyncErrors, 
    retryFailedSync,
    storageService 
  } = useAppContext();
  
  const [groupBy, setGroupBy] = useState<'type' | 'entity' | 'operation'>('type');
  const [filterResolved, setFilterResolved] = useState(false);
  const { toast } = useToast();

  const filteredErrors = useMemo(() => {
    return syncErrors.filter(error => 
      filterResolved ? !error.resolved : true
    );
  }, [syncErrors, filterResolved]);

  const groupedErrors = useMemo(() => {
    const groups: Record<string, SyncError[]> = {};
    
    filteredErrors.forEach(error => {
      let key: string;
      switch (groupBy) {
        case 'type':
          key = error.type;
          break;
        case 'entity':
          key = error.entityType;
          break;
        case 'operation':
          key = error.operation;
          break;
        default:
          key = 'unknown';
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(error);
    });
    
    return groups;
  }, [filteredErrors, groupBy]);

  const getErrorTypeIcon = (type: SyncError['type']) => {
    switch (type) {
      case 'network': return <WifiOff className="h-4 w-4" />;
      case 'auth': return <Shield className="h-4 w-4" />;
      case 'validation': return <AlertTriangle className="h-4 w-4" />;
      case 'conflict': return <AlertCircle className="h-4 w-4" />;
      case 'timeout': return <Clock className="h-4 w-4" />;
      case 'server': return <Server className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getErrorTypeColor = (type: SyncError['type']) => {
    switch (type) {
      case 'network': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'auth': return 'bg-red-100 text-red-800 border-red-200';
      case 'validation': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'conflict': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'timeout': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'server': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSuccessRate = () => {
    const total = syncMetrics.totalAttempts;
    if (total === 0) return 100;
    return Math.round((syncMetrics.successfulSyncs / total) * 100);
  };

  const handleRetryError = async (errorId: string) => {
    try {
      await retryFailedSync(errorId);
      toast({
        title: "Retry Successful",
        description: "The sync operation has been retried successfully"
      });
    } catch (error) {
      toast({
        title: "Retry Failed",
        description: error instanceof Error ? error.message : "Failed to retry sync operation",
        variant: "destructive"
      });
    }
  };

  const handleClearErrors = (errorIds?: string[]) => {
    clearSyncErrors(errorIds);
    toast({
      title: "Errors Cleared",
      description: errorIds ? `${errorIds.length} errors cleared` : "All errors cleared"
    });
  };

  const handleForceSyncToCloud = async () => {
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
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sync Error Dashboard</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleForceSyncToCloud}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Force Sync
          </Button>
          {filteredErrors.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => handleClearErrors()}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="errors">Error Details</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {getSuccessRate()}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {syncMetrics.successfulSyncs}
                    </div>
                    <div className="text-sm text-muted-foreground">Successful Syncs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {syncMetrics.failedSyncs}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed Syncs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {syncMetrics.averageResponseTime.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Streak */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {syncMetrics.currentStreak.type === 'success' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <div className="font-medium">Current Streak</div>
                    <div className={`text-sm ${
                      syncMetrics.currentStreak.type === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {syncMetrics.currentStreak.count} consecutive {syncMetrics.currentStreak.type}es
                    </div>
                  </div>
                </div>
                
                {syncMetrics.lastSuccessfulSync && (
                  <div className="text-sm text-muted-foreground">
                    Last success: {syncMetrics.lastSuccessfulSync.toLocaleString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Errors Summary */}
          {filteredErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Recent Errors ({filteredErrors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredErrors.slice(0, 3).map(error => (
                    <div key={error.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        {getErrorTypeIcon(error.type)}
                        <span className="font-medium">{error.message}</span>
                        <Badge variant="outline" className={getErrorTypeColor(error.type)}>
                          {error.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {error.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  {filteredErrors.length > 3 && (
                    <div className="text-center text-sm text-muted-foreground pt-2">
                      ... and {filteredErrors.length - 3} more errors
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Errors State */}
          {filteredErrors.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <div className="font-medium mb-2">No Recent Errors</div>
                <div className="text-sm text-muted-foreground">
                  All sync operations are working normally
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          {/* Error Filters */}
          <div className="flex gap-3 items-center">
            <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="type">Group by Type</SelectItem>
                <SelectItem value="entity">Group by Entity</SelectItem>
                <SelectItem value="operation">Group by Operation</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={filterResolved ? "default" : "outline"}
              onClick={() => setFilterResolved(!filterResolved)}
              size="sm"
            >
              {filterResolved ? "Show All" : "Hide Resolved"}
            </Button>
          </div>

          {/* Grouped Errors */}
          {Object.entries(groupedErrors).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedErrors).map(([group, errors]) => (
                <Card key={group}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getErrorTypeIcon(errors[0].type)}
                        {group} ({errors.length} errors)
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClearErrors(errors.map(e => e.id))}
                      >
                        Clear Group
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {errors.slice(0, 5).map(error => (
                        <div key={error.id} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getErrorTypeColor(error.type)}>
                                  {error.type}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {error.timestamp.toLocaleString()}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  Attempt {error.attempt}
                                </span>
                              </div>
                              
                              <div className="font-medium mb-2">{error.message}</div>
                              
                              <div className="text-sm text-muted-foreground mb-2">
                                {error.operation} on {error.entityType}#{error.entityId}
                              </div>
                              
                              {error.suggestedAction && (
                                <Alert className="mt-2">
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription className="text-sm">
                                    💡 {error.suggestedAction}
                                  </AlertDescription>
                                </Alert>
                              )}
                              
                              {error.details && Object.keys(error.details).length > 0 && (
                                <details className="mt-2">
                                  <summary className="text-sm cursor-pointer text-blue-600 hover:text-blue-800">
                                    Technical Details
                                  </summary>
                                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                                    {JSON.stringify(error.details, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              {error.isRetryable && (
                                <Button
                                  size="sm"
                                  onClick={() => handleRetryError(error.id)}
                                  className="flex items-center gap-1"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                  Retry
                                </Button>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleClearErrors([error.id])}
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {errors.length > 5 && (
                        <div className="text-center text-sm text-muted-foreground">
                          ... and {errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <div className="font-medium mb-2">No Errors to Display</div>
                <div className="text-sm text-muted-foreground">
                  {filterResolved ? "No unresolved errors found" : "All sync operations are working normally"}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sync Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Attempts:</span>
                  <span className="font-medium">{syncMetrics.totalAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="font-medium text-green-600">{getSuccessRate()}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Response Time:</span>
                  <span className="font-medium">{syncMetrics.averageResponseTime.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Streak:</span>
                  <span className={`font-medium ${
                    syncMetrics.currentStreak.type === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {syncMetrics.currentStreak.count} {syncMetrics.currentStreak.type}es
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredErrors.length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(
                      filteredErrors.reduce((acc, error) => {
                        acc[error.type] = (acc[error.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getErrorTypeIcon(type as SyncError['type'])}
                          <span className="capitalize">{type}</span>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No errors to analyze
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}