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
import { AlertTriangle, Trash2, FileText, Eye, ThumbsUp, Clock } from 'lucide-react'

interface Article {
  id: number
  title: string
  excerpt: string
  content: string
  author: string
  category: 'tutorial' | 'technical' | 'industry' | 'ai' | 'news'
  type: 'blog' | 'tutorial' | 'guide' | 'news'
  status: 'draft' | 'published' | 'review' | 'archived'
  tags: string[]
  views: number
  likes: number
  publishedAt: string
  featuredImage: string
  seoTitle: string
  seoDescription: string
  estimatedReadTime: number
  createdAt: string
  updatedAt: string
}

interface DeleteArticleModalProps {
  article: Article
  isOpen: boolean
  onClose: () => void
  onDeleteArticle: (articleId: number) => void
}

export function DeleteArticleModal({ article, isOpen, onClose, onDeleteArticle }: DeleteArticleModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      onDeleteArticle(article.id)
      onClose()
    } catch (error) {
      console.error('Error deleting article:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      tutorial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      technical: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      industry: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      ai: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      news: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
    }
    return (
      <Badge className={categoryColors[category as keyof typeof categoryColors]}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeColors = {
      blog: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      tutorial: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
      guide: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
      news: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }
    return (
      <Badge variant="outline" className={typeColors[type as keyof typeof typeColors]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Draft</Badge>
      case 'published':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Published</Badge>
      case 'review':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">In Review</Badge>
      case 'archived':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border border-white/20 dark:border-gray-700/20 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Delete Article</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            This action cannot be undone. This will permanently delete the article and all associated data.
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
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{article.title}</span>
                  </div>
                  <p className="text-sm">by {article.author}</p>
                  <div className="flex items-center space-x-2">
                    {getCategoryBadge(article.category)}
                    {getTypeBadge(article.type)}
                    {getStatusBadge(article.status)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Article Details:</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <span>{article.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center space-x-2">
                <ThumbsUp className="h-4 w-4 text-gray-500" />
                <span>{article.likes} likes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{article.estimatedReadTime} min read</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Created: {new Date(article.createdAt).toLocaleDateString()}
              </div>
            </div>

            {article.publishedAt && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Published:</span> {new Date(article.publishedAt).toLocaleDateString()}
              </div>
            )}

            <div className="space-y-2">
              <h5 className="font-medium text-gray-900 dark:text-white text-sm">Tags:</h5>
              <div className="flex flex-wrap gap-1">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium text-gray-900 dark:text-white text-sm">Excerpt:</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {article.excerpt}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Data that will be deleted:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Article content and formatting</li>
              <li>• SEO metadata and settings</li>
              <li>• View count and engagement metrics</li>
              <li>• Associated comments and reactions</li>
              <li>• Featured image and media assets</li>
              <li>• Search engine indexing data</li>
            </ul>
          </div>

          {article.status === 'published' && article.views > 1000 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                  Warning: This published article has {article.views.toLocaleString()} views. Consider archiving instead to preserve SEO.
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3">
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">SEO Impact:</p>
              <p className="text-xs">
                <strong>Title:</strong> {article.seoTitle}
              </p>
              <p className="text-xs mt-1">
                <strong>Description:</strong> {article.seoDescription}
              </p>
            </div>
          </div>
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
                Delete Article
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}