// src/components/ProjectDialog.tsx - Updated with lock integration
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Project } from '@/types/project';

// NEW IMPORTS - Add these
import { useProjectLock, ProjectLockBanner, ProjectLockDialog } from './ProjectLockComponents';
import { AlertCircle, Lock, Unlock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (project: Omit<Project, 'id'>) => void;
  project?: Project;
}

const colors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
];

export const ProjectDialog = ({ open, onOpenChange, onSave, project }: ProjectDialogProps) => {
  // NEW: Add lock functionality for existing projects
  const { lock, canEdit, isOwnLock } = useProjectLock(project?.id || '');
  const [showLockDialog, setShowLockDialog] = useState(false); // NEW: Lock dialog state
  
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'planning',
    priority: project?.priority || 'medium',
    startDate: project?.startDate || new Date().toISOString().split('T')[0],
    endDate: project?.endDate || '',
    progress: project?.progress || 0,
    team: project?.team?.join(', ') || '',
    color: project?.color || colors[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // NEW: Check if editing is allowed
    if (project && !canEdit) {
      return; // Don't save if project is locked
    }
    
    onSave({
      ...formData,
      team: formData.team.split(',').map(t => t.trim()).filter(Boolean),
      tasks: project?.tasks || []
    });
    onOpenChange(false);
  };

  // NEW: Handle lock toggle
  const handleLockToggle = () => {
    setShowLockDialog(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{project ? 'Edit Project' : 'Create New Project'}</span>
              
              {/* NEW: Lock button for existing projects */}
              {project && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLockToggle}
                  className="flex items-center gap-2"
                >
                  {lock ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  {lock ? (isOwnLock ? 'Manage Lock' : 'Locked') : 'Lock'}
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* NEW: Lock banner for existing projects */}
          {project && lock && (
            <ProjectLockBanner 
              lock={lock}
              onUnlock={isOwnLock ? undefined : undefined} // Managed through lock dialog
              onManage={isOwnLock ? () => setShowLockDialog(true) : undefined}
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NEW: Wrap form in container that can be disabled */}
            <div className={!canEdit && project ? 'pointer-events-none opacity-60' : ''}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2 mt-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({...formData, color})}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="team">Team Members (comma separated)</Label>
                <Input
                  id="team"
                  value={formData.team}
                  onChange={(e) => setFormData({...formData, team: e.target.value})}
                  placeholder="Alice, Bob, Charlie"
                />
              </div>
            </div>

            {/* NEW: Lock warning message */}
            {project && !canEdit && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This project is locked and cannot be edited. 
                  {lock?.locked_by_user_id === project.projectManager 
                    ? " You can unlock it using the lock button above." 
                    : ` It's locked by ${lock?.locked_by_name}.`
                  }
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={project ? !canEdit : false} // NEW: Disable save if locked
              >
                {project ? 'Update' : 'Create'} Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* NEW: Lock management dialog */}
      {project && (
        <ProjectLockDialog
          projectId={project.id}
          projectName={project.name}
          isOpen={showLockDialog}
          onClose={() => setShowLockDialog(false)}
          existingLock={lock}
        />
      )}
    </>
  );
};