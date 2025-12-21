import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt?: string
  image?: string
  author?: string
  author_avatar?: string
  publish_date?: string
  category?: string
  content?: string
  read_time?: string
  views?: number
  likes?: number
  author_bio?: string
  tags?: string[]
  comments?: number
  shares?: number
  featured?: boolean
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  created_at?: string
  updated_at?: string
}

export interface BlogPostCreate {
  title: string
  slug: string
  content: string
  excerpt?: string
  author: string
  author_avatar?: string
  author_bio?: string
  category?: string
  image?: string
  tags?: string[]
  featured?: boolean
  publish_date?: string
  read_time?: string
  views?: number
  likes?: number
  shares?: number
  comments?: number
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}