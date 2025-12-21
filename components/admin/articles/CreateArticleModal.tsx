"use client"

import { useState } from 'react'
import { BlogService } from '@/lib/blog-service'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface CreateArticleModalProps {
  open: boolean
  onClose: () => void
  onCreateArticle: (article: any) => void
}

const categories = [
  { value: 'tutorial', label: 'Hướng dẫn' },
  { value: 'technical', label: 'Kỹ thuật' },
  { value: 'industry', label: 'Ngành nghề' },
  { value: 'ai', label: 'AI & Machine Learning' },
  { value: 'guide', label: 'Chỉ dẫn' },
  { value: 'news', label: 'Tin tức' },
]

export function CreateArticleModal({ open, onClose, onCreateArticle }: CreateArticleModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: '',
    author_avatar: '',
    author_bio: '', // Thêm author_bio
    category: '',
    image: '',
    featured: false,
    publish_date: '',
    read_time: 5,
    views: 0,
    likes: 0,
    shares: 0,
    comments: 0,
    seo: {
      title: '',
      description: '',
      keywords: '',
    }
  })

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('seo.')) {
      const seoField = field.replace('seo.', '')
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }

    // Auto-generate slug from title
    if (field === 'title' && value) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove multiple hyphens
        .trim()
      
      setFormData(prev => ({
        ...prev,
        slug: slug
      }))
    }

    // Auto-generate SEO title from title
    if (field === 'title' && value) {
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          title: value
        }
      }))
    }

    // Auto-generate SEO description from excerpt
    if (field === 'excerpt' && value) {
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          description: value
        }
      }))
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề bài viết",
        variant: "destructive"
      })
      return false
    }
    
    if (!formData.slug.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập slug bài viết",
        variant: "destructive"
      })
      return false
    }
    
    if (!formData.content.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung bài viết",
        variant: "destructive"
      })
      return false
    }
    
    if (!formData.author.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên tác giả",
        variant: "destructive"
      })
      return false
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      const articleData = {
        ...formData,
        tags,
        seo: {
          title: formData.seo.title || undefined,
          description: formData.seo.description || undefined,
          keywords: formData.seo.keywords ? formData.seo.keywords.split(',').map(k => k.trim()) : undefined,
        },
        publish_date: formData.publish_date || undefined,
        read_time: formData.read_time.toString(),
      }
      
      const newArticle = await BlogService.createPost(articleData)
      
      if (newArticle) {
        toast({
          title: "Thành công",
          description: "Bài viết đã được tạo thành công",
        })
        onCreateArticle(newArticle)
        onClose()
        resetForm()
      } else {
        throw new Error('Không thể tạo bài viết')
      }
    } catch (error) {
      console.error('Error creating article:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo bài viết. Vui lòng thử lại.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: '',
      author_avatar: '',
      author_bio: '', // Thêm author_bio
      category: '',
      image: '',
      featured: false,
      publish_date: '',
      read_time: 5,
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      seo: {
        title: '',
        description: '',
        keywords: '',
      }
    })
    setTags([])
    setTagInput('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border shadow-lg">
        <DialogHeader className="border-b pb-4 mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Tạo bài viết mới
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Điền thông tin để tạo bài viết mới cho blog
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-2">
          {/* Basic Information */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              📝 Thông tin cơ bản
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700 dark:text-gray-300 font-medium">
                  Tiêu đề *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Nhập tiêu đề bài viết"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-gray-700 dark:text-gray-300 font-medium">
                  Slug *
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="url-cua-bai-viet"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  URL thân thiện cho bài viết (tự động từ tiêu đề)
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-gray-700 dark:text-gray-300 font-medium">
                Tóm tắt
              </Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Tóm tắt ngắn gọn về bài viết"
                rows={3}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content" className="text-gray-700 dark:text-gray-300 font-medium">
                Nội dung *
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Nội dung chi tiết của bài viết (hỗ trợ Markdown)"
                rows={8}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 font-mono text-sm"
              />
            </div>
          </div>

          {/* Author & Category */}
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              👤 Tác giả & Phân loại
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author" className="text-gray-700 dark:text-gray-300 font-medium">
                  Tác giả *
                </Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  placeholder="Tên tác giả"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author_avatar" className="text-gray-700 dark:text-gray-300 font-medium">
                  Avatar tác giả
                </Label>
                <Input
                  id="author_avatar"
                  value={formData.author_avatar}
                  onChange={(e) => handleInputChange('author_avatar', e.target.value)}
                  placeholder="URL avatar của tác giả"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author_bio" className="text-gray-700 dark:text-gray-300 font-medium">
                Tiểu sử tác giả
              </Label>
              <Textarea
                id="author_bio"
                value={formData.author_bio}
                onChange={(e) => handleInputChange('author_bio', e.target.value)}
                placeholder="Thông tin ngắn gọn về tác giả"
                rows={2}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-700 dark:text-gray-300 font-medium">
                  Danh mục
                </Label>
                <Select onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="read_time" className="text-gray-700 dark:text-gray-300 font-medium">
                  Thời gian đọc (phút)
                </Label>
                <Input
                  id="read_time"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.read_time}
                  onChange={(e) => handleInputChange('read_time', parseInt(e.target.value) || 5)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ước tính thời gian đọc bài viết (1-60 phút)
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              🏷️ Tags
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-gray-700 dark:text-gray-300 font-medium">
                Thêm tags
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tag và nhấn Enter"
                  className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
                <Button 
                  type="button" 
                  onClick={addTag} 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Media & Settings */}
          <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              🎨 Media & Cài đặt
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image" className="text-gray-700 dark:text-gray-300 font-medium">
                  Ảnh đại diện
                </Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="URL ảnh đại diện bài viết"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="publish_date" className="text-gray-700 dark:text-gray-300 font-medium">
                  Ngày xuất bản
                </Label>
                <Input
                  id="publish_date"
                  type="date"
                  value={formData.publish_date}
                  onChange={(e) => handleInputChange('publish_date', e.target.value)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Để trống để xuất bản ngay lập tức
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-700 rounded border">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleInputChange('featured', checked)}
              />
              <Label htmlFor="featured" className="text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                🌟 Bài viết nổi bật
              </Label>
            </div>
          </div>

          {/* Initial Statistics */}
          <div className="space-y-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              📊 Thống kê ban đầu
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Thiết lập số liệu thống kê ban đầu cho bài viết (tuỳ chọn)
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="views" className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
                  👁️ Lượt xem
                </Label>
                <Input
                  id="views"
                  type="number"
                  min="0"
                  value={formData.views}
                  onChange={(e) => handleInputChange('views', parseInt(e.target.value) || 0)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="likes" className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
                  👍 Lượt thích
                </Label>
                <Input
                  id="likes"
                  type="number"
                  min="0"
                  value={formData.likes}
                  onChange={(e) => handleInputChange('likes', parseInt(e.target.value) || 0)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shares" className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
                  🔄 Lượt share
                </Label>
                <Input
                  id="shares"
                  type="number"
                  min="0"
                  value={formData.shares}
                  onChange={(e) => handleInputChange('shares', parseInt(e.target.value) || 0)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comments" className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
                  💬 Bình luận
                </Label>
                <Input
                  id="comments"
                  type="number"
                  min="0"
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', parseInt(e.target.value) || 0)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded border">
              💡 <strong>Mẹo:</strong> Bạn có thể thiết lập số liệu ban đầu để bài viết trông hấp dẫn hơn, hoặc để trống (mặc định = 0) nếu là bài viết mới hoàn toàn.
            </div>
          </div>

          {/* SEO */}
          <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              🔍 SEO
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title" className="text-gray-700 dark:text-gray-300 font-medium">
                  Tiêu đề SEO
                </Label>
                <Input
                  id="seo_title"
                  value={formData.seo.title}
                  onChange={(e) => handleInputChange('seo.title', e.target.value)}
                  placeholder="Tiêu đề cho SEO (tự động từ tiêu đề chính)"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seo_description" className="text-gray-700 dark:text-gray-300 font-medium">
                  Mô tả SEO
                </Label>
                <Textarea
                  id="seo_description"
                  value={formData.seo.description}
                  onChange={(e) => handleInputChange('seo.description', e.target.value)}
                  placeholder="Mô tả cho SEO (tự động từ tóm tắt)"
                  rows={2}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seo_keywords" className="text-gray-700 dark:text-gray-300 font-medium">
                  Từ khóa SEO
                </Label>
                <Input
                  id="seo_keywords"
                  value={formData.seo.keywords}
                  onChange={(e) => handleInputChange('seo.keywords', e.target.value)}
                  placeholder="Từ khóa SEO, phân cách bằng dấu phẩy"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 mt-6 bg-gray-50 dark:bg-gray-800 -mx-6 -mb-6 px-6 py-4">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isLoading}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Đang tạo...' : 'Tạo bài viết'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}