import { create } from 'zustand'

export type Language = 'bn' | 'en'
export type ThemeMode = 'dark' | 'light'

export interface AuthUser {
  id: number
  username: string
  email: string
  full_name: string
  role: 'student' | 'trainer' | 'admin'
  is_staff: boolean
  is_superuser: boolean
  is_trainer: boolean
  phone_number: string
  occupation: string
  bio: string
  current_streak: number
  longest_streak: number
  referral_code: string
}

export interface CompareCourseItem {
  id: number
  title: string
  title_bn: string
  category: string
  price: number
  original_price: number
  duration_hours: number
  rating: number
  students_count: number
  is_live_course: boolean
  lesson_count: number
}

interface AppState {
  lang: Language
  theme: ThemeMode
  accessToken: string | null
  user: AuthUser | null
  compareCourses: CompareCourseItem[]
  isCompareDrawerOpen: boolean
  toastMessage: { title: string; type: 'success' | 'error' | 'info' } | null
  setLang: (lang: Language) => void
  toggleLang: () => void
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  setAuth: (token: string, user: AuthUser) => void
  clearAuth: () => void
  toggleCompareCourse: (course: CompareCourseItem) => void
  setCompareDrawerOpen: (open: boolean) => void
  showToast: (title: string, type?: 'success' | 'error' | 'info') => void
}

const initialLang = (localStorage.getItem('lwma_lang') as Language) || 'bn'
const initialTheme = (localStorage.getItem('lwma_theme') as ThemeMode) || (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

if (typeof document !== 'undefined') {
  document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  document.documentElement.lang = initialLang
}

export const useAppStore = create<AppState>((set, get) => ({
  lang: initialLang,
  theme: initialTheme,
  accessToken: sessionStorage.getItem('lwma_access_token'),
  user: (() => {
    try {
      const raw = sessionStorage.getItem('lwma_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })(),
  compareCourses: [],
  isCompareDrawerOpen: false,
  toastMessage: null,

  setLang: (lang) => {
    localStorage.setItem('lwma_lang', lang)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
    set({ lang })
  },

  toggleLang: () => {
    const next = get().lang === 'bn' ? 'en' : 'bn'
    get().setLang(next)
  },

  setTheme: (theme) => {
    localStorage.setItem('lwma_theme', theme)
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
    set({ theme })
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },

  setAuth: (token, user) => {
    sessionStorage.setItem('lwma_access_token', token)
    sessionStorage.setItem('lwma_user', JSON.stringify(user))
    set({ accessToken: token, user })
  },

  clearAuth: () => {
    sessionStorage.removeItem('lwma_access_token')
    sessionStorage.removeItem('lwma_user')
    set({ accessToken: null, user: null })
  },

  toggleCompareCourse: (course) => {
    const current = get().compareCourses
    const exists = current.some((c) => c.id === course.id)
    if (exists) {
      set({ compareCourses: current.filter((c) => c.id !== course.id) })
      return
    }
    if (current.length >= 3) {
      get().showToast(
        get().lang === 'bn' ? 'সর্বোচ্চ ৩টি কোর্স তুলনা করা যাবে' : 'You can compare up to 3 courses side-by-side',
        'info'
      )
      return
    }
    set({ compareCourses: [...current, course], isCompareDrawerOpen: true })
  },

  setCompareDrawerOpen: (open) => set({ isCompareDrawerOpen: open }),

  showToast: (title, type = 'info') => {
    set({ toastMessage: { title, type } })
    setTimeout(() => {
      set((state) => (state.toastMessage?.title === title ? { toastMessage: null } : state))
    }, 3800)
  },
}))

export function bf(item: Record<string, any> | null | undefined, field: string, lang: Language): string {
  if (!item) return ''
  if (lang === 'bn' && item[`${field}_bn`]) {
    return item[`${field}_bn`]
  }
  return item[field] || ''
}
