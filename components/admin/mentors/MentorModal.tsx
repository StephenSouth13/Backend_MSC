"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Loader2, Save, Upload, Linkedin, Facebook, Globe, Award } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function MentorModal({ isOpen, onClose, mentor, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<any>({
    full_name: '', slug: '', title: '', company: '', 
    email: '', linkedin_url: '', facebook_url: '', 
    portfolio_url: '', avatar_url: '', detailed_bio: '', skills: ''
  })

  useEffect(() => {
    if (mentor) {
      setFormData({
        ...mentor,
        skills: Array.isArray(mentor.skills) ? mentor.skills.join(', ') : (mentor.skills || '')
      })
    } else {
      setFormData({
        full_name: '', slug: '', title: '', company: '', 
        email: '', linkedin_url: '', facebook_url: '', 
        portfolio_url: '', avatar_url: '', detailed_bio: '', skills: ''
      })
    }
  }, [mentor, isOpen])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `mentor-${Date.now()}.${fileExt}`
      const filePath = `mentors/${fileName}`

      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath)
      setFormData((prev: any) => ({ ...prev, avatar_url: publicUrl }))
      toast({ title: "Thành công", description: "Đã cập nhật ảnh đại diện." })
    } catch (error: any) {
      toast({ title: "Lỗi tải ảnh", description: error.message, variant: "destructive" })
    } finally { setUploading(false) }
  }

  const handleSave = async (e?: React.MouseEvent) => {
    // Ngăn chặn hành động mặc định của form nếu có
    if (e) e.preventDefault();
    
    console.log("Hệ thống nhận lệnh Lưu. Dữ liệu:", formData);

    if (!formData.full_name?.trim() || !formData.slug?.trim()) {
      return toast({ 
        title: "Thiếu thông tin", 
        description: "Vui lòng nhập đầy đủ Họ tên và Slug URL", 
        variant: "destructive" 
      });
    }

    setLoading(true);
    try {
      const { id, created_at, updated_at, ...cleanData } = formData;
      const payload = {
        ...cleanData,
        skills: typeof formData.skills === 'string' 
          ? formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean) 
          : formData.skills || [],
        updated_at: new Date().toISOString()
      };

      let result;
      if (mentor?.id) {
        result = await supabase.from('mentors').update(payload).eq('id', mentor.id);
      } else {
        result = await supabase.from('mentors').insert([payload]);
      }

      if (result.error) throw result.error;

      toast({ title: "Thành công!", description: "Hồ sơ chuyên gia đã được lưu." });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Lỗi Database:", error);
      toast({ title: "Lỗi lưu dữ liệu", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-none shadow-2xl p-0">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-blue-700 flex items-center gap-2">
              <Award /> Hồ sơ Mentor
            </DialogTitle>
            <DialogDescription id="dialog-desc">
              Quản lý thông tin chi tiết và hồ sơ năng lực của chuyên gia.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
            {/* Cột trái: Avatar */}
            <div className="space-y-6 text-center">
              <div className="relative group mx-auto w-40 h-40">
                <Avatar className="h-40 w-40 border-4 border-blue-50 shadow-xl overflow-hidden bg-slate-100">
                  <AvatarImage src={formData.avatar_url} className="object-cover" />
                  <AvatarFallback className="text-4xl">{uploading ? <Loader2 className="animate-spin" /> : "MSC"}</AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="mentor-avatar-input" 
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10"
                >
                  <Upload className="text-white h-8 w-8" />
                </label>
                <input 
                  type="file" 
                  id="mentor-avatar-input" 
                  name="avatar_upload"
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                />
              </div>

              <div className="space-y-3 pt-4 border-t text-left">
                <div className="space-y-2">
                  <Label htmlFor="linkedin-field">LinkedIn</Label>
                  <Input 
                    id="linkedin-field"
                    name="linkedin_url"
                    placeholder="URL LinkedIn" 
                    value={formData.linkedin_url || ''} 
                    onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook-field">Facebook</Label>
                  <Input 
                    id="facebook-field"
                    name="facebook_url"
                    placeholder="URL Facebook" 
                    value={formData.facebook_url || ''} 
                    onChange={(e) => setFormData({...formData, facebook_url: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {/* Cột phải: Thông tin */}
            <div className="md:col-span-2 space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name-field">Họ và tên</Label>
                  <Input 
                    id="name-field"
                    name="full_name"
                    value={formData.full_name || ''} 
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug-field">Slug URL</Label>
                  <Input 
                    id="slug-field"
                    name="slug"
                    value={formData.slug || ''} 
                    onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title-field">Chức danh</Label>
                <Input 
                  id="title-field"
                  name="title"
                  placeholder="VD: Senior Developer"
                  value={formData.title || ''} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio-field">Tiểu sử (Markdown)</Label>
                <Textarea 
                  id="bio-field"
                  name="detailed_bio"
                  rows={8} 
                  value={formData.detailed_bio || ''} 
                  onChange={(e) => setFormData({...formData, detailed_bio: e.target.value})} 
                />
              </div>
            </div>
          </form>

          <DialogFooter className="border-t pt-6 mt-6 bg-white sticky bottom-0 z-50">
            <Button type="button" variant="ghost" onClick={onClose}>Hủy bỏ</Button>
            <Button 
              type="button" 
              disabled={loading || uploading} 
              onClick={handleSave} 
              className="bg-blue-600 hover:bg-blue-700 min-w-[160px] relative"
            >
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              {mentor ? "Cập nhật hồ sơ" : "Lưu hồ sơ"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}