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
import { Loader2, Save, Edit, Upload, X, Star } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function EditProjectModal({ isOpen, onClose, project, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mentors, setMentors] = useState<any[]>([])
  const [formData, setFormData] = useState<any>(null)

  // Khởi tạo dữ liệu khi mở Modal
  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        ...project,
        mentor_ids: project.mentor_ids || [],
        featured: project.featured || false
      })
      
      // Load danh sách mentor để chọn
      supabase.from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'mentor')
        .then(({ data }) => data && setMentors(data))
    }
  }, [project, isOpen])

  // Hàm tạo Slug sạch khi sửa tiêu đề (Tránh lỗi 404 URL rác)
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

  // Logic Upload Ảnh mới cho dự án
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
      toast({ title: "Đã cập nhật ảnh mới!" })
    } catch (error: any) {
      toast({ title: "Lỗi tải ảnh", description: error.message, variant: "destructive" })
    } finally { setUploading(false) }
  }

  const handleUpdate = async () => {
    if (!formData?.title || !formData?.slug) {
      return toast({ title: "Vui lòng nhập đầy đủ tiêu đề và slug", variant: "destructive" });
    }

    setLoading(true);
    try {
      // CHỈ gửi các trường cần update, loại bỏ các trường hệ thống để tránh lỗi Supabase
      const updateData = {
        title: formData.title,
        slug: formData.slug,
        category: formData.category,
        description: formData.description,
        detailproject: formData.detailproject,
        image: formData.image,
        status: formData.status,
        mentor_ids: formData.mentor_ids,
        featured: formData.featured
      };

      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', project.id)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Trả dữ liệu thực tế về cho page.tsx cập nhật UI
        if (typeof onSuccess === 'function') {
          onSuccess(data[0]);
        }
        toast({ title: "Thành công", description: "Dự án đã được cập nhật." });
        onClose();
      } else {
        // Fallback nếu select() không trả về data (do RLS)
        onSuccess({ ...project, ...updateData });
        onClose();
      }
    } catch (error: any) {
      console.error("Update error:", error);
      toast({ 
        title: "Lỗi cập nhật", 
        description: error.message || "Kiểm tra quyền RLS hoặc kết nối mạng", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white text-slate-900 shadow-2xl border-none">
        <DialogHeader>
          <DialogTitle className="flex gap-2 text-2xl font-bold text-blue-700">
            <Edit className="h-6 w-6" /> Chỉnh sửa: {project?.title}
          </DialogTitle>
          <DialogDescription>Điều chỉnh thông tin chi tiết bài viết dự án.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6">
          {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Tiêu đề dự án</Label>
              <Input 
                className="text-lg font-bold border-slate-200" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value, slug: generateSlug(e.target.value)})} 
              />
              <p className="text-[10px] text-slate-400 italic">Slug tự động: {formData.slug}</p>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-blue-600 uppercase text-xs">Mô tả ngắn (Hiển thị ở trang danh sách)</Label>
              <Textarea rows={3} className="border-slate-200" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-blue-600 uppercase text-xs">Nội dung chi tiết (Markdown)</Label>
              <Textarea className="min-h-[400px] font-mono leading-relaxed border-slate-200" value={formData.detailproject} onChange={(e) => setFormData({...formData, detailproject: e.target.value})} />
            </div>
          </div>

          {/* CỘT PHẢI: CẤU HÌNH PHỤ */}
          <div className="space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-5">
              <div className="space-y-2">
                <Label className="font-bold text-slate-500 uppercase text-[10px]">Ảnh bìa dự án</Label>
                <div className="relative aspect-video border-2 border-dashed border-slate-300 rounded-xl bg-white flex flex-col items-center justify-center overflow-hidden group">
                  {formData.image ? (
                    <div className="relative w-full h-full">
                      <img src={formData.image} className="w-full h-full object-cover" alt="Project thumbnail" />
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-bold">
                         {uploading ? <Loader2 className="animate-spin h-5 w-5" /> : "THAY ĐỔI ẢNH"}
                         <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer text-center p-4 w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <Upload size={32} className="mb-2" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-500 uppercase text-[10px]">Trạng thái triển khai</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Lên kế hoạch</SelectItem>
                    <SelectItem value="ongoing">Đang triển khai</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-500 uppercase text-[10px]">Đội ngũ Mentor tham gia</Label>
                <div className="grid gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar border bg-white p-2 rounded-lg">
                  {mentors.map(m => (
                    <div key={m.id} className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${formData.mentor_ids?.includes(m.id) ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-100'}`}
                      onClick={() => {
                        const ids = formData.mentor_ids || []
                        const nextIds = ids.includes(m.id) ? ids.filter((id:any) => id !== m.id) : [...ids, m.id]
                        setFormData({...formData, mentor_ids: nextIds})
                      }}>
                      <Avatar className="h-7 w-7 border shadow-sm"><AvatarImage src={m.avatar_url}/></Avatar>
                      <span className="text-xs font-semibold">{m.full_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DỰ ÁN TIÊU BIỂU (FEATURED) */}
              <div 
                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.featured ? 'border-yellow-400 bg-yellow-50' : 'border-slate-100 bg-white'}`}
                onClick={() => setFormData({...formData, featured: !formData.featured})}
              >
                <div className="flex items-center gap-2">
                  <Star size={16} className={formData.featured ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'} />
                  <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider">Dự án tiêu biểu</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.featured ? 'bg-yellow-400' : 'bg-slate-200'}`}>
                   <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${formData.featured ? 'right-1' : 'left-1'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-6">
          <Button variant="outline" onClick={onClose} disabled={loading}>Hủy bỏ</Button>
          <Button disabled={loading || uploading} className="bg-blue-600 hover:bg-blue-700 px-10 shadow-lg" onClick={handleUpdate}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}