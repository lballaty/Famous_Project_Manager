// src/components/MainApp.tsx - Updated with enhanced settings
// Updated MainApp.tsx with mobile responsiveness
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
  LogOut, 
  GitBranch, 
  Menu,
  MoreVertical
} from 'lucide-react';

// NEW IMPORTS - Add enhanced settings components
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Database,
  Sync,
  Filter,
  Lock,
  FileText,
  AlertTriangle
} from 'lucide-react';
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

  // NEW: Enhanced Settings Component
  const EnhancedSettings = () => {
    const [settingsTab, setSettingsTab] = useState('storage');

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
            <TabsTrigger value="sync" className="flex items-center gap-1 md:gap-2">
              <Sync className="h-3 w-3 md:h-4 w-4" />
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
            <StorageSettings 
              config={storageConfig} 
              onConfigChange={setStorageConfig} 
            />
          </TabsContent>

          <TabsContent value="sync">
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
  };

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
                
                <DropdownMenuItem className="p-0">
                  <ExportImport 
                    projects={projects} 
                    users={users}
                    onImport={handleImport}
                    onImportUsers={setUsers}
                  />
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
          {activeTab === 'settings' && <EnhancedSettings />}
        </div>
      </div>
    </div>
  );
}