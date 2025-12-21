'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Image as ImageIcon, Download, Trash2, Search, AlertCircle, CheckCircle, FolderOpen, Copy } from 'lucide-react'
import Image from 'next/image'
import FolderManager from '@/components/admin/media/FolderManager'
import { ImageUpload } from '@/components/admin/media/ImageUpload'

interface CloudinaryResource {
  public_id: string
  format: string
  version: number
  resource_type: string
  type: string
  created_at: string
  bytes: number
  width: number
  height: number
  url: string
  secure_url: string
  folder?: string
  asset_folder?: string
  tags?: string[]
}

export default function ImagesPage() {
  const [images, setImages] = useState<CloudinaryResource[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/images')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.data && data.data.resources) {
        setImages(data.data.resources)
      } else {
        setImages(data.resources || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  const deleteImage = async (publicId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`/api/images/upload?public_id=${encodeURIComponent(publicId)}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete image')

      setSuccess('Image deleted successfully!')
      loadImages()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image')
    }
  }

  const copyImageLink = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl)
      setSuccess('Image link copied to clipboard!')
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = imageUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setSuccess('Image link copied to clipboard!')
      setTimeout(() => setSuccess(null), 2000)
    }
  }

  const testConnection = async () => {
    try {
      const response = await fetch('/api/images/folders')
      const data = await response.json()
      setSuccess(`Connection OK - Found ${data.data?.folders?.length || 0} folders`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Connection test failed')
    }
  }

  const filteredImages = images.filter(image => {
    const matchesSearch = image.public_id.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesFolder = false
    if (!selectedFolder) {
      // Hiển thị tất cả nếu không chọn folder
      matchesFolder = true
    } else {
      // Kiểm tra nếu image thuộc folder được chọn
      const imageFolder = image.folder || image.asset_folder || ''
      const imagePath = image.public_id
      
      // Kiểm tra nhiều cách khác nhau
      matchesFolder = imageFolder === selectedFolder ||
                     imageFolder.startsWith(selectedFolder + '/') ||
                     imagePath.startsWith(selectedFolder + '/') ||
                     imagePath.includes('/' + selectedFolder + '/')
    }
    
    return matchesSearch && matchesFolder
  })

  const getImageDisplayName = (publicId: string) => {
    // Lấy tên file từ public_id, loại bỏ folder path
    const parts = publicId.split('/')
    return parts[parts.length - 1] // Lấy phần cuối cùng (tên file)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="flex h-screen">
      {/* Folder Sidebar */}
      {sidebarOpen && (
        <div className="w-80 border-r bg-white">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Folders
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                ×
              </Button>
            </div>
          </div>
          <div className="p-4">
            <FolderManager 
              onFolderSelect={setSelectedFolder}
              selectedFolder={selectedFolder}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
              )}
              <h1 className="text-3xl font-bold">Image Management</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={testConnection}
              >
                Test Connection
              </Button>
              <Button 
                className="flex items-center gap-2"
                onClick={() => setUploadOpen(true)}
              >
                <Upload className="h-4 w-4" />
                Upload Images
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  {selectedFolder ? `Images in ${selectedFolder}` : 'All Images'}
                  <Badge variant="outline">{filteredImages.length}</Badge>
                </CardTitle>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search images..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading images...</p>
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No images found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredImages.map((image) => (
                    <div key={image.public_id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                      <div className="relative aspect-video">
                        <Image
                          src={image.secure_url}
                          alt={image.public_id}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-medium text-sm truncate mb-2" title={image.public_id}>
                          {getImageDisplayName(image.public_id)}
                        </h3>
                        
                        {(image.folder || image.asset_folder) && (
                          <div className="mb-2">
                            <Badge variant="outline" className="text-xs">
                              {image.folder || image.asset_folder}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{image.format.toUpperCase()}</span>
                            <span>{image.width} × {image.height}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{formatBytes(image.bytes)}</span>
                            <span>{new Date(image.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyImageLink(image.secure_url)}
                            title="Copy image link"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          
                          <Button size="sm" variant="outline" asChild>
                            <a href={image.secure_url} target="_blank" rel="noopener noreferrer" title="Download image">
                              <Download className="h-3 w-3" />
                            </a>
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteImage(image.public_id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete image"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Modal */}
      <ImageUpload
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadComplete={loadImages}
        currentFolder={selectedFolder || ''}
      />
    </div>
  )
}
