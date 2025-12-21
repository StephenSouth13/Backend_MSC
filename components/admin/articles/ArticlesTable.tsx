"use client"

import { useState } from 'react'
import { BlogPost } from '@/lib/supabase'
import { BlogService } from '@/lib/blog-service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Eye,
  ThumbsUp,
  Calendar,
  ExternalLink,
  User
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface ArticlesTableProps {
  articles: BlogPost[]
  onUpdateArticle: (article: BlogPost) => void
  onDeleteArticle: (articleId: number) => void
  onEditArticle?: (article: BlogPost) => void
}

export function ArticlesTable({ articles, onUpdateArticle, onDeleteArticle, onEditArticle }: ArticlesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null)

  const handleDeleteClick = (articleId: number) => {
    setSelectedArticleId(articleId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedArticleId) {
      const success = await BlogService.deletePost(selectedArticleId)
      if (success) {
        onDeleteArticle(selectedArticleId)
      }
    }
    setDeleteDialogOpen(false)
    setSelectedArticleId(null)
  }

  const getStatusBadge = (publishDate?: string) => {
    if (!publishDate || new Date(publishDate) > new Date()) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Bản nháp
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Đã xuất bản
      </Badge>
    )
  }

  const getCategoryBadge = (category?: string) => {
    if (!category) return null
    
    const categoryColors: Record<string, string> = {
      'tutorial': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'technical': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'industry': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      'ai': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      'guide': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'news': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
    }
    
    return (
      <Badge className={categoryColors[category.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}>
        {category}
      </Badge>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa xuất bản'
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi })
    } catch {
      return dateString
    }
  }

  const formatViews = (views?: number) => {
    if (!views || views === 0) return '0'
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Tiêu đề & Tóm tắt</TableHead>
              <TableHead className="w-[150px]">Tác giả</TableHead>
              <TableHead className="w-[120px]">Danh mục</TableHead>
              <TableHead className="w-[120px]">Trạng thái</TableHead>
              <TableHead className="w-[100px]">Lượt xem</TableHead>
              <TableHead className="w-[100px]">Lượt thích</TableHead>
              <TableHead className="w-[150px]">Ngày xuất bản</TableHead>
              <TableHead className="w-[120px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Không có bài viết nào được tìm thấy
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id} className="hover:bg-gray-50/50">
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <div className="font-medium text-sm leading-5">
                        {truncateText(article.title, 80)}
                      </div>
                      {article.excerpt && (
                        <div className="text-xs text-gray-500 leading-4">
                          {truncateText(article.excerpt, 120)}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {article.featured && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0">
                            Nổi bật
                          </Badge>
                        )}
                        {article.read_time && (
                          <span className="text-xs text-gray-400">
                            {article.read_time} phút đọc
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-2">
                      {article.author_avatar ? (
                        <img 
                          src={article.author_avatar} 
                          alt={article.author || 'Author'}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-500" />
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {article.author || 'Không rõ'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {getCategoryBadge(article.category)}
                  </TableCell>
                  <TableCell className="py-4">
                    {getStatusBadge(article.publish_date)}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{formatViews(article.views)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{article.likes || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-xs">{formatDate(article.publish_date)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => onEditArticle && onEditArticle(article)}
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        {article.slug && (
                          <DropdownMenuItem
                            onClick={() => window.open(`/blog/${article.slug}`, '_blank')}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Xem bài viết
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(article.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}