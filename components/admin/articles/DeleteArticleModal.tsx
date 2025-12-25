"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'

export function DeleteArticleModal({ article, isOpen, onClose, onDeleteArticle }: any) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Hàm xử lý xóa để quản lý trạng thái loading ngay tại Modal
  const handleConfirmDelete = async () => {
    if (!article?.id) return;
    
    setIsDeleting(true);
    try {
      await onDeleteArticle(article.id);
      // Lưu ý: onClose() nên được gọi ở trang cha sau khi xóa thành công trong Database
    } catch (error) {
      console.error("Lỗi khi xác nhận xóa:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl p-6 text-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 font-bold text-xl">
            <AlertTriangle size={24} className="animate-pulse" /> 
            Xác nhận xóa bài viết
          </DialogTitle>
          <div className="py-4">
            <DialogDescription className="text-slate-600 text-base leading-relaxed">
              Bạn có chắc chắn muốn xóa bài viết: <br />
              <span className="font-bold text-slate-900">"{article?.title}"</span>?
            </DialogDescription>
            <p className="mt-3 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 italic">
              ⚠️ Hành động này sẽ gỡ bài viết khỏi hệ thống vĩnh viễn và không thể hoàn tác.
            </p>
          </div>
        </DialogHeader>

        <DialogFooter className="flex gap-3 mt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Hủy bỏ
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all font-bold" 
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa vĩnh viễn
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}