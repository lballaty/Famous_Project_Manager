import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, ArrowRight, Eye } from 'lucide-react';
import { Task, Project } from '../types/project';
import { useRoles } from '../hooks/useRoles';

interface DependencyGraphProps {
  projects: Project[];
  onTaskSelect?: (task: Task) => void;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({ 
  projects, 
  onTaskSelect 
}) => {
  const { canEdit } = useRoles();
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  // Get all tasks with dependencies
  const allTasks = projects.flatMap(p => p.tasks);
  const tasksWithDeps = allTasks.filter(task => task.dependencies && task.dependencies.length > 0);

  const getTaskById = (id: string) => allTasks.find(t => t.id === id);
  
  const getBlockedTasks = () => {
    return tasksWithDeps.filter(task => {
      return task.dependencies?.some(depId => {
        const depTask = getTaskById(depId);
        return depTask && depTask.status !== 'completed';
      });
    });
  };

  const blockedTasks = getBlockedTasks();

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    onTaskSelect?.(task);
  };

  const renderTaskNode = (task: Task, isBlocked: boolean = false) => {
    const project = projects.find(p => p.id === task.projectId);
    
    return (
      <div
        key={task.id}
        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
          isBlocked ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
        } ${selectedTask?.id === task.id ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => handleTaskClick(task)}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm truncate">{task.title}</h4>
          {isBlocked && <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />}
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <Badge 
            variant={task.status === 'completed' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {task.status}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {task.priority}
          </Badge>
        </div>
        
        {project && (
          <div className="text-xs text-muted-foreground mb-2">
            {project.name}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </div>
      </div>
    );
  };

  const renderDependencyChain = (task: Task) => {
    if (!task.dependencies?.length) return null;
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Dependencies for: {task.title}</h4>
        <div className="flex flex-col gap-3">
          {task.dependencies.map(depId => {
            const depTask = getTaskById(depId);
            if (!depTask) return null;
            
            const isCompleted = depTask.status === 'completed';
            
            return (
              <div key={depId} className="flex items-center gap-3">
                <div className={`flex-1 ${isCompleted ? 'opacity-60' : ''}`}>
                  {renderTaskNode(depTask, !isCompleted)}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  {renderTaskNode(task, !isCompleted)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Blocked Tasks Alert */}
      {blockedTasks.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {blockedTasks.length} Blocked Task{blockedTasks.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {blockedTasks.map(task => renderTaskNode(task, true))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dependency Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Task Dependencies</CardTitle>
        </CardHeader>
        <CardContent>
          {tasksWithDeps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No task dependencies found.
            </div>
          ) : (
            <div className="space-y-6">
              {tasksWithDeps.map(task => (
                <div key={task.id}>
                  {renderDependencyChain(task)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Task Details */}
      {selectedTask && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Task Details
              {canEdit(selectedTask.projectId) && (
                <Button size="sm" onClick={() => onTaskSelect?.(selectedTask)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Edit Task
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">{selectedTask.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTask.description}
                </p>
              </div>
              
              <div className="flex gap-4">
                <div>
                  <span className="text-sm font-medium">Status: </span>
                  <Badge variant="secondary">{selectedTask.status}</Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Priority: </span>
                  <Badge variant="outline">{selectedTask.priority}</Badge>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium">Assignee: </span>
                <span className="text-sm">{selectedTask.assignee}</span>
              </div>
              
              <div>
                <span className="text-sm font-medium">Due Date: </span>
                <span className="text-sm">{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};