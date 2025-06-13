// src/components/MainApp.tsx - Updated with enhanced settings
// Updated MainApp.tsx with mobile responsiveness
import { EnhancedSettings } from './EnhancedSettings';
import { useToast } from '../hooks/use-toast';
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Dashboard } from './Dashboard';
import { TaskList } from './TaskList';
import { Timeline } from './Timeline';
import { DependencyTracker } from './DependencyTracker';
import { DependencyGraph } from './DependencyGraph';
import { ExportImport } from './ExportImport';
import { StorageSettings } from './StorageSettings';
import { ProjectTracker } from './ProjectTracker';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from './ui/sheet';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  BarChart3,
  List,
  Calendar,
  Link,
  Settings,
  FolderOpen,
  GitBranch,
  Menu,
  MoreVertical,
  FileSpreadsheet,
  FileJson,
  LogOut,
  Database,
  RotateCw,
  Filter,
  Lock,
  FileText,
  AlertTriangle,
} from 'lucide-react';

// NEW IMPORTS - Add enhanced settings components
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

import { SyncStatus } from './SyncStatus';
import { ErrorDashboard } from './ErrorDashboard';
import { LoggingControls } from './LoggingControls';
import { SelectiveSyncInterface } from './SelectiveSyncComponents';
import { ActiveLocksPanel } from './ProjectLockComponents';

import { useRoles } from '../hooks/useRoles';
import { Task, Project } from '../types/project';



export function MainApp() {
  const { 
    projects, 
    setProjects, 
    addProject, 
    updateProject, 
    deleteProject,
    users, 
    setUsers,
    user,
    setUser, 
    storageConfig, 
    setStorageConfig,
    storageService, // NEW: Add storageService
    syncErrors, // NEW: Add syncErrors
    loading 
  } = useAppContext();
  const { canEdit, canDelete } = useRoles();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { toast } = useToast();

  // CSV Export function
const handleExportCSV = () => {
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
    title: 'Export Successful',
    description: 'Project tasks exported as CSV file.',
    //variant: 'success'
  });
};

// JSON Export function
const handleExportJSON = () => {
  const data = { projects, users };
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'project-data.json';
  link.click();
  URL.revokeObjectURL(url);
  toast({
    title: 'Export Successful',
    description: 'Project data exported as JSON file.',
    //variant: 'success'
  });
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const allTasks = projects.flatMap(project => 
    project.tasks.map(task => ({ ...task, projectId: project.id }))
  );

  const handleImport = (importedProjects: any[]) => {
    setProjects([...projects, ...importedProjects]);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    const projectId = (updatedTask as any).projectId;
    if (!projectId) return;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const updatedTasks = project.tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    
    updateProject(projectId, { tasks: updatedTasks });
  };

  const handleTaskDelete = (taskId: string) => {
    if (!canDelete()) return;
    
    projects.forEach(project => {
      const taskExists = project.tasks.some(task => task.id === taskId);
      if (taskExists) {
        const updatedTasks = project.tasks.filter(task => task.id !== taskId);
        updateProject(project.id, { tasks: updatedTasks });
      }
    });
  };

  const handleTaskCreate = (taskData: Partial<Task> & { projectId?: string }) => {
    if (!canEdit() || !taskData.projectId) return;
    
    const newTask: Task = {
      id: taskData.id || crypto.randomUUID(),
      title: taskData.title || '',
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate,
      startDate: taskData.startDate,
      dependencies: taskData.dependencies || [],
      milestoneId: taskData.milestoneId,
      createdAt: taskData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const project = projects.find(p => p.id === taskData.projectId);
    if (project) {
      const updatedTasks = [...project.tasks, newTask];
      updateProject(project.id, { tasks: updatedTasks });
    }
  };

  // Navigation items for both desktop tabs and mobile menu
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'tasks', label: 'Tasks', icon: List },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'dependencies', label: 'Dependencies', icon: Link },
    { id: 'graph', label: 'Graph', icon: GitBranch },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4">
        {/* Mobile-responsive header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger - only shows on mobile */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Project Tracker</SheetTitle>
                  <SheetDescription>
                    Navigate through your project management views
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-xl md:text-3xl font-bold">Project Tracker</h1>
          </div>
          
          {/* Desktop header actions - hidden on mobile */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            <ExportImport 
              projects={projects} 
              users={users}
              onImport={handleImport}
              onImportUsers={setUsers}
            />
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile header actions - only shows on mobile */}
<div className="md:hidden">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <div className="px-2 py-1.5 text-sm font-medium">
        Welcome, {user?.name}
      </div>
      <DropdownMenuSeparator />
      
      {/* Individual export menu items */}
      <DropdownMenuItem onClick={handleExportCSV}>
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Export CSV
      </DropdownMenuItem>
      
      <DropdownMenuItem onClick={handleExportJSON}>
        <FileJson className="h-4 w-4 mr-2" />
        Export JSON
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuItem onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>

        {/* Desktop navigation tabs - hidden on mobile */}
        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger key={item.id} value={item.id} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Content area - works for both mobile and desktop */}
        <div className="mt-6">
          {activeTab === 'dashboard' && <Dashboard projects={projects} />}
          {activeTab === 'projects' && <ProjectTracker />}
          {activeTab === 'tasks' && (
            <TaskList 
              tasks={allTasks} 
              projects={projects}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskCreate={handleTaskCreate}
            />
          )}
          {activeTab === 'timeline' && <Timeline projects={projects} />}
          {activeTab === 'dependencies' && <DependencyTracker projects={projects} />}
          {activeTab === 'graph' && <DependencyGraph projects={projects} />}
          {/* UPDATED: Use enhanced settings instead of simple StorageSettings */}
          {activeTab === 'settings' && (
  <EnhancedSettings
    storageConfig={storageConfig}
    setStorageConfig={setStorageConfig}
    storageService={storageService}
    syncErrors={syncErrors}
  />
)}

        </div>
      </div>
    </div>
  );
}