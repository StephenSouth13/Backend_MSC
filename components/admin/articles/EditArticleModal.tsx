"use client"

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Image as ImageIcon, Loader2, Save, Wand2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function EditArticleModal({ open, onClose, article, onUpdateArticle }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const contentRef = useRef<HTMLTextAreaElement>(null)
  
  const [formData, setFormData] = useState<any>(null)

  // Load dữ liệu bài viết cũ vào Form khi mở Modal
  useEffect(() => {
    if (article) {
      setFormData({
        id: article.id,
        title: article.title || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        category: article.category || 'news',
        image: article.image || '',
        author_id: article.author_id || '',
        featured: article.featured || false
      })
    }
  }, [article])

  // Lấy danh sách Mentor/MSCer
  useEffect(() => {
    if (open) {
      supabase.from('profiles').select('id, name, avatar, role').in('role', ['mentor', 'mscer'])
        .then(({ data }) => data && setMembers(data))
    }
  }, [open])

  const handleUpload = async (e: any, target: 'thumb' | 'content') => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(target)
    try {
      const path = `${target}/${Date.now()}_${file.name}`
      const { error } = await supabase.storage.from('media').upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)

      if (target === 'thumb') setFormData({ ...formData, image: publicUrl })
      else {
        const insertText = `\n![Mô tả](${publicUrl})\n`
        const start = contentRef.current?.selectionStart || 0
        const newContent = formData.content.substring(0, start) + insertText + formData.content.substring(start)
        setFormData({ ...formData, content: newContent })
      }
      toast({ title: "Cập nhật ảnh thành công!" })
    } catch (err) { toast({ title: "Lỗi upload", variant: "destructive" }) }
    finally { setUploading(null) }
  }

  const handleSave = async () => {
    if (!formData.title || !formData.author_id) return toast({ title: "Thiếu thông tin" })
    setLoading(true)
    const { data, error } = await supabase
      .from('articles')
      .update(formData)
      .eq('id', article.id)
      .select()

    if (!error) {
      onUpdateArticle(data[0])
      toast({ title: "Đã lưu thay đổi!" })
      onClose()
    } else {
      toast({ title: "Lỗi khi lưu", variant: "destructive" })
    }
    setLoading(false)
  }

  if (!formData) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 border-none shadow-2xl bg-white text-slate-900">
        <DialogHeader className="sr-only"><DialogTitle>Sửa bài viết</DialogTitle><DialogDescription>CMS</DialogDescription></DialogHeader>
        
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Edit3 className="text-white h-6 w-6" />
            <h2 className="text-xl font-bold font-serif">Chỉnh sửa bài viết</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="text-white hover:bg-blue-700" onClick={onClose}>Hủy</Button>
            <Button disabled={loading} className="bg-white text-blue-600 hover:bg-slate-100 px-6 font-bold" onClick={handleSave}>
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Lưu thay đổi
            </Button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-900">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
                <Label className="text-slate-500 font-bold uppercase text-[10px]">Tiêu đề bài viết</Label>
                <Input 
                className="text-2xl font-bold py-6 border-slate-200 focus:ring-blue-500" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
            </div>

            <div className="space-y-2 text-slate-900">
              <div className="flex gap-2 p-2 bg-slate-100 rounded-t-xl border border-b-0">
                <Button variant="secondary" size="sm" className="relative bg-white shadow-sm border">
                  <ImageIcon className="h-4 w-4 mr-2 text-blue-500" /> Đổi ảnh nội dung
                  <input type="file" className="absolute inset-0 opacity-0" onChange={(e) => handleUpload(e, 'content')} />
                </Button>
              </div>
              <Textarea ref={contentRef} className="min-h-[500px] border-slate-200 rounded-t-none text-lg p-6 font-sans leading-relaxed" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-slate-500">Tác giả hiện tại</Label>
                <Select value={formData.author_id} onValueChange={(id) => setFormData({...formData, author_id: id})}>
                  <SelectTrigger className="bg-white h-12 text-slate-900"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white text-slate-900">
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6"><AvatarImage src={m.avatar}/></Avatar>
                          <span className="text-sm font-medium">{m.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="text-xs font-bold uppercase text-slate-500 text-slate-900">Ảnh bìa (Thumbnail)</Label>
                <div className="relative aspect-video rounded-xl bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group">
                    <img src={formData.image} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity">
                        <Loader2 className={`h-6 w-6 text-white ${uploading === 'thumb' ? 'animate-spin' : 'hidden'}`} />
                        <span className="text-white text-[10px] font-bold">NHẤN ĐỂ THAY ẢNH</span>
                        <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'thumb')} />
                    </label>
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                 <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-600">Bài nổi bật</span>
                  <Switch checked={formData.featured} onCheckedChange={(v) => setFormData({...formData, featured: v})} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Thêm icon Edit3 từ lucide nếu chưa có
import { Edit3 } from 'lucide-react'