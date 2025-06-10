// src/components/UserManagement.tsx
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Textarea } from './ui/textarea';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Building,
  Star,
  Activity,
  Search,
  Filter
} from 'lucide-react';
import { User, UserStats } from '../types/user';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

export function UserManagement({ users, onAddUser, onUpdateUser, onDeleteUser }: UserManagementProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    role: 'developer' as User['role'],
    status: 'active' as User['status'],
    location: '',
    timezone: '',
    workCapacity: 40,
    hourlyRate: 0,
    skills: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: ''
  });

  const resetForm = () => {
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobTitle: '',
      department: '',
      role: 'developer',
      status: 'active',
      location: '',
      timezone: '',
      workCapacity: 40,
      hourlyRate: 0,
      skills: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: ''
    });
  };

  const handleAddUser = () => {
    setEditingUser(null);
    resetForm();
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      jobTitle: user.jobTitle || '',
      department: user.department || '',
      role: user.role,
      status: user.status,
      location: user.location || '',
      timezone: user.timezone || '',
      workCapacity: user.workCapacity || 40,
      hourlyRate: user.hourlyRate || 0,
      skills: user.skills?.join(', ') || '',
      linkedinUrl: user.socialLinks?.linkedin || '',
      githubUrl: user.socialLinks?.github || '',
      portfolioUrl: user.socialLinks?.portfolio || ''
    });
    setUserDialogOpen(true);
  };

  const handleSaveUser = () => {
    const userData = {
      firstName: userForm.firstName,
      lastName: userForm.lastName,
      name: `${userForm.firstName} ${userForm.lastName}`,
      email: userForm.email,
      phone: userForm.phone || undefined,
      jobTitle: userForm.jobTitle || undefined,
      department: userForm.department || undefined,
      role: userForm.role,
      status: userForm.status,
      location: userForm.location || undefined,
      timezone: userForm.timezone || undefined,
      workCapacity: userForm.workCapacity,
      hourlyRate: userForm.hourlyRate > 0 ? userForm.hourlyRate : undefined,
      skills: userForm.skills ? userForm.skills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      socialLinks: {
        linkedin: userForm.linkedinUrl || undefined,
        github: userForm.githubUrl || undefined,
        portfolio: userForm.portfolioUrl || undefined
      },
      joinedDate: editingUser?.joinedDate || new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    if (editingUser) {
      onUpdateUser(editingUser.id, userData);
    } else {
      onAddUser(userData);
    }

    setUserDialogOpen(false);
    resetForm();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.jobTitle && user.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: User['role']) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      project_manager: 'bg-purple-100 text-purple-800',
      team_lead: 'bg-blue-100 text-blue-800',
      developer: 'bg-green-100 text-green-800',
      designer: 'bg-pink-100 text-pink-800',
      analyst: 'bg-yellow-100 text-yellow-800',
      stakeholder: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: User['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status];
  };

  const getUserInitials = (user: User) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage team members, roles, and contact information</p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="project_manager">Project Manager</SelectItem>
                <SelectItem value="team_lead">Team Lead</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="stakeholder">Stakeholder</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.jobTitle}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDeleteUser(user.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getRoleColor(user.role)}>
                    {user.role.replace('_', ' ')}
                  </Badge>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.department && (
                    <div className="flex items-center gap-2">
                      <Building className="h-3 w-3" />
                      <span>{user.department}</span>
                    </div>
                  )}
                </div>

                {user.skills && user.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {user.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information and permissions' : 'Add a new team member to the system'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="work">Work Details</TabsTrigger>
              <TabsTrigger value="contact">Contact & Links</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  placeholder="john.doe@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={userForm.role} onValueChange={(value: User['role']) => setUserForm({...userForm, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="project_manager">Project Manager</SelectItem>
                      <SelectItem value="team_lead">Team Lead</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="stakeholder">Stakeholder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={userForm.status} onValueChange={(value: User['status']) => setUserForm({...userForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="work" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={userForm.jobTitle}
                    onChange={(e) => setUserForm({...userForm, jobTitle: e.target.value})}
                    placeholder="Senior Developer"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={userForm.department}
                    onChange={(e) => setUserForm({...userForm, department: e.target.value})}
                    placeholder="Engineering"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workCapacity">Work Capacity (hours/week)</Label>
                  <Input
                    id="workCapacity"
                    type="number"
                    value={userForm.workCapacity}
                    onChange={(e) => setUserForm({...userForm, workCapacity: parseInt(e.target.value) || 40})}
                    placeholder="40"
                  />
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={userForm.hourlyRate}
                    onChange={(e) => setUserForm({...userForm, hourlyRate: parseFloat(e.target.value) || 0})}
                    placeholder="75"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={userForm.skills}
                  onChange={(e) => setUserForm({...userForm, skills: e.target.value})}
                  placeholder="React, TypeScript, Node.js, AWS"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={userForm.location}
                    onChange={(e) => setUserForm({...userForm, location: e.target.value})}
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={userForm.timezone}
                    onChange={(e) => setUserForm({...userForm, timezone: e.target.value})}
                    placeholder="America/Los_Angeles"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  value={userForm.linkedinUrl}
                  onChange={(e) => setUserForm({...userForm, linkedinUrl: e.target.value})}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>

              <div>
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  value={userForm.githubUrl}
                  onChange={(e) => setUserForm({...userForm, githubUrl: e.target.value})}
                  placeholder="https://github.com/johndoe"
                />
              </div>

              <div>
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input
                  id="portfolioUrl"
                  value={userForm.portfolioUrl}
                  onChange={(e) => setUserForm({...userForm, portfolioUrl: e.target.value})}
                  placeholder="https://johndoe.dev"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              {editingUser ? 'Update User' : 'Add User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}