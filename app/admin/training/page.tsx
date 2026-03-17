"use client"

import { useState, useEffect } from 'react'
import { Plus, Search, Loader2, BookOpen, Star, Users, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { TrainingService } from "@/lib/training-service"
import { Program } from "@/lib/supabase"
import { ProgramsTable } from "@/components/admin/training/ProgramsTable"
import Link from "next/link"

export default function TrainingAdminPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadData = async () => {
    setLoading(true)
    const data = await TrainingService.getAllPrograms()
    setPrograms(data)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const filtered = programs.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: programs.length,
    live: programs.filter(p => p.status === 'published').length,
    students: programs.reduce((acc, p) => acc + parseInt(p.students || '0'), 0)
  }

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="font-black text-xs text-slate-400 uppercase tracking-widest text-center">
        Đang bóc tách dữ liệu tri thức...
      </p>
    </div>
  )

  return (
    <div className="p-10 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic">Training</h1>
          <p className="text-slate-400 font-bold text-[10px] tracking-[0.4em] uppercase mt-2 ml-1">MSC Knowledge Management System</p>
        </div>
        <Link href="/admin/training/new">
          <Button className="bg-blue-600 hover:bg-blue-700 h-16 px-10 rounded-[2rem] font-black shadow-2xl shadow-blue-500/30 gap-3 text-white transition-all hover:scale-105 active:scale-95">
            <Plus size={24} strokeWidth={3} /> TẠO KHÓA HỌC MỚI
          </Button>
        </Link>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Tổng số khóa', val: stats.total, icon: BookOpen, color: 'text-blue-600' },
          { label: 'Đang hiển thị', val: stats.live, icon: GraduationCap, color: 'text-emerald-500' },
          { label: 'Học viên MSC', val: stats.students, icon: Users, color: 'text-purple-600' }
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
            <CardContent className="p-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                <div className="text-4xl font-black text-slate-800">{item.val}</div>
              </div>
              <div className={`p-5 rounded-3xl bg-slate-50 ${item.color}`}><item.icon size={28} /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
        <Input 
          placeholder="Tìm tên khóa học..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-14 h-16 rounded-[1.5rem] border-none shadow-2xl shadow-slate-200/40 bg-white font-bold text-slate-700 text-lg placeholder:text-slate-200"
        />
      </div>

      <ProgramsTable programs={filtered} onRefresh={loadData} />
    </div>
  )
}