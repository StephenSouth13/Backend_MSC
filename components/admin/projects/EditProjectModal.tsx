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
  Loader2, Save, Edit, Upload, X, Star, 
  Lock, Unlock, Search, Tag, Palette, Type, Video, Film, Bold, Italic, Underline as UnderlineIcon, Globe, ListOrdered
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

// TIPTAP NAMED IMPORTS
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Underline } from '@tiptap/extension-underline'

// 1. TOOLBAR SOẠN THẢO (GIỐNG CREATE MODAL)
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null
  return (
    <div className="flex flex-wrap gap-1 p-2 bg-slate-100 rounded-t-[1.5rem] border-b border-slate-200 sticky top-0 z-10">
      <div className="flex bg-white rounded-lg border p-0.5 shadow-sm mr-2">
        <Button 
          type="button" variant="ghost" size="sm" 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-blue-50 text-blue-600' : ''}`}
        >
          <Bold size={14}/>
        </Button>
        <Button 
          type="button" variant="ghost" size="sm" 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-blue-50 text-blue-600' : ''}`}
        >
          <Italic size={14}/>
        </Button>
        <Button 
          type="button" variant="ghost" size="sm" 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          className={`h-8 w-8 p-0 ${editor.isActive('underline') ? 'bg-blue-50 text-blue-600' : ''}`}
        >
          <UnderlineIcon size={14}/>
        </Button>
      </div>

      <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-0.5 shadow-sm mr-2">
        <Label className="text-[9px] font-black uppercase text-slate-400">Màu chữ:</Label>
        <input 
          type="color" 
          onInput={(e: any) => editor.chain().focus().setColor(e.target.value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
          className="w-6 h-6 p-0 border border-slate-200 rounded-full cursor-pointer overflow-hidden"
        />
        <Button 
          type="button" variant="ghost" size="sm" 
          onClick={() => editor.chain().focus().toggleHighlight().run()} 
          className={`h-8 px-2 text-[10px] font-bold ${editor.isActive('highlight') ? 'bg-yellow-200 text-yellow-800' : ''}`}
        >
          <Palette size={12} className="mr-1"/> HIGHLIGHT
        </Button>
      </div>
    </div>
  )
}

export function EditProjectModal({ isOpen, onClose, project, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [authors, setAuthors] = useState<any[]>([])
  const [formData, setFormData] = useState<any>(null)
  const [isSlugLocked, setIsSlugLocked] = useState(true)

  // 2. KHỞI TẠO TIPTAP
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, Highlight.configure({ multicolor: true }), Underline],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData((prev: any) => ({ ...prev, detailproject: editor.getHTML() }))
    }
  })

  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        ...project,
        author_ids: project.author_ids || [],
        featured: project.featured || false,
        seo_title: project.seo_title || project.title,
        hashtags: project.hashtags || '',
        video_url: project.video_url || '',
        category: project.category || '',
        description: project.description || '',
        order_index: project.order_index || 0
      });
      
      // Load content vào editor khi mở modal
      if (editor && project.detailproject) {
        editor.commands.setContent(project.detailproject);
      }

      const fetchAuthors = async () => {
        const { data } = await supabase.from('authors').select('id, full_name, avatar_url, title').order('full_name', { ascending: true });
        if (data) setAuthors(data);
      };
      fetchAuthors();
    }
  }, [project, isOpen, editor])

  const generateSlug = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/([^0-9a-z-\s])/g, "").replace(/(\s+)/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return
      const fileName = `${Date.now()}.${file.name.split('.').pop()}`
      const folder = type === 'image' ? 'project-thumbnails' : 'project-videos'
      const { error: uploadError } = await supabase.storage.from('media').upload(`${folder}/${fileName}`, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('media').getPublicUrl(`${folder}/${fileName}`)
      setFormData({ ...formData, [type === 'image' ? 'image' : 'video_url']: data.publicUrl })
      toast({ title: "Cập nhật Media thành công!" })
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    } finally { setUploading(false) }
  }

  const handleUpdate = async () => {
    if (!formData?.title || !formData?.slug) return toast({ title: "Thiếu thông tin tiêu đề/URL", variant: "destructive" });
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...formData,
          title: formData.title.trim(),
          slug: formData.slug.trim(),
          order_index: parseInt(formData.order_index) || 0
        })
        .eq('id', project.id)
        .select();

      if (error) throw error;
      toast({ title: "Thành công", description: "Dự án đã được cập nhật." });
      if (onSuccess) onSuccess(data[0]);
      onClose();
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1200px] w-[95vw] max-h-[95vh] overflow-y-auto bg-white rounded-[3rem] p-0 font-montserrat shadow-2xl border-none">
        <DialogHeader className="p-8 bg-slate-900 text-white rounded-t-[3rem]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                <Edit size={28} className="text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">Hiệu chỉnh dự án <span className="text-blue-400">Executive</span></DialogTitle>
                <DialogDescription className="text-slate-400 font-medium text-[11px] uppercase tracking-[0.2em] mt-1">ID Dự án: {project.id.substring(0,8)}...</DialogDescription>
              </div>
            </div>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">Priority Index: {formData.order_index}</Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* CỘT TRÁI: CONTENT */}
          <div className="lg:col-span-8 p-10 space-y-10 border-r border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2"><Edit size={12}/> Tiêu đề H1</Label>
                <Input className="h-14 text-lg font-bold rounded-2xl border-slate-200" value={formData.title} onChange={(e) => {
                   const val = e.target.value;
                   setFormData({...formData, title: val, slug: isSlugLocked ? generateSlug(val) : formData.slug})
                }} />
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2"><Tag size={12}/> Tag Name (Category)</Label>
                <Input className="h-14 font-bold rounded-2xl border-slate-200" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-2"><Search size={12}/> URL SEO (Slug)</Label>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold" onClick={() => setIsSlugLocked(!isSlugLocked)}>
                    {isSlugLocked ? <Lock size={12}/> : <Unlock size={12} className="text-amber-500"/>}
                  </Button>
                </div>
                <Input className={`h-12 font-mono text-xs font-bold rounded-xl ${isSlugLocked ? 'bg-slate-50' : 'bg-amber-50'}`} value={formData.slug} readOnly={isSlugLocked} onChange={(e) => setFormData({...formData, slug: generateSlug(e.target.value)})} />
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><ListOrdered size={12}/> Vị trí sắp xếp</Label>
                <Input type="number" className="h-12 text-xs font-bold rounded-xl bg-slate-50/50" value={formData.order_index} onChange={(e) => setFormData({...formData, order_index: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Type size={12}/> Nội dung soạn thảo chi tiết</Label>
              <div className="border-2 border-slate-100 rounded-[1.5rem] overflow-hidden focus-within:border-blue-400 transition-all bg-white shadow-inner">
                <MenuBar editor={editor} />
                <EditorContent editor={editor} className="p-8 min-h-[450px] prose prose-blue max-w-none focus:outline-none" />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: MEDIA CENTER */}
          <div className="lg:col-span-4 bg-slate-50/50 p-10 space-y-10">
            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Thumbnail Hiện tại</Label>
              <div className="relative aspect-video border-2 border-dashed border-slate-300 rounded-[2rem] bg-white flex flex-col items-center justify-center overflow-hidden">
                {formData.image ? (
                  <div className="relative w-full h-full group">
                    <img src={formData.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all">
                       <label className="cursor-pointer">
                          <Upload className="text-white mb-2 mx-auto" />
                          <span className="text-[10px] text-white font-black uppercase">Đổi ảnh mới</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, 'image')} />
                       </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center p-8"><Upload size={24}/><input type="file" className="hidden" onChange={(e) => handleMediaUpload(e, 'image')} /></label>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-2"><Film size={12}/> Video Dự án</Label>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <Input placeholder="Youtube Link..." className="text-xs h-10 rounded-xl bg-slate-50" value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} />
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-black uppercase text-slate-500">Mentoring & Coaching</Label>
                <Badge className="bg-blue-600 font-black text-[9px] uppercase shadow-md">{formData.author_ids?.length || 0} Đã chọn</Badge>
              </div>
              <div className="grid gap-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar bg-white p-3 rounded-[1.5rem] border border-slate-200 shadow-inner">
                {authors.map(a => {
                  const isSelected = formData.author_ids?.includes(a.id);
                  return (
                    <div 
                      key={a.id} 
                      onClick={() => {
                        const nextIds = isSelected ? formData.author_ids.filter((id:any)=>id!==a.id) : [...formData.author_ids, a.id]
                        setFormData({...formData, author_ids: nextIds})
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-blue-600 bg-blue-50/50' : 'border-transparent bg-slate-50/30'}`}
                    >
                      <Avatar className="h-9 w-9 shadow-sm shrink-0">
                        <AvatarImage src={a.avatar_url} className="object-cover" />
                        <AvatarFallback className="font-black text-[10px] bg-slate-200 uppercase">{a.full_name?.substring(0,2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[11px] font-black uppercase truncate ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>{a.full_name}</span>
                        <span className="text-[9px] text-slate-400 font-bold italic truncate">{a.title}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-10 bg-slate-50 border-t flex justify-between items-center rounded-b-[3rem]">
          <Button variant="ghost" onClick={onClose} className="font-black uppercase text-[11px] text-slate-400 px-8 h-14">Hủy bỏ</Button>
          <Button disabled={loading || uploading} className="h-16 px-20 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all" onClick={handleUpdate}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Cập nhật bài viết
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}