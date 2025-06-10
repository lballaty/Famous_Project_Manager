// src/data/seedData.ts - Updated with new projects
import { Project, Task, Milestone, User } from '../types/project';

// Sample users for assignment
export const sampleUsers: User[] = [
  { id: 'user-1', email: 'john.doe@company.com', name: 'John Doe' },
  { id: 'user-2', email: 'jane.smith@company.com', name: 'Jane Smith' },
  { id: 'user-3', email: 'mike.wilson@company.com', name: 'Mike Wilson' },
  { id: 'user-4', email: 'sarah.johnson@company.com', name: 'Sarah Johnson' },
  { id: 'user-5', email: 'alex.brown@company.com', name: 'Alex Brown' },
  { id: 'user-6', email: 'emily.chen@company.com', name: 'Emily Chen' },
  { id: 'user-7', email: 'david.kumar@company.com', name: 'David Kumar' },
  { id: 'user-8', email: 'lisa.martinez@company.com', name: 'Lisa Martinez' },
];

// Sample milestones (including new projects)
export const sampleMilestones: Milestone[] = [
  // Original project milestones
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
  },

  // AI Driven 5G Enterprise - 16 week milestones
  {
    id: 'milestone-ai-1',
    title: 'Project Initiation & Stakeholder Alignment',
    date: '2025-01-06T10:00:00.000Z',
    completed: true,
    projectId: 'project-4'
  },
  {
    id: 'milestone-ai-2',
    title: '5G Infrastructure Assessment Complete',
    date: '2025-01-13T10:00:00.000Z',
    completed: true,
    projectId: 'project-4'
  },
  {
    id: 'milestone-ai-3',
    title: 'AI Model Architecture Design',
    date: '2025-01-20T10:00:00.000Z',
    completed: true,
    projectId: 'project-4'
  },
  {
    id: 'milestone-ai-4',
    title: 'Core Platform Development Started',
    date: '2025-01-27T10:00:00.000Z',
    completed: false,
    projectId: 'project-4'
  },
  {
    id: 'milestone-ai-5',
    title: 'AI Training Pipeline Established',
    date: '2025-02-03T10:00:00.000Z',
    completed: false,
    projectId: 'project-4'
  },
  {
    id: 'milestone-ai-6',
    title: '5G Edge Computing Integration',
    date: '2025-02-10T10:00:00.000Z',
    completed: false,
    projectId: 'project-4'
  },
  {
    id: 'milestone-ai-7',
    title: 'Network Slicing Implementation',
    date: '2025-02-17T10:00:00.000Z',
    completed: false,
    projectId: 'project-4'
  },
  {
    id: 'milestone-ai-8',
    title: 'AI Model Training Complete',
    date: '2025-02-24T10:00:00.000Z',
    completed: false,
    projectId: 'project-4'
  },
  {
    id: 'milestone-ai-9',
    title: 'Alpha Testing Environment Ready',
    date: '2025-03-03T10:00:00.000Z',
    completed: false,
    projectId: 'project-4'
  },
  {
    id: 'milestone-ai-10',
    title: 'Security Framework Implementation',
    date: '2025-03-10T10:00:00.000Z',
    completed: false,
    projectId: 'project-4'
  },
  {
    id: 'milestone-ai-11',
    title: 'Enterprise API Development',
    date: '2025-03-17T10:00:00.000Z',
    completed: false,
    projectId: 'project-4'
  },
  {
    id: 'milestone-ai-12',
    title: 'Beta Release to Select Customers',
    date: '2025-03-24T10:00:00.000Z',
    completed: false,
    projectId: 'project-4'
  },
  {
    id: 'milestone-ai-13',
    title: 'Performance Optimization Complete',
    date: '2025-03-31T10:00:00.000Z',
    completed: false,
    projectId: 'project-4'
  },
  {
    id: 'milestone-ai-14',
    title: 'Production Infrastructure Deployment',
    date: '2025-04-07T10:00:00.000Z',
    completed: false,
    projectId: 'project-4'
  },
  {
    id: 'milestone-ai-15',
    title: 'Commercial Launch Preparation',
    date: '2025-04-14T10:00:00.000Z',
    completed: false,
    projectId: 'project-4'
  },
  {
    id: 'milestone-ai-16',
    title: 'Full Commercial Launch',
    date: '2025-04-21T10:00:00.000Z',
    completed: false,
    projectId: 'project-4'
  },

  // Standard Compliance As a Service - 16 week milestones
  {
    id: 'milestone-comp-1',
    title: 'Compliance Framework Analysis',
    date: '2025-01-08T10:00:00.000Z',
    completed: true,
    projectId: 'project-5'
  },
  {
    id: 'milestone-comp-2',
    title: 'Multi-Standard Requirements Mapping',
    date: '2025-01-15T10:00:00.000Z',
    completed: true,
    projectId: 'project-5'
  },
  {
    id: 'milestone-comp-3',
    title: 'Core Platform Architecture Design',
    date: '2025-01-22T10:00:00.000Z',
    completed: false,
    projectId: 'project-5'
  },
  {
    id: 'milestone-comp-4',
    title: 'Database Schema & Compliance Rules Engine',
    date: '2025-01-29T10:00:00.000Z',
    completed: false,
    projectId: 'project-5'
  },
  {
    id: 'milestone-comp-5',
    title: 'GDPR Compliance Module Development',
    date: '2025-02-05T10:00:00.000Z',
    completed: false,
    projectId: 'project-5'
  },
  {
    id: 'milestone-comp-6',
    title: 'ISO 27001 Assessment Tools',
    date: '2025-02-12T10:00:00.000Z',
    completed: false,
    projectId: 'project-5'
  },
  {
    id: 'milestone-comp-7',
    title: 'SOX Compliance Automation',
    date: '2025-02-19T10:00:00.000Z',
    completed: false,
    projectId: 'project-5'
  },
  {
    id: 'milestone-comp-8',
    title: 'Risk Assessment Dashboard',
    date: '2025-02-26T10:00:00.000Z',
    completed: false,
    projectId: 'project-5'
  },
  {
    id: 'milestone-comp-9',
    title: 'Automated Reporting Engine',
    date: '2025-03-05T10:00:00.000Z',
    completed: false,
    projectId: 'project-5'
  },
  {
    id: 'milestone-comp-10',
    title: 'Client Portal & Self-Service Tools',
    date: '2025-03-12T10:00:00.000Z',
    completed: false,
    projectId: 'project-5'
  },
  {
    id: 'milestone-comp-11',
    title: 'Integration APIs & Third-party Connectors',
    date: '2025-03-19T10:00:00.000Z',
    completed: false,
    projectId: 'project-5'
  },
  {
    id: 'milestone-comp-12',
    title: 'Pilot Customer Implementation',
    date: '2025-03-26T10:00:00.000Z',
    completed: false,
    projectId: 'project-5'
  },
  {
    id: 'milestone-comp-13',
    title: 'Security Audit & Penetration Testing',
    date: '2025-04-02T10:00:00.000Z',
    completed: false,
    projectId: 'project-5'
  },
  {
    id: 'milestone-comp-14',
    title: 'Compliance Certification Achieved',
    date: '2025-04-09T10:00:00.000Z',
    completed: false,
    projectId: 'project-5'
  },
  {
    id: 'milestone-comp-15',
    title: 'Production Platform Deployment',
    date: '2025-04-16T10:00:00.000Z',
    completed: false,
    projectId: 'project-5'
  },
  {
    id: 'milestone-comp-16',
    title: 'Service Launch & Customer Onboarding',
    date: '2025-04-23T10:00:00.000Z',
    completed: false,
    projectId: 'project-5'
  }
];

// Sample tasks (including new projects)
export const sampleTasks: Task[] = [
  // Original project tasks
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
  },

  // AI Driven 5G Enterprise tasks
  {
    id: 'task-ai-1',
    title: '5G Network Infrastructure Assessment',
    description: 'Evaluate existing 5G infrastructure capabilities and identify enhancement requirements',
    status: 'completed',
    assignee: 'Emily Chen',
    dueDate: '2025-01-12T23:59:59.000Z',
    priority: 'high',
    projectId: 'project-4',
    dependencies: []
  },
  {
    id: 'task-ai-2',
    title: 'AI Model Architecture Design',
    description: 'Design neural network architecture for 5G network optimization and predictive analytics',
    status: 'in-progress',
    assignee: 'David Kumar',
    dueDate: '2025-01-25T23:59:59.000Z',
    priority: 'high',
    projectId: 'project-4',
    dependencies: ['task-ai-1']
  },
  {
    id: 'task-ai-3',
    title: 'Edge Computing Integration Framework',
    description: 'Develop framework for deploying AI models on 5G edge computing nodes',
    status: 'todo',
    assignee: 'Lisa Martinez',
    dueDate: '2025-02-08T23:59:59.000Z',
    priority: 'high',
    projectId: 'project-4',
    dependencies: ['task-ai-2']
  },
  {
    id: 'task-ai-4',
    title: 'Network Slicing Automation',
    description: 'Implement AI-driven dynamic network slicing for enterprise customers',
    status: 'todo',
    assignee: 'Mike Wilson',
    dueDate: '2025-02-20T23:59:59.000Z',
    priority: 'medium',
    projectId: 'project-4',
    dependencies: ['task-ai-3']
  },
  {
    id: 'task-ai-5',
    title: 'Real-time Analytics Dashboard',
    description: 'Build enterprise dashboard for real-time 5G network performance and AI insights',
    status: 'todo',
    assignee: 'Jane Smith',
    dueDate: '2025-03-15T23:59:59.000Z',
    priority: 'medium',
    projectId: 'project-4',
    dependencies: ['task-ai-2']
  },
  {
    id: 'task-ai-6',
    title: 'Security and Privacy Framework',
    description: 'Implement zero-trust security model for AI-driven 5G enterprise solutions',
    status: 'todo',
    assignee: 'Alex Brown',
    dueDate: '2025-03-10T23:59:59.000Z',
    priority: 'high',
    projectId: 'project-4',
    dependencies: ['task-ai-3']
  },

  // Standard Compliance As a Service tasks
  {
    id: 'task-comp-1',
    title: 'Multi-Standard Compliance Framework Analysis',
    description: 'Analyze GDPR, ISO 27001, SOX, HIPAA, and other major compliance frameworks',
    status: 'completed',
    assignee: 'Sarah Johnson',
    dueDate: '2025-01-20T23:59:59.000Z',
    priority: 'high',
    projectId: 'project-5',
    dependencies: []
  },
  {
    id: 'task-comp-2',
    title: 'Compliance Rules Engine Development',
    description: 'Build configurable rules engine for automated compliance checking across standards',
    status: 'in-progress',
    assignee: 'Emily Chen',
    dueDate: '2025-02-05T23:59:59.000Z',
    priority: 'high',
    projectId: 'project-5',
    dependencies: ['task-comp-1']
  },
  {
    id: 'task-comp-3',
    title: 'GDPR Automated Assessment Tools',
    description: 'Develop automated tools for GDPR compliance assessment and gap analysis',
    status: 'todo',
    assignee: 'David Kumar',
    dueDate: '2025-02-10T23:59:59.000Z',
    priority: 'high',
    projectId: 'project-5',
    dependencies: ['task-comp-2']
  },
  {
    id: 'task-comp-4',
    title: 'ISO 27001 Control Implementation Tracker',
    description: 'Build system to track and manage ISO 27001 control implementation status',
    status: 'todo',
    assignee: 'Lisa Martinez',
    dueDate: '2025-02-15T23:59:59.000Z',
    priority: 'medium',
    projectId: 'project-5',
    dependencies: ['task-comp-2']
  },
  {
    id: 'task-comp-5',
    title: 'Risk Assessment Automation Platform',
    description: 'Create AI-powered risk assessment platform with predictive analytics',
    status: 'todo',
    assignee: 'John Doe',
    dueDate: '2025-02-28T23:59:59.000Z',
    priority: 'high',
    projectId: 'project-5',
    dependencies: ['task-comp-2']
  },
  {
    id: 'task-comp-6',
    title: 'Client Self-Service Portal',
    description: 'Develop web portal for clients to manage their compliance programs independently',
    status: 'todo',
    assignee: 'Jane Smith',
    dueDate: '2025-03-15T23:59:59.000Z',
    priority: 'medium',
    projectId: 'project-5',
    dependencies: ['task-comp-3', 'task-comp-4']
  },
  {
    id: 'task-comp-7',
    title: 'Third-party Integration APIs',
    description: 'Build APIs for integrating with existing enterprise security and compliance tools',
    status: 'todo',
    assignee: 'Alex Brown',
    dueDate: '2025-03-20T23:59:59.000Z',
    priority: 'medium',
    projectId: 'project-5',
    dependencies: ['task-comp-5']
  }
];

// Sample projects (including new ones)
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
  },
  {
    id: 'project-4',
    name: 'AI Driven 5G Enterprise',
    description: 'Next-generation AI-powered 5G enterprise solution leveraging edge computing, network slicing, and machine learning for optimized enterprise connectivity. Features include predictive network optimization, automated resource allocation, and real-time performance analytics.',
    status: 'in-progress',
    priority: 'high',
    startDate: '2025-01-06T00:00:00.000Z',
    endDate: '2025-04-21T23:59:59.000Z',
    progress: 20,
    tasks: sampleTasks.filter(task => task.projectId === 'project-4'),
    team: ['Emily Chen', 'David Kumar', 'Lisa Martinez', 'Mike Wilson', 'Jane Smith', 'Alex Brown'],
    color: '#8B5CF6',
    milestones: sampleMilestones.filter(milestone => milestone.projectId === 'project-4'),
    dependencies: []
  },
  {
    id: 'project-5',
    name: 'Standard Compliance As a Service',
    description: 'Comprehensive cloud-based compliance management platform supporting multiple standards including GDPR, ISO 27001, SOX, HIPAA, and PCI DSS. Features automated assessment tools, risk management, audit trails, and real-time compliance monitoring with AI-powered gap analysis.',
    status: 'planning',
    priority: 'high',
    startDate: '2025-01-08T00:00:00.000Z',
    endDate: '2025-04-23T23:59:59.000Z',
    progress: 12,
    tasks: sampleTasks.filter(task => task.projectId === 'project-5'),
    team: ['Sarah Johnson', 'Emily Chen', 'David Kumar', 'Lisa Martinez', 'John Doe', 'Jane Smith', 'Alex Brown'],
    color: '#EF4444',
    milestones: sampleMilestones.filter(milestone => milestone.projectId === 'project-5'),
    dependencies: []
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