"use client"

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { X, ImageIcon, Loader2, Save, Edit3, Upload } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function EditArticleModal({ open, onClose, article, onUpdateArticle }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [formData, setFormData] = useState<any>(null)

  useEffect(() => {
    if (article) setFormData({ ...article })
    if (open) {
      supabase.from('profiles').select('id, full_name, avatar_url, role').in('role', ['mentor', 'mscer'])
        .then(({ data }) => data && setMembers(data))
    }
  }, [article, open])

  // Logic Upload dùng chung cho Thumbnail và Content
  const uploadImage = async (e: any, folder: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(folder)
    try {
      const path = `blog/${folder}/${Date.now()}_${file.name}`
      const { error } = await supabase.storage.from('media').upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)

      if (folder === 'thumbnails') setFormData({ ...formData, image: publicUrl })
      else {
        const insertText = `\n![Image](${publicUrl})\n`
        const start = contentRef.current?.selectionStart || 0
        const newContent = formData.content.substring(0, start) + insertText + formData.content.substring(start)
        setFormData({ ...formData, content: newContent })
      }
      toast({ title: "Đã tải ảnh lên!" })
    } catch (err) { toast({ title: "Lỗi tải ảnh", variant: "destructive" }) }
    finally { setUploading(null) }
  }

  const handleSave = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('articles').update(formData).eq('id', article.id).select()
    if (!error) {
      onUpdateArticle(data[0])
      toast({ title: "Đã lưu thay đổi!" })
      onClose()
    }
    setLoading(false)
  }

  if (!formData) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 bg-white text-slate-900">
        <DialogHeader className="sr-only"><DialogTitle>Sửa bài viết</DialogTitle></DialogHeader>
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2"><Edit3 size={20} /> <h2 className="font-bold">Chỉnh sửa bài viết</h2></div>
          <Button disabled={loading} className="bg-white text-blue-600 font-bold" onClick={handleSave}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Lưu bài viết
          </Button>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Input className="text-2xl font-bold py-6" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            <div className="space-y-2">
              <div className="flex gap-2 p-2 bg-slate-100 rounded-t-lg border border-b-0">
                <Button variant="secondary" size="sm" className="relative bg-white">
                  <ImageIcon size={14} className="mr-2" /> {uploading === 'content' ? 'Đang tải...' : 'Chèn ảnh nội dung'}
                  <input type="file" className="absolute inset-0 opacity-0" onChange={(e) => uploadImage(e, 'content')} />
                </Button>
              </div>
              <Textarea ref={contentRef} className="min-h-[400px] rounded-t-none" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border space-y-4">
              <Label className="text-xs font-bold uppercase">Ảnh đại diện</Label>
              <div className="relative aspect-video bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed">
                {formData.image ? (
                  <><img src={formData.image} className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer text-white text-xs font-bold transition-opacity">
                    ĐỔI ẢNH <input type="file" className="hidden" onChange={(e) => uploadImage(e, 'thumbnails')} />
                  </label></>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center">
                    <Upload size={20} className="text-slate-400" />
                    <input type="file" className="hidden" onChange={(e) => uploadImage(e, 'thumbnails')} />
                  </label>
                )}
              </div>
              <div className="pt-4 border-t">
                <Label className="text-xs font-bold">Tác giả</Label>
                <Select value={formData.author_id} onValueChange={(id) => setFormData({...formData, author_id: id})}>
                  <SelectTrigger className="bg-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}