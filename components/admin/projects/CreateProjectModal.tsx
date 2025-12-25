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
import { Loader2, Save, FolderPlus, Upload, X, Star } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function CreateProjectModal({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mentors, setMentors] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    title: '', 
    slug: '', 
    category: 'Giáo dục', 
    description: '', 
    detailproject: '', 
    image: '', 
    status: 'ongoing', 
    mentor_ids: [] as string[],
    featured: false 
  })

  // Load danh sách mentor để chọn
  useEffect(() => {
    if (isOpen) {
      supabase.from('profiles').select('id, full_name, avatar_url').eq('role', 'mentor')
        .then(({ data }) => data && setMentors(data))
    }
  }, [isOpen])

  // Hàm tạo Slug sạch (Xóa dấu tiếng Việt, ký tự đặc biệt) để tránh lỗi 404
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
  }

  // Logic Upload Ảnh trực tiếp từ máy lên Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
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
  if (!formData.title || !formData.slug) {
    return toast({ title: "Vui lòng nhập tiêu đề", variant: "destructive" });
  }
  if (!formData.image) {
    return toast({ title: "Vui lòng tải ảnh bìa dự án", variant: "destructive" });
  }

  setLoading(true);

  try {
    // TẠO PAYLOAD SẠCH: Chỉ gửi các trường cần thiết
    const insertData = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      category: formData.category,
      description: formData.description.trim(),
      detailproject: formData.detailproject.trim(),
      image: formData.image,
      status: formData.status,
      mentor_ids: formData.mentor_ids || [],
      featured: formData.featured || false
      // Tuyệt đối không để 'id' hay 'updated_at' ở đây
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([insertData])
      .select();

    if (error) {
      // Xử lý lỗi trùng Slug (409)
      if (error.code === '23505') {
        throw new Error("Slug (đường dẫn) này đã tồn tại. Vui lòng đổi tiêu đề bài viết.");
      }
      throw error;
    }

    if (data && data.length > 0) {
      if (typeof onSuccess === 'function') onSuccess(data[0]);
      toast({ title: "Tạo dự án thành công!" });
      
      // Reset form
      setFormData({ 
        title: '', slug: '', category: 'Giáo dục', 
        description: '', detailproject: '', image: '', 
        status: 'ongoing', mentor_ids: [], featured: false 
      });
      onClose();
    }
  } catch (error: any) {
    console.error("Lỗi insert:", error);
    toast({ 
      title: "Lỗi tạo dự án", 
      description: error.message || "Kiểm tra lại dữ liệu nhập vào", 
      variant: "destructive" 
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white text-slate-900 shadow-2xl border-none">
        <DialogHeader>
          <DialogTitle className="flex gap-2 text-2xl font-bold font-serif text-blue-700">
            <FolderPlus /> Tạo dự án MSC mới
          </DialogTitle>
          <DialogDescription>Hồ sơ này sẽ hiển thị trực tiếp tại mục Dự án trên website.</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6">
          {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Tên dự án (Title)</Label>
              <Input 
                maxLength={150}
                className="text-lg font-bold border-slate-200 focus:ring-blue-500"
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value, slug: generateSlug(e.target.value)})} 
                placeholder="VD: Dự án Đào tạo Einstein School" 
              />
              <p className="text-[10px] text-slate-400 italic">Slug tự động: {formData.slug}</p>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest text-blue-600">Mô tả ngắn (Card Description)</Label>
              <Textarea rows={3} className="border-slate-200" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Tóm tắt dự án trong 2-3 câu..." />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest text-blue-600">Nội dung chi tiết (Markdown Support)</Label>
              <Textarea className="min-h-[350px] font-mono border-slate-200 leading-relaxed" value={formData.detailproject} onChange={(e) => setFormData({...formData, detailproject: e.target.value})} placeholder="Viết chi tiết dự án, bạn có thể chèn ảnh bằng Markdown format..." />
            </div>
          </div>

          {/* CỘT PHẢI: CẤU HÌNH & MEDIA */}
          <div className="space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-5">
              <div className="space-y-2">
                <Label className="font-bold text-slate-500 uppercase text-[10px]">Ảnh bìa (Thumbnail)</Label>
                <div className="relative aspect-video border-2 border-dashed border-slate-300 rounded-xl bg-white flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 transition-colors">
                  {formData.image ? (
                    <div className="relative w-full h-full">
                      <img src={formData.image} className="w-full h-full object-cover" />
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg" onClick={() => setFormData({...formData, image: ''})}><X size={14} /></Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer text-center p-4 w-full h-full flex flex-col items-center justify-center">
                      {uploading ? <Loader2 className="animate-spin text-blue-500" /> : <Upload className="text-slate-300 mb-2" size={32} />}
                      <span className="text-xs font-medium text-slate-500">Tải ảnh từ máy lên</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-500 uppercase text-[10px]">Lĩnh vực</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Giáo dục">Giáo dục</SelectItem>
                    <SelectItem value="Công nghệ">Công nghệ</SelectItem>
                    <SelectItem value="Đào tạo">Đào tạo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-500 uppercase text-[10px]">Mentor phụ trách</Label>
                <div className="grid gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {mentors.map(m => (
                    <div key={m.id} className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${formData.mentor_ids.includes(m.id) ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                      onClick={() => setFormData({...formData, mentor_ids: formData.mentor_ids.includes(m.id) ? formData.mentor_ids.filter(id => id !== m.id) : [...formData.mentor_ids, m.id]})}>
                      <Avatar className="h-7 w-7 border"><AvatarImage src={m.avatar_url}/></Avatar>
                      <span className="text-xs font-semibold">{m.full_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* NÚTfeatured TIÊU BIỂU */}
              <div 
                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.featured ? 'border-yellow-400 bg-yellow-50' : 'border-slate-100 bg-white'}`}
                onClick={() => setFormData({...formData, featured: !formData.featured})}
              >
                <div className="flex items-center gap-2">
                  <Star size={16} className={formData.featured ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Dự án tiêu biểu</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.featured ? 'bg-yellow-400' : 'bg-slate-200'}`}>
                   <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${formData.featured ? 'right-1' : 'left-1'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-6">
          <Button variant="outline" onClick={onClose} className="px-8 border-slate-200">Hủy</Button>
          <Button disabled={loading || uploading} className="bg-blue-700 hover:bg-blue-800 px-10 shadow-lg shadow-blue-200" onClick={handleSave}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />} Xuất bản dự án
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}