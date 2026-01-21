"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Loader2, Save, Upload, Users, Globe, Linkedin } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function AuthorModal({ isOpen, onClose, author, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<any>({
    full_name: '',
    slug: '',
    title: '',
    avatar_url: '',
    bio: '',
    linkedin_url: '',
    website_url: ''
  })

  useEffect(() => {
    if (author) {
      setFormData(author)
    } else {
      setFormData({
        full_name: '', slug: '', title: '', avatar_url: '', bio: '', linkedin_url: '', website_url: ''
      })
    }
  }, [author, isOpen])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `author-${Date.now()}.${fileExt}`
      const filePath = `authors/${fileName}`

      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath)
      setFormData((prev: any) => ({ ...prev, avatar_url: publicUrl }))
      toast({ title: "Thành công", description: "Đã tải ảnh tác giả lên." })
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    } finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!formData.full_name?.trim()) {
      return toast({ title: "Thiếu thông tin", description: "Vui lòng nhập tên tác giả", variant: "destructive" });
    }

    setLoading(true);
    try {
      const { id, created_at, updated_at, ...payload } = formData;
      
      const { error } = author?.id 
        ? await supabase.from('authors').update(payload).eq('id', author.id)
        : await supabase.from('authors').insert([payload]);

      if (error) throw error;

      toast({ title: "Thành công!", description: "Thông tin tác giả đã được lưu." });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-950 border-white/10 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <DialogHeader className="p-8 pb-4 flex flex-row items-center gap-4 bg-white/[0.02]">
          <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg">
            <Users className="text-white" size={24}/>
          </div>
          <div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Hồ sơ Tác giả</DialogTitle>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Biên tập viên & Người viết bài</p>
          </div>
        </DialogHeader>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Avatar Column */}
          <div className="space-y-6 text-center">
            <div className="relative group mx-auto w-44 h-44">
              <Avatar className="h-44 w-44 border-4 border-white/5 shadow-2xl overflow-hidden bg-slate-900">
                <AvatarImage src={formData.avatar_url} className="object-cover" />
                <AvatarFallback className="text-4xl">{uploading ? <Loader2 className="animate-spin" /> : "MSC"}</AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 backdrop-blur-sm">
                <Upload className="text-white h-8 w-8" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
            
            <div className="space-y-4 pt-4 text-left">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2"><Linkedin size={14}/> LinkedIn</Label>
                <Input className="bg-white/5 border-white/10 h-10 rounded-xl" value={formData.linkedin_url || ''} onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2"><Globe size={14}/> Website</Label>
                <Input className="bg-white/5 border-white/10 h-10 rounded-xl" value={formData.website_url || ''} onChange={(e) => setFormData({...formData, website_url: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-2 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Tên hiển thị</Label>
                <Input className="bg-white/5 border-white/10 h-12 rounded-xl font-bold" value={formData.full_name || ''} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Slug URL</Label>
                <Input className="bg-white/5 border-white/10 h-12 rounded-xl text-emerald-400" value={formData.slug || ''} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Chức vụ / Giới thiệu ngắn</Label>
              <Input className="bg-white/5 border-white/10 h-12 rounded-xl" placeholder="VD: Senior Editor / Founder..." value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Mô tả tác giả</Label>
              <Textarea rows={6} className="bg-white/5 border-white/10 rounded-xl resize-none" value={formData.bio || ''} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="p-8 bg-[#0a0a0a] border-t border-white/5 flex justify-end gap-4">
          <Button variant="ghost" onClick={onClose} className="font-black text-gray-500 rounded-full px-8 uppercase text-[10px] tracking-widest">Hủy bỏ</Button>
          <Button 
            disabled={loading || uploading} 
            onClick={handleSave} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[180px] h-14 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-emerald-600/20"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
            Lưu Tác Giả
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}