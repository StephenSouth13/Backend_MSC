"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Zap,
  Users,
  Calendar,
  DollarSign,
  Loader2,
  ExternalLink,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<any>(null)
  const [gallery, setGallery] = useState<any[]>([])
  const [deliverables, setDeliverables] = useState<any[]>([])
  const [process, setProcess] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjectData()
  }, [projectId])

  const loadProjectData = async () => {
    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          featured_image:media_files(file_url, alt_text)
        `)
        .eq('id', projectId)
        .single()

      if (projectError) throw projectError
      setProject(projectData)

      // Fetch gallery
      const { data: galleryData, error: galleryError } = await supabase
        .from('project_gallery')
        .select(`
          *,
          image:media_files(file_url, alt_text)
        `)
        .eq('project_id', projectId)
        .order('display_order')

      if (!galleryError && galleryData) {
        setGallery(galleryData)
      }

      // Fetch deliverables
      const { data: deliverablesData, error: delivError } = await supabase
        .from('project_deliverables')
        .select(`
          *,
          file:media_files(file_url, file_name)
        `)
        .eq('project_id', projectId)

      if (!delivError && deliverablesData) {
        setDeliverables(deliverablesData)
      }

      // Fetch process
      const { data: processData, error: procError } = await supabase
        .from('project_process')
        .select(`
          *,
          image:media_files(file_url),
          video:media_files(file_url)
        `)
        .eq('project_id', projectId)
        .order('process_order')

      if (!procError && processData) {
        setProcess(processData)
      }
    } catch (error) {
      console.error('Error loading project:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6">
        <p>Không tìm thấy dự án</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/admin/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
          </div>
          <Badge>{project.status}</Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Featured Image */}
          <div className="lg:col-span-2">
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
              {project.featured_image?.file_url ? (
                <img
                  src={project.featured_image.file_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : gallery.length > 0 && gallery[0].image?.file_url ? (
                <img
                  src={gallery[0].image.file_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <ImageIcon className="h-20 w-20 text-white/30" />
                </div>
              )}
            </div>
          </div>

          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin dự án</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Danh mục</p>
                <Badge variant="outline">{project.category}</Badge>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Khách hàng</p>
                <p className="font-medium">{project.client_name}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span>${project.budget || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{project.start_date} - {project.end_date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{project.team_size} thành viên</span>
                </div>
              </div>

              {project.progress_percentage !== undefined && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tiến độ</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress_percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{project.progress_percentage}%</p>
                </div>
              )}

              <Button className="w-full">Chỉnh sửa Dự án</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gallery">
              <ImageIcon className="h-4 w-4 mr-2" />
              Thư viện ({gallery.length})
            </TabsTrigger>
            <TabsTrigger value="process">
              <TrendingUp className="h-4 w-4 mr-2" />
              Quy trình
            </TabsTrigger>
            <TabsTrigger value="deliverables">
              <FileText className="h-4 w-4 mr-2" />
              Kết quả ({deliverables.length})
            </TabsTrigger>
            <TabsTrigger value="details">Chi tiết</TabsTrigger>
          </TabsList>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            {gallery.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-600">
                  Không có hình ảnh nào
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gallery.map(item => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      {item.image?.file_url && (
                        <img
                          src={item.image.file_url}
                          alt={item.caption}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                    {item.caption && (
                      <CardContent className="p-3">
                        <p className="text-sm font-medium">{item.caption}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Process Tab */}
          <TabsContent value="process" className="space-y-6">
            {process.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-600">
                  Không có thông tin quy trình
                </CardContent>
              </Card>
            ) : (
              process.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {index + 1}. {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
                    </CardContent>
                  </Card>

                  {(item.image?.file_url || item.video?.file_url) && (
                    <div className="rounded-lg overflow-hidden shadow-lg aspect-video bg-gray-200 dark:bg-gray-700">
                      {item.video?.file_url ? (
                        <video src={item.video.file_url} controls className="w-full h-full" />
                      ) : item.image?.file_url ? (
                        <img
                          src={item.image.file_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Deliverables Tab */}
          <TabsContent value="deliverables" className="space-y-4">
            {deliverables.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-600">
                  Không có kết quả nào
                </CardContent>
              </Card>
            ) : (
              deliverables.map(deliverable => (
                <Card key={deliverable.id}>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{deliverable.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {deliverable.description}
                      </p>
                      {deliverable.delivery_date && (
                        <p className="text-xs text-gray-500 mt-2">
                          Ngày giao: {new Date(deliverable.delivery_date).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge>{deliverable.status}</Badge>
                      {deliverable.file && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mô tả</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {project.description}
                </p>
              </CardContent>
            </Card>

            {project.technologies && (
              <Card>
                <CardHeader>
                  <CardTitle>Công nghệ sử dụng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(project.technologies) ? project.technologies : []).map((tech: string) => (
                      <Badge key={tech} variant="secondary">{tech}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {project.results_metrics && (
              <Card>
                <CardHeader>
                  <CardTitle>Kết quả và Số liệu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(project.results_metrics).map(([key, value]) => (
                      <div key={key} className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{key}</p>
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
