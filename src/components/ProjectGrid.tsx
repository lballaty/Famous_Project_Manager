// src/components/ProjectGrid.tsx - No major changes needed, ProjectCard handles locks
// The ProjectGrid component doesn't need changes since ProjectCard now handles lock indicators
// Just add one import for potential future lock-related features

import { Project } from '@/types/project';
import { ProjectCard } from './ProjectCard';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Grid, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// NEW: Optional import for future lock-related filtering
import { useLock } from '../contexts/LockContext';

interface ProjectGridProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onAddProject: () => void;
}

export const ProjectGrid = ({ projects, onProjectClick, onAddProject }: ProjectGridProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<string>('all');
  
  // NEW: Optional - access lock context for future features
  const { locks } = useLock();

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    
    // NEW: Optional filter for locked projects
    if (filter === 'locked') {
      return locks.some(lock => lock.project_id === project.id && lock.is_active);
    }
    if (filter === 'unlocked') {
      return !locks.some(lock => lock.project_id === project.id && lock.is_active);
    }
    
    return project.status === filter;
  });

  const statusCounts = {
    all: projects.length,
    planning: projects.filter(p => p.status === 'planning').length,
    'in-progress': projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    'on-hold': projects.filter(p => p.status === 'on-hold').length,
    // NEW: Optional lock-based filters
    locked: locks.filter(lock => lock.is_active).length,
    unlocked: projects.length - locks.filter(lock => lock.is_active).length,
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage and track your projects</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={onAddProject} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Badge
            key={status}
            variant={filter === status ? 'default' : 'secondary'}
            className="cursor-pointer hover:bg-blue-100 transition-colors text-xs sm:text-sm"
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All' : 
             status === 'locked' ? '🔒 Locked' :
             status === 'unlocked' ? '🔓 Unlocked' :
             status.replace('-', ' ')} ({count})
          </Badge>
        ))}
      </div>

      {/* Projects Grid - ProjectCard now handles lock indicators automatically */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
        : 'space-y-4'
      }>
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => onProjectClick(project)}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No projects found</p>
          <Button onClick={onAddProject} className="mt-4">
            Create your first project
          </Button>
        </div>
      )}
    </div>
  );
};