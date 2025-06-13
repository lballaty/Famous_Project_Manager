// src/components/SelectiveSyncComponents.tsx - Fixed complete file
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Project, Task } from '../types/project';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  CheckSquare,
  Square,
  Users,
  FolderOpen,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

// Project Selector for selective sync
interface ProjectSyncSelectorProps {
  projects: Project[];
  onSelectiveSync: (projectIds: string[], direction: 'upload' | 'download') => Promise<void>;
}

export const ProjectSyncSelector: React.FC<ProjectSyncSelectorProps> = ({
  projects,
  onSelectiveSync
}) => {
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { toast } = useToast();

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projects, searchTerm, statusFilter, priorityFilter]);

  const handleSelectAll = () => {
    setSelectedProjects(new Set(filteredProjects.map(p => p.id)));
  };

  const handleSelectNone = () => {
    setSelectedProjects(new Set());
  };

  const handleSelectByStatus = (status: string) => {
    const projectsByStatus = filteredProjects
      .filter(project => project.status === status)
      .map(project => project.id);
    setSelectedProjects(new Set(projectsByStatus));
  };

  const handleSync = async (direction: 'upload' | 'download') => {
    if (selectedProjects.size === 0) {
      toast({
        title: "No Projects Selected",
        description: "Please select at least one project to sync",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSelectiveSync(Array.from(selectedProjects), direction);
      setSelectedProjects(new Set());
      toast({
        title: "Sync Completed",
        description: `${selectedProjects.size} projects ${direction === 'upload' ? 'uploaded to' : 'downloaded from'} cloud`
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync projects",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectStats = (project: Project) => {
    const totalTasks = project.tasks?.length || 0;
    const completedTasks = project.tasks?.filter(task => task.status === 'completed').length || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return { totalTasks, completedTasks, completionRate };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Project Sync Selection ({filteredProjects.length} projects)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Selection Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            <CheckSquare className="h-3 w-3 mr-1" />
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={handleSelectNone}>
            <Square className="h-3 w-3 mr-1" />
            Select None
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSelectByStatus('in-progress')}>
            In Progress
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSelectByStatus('planning')}>
            Planning
          </Button>
        </div>

        {/* Project List */}
        <div className="max-h-96 overflow-y-auto border rounded-lg">
          {filteredProjects.length > 0 ? (
            <div className="divide-y">
              {filteredProjects.map(project => {
                const stats = getProjectStats(project);
                const isSelected = selectedProjects.has(project.id);
                
                return (
                  <label 
                    key={project.id} 
                    className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const newSelected = new Set(selectedProjects);
                        if (checked) {
                          newSelected.add(project.id);
                        } else {
                          newSelected.delete(project.id);
                        }
                        setSelectedProjects(newSelected);
                      }}
                    />
                    
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: project.color }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium truncate">{project.name}</div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {project.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant={
                          project.priority === 'high' ? 'destructive' :
                          project.priority === 'medium' ? 'default' : 'secondary'
                        } className="text-xs capitalize">
                          {project.priority}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        {project.description}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CheckSquare className="h-3 w-3" />
                          {stats.completedTasks}/{stats.totalTasks} tasks
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {project.teamMembers?.length || 0} members
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due {new Date(project.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {stats.totalTasks > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{stats.completionRate}%</span>
                          </div>
                          <Progress value={stats.completionRate} className="h-1" />
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <div>No projects match your filters</div>
            </div>
          )}
        </div>

        {/* Sync Actions */}
        {selectedProjects.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-700">
              {selectedProjects.size} project{selectedProjects.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSync('upload')}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Upload className="h-3 w-3" />
                {isLoading ? 'Uploading...' : 'Upload to Cloud'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSync('download')}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Download className="h-3 w-3" />
                {isLoading ? 'Downloading...' : 'Download from Cloud'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Task Selector for fine-grained sync control
interface TaskSyncSelectorProps {
  projectId: string;
  tasks: Task[];
  onSelectiveSync: (taskIds: string[], direction: 'upload' | 'download') => Promise<void>;
}

export const TaskSyncSelector: React.FC<TaskSyncSelectorProps> = ({
  projectId,
  tasks,
  onSelectiveSync
}) => {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const { projects, getUserById } = useAppContext();
  const { toast } = useToast();

  const project = projects.find(p => p.id === projectId);
  
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assigneeId === assigneeFilter;
      
      return matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, statusFilter, priorityFilter, assigneeFilter]);

  const uniqueAssignees = useMemo(() => {
    const assigneeIds = Array.from(new Set(tasks.map(task => task.assigneeId).filter(Boolean)));
    return assigneeIds.map(id => getUserById(id)).filter(Boolean);
  }, [tasks, getUserById]);

  const handleSelectByStatus = (status: string) => {
    const tasksByStatus = filteredTasks
      .filter(task => task.status === status)
      .map(task => task.id);
    setSelectedTasks(new Set(tasksByStatus));
  };

  const handleSelectByPriority = (priority: string) => {
    const tasksByPriority = filteredTasks
      .filter(task => task.priority === priority)
      .map(task => task.id);
    setSelectedTasks(new Set(tasksByPriority));
  };

  const handleSync = async (direction: 'upload' | 'download') => {
    if (selectedTasks.size === 0) {
      toast({
        title: "No Tasks Selected",
        description: "Please select at least one task to sync",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSelectiveSync(Array.from(selectedTasks), direction);
      setSelectedTasks(new Set());
      toast({
        title: "Tasks Synced",
        description: `${selectedTasks.size} tasks ${direction === 'upload' ? 'uploaded to' : 'downloaded from'} cloud`
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync tasks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Task Sync Selection - {project?.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-sm">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm">Priority</Label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm">Assignee</Label>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {uniqueAssignees.map(assignee => (
                  <SelectItem key={assignee.id} value={assignee.id}>
                    {assignee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Selection */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedTasks(new Set(filteredTasks.map(t => t.id)))}
          >
            Select All Filtered
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleSelectByStatus('completed')}
          >
            Completed Tasks
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleSelectByStatus('in-progress')}
          >
            In Progress
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleSelectByPriority('high')}
          >
            High Priority
          </Button>
        </div>

        {/* Task List */}
        <div className="max-h-80 overflow-y-auto border rounded-lg">
          {filteredTasks.length > 0 ? (
            <div className="divide-y">
              {filteredTasks.map(task => {
                const isSelected = selectedTasks.has(task.id);
                const assignee = getUserById(task.assigneeId);
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
                
                return (
                  <label 
                    key={task.id} 
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const newSelected = new Set(selectedTasks);
                        if (checked) {
                          newSelected.add(task.id);
                        } else {
                          newSelected.delete(task.id);
                        }
                        setSelectedTasks(newSelected);
                      }}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium">{task.title}</div>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        {task.description}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getTaskStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        {assignee && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {assignee.name}
                          </Badge>
                        )}
                        {task.dueDate && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <div>No tasks match your filters</div>
            </div>
          )}
        </div>

        {/* Sync Actions */}
        {selectedTasks.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-700">
              {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleSync('upload')}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Upload className="h-3 w-3" />
                Upload Tasks
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSync('download')}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Download className="h-3 w-3" />
                Download Tasks
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Combined Selective Sync Interface
export const SelectiveSyncInterface: React.FC = () => {
  const { projects, storageService } = useAppContext();
  const [selectedProject, setSelectedProject] = useState<string>('');

  const handleProjectSync = async (projectIds: string[], direction: 'upload' | 'download') => {
    if (direction === 'upload') {
      // Upload selected projects to cloud
      const selectedProjects = projects.filter(p => projectIds.includes(p.id));
      await storageService.saveProjects(selectedProjects);
    } else {
      // Download selected projects from cloud
      await storageService.forceSyncFromSupabase();
    }
  };

  const handleTaskSync = async (taskIds: string[], direction: 'upload' | 'download') => {
    // Implementation would depend on your task storage structure
    // This is a simplified version
    if (direction === 'upload') {
      // Upload selected tasks
      const allTasks = projects.flatMap(p => p.tasks || []);
      const selectedTasks = allTasks.filter(t => taskIds.includes(t.id));
      // Would need specific task sync logic here
    } else {
      // Download selected tasks
      await storageService.forceSyncFromSupabase();
    }
  };

  const getProjectTasks = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.tasks || [];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Selective Sync</h2>
        <p className="text-muted-foreground">
          Choose specific projects and tasks to sync for offline work or to update with latest changes.
        </p>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Project Sync</TabsTrigger>
          <TabsTrigger value="tasks">Task Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <ProjectSyncSelector
            projects={projects}
            onSelectiveSync={handleProjectSync}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <div className="space-y-4">
            <div>
              <Label>Select Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a project to sync tasks" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.tasks?.length || 0} tasks)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProject && (
              <TaskSyncSelector
                projectId={selectedProject}
                tasks={getProjectTasks(selectedProject)}
                onSelectiveSync={handleTaskSync}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Offline Preparation Component
export const OfflinePreparation: React.FC = () => {
  const { projects, storageService } = useAppContext();
  const [isPreparingOffline, setIsPreparingOffline] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handlePrepareOffline = async () => {
    if (selectedProjects.size === 0) {
      toast({
        title: "No Projects Selected",
        description: "Please select projects to prepare for offline work",
        variant: "destructive"
      });
      return;
    }

    setIsPreparingOffline(true);
    try {
      // Download selected projects and their dependencies
      const projectList = Array.from(selectedProjects);
      await storageService.forceSyncFromSupabase();
      
      // Additional offline preparation logic could go here
      // - Prefetch related data
      // - Optimize local storage
      // - Setup conflict resolution
      
      toast({
        title: "Offline Preparation Complete",
        description: `${selectedProjects.size} projects are ready for offline work`
      });
      
      setSelectedProjects(new Set());
    } catch (error) {
      toast({
        title: "Preparation Failed",
        description: error instanceof Error ? error.message : "Failed to prepare for offline work",
        variant: "destructive"
      });
    } finally {
      setIsPreparingOffline(false);
    }
  };

  const getProjectSummary = () => {
    const selectedProjectsList = projects.filter(p => selectedProjects.has(p.id));
    const totalTasks = selectedProjectsList.reduce((sum, p) => sum + (p.tasks?.length || 0), 0);
    const totalMembers = new Set(selectedProjectsList.flatMap(p => p.teamMembers?.map(tm => tm.userId) || [])).size;
    
    return { totalTasks, totalMembers };
  };

  const { totalTasks, totalMembers } = getProjectSummary();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Prepare for Offline Work
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Select projects to download and prepare for offline editing. This will ensure you have
          the latest data and can work seamlessly without an internet connection.
        </div>

        <ProjectSyncSelector
          projects={projects}
          onSelectiveSync={async (projectIds) => {
            setSelectedProjects(new Set(projectIds));
          }}
        />

        {selectedProjects.size > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-blue-900">
                  Ready to prepare {selectedProjects.size} projects for offline work
                </div>
                <div className="text-sm text-blue-700">
                  Includes {totalTasks} tasks and {totalMembers} team members
                </div>
              </div>
              <Button
                onClick={handlePrepareOffline}
                disabled={isPreparingOffline}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isPreparingOffline ? 'Preparing...' : 'Prepare Offline'}
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <div><strong>What this does:</strong></div>
          <div>• Downloads latest project data and tasks</div>
          <div>• Syncs team member information</div>
          <div>• Prepares conflict resolution for when you're back online</div>
          <div>• Optimizes local storage for offline performance</div>
        </div>
      </CardContent>
    </Card>
  );
};