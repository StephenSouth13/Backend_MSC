"use client"

import { useState } from 'react'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { CoursesTable } from '@/components/admin/courses/CoursesTable'
import { CreateCourseModal } from '@/components/admin/courses/CreateCourseModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, BookOpen, Clock, Users, TrendingUp } from 'lucide-react'

// Sample course data for demo
const initialCourses = [
  {
    id: 1,
    title: 'Advanced React Patterns',
    description: 'Master advanced React patterns including hooks, context, and performance optimization',
    instructor: 'John Doe',
    category: 'frontend' as const,
    difficulty: 'advanced' as const,
    status: 'published' as const,
    price: 299,
    duration: '8 weeks',
    students: 156,
    rating: 4.8,
    createdAt: '2024-01-15',
    updatedAt: '2024-09-10'
  },
  {
    id: 2,
    title: 'Next.js Full Stack Development',
    description: 'Build modern web applications with Next.js, TypeScript, and database integration',
    instructor: 'Jane Smith',
    category: 'fullstack' as const,
    difficulty: 'intermediate' as const,
    status: 'published' as const,
    price: 399,
    duration: '12 weeks',
    students: 234,
    rating: 4.9,
    createdAt: '2024-02-10',
    updatedAt: '2024-09-15'
  },
  {
    id: 3,
    title: 'JavaScript Fundamentals',
    description: 'Learn the core concepts of JavaScript from scratch to advanced topics',
    instructor: 'Mike Johnson',
    category: 'frontend' as const,
    difficulty: 'beginner' as const,
    status: 'published' as const,
    price: 199,
    duration: '6 weeks',
    students: 445,
    rating: 4.7,
    createdAt: '2024-03-05',
    updatedAt: '2024-09-05'
  },
  {
    id: 4,
    title: 'Node.js API Development',
    description: 'Build scalable backend APIs with Node.js, Express, and MongoDB',
    instructor: 'Sarah Wilson',
    category: 'backend' as const,
    difficulty: 'intermediate' as const,
    status: 'draft' as const,
    price: 349,
    duration: '10 weeks',
    students: 0,
    rating: 0,
    createdAt: '2024-08-20',
    updatedAt: '2024-09-18'
  },
  {
    id: 5,
    title: 'Python for Data Science',
    description: 'Complete guide to data analysis and machine learning with Python',
    instructor: 'David Brown',
    category: 'data' as const,
    difficulty: 'intermediate' as const,
    status: 'published' as const,
    price: 449,
    duration: '14 weeks',
    students: 189,
    rating: 4.6,
    createdAt: '2024-04-12',
    updatedAt: '2024-09-12'
  },
  {
    id: 6,
    title: 'UI/UX Design Masterclass',
    description: 'Design beautiful and user-friendly interfaces with modern design principles',
    instructor: 'Lisa Garcia',
    category: 'design' as const,
    difficulty: 'beginner' as const,
    status: 'review' as const,
    price: 279,
    duration: '8 weeks',
    students: 0,
    rating: 0,
    createdAt: '2024-07-15',
    updatedAt: '2024-09-19'
  }
]

function CoursesManagementContent() {
  const [courses, setCourses] = useState(initialCourses)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateCourse = (courseData: any) => {
    const newCourse = {
      id: Math.max(...courses.map(c => c.id)) + 1,
      ...courseData,
      students: 0,
      rating: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }
    setCourses([...courses, newCourse])
    setIsCreateModalOpen(false)
  }

  const handleUpdateCourse = (updatedCourse: any) => {
    setCourses(courses.map(course => 
      course.id === updatedCourse.id ? { ...updatedCourse, updatedAt: new Date().toISOString().split('T')[0] } : course
    ))
  }

  const handleDeleteCourse = (courseId: number) => {
    setCourses(courses.filter(course => course.id !== courseId))
  }

  const courseStats = {
    total: courses.length,
    published: courses.filter(c => c.status === 'published').length,
    draft: courses.filter(c => c.status === 'draft').length,
    review: courses.filter(c => c.status === 'review').length,
    totalStudents: courses.reduce((acc, course) => acc + course.students, 0),
    avgRating: courses.filter(c => c.rating > 0).reduce((acc, course, _, arr) => acc + course.rating / arr.length, 0)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create, manage, and track all your educational courses and content.
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{courseStats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
              <p className="text-xl font-bold text-green-600">{courseStats.published}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Draft</p>
              <p className="text-xl font-bold text-yellow-600">{courseStats.draft}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">In Review</p>
              <p className="text-xl font-bold text-purple-600">{courseStats.review}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
              <p className="text-xl font-bold text-blue-600">{courseStats.totalStudents.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
              <p className="text-xl font-bold text-orange-600">
                {courseStats.avgRating > 0 ? courseStats.avgRating.toFixed(1) : '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Course Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses by title, instructor, category, or difficulty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{filteredCourses.length} courses</Badge>
            </div>
          </div>

          <CoursesTable 
            courses={filteredCourses}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        </CardContent>
      </Card>

      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateCourse={handleCreateCourse}
      />
    </div>
  )
}

export default function CoursesManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <CoursesManagementContent />
    </ProtectedRoute>
  )
}