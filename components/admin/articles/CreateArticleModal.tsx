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
import { X, Plus, Image as ImageIcon, Loader2, Send, Wand2, UserCheck } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
// Thêm các dòng này vào phần import ở đầu file
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link' // Để phòng trường hợp bạn dùng Link ở dưới
export function CreateArticleModal({ open, onClose, onCreateArticle }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [formData, setFormData] = useState({ title: '', slug: '', excerpt: '', content: '', category: 'news', image: '', author_id: '', featured: false })

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
      toast({ title: "Đã tải ảnh lên!" })
    } catch (err) { toast({ title: "Lỗi upload", variant: "destructive" }) }
    finally { setUploading(null) }
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.author_id) return toast({ title: "Thiếu tiêu đề hoặc tác giả" })
    setLoading(true)
    const { data, error } = await supabase.from('articles').insert([formData]).select()
    if (!error) {
      onCreateArticle(data[0])
      onClose()
      setFormData({ title: '', slug: '', excerpt: '', content: '', category: 'news', image: '', author_id: '', featured: false })
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 border-none shadow-2xl bg-white">
        <DialogHeader className="sr-only"><DialogTitle>Soạn bài</DialogTitle><DialogDescription>CMS</DialogDescription></DialogHeader>
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Wand2 className="text-blue-400" />
            <h2 className="text-xl font-bold font-serif text-white">Soạn thảo bài viết MSC</h2>
          </div>
          <div className="flex gap-2 text-white">
            <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={onClose}>Hủy</Button>
            <Button disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-6 font-bold" onClick={handleSubmit}>
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />} Xuất bản
            </Button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Input 
              className="text-3xl font-bold py-10 border-none bg-slate-50 focus-visible:ring-0 placeholder:text-slate-200" 
              placeholder="Nhập tiêu đề hấp dẫn tại đây..."
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
            />
            <div className="space-y-2">
              <div className="flex gap-2 p-2 bg-slate-100 rounded-t-xl border border-b-0">
                <Button variant="secondary" size="sm" className="relative bg-white shadow-sm border">
                  <ImageIcon className="h-4 w-4 mr-2 text-blue-500" /> Chèn ảnh nội dung
                  <input type="file" className="absolute inset-0 opacity-0" onChange={(e) => handleUpload(e, 'content')} />
                </Button>
              </div>
              <Textarea ref={contentRef} className="min-h-[500px] border-slate-200 rounded-t-none text-lg p-6 font-sans leading-relaxed" placeholder="Bắt đầu câu chuyện của bạn..." value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-slate-500">Tác giả (Mentor/MSCer)</Label>
                <Select value={formData.author_id} onValueChange={(id) => setFormData({...formData, author_id: id})}>
                  <SelectTrigger className="bg-white h-12"><SelectValue placeholder="Chọn người viết..." /></SelectTrigger>
                  <SelectContent>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6"><AvatarImage src={m.avatar}/></Avatar>
                          <span className="text-sm font-medium">{m.name}</span>
                          <Badge variant="secondary" className="text-[8px] px-1">{m.role}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-xs font-bold uppercase text-slate-500">Ảnh bìa đại diện</Label>
                <div className="relative aspect-video rounded-xl bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group">
                  {formData.image ? (
                    <><img src={formData.image} className="w-full h-full object-cover" /><Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" onClick={() => setFormData({...formData, image: ''})}><X className="h-4 w-4" /></Button></>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      {uploading === 'thumb' ? <Loader2 className="animate-spin text-blue-500" /> : <Plus className="text-slate-400" />}
                      <span className="text-[10px] mt-1 text-slate-500">Tải ảnh bìa</span>
                      <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'thumb')} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}