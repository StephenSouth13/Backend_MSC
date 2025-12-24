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
import { Loader2, Save, Edit } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function EditProjectModal({ isOpen, onClose, project, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [mentors, setMentors] = useState<any[]>([])
  const [formData, setFormData] = useState<any>(null)

  useEffect(() => {
    if (project) setFormData(project)
    if (isOpen) {
      supabase.from('profiles').select('id, full_name, avatar_url').eq('role', 'mentor')
        .then(({ data }) => data && setMentors(data))
    }
  }, [project, isOpen])

  const handleUpdate = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('projects').update(formData).eq('id', project.id).select()
    if (!error) {
      onSuccess(data[0])
      onClose()
      toast({ title: "Đã cập nhật dự án!" })
    }
    setLoading(false)
  }

  if (!formData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader><DialogTitle className="flex gap-2"><Edit /> Chỉnh sửa: {project?.title}</DialogTitle><DialogDescription>Dữ liệu này sẽ hiển thị trực tiếp lên msc.edu.vn/du-an</DialogDescription></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
          <div className="md:col-span-2 space-y-6 text-slate-900">
            <div className="space-y-2">
              <Label className="font-bold ">Tiêu đề dự án</Label>
              <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-teal-600">Mô tả ngắn</Label>
              <Textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-teal-600">Nội dung Markdown</Label>
              <Textarea className="min-h-[400px] font-mono" value={formData.detailproject} onChange={(e) => setFormData({...formData, detailproject: e.target.value})} />
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border space-y-6 h-fit text-slate-900">
             <div className="space-y-2 ">
              <Label className="text-xs font-bold uppercase ">Trạng thái</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="planning">Lên kế hoạch</SelectItem><SelectItem value="ongoing">Đang triển khai</SelectItem><SelectItem value="completed">Hoàn thành</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Mentors tham gia</Label>
              <div className="grid gap-2 max-h-48 overflow-y-auto pr-2">
                {mentors.map(m => (
                  <div key={m.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border ${formData.mentor_ids?.includes(m.id) ? 'bg-teal-50 border-teal-300' : 'bg-white'}`}
                    onClick={() => {
                        const ids = formData.mentor_ids || []
                        setFormData({...formData, mentor_ids: ids.includes(m.id) ? ids.filter((id:any) => id !== m.id) : [...ids, m.id]})
                    }}>
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
          <Button disabled={loading} className="bg-teal-600" onClick={handleUpdate}>{loading ? <Loader2 className="animate-spin" /> : "Lưu thay đổi"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}