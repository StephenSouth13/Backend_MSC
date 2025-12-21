"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Trash2, FolderOpen, Users, DollarSign, Calendar } from 'lucide-react'

interface Project {
  id: number
  title: string
  description: string
  client: string
  category: 'web' | 'mobile' | 'desktop' | 'ai' | 'blockchain'
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold'
  priority: 'low' | 'medium' | 'high'
  budget: number
  spent: number
  progress: number
  startDate: string
  endDate: string
  teamSize: number
  technologies: string[]
  manager: string
  createdAt: string
  updatedAt: string
}

interface DeleteProjectModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onDeleteProject: (projectId: number) => void
}

export function DeleteProjectModal({ project, isOpen, onClose, onDeleteProject }: DeleteProjectModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      onDeleteProject(project.id)
      onClose()
    } catch (error) {
      console.error('Error deleting project:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      web: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      mobile: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      desktop: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      ai: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      blockchain: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
    }
    return (
      <Badge className={categoryColors[category as keyof typeof categoryColors]}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Planning</Badge>
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">In Progress</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>
      case 'on-hold':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">On Hold</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">High</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Medium</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border border-white/20 dark:border-gray-700/20 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Delete Project</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            This action cannot be undone. This will permanently delete the project and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800 dark:text-red-300">
                <p className="font-medium mb-2">You are about to permanently delete:</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-4 w-4" />
                    <span className="font-medium">{project.title}</span>
                  </div>
                  <p className="text-sm">Client: {project.client}</p>
                  <div className="flex items-center space-x-2">
                    {getCategoryBadge(project.category)}
                    {getStatusBadge(project.status)}
                    {getPriorityBadge(project.priority)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Project Details:</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{project.teamSize} team members</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{new Date(project.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span>${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Manager: {project.manager}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-gray-900 dark:text-white text-sm">Technologies:</h5>
              <div className="flex flex-wrap gap-1">
                {project.technologies.map((tech, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Data that will be deleted:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Project timeline and milestones</li>
              <li>• All project files and documentation</li>
              <li>• Team assignments and roles</li>
              <li>• Budget tracking and expense records</li>
              <li>• Client communications and notes</li>
              <li>• Progress reports and analytics</li>
            </ul>
          </div>

          {project.status === 'in-progress' && project.progress > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                  Warning: This project is currently in progress with {project.progress}% completion. Consider archiving instead.
                </p>
              </div>
            </div>
          )}

          {project.spent > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>${project.spent.toLocaleString()}</strong> has been spent on this project. Financial records will be preserved in accounting.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>Deleting...</>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}