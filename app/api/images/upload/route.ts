import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra cấu hình Cloudinary
    const hasCloudinaryConfig = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )

    if (!hasCloudinaryConfig) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary not configured',
          message: 'Please configure Cloudinary environment variables'
        },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folder = (formData.get('folder') as string) || 'uploads'
    const tags = (formData.get('tags') as string)?.split(',').filter(Boolean) || []

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadResults = []

    for (const file of files) {
      try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder,
              tags,
              resource_type: 'auto',
              transformation: [
                { quality: 'auto', fetch_format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          ).end(buffer)
        })

        uploadResults.push({
          success: true,
          data: result,
          filename: file.name
        })

      } catch (fileError) {
        console.error(`Error uploading ${file.name}:`, fileError)
        uploadResults.push({
          success: false,
          error: fileError instanceof Error ? fileError.message : 'Upload failed',
          filename: file.name
        })
      }
    }

    // Kiểm tra có upload thành công nào không
    const successfulUploads = uploadResults.filter(result => result.success)
    const failedUploads = uploadResults.filter(result => !result.success)

    return NextResponse.json({
      success: successfulUploads.length > 0,
      data: {
        successful: successfulUploads,
        failed: failedUploads,
        total: files.length,
        successCount: successfulUploads.length,
        failureCount: failedUploads.length
      }
    })

  } catch (error) {
    console.error('Error uploading images:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload images',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Kiểm tra cấu hình Cloudinary
    const hasCloudinaryConfig = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )

    if (!hasCloudinaryConfig) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary not configured',
          message: 'Please configure Cloudinary environment variables'
        },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('public_id')

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required' },
        { status: 400 }
      )
    }

    // Xóa hình ảnh từ Cloudinary
    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === 'ok') {
      return NextResponse.json({
        success: true,
        data: { public_id: publicId, status: 'deleted' }
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete image',
          details: result
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}