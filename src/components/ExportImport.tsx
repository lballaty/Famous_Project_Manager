import React, { useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Download, Upload } from 'lucide-react';
import { Project, Task } from '../types/project';
import { useToast } from '../hooks/use-toast';

interface ExportImportProps {
  projects: Project[];
  onImport: (projects: Project[]) => void;
}

export function ExportImport({ projects, onImport }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith('.json')) {
          const importedProjects = JSON.parse(content) as Project[];
          onImport(importedProjects);
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          
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
            id: 'imported',
            name: 'Imported Project',
            description: 'Project created from CSV import',
            status: 'planning',
            priority: 'medium',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            progress: 0,
            tasks,
            team: [],
            color: '#3b82f6'
          };
          
          onImport([importedProject]);
        }
        
        toast({
          title: "Import Successful",
          description: `Imported data from ${file.name}`
        });
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

  return (
    <div className="flex gap-2">
      <Button onClick={exportToCSV} className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
      
      <Button 
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Import
      </Button>
      
      <Input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json"
        onChange={handleFileImport}
        className="hidden"
      />
    </div>
  );
}