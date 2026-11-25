import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  CreditCard,
  Database,
  DollarSign,
  ExternalLink,
  Filter,
  FolderGit2,
  GraduationCap,
  HelpCircle,
  Lock,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Unlock,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  Video,
  Wallet,
  Wrench,
  X,
  XCircle,
} from 'lucide-react'
import { Card3D } from '../components/common/Card3D'
import { apiFetch } from '../lib/api'
import { useAppStore } from '../stores/useAppStore'

export const TrainerStudioPage: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useAppStore()
  const [data, setData] = useState<any>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<number>(1)

  // Forms
  const [courseForm, setCourseForm] = useState({
    title: '',
    title_bn: '',
    description: '',
    category: 'Web Development',
    price: 2500,
    is_live_course: false,
    final_project_title: '',
  })
  const [lessonForm, setLessonForm] = useState({
    title: '',
    video_id: 'M7lc1UVf-VE',
    duration_minutes: 20,
    pass_mark: 50,
    order: 4,
  })
  const [quizForm, setQuizForm] = useState({
    lesson_id: 1,
    text: '',
    question_type: 'Short',
    correct_answer: '',
  })
  const [gradeInputs, setGradeInputs] = useState<Record<number, { grade: string; feedback: string }>>({})

  const loadStudio = async () => {
    try {
      const res = await apiFetch('/trainer/studio')
      setData(res)
      if (res.courses?.length > 0 && !selectedCourseId) {
        setSelectedCourseId(res.courses[0].id)
      }
    } catch (err: any) {
      showToast(err.message, 'error')
      navigate('/login')
    }
  }

  useEffect(() => {
    loadStudio()
  }, [])

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiFetch('/trainer/courses', {
        method: 'POST',
        body: JSON.stringify(courseForm),
      })
      showToast('New course track published!', 'success')
      setCourseForm({
        title: '',
        title_bn: '',
        description: '',
        category: 'Web Development',
        price: 2500,
        is_live_course: false,
        final_project_title: '',
      })
      loadStudio()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiFetch(`/trainer/courses/${selectedCourseId}/lessons`, {
        method: 'POST',
        body: JSON.stringify(lessonForm),
      })
      showToast('Lesson added to course!', 'success')
      setLessonForm({ ...lessonForm, title: '', order: lessonForm.order + 1 })
      loadStudio()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiFetch(`/trainer/lessons/${quizForm.lesson_id}/questions`, {
        method: 'POST',
        body: JSON.stringify(quizForm),
      })
      showToast('Quiz question added (Normalized Short/MCQ schema)!', 'success')
      setQuizForm({ ...quizForm, text: '', correct_answer: '' })
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleGradeSubmission = async (subId: number) => {
    const g = gradeInputs[subId]
    if (!g || !g.grade) return
    try {
      const res = await apiFetch(`/trainer/submissions/${subId}/grade`, {
        method: 'POST',
        body: JSON.stringify({ grade: Number(g.grade), feedback: g.feedback || 'Great job!' }),
      })
      showToast(
        res.certificate_minted
          ? `Graded ${res.grade}/100 & Minted Certificate ${res.certificate_minted}!`
          : `Submission graded: ${res.grade}/100`,
        'success'
      )
      loadStudio()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-80 rounded-3xl bg-slate-200/70 dark:bg-slate-900/70 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full aurora-pill-teal font-mono text-xs font-semibold uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5 text-[#35C6BE]" /> Instructor & Mentor Workspace
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#14213A] dark:text-[#F5F8FF] mt-1.5">
            Trainer Studio — Curriculum & Assessment Builder
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3 text-xs font-mono w-full sm:w-auto">
          <div className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-white dark:bg-[#0C1528] border border-[#E2E8F2] dark:border-slate-800 text-center sm:text-left shadow-xs">
            <span className="text-[10px] sm:text-xs text-[#5D6B82] dark:text-[#A8B7CE] block sm:inline">Courses: </span>
            <strong className="text-[#14213A] dark:text-[#F5F8FF]">{data.stats.managed_courses}</strong>
          </div>
          <div className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-white dark:bg-[#0C1528] border border-[#E2E8F2] dark:border-slate-800 text-center sm:text-left shadow-xs">
            <span className="text-[10px] sm:text-xs text-[#5D6B82] dark:text-[#A8B7CE] block sm:inline">Lessons: </span>
            <strong className="text-[#14213A] dark:text-[#F5F8FF]">{data.stats.total_lessons}</strong>
          </div>
          <div className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-amber-500/15 text-amber-500 font-bold border border-amber-500/30 text-center sm:text-left">
            <span className="text-[10px] sm:text-xs block sm:inline">Pending: </span>
            {data.stats.pending_submissions}
          </div>
        </div>
      </div>

      {/* Create Course & Add Lesson Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleCreateCourse}
          className="rounded-2xl border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#0C1528] p-6 space-y-4 shadow-sm"
        >
          <h2 className="font-display font-bold text-lg text-[#14213A] dark:text-[#F5F8FF] flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#356DFF]" /> Launch New Course Track
          </h2>
          <input
            type="text"
            required
            value={courseForm.title}
            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
            placeholder="Course Title (English)"
            className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-sm text-[#14213A] dark:text-[#F5F8FF] focus:outline-hidden focus:border-[#356DFF]"
          />
          <input
            type="text"
            value={courseForm.title_bn}
            onChange={(e) => setCourseForm({ ...courseForm, title_bn: e.target.value })}
            placeholder="কোর্সের নাম (বাংলা)"
            className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-sm text-[#14213A] dark:text-[#F5F8FF] focus:outline-hidden focus:border-[#356DFF]"
          />
          <textarea
            rows={2}
            required
            value={courseForm.description}
            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            placeholder="Detailed course description..."
            className="w-full p-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-sm text-[#14213A] dark:text-[#F5F8FF] focus:outline-hidden focus:border-[#356DFF]"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              required
              value={courseForm.price}
              onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
              placeholder="Price (BDT)"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-sm font-mono text-[#14213A] dark:text-[#F5F8FF] focus:outline-hidden focus:border-[#356DFF]"
            />
            <input
              type="text"
              value={courseForm.category}
              onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
              placeholder="Category"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-sm text-[#14213A] dark:text-[#F5F8FF] focus:outline-hidden focus:border-[#356DFF]"
            />
          </div>
          <button
            type="submit"
            className="min-h-[44px] px-5 rounded-xl aurora-btn-primary text-xs font-semibold tactile-press cursor-pointer shadow-md"
          >
            Create Course Track
          </button>
        </form>

        {/* Add Lesson & Short Quiz Builder */}
        <div className="space-y-6">
          <form
            onSubmit={handleCreateLesson}
            className="rounded-2xl border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#0C1528] p-6 space-y-3 shadow-sm"
          >
            <h2 className="font-display font-bold text-lg text-[#14213A] dark:text-[#F5F8FF] flex items-center gap-2">
              <Video className="w-5 h-5 text-[#35C6BE]" /> Add Sequential Lesson
            </h2>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-xs font-semibold text-[#14213A] dark:text-[#F5F8FF] focus:outline-hidden focus:border-[#356DFF]"
            >
              {data.courses.map((c: any) => (
                <option key={c.id} value={c.id}>
                  Course #{c.id}: {c.title}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="Lesson Title"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-sm text-[#14213A] dark:text-[#F5F8FF] focus:outline-hidden focus:border-[#356DFF]"
              />
              <input
                type="text"
                required
                value={lessonForm.video_id}
                onChange={(e) => setLessonForm({ ...lessonForm, video_id: e.target.value })}
                placeholder="YouTube Video ID"
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-sm font-mono text-[#14213A] dark:text-[#F5F8FF] focus:outline-hidden focus:border-[#356DFF]"
              />
            </div>
            <button
              type="submit"
              className="min-h-[42px] px-5 rounded-xl aurora-btn-primary text-xs font-semibold tactile-press cursor-pointer shadow-md"
            >
              Add Lesson to Curriculum
            </button>
          </form>

          <form
            onSubmit={handleCreateQuestion}
            className="rounded-2xl border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#0C1528] p-6 space-y-3 shadow-sm"
          >
            <h2 className="font-display font-bold text-lg text-[#14213A] dark:text-[#F5F8FF] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-500" /> Add Short-Answer Quiz Question
            </h2>
            <select
              value={quizForm.lesson_id}
              onChange={(e) => setQuizForm({ ...quizForm, lesson_id: Number(e.target.value) })}
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-xs font-semibold text-[#14213A] dark:text-[#F5F8FF] focus:outline-hidden focus:border-[#356DFF]"
            >
              {data.lessons.map((l: any) => (
                <option key={l.id} value={l.id}>
                  Lesson #{l.id}: {l.title}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              value={quizForm.text}
              onChange={(e) => setQuizForm({ ...quizForm, text: e.target.value })}
              placeholder="Question prompt..."
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-sm text-[#14213A] dark:text-[#F5F8FF] focus:outline-hidden focus:border-[#356DFF]"
            />
            <input
              type="text"
              required
              value={quizForm.correct_answer}
              onChange={(e) => setQuizForm({ ...quizForm, correct_answer: e.target.value })}
              placeholder="Exact expected short answer..."
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-sm font-mono text-[#14213A] dark:text-[#F5F8FF] focus:outline-hidden focus:border-[#356DFF]"
            />
            <button
              type="submit"
              className="min-h-[42px] px-5 rounded-xl aurora-btn-secondary text-xs font-semibold tactile-press cursor-pointer"
            >
              Save Assessment Question
            </button>
          </form>
        </div>
      </div>

      {/* Capstone Project Submissions Workstation */}
      <div className="rounded-2xl border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#0C1528] p-6 space-y-4 shadow-sm">
        <h2 className="font-display font-bold text-lg text-[#14213A] dark:text-[#F5F8FF] flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-[#356DFF]" /> Student Capstone Project Submissions
        </h2>
        {(data.submissions || []).length === 0 ? (
          <p className="text-xs text-[#5D6B82] dark:text-[#A8B7CE]">No capstone project submissions yet.</p>
        ) : (
          <div className="space-y-3">
            {data.submissions.map((s: any) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-[#E2E8F2] dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-[#F5F7FB] dark:bg-[#111F36]/50"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-sm text-[#14213A] dark:text-[#F5F8FF]">
                    {s.user_name} • {s.course_title}
                  </div>
                  <a
                    href={s.github_or_live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-[#356DFF] dark:text-[#35C6BE] hover:underline block"
                  >
                    {s.github_or_live_url}
                  </a>
                  <p className="text-xs text-[#5D6B82] dark:text-[#A8B7CE]">{s.notes}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder={s.grade !== null ? String(s.grade) : 'Grade (0-100)'}
                      value={gradeInputs[s.id]?.grade || ''}
                      onChange={(e) =>
                        setGradeInputs({
                          ...gradeInputs,
                          [s.id]: { grade: e.target.value, feedback: gradeInputs[s.id]?.feedback || '' },
                        })
                      }
                      className="w-full sm:w-28 min-h-[42px] px-3 rounded-xl bg-white dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-xs font-mono font-bold text-[#14213A] dark:text-[#F5F8FF]"
                    />
                    <input
                      type="text"
                      placeholder="Feedback..."
                      value={gradeInputs[s.id]?.feedback || ''}
                      onChange={(e) =>
                        setGradeInputs({
                          ...gradeInputs,
                          [s.id]: { grade: gradeInputs[s.id]?.grade || '95', feedback: e.target.value },
                        })
                      }
                      className="w-full sm:w-44 min-h-[42px] px-3 rounded-xl bg-white dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-xs text-[#14213A] dark:text-[#F5F8FF]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGradeSubmission(s.id)}
                    className="min-h-[42px] px-5 rounded-xl aurora-btn-primary text-xs font-semibold font-mono cursor-pointer tactile-press flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>Grade & Mint</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export const AdminConsolePage: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useAppStore()

  // Primary navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'pos' | 'coupons' | 'enrollments' | 'users' | 'certificates' | 'trainers' | 'payouts' | 'payments' | 'ai_sync'
  >('overview')

  // Global & tab-specific states
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // POS System State
  const [posForm, setPosForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    course_id: 1,
    amount_paid: 2500,
    payment_method: 'Cash',
    notes: 'Counter Walk-in Admission',
  })
  const [submittingPos, setSubmittingPos] = useState(false)
  const [posReceipt, setPosReceipt] = useState<any>(null)

  // Coupons State
  const [coupons, setCoupons] = useState<any[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [couponForm, setCouponForm] = useState({ code: '', discount_percentage: 20, max_uses: 100 })
  const [submittingCoupon, setSubmittingCoupon] = useState(false)

  // Enrollments State
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loadingEnrollments, setLoadingEnrollments] = useState(false)
  const [enrollSearch, setEnrollSearch] = useState('')
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [enrollForm, setEnrollForm] = useState({ user_identifier: '', course_id: 1 })
  const [submittingEnroll, setSubmittingEnroll] = useState(false)

  // ID & Users State
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'students' | 'trainers' | 'staff'>('all')

  // Certificates State
  const [certificates, setCertificates] = useState<any[]>([])
  const [loadingCertificates, setLoadingCertificates] = useState(false)
  const [certSearch, setCertSearch] = useState('')
  const [isCertModalOpen, setIsCertModalOpen] = useState(false)
  const [certForm, setCertForm] = useState({ user_identifier: '', course_id: 1, student_name: '', grade_score: 95 })
  const [submittingCert, setSubmittingCert] = useState(false)

  // Trainers State
  const [trainers, setTrainers] = useState<any[]>([])
  const [loadingTrainers, setLoadingTrainers] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assignForm, setAssignForm] = useState({ course_id: 1, trainer_id: 1 })
  const [submittingAssign, setSubmittingAssign] = useState(false)

  // Trainer Payouts State
  const [payoutsData, setPayoutsData] = useState<any>({ summary: {}, trainers_ledger: [], payout_history: [] })
  const [loadingPayouts, setLoadingPayouts] = useState(false)
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)
  const [payoutForm, setPayoutForm] = useState({
    trainer_id: 1,
    amount: 5000,
    method: 'bKash',
    account_number: '',
    transaction_ref: '',
    notes: 'Monthly batch revenue disbursement',
  })
  const [submittingPayout, setSubmittingPayout] = useState(false)

  // AI & Sync State
  const [aiTopic, setAiTopic] = useState('')
  const [aiLang, setAiLang] = useState<'bn' | 'en'>('bn')
  const [generatingAi, setGeneratingAi] = useState(false)
  const [syncingLegacy, setSyncingLegacy] = useState(false)

  // Load Primary Overview
  const loadAdmin = async () => {
    try {
      const res = await apiFetch('/admin/overview')
      setData(res)
    } catch (err: any) {
      showToast(err.message || 'Failed to authenticate admin.', 'error')
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  // Load Enrollments Tab
  const loadEnrollments = async () => {
    setLoadingEnrollments(true)
    try {
      const res = await apiFetch('/admin/enrollments')
      setEnrollments(res)
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setLoadingEnrollments(false)
    }
  }

  // Load Certificates Tab
  const loadCertificates = async () => {
    setLoadingCertificates(true)
    try {
      const res = await apiFetch('/admin/certificates')
      setCertificates(res)
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setLoadingCertificates(false)
    }
  }

  // Load Trainers Tab
  const loadTrainers = async () => {
    setLoadingTrainers(true)
    try {
      const res = await apiFetch('/admin/trainers')
      setTrainers(res)
      if (res.length > 0 && !assignForm.trainer_id) {
        setAssignForm((prev) => ({ ...prev, trainer_id: res[0].id }))
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setLoadingTrainers(false)
    }
  }

  // Load Payouts Tab
  const loadPayouts = async () => {
    setLoadingPayouts(true)
    try {
      const res = await apiFetch('/admin/trainer-payouts')
      setPayoutsData(res)
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setLoadingPayouts(false)
    }
  }

  // Load Coupons Tab
  const loadCoupons = async () => {
    setLoadingCoupons(true)
    try {
      const res = await apiFetch('/admin/coupons')
      setCoupons(res)
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setLoadingCoupons(false)
    }
  }

  useEffect(() => {
    loadAdmin()
  }, [])

  // Lazy tab loaders
  useEffect(() => {
    if (activeTab === 'enrollments') loadEnrollments()
    else if (activeTab === 'certificates') loadCertificates()
    else if (activeTab === 'trainers') loadTrainers()
    else if (activeTab === 'payouts') loadPayouts()
    else if (activeTab === 'coupons') loadCoupons()
  }, [activeTab])

  // --- Handlers ---
  const handlePosCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingPos(true)
    try {
      const res = await apiFetch('/admin/pos/checkout', {
        method: 'POST',
        body: JSON.stringify(posForm),
      })
      setPosReceipt(res.receipt)
      showToast('POS Admission Completed! Receipt Generated.', 'success')
      loadAdmin()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmittingPos(false)
    }
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingCoupon(true)
    try {
      await apiFetch('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(couponForm),
      })
      showToast('Coupon created successfully!', 'success')
      setCouponForm({ code: '', discount_percentage: 20, max_uses: 100 })
      loadCoupons()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmittingCoupon(false)
    }
  }

  const handleDeleteCoupon = async (couponId: number) => {
    try {
      await apiFetch(`/admin/coupons/${couponId}`, { method: 'DELETE' })
      showToast('Coupon deactivated', 'info')
      loadCoupons()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleVerifyPayment = async (paymentId: number, action: 'Approve' | 'Reject') => {
    try {
      await apiFetch(`/admin/payments/${paymentId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      })
      showToast(`Payment #${paymentId} ${action}d successfully!`, 'success')
      loadAdmin()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleVerifyStoreOrder = async (orderId: number, action: 'Approve' | 'Reject') => {
    try {
      await apiFetch(`/admin/store-orders/${orderId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      })
      showToast(`Store order #${orderId} ${action}d!`, 'success')
      loadAdmin()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enrollForm.user_identifier.trim()) {
      showToast('Please provide a student email or ID.', 'error')
      return
    }
    setSubmittingEnroll(true)
    try {
      await apiFetch('/admin/enrollments/manual', {
        method: 'POST',
        body: JSON.stringify(enrollForm),
      })
      showToast('Student successfully enrolled into course track!', 'success')
      setIsEnrollModalOpen(false)
      setEnrollForm({ user_identifier: '', course_id: data?.course_enrollment_breakdown?.[0]?.id || 1 })
      loadEnrollments()
      loadAdmin()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmittingEnroll(false)
    }
  }

  const handleRevokeEnrollment = async (enrollmentId: number, studentName: string) => {
    if (!window.confirm(`Are you sure you want to revoke enrollment for ${studentName}?`)) return
    try {
      await apiFetch(`/admin/enrollments/${enrollmentId}`, { method: 'DELETE' })
      showToast('Enrollment successfully revoked.', 'success')
      loadEnrollments()
      loadAdmin()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await apiFetch(`/admin/users/${userId}/status`, {
        method: 'POST',
        body: JSON.stringify({ is_active: !currentStatus }),
      })
      showToast(`User account ${!currentStatus ? 'Activated' : 'Suspended'}.`, 'success')
      loadAdmin()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleToggleUserRole = async (userId: number, isStaff: boolean, isTrainer: boolean) => {
    try {
      await apiFetch(`/admin/users/${userId}/role`, {
        method: 'POST',
        body: JSON.stringify({ is_staff: isStaff, is_trainer: isTrainer }),
      })
      showToast('User administrative permissions updated.', 'success')
      loadAdmin()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!certForm.user_identifier.trim()) {
      showToast('Provide user ID or email.', 'error')
      return
    }
    setSubmittingCert(true)
    try {
      const res = await apiFetch('/admin/certificates/issue', {
        method: 'POST',
        body: JSON.stringify(certForm),
      })
      showToast(`Certificate ${res.certificate_id} issued for ${res.student_name}!`, 'success')
      setIsCertModalOpen(false)
      setCertForm({ user_identifier: '', course_id: 1, student_name: '', grade_score: 95 })
      loadCertificates()
      loadAdmin()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmittingCert(false)
    }
  }

  const handleRevokeCertificate = async (certId: string) => {
    if (!window.confirm(`Revoke certificate ID ${certId}? This action cannot be undone.`)) return
    try {
      await apiFetch(`/admin/certificates/${certId}`, { method: 'DELETE' })
      showToast(`Certificate ${certId} revoked from registry.`, 'success')
      loadCertificates()
      loadAdmin()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleAssignTrainer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingAssign(true)
    try {
      await apiFetch(`/admin/courses/${assignForm.course_id}/assign-trainer`, {
        method: 'POST',
        body: JSON.stringify({ trainer_id: assignForm.trainer_id }),
      })
      showToast('Course assigned to trainer successfully!', 'success')
      setIsAssignModalOpen(false)
      loadTrainers()
      loadAdmin()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmittingAssign(false)
    }
  }

  const handleRecordPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (payoutForm.amount <= 0) {
      showToast('Amount must be greater than 0.', 'error')
      return
    }
    setSubmittingPayout(true)
    try {
      await apiFetch('/admin/trainer-payouts/record', {
        method: 'POST',
        body: JSON.stringify(payoutForm),
      })
      showToast(`Payout of ৳${payoutForm.amount.toLocaleString()} recorded and notified!`, 'success')
      setIsPayoutModalOpen(false)
      loadPayouts()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmittingPayout(false)
    }
  }

  const handleGenerateAiBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiTopic.trim()) return
    setGeneratingAi(true)
    try {
      const res = await apiFetch('/admin/ai-blog/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: aiTopic,
          language: aiLang,
          tone: 'Educational & Practical',
          category: 'Architecture',
          publish_immediately: true,
        }),
      })
      showToast(`AI Article Published: ${res.title}`, 'success')
      setAiTopic('')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setGeneratingAi(false)
    }
  }

  const handleLegacySync = async () => {
    setSyncingLegacy(true)
    try {
      const res = await apiFetch('/admin/legacy-sync', { method: 'POST' })
      showToast(
        res.found_legacy_db
          ? `Synced Legacy DB: +${res.imported_courses} Courses, +${res.imported_faqs} FAQs!`
          : 'Legacy db.sqlite3 not found at configured path.',
        'success'
      )
      loadAdmin()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSyncingLegacy(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-6">
        <div className="h-10 w-64 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/70 dark:bg-slate-900/70 animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-3xl bg-slate-200/50 dark:bg-slate-900/50 animate-pulse" />
      </div>
    )
  }

  // Filtered lists
  const filteredEnrollments = enrollments.filter(
    (e) =>
      e.student_name?.toLowerCase().includes(enrollSearch.toLowerCase()) ||
      e.student_email?.toLowerCase().includes(enrollSearch.toLowerCase()) ||
      e.course_title?.toLowerCase().includes(enrollSearch.toLowerCase())
  )

  const filteredUsers = data.users.filter((u: any) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      String(u.id).includes(userSearch)
    if (!matchesSearch) return false
    if (userRoleFilter === 'students') return !u.is_trainer && !u.is_staff
    if (userRoleFilter === 'trainers') return u.is_trainer
    if (userRoleFilter === 'staff') return u.is_staff
    return true
  })

  const filteredCerts = certificates.filter(
    (c) =>
      c.certificate_id?.toLowerCase().includes(certSearch.toLowerCase()) ||
      c.student_name?.toLowerCase().includes(certSearch.toLowerCase()) ||
      c.course_name?.toLowerCase().includes(certSearch.toLowerCase())
  )

  type AdminTabId = 'overview' | 'pos' | 'coupons' | 'enrollments' | 'users' | 'certificates' | 'trainers' | 'payouts' | 'payments' | 'ai_sync'

  interface AdminTabItem {
    id: AdminTabId
    label: string
    icon: any
    badge?: number | string
  }

  const tabs: AdminTabItem[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'pos', label: 'POS Counter', icon: ShoppingBag },
    { id: 'coupons', label: 'Coupons', icon: Tag, badge: coupons.length || undefined },
    { id: 'enrollments', label: 'Enrollments', icon: GraduationCap, badge: enrollments.length || undefined },
    { id: 'users', label: 'User ID Registry', icon: Users, badge: data.kpis.total_users },
    { id: 'certificates', label: 'Certificates', icon: Award, badge: data.kpis.issued_certificates },
    { id: 'trainers', label: 'Trainer Studio', icon: BookOpen },
    { id: 'payouts', label: 'Trainer Payouts', icon: Wallet },
    { id: 'payments', label: 'MFS Approvals', icon: CreditCard, badge: data.kpis.pending_verifications || undefined },
    { id: 'ai_sync', label: 'AI & Sync', icon: Sparkles },
  ]

  return (
    <div className="relative min-h-screen w-full min-w-0 overflow-x-clip">
      {/* Lightweight GPU-friendly ambient background (no heavy 64px Gaussian blur convolution on mobile) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="hidden sm:block absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/10 via-sky-500/5 to-transparent rounded-full blur-2xl" />
        <div className="hidden sm:block absolute top-1/3 right-10 w-[350px] h-[350px] bg-gradient-to-bl from-amber-500/10 via-purple-500/5 to-transparent rounded-full blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-5 sm:space-y-8 w-full min-w-0">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-4 border-b border-[#E2E8F2] dark:border-slate-800 w-full min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Administration Console
              </span>
              <span className="text-xs font-mono text-slate-400">Zero-Trust v2.0</span>
            </div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-[#14213A] dark:text-[#F5F8FF] mt-1 tracking-tight">
              Academy Operations & Management
            </h1>
          </div>

          {/* Quick Global Action Pill */}
          <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain no-scrollbar py-1 w-full sm:w-auto max-w-full min-w-0">
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(true)}
              className="min-h-[40px] px-4 rounded-xl aurora-btn-primary text-xs font-semibold font-mono flex items-center gap-1.5 shadow-sm whitespace-nowrap tactile-press cursor-pointer shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enroll Student</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCertModalOpen(true)}
              className="min-h-[40px] px-3.5 rounded-xl aurora-pill-teal border text-xs font-bold font-mono flex items-center gap-1.5 whitespace-nowrap tactile-press cursor-pointer shrink-0"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Mint Cert</span>
            </button>
            <button
              type="button"
              onClick={handleLegacySync}
              disabled={syncingLegacy}
              className="min-h-[40px] px-3.5 rounded-xl aurora-btn-secondary text-xs font-mono font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
            >
              <Database className="w-3.5 h-3.5 text-[#356DFF] dark:text-[#35C6BE]" />
              <span>{syncingLegacy ? 'Syncing...' : 'Sync v1'}</span>
            </button>
          </div>
        </div>

        {/* Mobile-Optimized Sticky Segmented Tab Strip */}
        <div className="sticky top-14 sm:top-16 z-30 bg-white/95 dark:bg-[#060B18]/95 backdrop-blur-md py-2 border-b border-[#E2E8F2] dark:border-slate-800 w-full max-w-full overflow-hidden">
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain no-scrollbar py-0.5">
            <div className="inline-flex items-center gap-1.5 p-1 bg-[#F5F7FB] dark:bg-[#0C1528] rounded-2xl border border-[#E2E8F2] dark:border-slate-800 whitespace-nowrap">
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
                        : 'text-[#5D6B82] dark:text-[#A8B7CE] hover:text-[#14213A] dark:hover:text-[#F5F8FF] hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#5D6B82] dark:text-[#A8B7CE]'}`} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-[#14213A] dark:text-[#F5F8FF]'
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
        </div>

        {/* ----------------- TAB 1: OVERVIEW ----------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Actionable Priority Item: Pending Approvals Banner */}
            {data.kpis.pending_verifications > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900 dark:text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm sm:text-base">
                      {data.kpis.pending_verifications} MFS Payment Submissions Pending Review
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Learners are waiting for payment verification to access their course materials.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className="min-h-[42px] px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 tactile-press cursor-pointer shrink-0"
                >
                  <span>Review Submissions</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 6 Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {[
                { label: 'Total Revenue', value: `৳${data.kpis.total_revenue_bdt.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', glow: 'from-emerald-500/10' },
                { label: 'Active Learners', value: data.kpis.total_users, icon: Users, color: 'text-sky-500', glow: 'from-sky-500/10' },
                { label: 'Live Tracks', value: data.kpis.active_courses, icon: BookOpen, color: 'text-indigo-500', glow: 'from-indigo-500/10' },
                { label: 'Pending Approvals', value: data.kpis.pending_verifications, icon: CheckCircle2, color: 'text-amber-500', glow: 'from-amber-500/10' },
                { label: 'Minted Certs', value: data.kpis.issued_certificates, icon: Award, color: 'text-purple-500', glow: 'from-purple-500/10' },
                { label: 'Security Audit', value: '6/6 Verified', icon: ShieldCheck, color: 'text-emerald-500', glow: 'from-teal-500/10' },
              ].map((kpi, idx) => {
                const Icon = kpi.icon
                return (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-5 rounded-2xl border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#0C1528] relative overflow-hidden shadow-xs min-w-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-[11px] font-mono text-[#5D6B82] dark:text-[#A8B7CE] uppercase tracking-wider truncate">{kpi.label}</span>
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${kpi.color} shrink-0`} />
                    </div>
                    <div className="font-display font-black text-lg sm:text-2xl text-[#14213A] dark:text-[#F5F8FF] mt-1.5 sm:mt-2 truncate">
                      {kpi.value}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick Action Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Fast Action Hub & Top Course Breakdown */}
              <div className="lg:col-span-7 space-y-6">
                <div className="p-5 sm:p-6 rounded-2xl border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#0C1528] space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display font-bold text-lg text-[#14213A] dark:text-[#F5F8FF]">
                        Management Command Shortcuts
                      </h2>
                      <p className="text-xs text-[#5D6B82] dark:text-[#A8B7CE] mt-0.5">
                        Perform routine administrative operations with 1-click workflows.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('enrollments')
                        setIsEnrollModalOpen(true)
                      }}
                      className="p-4 rounded-xl border border-[#356DFF]/30 bg-[#356DFF]/10 hover:bg-[#356DFF]/20 text-left transition-all cursor-pointer tactile-press space-y-1.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#356DFF]/20 text-[#356DFF] flex items-center justify-center font-bold">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div className="font-semibold text-sm text-[#14213A] dark:text-[#F5F8FF]">Enroll Student</div>
                      <div className="text-[11px] text-[#5D6B82] dark:text-[#A8B7CE] leading-tight">Add learner directly to any track</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('certificates')
                        setIsCertModalOpen(true)
                      }}
                      className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-left transition-all cursor-pointer tactile-press space-y-1.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="font-semibold text-sm text-[#14213A] dark:text-[#F5F8FF]">Mint Certificate</div>
                      <div className="text-[11px] text-[#5D6B82] dark:text-[#A8B7CE] leading-tight">Generate verified QR certificate</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('payouts')
                        setIsPayoutModalOpen(true)
                      }}
                      className="p-4 rounded-xl border border-[#35C6BE]/30 bg-[#35C6BE]/10 hover:bg-[#35C6BE]/20 text-left transition-all cursor-pointer tactile-press space-y-1.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#35C6BE]/20 text-[#35C6BE] flex items-center justify-center font-bold">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div className="font-semibold text-sm text-[#14213A] dark:text-[#F5F8FF]">Disburse Payout</div>
                      <div className="text-[11px] text-[#5D6B82] dark:text-[#A8B7CE] leading-tight">Record trainer commission transfer</div>
                    </button>
                  </div>
                </div>

                {/* Course Track Enrollment Breakdown */}
                <div className="p-5 sm:p-6 rounded-2xl border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#0C1528] space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-[#14213A] dark:text-[#F5F8FF] flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#356DFF]" />
                      <span>Active Course Enrollment Capacity</span>
                    </h3>
                    <span className="text-xs font-mono text-[#5D6B82] dark:text-[#A8B7CE]">Real-time</span>
                  </div>

                  <div className="space-y-3">
                    {data.course_enrollment_breakdown?.map((c: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 sm:p-4 rounded-xl border border-[#E2E8F2] dark:border-slate-800 bg-[#F5F7FB] dark:bg-[#111F36]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 text-xs min-w-0"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="font-semibold text-sm text-[#14213A] dark:text-[#F5F8FF] break-words leading-snug">
                            {c.title}
                          </div>
                          <div className="flex items-center gap-2 text-[#5D6B82] dark:text-[#A8B7CE] font-mono text-[11px]">
                            <span>Price: ৳{c.price?.toLocaleString()}</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active Curriculum</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:text-right shrink-0 pt-1 sm:pt-0 border-t sm:border-0 border-[#E2E8F2] dark:border-slate-800">
                          <div>
                            <span className="font-mono font-bold text-[#356DFF] dark:text-[#35C6BE] text-sm">{c.students} Learners</span>
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                              ৳{(c.students * c.price).toLocaleString()} gross
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Security Defense & Verification Checklist */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-5 sm:p-6 rounded-2xl border border-emerald-500/30 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span>Security Controls Audit</span>
                      </h2>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Automated inspection of HTTP security headers, CORS origin lockdown, and Argon2id hash policies.
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono text-xs font-bold shrink-0">
                      6/6 Verified
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {data.security_and_seo_audit.checks.map((chk: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                          <span>{chk.name}</span>
                          <span className="text-emerald-500 font-mono text-[11px] font-bold">{chk.status}</span>
                        </div>
                        <div className="text-slate-500 mt-0.5 leading-snug">{chk.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Revenue Trend pill */}
                <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md space-y-3">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Monthly Trajectory</span>
                    <span className="text-xs font-mono text-emerald-500">+28% MoM</span>
                  </h3>
                  <div className="grid grid-cols-6 gap-1.5 pt-2">
                    {data.revenue_trend?.map((m: any, idx: number) => (
                      <div key={idx} className="text-center space-y-1">
                        <div className="h-16 w-full rounded bg-slate-100 dark:bg-slate-800 flex items-end justify-center p-1">
                          <div
                            className="w-full bg-sky-500 rounded-sm"
                            style={{ height: `${Math.min(100, (m.revenue / 140000) * 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">{m.month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: POS (POINT OF SALE) ----------------- */}
        {activeTab === 'pos' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display font-bold text-xl text-[#14213A] dark:text-[#F5F8FF] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#356DFF]" />
                <span>TrainingPundit Point of Sale (POS) — Counter Admission Desk</span>
              </h2>
              <p className="text-xs text-[#5D6B82] dark:text-[#A8B7CE] mt-0.5">
                Fast walk-in student enrollment, cash/MFS payment ledger verification, and instant official receipt generation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Admission Registration Form */}
              <div className="lg:col-span-7 aurora-card-raised rounded-3xl p-6 border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#0C1528] shadow-md space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F2] dark:border-slate-800">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#356DFF] dark:text-[#35C6BE]">
                    Walk-in Admission Terminal
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold aurora-pill-teal">
                    ACTIVE DESK
                  </span>
                </div>

                <form onSubmit={handlePosCheckout} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#14213A] dark:text-[#F5F8FF] mb-1">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={posForm.full_name}
                        onChange={(e) => setPosForm({ ...posForm, full_name: e.target.value })}
                        placeholder="e.g. Tanvir Ahmed"
                        className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-700 text-xs text-[#14213A] dark:text-[#F5F8FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#14213A] dark:text-[#F5F8FF] mb-1">
                        Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={posForm.phone_number}
                        onChange={(e) => setPosForm({ ...posForm, phone_number: e.target.value })}
                        placeholder="017XXXXXXXX"
                        className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-700 text-xs text-[#14213A] dark:text-[#F5F8FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#14213A] dark:text-[#F5F8FF] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={posForm.email}
                      onChange={(e) => setPosForm({ ...posForm, email: e.target.value })}
                      placeholder="student@example.com"
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-700 text-xs text-[#14213A] dark:text-[#F5F8FF]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#14213A] dark:text-[#F5F8FF] mb-1">
                        Enrolled Course Track *
                      </label>
                      <select
                        value={posForm.course_id}
                        onChange={(e) => {
                          const cId = Number(e.target.value)
                          const found = data.courses?.find((c: any) => c.id === cId)
                          setPosForm({
                            ...posForm,
                            course_id: cId,
                            amount_paid: found ? found.price : posForm.amount_paid,
                          })
                        }}
                        className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-700 text-xs text-[#14213A] dark:text-[#F5F8FF]"
                      >
                        {data.courses?.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.title} (৳{c.price})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14213A] dark:text-[#F5F8FF] mb-1">
                        Amount Paid (BDT) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={posForm.amount_paid}
                        onChange={(e) => setPosForm({ ...posForm, amount_paid: Number(e.target.value) })}
                        className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-700 text-xs font-mono font-bold text-[#14213A] dark:text-[#F5F8FF]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#14213A] dark:text-[#F5F8FF] mb-1">
                        Payment Method *
                      </label>
                      <select
                        value={posForm.payment_method}
                        onChange={(e) => setPosForm({ ...posForm, payment_method: e.target.value })}
                        className="w-full min-h-[44px] px-3 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-700 text-xs text-[#14213A] dark:text-[#F5F8FF]"
                      >
                        <option value="Cash">Cash (Counter)</option>
                        <option value="bKash">bKash (Merchant)</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Card">POS Credit/Debit Card</option>
                        <option value="Bank">Bank Deposit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14213A] dark:text-[#F5F8FF] mb-1">
                        Counter Notes
                      </label>
                      <input
                        type="text"
                        value={posForm.notes}
                        onChange={(e) => setPosForm({ ...posForm, notes: e.target.value })}
                        placeholder="e.g. Walk-in admission"
                        className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-700 text-xs text-[#14213A] dark:text-[#F5F8FF]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingPos}
                    className="w-full min-h-[48px] rounded-xl aurora-btn-primary font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg tactile-press"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>{submittingPos ? 'Processing Admission...' : 'Register & Issue Official POS Receipt'}</span>
                  </button>
                </form>
              </div>

              {/* Receipt Preview & Terminal Status */}
              <div className="lg:col-span-5 space-y-6">
                {posReceipt ? (
                  <div className="aurora-card-raised rounded-3xl p-6 border-2 border-[#35C6BE]/40 bg-white dark:bg-[#0C1528] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F2] dark:border-slate-800">
                      <div>
                        <div className="font-display font-extrabold text-sm text-[#14213A] dark:text-[#F5F8FF]">
                          TRAININGPUNDIT ACADEMY
                        </div>
                        <div className="text-[10px] font-mono text-[#35C6BE]">OFFICIAL ADMISSION RECEIPT</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold aurora-pill-teal">
                        PAID & ENROLLED
                      </span>
                    </div>

                    <div className="space-y-2 font-mono text-xs text-[#14213A] dark:text-[#F5F8FF] bg-[#F5F7FB] dark:bg-[#111F36] p-4 rounded-2xl">
                      <div>Receipt No: <span className="font-bold text-[#356DFF]">{posReceipt.invoice_number}</span></div>
                      <div>Student: <span className="font-bold">{posReceipt.student_name}</span></div>
                      <div>Course: <span className="font-bold">{posReceipt.course_title}</span></div>
                      <div>Amount: <span className="font-bold text-[#35C6BE]">৳{posReceipt.amount} BDT</span></div>
                      <div>Method: <span>{posReceipt.payment_method}</span></div>
                      <div>Date: <span>{posReceipt.issued_at}</span></div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex-1 min-h-[42px] rounded-xl aurora-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer tactile-press shadow-md"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Receipt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosReceipt(null)}
                        className="min-h-[42px] px-4 rounded-xl aurora-btn-secondary text-xs font-bold cursor-pointer"
                      >
                        Next Student
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="aurora-card-raised rounded-3xl p-6 border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#0C1528] shadow-md space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#356DFF] dark:text-[#35C6BE]">
                      <Receipt className="w-4 h-4" />
                      <span>POS COUNTER SPECS</span>
                    </div>
                    <p className="text-xs text-[#5D6B82] dark:text-[#A8B7CE] leading-relaxed">
                      The Point of Sale (POS) system handles walk-in candidates without requiring them to complete online self-checkout. Submitting the form:
                    </p>
                    <ul className="text-xs text-[#5D6B82] dark:text-[#A8B7CE] space-y-1.5 list-disc list-inside">
                      <li>Creates a zero-trust student account (if not already existing)</li>
                      <li>Records an <strong className="text-emerald-500">Approved</strong> payment in the financial ledger</li>
                      <li>Instantly grants course enrollment with lifetime access</li>
                      <li>Generates a printable POS admission invoice receipt</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: COUPONS ENGINE ----------------- */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display font-bold text-xl text-[#14213A] dark:text-[#F5F8FF] flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                <span>Promotional & Discount Coupons Engine</span>
              </h2>
              <p className="text-xs text-[#5D6B82] dark:text-[#A8B7CE] mt-0.5">
                Generate and monitor discount vouchers for marketing campaigns and special seasonal promotions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Create Coupon Form */}
              <div className="lg:col-span-5 aurora-card-raised rounded-3xl p-6 border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#0C1528] shadow-md space-y-4">
                <h3 className="font-display font-bold text-base text-[#14213A] dark:text-[#F5F8FF] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#356DFF]" />
                  <span>Create New Discount Coupon</span>
                </h3>

                <form onSubmit={handleCreateCoupon} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#14213A] dark:text-[#F5F8FF] mb-1">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. PUNDIT2026"
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-700 font-mono text-xs font-bold uppercase text-[#14213A] dark:text-[#F5F8FF]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#14213A] dark:text-[#F5F8FF] mb-1">
                        Discount % *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={couponForm.discount_percentage}
                        onChange={(e) => setCouponForm({ ...couponForm, discount_percentage: Number(e.target.value) })}
                        className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-700 font-mono text-xs font-bold text-[#14213A] dark:text-[#F5F8FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#14213A] dark:text-[#F5F8FF] mb-1">
                        Max Uses *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={couponForm.max_uses}
                        onChange={(e) => setCouponForm({ ...couponForm, max_uses: Number(e.target.value) })}
                        className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-700 font-mono text-xs text-[#14213A] dark:text-[#F5F8FF]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingCoupon}
                    className="w-full min-h-[44px] rounded-xl aurora-btn-primary font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md tactile-press"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{submittingCoupon ? 'Creating...' : 'Activate Coupon'}</span>
                  </button>
                </form>
              </div>

              {/* Coupons List */}
              <div className="lg:col-span-7 aurora-card-raised rounded-3xl p-6 border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#0C1528] shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-[#14213A] dark:text-[#F5F8FF]">
                    Active Coupons ({coupons.length})
                  </h3>
                  <button
                    type="button"
                    onClick={loadCoupons}
                    className="text-xs text-[#356DFF] dark:text-[#35C6BE] hover:underline font-bold"
                  >
                    Refresh
                  </button>
                </div>

                {loadingCoupons ? (
                  <div className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
                ) : (
                  <div className="space-y-3">
                    {coupons.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded-2xl border border-[#E2E8F2] dark:border-slate-800 bg-[#F5F7FB] dark:bg-[#111F36] flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-sm text-[#356DFF] dark:text-[#35C6BE]">
                              {c.code}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-500">
                              {c.discount_percentage}% OFF
                            </span>
                          </div>
                          <div className="text-xs text-[#5D6B82] dark:text-[#A8B7CE] font-mono">
                            Used: {c.times_used} / {c.max_uses}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c.id)}
                          className="min-h-[36px] px-3 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold cursor-pointer transition-all"
                        >
                          Deactivate
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 2: ENROLLMENTS ----------------- */}
        {activeTab === 'enrollments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-sky-500" /> Student Enrollment Management
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  View, manually enroll, or revoke student access to academy courses and live batches.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadEnrollments}
                  className="min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingEnrollments ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(true)}
                  className="min-h-[42px] px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 tactile-press cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Manual Enroll</span>
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={enrollSearch}
                onChange={(e) => setEnrollSearch(e.target.value)}
                placeholder="Search enrollments by student name, email, or course..."
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Mobile Card Layout (visible on mobile, hidden on md+) */}
            <div className="md:hidden space-y-3">
              {loadingEnrollments ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading student enrollments...</div>
              ) : filteredEnrollments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                  No enrollments found matching search.
                </div>
              ) : (
                filteredEnrollments.map((en) => (
                  <div
                    key={en.id}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md space-y-3 min-w-0"
                  >
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{en.student_name}</div>
                        <div className="text-xs text-slate-500 font-mono truncate">{en.student_email}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/15 text-sky-500 font-bold shrink-0">
                        ID: #{en.user_id}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 space-y-1">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {en.course_title}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Progress: {Math.round(en.progress)}%</span>
                        <span>{new Date(en.enrolled_at).toLocaleDateString()}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${en.progress}%` }} />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleRevokeEnrollment(en.id, en.student_name)}
                        className="min-h-[38px] px-3.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Revoke Access</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-500 font-mono">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Course Track</th>
                    <th className="p-4">Progress</th>
                    <th className="p-4">Enrolled At</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {loadingEnrollments ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">
                        Loading student enrollment records...
                      </td>
                    </tr>
                  ) : filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">
                        No enrollment records found.
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map((en) => (
                      <tr key={en.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white">{en.student_name}</div>
                          <div className="text-slate-500 font-mono text-[11px]">{en.student_email}</div>
                        </td>
                        <td className="p-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                          {en.course_title}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${en.progress}%` }} />
                            </div>
                            <span className="font-mono text-[11px]">{Math.round(en.progress)}%</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-slate-500">
                          {new Date(en.enrolled_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRevokeEnrollment(en.id, en.student_name)}
                            className="min-h-[34px] px-3 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-semibold cursor-pointer"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------- TAB 3: USERS & ID MANAGEMENT ----------------- */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-500" /> User & ID Identity Management
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect user accounts, manage suspension status, and grant Trainer or Staff privileges.
                </p>
              </div>

              {/* Role filter buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto overscroll-x-contain no-scrollbar w-full sm:w-auto max-w-full">
                {(['all', 'students', 'trainers', 'staff'] as const).map((rf) => (
                  <button
                    key={rf}
                    type="button"
                    onClick={() => setUserRoleFilter(rf)}
                    className={`min-h-[34px] px-3 rounded-lg text-xs font-mono font-semibold capitalize cursor-pointer transition-all shrink-0 ${
                      userRoleFilter === rf
                        ? 'bg-white dark:bg-slate-800 text-sky-500 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {rf}
                  </button>
                ))}
              </div>
            </div>

            {/* User Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by ID (e.g. 1), student name, or email..."
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* User Grid with Official Identity Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((u: any) => (
                <div
                  key={u.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-4 min-w-0 ${
                    u.is_active === false
                      ? 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/10'
                      : 'border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center font-display font-bold text-sky-500 shrink-0">
                        {u.full_name?.charAt(0) || u.email?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 min-w-0">
                          <span className="truncate">{u.full_name}</span>
                          {u.is_active === false && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-500/20 text-rose-500 font-bold shrink-0">
                              SUSPENDED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono truncate">{u.email}</div>
                      </div>
                    </div>

                    <div className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                      ID: #{String(u.id).padStart(3, '0')}
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono">
                    <span className="text-slate-500">Streak: {u.streak}d</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-slate-500">Joined: {new Date(u.date_joined).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {u.is_staff && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 font-mono text-[10px] font-bold">
                        STAFF ADMIN
                      </span>
                    )}
                    {u.is_trainer && (
                      <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-500 font-mono text-[10px] font-bold">
                        TRAINER / MENTOR
                      </span>
                    )}
                    {!u.is_staff && !u.is_trainer && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px]">
                        STUDENT
                      </span>
                    )}
                  </div>

                  {/* Touch Action Controls */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleUserStatus(u.id, u.is_active !== false)}
                      className={`min-h-[40px] flex-1 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        u.is_active === false
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
                          : 'border border-rose-500/30 text-rose-500 hover:bg-rose-500/10'
                      }`}
                    >
                      {u.is_active === false ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{u.is_active === false ? 'Activate' : 'Suspend'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleUserRole(u.id, u.is_staff, !u.is_trainer)}
                      className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer ${
                        u.is_trainer
                          ? 'border-sky-500/40 bg-sky-500/10 text-sky-500'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{u.is_trainer ? 'Revoke Trainer' : 'Make Trainer'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- TAB 4: CERTIFICATES ----------------- */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" /> Certificate Registry & Minting
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect cryptographic graduation certificates, mint certificates manually, or revoke credentials.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadCertificates}
                  className="min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCertificates ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(true)}
                  className="min-h-[42px] px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs font-mono flex items-center gap-2 tactile-press cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>+ Mint Certificate</span>
                </button>
              </div>
            </div>

            {/* Certificate Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                placeholder="Search by Cert ID (LWMA-...), student name, or course..."
                className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Certificates List / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingCertificates ? (
                <div className="col-span-full p-8 text-center text-xs text-slate-500">
                  Loading certificate registry...
                </div>
              ) : filteredCerts.length === 0 ? (
                <div className="col-span-full p-8 text-center text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                  No certificates match your query.
                </div>
              ) : (
                filteredCerts.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 sm:p-5 rounded-2xl border border-purple-500/25 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md space-y-4 min-w-0"
                  >
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-purple-600 dark:text-purple-400 min-w-0">
                          <span className="truncate">{cert.certificate_id}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(cert.certificate_id)
                              showToast(`Copied ${cert.certificate_id}`, 'success')
                            }}
                            className="p-1 hover:text-slate-900 dark:hover:text-white shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="font-display font-bold text-base text-slate-900 dark:text-white truncate">
                          {cert.student_name}
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shrink-0">
                        {cert.grade_score}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1 text-xs">
                      <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{cert.course_name}</div>
                      <div className="text-slate-500 text-[11px]">Instructor: {cert.instructor_name}</div>
                      <div className="text-slate-400 text-[10px] font-mono">
                        Issued: {new Date(cert.issued_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <a
                        href={`/verify-certificate?id=${cert.certificate_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-[38px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Public View</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleRevokeCertificate(cert.certificate_id)}
                        className="min-h-[38px] px-3 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ----------------- TAB 5: TRAINERS & MENTORS ----------------- */}
        {activeTab === 'trainers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" /> Trainer & Mentor Studio Management
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage certified instructors, course assignments, and inspect their active mentorship metrics.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadTrainers}
                  className="min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTrainers ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(true)}
                  className="min-h-[42px] px-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs font-mono flex items-center gap-2 tactile-press cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Course Track</span>
                </button>
              </div>
            </div>

            {/* Trainers Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingTrainers ? (
                <div className="col-span-full p-8 text-center text-xs text-slate-500">Loading trainers...</div>
              ) : trainers.length === 0 ? (
                <div className="col-span-full p-8 text-center text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                  No active trainers found. Make a user a Mentor from the User Registry tab!
                </div>
              ) : (
                trainers.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md space-y-4 min-w-0"
                  >
                    <div className="flex items-start justify-between gap-3 min-w-0">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-base text-slate-900 dark:text-white truncate">{t.full_name}</div>
                        <div className="text-xs text-slate-500 font-mono truncate">{t.email}</div>
                        <div className="text-[11px] text-sky-500 mt-0.5 truncate">{t.occupation}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 shrink-0">
                        {t.courses_count} Tracks
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                        <div className="text-[11px] text-slate-500 font-mono">Students</div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                          {t.total_students}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                        <div className="text-[11px] text-slate-500 font-mono">70% Share</div>
                        <div className="font-bold text-sm text-emerald-500 mt-0.5">
                          ৳{t.rev_share_bdt.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Assigned Courses Badges */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-slate-400">Assigned Courses:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {t.assigned_courses?.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No courses assigned yet</span>
                        ) : (
                          t.assigned_courses?.map((c: any) => (
                            <span
                              key={c.id}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                            >
                              {c.title}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setAssignForm((prev) => ({ ...prev, trainer_id: t.id }))
                          setIsAssignModalOpen(true)
                        }}
                        className="min-h-[38px] px-3.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-500 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Assign Course</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ----------------- TAB 6: TRAINER PAYOUTS ----------------- */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-500" /> Trainer Payouts & Revenue Share
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated 70/30 commission ledger, MFS/bank disbursements, and payout receipt logs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadPayouts}
                  className="min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPayouts ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(true)}
                  className="min-h-[42px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 tactile-press cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>+ Record Payout</span>
                </button>
              </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card3D maxTilt={6} className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md space-y-1 min-w-0">
                <div className="text-xs font-mono text-slate-500 truncate">Total 70% Share Earned</div>
                <div className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white truncate">
                  ৳{(payoutsData.summary?.total_earned_bdt || 0).toLocaleString()}
                </div>
              </Card3D>
              <Card3D maxTilt={6} className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10 backdrop-blur-md space-y-1 min-w-0">
                <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 truncate">Total Disbursed to Date</div>
                <div className="font-display font-black text-xl sm:text-2xl text-emerald-500 truncate">
                  ৳{(payoutsData.summary?.total_disbursed_bdt || 0).toLocaleString()}
                </div>
              </Card3D>
              <Card3D maxTilt={6} className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10 backdrop-blur-md space-y-1 min-w-0">
                <div className="text-xs font-mono text-amber-600 dark:text-amber-400 truncate">Pending Payable Balance</div>
                <div className="font-display font-black text-xl sm:text-2xl text-amber-500 truncate">
                  ৳{(payoutsData.summary?.pending_payouts_bdt || 0).toLocaleString()}
                </div>
              </Card3D>
            </div>

            {/* Trainers Payout Ledger */}
            <div className="p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md space-y-4">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Trainer Commission Ledger
              </h3>
              <div className="space-y-3">
                {payoutsData.trainers_ledger?.map((tl: any) => (
                  <div
                    key={tl.trainer_id}
                    className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs min-w-0"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{tl.trainer_name}</div>
                      <div className="text-slate-500 font-mono truncate">{tl.email}</div>
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 sm:gap-4 font-mono w-full sm:w-auto text-[11px] sm:text-xs">
                      <div>
                        <span className="text-slate-400">Gross: </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">৳{tl.gross_sales.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">70% Earned: </span>
                        <span className="font-bold text-sky-500">৳{tl.earned_70pct.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Disbursed: </span>
                        <span className="font-bold text-emerald-500">৳{tl.disbursed_total.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Balance: </span>
                        <span className="font-bold text-amber-500">৳{tl.pending_balance.toLocaleString()}</span>
                      </div>

                      <div className="col-span-2 sm:col-span-1 pt-1 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => {
                            setPayoutForm((prev) => ({
                              ...prev,
                              trainer_id: tl.trainer_id,
                              amount: tl.pending_balance > 0 ? tl.pending_balance : 5000,
                            }))
                            setIsPayoutModalOpen(true)
                          }}
                          className="min-h-[34px] w-full sm:w-auto px-3 rounded-lg bg-emerald-500 text-slate-950 font-bold cursor-pointer tactile-press text-center"
                        >
                          Disburse
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payout History */}
            <div className="p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md space-y-4">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Disbursement History & Receipts
              </h3>
              <div className="space-y-2.5">
                {payoutsData.payout_history?.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 italic">No payouts recorded yet.</div>
                ) : (
                  payoutsData.payout_history?.map((ph: any) => (
                    <div
                      key={ph.id}
                      className="p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex items-start sm:items-center justify-between gap-3 text-xs min-w-0"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="font-semibold text-slate-900 dark:text-white break-words">
                          ৳{ph.amount.toLocaleString()} → {ph.trainer_name} ({ph.method})
                        </div>
                        <div className="text-slate-500 font-mono text-[11px] break-all">
                          Acc: {ph.account_number || 'N/A'} • Ref: <span className="text-sky-500">{ph.transaction_ref}</span> • {new Date(ph.disbursed_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded font-mono font-bold bg-emerald-500/15 text-emerald-500 shrink-0">
                        {ph.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 7: MFS & STORE APPROVALS ----------------- */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md space-y-4">
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center justify-between">
                <span>1-Click Course & Gift MFS Payment Verification Queue</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-500">
                  {data.payments.filter((p: any) => p.status === 'Pending').length} Pending
                </span>
              </h2>

              <div className="space-y-3">
                {data.payments.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs min-w-0"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="font-mono font-bold text-slate-900 dark:text-white break-words">
                        {p.invoice_number} • {p.user_name} • ৳{p.amount.toLocaleString()}
                      </div>
                      <div className="text-slate-500 break-words text-[11px]">
                        {p.item_title} | {p.method} ({p.sender_number}) • TrxID: <code className="text-sky-500 font-bold break-all">{p.transaction_id}</code>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                      <span
                        className={`px-2.5 py-1 rounded font-mono font-bold ${
                          p.status === 'Approved'
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : p.status === 'Rejected'
                            ? 'bg-rose-500/15 text-rose-500'
                            : 'bg-amber-500/15 text-amber-500'
                        }`}
                      >
                        {p.status}
                      </span>
                      {p.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleVerifyPayment(p.id, 'Approve')}
                            className="min-h-[36px] px-3 rounded-lg bg-emerald-500 text-slate-950 font-bold cursor-pointer tactile-press"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerifyPayment(p.id, 'Reject')}
                            className="min-h-[36px] px-3 rounded-lg bg-rose-500 text-white font-bold cursor-pointer tactile-press"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Digital Store Orders */}
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800">
                Digital Store Orders Verification (Unlocks Signed Vault Tokens)
              </h3>
              <div className="space-y-2.5">
                {data.store_orders.map((o: any) => (
                  <div
                    key={o.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs min-w-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white break-words">
                        {o.product_title} • ৳{o.amount}
                      </div>
                      <div className="font-mono text-slate-500 break-all text-[11px]">
                        TrxID: {o.transaction_id} ({o.sender_number})
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                      <span className="font-mono font-bold text-sky-500">{o.status}</span>
                      {o.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => handleVerifyStoreOrder(o.id, 'Approve')}
                          className="min-h-[34px] px-3 rounded-lg bg-emerald-500 text-slate-950 font-bold cursor-pointer"
                        >
                          Approve Vault Access
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 8: AI STUDIO & SYNC ----------------- */}
        {activeTab === 'ai_sync' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <form
                onSubmit={handleGenerateAiBlog}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md p-6 space-y-4"
              >
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> Gemini AI Bilingual Technical Blog Writer
                </h2>
                <p className="text-xs text-slate-500">
                  Generate SEO-optimized articles with structured engineering roadmaps, code examples, and bilingual support.
                </p>
                <input
                  type="text"
                  required
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Topic (e.g. Zero-Trust JWT Rotation in FastAPI & React)"
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-amber-500"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={aiLang}
                    onChange={(e) => setAiLang(e.target.value as 'bn' | 'en')}
                    className="min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                  >
                    <option value="bn">বাংলা আর্টিকেল (Bangla Technical)</option>
                    <option value="en">English Technical Architecture</option>
                  </select>
                  <button
                    type="submit"
                    disabled={generatingAi}
                    className="min-h-[44px] px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono tactile-press cursor-pointer"
                  >
                    {generatingAi ? 'Generating Article...' : 'Generate & Publish with AI'}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 dark:bg-sky-950/10 p-6 space-y-3">
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-500" /> 1-Click Legacy SQLite DB Sync
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Imports course curricula, video order keys, FAQ records, and user enrollments from LMS 1.0 SQLite database safely into the PostgreSQL 16 schema.
                </p>
                <button
                  type="button"
                  onClick={handleLegacySync}
                  disabled={syncingLegacy}
                  className="min-h-[44px] w-full px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer tactile-press"
                >
                  <Database className="w-4 h-4" />
                  <span>{syncingLegacy ? 'Syncing...' : 'Trigger Full Legacy Migration'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}
      {/* 1. Manual Enroll Student Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-500" /> Manual Student Enrollment
              </h3>
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualEnroll} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500">Student Email or Numeric ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. student@example.com or 42"
                  value={enrollForm.user_identifier}
                  onChange={(e) => setEnrollForm({ ...enrollForm, user_identifier: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500">Course Track</label>
                <select
                  value={enrollForm.course_id}
                  onChange={(e) => setEnrollForm({ ...enrollForm, course_id: Number(e.target.value) })}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                >
                  {data?.course_enrollment_breakdown?.map((c: any) => (
                    <option key={c.id || c.title} value={c.id || 1}>
                      {c.title}
                    </option>
                  ))}
                  {/* Fallback option if breakdown doesn't list all */}
                  <option value={1}>Modern Full-Stack Web Development</option>
                  <option value={2}>Docker & Kubernetes Cloud Architecture</option>
                  <option value={3}>Python Microservices & FastAPI Zero-Trust</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEnroll}
                  className="min-h-[44px] px-5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold font-mono tactile-press cursor-pointer"
                >
                  {submittingEnroll ? 'Enrolling...' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Manual Mint Certificate Modal */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-purple-500/30 bg-white dark:bg-[#111827] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" /> Mint Verified Certificate
              </h3>
              <button
                type="button"
                onClick={() => setIsCertModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueCertificate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500">Student Email or ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. learner@example.com or 5"
                  value={certForm.user_identifier}
                  onChange={(e) => setCertForm({ ...certForm, user_identifier: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500">Student Printed Full Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Defaults to user full name if left blank"
                  value={certForm.student_name}
                  onChange={(e) => setCertForm({ ...certForm, student_name: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500">Course Track</label>
                <select
                  value={certForm.course_id}
                  onChange={(e) => setCertForm({ ...certForm, course_id: Number(e.target.value) })}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                >
                  <option value={1}>Modern Full-Stack Web Development</option>
                  <option value={2}>Docker & Kubernetes Cloud Architecture</option>
                  <option value={3}>Python Microservices & FastAPI Zero-Trust</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500">Graduation Score: {certForm.grade_score}%</label>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={certForm.grade_score}
                  onChange={(e) => setCertForm({ ...certForm, grade_score: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCert}
                  className="min-h-[44px] px-5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold font-mono tactile-press cursor-pointer"
                >
                  {submittingCert ? 'Minting...' : 'Mint & Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Assign Course to Trainer Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-indigo-500/30 bg-white dark:bg-[#111827] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" /> Assign Track to Trainer
              </h3>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignTrainer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500">Instructor / Trainer</label>
                <select
                  value={assignForm.trainer_id}
                  onChange={(e) => setAssignForm({ ...assignForm, trainer_id: Number(e.target.value) })}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                >
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} ({t.email})
                    </option>
                  ))}
                  {trainers.length === 0 && <option value={1}>TrainingPundit Lead Faculty</option>}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500">Course Track</label>
                <select
                  value={assignForm.course_id}
                  onChange={(e) => setAssignForm({ ...assignForm, course_id: Number(e.target.value) })}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                >
                  <option value={1}>Modern Full-Stack Web Development</option>
                  <option value={2}>Docker & Kubernetes Cloud Architecture</option>
                  <option value={3}>Python Microservices & FastAPI Zero-Trust</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssign}
                  className="min-h-[44px] px-5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold font-mono tactile-press cursor-pointer"
                >
                  {submittingAssign ? 'Assigning...' : 'Assign Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Record Payout Disbursement Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-white dark:bg-[#111827] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-500" /> Record Trainer Payout
              </h3>
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayout} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500">Trainer</label>
                <select
                  value={payoutForm.trainer_id}
                  onChange={(e) => setPayoutForm({ ...payoutForm, trainer_id: Number(e.target.value) })}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                >
                  {payoutsData.trainers_ledger?.map((tl: any) => (
                    <option key={tl.trainer_id} value={tl.trainer_id}>
                      {tl.trainer_name} (Pending: ৳{tl.pending_balance})
                    </option>
                  ))}
                  {(!payoutsData.trainers_ledger || payoutsData.trainers_ledger.length === 0) && (
                    <option value={1}>TrainingPundit Lead Faculty</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-500">Amount (BDT)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={payoutForm.amount}
                    onChange={(e) => setPayoutForm({ ...payoutForm, amount: Number(e.target.value) })}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-500">Channel</label>
                  <select
                    value={payoutForm.method}
                    onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                  >
                    <option value="bKash">bKash (Send Money)</option>
                    <option value="Nagad">Nagad (Send Money)</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Bank Wire">Bank Wire Transfer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500">Trainer Wallet / Bank Account</label>
                <input
                  type="text"
                  placeholder="01711-XXXXXX or Dutch Bangla Bank #12345"
                  value={payoutForm.account_number}
                  onChange={(e) => setPayoutForm({ ...payoutForm, account_number: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-500">Bank / MFS Transaction Ref</label>
                <input
                  type="text"
                  placeholder="e.g. TRX-9B2F81A or leave blank for auto-gen"
                  value={payoutForm.transaction_ref}
                  onChange={(e) => setPayoutForm({ ...payoutForm, transaction_ref: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout}
                  className="min-h-[44px] px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono tactile-press cursor-pointer"
                >
                  {submittingPayout ? 'Recording...' : 'Disburse & Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

