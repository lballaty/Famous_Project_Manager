// src/data/seedData.ts
import { Project, Task, Milestone, User } from '../types/project';

// Sample users for assignment
export const sampleUsers: User[] = [
  { id: 'user-1', email: 'john.doe@company.com', name: 'John Doe' },
  { id: 'user-2', email: 'jane.smith@company.com', name: 'Jane Smith' },
  { id: 'user-3', email: 'mike.wilson@company.com', name: 'Mike Wilson' },
  { id: 'user-4', email: 'sarah.johnson@company.com', name: 'Sarah Johnson' },
  { id: 'user-5', email: 'alex.brown@company.com', name: 'Alex Brown' },
];

// Sample milestones
export const sampleMilestones: Milestone[] = [
  {
    id: 'milestone-1',
    title: 'Project Kickoff',
    date: '2024-12-01T10:00:00.000Z',
    completed: true,
    projectId: 'project-1'
  },
  {
    id: 'milestone-2',
    title: 'MVP Release',
    date: '2025-01-15T10:00:00.000Z',
    completed: false,
    projectId: 'project-1'
  },
  {
    id: 'milestone-3',
    title: 'Beta Testing Complete',
    date: '2025-02-01T10:00:00.000Z',
    completed: false,
    projectId: 'project-1'
  },
  {
    id: 'milestone-4',
    title: 'Requirements Gathering',
    date: '2024-11-15T10:00:00.000Z',
    completed: true,
    projectId: 'project-2'
  },
  {
    id: 'milestone-5',
    title: 'Infrastructure Setup',
    date: '2025-01-30T10:00:00.000Z',
    completed: false,
    projectId: 'project-2'
  }
];

// Sample tasks
export const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Setup development environment',
    description: 'Configure local development setup with all necessary tools and dependencies',
    status: 'completed',
    assignee: 'John Doe',
    dueDate: '2024-12-05T23:59:59.000Z',
    priority: 'high',
    projectId: 'project-1',
    dependencies: []
  },
  {
    id: 'task-2',
    title: 'Design user interface mockups',
    description: 'Create wireframes and high-fidelity mockups for the main user interfaces',
    status: 'in-progress',
    assignee: 'Jane Smith',
    dueDate: '2025-01-10T23:59:59.000Z',
    priority: 'high',
    projectId: 'project-1',
    dependencies: ['task-1']
  },
  {
    id: 'task-3',
    title: 'Implement authentication system',
    description: 'Build secure user authentication with login, signup, and password reset',
    status: 'todo',
    assignee: 'Mike Wilson',
    dueDate: '2025-01-20T23:59:59.000Z',
    priority: 'medium',
    projectId: 'project-1',
    dependencies: ['task-1']
  },
  {
    id: 'task-4',
    title: 'Database schema design',
    description: 'Design and implement the database schema for all entities',
    status: 'in-progress',
    assignee: 'Sarah Johnson',
    dueDate: '2025-01-15T23:59:59.000Z',
    priority: 'high',
    projectId: 'project-1',
    dependencies: ['task-1']
  },
  {
    id: 'task-5',
    title: 'API development',
    description: 'Develop RESTful API endpoints for all core functionalities',
    status: 'todo',
    assignee: 'Alex Brown',
    dueDate: '2025-02-01T23:59:59.000Z',
    priority: 'medium',
    projectId: 'project-1',
    dependencies: ['task-4']
  },
  {
    id: 'task-6',
    title: 'Market research analysis',
    description: 'Conduct comprehensive market research and competitor analysis',
    status: 'completed',
    assignee: 'Jane Smith',
    dueDate: '2024-11-30T23:59:59.000Z',
    priority: 'medium',
    projectId: 'project-2',
    dependencies: []
  },
  {
    id: 'task-7',
    title: 'Technical architecture planning',
    description: 'Define system architecture and technology stack decisions',
    status: 'in-progress',
    assignee: 'Mike Wilson',
    dueDate: '2025-01-25T23:59:59.000Z',
    priority: 'high',
    projectId: 'project-2',
    dependencies: ['task-6']
  },
  {
    id: 'task-8',
    title: 'Content management system setup',
    description: 'Configure and customize the content management system',
    status: 'todo',
    assignee: 'Sarah Johnson',
    dueDate: '2025-02-15T23:59:59.000Z',
    priority: 'low',
    projectId: 'project-3',
    dependencies: []
  }
];

// Sample projects
export const sampleProjects: Project[] = [
  {
    id: 'project-1',
    name: 'E-commerce Platform',
    description: 'A modern e-commerce platform with advanced features including AI-powered recommendations, real-time inventory management, and multi-vendor support.',
    status: 'in-progress',
    priority: 'high',
    startDate: '2024-12-01T00:00:00.000Z',
    endDate: '2025-03-15T23:59:59.000Z',
    progress: 35,
    tasks: sampleTasks.filter(task => task.projectId === 'project-1'),
    team: ['John Doe', 'Jane Smith', 'Mike Wilson', 'Sarah Johnson', 'Alex Brown'],
    color: '#3B82F6',
    milestones: sampleMilestones.filter(milestone => milestone.projectId === 'project-1'),
    dependencies: []
  },
  {
    id: 'project-2',
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application for iOS and Android with real-time notifications, offline capabilities, and seamless user experience.',
    status: 'planning',
    priority: 'medium',
    startDate: '2024-11-15T00:00:00.000Z',
    endDate: '2025-04-30T23:59:59.000Z',
    progress: 15,
    tasks: sampleTasks.filter(task => task.projectId === 'project-2'),
    team: ['Jane Smith', 'Mike Wilson', 'Alex Brown'],
    color: '#10B981',
    milestones: sampleMilestones.filter(milestone => milestone.projectId === 'project-2'),
    dependencies: []
  },
  {
    id: 'project-3',
    name: 'Company Website Redesign',
    description: 'Complete overhaul of the company website with modern design, improved SEO, faster loading times, and better mobile responsiveness.',
    status: 'on-hold',
    priority: 'low',
    startDate: '2025-02-01T00:00:00.000Z',
    endDate: '2025-05-01T23:59:59.000Z',
    progress: 5,
    tasks: sampleTasks.filter(task => task.projectId === 'project-3'),
    team: ['Sarah Johnson', 'Alex Brown'],
    color: '#F59E0B',
    milestones: [],
    dependencies: ['project-1']
  }
];

// Full seed data export
export const seedData = {
  projects: sampleProjects,
  tasks: sampleTasks,
  milestones: sampleMilestones,
  users: sampleUsers
};

// Utility function to generate additional sample data
export const generateMoreProjects = (count: number): Project[] => {
  const projectNames = [
    'AI Chatbot Integration',
    'Customer Analytics Dashboard',
    'Inventory Management System',
    'Social Media Platform',
    'Learning Management System',
    'IoT Device Monitor',
    'Blockchain Voting System',
    'Weather Prediction App',
    'Video Streaming Service',
    'Online Banking Platform'
  ];

  const descriptions = [
    'Advanced system with cutting-edge technology and modern architecture',
    'Comprehensive solution with real-time analytics and reporting capabilities',
    'Scalable platform designed for enterprise-level performance',
    'User-friendly application with intuitive interface and seamless experience',
    'Innovative solution leveraging latest industry best practices'
  ];

  const statuses: Array<'planning' | 'in-progress' | 'completed' | 'on-hold'> = 
    ['planning', 'in-progress', 'completed', 'on-hold'];
  
  const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
  
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return Array.from({ length: count }, (_, index) => ({
    id: `generated-project-${index + 1}`,
    name: projectNames[index % projectNames.length],
    description: descriptions[index % descriptions.length],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    progress: Math.floor(Math.random() * 100),
    tasks: [],
    team: sampleUsers.slice(0, Math.floor(Math.random() * 4) + 2).map(user => user.name),
    color: colors[Math.floor(Math.random() * colors.length)],
    milestones: [],
    dependencies: []
  }));
};
