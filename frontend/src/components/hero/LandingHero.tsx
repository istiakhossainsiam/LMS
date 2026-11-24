import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import { HeroBackground } from './HeroBackground'
import { DashboardPreview } from './DashboardPreview'

interface LandingHeroProps {
  lang: 'bn' | 'en'
  user: any | null
  onDemoLogin: (email: string, pass: string, dest: string) => void
  onExploreClick?: () => void
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  lang,
  user,
  onDemoLogin,
  onExploreClick,
}) => {
  const scrollToCurriculum = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById('curriculum') || document.getElementById('how-it-works')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.hash = '#curriculum'
    }
  }

  return (
    <section className="relative pt-6 sm:pt-14 pb-12 sm:pb-20 overflow-x-clip">
      {/* 1. Atmospheric Learning Horizon Background */}
      <HeroBackground />

      {/* 2. Centered Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Eyebrow Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111F36]/90 border border-sky-400/30 text-[#86EFAC] text-xs font-mono font-medium shadow-md animate-hero-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="tracking-wide text-slate-100 font-semibold">
              {lang === 'bn' ? 'আপনার শেখার পরবর্তী ধাপ' : 'The Next Step In Your Learning'}
            </span>
            <span className="text-[#35C6BE] hidden sm:inline">•</span>
            <span className="text-[#35C6BE] hidden sm:inline font-mono">LMS 2.0</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-[62px] text-[#F5F8FF] leading-[1.2] sm:leading-[1.12] tracking-tight animate-hero-2">
            {lang === 'bn' ? (
              <>
                শিখুন নিজের গতিতে,<br className="hidden sm:inline" />{' '}
                <span className="text-gradient-aurora">এগিয়ে যান আত্মবিশ্বাসে।</span>
              </>
            ) : (
              <>
                Learn at your own pace,<br className="hidden sm:inline" />{' '}
                <span className="text-gradient-aurora">Advance with confidence.</span>
              </>
            )}
          </h1>

          {/* Value Proposition Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-[#A8B7CE] max-w-2xl mx-auto font-normal font-sans leading-relaxed animate-hero-3">
            {lang === 'bn'
              ? 'কোর্স, লাইভ ক্লাস, অ্যাসাইনমেন্ট ও শেখার অগ্রগতি—সব এক জায়গায়। নিজের লক্ষ্য অনুযায়ী শেখা শুরু করুন, আর শেষ করা পাঠের পরের ধাপটি সহজেই খুঁজে নিন।'
              : 'Courses, live classes, assignments, and learning progress—all in one place. Start learning according to your goals, and seamlessly pick up where you left off.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-1 animate-hero-4">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-8 rounded-xl bg-gradient-to-r from-[#356DFF] to-[#2E5BE5] hover:from-[#4B7EFF] hover:to-[#356DFF] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 tactile-press shadow-lg shadow-blue-900/40"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === 'bn' ? 'শেখা চালিয়ে যান' : 'Continue Learning'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/courses"
                className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-8 rounded-xl bg-gradient-to-r from-[#356DFF] to-[#2E5BE5] hover:from-[#4B7EFF] hover:to-[#356DFF] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 tactile-press shadow-lg shadow-blue-900/40"
              >
                <BookOpen className="w-4 h-4" />
                <span>{lang === 'bn' ? 'কোর্স দেখুন' : 'Explore Courses'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <a
              href="#curriculum"
              onClick={scrollToCurriculum}
              className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-7 rounded-xl bg-[#111F36]/90 hover:bg-[#111F36] border border-slate-700/80 text-[#F5F8FF] font-semibold text-sm sm:text-base flex items-center justify-center gap-2 tactile-press"
            >
              <Video className="w-4 h-4 text-[#35C6BE]" />
              <span>{lang === 'bn' ? 'কীভাবে কাজ করে' : 'How It Works'}</span>
            </a>
          </div>

          {/* Trust Metrics Strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-7 pt-2 text-xs sm:text-sm text-[#A8B7CE] font-mono animate-hero-4">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-[#F5F8FF]">4.95/5</span>
              <span className="text-slate-400">Rating</span>
            </div>

            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#356DFF]" />
              <span className="font-bold text-[#F5F8FF]">15,400+</span>
              <span className="text-slate-400">{lang === 'bn' ? 'গ্র্যাজুয়েট' : 'Graduates'}</span>
            </div>

            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#35C6BE]" />
              <span className="font-bold text-[#F5F8FF]">50+</span>
              <span className="text-slate-400">{lang === 'bn' ? 'হায়ার পার্টনার' : 'Hiring Partners'}</span>
            </div>

            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-300">OWASP Zero-Trust</span>
            </div>
          </div>

          {/* 1-Click Interactive Role Sandbox Dock */}
          <div className="pt-3 max-w-xl mx-auto space-y-2 animate-hero-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1.5 font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? '১-ক্লিক লাইভ রোল ট্রায়াল:' : '1-Click Live Role Sandbox:'}</span>
            </div>
            <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() =>
                  onDemoLogin('student@learnwithmarufahmed.com', 'Student@1234', '/learn/1')
                }
                className="min-h-[38px] px-3.5 rounded-xl border border-slate-700/80 bg-[#111F36]/90 hover:border-[#356DFF] text-xs font-semibold text-[#F5F8FF] whitespace-nowrap flex items-center gap-2 tactile-press cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                <span>{lang === 'bn' ? 'স্টুডেন্ট ক্লাসরুম' : 'Student Player'}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onDemoLogin('trainer@learnwithmarufahmed.com', 'Trainer@1234', '/trainer')
                }
                className="min-h-[38px] px-3.5 rounded-xl border border-slate-700/80 bg-[#111F36]/90 hover:border-[#356DFF] text-xs font-semibold text-[#F5F8FF] whitespace-nowrap flex items-center gap-2 tactile-press cursor-pointer shrink-0"
              >
                <Users className="w-3.5 h-3.5 text-[#356DFF]" />
                <span>{lang === 'bn' ? 'ট্রেইনার স্টুডিও' : 'Trainer Studio'}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onDemoLogin('admin@learnwithmarufahmed.com', 'Admin@1234', '/admin')
                }
                className="min-h-[38px] px-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-bold whitespace-nowrap flex items-center gap-2 tactile-press cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'bn' ? 'অ্যাডমিন কনসোল' : 'Admin Console'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Emerging Product Dashboard Preview */}
        <div className="mt-8 sm:mt-14 animate-hero-5">
          <DashboardPreview lang={lang} onDemoLogin={onDemoLogin} />
        </div>
      </div>
    </section>
  )
}
