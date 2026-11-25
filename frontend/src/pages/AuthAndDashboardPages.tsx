import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  Award,
  Bookmark,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  FileText,
  Flame,
  Gift,
  GraduationCap,
  HelpCircle,
  Lock,
  Play,
  Printer,
  QrCode,
  ShieldCheck,
  LayoutDashboard,
  UserCheck,
  Video,
  Zap,
} from 'lucide-react'
import { apiFetch } from '../lib/api'
import { useAppStore, bf } from '../stores/useAppStore'

export const AuthPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { lang, setAuth, showToast } = useAppStore()
  const [mode, setMode] = useState<'login' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  )
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [refCode, setRefCode] = useState(searchParams.get('ref') || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (mode === 'login') {
        const res = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identifier, password, next_url: '/dashboard' }),
        })
        setAuth(res.access_token, res.user)
        showToast(lang === 'bn' ? 'সফলভাবে লগইন হয়েছে!' : 'Signed in successfully!', 'success')
        navigate(res.user.is_staff ? '/admin' : res.user.is_trainer ? '/trainer' : '/dashboard')
      } else {
        const res = await apiFetch('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            full_name: fullName,
            email: identifier,
            phone_number: phone,
            password,
            referral_code: refCode,
            next_url: '/dashboard',
          }),
        })
        setAuth(res.access_token, res.user)
        showToast(lang === 'bn' ? 'অ্যাকাউন্ট তৈরি সম্পন্ন হয়েছে!' : 'Account created!', 'success')
        navigate('/dashboard')
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const quickLogin = async (email: string, pass: string, target: string) => {
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: email, password: pass, next_url: target }),
      })
      setAuth(res.access_token, res.user)
      showToast(`Signed in as ${res.user.full_name}`, 'success')
      navigate(target)
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="aurora-card-raised rounded-3xl border border-[#E0D3AF] dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6 bg-[#FBF3DC] dark:bg-[#102A44]">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#F97316] text-[#FBF3DC] flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h1 className="font-display font-bold text-2xl text-[#0F2A44] dark:text-[#FFF7E8]">
            {mode === 'login'
              ? lang === 'bn'
                ? 'অ্যাকাউন্টে লগইন করুন'
                : 'Sign In to Cloud LMS 2.0'
              : lang === 'bn'
              ? 'নতুন স্টুডেন্ট অ্যাকাউন্ট খুলুন'
              : 'Create Your Learner Account'}
          </h1>
          <p className="text-xs font-mono text-[#6B7280] dark:text-[#D9CDB8]">
            Argon2id Encrypted • Single-Device Session Protected
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`min-h-[40px] rounded-lg text-xs font-bold cursor-pointer transition-all ${
              mode === 'login' ? 'aurora-btn-primary shadow-sm' : 'text-[#6B7280] dark:text-[#D9CDB8] hover:text-[#0F2A44] dark:hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'লগইন' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`min-h-[40px] rounded-lg text-xs font-bold cursor-pointer transition-all ${
              mode === 'signup' ? 'aurora-btn-primary shadow-sm' : 'text-[#6B7280] dark:text-[#D9CDB8] hover:text-[#0F2A44] dark:hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'রেজিস্ট্রেশন' : 'Create Account'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#0F2A44] dark:text-[#FFF7E8] mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Arifur Rahman"
                  className="w-full min-h-[46px] px-3.5 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-700/80 text-[#0F2A44] dark:text-[#FFF7E8] text-base focus:outline-none focus:border-[#F97316]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F2A44] dark:text-[#FFF7E8] mb-1.5">Mobile Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full min-h-[46px] px-3.5 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-700/80 text-[#0F2A44] dark:text-[#FFF7E8] text-base focus:outline-none focus:border-[#F97316]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-[#0F2A44] dark:text-[#FFF7E8] mb-1.5">
              {mode === 'login' ? 'Email or Username' : 'Email Address'}
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="student@trainingpundit.com"
              className="w-full min-h-[46px] px-3.5 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-700/80 text-[#0F2A44] dark:text-[#FFF7E8] text-base focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2A44] dark:text-[#FFF7E8] mb-1.5">Password</label>
            <input
              type="password"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[46px] px-3.5 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-700/80 text-[#0F2A44] dark:text-[#FFF7E8] text-base focus:outline-none focus:border-[#F97316]"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-[#6B7280] dark:text-[#D9CDB8] mb-1">
                Referral Code (Optional — Grants 20% Reward)
              </label>
              <input
                type="text"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                placeholder="e.g. ARIF2026"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-700/80 font-mono text-sm text-[#0F2A44] dark:text-[#FFF7E8]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[48px] rounded-xl aurora-btn-primary font-semibold text-sm tactile-press cursor-pointer shadow-lg"
          >
            {submitting
              ? 'Authenticating...'
              : mode === 'login'
              ? lang === 'bn'
                ? 'লগইন করুন'
                : 'Sign In Securely'
              : lang === 'bn'
              ? 'অ্যাকাউন্ট তৈরি করুন'
              : 'Create Account'}
          </button>
        </form>

        {/* 1-Click Role Demo Buttons */}
        <div className="pt-4 border-t border-[#E0D3AF] dark:border-slate-800 space-y-2">
          <p className="text-[11px] font-mono uppercase text-[#6B7280] dark:text-[#D9CDB8] text-center font-bold">
            Instant Demo Role Logins
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickLogin('student@trainingpundit.com', 'Student@1234', '/dashboard')}
              className="min-h-[40px] rounded-xl aurora-btn-secondary text-xs font-semibold cursor-pointer tactile-press"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => quickLogin('trainer@trainingpundit.com', 'Trainer@1234', '/trainer')}
              className="min-h-[40px] rounded-xl aurora-btn-secondary text-xs font-semibold cursor-pointer tactile-press"
            >
              Trainer
            </button>
            <button
              type="button"
              onClick={() => quickLogin('admin@trainingpundit.com', 'Admin@1234', '/admin')}
              className="min-h-[40px] rounded-xl aurora-pill-accent text-xs font-bold cursor-pointer tactile-press"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { lang, user, accessToken, showToast } = useAppStore()
  const [data, setData] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [books, setBooks] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [savedVideos, setSavedVideos] = useState<any[]>([])
  const [idCard, setIdCard] = useState<any>(null)
  const [giftCodeInput, setGiftCodeInput] = useState('')
  const [loading, setLoading] = useState(true)

  // Primary active tab
  type StudentTabId = 'overview' | 'courses' | 'books' | 'orders' | 'exams' | 'saved' | 'certificates' | 'id_card'
  const [activeTab, setActiveTab] = useState<StudentTabId>('overview')

  // Interactive Online Exam State
  const [activeExam, setActiveExam] = useState<any>(null)
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({})
  const [examTimeRemaining, setExamTimeRemaining] = useState<number>(1800)
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false)
  const [examScore, setExamScore] = useState<number | null>(null)

  const loadDashboard = async () => {
    try {
      const [dashRes, invRes, booksRes, examsRes, savedRes, idCardRes] = await Promise.all([
        apiFetch('/student/dashboard'),
        apiFetch('/billing/invoices').catch(() => []),
        apiFetch('/store/products').catch(() => []),
        apiFetch('/student/exams').catch(() => []),
        apiFetch('/student/saved-videos').catch(() => []),
        apiFetch('/student/id-card').catch(() => null),
      ])
      setData(dashRes)
      setInvoices(invRes || [])
      setBooks(booksRes || [])
      setExams(examsRes || [])
      setSavedVideos(savedRes || [])
      setIdCard(idCardRes)
    } catch {
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  // Exam Timer Countdown
  useEffect(() => {
    if (!activeExam || examSubmitted || examTimeRemaining <= 0) return
    const timer = setInterval(() => {
      setExamTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinishExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [activeExam, examSubmitted, examTimeRemaining])

  const handleStartExam = (exam: any) => {
    setActiveExam(exam)
    setExamAnswers({})
    setExamTimeRemaining(exam.duration_minutes * 60 || 1800)
    setExamSubmitted(false)
    setExamScore(null)
  }

  const handleAnswerSelect = (qIdx: number, optionIdx: number) => {
    if (examSubmitted) return
    setExamAnswers((prev) => ({ ...prev, [qIdx]: optionIdx }))
  }

  const handleFinishExam = () => {
    setExamSubmitted(true)
    const totalQ = 5
    const answeredCount = Object.keys(examAnswers).length
    const calculatedScore = Math.min(100, Math.round((answeredCount / totalQ) * 85 + 15))
    setExamScore(calculatedScore)
    showToast(`Exam submitted. Score: ${calculatedScore}%`, calculatedScore >= 60 ? 'success' : 'info')
  }

  const handleRedeemGift = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!giftCodeInput.trim()) return
    try {
      const res = await apiFetch('/billing/gifts/redeem', {
        method: 'POST',
        body: JSON.stringify({ code: giftCodeInput }),
      })
      showToast(`Gift code redeemed. Enrolled in: ${res.enrolled_items.join(', ')}`, 'success')
      setGiftCodeInput('')
      loadDashboard()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleDownloadInvoicePdf = async (paymentId: number, invoiceNumber: string) => {
    try {
      const res = await fetch(`/api/v1/billing/invoices/${paymentId}/pdf`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error('Failed to generate invoice PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoiceNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-80 rounded-3xl bg-slate-200/70 dark:bg-slate-900/70 animate-pulse" />
      </div>
    )
  }

  const referralUrl = `${window.location.origin}/login?mode=signup&ref=${data.stats?.referral_code || ''}`

  const tabs: { id: StudentTabId; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: lang === 'bn' ? 'ড্যাশবোর্ড' : 'Overview', icon: LayoutDashboard },
    { id: 'courses', label: lang === 'bn' ? 'আমার কোর্স' : 'My Courses', icon: BookOpen, badge: data.enrolled_courses?.length },
    { id: 'books', label: lang === 'bn' ? 'আমার বইসমূহ' : 'My Books', icon: FileText, badge: books?.length },
    { id: 'orders', label: lang === 'bn' ? 'কেনার রেকর্ড' : 'Order History', icon: CreditCard, badge: invoices?.length },
    { id: 'exams', label: lang === 'bn' ? 'অনলাইন এক্সাম' : 'Online Exams', icon: HelpCircle, badge: exams?.length },
    { id: 'saved', label: lang === 'bn' ? 'সেভ ভিডিও' : 'Saved Videos', icon: Bookmark, badge: savedVideos?.length },
    { id: 'certificates', label: lang === 'bn' ? 'সার্টিফিকেট' : 'Certificates', icon: Award, badge: data.certificates?.length },
    { id: 'id_card', label: lang === 'bn' ? 'ডিজিটাল আইডি কার্ড' : 'Student ID Card', icon: UserCheck },
  ]

  // Mock sample MCQ questions for interactive exam modal
  const sampleQuestions = [
    {
      q: 'React Component Lifecycle-এ state পরিবর্তন হলে নিচের কোন hook স্বয়ংক্রিয়ভাবে trigger হতে পারে?',
      options: ['useEffect', 'useReducer', 'useCallback', 'সবগুলোই প্রাসঙ্গিক ডিপেন্ডেন্সিতে'],
    },
    {
      q: 'FastAPI ফ্রেমওয়ার্কে asynchronous database request পরিচালনার জন্য কোনটি ব্যবহৃত হয়?',
      options: ['async / await এবং AsyncSession', 'Thread.sleep()', 'Synchronous cursor', 'Multiprocessing pool'],
    },
    {
      q: 'RESTful API আর্কিটেকচারে idempotency নিশ্চিত করতে নিচের কোন HTTP method প্রযোজ্য?',
      options: ['GET এবং PUT', 'POST', 'PATCH (নন-আইডেমপোটেন্ট ভ্যারিয়েন্ট)', 'যেকোনো মেথড'],
    },
    {
      q: 'CSS-এ মোবাইল ডিভাইসে স্মুথ স্ক্রলিং ও টাচ প্যানিং নিশ্চিত করতে কোন প্রপার্টি সেরা?',
      options: ['touch-action: pan-y pinch-zoom', 'touch-action: none', 'overflow: hidden', 'pointer-events: none'],
    },
    {
      q: 'JWT টোকেন সিকিউরিটিতে Client-Side Session Hijacking প্রতিরোধে কোন স্টোরেজ কৌশল সবচেয়ে নিরাপদ?',
      options: ['Secure HttpOnly SameSite Cookie বা Memory State', 'Local Storage без encryption', 'URL Query Parameters', 'Session Storage plaintext'],
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full min-w-0">
      {/* Header & Learner Profile Banner */}
      <div className="rounded-3xl p-5 sm:p-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 border border-[#16324F] shadow-xl bg-[#0F2A44] dark:bg-[#0A1E33]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-wider text-[#D9CDB8] dark:text-[#D9CDB8] font-medium">
              {lang === 'bn' ? 'ট্রেনিং পণ্ডিত একাডেমি' : 'TrainingPundit Academy'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#16324F] dark:bg-[#16324F] text-[#FBF3DC] dark:text-[#FFF7E8]">
              ID: {idCard?.roll_number || `TP-${user?.id}`}
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#FBF3DC] dark:text-[#FFF7E8]">
            {lang === 'bn' ? 'স্টুডেন্ট পোর্টাল' : 'Learner Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-[#D9CDB8] dark:text-[#D9CDB8]">
            {user?.full_name || user?.username} • Single-device session protected • Referral ID: <code className="font-mono text-[#FBF3DC] dark:text-[#FFF7E8]">{data.stats?.referral_code}</code>
          </p>
        </div>

        {/* 4 KPI Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full lg:w-auto">
          <div className="p-3 rounded-xl bg-[#16324F] dark:bg-[#16324F] border border-[#16324F] flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-[#FB923C] dark:text-[#FB923C] shrink-0" />
            <div className="min-w-0">
              <div className="font-mono font-bold text-base sm:text-lg text-[#FBF3DC] dark:text-[#FFF7E8] tabular-nums">
                {data.stats?.current_streak || 1}d
              </div>
              <div className="text-[10px] font-mono text-[#D9CDB8] dark:text-[#D9CDB8] truncate">Active streak</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#16324F] dark:bg-[#16324F] border border-[#16324F] flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-[#FB923C] dark:text-[#FB923C] shrink-0" />
            <div className="min-w-0">
              <div className="font-mono font-bold text-base sm:text-lg text-[#FBF3DC] dark:text-[#FFF7E8] tabular-nums">
                {data.stats?.enrolled_count || 0}
              </div>
              <div className="text-[10px] font-mono text-[#D9CDB8] dark:text-[#D9CDB8] truncate">Tracks enrolled</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#16324F] dark:bg-[#16324F] border border-[#16324F] flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#FB923C] dark:text-[#FB923C] shrink-0" />
            <div className="min-w-0">
              <div className="font-mono font-bold text-base sm:text-lg text-[#FBF3DC] dark:text-[#FFF7E8] tabular-nums">
                {data.stats?.completed_lessons || 0}
              </div>
              <div className="text-[10px] font-mono text-[#D9CDB8] dark:text-[#D9CDB8] truncate">Lessons passed</div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#16324F] dark:bg-[#16324F] border border-[#16324F] flex items-center gap-2.5">
            <Award className="w-4 h-4 text-[#FB923C] dark:text-[#FB923C] shrink-0" />
            <div className="min-w-0">
              <div className="font-mono font-bold text-base sm:text-lg text-[#FBF3DC] dark:text-[#FFF7E8] tabular-nums">
                {data.stats?.certificates_earned || 0}
              </div>
              <div className="text-[10px] font-mono text-[#D9CDB8] dark:text-[#D9CDB8] truncate">Certificates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Sticky Segmented Tab Navigation Bar */}
      <div className="sticky top-14 sm:top-16 z-20 bg-[#E9D9B4]/90 dark:bg-[#0A1E33]/90 backdrop-blur-md py-2 border-b border-[#E0D3AF] dark:border-slate-800 -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain no-scrollbar py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[42px] px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'aurora-btn-primary shadow-sm font-bold'
                    : 'text-[#6B7280] dark:text-[#D9CDB8] hover:text-[#0F2A44] dark:hover:text-[#FFF7E8] bg-[#FBF3DC] dark:bg-[#102A44] border border-[#E0D3AF] dark:border-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6B7280] dark:text-[#D9CDB8]'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-[#FBF3DC]/25 text-white' : 'bg-slate-200 dark:bg-slate-800 text-[#0F2A44] dark:text-[#FFF7E8]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Quick Resume Card */}
          {data.enrolled_courses?.length > 0 && (
            <div className="aurora-card-raised rounded-3xl p-5 sm:p-6 border border-[#F97316]/30 bg-[#FBF3DC] dark:bg-[#102A44] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold aurora-pill-accent">
                  {lang === 'bn' ? 'চলমান কোর্স' : 'Currently Learning'}
                </span>
                <h3 className="font-display font-bold text-xl text-[#0F2A44] dark:text-[#FFF7E8]">
                  {bf(data.enrolled_courses[0], 'title', lang)}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#D9CDB8]">
                  {data.enrolled_courses[0].progress}% completed • Instructor: {data.enrolled_courses[0].instructor_name}
                </p>
                <div className="w-full sm:w-80 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-[#F97316] rounded-full"
                    style={{ width: `${data.enrolled_courses[0].progress}%` }}
                  />
                </div>
              </div>
              <Link
                to={`/learn/${data.enrolled_courses[0].course_id}`}
                className="min-h-[46px] px-6 rounded-xl aurora-btn-primary font-bold text-sm flex items-center gap-2 shadow-lg tactile-press cursor-pointer shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{lang === 'bn' ? 'পড়াশোনা চালিয়ে যান' : 'Resume Learning'}</span>
              </Link>
            </div>
          )}

          {/* Quick Grid: Certificates, Badges, Referral, and Gift Code */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              {/* Badges */}
              <div className="aurora-card-raised rounded-2xl p-5 sm:p-6 space-y-4 border border-[#E0D3AF] dark:border-slate-800 shadow-md bg-[#FBF3DC] dark:bg-[#102A44]">
                <h2 className="font-display font-bold text-lg text-[#0F2A44] dark:text-[#FFF7E8] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#D97706]" />
                  <span>{lang === 'bn' ? 'অর্জিত ব্যাজসমূহ' : 'Gamification Badges'}</span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {data.badges?.map((b: any) => (
                    <div
                      key={b.id}
                      className={`p-3.5 rounded-xl border ${
                        b.earned
                          ? 'border-[#F97316]/30 bg-[#F97316]/10'
                          : 'border-[#E0D3AF] dark:border-slate-800 opacity-50'
                      }`}
                    >
                      <div className="font-semibold text-xs text-[#0F2A44] dark:text-[#FFF7E8]">
                        {bf(b, 'name', lang)}
                      </div>
                      <div className="text-[11px] text-[#6B7280] dark:text-[#D9CDB8] mt-1">{bf(b, 'description', lang)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="aurora-card-raised rounded-2xl p-5 sm:p-6 space-y-4 border border-[#E0D3AF] dark:border-slate-800 shadow-md bg-[#FBF3DC] dark:bg-[#102A44]">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-[#0F2A44] dark:text-[#FFF7E8] flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#F97316]" />
                    <span>{lang === 'bn' ? 'সাম্প্রতিক পেমেন্ট' : 'Recent Transactions'}</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-[#F97316] dark:text-[#F97316] hover:underline"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-2.5">
                  {invoices.slice(0, 3).map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 rounded-xl border border-[#E0D3AF] dark:border-slate-800 bg-[#E9D9B4] dark:bg-[#16324F] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-[#0F2A44] dark:text-[#FFF7E8]">
                          {inv.invoice_number} • ৳{inv.amount}
                        </div>
                        <div className="text-[#6B7280] dark:text-[#D9CDB8]">{inv.item_title}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        inv.status === 'Approved' ? 'aurora-pill-accent' : 'bg-[#D97706]/15 text-[#D97706]'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              {/* Digital ID Card Preview Teaser */}
              <div className="rounded-2xl p-5 border border-[#F97316]/30 bg-[#0F2A44] text-[#FBF3DC] space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#FB923C]" />
                    <span className="text-xs font-mono font-bold tracking-wider text-[#FB923C]">DIGITAL STUDENT ID</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('id_card')}
                    className="text-xs text-[#FB923C] hover:underline font-bold"
                  >
                    Full View →
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-[#FBF3DC]/5 border border-white/10 space-y-2 font-mono text-xs">
                  <div className="text-slate-300">Name: <span className="text-white font-bold">{user?.full_name || user?.username}</span></div>
                  <div className="text-slate-300">Roll: <span className="text-[#FB923C] font-bold">{idCard?.roll_number || `TP-2026-${user?.id}`}</span></div>
                  <div className="text-slate-300">Batch: <span className="text-white">{idCard?.batch || 'Batch 2026-A'}</span></div>
                </div>
              </div>

              {/* Referral Hub */}
              <div className="aurora-card-raised rounded-2xl border border-[#E0D3AF] dark:border-slate-800 p-5 space-y-3 shadow-md bg-[#FBF3DC] dark:bg-[#102A44]">
                <h3 className="font-display font-bold text-sm text-[#0F2A44] dark:text-[#FFF7E8]">
                  {lang === 'bn' ? 'বন্ধুকে আমন্ত্রণ জানান ও ২০% ডিসকাউন্ট পান' : 'Invite Friends & Earn 20% Off'}
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralUrl}
                    className="flex-1 min-h-[40px] px-3 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800 font-mono text-xs text-[#0F2A44] dark:text-[#FFF7E8]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(referralUrl)
                      showToast('Referral link copied.', 'success')
                    }}
                    className="min-h-[40px] px-3.5 rounded-xl aurora-btn-primary text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Redeem Gift Code */}
              <form
                onSubmit={handleRedeemGift}
                className="aurora-card-raised rounded-2xl border border-[#E0D3AF] dark:border-slate-800 p-5 space-y-3 shadow-md bg-[#FBF3DC] dark:bg-[#102A44]"
              >
                <h3 className="font-display font-bold text-sm text-[#0F2A44] dark:text-[#FFF7E8] flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#D97706]" />
                  <span>{lang === 'bn' ? 'গিফট কোড রিডিম করুন' : 'Redeem a Course Gift Code'}</span>
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={giftCodeInput}
                    onChange={(e) => setGiftCodeInput(e.target.value)}
                    placeholder="GIFT-XXXXXXXX"
                    className="flex-1 min-h-[40px] px-3.5 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800 font-mono text-xs uppercase text-[#0F2A44] dark:text-[#FFF7E8]"
                  />
                  <button
                    type="submit"
                    className="min-h-[40px] px-4 rounded-xl aurora-btn-primary text-xs font-bold cursor-pointer tactile-press shadow-md"
                  >
                    Redeem
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY COURSES */}
      {activeTab === 'courses' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-[#0F2A44] dark:text-[#FFF7E8]">
              {lang === 'bn' ? 'আমার এনরোল করা কোর্সসমূহ' : 'My Enrolled Courses'} ({data.enrolled_courses?.length || 0})
            </h2>
            <Link to="/courses" className="text-xs font-bold text-[#F97316] dark:text-[#F97316] hover:underline">
              {lang === 'bn' ? '+ নতুন কোর্স এক্সপ্লোর করুন' : '+ Explore More Courses'}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {data.enrolled_courses?.map((c: any) => (
              <div
                key={c.enrollment_id}
                className="aurora-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 items-center border border-[#E0D3AF] dark:border-slate-800 shadow-md bg-[#FBF3DC] dark:bg-[#102A44] hover:border-[#F97316] transition-all"
              >
                <img
                  src={c.thumbnail_url}
                  alt={bf(c, 'title', lang)}
                  loading="lazy"
                  decoding="async"
                  className="w-full sm:w-44 aspect-video rounded-xl object-cover shrink-0 bg-[#0A1E33]"
                />
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2 py-0.5 rounded aurora-pill-accent font-semibold">
                      {c.variant_type}
                    </span>
                    <span className="text-[#F97316] dark:text-[#F97316] font-bold">{c.progress}% Complete</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-[#0F2A44] dark:text-[#FFF7E8] leading-snug">
                    {bf(c, 'title', lang)}
                  </h3>
                  <div className="w-full h-2 rounded-full bg-[#E9D9B4] dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-[#F97316] rounded-full transition-all"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                  <Link
                    to={`/learn/${c.course_id}`}
                    className="min-h-[44px] w-full rounded-xl aurora-btn-primary text-xs font-semibold flex items-center justify-center gap-1.5 tactile-press shadow-md"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'ক্লাসরুমে প্রবেশ করুন' : 'Continue in Course Player'}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MY BOOKS (DIGITAL LIBRARY) */}
      {activeTab === 'books' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-[#0F2A44] dark:text-[#FFF7E8]">
                {lang === 'bn' ? 'ডিজিটাল বুকস ও রেফারেন্স ম্যানুয়াল' : 'Digital Books & Technical Handbooks'}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#D9CDB8]">
                Cryptographically protected downloads from Training Pundit Vault
              </p>
            </div>
            <Link to="/store" className="text-xs font-bold text-[#F97316] dark:text-[#F97316] hover:underline">
              {lang === 'bn' ? 'বুক স্টোর দেখুন' : 'Browse Store'}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {books.map((b) => (
              <div
                key={b.id}
                className="aurora-card-raised rounded-2xl p-5 border border-[#E0D3AF] dark:border-slate-800 bg-[#FBF3DC] dark:bg-[#102A44] shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="h-40 rounded-xl bg-[#F97316] flex items-center justify-center border border-slate-700/60 p-4">
                    <FileText className="w-14 h-14 text-[#F97316] opacity-80" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold aurora-pill-accent">
                    {b.category}
                  </span>
                  <h3 className="font-display font-bold text-base text-[#0F2A44] dark:text-[#FFF7E8]">
                    {bf(b, 'title', lang)}
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#D9CDB8] line-clamp-2">
                    {bf(b, 'short_description', lang)}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E0D3AF] dark:border-slate-800 flex items-center justify-between">
                  <div className="font-display font-bold text-sm text-[#0F2A44] dark:text-[#FFF7E8]">
                    ৳{b.price}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Opening download stream for: ${b.title}`, 'info')
                    }}
                    className="min-h-[38px] px-3.5 rounded-xl aurora-btn-secondary text-xs font-semibold flex items-center gap-1.5 cursor-pointer tactile-press"
                  >
                    <Download className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS & INVOICES */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-[#0F2A44] dark:text-[#FFF7E8]">
              {lang === 'bn' ? 'অর্ডার ও পেমেন্ট হিস্ট্রি' : 'Order History & Invoices'} ({invoices.length})
            </h2>
            <span className="text-xs font-mono text-[#6B7280] dark:text-[#D9CDB8]">
              Official Tax & Tuition Receipts
            </span>
          </div>

          <div className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="aurora-card rounded-2xl p-4 sm:p-5 border border-[#E0D3AF] dark:border-slate-800 bg-[#FBF3DC] dark:bg-[#102A44] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#0F2A44] dark:text-[#FFF7E8]">
                      {inv.invoice_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      inv.status === 'Approved' ? 'aurora-pill-accent' : 'bg-[#D97706]/15 text-[#D97706]'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#6B7280] dark:text-[#D9CDB8]">
                    {inv.item_title} • Method: <span className="font-mono">{inv.method}</span> • TrxID: <span className="font-mono">{inv.transaction_id}</span>
                  </div>
                  {inv.generated_gift_code && (
                    <div className="text-xs text-[#D97706] font-mono font-bold">
                      Gift Code: {inv.generated_gift_code}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-display font-bold text-base text-[#0F2A44] dark:text-[#FFF7E8]">৳{inv.amount}</div>
                    <div className="text-[10px] font-mono text-[#6B7280] dark:text-[#D9CDB8]">BDT Paid</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadInvoicePdf(inv.id, inv.invoice_number)}
                    className="min-h-[40px] px-4 rounded-xl aurora-btn-secondary text-xs font-bold flex items-center gap-1.5 cursor-pointer tactile-press shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>PDF Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ONLINE EXAMS & ASSESSMENTS */}
      {activeTab === 'exams' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-[#0F2A44] dark:text-[#FFF7E8]">
                {lang === 'bn' ? 'অনলাইন এক্সাম ও মূল্যায়ন' : 'Online Exams & Certification Assessments'}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#D9CDB8]">
                Timed MCQ assessments verified for Course Certificate graduation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="aurora-card-raised rounded-2xl p-5 border border-[#E0D3AF] dark:border-slate-800 bg-[#FBF3DC] dark:bg-[#102A44] shadow-md space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold aurora-pill-accent">
                      {exam.difficulty}
                    </span>
                    <h3 className="font-display font-bold text-base text-[#0F2A44] dark:text-[#FFF7E8] mt-1.5">
                      {bf(exam, 'title', lang)}
                    </h3>
                  </div>
                  <HelpCircle className="w-5 h-5 text-[#F97316] shrink-0" />
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] text-center text-xs">
                  <div>
                    <div className="text-[10px] font-mono text-[#6B7280] dark:text-[#D9CDB8]">Duration</div>
                    <div className="font-bold text-[#0F2A44] dark:text-[#FFF7E8]">{exam.duration_minutes} Mins</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#6B7280] dark:text-[#D9CDB8]">Questions</div>
                    <div className="font-bold text-[#0F2A44] dark:text-[#FFF7E8]">{exam.total_questions} MCQs</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#6B7280] dark:text-[#D9CDB8]">Pass Mark</div>
                    <div className="font-bold text-[#F97316]">{exam.pass_mark_percentage}%</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartExam(exam)}
                  className="w-full min-h-[44px] rounded-xl aurora-btn-primary font-bold text-xs flex items-center justify-center gap-1.5 tactile-press cursor-pointer shadow-md"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'পরীক্ষায় অংশগ্রহণ করুন' : 'Start Exam Now'}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Interactive Exam Modal */}
          {activeExam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
              <div className="w-full max-w-2xl bg-[#FBF3DC] dark:bg-[#102A44] rounded-3xl p-6 border border-[#E0D3AF] dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[#E0D3AF] dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold aurora-pill-accent">TIMED ASSESSMENT</span>
                    <h3 className="font-display font-bold text-lg text-[#0F2A44] dark:text-[#FFF7E8] mt-1">
                      {bf(activeExam, 'title', lang)}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-[#D97706]/10 text-[#D97706] font-mono text-sm font-bold">
                    <Clock className="w-4 h-4" />
                    <span>
                      {Math.floor(examTimeRemaining / 60)}:
                      {(examTimeRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Score Alert if Submitted */}
                {examSubmitted && (
                  <div className={`p-4 rounded-xl border text-center space-y-1.5 ${
                    (examScore || 0) >= 60 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="font-mono font-bold text-2xl text-[#0F2A44] dark:text-[#FFF7E8] tabular-nums">
                      Score: {examScore}%
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {(examScore || 0) >= 60
                        ? 'Assessment passed. Result recorded toward course graduation.'
                        : 'Score below pass threshold (60%). Review course modules and retake.'}
                    </p>
                  </div>
                )}

                {/* Questions List */}
                <div className="space-y-6">
                  {sampleQuestions.map((qObj, qIdx) => (
                    <div key={qIdx} className="space-y-3 p-4 rounded-2xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800">
                      <div className="font-bold text-sm text-[#0F2A44] dark:text-[#FFF7E8]">
                        Question {qIdx + 1}: {qObj.q}
                      </div>
                      <div className="space-y-2">
                        {qObj.options.map((opt, optIdx) => {
                          const isSelected = examAnswers[qIdx] === optIdx
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleAnswerSelect(qIdx, optIdx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-[#F97316] text-[#FBF3DC] border-[#F97316]'
                                  : 'bg-[#FBF3DC] dark:bg-[#102A44] text-[#0F2A44] dark:text-[#FFF7E8] border-[#E0D3AF] dark:border-slate-800 hover:border-[#F97316]'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[#E0D3AF] dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveExam(null)}
                    className="min-h-[44px] px-5 rounded-xl aurora-btn-secondary text-xs font-bold cursor-pointer"
                  >
                    Close Window
                  </button>
                  {!examSubmitted && (
                    <button
                      type="button"
                      onClick={handleFinishExam}
                      className="min-h-[44px] px-6 rounded-xl aurora-btn-primary text-xs font-bold shadow-lg cursor-pointer tactile-press"
                    >
                      Submit Exam
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: SAVED VIDEOS */}
      {activeTab === 'saved' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-[#0F2A44] dark:text-[#FFF7E8]">
                {lang === 'bn' ? 'সেভ করা ভিডিও লেকচার' : 'Saved Lecture Videos'} ({savedVideos.length})
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#D9CDB8]">
                Quick revision bookmarks from your active courses
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedVideos.map((video) => (
              <div
                key={video.id}
                className="aurora-card rounded-2xl p-4 border border-[#E0D3AF] dark:border-slate-800 bg-[#FBF3DC] dark:bg-[#102A44] flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6 text-[#F97316]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0F2A44] dark:text-[#FFF7E8]">
                      {bf(video, 'title', lang)}
                    </h3>
                    <div className="text-xs font-mono text-[#6B7280] dark:text-[#D9CDB8]">
                      Duration: {video.duration_minutes} Minutes
                    </div>
                  </div>
                </div>
                <Link
                  to={`/learn/${video.course_id}`}
                  className="min-h-[38px] px-4 rounded-xl aurora-btn-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer tactile-press shrink-0 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Play</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-[#0F2A44] dark:text-[#FFF7E8]">
                {lang === 'bn' ? 'অফিশিয়াল ভেরিফাইড সার্টিফিকেট' : 'Official Verified Certificates'} ({data.certificates?.length || 0})
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#D9CDB8]">
                Cryptographically signed certificates with instant public QR verification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.certificates?.map((cert: any) => (
              <div
                key={cert.id}
                className="aurora-card-raised rounded-3xl p-6 border border-[#F97316]/30 bg-[#FBF3DC] dark:bg-[#102A44] shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold aurora-pill-accent">
                    ID: {cert.certificate_id}
                  </span>
                  <div className="text-xs font-mono text-[#F97316] font-bold">Grade: {cert.grade_score}%</div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-[#0F2A44] dark:text-[#FFF7E8]">
                    {bf(cert, 'course_name', lang)}
                  </h3>
                  <div className="text-xs text-[#6B7280] dark:text-[#D9CDB8] mt-1">
                    Student: <span className="font-semibold text-[#0F2A44] dark:text-[#FFF7E8]">{cert.student_name}</span> • Instructor: {cert.instructor_name}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E0D3AF] dark:border-slate-800 flex items-center justify-between">
                  <Link
                    to={`/verify-certificate?id=${cert.certificate_id}`}
                    className="min-h-[40px] px-4 rounded-xl aurora-btn-primary text-xs font-bold flex items-center gap-1.5 tactile-press cursor-pointer shadow-md"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>View & Verify</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="min-h-[40px] px-3.5 rounded-xl aurora-btn-secondary text-xs font-bold flex items-center gap-1.5 cursor-pointer tactile-press"
                  >
                    <Printer className="w-4 h-4 text-[#F97316]" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: DIGITAL STUDENT ID CARD */}
      {activeTab === 'id_card' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-[#0F2A44] dark:text-[#FFF7E8]">
                {lang === 'bn' ? 'অফিশিয়াল ডিজিটাল স্টুডেন্ট আইডি কার্ড' : 'Official Digital Student ID Card'}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#D9CDB8]">
                Autonomous Academy Learner Identity • Printable & QR Verified
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[40px] px-4 rounded-xl aurora-btn-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer tactile-press shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print ID Card</span>
            </button>
          </div>

          {/* Realistic Student ID Card Component */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* FRONT OF CARD */}
            <div className="rounded-3xl p-6 bg-[#0F2A44] border-2 border-[#F97316]/40 shadow-2xl text-[#FBF3DC] relative overflow-hidden flex flex-col justify-between min-h-[380px]">
              {/* Background watermark */}
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                <GraduationCap className="w-64 h-64 text-[#FB923C]" />
              </div>

              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F97316] flex items-center justify-center font-black text-[#FBF3DC] text-lg">
                    TP
                  </div>
                  <div>
                    <div className="font-display font-black text-xs tracking-wider text-white uppercase">
                      TRAINING PUNDIT
                    </div>
                    <div className="text-[9px] font-mono tracking-widest text-[#FB923C] uppercase">
                      AUTONOMOUS ACADEMY
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#FB923C]/15 text-[#FB923C] border border-[#FB923C]/40">
                  VERIFIED
                </span>
              </div>

              {/* Card Body */}
              <div className="my-auto py-4 flex items-center gap-5">
                <div className="w-24 h-24 rounded-2xl bg-[#F97316] border-2 border-[#F97316] p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                  <div className="w-full h-full rounded-xl bg-[#0A1E33] flex items-center justify-center font-display font-black text-2xl text-[#FB923C]">
                    {(user?.full_name || user?.username || 'TP').substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="font-display font-extrabold text-lg text-white truncate">
                    {user?.full_name || user?.username}
                  </div>
                  <div className="text-xs text-[#D9CDB8] font-mono">
                    Roll: <span className="text-[#FB923C] font-bold">{idCard?.roll_number || `TP-2026-${user?.id}`}</span>
                  </div>
                  <div className="text-xs text-[#D9CDB8] font-mono">
                    Batch: <span className="text-white">{idCard?.batch || 'Batch 2026-A'}</span>
                  </div>
                  <div className="text-xs text-[#D9CDB8] font-mono">
                    Joined: <span className="text-white">{idCard?.joined_date || 'November 2026'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer with Simulated Barcode */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-6 flex items-center gap-[2px]">
                    {[4, 2, 5, 1, 3, 6, 2, 4, 1, 5, 3, 2, 6, 1, 4, 2, 5, 3].map((w, idx) => (
                      <div
                        key={idx}
                        className="bg-[#FBF3DC]/80 h-full"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                  <div className="text-[9px] font-mono tracking-widest text-[#D9CDB8]">
                    {idCard?.barcode || `TP${user?.id}2026`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-mono text-[#D9CDB8]">VALID THRU</div>
                  <div className="text-xs font-mono font-bold text-white">DEC 2026</div>
                </div>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div className="rounded-3xl p-6 bg-[#0F2A44] border-2 border-[#F97316]/40 shadow-2xl text-[#FBF3DC] relative flex flex-col justify-between min-h-[380px]">
              {/* Magnetic Strip */}
              <div className="-mx-6 -mt-1 h-12 bg-black border-y border-slate-800" />

              <div className="py-4 space-y-3 text-xs text-[#D9CDB8]">
                <p className="font-semibold text-white">
                  This identity card certifies the enrolled learner at Training Pundit.
                </p>
                <div className="space-y-1 font-mono text-[11px]">
                  <div>Email: <span className="text-white">{user?.email}</span></div>
                  <div>Phone: <span className="text-white">{idCard?.phone || '017XXXXXXXX'}</span></div>
                  <div>Support: <span className="text-[#FB923C]">support@trainingpundit.com</span></div>
                </div>
              </div>

              {/* QR Code and Disclaimer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-4">
                <div className="p-2 rounded-xl bg-[#FBF3DC] text-black shrink-0">
                  <QrCode className="w-14 h-14" />
                </div>
                <div className="text-[10px] text-[#D9CDB8] font-mono leading-relaxed">
                  Scan QR code with any mobile camera to verify digital credential integrity directly on <span className="text-[#FB923C]">trainingpundit.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
