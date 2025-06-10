// src/components/ExportImport.tsx - Enhanced version
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
  Shuffle
} from 'lucide-react';
import { Project, Task } from '../types/project';
import { useToast } from '../hooks/use-toast';
import { 
  importSeedData, 
  addMoreSampleProjects,
  ImportOptions,
  ImportResult 
} from '../utils/dataImport';

interface ExportImportProps {
  projects: Project[];
  onImport: (projects: Project[]) => void;
}

export function ExportImport({ projects, onImport }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sampleCount, setSampleCount] = useState(5);

  // Your existing CSV export function
  const exportToCSV = () => {
    const allTasks: (Task & { projectName: string })[] = [];
    
    projects.forEach(project => {
      project.tasks.forEach(task => {
        allTasks.push({
          ...task,
          projectName: project.name
        });
      });
    });

    const headers = ['Project', 'Task Title', 'Description', 'Status', 'Priority', 'Assignee', 'Due Date'];
    const csvContent = [
      headers.join(','),
      ...allTasks.map(task => [
        task.projectName,
        `"${task.title}"`,
        `"${task.description}"`,
        task.status,
        task.priority,
        task.assignee,
        task.dueDate
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

  // New JSON export function
  const exportToJSON = () => {
    const allTasks: Task[] = projects.flatMap(p => p.tasks || []);
    const allMilestones = projects.flatMap(p => p.milestones || []);
    
    const exportData = {
      projects,
      tasks: allTasks,
      milestones: allMilestones,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Full project data exported to JSON file"
    });
  };

  // Your existing file import function (enhanced)
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
          
          if (importMode === 'merge') {
            const existingIds = new Set(projects.map(p => p.id));
            const newProjects = importedProjects.filter((p: Project) => !existingIds.has(p.id));
            onImport([...projects, ...newProjects]);
          } else {
            onImport(importedProjects);
          }
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
              assignee: values[5] || '',
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
            team: [],
            color: '#3b82f6',
            milestones: []
          };
          
          if (importMode === 'merge') {
            onImport([...projects, importedProject]);
          } else {
            onImport([importedProject]);
          }
        }
        
        toast({
          title: "Import Successful",
          description: `Imported data from ${file.name}`
        });
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

  // New seed data import
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
      
      const result = importSeedData(projects, options, onImport);
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
      const result = addMoreSampleProjects(projects, sampleCount, onImport);
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
              Import Projects
            </DialogTitle>
            <DialogDescription>
              Choose what type of data to import into your project manager
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
                  <p className="text-sm">
                    Added: {importResult.projectsAdded} projects, {importResult.tasksAdded} tasks, {importResult.milestonesAdded} milestones
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Import Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Import Mode</Label>
              <p className="text-xs text-muted-foreground">
                {importMode === 'replace' 
                  ? 'Replace all existing projects' 
                  : 'Add to existing projects'
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
                <h4 className="font-medium">Sample Project Data</h4>
                <p className="text-sm text-muted-foreground">
                  Import 3 realistic sample projects with tasks, milestones, and team assignments.
                </p>
              </div>
              <Button 
                onClick={handleSeedDataImport}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Importing...' : 'Import Sample Projects'}
              </Button>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">JSON/CSV File Import</h4>
                <p className="text-sm text-muted-foreground">
                  Import from JSON (complete project data) or CSV (tasks only) files.
                </p>
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
                <h4 className="font-medium">Generate Random Projects</h4>
                <p className="text-sm text-muted-foreground">
                  Create additional sample projects with random data for testing.
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
                </div>
                <Button 
                  onClick={handleGenerateMore}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? 'Generating...' : `Generate ${sampleCount} Projects`}
                </Button>
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
