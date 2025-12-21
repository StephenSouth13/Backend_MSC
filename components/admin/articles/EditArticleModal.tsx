"use client"

import { useState, useEffect } from 'react'
import { BlogService } from '@/lib/blog-service'
import { BlogPost } from '@/lib/supabase'
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

interface EditArticleModalProps {
  open: boolean
  article: BlogPost | null
  onClose: () => void
  onUpdateArticle: (article: BlogPost) => void
}

const categories = [
  { value: 'tutorial', label: 'Hướng dẫn' },
  { value: 'technical', label: 'Kỹ thuật' },
  { value: 'industry', label: 'Ngành nghề' },
  { value: 'ai', label: 'AI & Machine Learning' },
  { value: 'guide', label: 'Chỉ dẫn' },
  { value: 'news', label: 'Tin tức' },
]

// Function to generate URL slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

export function EditArticleModal({ open, article, onClose, onUpdateArticle }: EditArticleModalProps) {
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
    author_bio: '',
    category: '',
    image: '',
    featured: false,
    publish_date: '',
    read_time: '5',
    views: 0,
    likes: 0,
    shares: 0,
    comments: 0,
    seo: {
      title: '',
      description: '',
      keywords: [] as string[],
    }
  })

  // Load article data when modal opens
  useEffect(() => {
    if (open && article) {
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        author: article.author || '',
        author_avatar: article.author_avatar || '',
        author_bio: article.author_bio || '',
        category: article.category || '',
        image: article.image || '',
        featured: article.featured || false,
        publish_date: article.publish_date || '',
        read_time: article.read_time || '5',
        views: article.views || 0,
        likes: article.likes || 0,
        shares: article.shares || 0,
        comments: article.comments || 0,
        seo: {
          title: article.seo?.title || '',
          description: article.seo?.description || '',
          keywords: article.seo?.keywords || [],
        }
      })
      
      // Load tags
      if (article.tags) {
        try {
          const parsedTags = typeof article.tags === 'string' 
            ? JSON.parse(article.tags) 
            : article.tags
          setTags(Array.isArray(parsedTags) ? parsedTags : [])
        } catch {
          setTags([])
        }
      } else {
        setTags([])
      }
    }
  }, [open, article])

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: '',
      author_avatar: '',
      author_bio: '',
      category: '',
      image: '',
      featured: false,
      publish_date: '',
      read_time: '5',
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      seo: {
        title: '',
        description: '',
        keywords: [] as string[],
      }
    })
    setTags([])
    setTagInput('')
  }

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
        [field]: value,
        // Auto-generate slug when title changes
        ...(field === 'title' && { slug: generateSlug(value) })
      }))
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
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

  const handleSubmit = async () => {
    if (!article) return

    // Validate required fields
    if (!formData.title || !formData.slug || !formData.author || !formData.category) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ các trường bắt buộc: Tiêu đề, Slug, Tác giả, Danh mục",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)

      const articleData = {
        ...formData,
        tags: tags,
        updated_at: new Date().toISOString(),
        // Convert empty strings to undefined for date fields
        publish_date: formData.publish_date && formData.publish_date.trim() !== '' ? formData.publish_date : undefined,
      }

      const success = await BlogService.updatePost(article.id, articleData)
      
      if (success) {
        onUpdateArticle(success)
        
        toast({
          title: "Thành công",
          description: "Bài viết đã được cập nhật thành công",
        })
        
        onClose()
      } else {
        throw new Error('Failed to update article')
      }
    } catch (error) {
      console.error('Error updating article:', error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật bài viết. Vui lòng thử lại.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset form when closing
    setTimeout(() => {
      resetForm()
    }, 300)
  }

  if (!article) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            📝 Chỉnh sửa bài viết
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Cập nhật thông tin bài viết của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* 📝 Basic Information Section */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium text-blue-900 flex items-center gap-2">
              📝 Thông tin cơ bản
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Tiêu đề <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Nhập tiêu đề bài viết..."
                  className="bg-white border-gray-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
                  URL Slug <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-2">(Tự động tạo từ tiêu đề)</span>
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  readOnly
                  placeholder="url-slug-bai-viet"
                  className="bg-gray-50 border-gray-300 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-sm font-medium text-gray-700">
                Tóm tắt
              </Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Nhập tóm tắt ngắn gọn cho bài viết..."
                rows={3}
                className="bg-white border-gray-300 focus:border-blue-500 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                Nội dung <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Nhập nội dung chi tiết của bài viết..."
                rows={8}
                className="bg-white border-gray-300 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* 👤 Author & Category Section */}
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-medium text-green-900 flex items-center gap-2">
              👤 Tác giả & Danh mục
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author" className="text-sm font-medium text-gray-700">
                  Tác giả <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  placeholder="Tên tác giả"
                  className="bg-white border-gray-300 focus:border-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Danh mục <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-green-500">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author_avatar" className="text-sm font-medium text-gray-700">
                  Avatar tác giả (URL)
                </Label>
                <Input
                  id="author_avatar"
                  value={formData.author_avatar}
                  onChange={(e) => handleInputChange('author_avatar', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="bg-white border-gray-300 focus:border-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="read_time" className="text-sm font-medium text-gray-700">
                  Thời gian đọc (phút)
                </Label>
                <Input
                  id="read_time"
                  type="number"
                  min="1"
                  value={formData.read_time}
                  onChange={(e) => handleInputChange('read_time', e.target.value || '1')}
                  className="bg-white border-gray-300 focus:border-green-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author_bio" className="text-sm font-medium text-gray-700">
                Tiểu sử tác giả
              </Label>
              <Textarea
                id="author_bio"
                value={formData.author_bio}
                onChange={(e) => handleInputChange('author_bio', e.target.value)}
                placeholder="Thông tin ngắn gọn về tác giả..."
                rows={2}
                className="bg-white border-gray-300 focus:border-green-500 resize-none"
              />
            </div>
          </div>

          {/* 🏷️ Tags Section */}
          <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="text-lg font-medium text-purple-900 flex items-center gap-2">
              🏷️ Tags
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
                Thêm tags
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tag và nhấn Enter"
                  className="bg-white border-gray-300 focus:border-purple-500"
                />
                <Button 
                  type="button" 
                  onClick={addTag}
                  variant="outline"
                  size="sm"
                  className="border-purple-300 text-purple-700 hover:bg-purple-100"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Tags hiện tại:</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-purple-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 🎨 Media & Settings Section */}
          <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="text-lg font-medium text-orange-900 flex items-center gap-2">
              🎨 Media & Cài đặt
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-medium text-gray-700">
                  Hình ảnh đại diện (URL)
                </Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-white border-gray-300 focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publish_date" className="text-sm font-medium text-gray-700">
                  Ngày xuất bản
                </Label>
                <Input
                  id="publish_date"
                  type="datetime-local"
                  value={formData.publish_date ? formData.publish_date.slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('publish_date', e.target.value ? new Date(e.target.value).toISOString() : '')}
                  className="bg-white border-gray-300 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleInputChange('featured', checked)}
              />
              <Label htmlFor="featured" className="text-sm font-medium text-gray-700">
                Bài viết nổi bật
              </Label>
            </div>
          </div>

          {/* 📊 Statistics Section */}
          <div className="space-y-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <h3 className="text-lg font-medium text-cyan-900 flex items-center gap-2">
              📊 Thống kê hiện tại
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="views" className="text-sm font-medium text-gray-700">
                  Lượt xem
                </Label>
                <Input
                  id="views"
                  type="number"
                  min="0"
                  value={formData.views}
                  onChange={(e) => handleInputChange('views', parseInt(e.target.value) || 0)}
                  className="bg-white border-gray-300 focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="likes" className="text-sm font-medium text-gray-700">
                  Lượt thích
                </Label>
                <Input
                  id="likes"
                  type="number"
                  min="0"
                  value={formData.likes}
                  onChange={(e) => handleInputChange('likes', parseInt(e.target.value) || 0)}
                  className="bg-white border-gray-300 focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shares" className="text-sm font-medium text-gray-700">
                  Lượt chia sẻ
                </Label>
                <Input
                  id="shares"
                  type="number"
                  min="0"
                  value={formData.shares}
                  onChange={(e) => handleInputChange('shares', parseInt(e.target.value) || 0)}
                  className="bg-white border-gray-300 focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments" className="text-sm font-medium text-gray-700">
                  Bình luận
                </Label>
                <Input
                  id="comments"
                  type="number"
                  min="0"
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', parseInt(e.target.value) || 0)}
                  className="bg-white border-gray-300 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* 🔍 SEO Section */}
          <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="text-lg font-medium text-indigo-900 flex items-center gap-2">
              🔍 SEO
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title" className="text-sm font-medium text-gray-700">
                  SEO Title
                </Label>
                <Input
                  id="seo_title"
                  value={formData.seo.title}
                  onChange={(e) => handleInputChange('seo.title', e.target.value)}
                  placeholder="Tiêu đề tối ưu cho SEO..."
                  className="bg-white border-gray-300 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description" className="text-sm font-medium text-gray-700">
                  SEO Description
                </Label>
                <Textarea
                  id="seo_description"
                  value={formData.seo.description}
                  onChange={(e) => handleInputChange('seo.description', e.target.value)}
                  placeholder="Mô tả tối ưu cho SEO..."
                  rows={2}
                  className="bg-white border-gray-300 focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_keywords" className="text-sm font-medium text-gray-700">
                  SEO Keywords
                </Label>
                <Input
                  id="seo_keywords"
                  value={formData.seo.keywords.join(', ')}
                  onChange={(e) => handleInputChange('seo.keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                  placeholder="từ khóa, seo, tối ưu"
                  className="bg-white border-gray-300 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Hủy bỏ
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !formData.title || !formData.author || !formData.category}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật bài viết'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}