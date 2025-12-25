"use client"

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { X, ImageIcon, Loader2, Save, Edit3, Upload } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function EditArticleModal({ open, onClose, article, onUpdateArticle }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [formData, setFormData] = useState<any>(null)

  // Đồng bộ dữ liệu bài viết vào Form
  useEffect(() => {
    if (article && open) {
      setFormData({ ...article })
      // Load danh sách thành viên làm tác giả
      supabase.from('profiles')
        .select('id, full_name, avatar_url, role')
        .in('role', ['mentor', 'mscer'])
        .then(({ data }) => data && setMembers(data))
    }
  }, [article, open])

  // Xử lý Upload Ảnh (Thumbnail hoặc chèn vào Content)
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, folder: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(folder)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const path = `blog/${folder}/${fileName}`

      const { error: uploadError } = await supabase.storage.from('media').upload(path, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)

      if (folder === 'thumbnails') {
        setFormData((prev: any) => ({ ...prev, image: publicUrl }))
      } else {
        // Chèn ảnh vào vị trí con trỏ trong Textarea
        const insertText = `\n![Hình ảnh](${publicUrl})\n`
        const textarea = contentRef.current
        if (textarea) {
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const currentContent = formData.content || ""
          const newContent = currentContent.substring(0, start) + insertText + currentContent.substring(end)
          setFormData((prev: any) => ({ ...prev, content: newContent }))
        }
      }
      toast({ title: "Tải ảnh thành công!" })
    } catch (err: any) {
      toast({ title: "Lỗi tải ảnh", description: err.message, variant: "destructive" })
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async () => {
    if (!formData.title) return toast({ title: "Tiêu đề không được để trống" })
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('articles')
        .update({
          title: formData.title,
          content: formData.content,
          image: formData.image,
          author_id: formData.author_id,
          category: formData.category,
          status: formData.status
          // Thêm các trường khác của bạn ở đây
        })
        .eq('id', article.id)
        .select()

      if (error) throw error

      // Nếu Supabase trả về data thành công, dùng data[0], nếu không dùng formData hiện tại
      const updatedData = (data && data.length > 0) ? data[0] : formData
      
      onUpdateArticle(updatedData)
      toast({ title: "Cập nhật bài viết thành công!" })
      onClose()
    } catch (err: any) {
      console.error("Update error:", err)
      toast({ title: "Lỗi cập nhật", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (!formData) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 bg-white text-slate-900 border-none shadow-2xl">
        {/* Header Thanh công cụ */}
        <div className="bg-blue-600 p-5 text-white flex justify-between items-center sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Edit3 size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-none">Chỉnh sửa bài viết</h2>
              <p className="text-blue-100 text-xs mt-1">ID: {article.id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={onClose}>Hủy</Button>
            <Button disabled={loading} className="bg-white text-blue-600 font-bold hover:bg-blue-50" onClick={handleSave}>
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Lưu thay đổi
            </Button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Soạn thảo */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Tiêu đề bài viết</Label>
              <Input 
                className="text-xl font-bold py-6 border-slate-200 focus:border-blue-500 focus:ring-blue-500" 
                placeholder="Nhập tiêu đề..."
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Nội dung bài viết (Markdown)</Label>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex gap-2 p-2 bg-slate-50 border-b border-slate-200">
                  <Button variant="outline" size="sm" className="relative bg-white text-slate-600 h-8">
                    <ImageIcon size={14} className="mr-2" /> 
                    {uploading === 'content' ? 'Đang tải...' : 'Chèn ảnh vào nội dung'}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => uploadImage(e, 'content')} />
                  </Button>
                </div>
                <Textarea 
                  ref={contentRef} 
                  className="min-h-[500px] border-none focus:ring-0 text-base leading-relaxed p-4" 
                  placeholder="Bắt đầu viết nội dung tại đây..."
                  value={formData.content} 
                  onChange={(e) => setFormData({...formData, content: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* Cột phải: Cài đặt */}
          <aside className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Ảnh đại diện bài viết</Label>
                <div className="relative aspect-video bg-slate-200 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors group">
                  {formData.image ? (
                    <>
                      <img src={formData.image} className="w-full h-full object-cover" alt="Thumbnail" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <label className="bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-bold cursor-pointer hover:bg-blue-50">
                          ĐỔI ẢNH
                          <input type="file" className="hidden" onChange={(e) => uploadImage(e, 'thumbnails')} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="bg-white p-3 rounded-full shadow-sm text-slate-400">
                        <Upload size={20} />
                      </div>
                      <span className="text-xs font-medium text-slate-500">Tải ảnh lên</span>
                      <input type="file" className="hidden" onChange={(e) => uploadImage(e, 'thumbnails')} />
                    </label>
                  )}
                  {uploading === 'thumbnails' && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Tác giả bài viết</Label>
                <Select value={formData.author_id} onValueChange={(id) => setFormData({...formData, author_id: id})}>
                  <SelectTrigger className="bg-white border-slate-200 h-11">
                    <SelectValue placeholder="Chọn tác giả" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={m.avatar_url} />
                          </Avatar>
                          {m.full_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Trạng thái xuất bản</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                  <SelectTrigger className="bg-white border-slate-200 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="published">Xuất bản</SelectItem>
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