"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, Save, FolderPlus, Upload, X, Star, 
  CheckCircle2, Lock, Unlock, Search,Edit, Globe 
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function CreateProjectModal({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [authors, setAuthors] = useState<any[]>([]) 
  const [isSlugLocked, setIsSlugLocked] = useState(true) // // Nguồn: Khóa slug để tự động tạo theo tiêu đề
  
  const [formData, setFormData] = useState({
    title: '', 
    slug: '', 
    category: '', 
    description: '', // Mô tả ngắn (SEO Description)
    detailproject: '', 
    image: '', 
    status: 'ongoing', 
    author_ids: [] as string[], 
    featured: false,
    seo_title: '', // // Nguồn: Thêm SEO Title
    seo_keywords: '' // // Nguồn: Thêm Keywords
  })

  useEffect(() => {
    const fetchAuthors = async () => {
      if (!isOpen) return;
      try {
        const { data, error } = await supabase
          .from('authors')
          .select('id, full_name, avatar_url, title')
          .order('full_name', { ascending: true });
        if (error) throw error;
        setAuthors(data || []);
      } catch (err: any) {
        console.error("❌ Lỗi load chuyên gia:", err.message);
      }
    };
    fetchAuthors();
  }, [isOpen])

  // // Nguồn: Hàm tạo Slug chuẩn SEO Quốc tế
  const generateSlug = (text: string) => {
    return text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Khử dấu
      .replace(/[đĐ]/g, "d") // Xử lý chữ đ
      .replace(/([^0-9a-z-\s])/g, "") // Xóa ký tự đặc biệt
      .replace(/(\s+)/g, "-") // Thay khoảng trắng bằng -
      .replace(/-+/g, "-") // Xóa gạch ngang thừa
      .replace(/^-+|-+$/g, ""); // Xóa gạch ngang đầu cuối
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: isSlugLocked ? generateSlug(newTitle) : prev.slug,
      seo_title: isSlugLocked ? newTitle : prev.seo_title
    }));
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return
      const fileName = `${Date.now()}.${file.name.split('.').pop()}`
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
    if (!formData.title || !formData.slug) return toast({ title: "Thiếu tiêu đề hoặc Slug", variant: "destructive" });
    if (!formData.image) return toast({ title: "Vui lòng tải ảnh bìa", variant: "destructive" });

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...formData,
          title: formData.title.trim(),
          slug: formData.slug.trim(),
          author_ids: formData.author_ids || []
        }])
        .select();

      if (error) throw error;
      if (data) {
        onSuccess(data[0]);
        toast({ title: "Tạo dự án thành công!" });
        onClose();
        setFormData({ title: '', slug: '', category: '', description: '', detailproject: '', image: '', status: 'ongoing', author_ids: [], featured: false, seo_title: '', seo_keywords: '' });
      }
    } catch (error: any) {
      toast({ title: "Lỗi tạo dự án", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-white border-none shadow-2xl rounded-[2.5rem] p-0 font-montserrat">
        <DialogHeader className="p-8 bg-slate-50 border-b">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
              <FolderPlus className="text-white h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-800">Cấu hình dự án & SEO</DialogTitle>
              <DialogDescription className="font-medium text-slate-500 italic">Tối ưu hóa nội dung hiển thị và khả năng tìm kiếm trên Google.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* CỘT TRÁI: NỘI DUNG & SEO */}
          <div className="md:col-span-8 p-8 space-y-8 border-r">
            
            {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                  <Edit size={12}/> Tiêu đề chính (H1)
                </Label>
                <Input 
                  className="h-14 text-xl font-bold border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500"
                  value={formData.title} 
                  onChange={handleTitleChange} 
                  placeholder="VD: Dự án Đào tạo Doanh nghiệp Vinfast 2024" 
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Search size={12}/> Đường dẫn URL (Slug SEO)
                  </Label>
                  <Button 
                    variant="ghost" size="sm" 
                    className="h-7 text-[10px] font-bold gap-1 text-slate-400"
                    onClick={() => setIsSlugLocked(!isSlugLocked)}
                  >
                    {isSlugLocked ? <Lock size={12}/> : <Unlock size={12} className="text-amber-500"/>}
                    {isSlugLocked ? "ĐANG TỰ ĐỘNG" : "TỰ CHỈNH TAY"}
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold italic">msc-center.edu.vn/du-an/</div>
                  <Input 
                    className={`h-12 pl-[155px] font-mono text-xs font-bold rounded-xl ${isSlugLocked ? 'bg-slate-50 text-slate-400' : 'bg-amber-50 text-amber-600 border-amber-200'}`}
                    value={formData.slug} 
                    readOnly={isSlugLocked}
                    onChange={(e) => setFormData({...formData, slug: generateSlug(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            {/* PHẦN 2: SEO METADATA */}
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500"/> Cấu hình SEO (Metadata)
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500">SEO Title (Tiêu đề hiển thị trên Google)</Label>
                  <Input 
                    className="bg-white border-slate-200" 
                    value={formData.seo_title} 
                    onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500">Meta Description (Mô tả hiển thị Google)</Label>
                  <Textarea 
                    rows={2} className="bg-white border-slate-200 text-xs" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Viết 150-160 ký tự để tối ưu tìm kiếm..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Nội dung chi tiết dự án</Label>
              <Textarea 
                className="min-h-[350px] font-mono border-slate-200 rounded-2xl p-6 leading-relaxed bg-slate-50/20" 
                value={formData.detailproject} 
                onChange={(e) => setFormData({...formData, detailproject: e.target.value})} 
                placeholder="Viết nội dung bài viết bằng Markdown..." 
              />
            </div>
          </div>

          {/* CỘT PHẢI: CHUYÊN GIA & MEDIA */}
          <div className="md:col-span-4 bg-slate-50/50 p-8 space-y-8">
            {/* THUMBNAIL */}
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Ảnh đại diện SEO (Thumbnail)</Label>
              <div className="relative aspect-video border-2 border-dashed border-slate-300 rounded-[2rem] bg-white flex flex-col items-center justify-center overflow-hidden group hover:border-blue-400 transition-all shadow-inner">
                {formData.image ? (
                  <div className="relative w-full h-full">
                    <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                    <button className="absolute top-4 right-4 bg-red-500 p-2 rounded-full text-white shadow-xl hover:scale-110 transition-transform" onClick={() => setFormData({...formData, image: ''})}><X size={16} /></button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-3 p-6 text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                      {uploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Tải ảnh chất lượng cao</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>

            {/* PHẦN CHỌN CHUYÊN GIA */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Chuyên gia phụ trách</Label>
                <Badge className="bg-blue-600 font-black text-[9px]">{formData.author_ids.length} Đã chọn</Badge>
              </div>
              <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar bg-white p-2 rounded-2xl border border-slate-200">
                {authors.map(a => {
                  const isSelected = formData.author_ids.includes(a.id);
                  return (
                    <div 
                      key={a.id} 
                      onClick={() => setFormData({...formData, author_ids: isSelected ? formData.author_ids.filter(id => id !== a.id) : [...formData.author_ids, a.id]})}
                      className={`flex items-center gap-3 p-2 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-blue-600 bg-blue-50/50' : 'border-slate-50 bg-slate-50/30 hover:border-blue-200'}`}
                    >
                      <Avatar className="h-9 w-9 border-2 border-white shadow-sm shrink-0">
                        <AvatarImage src={a.avatar_url} className="object-cover" />
                        <AvatarFallback className="text-xs bg-slate-200 font-black">{a.full_name?.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <span className={`text-[10px] font-black uppercase truncate ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>{a.full_name}</span>
                        <span className="text-[8px] font-bold text-slate-400 truncate italic">{a.title || 'Chuyên gia'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* DỰ ÁN TIÊU BIỂU */}
            <div 
              className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.featured ? 'border-yellow-400 bg-yellow-50 shadow-md shadow-yellow-100' : 'border-slate-100 bg-white hover:border-slate-200'}`}
              onClick={() => setFormData({...formData, featured: !formData.featured})}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${formData.featured ? 'bg-yellow-400' : 'bg-slate-100'}`}>
                  <Star size={16} className={formData.featured ? 'text-white fill-white' : 'text-slate-400'} />
                </div>
                <span className="text-[10px] font-black uppercase text-slate-600">Dự án tiêu biểu</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.featured ? 'bg-yellow-400' : 'bg-slate-200'}`}>
                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.featured ? 'right-1' : 'left-1'}`} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 bg-white border-t flex justify-between items-center">
          <Button variant="ghost" onClick={onClose} disabled={loading} className="font-black uppercase text-[10px] text-slate-400">Đóng</Button>
          <Button disabled={loading || uploading} className="h-14 px-12 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all" onClick={handleSave}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />} Lưu dự án
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}