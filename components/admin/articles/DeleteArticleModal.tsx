"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2 } from 'lucide-react'

export function DeleteArticleModal({ article, isOpen, onClose, onDeleteArticle }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} /> Xác nhận xóa bài viết
          </DialogTitle>
          <DialogDescription className="py-4">
            Bạn có chắc chắn muốn xóa bài viết <strong>"{article?.title}"</strong>? <br/>Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Hủy bỏ</Button>
          <Button variant="destructive" className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200" onClick={() => onDeleteArticle(article.id)}>
            <Trash2 className="mr-2 h-4 w-4" /> Xóa vĩnh viễn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}