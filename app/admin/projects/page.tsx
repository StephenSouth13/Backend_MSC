"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { ProjectsTable } from '@/components/admin/projects/ProjectsTable'
import { CreateProjectModal } from '@/components/admin/projects/CreateProjectModal'
import { EditProjectModal } from '@/components/admin/projects/EditProjectModal'
import { DeleteProjectModal } from '@/components/admin/projects/DeleteProjectModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, Search, FolderOpen, Loader2, RefreshCcw, 
  ChevronLeft, ChevronRight, Filter, AlertCircle 
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const ITEMS_PER_PAGE = 8; // Số dự án trên mỗi trang

function ProjectsManagementContent() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // States cho Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [deletingProject, setDeletingProject] = useState<any>(null)

  // 1. Hàm lấy dữ liệu có Phân trang (Pagination)
  const fetchProjects = useCallback(async (page = 1, silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Query lấy dữ liệu và tổng số dòng cùng lúc
      const { data, error, count } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setProjects(data || []);
      if (count !== null) setTotalCount(count);
    } catch (error: any) {
      toast({ title: "Lỗi tải dữ liệu", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage, fetchProjects]);

  // 2. Xử lý Chuyển trang
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 3. Logic tìm kiếm (Client-side cho trang hiện tại)
  const filteredProjects = useMemo(() => {
    return projects.filter(p =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  // 4. CRUD Callbacks - Đảm bảo đồng bộ DB
  const handleCreateSuccess = () => {
    fetchProjects(1); // Reset về trang 1 để xem project mới nhất
    setIsCreateModalOpen(false);
    toast({ title: "Thành công", description: "Dự án mới đã được lưu vào hệ thống." });
  };

  const handleUpdateSuccess = (updatedProject: any) => {
    if (!updatedProject || !updatedProject.id) {
    console.error("Dữ liệu cập nhật bị thiếu:", updatedProject);
    return;
  }
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setEditingProject(null);
    toast({ title: "Đã cập nhật", description: "Thông tin thay đổi đã được áp dụng." });
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      
      toast({ title: "Đã xóa", description: "Dự án đã được loại bỏ." });
      // Nếu xóa xong trang hiện tại trống thì lùi về 1 trang
      if (projects.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchProjects(currentPage, true);
      }
      setDeletingProject(null);
    } catch (error: any) {
      toast({ title: "Lỗi khi xóa", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dự án & Đối tác</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý danh mục và đội ngũ chuyên gia Mentor</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => fetchProjects(currentPage, true)} disabled={isRefreshing}>
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6">
            <Plus className="h-5 w-5 mr-2" /> Tạo dự án
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-50 px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Tìm tên dự án, danh mục..." 
                className="pl-10 bg-slate-50 border-none rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-4 py-1.5 rounded-lg border-slate-200 text-slate-600">
                Tổng: {totalCount} dự án
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="py-40 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-slate-400 mt-4 font-medium italic">Đang tải dữ liệu...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-40 text-center">
                <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Không tìm thấy dữ liệu phù hợp</p>
              </div>
            ) : (
              <ProjectsTable 
  projects={filteredProjects}
  onEdit={setEditingProject}
  onDelete={setDeletingProject}
  currentPage={currentPage}
  itemsPerPage={ITEMS_PER_PAGE}
/>
            )}
          </AnimatePresence>
        </CardContent>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-8 py-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
            <p className="text-sm text-slate-500">
              Trang <strong>{currentPage}</strong> / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="rounded-lg"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Trước
              </Button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "ghost"}
                    size="sm"
                    className="w-8 h-8 p-0 rounded-md"
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="rounded-lg"
              >
                Sau <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={handleCreateSuccess} 
      />

      {editingProject && (
        <EditProjectModal 
          isOpen={!!editingProject} 
          project={editingProject} 
          onClose={() => setEditingProject(null)} 
          onSuccess={handleUpdateSuccess} 
        />
      )}

      {deletingProject && (
        <DeleteProjectModal 
          isOpen={!!deletingProject} 
          project={deletingProject} 
          onClose={() => setDeletingProject(null)} 
          onDelete={handleDeleteConfirm} 
        />
      )}
    </div>
  )
}

export default function ProjectsManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'collab']}>
      <ProjectsManagementContent />
    </ProtectedRoute>
  )
}