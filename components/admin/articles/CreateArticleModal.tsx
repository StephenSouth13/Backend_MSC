"use client"

import { useState, useRef } from 'react'
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
import { X, Plus, Image as ImageIcon, Video, Loader2, Send, Wand2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function CreateArticleModal({ open, onClose, onCreateArticle }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null) // 'thumbnail' hoặc 'content'
  const contentRef = useRef<HTMLTextAreaElement>(null)
  
  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', content: '',
    category: 'news', image: '', author: 'Admin', featured: false
  })

  // 1. Xử lý Upload Ảnh (Dùng chung cho cả bìa và nội dung)
  const uploadToStorage = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { error } = await BlogService.supabase.storage
      .from('media')
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = BlogService.supabase.storage
      .from('media')
      .getPublicUrl(filePath)
    
    return publicUrl
  }

  // Upload Ảnh Đại Diện (Ảnh bìa)
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading('thumbnail')
    try {
      const url = await uploadToStorage(file, 'thumbnails')
      setFormData(prev => ({ ...prev, image: url }))
      toast({ title: "Đã tải ảnh đại diện!" })
    } catch (err) {
      toast({ title: "Lỗi upload", variant: "destructive" })
    } finally { setUploading(null) }
  }

  // Chèn Ảnh vào Nội dung bài viết
  const insertImageToContent = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !contentRef.current) return
    setUploading('content')
    try {
      const url = await uploadToStorage(file, 'post-content')
      const cursorText = `\n![Mô tả ảnh](${url})\n`
      
      const start = contentRef.current.selectionStart
      const end = contentRef.current.selectionEnd
      const newContent = formData.content.substring(0, start) + cursorText + formData.content.substring(end)
      
      setFormData(prev => ({ ...prev, content: newContent }))
      toast({ title: "Đã chèn ảnh vào bài viết!" })
    } catch (err) {
      toast({ title: "Lỗi chèn ảnh", variant: "destructive" })
    } finally { setUploading(null) }
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) return toast({ title: "Thiếu thông tin quan trọng" })
    setLoading(true)
    try {
      const res = await BlogService.createPost(formData)
      if (res) {
        onCreateArticle(res)
        onClose()
        setFormData({ title: '', slug: '', excerpt: '', content: '', category: 'news', image: '', author: 'Admin', featured: false })
      }
    } catch (err) {
      toast({ title: "Lỗi lưu bài viết", variant: "destructive" })
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 gap-0 bg-white border-none shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="h-6 w-6" /> Soạn thảo bài viết mới
          </DialogTitle>
          <p className="opacity-80 text-sm">Tạo nội dung chất lượng cao cho msc.edu.vn</p>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-gray-700">Tiêu đề bài viết</Label>
              <Input 
                className="text-lg py-6 border-2 focus:border-blue-500 transition-all" 
                placeholder="Nhập tiêu đề hấp dẫn..."
                value={formData.title}
                onChange={(e) => {
                  const val = e.target.value
                  const slug = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim()
                  setFormData({...formData, title: val, slug})
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-gray-700">Nội dung chi tiết</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="relative cursor-pointer h-8 border-dashed">
                    <ImageIcon className="h-4 w-4 mr-1" /> Ảnh nội dung
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={insertImageToContent} />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 border-dashed" onClick={() => setFormData({...formData, content: formData.content + '\n`video: https://youtube.com/watch?v=...`'})}>
                    <Video className="h-4 w-4 mr-1" /> Chèn Video
                  </Button>
                </div>
              </div>
              <Textarea 
                ref={contentRef}
                className="min-h-[400px] bg-gray-50 border-2 font-mono" 
                placeholder="Viết bài tại đây (Hỗ trợ Markdown)..."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />
              {uploading === 'content' && <div className="flex items-center text-blue-600 text-xs"><Loader2 className="animate-spin mr-1 h-3 w-3"/> Đang xử lý ảnh trong bài...</div>}
            </div>
          </div>

          {/* CỘT PHẢI: CÀI ĐẶT & ẢNH BÌA */}
          <div className="space-y-6 bg-gray-50 p-4 rounded-xl border">
            <div className="space-y-2">
              <Label className="font-bold text-gray-700 text-sm">📸 Ảnh đại diện (Bìa ngoài)</Label>
              <div className="group relative aspect-video bg-gray-200 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all">
                {formData.image ? (
                  <>
                    <img src={formData.image} className="w-full h-full object-cover" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setFormData({...formData, image: ''})}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                    {uploading === 'thumbnail' ? <Loader2 className="animate-spin h-8 w-8 text-blue-500" /> : <Plus className="h-8 w-8 text-gray-400" />}
                    <span className="text-xs text-gray-500 mt-2">Tải ảnh bìa</span>
                    <input type="file" className="hidden" onChange={handleThumbnailUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label className="text-sm">Danh mục</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">Tin tức</SelectItem>
                    <SelectItem value="tutorial">Hướng dẫn</SelectItem>
                    <SelectItem value="ai">Công nghệ AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <Label className="text-sm cursor-pointer" htmlFor="f-post">🔥 Bài viết nổi bật</Label>
                <Switch id="f-post" checked={formData.featured} onCheckedChange={(v) => setFormData({...formData, featured: v})} />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Tóm tắt ngắn (Excerpt)</Label>
                <Textarea className="text-xs bg-white" placeholder="Viết mô tả ngắn cho bài viết..." value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Hủy bỏ</Button>
          <Button disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-8 py-6 rounded-full shadow-lg" onClick={handleSubmit}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
            Xuất bản bài viết
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}