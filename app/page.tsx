"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FolderOpen,
  FileText,
  Star,
  Users,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([])
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([])
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0)
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedContent()
  }, [])

  const loadFeaturedContent = async () => {
    try {
      // Fetch featured courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          featured_image:media_files(file_url)
        `)
        .eq('featured', true)
        .eq('status', 'published')
        .limit(10)

      if (!coursesError && coursesData) {
        setFeaturedCourses(coursesData)
      }

      // Fetch featured projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          featured_image:media_files(file_url)
        `)
        .eq('featured', true)
        .eq('status', 'completed')
        .limit(10)

      if (!projectsError && projectsData) {
        setFeaturedProjects(projectsData)
      }

      // Fetch featured articles
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select(`
          *,
          featured_image:media_files(file_url)
        `)
        .eq('featured', true)
        .eq('status', 'published')
        .limit(10)

      if (!articlesError && articlesData) {
        setFeaturedArticles(articlesData)
      }
    } catch (error) {
      console.error('Error loading featured content:', error)
    } finally {
      setLoading(false)
    }
  }

  const Carousel = ({ items, currentIndex, setCurrentIndex, type }: any) => {
    if (items.length === 0) return null

    const next = () => {
      setCurrentIndex((currentIndex + 1) % items.length)
    }

    const prev = () => {
      setCurrentIndex((currentIndex - 1 + items.length) % items.length)
    }

    const current = items[currentIndex]

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={currentIndex}
            className="lg:col-span-2"
          >
            <Link href={`/admin/${type === 'courses' ? 'courses' : type === 'projects' ? 'projects' : 'articles'}/${current.id}`}>
              <div className="relative group overflow-hidden rounded-2xl cursor-pointer h-96">
                {current.featured_image?.file_url ? (
                  <img
                    src={current.featured_image.file_url}
                    alt={current.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {type === 'courses' && <BookOpen className="h-24 w-24 text-white/30" />}
                    {type === 'projects' && <FolderOpen className="h-24 w-24 text-white/30" />}
                    {type === 'articles' && <FileText className="h-24 w-24 text-white/30" />}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                  <Badge className="w-fit mb-4">{type === 'courses' ? current.category : type === 'projects' ? current.category : current.category}</Badge>
                  <h2 className="text-3xl font-bold text-white mb-2">{current.title}</h2>
                  <p className="text-white/80 line-clamp-2">{current.excerpt || current.description}</p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Info Card */}
          <Card className="backdrop-blur-xl bg-white/10 dark:bg-gray-800/50 border border-white/20">
            <CardContent className="p-6 space-y-6">
              {type === 'courses' && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Level</p>
                    <Badge>{current.difficulty}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Giá</p>
                    <p className="text-2xl font-bold text-primary-600">${current.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{current.students_count || 0} học viên</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{current.rating || 0} / 5</span>
                  </div>
                </>
              )}
              {type === 'projects' && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Client</p>
                    <p className="font-semibold">{current.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ngân sách</p>
                    <p className="text-xl font-bold text-primary-600">${current.budget}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Tiến độ: {current.progress_percentage}%</span>
                  </div>
                </>
              )}
              {type === 'articles' && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Danh mục</p>
                    <Badge>{current.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{current.reading_time_minutes || 5} phút đọc</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">{current.views || 0} lượt xem</span>
                  </div>
                </>
              )}

              <Link href={`/admin/${type === 'courses' ? 'courses' : type === 'projects' ? 'projects' : 'articles'}/${current.id}`}>
                <Button className="w-full">Xem chi tiết</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Thumbnails */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={prev}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {items.map((item, index) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-primary-600'
                    : 'border-gray-300 dark:border-gray-700 opacity-60 hover:opacity-100'
                }`}
              >
                {item.featured_image?.file_url ? (
                  <img
                    src={item.featured_image.file_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700" />
                )}
              </motion.button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={next}
            className="shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <span className="text-sm text-gray-600 dark:text-gray-400 ml-auto">
            {currentIndex + 1} / {items.length}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            MSC Learning Platform
          </h1>
          <div className="flex gap-4">
            <Link href="/admin/courses">
              <Button variant="ghost">Khóa học</Button>
            </Link>
            <Link href="/admin/projects">
              <Button variant="ghost">Dự án</Button>
            </Link>
            <Link href="/admin/articles">
              <Button variant="ghost">Bài viết</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">
        {/* Featured Courses */}
        {featuredCourses.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-primary-600" />
                  Khóa học nổi bật
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Học từ những khóa học chất lượng cao nhất</p>
              </div>
              <Link href="/admin/courses">
                <Button variant="outline">Xem tất cả</Button>
              </Link>
            </div>
            <Carousel
              items={featuredCourses}
              currentIndex={currentCourseIndex}
              setCurrentIndex={setCurrentCourseIndex}
              type="courses"
            />
          </motion.section>
        )}

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <FolderOpen className="h-8 w-8 text-primary-600" />
                  Dự án nổi bật
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Khám phá những dự án đã hoàn thành tuyệt vời</p>
              </div>
              <Link href="/admin/projects">
                <Button variant="outline">Xem tất cả</Button>
              </Link>
            </div>
            <Carousel
              items={featuredProjects}
              currentIndex={currentProjectIndex}
              setCurrentIndex={setCurrentProjectIndex}
              type="projects"
            />
          </motion.section>
        )}

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary-600" />
                  Bài viết nổi bật
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Đọc những bài viết mới nhất và thú vị</p>
              </div>
              <Link href="/admin/articles">
                <Button variant="outline">Xem tất cả</Button>
              </Link>
            </div>
            <Carousel
              items={featuredArticles}
              currentIndex={currentArticleIndex}
              setCurrentIndex={setCurrentArticleIndex}
              type="articles"
            />
          </motion.section>
        )}

        {/* CTA Section */}
        {featuredCourses.length === 0 && featuredProjects.length === 0 && featuredArticles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Chưa có nội dung nổi bật
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Hãy đánh dấu nội dung yêu thích làm nổi bật trên trang chủ
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/admin/courses">
                <Button>Quản lý khóa học</Button>
              </Link>
              <Link href="/admin/projects">
                <Button variant="outline">Quản lý dự án</Button>
              </Link>
              <Link href="/admin/articles">
                <Button variant="outline">Quản lý bài viết</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
