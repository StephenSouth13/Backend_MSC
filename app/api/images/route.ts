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

export async function GET(req: NextRequest) {
  try {
    // Validate env
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary not configured' },
        { status: 500 }
      )
    }

    // Extract query parameters using headers approach for better compatibility
    const url = req.url
    const urlObj = new URL(url)
    
    const folder = urlObj.searchParams.get('folder') || ''
    const tagsParam = urlObj.searchParams.get('tags')
    const tags = tagsParam ? tagsParam.split(',') : []
    const limitParam = urlObj.searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 50
    const nextCursor = urlObj.searchParams.get('next_cursor') || undefined

    // Build expression
    let expression = 'resource_type:image'
    if (folder) expression += ` AND folder:${folder}*`
    if (tags.length > 0) {
      const tagQuery = tags.map(tag => `tags:${tag}`).join(' AND ')
      expression += ` AND (${tagQuery})`
    }

    // Gọi Cloudinary search API
    const result = await cloudinary.search
      .expression(expression)
      .sort_by('created_at', 'desc')
      .max_results(limit)
      .next_cursor(nextCursor)
      .execute()

    return NextResponse.json({
      success: true,
      data: {
        resources: result.resources,
        next_cursor: result.next_cursor,
        total_count: result.total_count,
      },
    })
  } catch (err) {
    console.error('Error fetching images:', err)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch images',
        message: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
