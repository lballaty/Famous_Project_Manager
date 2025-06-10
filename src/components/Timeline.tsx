import React, { useState } from 'react';
import { Project, Milestone } from '../types/project';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, CheckCircle, Circle, Plus, Edit, Trash2 } from 'lucide-react';
import { MilestoneDialog } from './MilestoneDialog';
import { useRoles } from '../hooks/useRoles';
import { useAppContext } from '../contexts/AppContext';

interface TimelineProps {
  projects: Project[];
}

export function Timeline({ projects }: TimelineProps) {
  const { updateProject } = useAppContext();
  const { canEdit, canDelete } = useRoles();
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<{milestone: Milestone, projectId: string} | undefined>();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const allMilestones = projects.flatMap(project => 
    (project.milestones || []).map(milestone => ({
      ...milestone,
      projectId: project.id,
      projectName: project.name,
      projectColor: project.color
    }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (date: string, completed: boolean) => {
    return !completed && new Date(date) < new Date();
  };

  const handleCreateMilestone = (projectId: string) => {
    if (!canEdit()) return;
    setSelectedProjectId(projectId);
    setEditingMilestone(undefined);
    setMilestoneDialogOpen(true);
  };

  const handleEditMilestone = (milestone: any) => {
    if (!canEdit()) return;
    setEditingMilestone({ milestone, projectId: milestone.projectId });
    setMilestoneDialogOpen(true);
  };

  const handleSaveMilestone = (milestoneData: Partial<Milestone>) => {
    const targetProjectId = editingMilestone?.projectId || selectedProjectId;
    const project = projects.find(p => p.id === targetProjectId);
    if (!project) return;
    
    const milestones = project.milestones || [];
    
    if (editingMilestone) {
      // Update existing milestone
      const updatedMilestones = milestones.map(m => 
        m.id === editingMilestone.milestone.id 
          ? { ...m, ...milestoneData } as Milestone
          : m
      );
      updateProject(targetProjectId, { milestones: updatedMilestones });
    } else {
      // Create new milestone
      const newMilestone: Milestone = {
        id: milestoneData.id || crypto.randomUUID(),
        title: milestoneData.title || '',
        date: milestoneData.date || new Date().toISOString(),
        completed: milestoneData.completed || false
      };
      updateProject(targetProjectId, { milestones: [...milestones, newMilestone] });
    }
    setMilestoneDialogOpen(false);
  };

  const handleDeleteMilestone = (milestoneId: string, projectId: string) => {
    if (!canDelete()) return;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const updatedMilestones = (project.milestones || []).filter(m => m.id !== milestoneId);
    updateProject(projectId, { milestones: updatedMilestones });
  };

  const toggleMilestoneComplete = (milestoneId: string, projectId: string) => {
    if (!canEdit()) return;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const updatedMilestones = (project.milestones || []).map(m => 
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    updateProject(projectId, { milestones: updatedMilestones });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Project Timeline & Milestones
            </CardTitle>
            <div className="flex gap-2">
              {projects.map(project => (
                <Button
                  key={project.id}
                  size="sm"
                  variant="outline"
                  onClick={() => handleCreateMilestone(project.id)}
                  disabled={!canEdit()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to {project.name}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {allMilestones.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No milestones found. Add milestones to your projects to see them here.
            </p>
          ) : (
            <div className="space-y-4">
              {allMilestones.map((milestone, index) => (
                <div key={milestone.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => toggleMilestoneComplete(milestone.id, milestone.projectId)}
                      disabled={!canEdit()}
                      className="hover:scale-110 transition-transform"
                    >
                      {milestone.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <Circle className={`h-6 w-6 ${
                          isOverdue(milestone.date, milestone.completed) 
                            ? 'text-red-500' 
                            : 'text-blue-500'
                        }`} />
                      )}
                    </button>
                    {index < allMilestones.length - 1 && (
                      <div className="w-px h-8 bg-gray-200 mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${
                        milestone.completed ? 'line-through text-gray-500' : ''
                      }`}>
                        {milestone.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          style={{ borderColor: milestone.projectColor }}
                        >
                          {milestone.projectName}
                        </Badge>
                        <span className={`text-sm ${
                          isOverdue(milestone.date, milestone.completed)
                            ? 'text-red-600 font-medium'
                            : 'text-muted-foreground'
                        }`}>
                          {formatDate(milestone.date)}
                        </span>
                        {canEdit() && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditMilestone(milestone)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete() && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMilestone(milestone.id, milestone.projectId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {isOverdue(milestone.date, milestone.completed) && (
                      <Badge variant="destructive" className="mt-2">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MilestoneDialog
        open={milestoneDialogOpen}
        onOpenChange={setMilestoneDialogOpen}
        milestone={editingMilestone?.milestone}
        onSave={handleSaveMilestone}
      />
    </div>
  );
}