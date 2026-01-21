"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, Save, Edit, Upload, X, Star, 
  Lock, Unlock, Globe, CheckCircle2, Video, 
  Hash, Image as ImageIcon, Layout, ListOrdered
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function EditProjectModal({ isOpen, onClose, project, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [authors, setAuthors] = useState<any[]>([])
  const [formData, setFormData] = useState<any>(null)
  const [isSlugLocked, setIsSlugLocked] = useState(true)

  // // Nguồn: Khởi tạo dữ liệu đồng bộ với các trường SEO & Sắp xếp mới
  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        ...project,
        author_ids: project.author_ids || [],
        featured: project.featured || false,
        seo_title: project.seo_title || project.title,
        hashtags: project.hashtags || '',
        video_url: project.video_url || '',
        description: project.description || '',
        order_index: project.order_index || 0 // // Nguồn: Thêm vị trí sắp xếp
      });
      
      const fetchAuthors = async () => {
        const { data } = await supabase
          .from('authors')
          .select('id, full_name, avatar_url, title')
          .order('full_name', { ascending: true });
        if (data) setAuthors(data);
      };
      fetchAuthors();
    }
  }, [project, isOpen])

  const generateSlug = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/([^0-9a-z-\s])/g, "").replace(/(\s+)/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
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
      toast({ title: "Đã cập nhật hình ảnh thành công!" })
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
      // // Nguồn: Cập nhật toàn bộ payload bao gồm cả order_index
      const { data, error } = await supabase
        .from('projects')
        .update({
          title: formData.title.trim(),
          slug: formData.slug.trim(),
          category: formData.category,
          description: formData.description,
          detailproject: formData.detailproject,
          image: formData.image,
          video_url: formData.video_url,
          status: formData.status,
          author_ids: formData.author_ids,
          featured: formData.featured,
          seo_title: formData.seo_title,
          hashtags: formData.hashtags,
          order_index: parseInt(formData.order_index) || 0 // // Nguồn: Lưu thứ tự sắp xếp
        })
        .eq('id', project.id)
        .select();

      if (error) throw error;
      toast({ title: "Thành công", description: "Dự án đã được cập nhật toàn diện." });
      if (onSuccess) onSuccess(data[0]);
      onClose();
    } catch (error: any) {
      toast({ title: "Lỗi lưu dữ liệu", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[85vw] max-h-[95vh] overflow-y-auto bg-white border-none shadow-2xl rounded-[3rem] p-0 font-montserrat flex flex-col">
        
        {/* --- HEADER CMS ĐẲNG CẤP --- */}
        <DialogHeader className="p-10 bg-slate-900 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-blue-600 rounded-[1.5rem] shadow-2xl shadow-blue-500/40">
                <Edit className="text-white h-8 w-8" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-white italic">
                  Hiệu chỉnh dự án <span className="text-blue-400">Executive</span>
                </DialogTitle>
                <DialogDescription className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em] mt-2">
                  Project Order & Media Content Management
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">Priority Index: {formData.order_index}</Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-grow">
          {/* CỘT TRÁI: CONTENT & SEO */}
          <div className="lg:col-span-8 p-12 space-y-12 border-r border-slate-100">
            
            {/* 1. TIÊU ĐỀ & VỊ TRÍ SẮP XẾP */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-8 space-y-4">
                <Label className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-700 flex items-center gap-2">
                   <Layout size={14}/> Tiêu đề dự án chuyên nghiệp
                </Label>
                <Input 
                  className="h-16 text-xl font-black border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 shadow-sm uppercase placeholder:text-slate-200" 
                  value={formData.title} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({...formData, title: val, slug: isSlugLocked ? generateSlug(val) : formData.slug})
                  }} 
                />
              </div>

              {/* // Nguồn: Phần đánh số sắp xếp */}
              <div className="md:col-span-4 space-y-4">
                <Label className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                   <ListOrdered size={14}/> Vị trí sắp xếp
                </Label>
                <div className="relative">
                    <Input 
                        type="number"
                        className="h-16 text-xl font-black border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 shadow-sm text-amber-600 pl-12" 
                        value={formData.order_index} 
                        onChange={(e) => setFormData({...formData, order_index: e.target.value})}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">#</div>
                </div>
              </div>
            </div>

            {/* 2. SEO SLUG URL */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <Label className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                    <Globe size={14}/> Đường dẫn định danh (Slug SEO URL)
                  </Label>
                  <Button variant="ghost" className="h-8 text-[10px] font-black text-slate-400 hover:text-blue-600" onClick={() => setIsSlugLocked(!isSlugLocked)}>
                    {isSlugLocked ? <Lock size={14} className="mr-2"/> : <Unlock size={14} className="mr-2 text-amber-500"/>} 
                    {isSlugLocked ? "URL ĐANG KHÓA" : "CHỈNH TAY URL"}
                  </Button>
              </div>
              <Input 
                className={`h-16 font-mono text-sm font-bold rounded-2xl transition-all ${isSlugLocked ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-amber-50 border-amber-200 text-amber-700 shadow-inner'}`} 
                value={formData.slug} 
                readOnly={isSlugLocked}
                onChange={(e) => setFormData({...formData, slug: generateSlug(e.target.value)})} 
              />
            </div>

            {/* 3. MÔ TẢ NGẮN & HASHTAGS */}
            <div className="p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100 space-y-8 shadow-sm">
               <div className="flex items-center gap-3 text-blue-700 border-b border-blue-100 pb-6">
                  <Globe size={20} strokeWidth={3} />
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Cấu hình SEO & Hiển thị ngoài Card</span>
               </div>
               <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Mô tả tóm tắt dự án</Label>
                    <Textarea rows={3} className="bg-white rounded-2xl resize-none text-sm font-medium leading-relaxed border-slate-200 p-5 shadow-sm" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Viết 2-3 câu tóm tắt để xuất hiện ở trang danh sách..." />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                        <Hash size={14}/> Hashtags từ khóa
                    </Label>
                    <Input className="bg-white rounded-xl h-14 font-bold text-blue-600" value={formData.hashtags} onChange={(e) => setFormData({...formData, hashtags: e.target.value})} placeholder="Vd: mentorship, digital_marketing, msc_center..." />
                  </div>
               </div>
            </div>

            {/* 4. CHI TIẾT DỰ ÁN */}
            <div className="space-y-4">
              <Label className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-700 flex items-center gap-2 px-2">
                 Nội dung chi tiết bài viết (Markdown Support)
              </Label>
              <Textarea 
                className="min-h-[600px] font-mono text-base leading-loose border-slate-200 rounded-[2.5rem] p-10 bg-white shadow-inner focus:ring-0" 
                value={formData.detailproject} 
                onChange={(e) => setFormData({...formData, detailproject: e.target.value})} 
                placeholder="Trình bày nội dung chi tiết của dự án tại đây..."
              />
            </div>
          </div>

          {/* CỘT PHẢI: MEDIA & AUTHORS */}
          <div className="lg:col-span-4 bg-slate-50/30 p-12 space-y-12 border-l border-slate-100">
            
            {/* THUMBNAIL & VIDEO LINK */}
            <div className="space-y-10">
              <div className="space-y-4">
                <Label className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                   <ImageIcon size={14}/> Ảnh đại diện tiêu biểu
                </Label>
                <div className="relative aspect-[16/10] border-2 border-dashed border-slate-300 rounded-[2.5rem] bg-white flex flex-col items-center justify-center overflow-hidden group shadow-xl transition-all hover:border-blue-400">
                  {formData.image ? (
                    <div className="relative w-full h-full">
                      <img src={formData.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt="Preview" />
                      <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all text-white text-[10px] font-black">
                         {uploading ? <Loader2 className="animate-spin" /> : <><Upload className="mb-3 h-6 w-6"/> CẬP NHẬT ẢNH MỚI</>}
                         <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer text-center p-8 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 transition-colors">
                      <Upload size={40} className="mb-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Tải lên từ máy</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                   <Video size={14}/> Đường dẫn Video (Youtube)
                </Label>
                <div className="relative">
                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input className="h-14 pl-12 rounded-2xl bg-white border-slate-200 font-bold text-sm shadow-sm" value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} placeholder="https://youtube.com/watch?v=..." />
                </div>
              </div>
            </div>

            {/* ĐỘI NGŨ CHUYÊN GIA */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <Label className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500">Chuyên gia phụ trách</Label>
                <Badge className="bg-blue-600 font-black text-[10px] px-4 py-1.5 rounded-full shadow-lg shadow-blue-200">{formData.author_ids?.length || 0} Đã chọn</Badge>
              </div>
              
              <div className="grid gap-3 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar bg-white p-5 rounded-[2rem] border border-slate-100 shadow-inner">
                {authors.map(a => {
                  const isSelected = formData.author_ids?.includes(a.id);
                  return (
                    <div 
                      key={a.id} 
                      onClick={() => {
                        const ids = formData.author_ids || []
                        const nextIds = isSelected ? ids.filter((id: any) => id !== a.id) : [...ids, a.id]
                        setFormData({...formData, author_ids: nextIds})
                      }}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group ${isSelected ? 'border-blue-600 bg-blue-50/50' : 'border-slate-50 bg-slate-50/30 hover:border-blue-200'}`}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-lg shrink-0">
                          <AvatarImage src={a.avatar_url} className="object-cover" />
                          <AvatarFallback className="text-xs bg-slate-900 text-white font-black">{a.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className={`text-[12px] font-black uppercase tracking-tight ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>{a.full_name}</span>
                          <span className="text-[9px] font-bold text-slate-400 italic mt-0.5">{a.title || 'Specialist'}</span>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="h-6 w-6 text-blue-600 fill-blue-50" strokeWidth={3} />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* TOGGLE TIÊU BIỂU */}
            <div 
              className={`flex items-center justify-between p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all ${formData.featured ? 'border-amber-400 bg-amber-50 shadow-xl shadow-amber-500/10' : 'border-slate-100 bg-white hover:border-slate-200'}`}
              onClick={() => setFormData({...formData, featured: !formData.featured})}
            >
              <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-2xl ${formData.featured ? 'bg-amber-400' : 'bg-slate-100'}`}>
                    <Star size={24} className={formData.featured ? 'text-white fill-white' : 'text-slate-400'} />
                 </div>
                 <span className="text-[12px] font-black uppercase tracking-widest text-slate-700">Dự án tiêu biểu</span>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-all ${formData.featured ? 'bg-amber-400' : 'bg-slate-200'}`}>
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${formData.featured ? 'right-1' : 'left-1'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER: CỐ ĐỊNH --- */}
        <DialogFooter className="p-10 bg-slate-50 border-t flex flex-row justify-between items-center shrink-0">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={loading} 
            className="font-black uppercase tracking-[0.2em] text-slate-400 px-12 h-16 hover:bg-slate-100 rounded-[1.5rem] transition-all"
          >
            Hủy bỏ thay đổi
          </Button>
          <Button 
            disabled={loading || uploading} 
            className="h-16 px-20 bg-blue-700 hover:bg-blue-800 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 active:scale-95 transition-all" 
            onClick={handleUpdate}
          >
            {loading ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <Save className="mr-3 h-5 w-5" />} 
            CẬP NHẬT DỰ ÁN
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}