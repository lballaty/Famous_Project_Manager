import React from 'react';
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
import { BarChart3, List, Calendar, Link, Settings, FolderOpen, LogOut, GitBranch } from 'lucide-react';
import { useRoles } from '../hooks/useRoles';
import { Task, Project } from '../types/project';

export function MainApp() {
  const { 
    projects, 
    setProjects, 
    addProject, 
    updateProject, 
    deleteProject,
    user, 
    setUser, 
    storageConfig, 
    setStorageConfig,
    loading 
  } = useAppContext();
  const { canEdit, canDelete } = useRoles();

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

  const projectOptions = projects.map(p => ({ id: p.id, name: p.name }));

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Project Tracker</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            <ExportImport projects={projects} onImport={handleImport} />
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="dependencies" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Dependencies
            </TabsTrigger>
            <TabsTrigger value="graph" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Graph
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

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
    </div>
  );
}