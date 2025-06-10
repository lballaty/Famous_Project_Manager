import { Project } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Clock, Lock } from 'lucide-react';
import { useProjectLock, LockStatusIndicator } from './ProjectLockComponents';


interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const statusColors = {
  'planning': 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'on-hold': 'bg-gray-100 text-gray-800'
};

const priorityColors = {
  'low': 'bg-green-100 text-green-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'high': 'bg-red-100 text-red-800'
};

export const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const { lock, canEdit, isOwnLock } = useProjectLock(project.id);
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
      onClick={onClick}
      style={{ borderLeft: `4px solid ${project.color}` }}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
          <div className="flex gap-2">
            <Badge className={statusColors[project.status]}>
              {project.status.replace('-', ' ')}
            </Badge>
            <Badge className={priorityColors[project.priority]}>
              {project.priority}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{project.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(project.endDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{project.team.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};