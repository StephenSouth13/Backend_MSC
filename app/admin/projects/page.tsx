"use client"

import { useState } from 'react'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { ProjectsTable } from '@/components/admin/projects/ProjectsTable'
import { CreateProjectModal } from '@/components/admin/projects/CreateProjectModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, FolderOpen, Briefcase, Clock, DollarSign } from 'lucide-react'

// Sample project data for demo
const initialProjects = [
  {
    id: 1,
    title: 'E-commerce Platform Redesign',
    description: 'Complete redesign of the company e-commerce platform with modern UI/UX and enhanced functionality',
    client: 'TechCorp Solutions',
    category: 'web' as const,
    status: 'in-progress' as const,
    priority: 'high' as const,
    budget: 85000,
    spent: 45000,
    progress: 65,
    startDate: '2024-06-01',
    endDate: '2024-12-31',
    teamSize: 8,
    technologies: ['React', 'Next.js', 'TypeScript', 'Stripe'],
    manager: 'John Doe',
    createdAt: '2024-05-15',
    updatedAt: '2024-09-18'
  },
  {
    id: 2,
    title: 'Mobile Banking App',
    description: 'Secure mobile banking application with biometric authentication and real-time transactions',
    client: 'First National Bank',
    category: 'mobile' as const,
    status: 'completed' as const,
    priority: 'high' as const,
    budget: 120000,
    spent: 118000,
    progress: 100,
    startDate: '2024-01-15',
    endDate: '2024-08-30',
    teamSize: 12,
    technologies: ['React Native', 'Node.js', 'MongoDB', 'AWS'],
    manager: 'Jane Smith',
    createdAt: '2024-01-10',
    updatedAt: '2024-09-01'
  },
  {
    id: 3,
    title: 'Data Analytics Dashboard',
    description: 'Real-time analytics dashboard for business intelligence and reporting',
    client: 'Analytics Inc.',
    category: 'web' as const,
    status: 'planning' as const,
    priority: 'medium' as const,
    budget: 65000,
    spent: 5000,
    progress: 10,
    startDate: '2024-10-01',
    endDate: '2025-03-31',
    teamSize: 6,
    technologies: ['Vue.js', 'D3.js', 'Python', 'PostgreSQL'],
    manager: 'Mike Johnson',
    createdAt: '2024-09-10',
    updatedAt: '2024-09-20'
  },
  {
    id: 4,
    title: 'Desktop Automation Tool',
    description: 'Cross-platform desktop application for business process automation',
    client: 'Automation Systems',
    category: 'desktop' as const,
    status: 'on-hold' as const,
    priority: 'low' as const,
    budget: 45000,
    spent: 12000,
    progress: 25,
    startDate: '2024-07-01',
    endDate: '2024-11-30',
    teamSize: 4,
    technologies: ['Electron', 'TypeScript', 'SQLite'],
    manager: 'Sarah Wilson',
    createdAt: '2024-06-20',
    updatedAt: '2024-08-15'
  },
  {
    id: 5,
    title: 'AI Chatbot Integration',
    description: 'Intelligent chatbot system with natural language processing for customer support',
    client: 'Support Solutions',
    category: 'ai' as const,
    status: 'in-progress' as const,
    priority: 'high' as const,
    budget: 75000,
    spent: 28000,
    progress: 40,
    startDate: '2024-08-01',
    endDate: '2025-01-31',
    teamSize: 5,
    technologies: ['Python', 'TensorFlow', 'NLP', 'FastAPI'],
    manager: 'David Brown',
    createdAt: '2024-07-25',
    updatedAt: '2024-09-19'
  },
  {
    id: 6,
    title: 'Blockchain Voting System',
    description: 'Secure blockchain-based voting platform for organizational decision making',
    client: 'Democratic Tech',
    category: 'blockchain' as const,
    status: 'completed' as const,
    priority: 'medium' as const,
    budget: 95000,
    spent: 92000,
    progress: 100,
    startDate: '2024-03-01',
    endDate: '2024-09-15',
    teamSize: 7,
    technologies: ['Solidity', 'Web3.js', 'React', 'IPFS'],
    manager: 'Lisa Garcia',
    createdAt: '2024-02-15',
    updatedAt: '2024-09-16'
  }
]

function ProjectsManagementContent() {
  const [projects, setProjects] = useState(initialProjects)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.manager.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateProject = (projectData: any) => {
    const nextId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1
    const newProject = {
      id: nextId,
      ...projectData,
      spent: 0,
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }
    setProjects([...projects, newProject])
    setIsCreateModalOpen(false)
  }

  const handleUpdateProject = (updatedProject: any) => {
    setProjects(projects.map(project => 
      project.id === updatedProject.id ? { ...updatedProject, updatedAt: new Date().toISOString().split('T')[0] } : project
    ))
  }

  const handleDeleteProject = (projectId: number) => {
    setProjects(projects.filter(project => project.id !== projectId))
  }

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    planning: projects.filter(p => p.status === 'planning').length,
    onHold: projects.filter(p => p.status === 'on-hold').length,
    totalBudget: projects.reduce((acc, project) => acc + project.budget, 0),
    totalSpent: projects.reduce((acc, project) => acc + project.spent, 0),
    avgProgress: projects.length > 0 ? Math.round(projects.reduce((acc, project) => acc + project.progress, 0) / projects.length) : 0
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track and manage all your client projects, budgets, and team assignments.
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20 md:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{projectStats.total}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-xl font-bold text-green-600">{projectStats.active}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-xl font-bold text-blue-600">{projectStats.completed}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Planning</p>
              <p className="text-xl font-bold text-yellow-600">{projectStats.planning}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">On Hold</p>
              <p className="text-xl font-bold text-red-600">{projectStats.onHold}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
              <p className="text-xl font-bold text-purple-600">${(projectStats.totalBudget / 1000).toFixed(0)}K</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
              <p className="text-xl font-bold text-orange-600">{projectStats.avgProgress}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Project Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects by title, client, category, status, or manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{filteredProjects.length} projects</Badge>
            </div>
          </div>

          <ProjectsTable 
            projects={filteredProjects}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
          />
        </CardContent>
      </Card>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  )
}

export default function ProjectsManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'editor']}>
      <ProjectsManagementContent />
    </ProtectedRoute>
  )
}