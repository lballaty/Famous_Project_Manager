import React, { useState, useEffect } from 'react';
import { Task, Project } from '../types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  projects: Project[];
  allTasks: Task[];
  onSave: (task: Partial<Task>) => void;
}

export function TaskDialog({ open, onOpenChange, task, projects, allTasks, onSave }: TaskDialogProps) {
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [dueDate, setDueDate] = useState<Date>();
  const [startDate, setStartDate] = useState<Date>();

  useEffect(() => {
    if (task) {
      setFormData(task);
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setStartDate(task.startDate ? new Date(task.startDate) : undefined);
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        projectId: '',
        dependencies: [],
        milestoneId: undefined
      });
      setDueDate(undefined);
      setStartDate(undefined);
    }
  }, [task, open]);

  const handleSave = () => {
    const taskData = {
      ...formData,
      dueDate: dueDate?.toISOString(),
      startDate: startDate?.toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!task) {
      taskData.id = crypto.randomUUID();
      taskData.createdAt = new Date().toISOString();
    }
    
    onSave(taskData);
    onOpenChange(false);
  };

  const selectedProject = projects.find(p => p.id === formData.projectId);
  const availableTasks = allTasks.filter(t => t.id !== task?.id && t.projectId === formData.projectId);
  const milestones = selectedProject?.milestones || [];

  const addDependency = (taskId: string) => {
    const deps = formData.dependencies || [];
    if (!deps.includes(taskId)) {
      setFormData({ ...formData, dependencies: [...deps, taskId] });
    }
  };

  const removeDependency = (taskId: string) => {
    const deps = formData.dependencies || [];
    setFormData({ ...formData, dependencies: deps.filter(id => id !== taskId) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Project</Label>
              <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value, dependencies: [] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Task['status'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as Task['priority'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Milestone</Label>
              <Select value={formData.milestoneId || 'None'} onValueChange={(value) => setFormData({ ...formData, milestoneId: value || undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select milestone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">No milestone</SelectItem>
                  
                  {milestones.map(milestone => (
                    <SelectItem key={milestone.id} value={milestone.id}>{milestone.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !startDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !dueDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {formData.projectId && (
            <div>
              <Label>Dependencies</Label>
              <div className="space-y-2">
                <Select onValueChange={addDependency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add dependency" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map(t => (
                      <SelectItem key={t.id} value={t.id} disabled={(formData.dependencies || []).includes(t.id)}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {(formData.dependencies || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(formData.dependencies || []).map(depId => {
                      const depTask = availableTasks.find(t => t.id === depId);
                      return depTask ? (
                        <div key={depId} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                          {depTask.title}
                          <Button size="sm" variant="ghost" className="h-4 w-4 p-0" onClick={() => removeDependency(depId)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.title || !formData.projectId}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}