// src/components/ExportImport.tsx - Updated with user persistence
import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Download, 
  Upload, 
  Database, 
  FileJson, 
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Shuffle,
  Users
} from 'lucide-react';
import { Project, Task } from '../types/project';
import { User } from '../types/user';
import { useToast } from '../hooks/use-toast';
import { 
  importSeedData, 
  importJsonData,
  exportData,
  addMoreSampleProjects,
  ImportOptions,
  ImportResult 
} from '../utils/dataImport';

interface ExportImportProps {
  projects: Project[];
  users?: User[]; // Make it optional with default
  onImport: (projects: Project[]) => void;
  onImportUsers?: (users: User[]) => void; // Make it optional
}

export function ExportImport({ 
  projects, 
  users = [], // Default to empty array
  onImport, 
  onImportUsers = () => {} // Default to empty function
}: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sampleCount, setSampleCount] = useState(5);

  // Your existing CSV export function
  const exportToCSV = () => {
    const allTasks: (Task & { projectName: string; assigneeName: string })[] = [];
    
    projects.forEach(project => {
      project.tasks.forEach(task => {
        const assignee = users.find(u => u.id === task.assigneeId);
        allTasks.push({
          ...task,
          projectName: project.name,
          assigneeName: assignee ? assignee.name : 'Unassigned'
        });
      });
    });

    const headers = ['Project', 'Task Title', 'Description', 'Status', 'Priority', 'Assignee', 'Due Date', 'Estimated Hours', 'Tags'];
    const csvContent = [
      headers.join(','),
      ...allTasks.map(task => [
        task.projectName,
        `"${task.title}"`,
        `"${task.description}"`,
        task.status,
        task.priority,
        task.assigneeName,
        task.dueDate,
        task.estimatedHours || '',
        `"${(task.tags || []).join('; ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project-tasks.csv';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: "Tasks exported to CSV file"
    });
  };

  // Enhanced JSON export function
  const exportToJSON = () => {
    exportData(projects, users);
    toast({
      title: "Export Successful",
      description: "Full project and user data exported to JSON file"
    });
  };

  // Enhanced file import function
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith('.json')) {
          const importedData = JSON.parse(content);
          
          // Handle both old format (direct Project[]) and new format (with projects property)
          const importedProjects = Array.isArray(importedData) ? importedData : importedData.projects || [];
          const importedUsers = importedData.users || [];
          
          if (importMode === 'merge') {
            const existingProjectIds = new Set(projects.map(p => p.id));
            const existingUserIds = new Set(users.map(u => u.id));
            
            const newProjects = importedProjects.filter((p: Project) => !existingProjectIds.has(p.id));
            const newUsers = importedUsers.filter((u: User) => !existingUserIds.has(u.id));
            
            onImport([...projects, ...newProjects]);
            onImportUsers([...users, ...newUsers]);
          } else {
            onImport(importedProjects);
            onImportUsers(importedUsers);
          }
          
          toast({
            title: "Import Successful",
            description: `Imported ${importedProjects.length} projects and ${importedUsers.length} users from ${file.name}`
          });
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n');
          
          // Simple CSV parsing - in production, use a proper CSV parser
          const tasks = lines.slice(1).map(line => {
            const values = line.split(',');
            return {
              id: Math.random().toString(36).substr(2, 9),
              title: values[1]?.replace(/"/g, '') || '',
              description: values[2]?.replace(/"/g, '') || '',
              status: values[3] as 'todo' | 'in-progress' | 'completed' || 'todo',
              priority: values[4] as 'low' | 'medium' | 'high' || 'medium',
              assigneeId: 'unassigned', // Will need to be mapped to actual user
              dueDate: values[6] || new Date().toISOString().split('T')[0],
              projectId: 'imported'
            };
          }).filter(task => task.title);

          const importedProject: Project = {
            id: 'imported-' + Date.now(),
            name: 'Imported Project',
            description: 'Project created from CSV import',
            status: 'planning',
            priority: 'medium',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            progress: 0,
            tasks,
            teamMembers: [],
            color: '#3b82f6',
            milestones: []
          };
          
          if (importMode === 'merge') {
            onImport([...projects, importedProject]);
          } else {
            onImport([importedProject]);
          }
          
          toast({
            title: "Import Successful",
            description: `Imported data from ${file.name}`
          });
        }
        
        setImportDialogOpen(false);
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to parse the imported file",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  // Enhanced seed data import
  const handleSeedDataImport = async () => {
    setIsLoading(true);
    try {
      const options: ImportOptions = {
        mode: importMode,
        includeProjects: true,
        includeTasks: true,
        includeMilestones: true,
        includeUsers: true
      };
      
      const result = importSeedData(projects, users, options, onImport, onImportUsers);
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: "Import Successful",
          description: result.message
        });
        setTimeout(() => setImportDialogOpen(false), 2000);
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Failed to import seed data',
        projectsAdded: 0,
        tasksAdded: 0,
        milestonesAdded: 0,
        usersAdded: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate random projects
  const handleGenerateMore = async () => {
    setIsLoading(true);
    try {
      const result = addMoreSampleProjects(projects, users, sampleCount, onImport);
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: "Generate Successful", 
          description: result.message
        });
        setTimeout(() => setImportDialogOpen(false), 2000);
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Failed to generate sample projects',
        projectsAdded: 0,
        tasksAdded: 0,
        milestonesAdded: 0,
        usersAdded: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setImportResult(null);
      setIsLoading(false);
    }
    setImportDialogOpen(open);
  };

  return (
    <>
      <div className="flex gap-2">
        {/* Export Buttons */}
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export CSV
        </Button>
        
        <Button onClick={exportToJSON} variant="outline" className="flex items-center gap-2">
          <FileJson className="h-4 w-4" />
          Export JSON
        </Button>
        
        {/* Import Button */}
        <Button 
          onClick={() => setImportDialogOpen(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>
      </div>

      {/* Enhanced Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data
            </DialogTitle>
            <DialogDescription>
              Import projects, users, and tasks into your project manager
            </DialogDescription>
          </DialogHeader>

          {/* Import Result Alert */}
          {importResult && (
            <Alert className={importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {importResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className="space-y-1">
                <p className="font-medium">{importResult.message}</p>
                {importResult.success && (
                  <div className="text-sm space-y-1">
                    <p>✅ Projects: {importResult.projectsAdded}</p>
                    <p>✅ Tasks: {importResult.tasksAdded}</p>
                    <p>✅ Milestones: {importResult.milestonesAdded}</p>
                    <p>✅ Users: {importResult.usersAdded}</p>
                  </div>
                )}
                {importResult.errors.length > 0 && (
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {importResult.errors.slice(0, 3).map((error, index) => (
                      <li key={index} className="text-red-600">{error}</li>
                    ))}
                    {importResult.errors.length > 3 && (
                      <li className="text-red-600">... and {importResult.errors.length - 3} more errors</li>
                    )}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Current Data Summary */}
<div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
  <div className="text-sm">
    <p className="font-medium">Current Data:</p>
    <p className="text-muted-foreground">
      {projects?.length || 0} projects, {users?.length || 0} users
    </p>
  </div>
  <Users className="h-8 w-8 text-muted-foreground" />
</div>

          {/* Import Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Import Mode</Label>
              <p className="text-xs text-muted-foreground">
                {importMode === 'replace' 
                  ? 'Replace all existing data' 
                  : 'Add to existing data'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="mode-switch" className="text-xs">Merge</Label>
              <Switch
                id="mode-switch"
                checked={importMode === 'replace'}
                onCheckedChange={(checked) => setImportMode(checked ? 'replace' : 'merge')}
                disabled={isLoading}
              />
              <Label htmlFor="mode-switch" className="text-xs">Replace</Label>
            </div>
          </div>

          {/* Import Options Tabs */}
          <Tabs defaultValue="seed" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="seed" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                Seed Data
              </TabsTrigger>
              <TabsTrigger value="file" className="text-xs">
                <FileJson className="h-3 w-3 mr-1" />
                File
              </TabsTrigger>
              <TabsTrigger value="generate" className="text-xs">
                <Shuffle className="h-3 w-3 mr-1" />
                Generate
              </TabsTrigger>
            </TabsList>

            <TabsContent value="seed" className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Complete Sample Dataset</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Import comprehensive sample data including:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>5 realistic projects with 16-week timelines</li>
                    <li>9 team members with full profiles</li>
                    <li>50+ tasks with dependencies</li>
                    <li>40+ milestones across projects</li>
                    <li>Team assignments and role allocations</li>
                  </ul>
                </div>
              </div>
              <Button 
                onClick={handleSeedDataImport}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Importing...' : 'Import Complete Sample Dataset'}
              </Button>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">File Import</h4>
                <div className="text-sm text-muted-foreground">
                  <p><strong>JSON:</strong> Complete project and user data</p>
                  <p><strong>CSV:</strong> Tasks only (creates new project)</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-input" className="text-sm">Select File</Label>
                <Input
                  id="file-input"
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileImport}
                  disabled={isLoading}
                  className="cursor-pointer"
                />
              </div>
            </TabsContent>

            <TabsContent value="generate" className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Generate Test Projects</h4>
                <p className="text-sm text-muted-foreground">
                  Create additional sample projects with random data. Team members will be assigned from existing users.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="count" className="text-sm">Count:</Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="20"
                    value={sampleCount}
                    onChange={(e) => setSampleCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                    className="w-20"
                    disabled={isLoading}
                  />
                  <span className="text-xs text-muted-foreground">projects</span>
                </div>
                <Button 
                  onClick={handleGenerateMore}
                  disabled={isLoading || users.length === 0}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? 'Generating...' : `Generate ${sampleCount} Projects`}
                </Button>
                {users.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Import users first to enable project generation with team assignments
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Close Button */}
          {!isLoading && (
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden file input for compatibility */}
      <Input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json"
        onChange={handleFileImport}
        className="hidden"
      />
    </>
  );
}