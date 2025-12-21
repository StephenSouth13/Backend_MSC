"use client"

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  Eye,
  DollarSign,
  Users,
  Calendar,
  Briefcase
} from 'lucide-react'
import { EditProjectModal } from './EditProjectModal'
import { DeleteProjectModal } from './DeleteProjectModal'

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

interface ProjectsTableProps {
  projects: Project[]
  onUpdateProject: (project: Project) => void
  onDeleteProject: (projectId: number) => void
}

const columnHelper = createColumnHelper<Project>()

export function ProjectsTable({ projects, onUpdateProject, onDeleteProject }: ProjectsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)

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

  const columns = [
    columnHelper.accessor('title', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0 font-medium"
        >
          Project
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => (
        <div className="flex flex-col max-w-sm">
          <span className="font-medium text-gray-900 dark:text-white truncate">
            {info.getValue()}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {info.row.original.client}
          </span>
        </div>
      ),
    }),

    columnHelper.accessor('category', {
      header: 'Category',
      cell: (info) => getCategoryBadge(info.getValue()),
      filterFn: 'equals',
    }),

    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => getStatusBadge(info.getValue()),
      filterFn: 'equals',
    }),

    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: (info) => getPriorityBadge(info.getValue()),
      filterFn: 'equals',
    }),

    columnHelper.display({
      header: 'Progress & Budget',
      cell: (info) => {
        const project = info.row.original
        const budgetUsed = (project.spent / project.budget) * 100
        return (
          <div className="space-y-2 min-w-40">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                <DollarSign className="h-3 w-3" />
                <span>${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )
      },
    }),

    columnHelper.display({
      header: 'Team & Timeline',
      cell: (info) => {
        const project = info.row.original
        return (
          <div className="text-sm space-y-1 min-w-32">
            <div className="flex items-center space-x-1 text-gray-900 dark:text-white">
              <Users className="h-3 w-3" />
              <span>{project.teamSize} members</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>{new Date(project.endDate).toLocaleDateString()}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {project.manager}
            </div>
          </div>
        )
      },
    }),

    columnHelper.display({
      header: 'Technologies',
      cell: (info) => {
        const technologies = info.row.original.technologies
        return (
          <div className="flex flex-wrap gap-1 max-w-32">
            {technologies.slice(0, 2).map((tech, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {technologies.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{technologies.length - 2}
              </Badge>
            )}
          </div>
        )
      },
    }),

    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95">
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View Project
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setEditingProject(info.row.original)}
              className="cursor-pointer"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                const newStatus = info.row.original.status === 'on-hold' ? 'in-progress' : 'on-hold'
                const updatedProject = {
                  ...info.row.original,
                  status: newStatus as 'planning' | 'in-progress' | 'completed' | 'on-hold'
                }
                onUpdateProject(updatedProject)
              }}
              className="cursor-pointer"
            >
              {info.row.original.status === 'on-hold' ? (
                <>Resume Project</>
              ) : (
                <>Put on Hold</>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setDeletingProject(info.row.original)}
              className="cursor-pointer text-red-600 dark:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ]

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-white/20 dark:border-gray-700/20 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow 
                key={headerGroup.id}
                className="border-white/20 dark:border-gray-700/20 bg-gray-50/50 dark:bg-gray-900/50"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-gray-900 dark:text-white">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-white/20 dark:border-gray-700/20 hover:bg-gray-50/50 dark:hover:bg-gray-900/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No projects found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modals */}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onUpdateProject={onUpdateProject}
        />
      )}

      {deletingProject && (
        <DeleteProjectModal
          project={deletingProject}
          isOpen={!!deletingProject}
          onClose={() => setDeletingProject(null)}
          onDeleteProject={onDeleteProject}
        />
      )}
    </div>
  )
}