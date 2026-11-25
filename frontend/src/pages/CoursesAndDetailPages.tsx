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
      <div className="rounded-2xl bg-[#0F2A44] dark:bg-[#0A1E33] border border-[#16324F] p-5 sm:p-6 space-y-3">
        <span className="text-xs font-mono text-[#FB923C] dark:text-[#FB923C] font-medium">
          {lang === 'bn' ? 'কোর্স ক্যাটালগ' : 'Engineering curriculum'}
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-4xl text-[#FBF3DC] dark:text-[#FFF7E8]">
          {lang === 'bn' ? 'আপনার ক্যারিয়ার ট্র্যাক বেছে নিন' : 'Explore industry-grade learning tracks'}
        </h1>
      </div>

      {/* Filter & Search Bar */}
      <div className="aurora-card rounded-2xl p-4 sm:p-5 space-y-4 bg-[#FBF3DC] dark:bg-[#102A44] border border-[#E0D3AF] dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#6B7280] dark:text-[#D9CDB8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'কোর্স খুঁজুন (যেমন: React, FastAPI, Python, Security)...'
                  : 'Search courses (e.g., React, FastAPI, Python, Security)...'
              }
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-700/80 text-sm text-[#0F2A44] dark:text-[#FFF7E8] focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort courses"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-700/80 text-xs sm:text-sm font-medium text-[#0F2A44] dark:text-[#FFF7E8] focus:outline-none focus:border-[#F97316]"
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
              className={`w-full min-h-[44px] px-4 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 tactile-press cursor-pointer transition-colors ${
                liveOnly
                  ? 'aurora-pill-accent font-semibold'
                  : 'aurora-btn-secondary'
              }`}
            >
              <Video className="w-4 h-4 text-[#F97316]" />
              <span>{lang === 'bn' ? 'শুধুমাত্র লাইভ ব্যাচ' : 'Live batches only'}</span>
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
              className={`min-h-[38px] px-4 rounded-xl text-xs font-medium whitespace-nowrap tactile-press cursor-pointer shrink-0 transition-all ${
                category === cat
                  ? 'aurora-btn-primary shadow-xs'
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
                className="aurora-card rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#F97316] dark:hover:border-[#FB923C] transition-all bg-[#FBF3DC] dark:bg-[#102A44]"
              >
                <div>
                  <div className="relative aspect-video bg-[#0A1E33] overflow-hidden">
                    <img
                      src={course.thumbnail_url}
                      alt={bf(course, 'title', lang)}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#0A1E33]/90 backdrop-blur-md text-[#FFF7E8] text-[10px] font-mono font-medium border border-slate-700/60 shadow-xs">
                        {bf(course, 'category', lang)}
                      </span>
                      {course.is_live_course && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-mono font-semibold flex items-center gap-1 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                          <span>{course.seats_remaining} seats left</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-[#6B7280] dark:text-[#D9CDB8]">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="tabular-nums">{course.duration_hours}h • {course.lesson_count} lessons</span>
                      </span>
                      <span className="text-amber-500 font-medium flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="tabular-nums">{course.rating}</span>
                      </span>
                    </div>
                    <Link to={`/courses/${course.id}`} className="block group">
                      <h2 className="font-display font-bold text-base sm:text-lg text-[#0F2A44] dark:text-[#FFF7E8] group-hover:text-[#F97316] dark:group-hover:text-[#FB923C] transition-colors line-clamp-2 leading-snug">
                        {bf(course, 'title', lang)}
                      </h2>
                    </Link>
                    <p className="text-xs text-[#6B7280] dark:text-[#D9CDB8] line-clamp-2 leading-relaxed font-sans">
                      {bf(course, 'description', lang)}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-3.5">
                  <div className="pt-3 border-t border-[#E0D3AF] dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-lg sm:text-xl text-[#0F2A44] dark:text-[#FFF7E8] tabular-nums">
                        ৳{course.price.toLocaleString()}
                      </span>
                      {course.original_price > course.price && (
                        <span className="ml-2 text-xs font-mono line-through text-[#6B7280] dark:text-[#D9CDB8] tabular-nums">
                          ৳{course.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-[#6B7280] dark:text-[#D9CDB8]">
                      {course.instructor_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/courses/${course.id}`}
                      className="aurora-btn-primary flex-1 min-h-[44px] rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 tactile-press"
                    >
                      <span>{lang === 'bn' ? 'সিলেবাস ও ভর্তি' : 'View track'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleCompareCourse(course)}
                      className={`min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center tactile-press cursor-pointer transition-colors ${
                        isCompared
                          ? 'bg-[#F97316]/15 border-[#F97316] text-[#F97316]'
                          : 'border-[#E0D3AF] dark:border-slate-800 text-[#6B7280] dark:text-[#D9CDB8] hover:text-[#0F2A44] dark:hover:text-white'
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
        <div className="h-96 rounded-2xl bg-slate-200/70 dark:bg-slate-900/70 animate-pulse" />
      </div>
    )
  }

  const activePrice = selectedVariant ? selectedVariant.price : course.price
  const savings = course.original_price > activePrice ? course.original_price - activePrice : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28 lg:pb-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-orange-500 transition-colors">
          {lang === 'bn' ? 'হোম' : 'Home'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/courses" className="hover:text-orange-500 transition-colors">
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
              <span className="px-3 py-1 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-mono text-xs font-semibold border border-orange-500/20">
                {bf(course, 'category', lang)}
              </span>
              {course.is_live_course && (
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono text-xs font-semibold border border-amber-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{bf(course, 'batch_title', lang)} • {course.seats_remaining} seats remaining</span>
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-medium border border-emerald-500/20">
                AST CodeLab Included
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white leading-tight tracking-tight">
              {bf(course, 'title', lang)}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {bf(course, 'description', lang)}
            </p>

            {/* Social Trust Metrics */}
            <div className="flex flex-wrap items-center gap-5 text-xs font-mono text-slate-500 dark:text-slate-400 pt-2 border-y border-slate-100 dark:border-slate-800/80 py-3">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Users className="w-4 h-4 text-slate-400" /> <span className="tabular-nums">{course.students_count.toLocaleString()}+</span> enrolled
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" /> <span className="tabular-nums">{course.duration_hours}h</span> total
              </span>
              <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                <Star className="w-4 h-4 fill-amber-400" /> <span className="tabular-nums">{course.rating}</span>
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <Award className="w-4 h-4 text-slate-400" /> Verified certificate
              </span>
            </div>
          </div>

          {/* Key Course Highlights Bento Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: lang === 'bn' ? 'লাইভ ক্লাস ও মেন্টরিং' : 'Live Interactive', sub: 'Interactive Zoom', icon: Video, color: 'text-[#F97316]' },
              { label: lang === 'bn' ? 'ক্লাউড কোডল্যাব' : 'AST CodeLab', sub: 'Automated XP & AST', icon: Terminal, color: 'text-[#F97316]' },
              { label: lang === 'bn' ? 'সরাসরি জব ইন্টারভিউ' : 'Direct Hiring', sub: 'Top BD Tech Firms', icon: Sparkles, color: 'text-amber-500' },
              { label: lang === 'bn' ? '২৪/৭ ডিসকর্ড সাপোর্ট' : 'Discord Eng Hub', sub: 'TA Resolution', icon: MessageSquare, color: 'text-[#86EFAC]' },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="p-3.5 rounded-2xl aurora-card space-y-1 bg-[#FBF3DC] dark:bg-[#102A44] border border-[#E0D3AF] dark:border-slate-800">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <div className="font-display font-bold text-xs text-[#0F2A44] dark:text-[#FFF7E8] leading-tight">
                    {item.label}
                  </div>
                  <div className="text-[10px] font-mono text-[#6B7280] dark:text-[#D9CDB8]">
                    {item.sub}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Learning Outcomes */}
          {(course.outcomes || []).length > 0 && (
            <div className="rounded-2xl aurora-card-raised p-6 sm:p-7 space-y-4 bg-[#FBF3DC] dark:bg-[#102A44] border border-[#E0D3AF] dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-[#0F2A44] dark:text-[#FFF7E8] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#F97316]" />
                  <span>{lang === 'bn' ? 'এই কোর্স শেষে আপনি যা তৈরি করতে পারবেন' : 'What you will build'}</span>
                </h2>
                <span className="text-[10px] font-mono text-[#F97316] font-semibold">Production ready</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {course.outcomes.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800 text-xs sm:text-sm text-[#0F2A44] dark:text-[#FFF7E8]">
                    <Check className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
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
                <h2 className="font-display font-bold text-xl text-[#0F2A44] dark:text-[#FFF7E8]">
                  {lang === 'bn' ? 'কোর্স কারিকুলাম ও মডিউল' : 'Structured Course Curriculum'}
                </h2>
                <p className="text-xs text-[#6B7280] dark:text-[#D9CDB8] mt-0.5">
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
                className="text-xs font-mono text-[#F97316] dark:text-[#F97316] hover:underline font-semibold cursor-pointer"
              >
                {course.modules?.every((m: any) => expandedModules[m.id])
                  ? (lang === 'bn' ? 'সব গুটিয়ে নিন' : 'Collapse All')
                  : (lang === 'bn' ? 'সব খুলুন' : 'Expand All')}
              </button>
            </div>

            {/* Free Video Preview Modal / Player */}
            {previewVideoId && (
              <div className="rounded-2xl overflow-hidden border border-[#F97316]/50 bg-[#0A1E33] shadow-md">
                <div className="px-5 py-3 flex items-center justify-between bg-[#102A44] text-xs font-mono text-[#F97316] border-b border-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Lesson preview</span>
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
                    className="rounded-2xl border border-[#E0D3AF] dark:border-slate-800 bg-[#FBF3DC] dark:bg-[#102A44] overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className="w-full px-5 py-4 bg-[#E9D9B4]/70 dark:bg-[#16324F]/60 hover:bg-[#E9D9B4] dark:hover:bg-[#16324F] transition-colors flex items-center justify-between text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-lg aurora-pill-accent font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {modIdx + 1}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-sm text-[#0F2A44] dark:text-[#FFF7E8] truncate">
                            {bf(mod, 'title', lang)}
                          </h3>
                          <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#D9CDB8]">
                            {lessonCount} Lessons
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#6B7280] dark:text-[#D9CDB8]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#6B7280] dark:text-[#D9CDB8]" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-[#E0D3AF] dark:divide-slate-800/70 border-t border-[#E0D3AF] dark:border-slate-800">
                        {(mod.lessons || []).map((les: any) => (
                          <div
                            key={les.id}
                            className="px-5 py-3.5 flex items-center justify-between gap-3 text-sm hover:bg-[#E9D9B4]/50 dark:hover:bg-slate-900/40 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {les.is_free_preview ? (
                                <Play className="w-4 h-4 text-[#F97316] shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span className="text-[#0F2A44] dark:text-[#FFF7E8] font-medium text-xs sm:text-sm truncate">
                                {bf(les, 'title', lang)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {les.is_free_preview && les.preview_video_id && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewVideoId(les.preview_video_id)}
                                  className="px-2.5 py-1 rounded-lg aurora-pill-accent text-xs font-mono font-semibold cursor-pointer transition-colors"
                                >
                                  {lang === 'bn' ? 'ফ্রি প্রিভিউ' : 'Free Preview'}
                                </button>
                              )}
                              <span className="text-xs font-mono text-[#6B7280] dark:text-[#D9CDB8]">{les.duration_minutes}m</span>
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
          <div className="aurora-card-raised rounded-2xl p-6 sm:p-7 space-y-4 bg-[#FBF3DC] dark:bg-[#102A44] border border-[#E0D3AF] dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#F97316] font-bold">
                Lead Instructor
              </span>
              <span className="px-2.5 py-0.5 rounded-full aurora-pill-accent text-[11px] font-mono font-semibold">
                Verified Mentor
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-[#F97316] p-0.5 shadow-lg shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#0A1E33] flex items-center justify-center text-white font-display font-extrabold text-2xl">
                  MA
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-xl text-[#0F2A44] dark:text-[#FFF7E8]">
                  {course.instructor_name}
                </h3>
                <p className="text-xs font-mono text-[#F97316] dark:text-[#F97316] font-semibold">
                  Principal Cloud & Software Architect • Ex-Lead Engineer
                </p>
                <p className="text-xs text-[#6B7280] dark:text-[#D9CDB8] leading-relaxed font-sans pt-1">
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
          <div className="aurora-card-raised rounded-2xl p-6 shadow-sm space-y-6 bg-[#FBF3DC] dark:bg-[#102A44] border border-[#E0D3AF] dark:border-slate-800">
            {/* Aspect Video Thumbnail with Ambient Border */}
            <div className="aspect-video rounded-2xl overflow-hidden bg-[#0A1E33] border border-[#E0D3AF] dark:border-slate-800 shadow-md relative group">
              <img
                src={course.thumbnail_url}
                alt={bf(course, 'title', lang)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                <span className="text-xs font-mono text-[#FFF7E8] flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-white fill-current" />
                  Full curriculum unlocked on enrollment
                </span>
              </div>
            </div>

            {/* Pricing Section with Discount Tag */}
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-mono font-bold text-3xl sm:text-4xl text-[#0F2A44] dark:text-[#FFF7E8] tabular-nums">
                    ৳{activePrice.toLocaleString()}
                  </span>
                  {course.original_price > activePrice && (
                    <span className="ml-2.5 font-mono text-sm line-through text-[#6B7280] dark:text-[#D9CDB8] tabular-nums">
                      ৳{course.original_price.toLocaleString()}
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <span className="px-2.5 py-1 rounded-lg aurora-pill-accent font-mono text-xs font-medium tabular-nums">
                    Save ৳{savings.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-[#6B7280] dark:text-[#D9CDB8]">
                Inclusive of all taxes & lifetime access
              </p>
            </div>

            {/* Hybrid Delivery Variant Selector (Recorded / Live / 1-on-1) */}
            {(course.variants || []).length > 0 && (
              <div className="space-y-2.5">
                <label className="block text-xs font-mono text-[#6B7280] dark:text-[#D9CDB8] font-semibold">
                  {lang === 'bn' ? 'কোর্স ডেলিভারি ফরম্যাট নির্বাচন করুন:' : 'Select delivery format:'}
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
                            ? 'border-[#F97316] bg-[#F97316]/10 ring-1 ring-[#F97316]/30 dark:border-[#FB923C] dark:bg-[#F97316]/10 dark:ring-[#F97316]/30 shadow-sm'
                            : 'border-[#E0D3AF] dark:border-slate-800 bg-[#E9D9B4]/70 dark:bg-[#16324F]/60 hover:border-[#F97316]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${active ? 'border-[#F97316] bg-[#F97316] dark:border-[#FB923C] dark:bg-[#F97316]' : 'border-slate-400'}`}>
                            {active && <span className="w-1.5 h-1.5 rounded-full bg-[#FBF3DC] dark:bg-[#0A1E33]" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs sm:text-sm text-[#0F2A44] dark:text-[#FFF7E8] truncate">
                              {bf(v, 'variant_type', lang)}
                            </div>
                            <div className="text-[11px] text-[#6B7280] dark:text-[#D9CDB8] truncate">
                              {v.description}
                            </div>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-sm text-[#0F2A44] dark:text-[#FFF7E8] shrink-0">
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
            <div className="space-y-2.5 pt-4 border-t border-[#E0D3AF] dark:border-slate-800">
              {(course.features || [
                'Full Lifetime Curriculum Access',
                'Interactive Cloud CodeLab with XP Rewards',
                'FastAPI & React Production Architecture',
                'Verified Digital Certificate with QR Hash',
                'Direct Employer Job Placement Pipeline',
              ]).map((f: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-[#6B7280] dark:text-[#D9CDB8]">
                  <ShieldCheck className="w-4 h-4 text-[#F97316] shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {/* Money-Back Guarantee Seal */}
            <div className="p-3.5 rounded-2xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800 flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-500 shrink-0" />
              <div className="text-[11px] leading-tight text-[#6B7280] dark:text-[#D9CDB8]">
                <span className="font-bold text-[#0F2A44] dark:text-[#FFF7E8] block">
                  {lang === 'bn' ? '১০০% সন্তুষ্টি গ্যারান্টি' : '100% Satisfaction Guarantee'}
                </span>
                {lang === 'bn' ? 'প্রথম ৭ দিনের মধ্যে কোনো প্রশ্ন ছাড়াই রিফান্ড পলিসি।' : '7-day no-questions-asked refund policy if not satisfied.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Enrollment Action Bar (< 1024px) */}
      <div className="lg:hidden fixed bottom-16 sm:bottom-18 inset-x-2.5 sm:inset-x-6 z-30 bg-[#FBF3DC]/95 dark:bg-[#102A44]/95 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-md border border-[#E0D3AF] dark:border-slate-800/90 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] dark:text-[#D9CDB8] truncate">
            {selectedVariant ? bf(selectedVariant, 'variant_type', lang) : lang === 'bn' ? 'কোর্স ফি' : 'Tuition Fee'}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-bold text-xl text-[#0F2A44] dark:text-[#FFF7E8]">
              ৳{activePrice.toLocaleString()}
            </span>
            {course.original_price > activePrice && (
              <span className="text-xs font-mono line-through text-[#6B7280] dark:text-[#D9CDB8]">
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
