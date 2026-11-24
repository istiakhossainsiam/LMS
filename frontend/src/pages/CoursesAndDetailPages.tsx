import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Gift,
  Layers,
  Lock,
  MessageSquare,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
  Users,
  Video,
} from 'lucide-react'
import { apiFetch } from '../lib/api'
import { useAppStore, bf } from '../stores/useAppStore'
import { Card3D } from '../components/common/Card3D'

export const CoursesPage: React.FC = () => {
  const { lang, compareCourses, toggleCompareCourse } = useAppStore()
  const [courses, setCourses] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('All')
  const [liveOnly, setLiveOnly] = useState(false)
  const [sort, setSort] = useState('popular')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (category !== 'All') params.set('category', category)
    if (liveOnly) params.set('live_only', 'true')
    params.set('sort', sort)

    apiFetch(`/public/courses?${params.toString()}`)
      .then((res) => setCourses(res))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [q, category, liveOnly, sort])

  const categories = ['All', 'Web Development', 'Python & AI', 'UI/UX Design', 'Cybersecurity']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div className="space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-semibold">
          {lang === 'bn' ? 'কোর্স ক্যাটালগ' : 'Verified Course Catalog'}
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-4xl text-slate-900 dark:text-white">
          {lang === 'bn' ? 'আপনার ক্যারিয়ার ট্র্যাক বেছে নিন' : 'Explore Industry-Grade Learning Tracks'}
        </h1>
      </div>

      {/* Filter & Search Bar */}
      <div className="aurora-card rounded-2xl p-4 sm:p-5 space-y-4 bg-white dark:bg-[#0C1528] border border-[#E2E8F2] dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#5D6B82] dark:text-[#A8B7CE] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'কোর্স খুঁজুন (যেমন: React, FastAPI, Python, Security)...'
                  : 'Search courses (e.g., React, FastAPI, Python, Security)...'
              }
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-700/80 text-sm text-[#14213A] dark:text-[#F5F8FF] focus:outline-none focus:border-[#356DFF]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort courses"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-700/80 text-xs sm:text-sm font-medium text-[#14213A] dark:text-[#F5F8FF] focus:outline-none focus:border-[#356DFF]"
            >
              <option value="popular">{lang === 'bn' ? 'সবচেয়ে জনপ্রিয়' : 'Most Popular'}</option>
              <option value="rating">{lang === 'bn' ? 'সর্বোচ্চ রেটিং' : 'Highest Rated'}</option>
              <option value="price_asc">{lang === 'bn' ? 'কম থেকে বেশি ফি' : 'Price: Low to High'}</option>
              <option value="price_desc">{lang === 'bn' ? 'বেশি থেকে কম ফি' : 'Price: High to Low'}</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center">
            <button
              type="button"
              onClick={() => setLiveOnly(!liveOnly)}
              className={`w-full min-h-[44px] px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 tactile-press cursor-pointer transition-colors ${
                liveOnly
                  ? 'aurora-pill-teal font-bold'
                  : 'aurora-btn-secondary'
              }`}
            >
              <Video className="w-4 h-4 text-[#35C6BE]" />
              <span>{lang === 'bn' ? 'শুধুমাত্র লাইভ ব্যাচ' : 'Live Batches Only'}</span>
            </button>
          </div>
        </div>

        {/* Category Pills — Fluid Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`min-h-[38px] px-4 rounded-xl text-xs font-semibold whitespace-nowrap tactile-press cursor-pointer shrink-0 transition-all ${
                category === cat
                  ? 'aurora-btn-primary shadow-sm'
                  : 'aurora-btn-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-200/70 dark:bg-slate-900/70 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isCompared = compareCourses.some((c) => c.id === course.id)
            return (
              <div
                key={course.id}
                className="aurora-card rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-[#356DFF] dark:hover:border-[#35C6BE] transition-all bg-white dark:bg-[#0C1528]"
              >
                <div>
                  <div className="relative aspect-video bg-[#060B18] overflow-hidden">
                    <img
                      src={course.thumbnail_url}
                      alt={bf(course, 'title', lang)}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#060B18]/90 backdrop-blur-md text-[#F5F8FF] text-[10px] font-mono font-semibold border border-slate-700/60 shadow-sm">
                        {bf(course, 'category', lang)}
                      </span>
                      {course.is_live_course && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-mono font-extrabold flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                          <span>{course.seats_remaining} SEATS LEFT</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-[#5D6B82] dark:text-[#A8B7CE]">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#356DFF]" />
                        {course.duration_hours} hrs • {course.lesson_count} Lessons
                      </span>
                      <span className="text-amber-500 font-semibold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {course.rating}
                      </span>
                    </div>
                    <Link to={`/courses/${course.id}`} className="block group">
                      <h2 className="font-display font-bold text-base sm:text-lg text-[#14213A] dark:text-[#F5F8FF] group-hover:text-[#356DFF] dark:group-hover:text-[#35C6BE] transition-colors line-clamp-2 leading-snug">
                        {bf(course, 'title', lang)}
                      </h2>
                    </Link>
                    <p className="text-xs text-[#5D6B82] dark:text-[#A8B7CE] line-clamp-2 leading-relaxed font-sans">
                      {bf(course, 'description', lang)}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-3.5">
                  <div className="pt-3 border-t border-[#E2E8F2] dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-lg sm:text-xl text-[#14213A] dark:text-[#F5F8FF]">
                        ৳{course.price.toLocaleString()}
                      </span>
                      {course.original_price > course.price && (
                        <span className="ml-2 text-xs font-mono line-through text-[#5D6B82] dark:text-[#A8B7CE]">
                          ৳{course.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-[#5D6B82] dark:text-[#A8B7CE]">
                      {course.instructor_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/courses/${course.id}`}
                      className="aurora-btn-primary flex-1 min-h-[44px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 tactile-press"
                    >
                      <span>{lang === 'bn' ? 'সিলেবাস ও ভর্তি' : 'View Syllabus'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleCompareCourse(course)}
                      className={`min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center tactile-press cursor-pointer transition-colors ${
                        isCompared
                          ? 'bg-[#356DFF]/15 border-[#356DFF] text-[#356DFF]'
                          : 'border-[#E2E8F2] dark:border-slate-800 text-[#5D6B82] dark:text-[#A8B7CE] hover:text-[#14213A] dark:hover:text-white'
                      }`}
                      aria-label="Add to course comparison"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { lang } = useAppStore()
  const [course, setCourse] = useState<any>(null)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({})

  useEffect(() => {
    apiFetch(`/public/courses/${id}`)
      .then((res) => {
        setCourse(res)
        if (res.variants?.length > 0) {
          setSelectedVariant(res.variants[0])
        }
        // Expand first module by default
        if (res.modules?.length > 0) {
          setExpandedModules({ [res.modules[0].id]: true })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const toggleModule = (modId: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }))
  }

  if (loading || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-96 rounded-3xl bg-slate-200/70 dark:bg-slate-900/70 animate-pulse" />
      </div>
    )
  }

  const activePrice = selectedVariant ? selectedVariant.price : course.price
  const savings = course.original_price > activePrice ? course.original_price - activePrice : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28 lg:pb-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-sky-500 transition-colors">
          {lang === 'bn' ? 'হোম' : 'Home'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/courses" className="hover:text-sky-500 transition-colors">
          {lang === 'bn' ? 'সকল কোর্স' : 'Courses'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-md">
          {bf(course, 'title', lang)}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Course Overview, Highlights, Curriculum, Instructor */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Title & Badges */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 font-mono text-xs font-bold border border-sky-500/20">
                {bf(course, 'category', lang)}
              </span>
              {course.is_live_course && (
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold border border-amber-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>{bf(course, 'batch_title', lang)} • {course.seats_remaining} SEATS LEFT</span>
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold border border-emerald-500/20">
                AST CodeLab Included
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white leading-tight tracking-tight">
              {bf(course, 'title', lang)}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {bf(course, 'description', lang)}
            </p>

            {/* Social Trust Metrics */}
            <div className="flex flex-wrap items-center gap-5 text-xs font-mono text-slate-500 dark:text-slate-400 pt-2 border-y border-slate-100 dark:border-slate-800/80 py-3">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Users className="w-4 h-4 text-sky-500" /> {course.students_count.toLocaleString()}+ Students Enrolled
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" /> {course.duration_hours} Total Hours
              </span>
              <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400" /> {course.rating} / 5.0 Rating
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <Award className="w-4 h-4 text-purple-500" /> Verified Certificate
              </span>
            </div>
          </div>

          {/* Key Course Highlights Bento Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: lang === 'bn' ? 'লাইভ ক্লাস ও মেন্টরিং' : 'Live Interactive', sub: 'Interactive Zoom', icon: Video, color: 'text-[#356DFF]' },
              { label: lang === 'bn' ? 'ক্লাউড কোডল্যাব' : 'AST CodeLab', sub: 'Automated XP & AST', icon: Terminal, color: 'text-[#35C6BE]' },
              { label: lang === 'bn' ? 'সরাসরি জব ইন্টারভিউ' : 'Direct Hiring', sub: 'Top BD Tech Firms', icon: Sparkles, color: 'text-amber-500' },
              { label: lang === 'bn' ? '২৪/৭ ডিসকর্ড সাপোর্ট' : 'Discord Eng Hub', sub: 'TA Resolution', icon: MessageSquare, color: 'text-[#86EFAC]' },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="p-3.5 rounded-2xl aurora-card space-y-1 bg-white dark:bg-[#0C1528] border border-[#E2E8F2] dark:border-slate-800">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <div className="font-display font-bold text-xs text-[#14213A] dark:text-[#F5F8FF] leading-tight">
                    {item.label}
                  </div>
                  <div className="text-[10px] font-mono text-[#5D6B82] dark:text-[#A8B7CE]">
                    {item.sub}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Learning Outcomes */}
          {(course.outcomes || []).length > 0 && (
            <div className="rounded-3xl aurora-card-raised p-6 sm:p-7 space-y-4 bg-white dark:bg-[#0C1528] border border-[#E2E8F2] dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-[#14213A] dark:text-[#F5F8FF] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#35C6BE]" />
                  <span>{lang === 'bn' ? 'এই কোর্স শেষে আপনি যা তৈরি করতে পারবেন' : 'What You Will Master & Build'}</span>
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#35C6BE] font-bold">Production Ready</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {course.outcomes.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-xs sm:text-sm text-[#14213A] dark:text-[#F5F8FF]">
                    <Check className="w-4 h-4 text-[#35C6BE] shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum Syllabus with Interactive Accordion */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-xl text-[#14213A] dark:text-[#F5F8FF]">
                  {lang === 'bn' ? 'কোর্স কারিকুলাম ও মডিউল' : 'Structured Course Curriculum'}
                </h2>
                <p className="text-xs text-[#5D6B82] dark:text-[#A8B7CE] mt-0.5">
                  {(course.modules || []).length} Modules • {course.lesson_count || 32} Lessons • Sequential Mastery Unlocked
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const allOpen = course.modules?.every((m: any) => expandedModules[m.id])
                  const nextState: Record<number, boolean> = {}
                  if (!allOpen) {
                    course.modules?.forEach((m: any) => { nextState[m.id] = true })
                  }
                  setExpandedModules(nextState)
                }}
                className="text-xs font-mono text-[#356DFF] dark:text-[#35C6BE] hover:underline font-semibold cursor-pointer"
              >
                {course.modules?.every((m: any) => expandedModules[m.id])
                  ? (lang === 'bn' ? 'সব গুটিয়ে নিন' : 'Collapse All')
                  : (lang === 'bn' ? 'সব খুলুন' : 'Expand All')}
              </button>
            </div>

            {/* Free Video Preview Modal / Player */}
            {previewVideoId && (
              <div className="rounded-3xl overflow-hidden border border-[#356DFF]/50 bg-[#060B18] shadow-2xl">
                <div className="px-5 py-3 flex items-center justify-between bg-[#0C1528] text-xs font-mono text-[#35C6BE] border-b border-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>FREE LESSON PREVIEW (Zero-Trust Sandbox)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewVideoId(null)}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
                <div className="aspect-video">
                  <iframe
                    title="Course Preview"
                    src={`https://www.youtube.com/embed/${previewVideoId}?rel=0&autoplay=1`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay"
                  />
                </div>
              </div>
            )}

            {/* Modules Accordion */}
            <div className="space-y-3">
              {(course.modules || []).map((mod: any, modIdx: number) => {
                const isOpen = !!expandedModules[mod.id]
                const lessonCount = (mod.lessons || []).length
                return (
                  <div
                    key={mod.id}
                    className="rounded-2xl border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#0C1528] overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className="w-full px-5 py-4 bg-[#F5F7FB]/70 dark:bg-[#111F36]/60 hover:bg-[#F5F7FB] dark:hover:bg-[#111F36] transition-colors flex items-center justify-between text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-lg aurora-pill-blue font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {modIdx + 1}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-sm text-[#14213A] dark:text-[#F5F8FF] truncate">
                            {bf(mod, 'title', lang)}
                          </h3>
                          <span className="text-[11px] font-mono text-[#5D6B82] dark:text-[#A8B7CE]">
                            {lessonCount} Lessons
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#5D6B82] dark:text-[#A8B7CE]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#5D6B82] dark:text-[#A8B7CE]" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-[#E2E8F2] dark:divide-slate-800/70 border-t border-[#E2E8F2] dark:border-slate-800">
                        {(mod.lessons || []).map((les: any) => (
                          <div
                            key={les.id}
                            className="px-5 py-3.5 flex items-center justify-between gap-3 text-sm hover:bg-[#F5F7FB]/50 dark:hover:bg-slate-900/40 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {les.is_free_preview ? (
                                <Play className="w-4 h-4 text-[#356DFF] shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span className="text-[#14213A] dark:text-[#F5F8FF] font-medium text-xs sm:text-sm truncate">
                                {bf(les, 'title', lang)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {les.is_free_preview && les.preview_video_id && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewVideoId(les.preview_video_id)}
                                  className="px-2.5 py-1 rounded-lg aurora-pill-blue text-xs font-mono font-semibold cursor-pointer transition-colors"
                                >
                                  {lang === 'bn' ? 'ফ্রি প্রিভিউ' : 'Free Preview'}
                                </button>
                              )}
                              <span className="text-xs font-mono text-[#5D6B82] dark:text-[#A8B7CE]">{les.duration_minutes}m</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Instructor Spotlight Card */}
          <div className="aurora-card-raised rounded-3xl p-6 sm:p-7 space-y-4 bg-white dark:bg-[#0C1528] border border-[#E2E8F2] dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#356DFF] font-bold">
                Lead Instructor
              </span>
              <span className="px-2.5 py-0.5 rounded-full aurora-pill-teal text-[11px] font-mono font-semibold">
                Verified Mentor
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#356DFF] to-[#35C6BE] p-0.5 shadow-lg shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#060B18] flex items-center justify-center text-white font-display font-extrabold text-2xl">
                  MA
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-xl text-[#14213A] dark:text-[#F5F8FF]">
                  {course.instructor_name}
                </h3>
                <p className="text-xs font-mono text-[#356DFF] dark:text-[#35C6BE] font-semibold">
                  Principal Cloud & Software Architect • Ex-Lead Engineer
                </p>
                <p className="text-xs text-[#5D6B82] dark:text-[#A8B7CE] leading-relaxed font-sans pt-1">
                  {lang === 'bn'
                    ? '১০+ বছরের ইন্ডাস্ট্রিয়াল এক্সপেরিয়েন্স সম্পন্ন সিনিয়র সফটওয়্যার আর্কিটেক্ট। ১৫,০০০+ শিক্ষার্থীদের ক্যারিয়ার গাইডেন্স ও মেন্টরিং প্রদান করেছেন।'
                    : '10+ years architecting mission-critical distributed systems. Passionate about empowering the next generation of top 1% software engineers.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Elevated Sticky Enrollment & Delivery Variant Selector */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="aurora-card-raised rounded-3xl p-6 shadow-xl space-y-6 bg-white dark:bg-[#0C1528] border border-[#E2E8F2] dark:border-slate-800">
            {/* Aspect Video Thumbnail with Ambient Border */}
            <div className="aspect-video rounded-2xl overflow-hidden bg-[#060B18] border border-[#E2E8F2] dark:border-slate-800 shadow-md relative group">
              <img
                src={course.thumbnail_url}
                alt={bf(course, 'title', lang)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060B18]/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-mono text-[#F5F8FF] flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-white fill-current" />
                  Full Curriculum Unlocked on Enrollment
                </span>
              </div>
            </div>

            {/* Pricing Section with Discount Tag */}
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-mono font-extrabold text-3xl sm:text-4xl text-[#14213A] dark:text-[#F5F8FF]">
                    ৳{activePrice.toLocaleString()}
                  </span>
                  {course.original_price > activePrice && (
                    <span className="ml-2.5 font-mono text-sm line-through text-[#5D6B82] dark:text-[#A8B7CE]">
                      ৳{course.original_price.toLocaleString()}
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <span className="px-2.5 py-1 rounded-lg aurora-pill-teal font-mono text-xs font-bold">
                    SAVE ৳{savings.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-[#5D6B82] dark:text-[#A8B7CE]">
                Inclusive of all taxes & lifetime access privileges
              </p>
            </div>

            {/* Hybrid Delivery Variant Selector (Recorded / Live / 1-on-1) */}
            {(course.variants || []).length > 0 && (
              <div className="space-y-2.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5D6B82] dark:text-[#A8B7CE] font-bold">
                  {lang === 'bn' ? 'কোর্স ডেলিভারি ফরম্যাট নির্বাচন করুন:' : 'Select Delivery Format:'}
                </label>
                <div className="space-y-2">
                  {course.variants.map((v: any) => {
                    const active = selectedVariant?.id === v.id
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 tactile-press ${
                          active
                            ? 'border-[#356DFF] bg-[#356DFF]/10 ring-1 ring-[#356DFF]/30 dark:border-[#35C6BE] dark:bg-[#35C6BE]/10 dark:ring-[#35C6BE]/30 shadow-sm'
                            : 'border-[#E2E8F2] dark:border-slate-800 bg-[#F5F7FB]/70 dark:bg-[#111F36]/60 hover:border-[#356DFF]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${active ? 'border-[#356DFF] bg-[#356DFF] dark:border-[#35C6BE] dark:bg-[#35C6BE]' : 'border-slate-400'}`}>
                            {active && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#060B18]" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs sm:text-sm text-[#14213A] dark:text-[#F5F8FF] truncate">
                              {bf(v, 'variant_type', lang)}
                            </div>
                            <div className="text-[11px] text-[#5D6B82] dark:text-[#A8B7CE] truncate">
                              {v.description}
                            </div>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-sm text-[#14213A] dark:text-[#F5F8FF] shrink-0">
                          ৳{v.price.toLocaleString()}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/checkout?course=${course.id}${selectedVariant ? `&variant=${selectedVariant.id}` : ''}`
                  )
                }
                className="aurora-btn-primary w-full min-h-[50px] rounded-2xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 tactile-press cursor-pointer"
              >
                <span>{lang === 'bn' ? 'এখনই এনরোল করুন' : 'Proceed to Enrollment'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/checkout?course=${course.id}${selectedVariant ? `&variant=${selectedVariant.id}` : ''}&gift=1`
                  )
                }
                className="aurora-btn-secondary w-full min-h-[44px] rounded-2xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 tactile-press cursor-pointer"
              >
                <Gift className="w-4 h-4 text-amber-500" />
                <span>{lang === 'bn' ? 'প্রিয়জনকে কোর্সটি গিফট করুন' : 'Gift This Course to a Friend'}</span>
              </button>
            </div>

            {/* Included Value Features */}
            <div className="space-y-2.5 pt-4 border-t border-[#E2E8F2] dark:border-slate-800">
              {(course.features || [
                'Full Lifetime Curriculum Access',
                'Interactive Cloud CodeLab with XP Rewards',
                'FastAPI & React Production Architecture',
                'Verified Digital Certificate with QR Hash',
                'Direct Employer Job Placement Pipeline',
              ]).map((f: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-[#5D6B82] dark:text-[#A8B7CE]">
                  <ShieldCheck className="w-4 h-4 text-[#35C6BE] shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {/* Money-Back Guarantee Seal */}
            <div className="p-3.5 rounded-2xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-500 shrink-0" />
              <div className="text-[11px] leading-tight text-[#5D6B82] dark:text-[#A8B7CE]">
                <span className="font-bold text-[#14213A] dark:text-[#F5F8FF] block">
                  {lang === 'bn' ? '১০০% সন্তুষ্টি গ্যারান্টি' : '100% Satisfaction Guarantee'}
                </span>
                {lang === 'bn' ? 'প্রথম ৭ দিনের মধ্যে কোনো প্রশ্ন ছাড়াই রিফান্ড পলিসি।' : '7-day no-questions-asked refund policy if not satisfied.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Enrollment Action Bar (< 1024px) */}
      <div className="lg:hidden fixed bottom-16 sm:bottom-18 inset-x-2.5 sm:inset-x-6 z-30 bg-white/95 dark:bg-[#0C1528]/95 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-2xl border border-[#E2E8F2] dark:border-slate-800/90 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#5D6B82] dark:text-[#A8B7CE] truncate">
            {selectedVariant ? bf(selectedVariant, 'variant_type', lang) : lang === 'bn' ? 'কোর্স ফি' : 'Tuition Fee'}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-bold text-xl text-[#14213A] dark:text-[#F5F8FF]">
              ৳{activePrice.toLocaleString()}
            </span>
            {course.original_price > activePrice && (
              <span className="text-xs font-mono line-through text-[#5D6B82] dark:text-[#A8B7CE]">
                ৳{course.original_price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            navigate(
              `/checkout?course=${course.id}${selectedVariant ? `&variant=${selectedVariant.id}` : ''}`
            )
          }
          className="aurora-btn-primary min-h-[44px] px-5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 tactile-press cursor-pointer shrink-0 shadow-md"
        >
          <span>{lang === 'bn' ? 'এনরোল করুন' : 'Enroll Now'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
