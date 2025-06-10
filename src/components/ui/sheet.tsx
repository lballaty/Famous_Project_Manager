// Updated MainApp.tsx with mobile responsive header and navigation
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
  MoreVertical,
  Upload,
  Download,
  User
} from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4">
        {/* Mobile-responsive header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
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

            <h1 className="text-2xl md:text-3xl font-bold">Project Tracker</h1>
          </div>
          
          {/* Desktop header actions */}
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

          {/* Mobile header actions */}
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
                
                <DropdownMenuItem asChild>
                  <div className="cursor-pointer">
                    <ExportImport 
                      projects={projects} 
                      users={users}
                      onImport={handleImport}
                      onImportUsers={setUsers}
                    />
                  </div>
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

        {/* Desktop navigation tabs */}
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

            {/* Tab content */}
            <TabsContent value="dashboard" className="mt-6">
              <Dashboard projects={projects} />
            </TabsContent>

            <TabsContent value="projects" className="mt-6">
              <ProjectTracker />
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <TaskList 
                tasks={allTasks} 
                projects={projects}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                onTaskCreate={handleTaskCreate}
              />
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <Timeline projects={projects} />
            </TabsContent>

            <TabsContent value="dependencies" className="mt-6">
              <DependencyTracker projects={projects} />
            </TabsContent>

            <TabsContent value="graph" className="mt-6">
              <DependencyGraph projects={projects} />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <StorageSettings 
                config={storageConfig} 
                onConfigChange={setStorageConfig} 
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Mobile content (controlled by state instead of tabs) */}
        <div className="md:hidden mt-6">
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
          {activeTab === 'settings' && (
            <StorageSettings 
              config={storageConfig} 
              onConfigChange={setStorageConfig} 
            />
          )}
        </div>
      </div>
    </div>
  );
}