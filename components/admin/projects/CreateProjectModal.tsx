"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Save, FolderPlus, Upload, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function CreateProjectModal({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mentors, setMentors] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '', slug: '', category: 'Giáo dục', description: '', 
    detailproject: '', image: '', status: 'ongoing', mentor_ids: [] as string[]
  })

  useEffect(() => {
    if (isOpen) {
      supabase.from('profiles').select('id, full_name, avatar_url').eq('role', 'mentor')
        .then(({ data }) => data && setMentors(data))
    }
  }, [isOpen])

  // Logic Upload Ảnh cho Dự án
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `project-thumbnails/${fileName}`

      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('media').getPublicUrl(filePath)
      setFormData({ ...formData, image: data.publicUrl })
      toast({ title: "Tải ảnh thành công!" })
    } catch (error: any) {
      toast({ title: "Lỗi tải ảnh", description: error.message, variant: "destructive" })
    } finally { setUploading(false) }
  }

  const handleSave = async () => {
  if (!formData.title || !formData.slug) return toast({ title: "Thiếu tên hoặc slug" });
  if (!formData.image) return toast({ title: "Thiếu ảnh dự án" });

  setLoading(true);
  
  // CHỈ gửi những trường CÓ TRONG bảng projects bạn vừa liệt kê
  const dataToInsert = {
    title: formData.title,
    slug: formData.slug,
    category: formData.category, // Cột này đã có trong danh sách bạn gửi
    description: formData.description,
    detailproject: formData.detailproject,
    image: formData.image,
    status: formData.status,
    mentor_ids: formData.mentor_ids || [], // Phải là mảng
    featured: formData.featured || false
  };

  const { data, error } = await supabase
    .from('projects')
    .insert([dataToInsert])
    .select();

  if (error) {
    console.error("Lỗi debug:", error);
    // Nếu vẫn lỗi PGRST204, hãy đợi 30s sau khi chạy lệnh NOTIFY ở Bước 1
    toast({ title: `Lỗi ${error.code}: ${error.message}`, variant: "destructive" });
  } else {
    onSuccess(data[0]);
    onClose();
    toast({ title: "Thành công!" });
  }
  setLoading(false);
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="flex gap-2"><FolderPlus /> Tạo dự án mới</DialogTitle>
          <DialogDescription>Dữ liệu hiển thị tại msc.edu.vn/du-an</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label className="font-bold">Tên dự án</Label>
              <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} placeholder="VD: Einstein School HCM" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Mô tả ngắn</Label>
              <Textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Tóm tắt dự án..." />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-blue-600">Nội dung chi tiết (Markdown)</Label>
              <Textarea className="min-h-[400px] font-mono" value={formData.detailproject} onChange={(e) => setFormData({...formData, detailproject: e.target.value})} placeholder="Viết chi tiết dự án..." />
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Ảnh bìa dự án</Label>
              <div className="relative border-2 border-dashed rounded-lg p-4 bg-white flex flex-col items-center justify-center min-h-[160px]">
                {formData.image ? (
                  <div className="relative w-full aspect-video">
                    <img src={formData.image} className="w-full h-full object-cover rounded-md" />
                    <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={() => setFormData({...formData, image: ''})}><X size={12} /></Button>
                  </div>
                ) : (
                  <label className="cursor-pointer text-center">
                    {uploading ? <Loader2 className="animate-spin mx-auto" /> : <Upload className="mx-auto text-slate-400" />}
                    <span className="text-sm block mt-2">Tải ảnh lên</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Mentor Phụ trách</Label>
              <div className="grid gap-2 max-h-48 overflow-y-auto pr-2">
                {mentors.map(m => (
                  <div key={m.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${formData.mentor_ids.includes(m.id) ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
                    onClick={() => setFormData({...formData, mentor_ids: formData.mentor_ids.includes(m.id) ? formData.mentor_ids.filter(id => id !== m.id) : [...formData.mentor_ids, m.id]})}>
                    <Avatar className="h-6 w-6"><AvatarImage src={m.avatar_url}/></Avatar>
                    <span className="text-xs font-medium">{m.full_name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button disabled={loading || uploading} className="bg-blue-600" onClick={handleSave}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />} Tạo dự án
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}