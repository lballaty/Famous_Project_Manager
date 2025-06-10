// src/components/LoggingControls.tsx - Logging configuration and log viewer
import React, { useState, useEffect } from 'react';
import { syncLogger } from '../utils/logger';
import { LogLevel, LogCategory, LogEntry, LoggerConfig } from '../types/sync';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Download,
  Eye,
  Trash2,
  Settings,
  FileText,
  Database,
  AlertCircle,
  Info,
  AlertTriangle,
  Bug
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export function LoggingControls() {
  const [config, setConfig] = useState<LoggerConfig>(syncLogger.getConfig());
  const [showLogViewer, setShowLogViewer] = useState(false);
  const { toast } = useToast();

  const updateConfig = (updates: Partial<LoggerConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    syncLogger.updateConfig(newConfig);
    
    toast({
      title: "Configuration Updated",
      description: "Logging settings have been saved"
    });
  };

  const downloadLogs = (format: 'json' | 'csv') => {
    try {
      const content = syncLogger.exportLogs(format);
      const blob = new Blob([content], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sync-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Logs Exported",
        description: `Logs exported as ${format.toUpperCase()} file`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export logs",
        variant: "destructive"
      });
    }
  };

  const clearLogs = () => {
    syncLogger.clearLogs();
    toast({
      title: "Logs Cleared",
      description: "All logs have been removed"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sync Logging Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Logging */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="enable-logging" className="text-base font-medium">
                Enable Sync Logging
              </Label>
              <p className="text-sm text-muted-foreground">
                Record detailed information about sync operations and errors
              </p>
            </div>
            <Switch
              id="enable-logging"
              checked={config.enabled}
              onCheckedChange={(enabled) => updateConfig({ enabled })}
            />
          </div>

          {config.enabled && (
            <>
              {/* Log Level */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Log Level</Label>
                <Select
                  value={config.level.toString()}
                  onValueChange={(value) => updateConfig({ level: Number(value) as LogLevel })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LogLevel.DEBUG.toString()}>
                      <div className="flex items-center gap-2">
                        <Bug className="h-4 w-4" />
                        Debug (All messages)
                      </div>
                    </SelectItem>
                    <SelectItem value={LogLevel.INFO.toString()}>
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Info (Normal operations)
                      </div>
                    </SelectItem>
                    <SelectItem value={LogLevel.WARN.toString()}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Warning (Potential issues)
                      </div>
                    </SelectItem>
                    <SelectItem value={LogLevel.ERROR.toString()}>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Error (Failures only)
                      </div>
                    </SelectItem>
                    <SelectItem value={LogLevel.CRITICAL.toString()}>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        Critical (Severe failures)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Log Categories */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Log Categories</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(LogCategory).map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={config.categories.includes(category)}
                        onCheckedChange={(checked) => {
                          const categories = checked
                            ? [...config.categories, category]
                            : config.categories.filter(c => c !== category);
                          updateConfig({ categories });
                        }}
                      />
                      <Label htmlFor={category} className="text-sm capitalize">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Max Entries */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">
                    Max Log Entries
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {config.maxEntries.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[config.maxEntries]}
                  onValueChange={([value]) => updateConfig({ maxEntries: value })}
                  min={100}
                  max={5000}
                  step={100}
                  className="w-full"
                />
              </div>

              {/* Storage Options */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Storage Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="persist-local"
                      checked={config.persistToLocal}
                      onCheckedChange={(persistToLocal) => updateConfig({ persistToLocal })}
                    />
                    <Label htmlFor="persist-local" className="text-sm">
                      Save logs to browser storage
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="real-time"
                      checked={config.realTimeDisplay}
                      onCheckedChange={(realTimeDisplay) => updateConfig({ realTimeDisplay })}
                    />
                    <Label htmlFor="real-time" className="text-sm">
                      Real-time log display
                    </Label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              onClick={() => setShowLogViewer(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Logs
            </Button>
            
            <Button
              variant="outline"
              onClick={() => downloadLogs('json')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            
            <Button
              variant="outline"
              onClick={() => downloadLogs('csv')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export CSV
            </Button>
            
            <Button
              variant="destructive"
              onClick={clearLogs}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Logs
            </Button>
          </div>

          {/* Info Box */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="space-y-1">
                <div className="text-sm font-medium">About Sync Logging</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    Sync logging captures detailed information about data synchronization operations,
                    errors, and performance metrics to help troubleshoot issues.
                  </p>
                  <p>
                    <strong>Debug:</strong> All operations including successful ones
                  </p>
                  <p>
                    <strong>Info:</strong> Important operations and status changes
                  </p>
                  <p>
                    <strong>Warning:</strong> Potential issues that don't cause failures
                  </p>
                  <p>
                    <strong>Error/Critical:</strong> Failures and severe problems
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Viewer Dialog */}
      {showLogViewer && (
        <LogViewer onClose={() => setShowLogViewer(false)} />
      )}
    </div>
  );
}

// Log Viewer Component
function LogViewer({ onClose }: { onClose: () => void }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState({
    level: undefined as LogLevel | undefined,
    category: undefined as LogCategory | undefined,
    entityType: '',
    operation: '',
    since: ''
  });

  useEffect(() => {
    const updateLogs = () => {
      const filtered = syncLogger.getLogs({
        level: filters.level,
        category: filters.category,
        entityType: filters.entityType || undefined,
        operation: filters.operation || undefined,
        since: filters.since ? new Date(filters.since) : undefined
      });
      setLogs(filtered);
    };

    updateLogs();
    
    // Subscribe to real-time updates
    const unsubscribe = syncLogger.subscribe(() => updateLogs());
    return unsubscribe;
  }, [filters]);

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG: return <Bug className="h-4 w-4 text-gray-600" />;
      case LogLevel.INFO: return <Info className="h-4 w-4 text-blue-600" />;
      case LogLevel.WARN: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case LogLevel.ERROR: return <AlertCircle className="h-4 w-4 text-red-600" />;
      case LogLevel.CRITICAL: return <AlertCircle className="h-4 w-4 text-red-800" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG: return 'bg-gray-100 text-gray-800';
      case LogLevel.INFO: return 'bg-blue-100 text-blue-800';
      case LogLevel.WARN: return 'bg-yellow-100 text-yellow-800';
      case LogLevel.ERROR: return 'bg-red-100 text-red-800';
      case LogLevel.CRITICAL: return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDetails = (details: any) => {
    if (!details) return null;
    return typeof details === 'string' ? details : JSON.stringify(details, null, 2);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-5/6 flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Sync Logs ({logs.length} entries)
          </DialogTitle>
          <DialogDescription>
            View detailed sync operation logs and troubleshoot issues
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="grid grid-cols-5 gap-3 p-3 bg-muted/50 rounded">
          <Select
            value={filters.level?.toString() || ''}
            onValueChange={(value) => setFilters(prev => ({ 
              ...prev, 
              level: value ? Number(value) as LogLevel : undefined 
            }))}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              {Object.entries(LogLevel).filter(([key]) => isNaN(Number(key))).map(([key, value]) => (
                <SelectItem key={key} value={value.toString()}>{key}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category || ''}
            onValueChange={(value) => setFilters(prev => ({ 
              ...prev, 
              category: value ? value as LogCategory : undefined 
            }))}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {Object.values(LogCategory).map(category => (
                <SelectItem key={category} value={category} className="capitalize">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Entity Type"
            value={filters.entityType}
            onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
            className="h-8"
          />

          <Input
            placeholder="Operation"
            value={filters.operation}
            onChange={(e) => setFilters(prev => ({ ...prev, operation: e.target.value }))}
            className="h-8"
          />

          <Input
            type="datetime-local"
            value={filters.since}
            onChange={(e) => setFilters(prev => ({ ...prev, since: e.target.value }))}
            className="h-8"
          />
        </div>

        {/* Log entries */}
        <ScrollArea className="flex-1 border rounded">
          {logs.length > 0 ? (
            <div className="space-y-1 p-2">
              {logs.map(log => (
                <div key={log.id} className="border rounded p-3 hover:bg-muted/50">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {log.timestamp.toLocaleString()}
                        </span>
                        <Badge className={`text-xs ${getLevelColor(log.level)}`}>
                          <div className="flex items-center gap-1">
                            {getLevelIcon(log.level)}
                            {LogLevel[log.level]}
                          </div>
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {log.category}
                        </Badge>
                        {log.context?.operation && (
                          <Badge variant="secondary" className="text-xs">
                            {log.context.operation}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="font-medium mb-1">{log.message}</div>
                      
                      {log.context && (
                        <div className="text-sm text-muted-foreground mb-2">
                          {log.context.entityType && (
                            <span className="mr-3">
                              Entity: {log.context.entityType}
                              {log.context.entityId && `#${log.context.entityId}`}
                            </span>
                          )}
                          {log.context.attempt && (
                            <span className="mr-3">Attempt: {log.context.attempt}</span>
                          )}
                        </div>
                      )}
                      
                      {log.details && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800 mb-1">
                            View Details
                          </summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32 font-mono">
                            {formatDetails(log.details)}
                          </pre>
                        </details>
                      )}
                      
                      {log.stackTrace && log.level >= LogLevel.ERROR && (
                        <details className="text-sm mt-2">
                          <summary className="cursor-pointer text-red-600 hover:text-red-800 mb-1">
                            Stack Trace
                          </summary>
                          <pre className="mt-1 p-2 bg-red-50 rounded text-xs overflow-auto max-h-32 font-mono">
                            {log.stackTrace}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div className="font-medium mb-2">No Logs Found</div>
              <div className="text-sm">
                {Object.values(filters).some(f => f) 
                  ? "No logs match the current filters" 
                  : "No logs have been recorded yet"}
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-3 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}