"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Share2,
  Heart,
  MessageCircle,
  ImageIcon,
  Loader2,
  Eye
} from 'lucide-react'
import Link from 'next/link'

export default function ArticleDetailPage() {
  const params = useParams()
  const articleId = params.id as string
  const [article, setArticle] = useState<any>(null)
  const [author, setAuthor] = useState<any>(null)
  const [gallery, setGallery] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticleData()
  }, [articleId])

  const loadArticleData = async () => {
    try {
      // Fetch article
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select(`
          *,
          featured_image:media_files(file_url, alt_text),
          featured_video:media_files(file_url)
        `)
        .eq('id', articleId)
        .single()

      if (articleError) throw articleError
      setArticle(articleData)

      // Fetch author
      if (articleData.author_id) {
        const { data: authorData } = await supabase
          .from('article_authors')
          .select(`
            *,
            profile:profiles(full_name, email),
            avatar:media_files(file_url)
          `)
          .eq('profile_id', articleData.author_id)
          .single()

        if (authorData) {
          setAuthor(authorData)
        } else {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', articleData.author_id)
            .single()
          setAuthor(profileData)
        }
      }

      // Fetch gallery
      const { data: galleryData } = await supabase
        .from('article_gallery')
        .select(`
          *,
          image:media_files(file_url, alt_text)
        `)
        .eq('article_id', articleId)
        .order('display_order')

      if (galleryData) {
        setGallery(galleryData)
      }

      // Fetch sections
      const { data: sectionsData } = await supabase
        .from('article_sections')
        .select('*')
        .eq('article_id', articleId)
        .order('order_index')

      if (sectionsData) {
        setSections(sectionsData)
      }
    } catch (error) {
      console.error('Error loading article:', error)
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

  if (!article) {
    return (
      <div className="p-6">
        <p>Không tìm thấy bài viết</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/admin/articles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {article.title}
            </h1>
          </div>
          <Badge>{article.status}</Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Featured Image */}
        {article.featured_image?.file_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 rounded-xl overflow-hidden shadow-2xl"
          >
            <img
              src={article.featured_image.file_url}
              alt={article.title}
              className="w-full h-96 object-cover"
            />
          </motion.div>
        )}

        {/* Article Meta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 space-y-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {article.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {article.excerpt}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            {/* Author */}
            {author && (
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  {author.avatar?.file_url && (
                    <AvatarImage src={author.avatar.file_url} />
                  )}
                  <AvatarFallback>
                    {author.full_name?.charAt(0) || author.profile?.full_name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {author.full_name || author.profile?.full_name}
                  </p>
                  {author.expertise_areas && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {author.expertise_areas.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="h-5 w-5" />
              <span>
                {article.published_at
                  ? new Date(article.published_at).toLocaleDateString('vi-VN')
                  : new Date(article.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>

            {/* Reading Time */}
            {article.reading_time_minutes && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="h-5 w-5" />
                <span>{article.reading_time_minutes} phút đọc</span>
              </div>
            )}

            {/* Views */}
            {article.views !== undefined && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Eye className="h-5 w-5" />
                <span>{article.views} lượt xem</span>
              </div>
            )}
          </div>

          {/* Category & Tags */}
          {(article.category || article.tags) && (
            <div className="flex flex-wrap gap-2">
              {article.category && (
                <Badge variant="secondary">{article.category}</Badge>
              )}
              {article.tags && article.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
        </motion.div>

        {/* Content Sections */}
        {sections.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-lg dark:prose-invert max-w-none space-y-8"
          >
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-4"
              >
                {section.section_title && (
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {section.section_title}
                  </h2>
                )}
                {section.section_content && (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {section.section_content}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed prose prose-lg max-w-none">
            {article.content}
          </p>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hình ảnh liên quan</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gallery.map(item => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  className="rounded-lg overflow-hidden shadow-lg"
                >
                  <img
                    src={item.image?.file_url}
                    alt={item.caption}
                    className="w-full aspect-square object-cover"
                  />
                  {item.caption && (
                    <div className="p-3 bg-gray-100 dark:bg-gray-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {item.caption}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Engagement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-4"
        >
          <Button variant="outline" size="lg" className="flex-1">
            <Heart className="h-5 w-5 mr-2" />
            {article.likes || 0} Thích
          </Button>
          <Button variant="outline" size="lg" className="flex-1">
            <MessageCircle className="h-5 w-5 mr-2" />
            Bình luận
          </Button>
          <Button variant="outline" size="lg" className="flex-1">
            <Share2 className="h-5 w-5 mr-2" />
            Chia sẻ
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
