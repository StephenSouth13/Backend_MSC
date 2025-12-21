"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Edit3 } from 'lucide-react'

const editProjectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  client: z.string().min(2, 'Client name is required'),
  category: z.enum(['web', 'mobile', 'desktop', 'ai', 'blockchain'], {
    required_error: 'Please select a category',
  }),
  status: z.enum(['planning', 'in-progress', 'completed', 'on-hold'], {
    required_error: 'Please select a status',
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select a priority level',
  }),
  budget: z.number().min(0, 'Budget must be 0 or greater'),
  spent: z.number().min(0, 'Spent amount must be 0 or greater'),
  progress: z.number().min(0).max(100, 'Progress must be between 0 and 100'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  teamSize: z.number().min(1, 'Team size must be at least 1'),
  technologies: z.string().min(1, 'At least one technology is required'),
  manager: z.string().min(2, 'Project manager name is required'),
})

type EditProjectFormData = z.infer<typeof editProjectSchema>

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

interface EditProjectModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onUpdateProject: (projectData: Project) => void
}

export function EditProjectModal({ project, isOpen, onClose, onUpdateProject }: EditProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      title: project.title,
      description: project.description,
      client: project.client,
      category: project.category,
      status: project.status,
      priority: project.priority,
      budget: project.budget,
      spent: project.spent,
      progress: project.progress,
      startDate: project.startDate,
      endDate: project.endDate,
      teamSize: project.teamSize,
      technologies: project.technologies.join(', '),
      manager: project.manager,
    },
  })

  const watchedProgress = watch('progress')

  // Update form when project changes
  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        description: project.description,
        client: project.client,
        category: project.category,
        status: project.status,
        priority: project.priority,
        budget: project.budget,
        spent: project.spent,
        progress: project.progress,
        startDate: project.startDate,
        endDate: project.endDate,
        teamSize: project.teamSize,
        technologies: project.technologies.join(', '),
        manager: project.manager,
      })
    }
  }, [project, reset])

  const onSubmit = async (data: EditProjectFormData) => {
    setIsSubmitting(true)
    try {
      const updatedProject = {
        ...project,
        ...data,
        technologies: data.technologies.split(',').map(tech => tech.trim())
      }
      onUpdateProject(updatedProject)
      onClose()
    } catch (error) {
      console.error('Error updating project:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border border-white/20 dark:border-gray-700/20 sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Edit3 className="h-5 w-5" />
            <span>Edit Project</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title" className="text-gray-900 dark:text-white">
                Project Title
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter project title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="text-gray-900 dark:text-white">
                Description
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter project description"
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client" className="text-gray-900 dark:text-white">
                Client Name
              </Label>
              <Input
                id="client"
                {...register('client')}
                placeholder="Client or company name"
                className={errors.client ? 'border-red-500' : ''}
              />
              {errors.client && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.client.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager" className="text-gray-900 dark:text-white">
                Project Manager
              </Label>
              <Input
                id="manager"
                {...register('manager')}
                placeholder="Project manager name"
                className={errors.manager ? 'border-red-500' : ''}
              />
              {errors.manager && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.manager.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-900 dark:text-white">
                Category
              </Label>
              <Select 
                onValueChange={(value) => setValue('category', value as any)}
                defaultValue={project.category}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95">
                  <SelectItem value="web">Web Development</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                  <SelectItem value="desktop">Desktop Application</SelectItem>
                  <SelectItem value="ai">AI/Machine Learning</SelectItem>
                  <SelectItem value="blockchain">Blockchain</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-gray-900 dark:text-white">
                Priority Level
              </Label>
              <Select 
                onValueChange={(value) => setValue('priority', value as any)}
                defaultValue={project.priority}
              >
                <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.priority.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-900 dark:text-white">
                Status
              </Label>
              <Select 
                onValueChange={(value) => setValue('status', value as any)}
                defaultValue={project.status}
              >
                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95">
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget" className="text-gray-900 dark:text-white">
                Budget ($)
              </Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="1000"
                {...register('budget', { valueAsNumber: true })}
                placeholder="0"
                className={errors.budget ? 'border-red-500' : ''}
              />
              {errors.budget && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.budget.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="spent" className="text-gray-900 dark:text-white">
                Amount Spent ($)
              </Label>
              <Input
                id="spent"
                type="number"
                min="0"
                step="1000"
                {...register('spent', { valueAsNumber: true })}
                placeholder="0"
                className={errors.spent ? 'border-red-500' : ''}
              />
              {errors.spent && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.spent.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress" className="text-gray-900 dark:text-white">
                Progress (%)
              </Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                {...register('progress', { valueAsNumber: true })}
                className={errors.progress ? 'border-red-500' : ''}
              />
              <Progress value={watchedProgress || 0} className="h-2" />
              {errors.progress && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.progress.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamSize" className="text-gray-900 dark:text-white">
                Team Size
              </Label>
              <Input
                id="teamSize"
                type="number"
                min="1"
                {...register('teamSize', { valueAsNumber: true })}
                placeholder="1"
                className={errors.teamSize ? 'border-red-500' : ''}
              />
              {errors.teamSize && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.teamSize.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-gray-900 dark:text-white">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-gray-900 dark:text-white">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.endDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="technologies" className="text-gray-900 dark:text-white">
                Technologies
              </Label>
              <Input
                id="technologies"
                {...register('technologies')}
                placeholder="React, Node.js, PostgreSQL (comma separated)"
                className={errors.technologies ? 'border-red-500' : ''}
              />
              {errors.technologies && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.technologies.message}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Separate multiple technologies with commas
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Project ID:</span> #{project.id}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Created:</span> {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>

          <DialogFooter className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {isSubmitting ? (
                <>Updating...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Project
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}