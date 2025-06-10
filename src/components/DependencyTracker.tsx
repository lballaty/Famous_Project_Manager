import React from 'react';
import { Project, Task } from '../types/project';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, Link, CheckCircle } from 'lucide-react';

interface DependencyTrackerProps {
  projects: Project[];
}

export function DependencyTracker({ projects }: DependencyTrackerProps) {
  const allTasks = projects.flatMap(project => 
    project.tasks.map(task => ({
      ...task,
      projectName: project.name
    }))
  );

  const tasksWithDependencies = allTasks.filter(task => 
    task.dependencies && task.dependencies.length > 0
  );

  const getUnfulfilledDependencies = (task: Task & { projectName: string }) => {
    if (!task.dependencies) return [];
    
    return task.dependencies.filter(depId => {
      const depTask = allTasks.find(t => t.id === depId);
      return !depTask || depTask.status !== 'completed';
    });
  };

  const blockedTasks = tasksWithDependencies.filter(task => 
    getUnfulfilledDependencies(task).length > 0
  );

  const getDependencyTaskName = (depId: string) => {
    const task = allTasks.find(t => t.id === depId);
    return task ? task.title : 'Unknown Task';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Dependency Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{tasksWithDependencies.length}</div>
              <p className="text-sm text-muted-foreground">Tasks with Dependencies</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{blockedTasks.length}</div>
              <p className="text-sm text-muted-foreground">Blocked Tasks</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tasksWithDependencies.length - blockedTasks.length}
              </div>
              <p className="text-sm text-muted-foreground">Ready to Proceed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {blockedTasks.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {blockedTasks.length} task(s) are blocked by unfulfilled dependencies.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Blocked Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {blockedTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No blocked tasks! All dependencies are fulfilled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {blockedTasks.map(task => {
                const unfulfilledDeps = getUnfulfilledDependencies(task);
                return (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{task.title}</h3>
                        <Badge variant="outline">{task.projectName}</Badge>
                      </div>
                      <Badge variant="destructive">Blocked</Badge>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Waiting for:</p>
                      <div className="space-y-1">
                        {unfulfilledDeps.map(depId => {
                          const depTask = allTasks.find(t => t.id === depId);
                          return (
                            <div key={depId} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-red-500 rounded-full" />
                              <span>{getDependencyTaskName(depId)}</span>
                              {depTask && (
                                <Badge variant="secondary" className="text-xs">
                                  {depTask.status}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}