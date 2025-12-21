// Types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor'
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Mock users for development
const mockUsers = [
  { 
    id: '1', 
    email: 'admin_msc@gmail.com', 
    name: 'MSC Admin', 
    role: 'admin' as const 
  },
  { 
    id: '2', 
    email: 'editor@gmail.com', 
    name: 'MSC Editor', 
    role: 'editor' as const 
  }
]

// Authentication functions
export function authenticateUser(email: string, password: string): User | null {
  // Mock password check
  const passwords: Record<string, string> = {
    'admin_msc@gmail.com': 'StrongPass!123',
    'editor@gmail.com': '123456'
  }

  if (passwords[email] === password) {
    return mockUsers.find(u => u.email === email) || null
  }
  
  return null
}

export function getUserRedirectPath(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'editor':
      return '/admin/articles'
    default:
      return '/admin/dashboard'
  }
}

// Local storage utilities
export function loadAuthState(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('admin_user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function saveAuthState(user: User): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('admin_user', JSON.stringify(user))
}

export function clearAuthState(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('admin_user')
}