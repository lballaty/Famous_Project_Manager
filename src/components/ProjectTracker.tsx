import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { ProjectGrid } from './ProjectGrid';
import { ProjectDialog } from './ProjectDialog';
import { StatsCards } from './StatsCards';
import { Project } from '@/types/project';
import { toast } from '@/components/ui/use-toast';

export const ProjectTracker = () => {
  const { projects, addProject, updateProject, deleteProject } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();

  const handleAddProject = () => {
    setSelectedProject(undefined);
    setDialogOpen(true);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleSaveProject = (projectData: Omit<Project, 'id'>) => {
    if (selectedProject) {
      updateProject(selectedProject.id, projectData);
      toast({
        title: 'Project Updated',
        description: 'Project has been successfully updated.',
      });
    } else {
      addProject(projectData);
      toast({
        title: 'Project Created',
        description: 'New project has been successfully created.',
      });
    }
    setDialogOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    toast({
      title: 'Project Deleted',
      description: 'Project has been successfully deleted.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
        <div className="mb-6">
          <StatsCards projects={projects} />
        </div>
        <ProjectGrid 
          projects={projects}
          onProjectClick={handleProjectClick}
          onAddProject={handleAddProject}
          onDeleteProject={handleDeleteProject}
        />
        <ProjectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSaveProject}
          project={selectedProject}
        />
      </div>
    </div>
  );
};