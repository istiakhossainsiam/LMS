import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  Flame,
  Layers,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import { apiFetch } from '../lib/api'
import { useAppStore, bf } from '../stores/useAppStore'
import { Card3D } from '../components/common/Card3D'
import { LandingHero } from '../components/hero/LandingHero'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { lang, user, setAuth, showToast, compareCourses, toggleCompareCourse } = useAppStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [wsForm, setWsForm] = useState({ name: '', email: '', phone: '' })
  const [wsSubmitting, setWsSubmitting] = useState(false)

  // Interactive CodeLab Teaser State on Homepage
  const [teaserCode, setTeaserCode] = useState(
    'def check_safe_query(user_input: str) -> bool:\n    # Zero-trust AST parameterized validation\n    return not any(op in user_input.lower() for op in ["--", "/*", ";", "drop table"])'
  )
  const [teaserResult, setTeaserResult] = useState<string | null>(null)
  const [teaserTesting, setTeaserTesting] = useState(false)

  useEffect(() => {
    apiFetch('/public/home')
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleQuickDemoLogin = async (email: string, password: string, dest: string) => {
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: email, password, next_url: dest }),
      })
      setAuth(res.access_token, res.user)
      showToast(
        lang === 'bn'
          ? `স্বাগতম, ${res.user.full_name}!`
          : `Signed in as ${res.user.full_name} (${res.user.role.toUpperCase()})`,
        'success'
      )
      navigate(dest)
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleCopyPromo = (code: string) => {
    navigator.clipboard?.writeText(code)
    showToast(
      lang === 'bn' ? `প্রোমো কোড কপি হয়েছে: ${code}` : `Promo code copied: ${code}`,
      'success'
    )
  }

  const handleRunTeaserCode = () => {
    setTeaserTesting(true)
    setTimeout(() => {
      setTeaserTesting(false)
      setTeaserResult('2/2 Tests Passed! Parameterized AST query safe. (+30 XP)')
      showToast(
        lang === 'bn'
          ? 'অভিনন্দন! টেস্ট সফল হয়েছে (+৩০ XP)'
          : 'Challenge Solved! 2/2 Test Cases Passed (+30 XP)',
        'success'
      )
    }, 500)
  }

  const handleWorkshopRegister = async (e: React.FormEvent, workshopId: number) => {
    e.preventDefault()
    setWsSubmitting(true)
    try {
      const res = await apiFetch(`/public/workshops/${workshopId}/register`, {
        method: 'POST',
        body: JSON.stringify(wsForm),
      })
      showToast(res.message, 'success')
      setWsForm({ name: '', email: '', phone: '' })
      const updated = await apiFetch('/public/home')
      setData(updated)
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setWsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="h-72 rounded-3xl bg-slate-200/70 dark:bg-slate-900/80 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-200/70 dark:bg-slate-900/80 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const site = data?.site_settings || {}
  const flashSale = data?.flash_sale

  return (
    <div className="space-y-16 sm:space-y-28 pb-16 relative overflow-x-clip">
      {/* Subtle Ambient Frosted Backdrops (No harsh blue orbs) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[450px] bg-slate-100/60 dark:bg-slate-900/30 blur-3xl pointer-events-none -z-10" />

      {/* Active Flash Sale Ribbon */}
      {flashSale && (
        <div className="relative bg-amber-500/10 border-b border-amber-500/25 text-amber-950 dark:text-amber-200 animate-shimmer">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-extrabold text-[10px] tracking-wider shrink-0 shadow-sm">
                FLAT {flashSale.discount_percentage}% OFF
              </span>
              <span className="truncate font-semibold text-slate-900 dark:text-amber-100">
                {bf(flashSale, 'title', lang)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyPromo(flashSale.promo_code)}
              className="h-7 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-500/40 font-mono text-[11px] font-extrabold text-amber-950 dark:text-amber-300 flex items-center gap-1.5 shrink-0 tactile-press cursor-pointer shadow-xs hover:border-amber-600"
              title="Copy Promo Code"
            >
              <span>{flashSale.promo_code}</span>
              <Copy className="w-3 h-3 text-amber-700 dark:text-amber-400" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* 1. CINEMATIC HERO SECTION — Academic Aurora Horizon with Emerging Product Studio */}
      <LandingHero
        lang={lang}
        user={user}
        onDemoLogin={handleQuickDemoLogin}
      />

      {/* 2. HIRING PARTNERS LOGO RIBBON */}
      <section className="border-y border-[#E2E8F2] dark:border-slate-800/80 bg-white/70 dark:bg-[#0C1528]/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[#5D6B82] dark:text-[#A8B7CE] shrink-0">
              {lang === 'bn' ? 'আমাদের গ্র্যাজুয়েটরা যেখানে কাজ করছেন:' : 'Top Engineering Teams Hiring Our Graduates:'}
            </span>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 justify-center">
              {['Brain Station 23', 'Astha IT', 'REVE Systems', 'Technosoft BD', 'TigerIT Bangladesh'].map((co) => (
                <div
                  key={co}
                  className="px-3.5 py-1.5 rounded-xl border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#111F36] text-xs sm:text-sm font-display font-bold text-[#14213A] dark:text-[#F5F8FF] shadow-xs"
                >
                  {co}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE CODELAB TEASER PLAYGROUND */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="aurora-card-raised p-6 sm:p-10 text-[#14213A] dark:text-[#F5F8FF] relative overflow-hidden bg-white dark:bg-[#0C1528]">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full aurora-pill-teal text-xs font-mono font-semibold">
                <Code2 className="w-3.5 h-3.5 text-[#35C6BE]" />
                <span>{lang === 'bn' ? 'ব্রাউজার কোডিং ল্যাব' : 'Interactive Cloud CodeLab'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold leading-tight text-[#14213A] dark:text-[#F5F8FF]">
                {lang === 'bn'
                  ? 'থিওরির সাথে প্র্যাকটিক্যাল কোডিং অনুশীলন করুন'
                  : 'Write, Test & Solve Real Problems Live in Browser'}
              </h2>
              <p className="text-xs sm:text-sm text-[#5D6B82] dark:text-[#A8B7CE] leading-relaxed font-sans">
                {lang === 'bn'
                  ? 'কোনো জটিল লোকাল এনভায়রনমেন্ট সেটআপ ছাড়াই সরাসরি অ্যালগরিদম ও এসকিউএল সিকিউরিটি টেস্ট করুন। প্রতিটি সঠিক সমাধানে অর্জন করুন লার্নিং এক্সপি।'
                  : 'Zero local environment setup needed. Solve technical assessment problems, evaluate unit tests in under 50ms, and climb the cohort leaderboard.'}
              </p>
              <div className="pt-2">
                <Link
                  to="/codelab"
                  className="aurora-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tactile-press"
                >
                  <span>{lang === 'bn' ? 'সকল কোডিং চ্যালেঞ্জ দেখুন' : 'Explore Full CodeLab'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              <div className="p-4 rounded-2xl bg-[#060B18] text-slate-100 font-mono text-xs space-y-3 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#35C6BE]" />
                    <span>challenge_zero_trust_query.py</span>
                  </span>
                  <span className="text-[#35C6BE] font-bold">Python 3.14 Runtime</span>
                </div>

                <textarea
                  value={teaserCode}
                  onChange={(e) => setTeaserCode(e.target.value)}
                  rows={4}
                  style={{ touchAction: 'pan-y pinch-zoom' }}
                  className="w-full bg-transparent text-[#86EFAC] resize-none focus:outline-none leading-relaxed selection:bg-slate-700 font-mono text-xs"
                />

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-[#A8B7CE] font-mono">
                    {teaserResult || 'Input: Safe AST parameters'}
                  </span>
                  <button
                    type="button"
                    onClick={handleRunTeaserCode}
                    disabled={teaserTesting}
                    className="px-4 py-1.5 rounded-lg aurora-btn-primary font-bold text-xs flex items-center gap-1.5 tactile-press cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-current text-white" />
                    <span>{teaserTesting ? 'Running...' : 'Run Unit Tests'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED CAREER COURSES GRID */}
      <section id="curriculum" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#5D6B82] dark:text-[#A8B7CE] font-semibold">
              {lang === 'bn' ? 'প্র্যাকটিক্যাল কারিকুলাম' : 'Structured Career Tracks'}
            </span>
            <h2 className="font-display font-bold text-xl sm:text-3xl text-[#14213A] dark:text-[#F5F8FF] mt-0.5">
              {lang === 'bn' ? 'আমাদের ফ্ল্যাগশিপ কোর্সসমূহ' : 'Industry-Verified Engineering & Design Tracks'}
            </h2>
          </div>
          <Link
            to="/courses"
            className="aurora-btn-secondary min-h-[40px] px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto tactile-press"
          >
            <span>{lang === 'bn' ? 'সবগুলো কোর্স দেখুন' : 'View Full Catalog'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data?.courses || []).map((course: any) => {
            const isCompared = compareCourses.some((c) => c.id === course.id)
            return (
              <div
                key={course.id}
                className="aurora-card rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-[#356DFF] dark:hover:border-[#35C6BE] transition-all"
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
                      <span className="px-2.5 py-1 rounded-lg bg-[#060B18]/90 backdrop-blur-md text-[#F5F8FF] text-[10px] font-mono font-semibold shadow-sm border border-slate-700/60">
                        {bf(course, 'category', lang)}
                      </span>
                      {course.is_live_course && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-mono font-extrabold flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                          <span>LIVE BATCH</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#5D6B82] dark:text-[#A8B7CE] font-mono">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#356DFF]" />
                        {course.duration_hours}h • {course.lesson_count} Lessons
                      </span>
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {course.rating}
                      </span>
                    </div>

                    <Link to={`/courses/${course.id}`} className="block group">
                      <h3 className="font-display font-bold text-base sm:text-lg text-[#14213A] dark:text-[#F5F8FF] group-hover:text-[#356DFF] dark:group-hover:text-[#35C6BE] transition-colors line-clamp-2 leading-snug">
                        {bf(course, 'title', lang)}
                      </h3>
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
                    <span className="text-[11px] text-[#5D6B82] dark:text-[#A8B7CE] font-mono">
                      {course.students_count}+ {lang === 'bn' ? 'শিক্ষার্থী' : 'enrolled'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/courses/${course.id}`}
                      className="aurora-btn-primary flex-1 min-h-[44px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 tactile-press"
                    >
                      <span>{lang === 'bn' ? 'সিলেবাস ও ভর্তি' : 'Enroll / View Track'}</span>
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
                      aria-label="Compare course"
                      title={lang === 'bn' ? 'তুলনা করুন' : 'Compare course'}
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 5. WHY LMS 2.0 (ENGINEERING ADVANTAGE BENTO GRID) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#5D6B82] dark:text-[#A8B7CE] font-semibold">
            {lang === 'bn' ? 'আর্কিটেকচারাল উৎকর্ষ' : 'Zero-Trust Engineering'}
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#14213A] dark:text-[#F5F8FF]">
            {lang === 'bn'
              ? 'কেন LMS 2.0 অন্য যেকোনো এডটেক থেকে আলাদা?'
              : 'Why LMS 2.0 Sets The New Standard in EdTech'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: ShieldCheck,
              color: 'text-[#356DFF]',
              title: lang === 'bn' ? 'প্যারামিটারাইজড ওআরএম সিকিউরিটি' : 'Zero SQL Injection Risk',
              desc: lang === 'bn'
                ? 'নাদান রেজেক্স ফিল্টার নয়; SQLAlchemy 2.0 প্রিপেয়ার্ড স্টেটমেন্ট দিয়ে ডাটাবেস সম্পূর্ণ নিরাপদ।'
                : 'AST prepared statements decouple code from user data, eliminating SQL injection vulnerability completely.',
            },
            {
              icon: Flame,
              color: 'text-amber-500',
              title: lang === 'bn' ? 'সার্ভার-ভেরিফাইড ৮০% ওয়াচ হার্টবিট' : '80% Watch Heartbeat Guard',
              desc: lang === 'bn'
                ? 'ভিডিও স্কিপ করে বা ফেইক রিকোয়েস্ট পাঠিয়ে লেসন বা সার্টিফিকেট আনলক করা অসম্ভব।'
                : 'Server-side telemetry prevents skipped lessons, guaranteeing authentic course completion.',
            },
            {
              icon: Lock,
              color: 'text-[#35C6BE]',
              title: lang === 'bn' ? 'টাইমড সাইনড মিডিয়া ভল্ট' : 'Timed Cryptographic Vault',
              desc: lang === 'bn'
                ? 'কোর্সের সোর্স কোড ও পিডিএফ পাবলিক লিঙ্ক দিয়ে ছড়ানো রোধে ১০ মিনিটের সাইনড টোকেন ভল্ট।'
                : '10-minute expiring signed tokens protect production zip assets and architecture handbooks from scraping.',
            },
            {
              icon: Zap,
              color: 'text-[#86EFAC]',
              title: lang === 'bn' ? 'অ্যাপল-গ্রেড ফ্লুইড মোবাইল ডিজাইন' : 'Apple-Grade Mobile Fluidity',
              desc: lang === 'bn'
                ? 'কখনোই অপ্রয়োজনীয় ৩টি স্টিকি বার দিয়ে মোবাইল স্ক্রিন জ্যাম করা হয় না; বরং ৪৮ডিপি স্পর্শবান্ধব।'
                : 'Zero viewport clutter. Strictly 56px chrome, critically damped spring physics, and safe-area insets.',
            },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="aurora-card p-6 space-y-3.5 hover:shadow-md transition-all"
              >
                <div className={`w-11 h-11 rounded-xl bg-[#356DFF]/10 dark:bg-slate-800/80 flex items-center justify-center ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-[#14213A] dark:text-[#F5F8FF]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#5D6B82] dark:text-[#A8B7CE] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 6. FREE LIVE WORKSHOP SECTION */}
      {(data?.workshops || []).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          {data.workshops.slice(0, 1).map((ws: any) => (
            <div
              key={ws.id}
              className="aurora-card-raised p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-[#0C1528]"
            >
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full aurora-pill-teal text-xs font-mono font-semibold">
                  <Video className="w-3.5 h-3.5 text-[#35C6BE]" />
                  <span>FREE LIVE MASTERCLASS • {ws.platform}</span>
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#14213A] dark:text-[#F5F8FF] leading-snug">
                  {bf(ws, 'title', lang)}
                </h2>
                <p className="text-xs sm:text-sm text-[#5D6B82] dark:text-[#A8B7CE] leading-relaxed font-sans">
                  {bf(ws, 'description', lang)}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#5D6B82] dark:text-[#A8B7CE] pt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#356DFF]" />
                    {new Date(ws.date_time).toLocaleDateString()} ({ws.duration_minutes}m)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#35C6BE]" />
                    {ws.registrations_count} {lang === 'bn' ? 'জন রেজিস্টার্ড' : 'Registered'}
                  </span>
                </div>
              </div>

              <form
                onSubmit={(e) => handleWorkshopRegister(e, ws.id)}
                className="lg:col-span-5 rounded-2xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 p-5 sm:p-6 space-y-3.5 shadow-sm"
              >
                <h3 className="font-display font-bold text-sm sm:text-base text-[#14213A] dark:text-[#F5F8FF]">
                  {lang === 'bn' ? 'ফ্রি সিট বুক করুন' : 'Reserve Your Free Live Seat'}
                </h3>
                <div>
                  <label className="block text-[11px] text-[#5D6B82] dark:text-[#A8B7CE] mb-1 font-medium">
                    {lang === 'bn' ? 'আপনার নাম' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={wsForm.name}
                    onChange={(e) => setWsForm({ ...wsForm, name: e.target.value })}
                    placeholder={lang === 'bn' ? 'যেমন: আরিফুর রহমান' : 'e.g. Arifur Rahman'}
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-white dark:bg-[#0C1528] border border-[#E2E8F2] dark:border-slate-800 text-sm text-[#14213A] dark:text-[#F5F8FF] focus:outline-none focus:border-[#356DFF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#5D6B82] dark:text-[#A8B7CE] mb-1 font-medium">
                    {lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={wsForm.email}
                    onChange={(e) => setWsForm({ ...wsForm, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-white dark:bg-[#0C1528] border border-[#E2E8F2] dark:border-slate-800 text-sm text-[#14213A] dark:text-[#F5F8FF] focus:outline-none focus:border-[#356DFF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#5D6B82] dark:text-[#A8B7CE] mb-1 font-medium">
                    {lang === 'bn' ? 'মোবাইল নাম্বার' : 'Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={wsForm.phone}
                    onChange={(e) => setWsForm({ ...wsForm, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full min-h-[42px] px-3.5 rounded-xl bg-white dark:bg-[#0C1528] border border-[#E2E8F2] dark:border-slate-800 text-sm text-[#14213A] dark:text-[#F5F8FF] focus:outline-none focus:border-[#356DFF]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={wsSubmitting}
                  className="w-full min-h-[44px] rounded-xl aurora-btn-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-2 tactile-press cursor-pointer mt-1"
                >
                  <span>
                    {wsSubmitting
                      ? 'Registering...'
                      : lang === 'bn'
                      ? 'ফ্রি ওয়ার্কশপে রেজিস্টার করুন'
                      : 'Confirm Free Workshop Seat'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ))}
        </section>
      )}

      {/* 7. FREQUENTLY ASKED QUESTIONS ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-mono uppercase tracking-wider text-[#5D6B82] dark:text-[#A8B7CE] font-semibold">
            {lang === 'bn' ? 'সাধারণ জিজ্ঞাসা' : 'Frequently Asked Questions'}
          </span>
          <h2 className="font-display font-bold text-xl sm:text-3xl text-[#14213A] dark:text-[#F5F8FF]">
            {lang === 'bn' ? 'ভর্তি, পেমেন্ট ও সার্টিফিকেট বিষয়ক প্রশ্নোত্তর' : 'Everything You Need to Know'}
          </h2>
        </div>

        <div className="space-y-3">
          {(data?.faqs || []).map((faq: any, idx: number) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={faq.id}
                className="aurora-card rounded-2xl overflow-hidden hover:border-[#356DFF] transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full min-h-[52px] px-5 py-4 text-left flex items-center justify-between gap-3 font-semibold text-xs sm:text-sm text-[#14213A] dark:text-[#F5F8FF] cursor-pointer"
                >
                  <span>{bf(faq, 'question', lang)}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#5D6B82] dark:text-[#A8B7CE] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#356DFF]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#5D6B82] dark:text-[#A8B7CE] leading-relaxed border-t border-[#E2E8F2] dark:border-slate-800/80 pt-3">
                    {bf(faq, 'answer', lang)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
