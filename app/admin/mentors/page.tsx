"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Search, Loader2, Edit3, Trash2, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { MentorModal } from '@/components/admin/mentors/MentorModal'
import { toast } from '@/hooks/use-toast'


export default function MentorsPage() {
  const [mentors, setMentors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMentor, setSelectedMentor] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchMentors = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('mentors').select('*').order('created_at', { ascending: false })
    if (data) setMentors(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchMentors() }, [fetchMentors])

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mentor này?")) return
    const { error } = await supabase.from('mentors').delete().eq('id', id)
    if (!error) {
      toast({ title: "Đã xóa thành công" })
      fetchMentors()
    }
  }

  const filteredMentors = mentors.filter(m => 
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Đội ngũ Mentor</h1>
          <p className="text-slate-500 font-medium mt-1">Quản lý và cập nhật danh sách chuyên gia MSC.</p>
        </div>
        <Button onClick={() => { setSelectedMentor(null); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 shadow-lg shadow-blue-100">
          <Plus className="mr-2 h-5 w-5" /> Thêm Mentor
        </Button>
      </div>

      <div className="relative max-w-md shadow-sm rounded-xl overflow-hidden">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input 
          placeholder="Tìm tên chuyên gia..." 
          className="pl-10 h-11 border-none bg-white focus-visible:ring-blue-400" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredMentors.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} layout>
                <Card className="border-none shadow-sm hover:shadow-xl transition-all group overflow-hidden bg-white">
                  <CardContent className="p-0">
                    <div className="h-1.5 bg-blue-500 w-full" />
                    <div className="p-6 flex flex-col items-center text-center space-y-4">
                      <Avatar className="h-20 w-20 border-4 border-slate-50 shadow-md group-hover:scale-110 transition-transform">
                        <AvatarImage src={m.avatar_url} />
                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">{m.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-slate-900 line-clamp-1">{m.full_name}</h3>
                        <p className="text-xs text-blue-600 font-semibold uppercase mt-1">{m.title || 'Chuyên gia'}</p>
                      </div>
                      <div className="flex gap-2 w-full pt-4 border-t border-slate-50">
                        <Button variant="outline" size="sm" className="flex-1 rounded-lg border-slate-100" onClick={() => { setSelectedMentor(m); setIsModalOpen(true); }}>
                          <Edit3 size={14} className="mr-2" /> Sửa
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 rounded-lg border-slate-100 text-red-400 hover:text-red-600" onClick={() => handleDelete(m.id)}>
                          <Trash2 size={14} className="mr-2" /> Xóa
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <MentorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mentor={selectedMentor} 
        onSuccess={fetchMentors} 
      />
    </div>
  )
}