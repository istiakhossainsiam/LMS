import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Play,
  ShieldCheck,
  Star,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import { HeroBackground } from './HeroBackground'
import { DashboardPreview } from './DashboardPreview'
import { ThreeHeroCanvas } from '../three/ThreeHeroCanvas'
import { ErrorBoundary } from '../common/ErrorBoundary'

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
    <section className="relative pt-6 sm:pt-10 pb-8 sm:pb-10 overflow-x-clip min-h-[640px] bg-[#FBF3DC] dark:bg-[#0A1E33]">
      {/* 1. Atmospheric Learning Horizon Base Layer (dark theme only) */}
      <div className="hidden dark:block"><HeroBackground /></div>

      {/* 2. Interactive Three.js + Ammo.js 3D Physics Canvas Layer */}
      <div className="absolute inset-0 z-[2] overflow-hidden hidden dark:block">
        <ErrorBoundary>
          <ThreeHeroCanvas />
        </ErrorBoundary>
      </div>

      {/* 3. Centered Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pointer-events-none">
        <div className="text-center max-w-4xl mx-auto space-y-5 sm:space-y-6">
          {/* Eyebrow Badge Pill with Signature Architectural Coordinates */}
          <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E9D9B4] dark:bg-[#16324F]/90 backdrop-blur-md border border-[#E0D3AF] dark:border-slate-800 text-[#6B7280] dark:text-slate-300 text-xs font-mono shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[#6B7280] dark:text-slate-300">
              {lang === 'bn' ? 'ঢাকা [২৩.৮১° উ, ৯০.৪১° পূ] • ট্রেনিং পণ্ডিত একাডেমি' : 'Dhaka [23.81° N, 90.41° E] • TrainingPundit Academy'}
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="font-display font-bold text-3xl sm:text-5xl md:text-6xl lg:text-[58px] text-[#0F2A44] dark:text-[#FFF7E8] leading-[1.2] sm:leading-[1.15] tracking-tight pointer-events-auto select-none">
            {lang === 'bn' ? (
              <>
                শিখুন নিজের গতিতে,<br className="hidden sm:inline" />{' '}
                <span className="text-[#F97316] dark:text-[#F97316]">এগিয়ে যান আত্মবিশ্বাসে</span>
              </>
            ) : (
              <>
                Learn at your own pace,<br className="hidden sm:inline" />{' '}
                <span className="text-[#F97316] dark:text-[#F97316]">advance with confidence</span>
              </>
            )}
          </h1>

          {/* Value Proposition Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-[#6B7280] dark:text-[#D9CDB8] max-w-2xl mx-auto font-normal font-sans leading-relaxed pointer-events-auto">
            {lang === 'bn'
              ? 'কোর্স, লাইভ ক্লাস, অ্যাসাইনমেন্ট ও শেখার অগ্রগতি—সব এক জায়গায়। নিজের লক্ষ্য অনুযায়ী শেখা শুরু করুন, আর শেষ করা পাঠের পরের ধাপটি সহজেই খুঁজে নিন।'
              : 'Courses, live classes, assignments, and learning progress—all in one place. Start learning according to your goals, and seamlessly pick up where you left off.'}
          </p>

          {/* Action CTAs */}
          <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto min-h-[46px] px-7 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-[#FBF3DC] font-medium text-sm sm:text-base flex items-center justify-center gap-2 tactile-press shadow-xs transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === 'bn' ? 'শেখা চালিয়ে যান' : 'Continue learning'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/courses"
                className="w-full sm:w-auto min-h-[46px] px-7 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-[#FBF3DC] font-medium text-sm sm:text-base flex items-center justify-center gap-2 tactile-press shadow-xs transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>{lang === 'bn' ? 'কোর্স ক্যাটালগ' : 'Explore courses'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <a
              href="#curriculum"
              onClick={scrollToCurriculum}
              className="w-full sm:w-auto min-h-[46px] px-6 rounded-xl bg-[#FBF3DC] dark:bg-[#16324F]/90 hover:bg-[#E9D9B4] dark:hover:bg-[#16324F] backdrop-blur-sm border border-[#E0D3AF] dark:border-slate-800 text-[#0F2A44] dark:text-[#FFF7E8] font-medium text-sm sm:text-base flex items-center justify-center gap-2 tactile-press transition-colors"
            >
              <Video className="w-4 h-4 text-slate-400" />
              <span>{lang === 'bn' ? 'কীভাবে কাজ করে' : 'How it works'}</span>
            </a>
          </div>

          {/* Trust Metrics Strip */}
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-4 py-4 rounded-2xl bg-[#0F2A44] dark:bg-[#0A1E33] border border-[#16324F] text-xs sm:text-sm text-[#D9CDB8] dark:text-[#D9CDB8] font-mono">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold tabular-nums text-[#FBF3DC] dark:text-[#FFF7E8]">4.95/5</span>
              <span>rating</span>
            </div>

            <div className="w-1 h-1 rounded-full bg-[#16324F] dark:bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#D9CDB8]" />
              <span className="font-bold tabular-nums text-[#FBF3DC] dark:text-[#FFF7E8]">15,400+</span>
              <span>{lang === 'bn' ? 'গ্র্যাজুয়েট' : 'graduates'}</span>
            </div>

            <div className="w-1 h-1 rounded-full bg-[#16324F] dark:bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#D9CDB8]" />
              <span className="font-bold tabular-nums text-[#FBF3DC] dark:text-[#FFF7E8]">50+</span>
              <span>{lang === 'bn' ? 'হায়ার পার্টনার' : 'hiring partners'}</span>
            </div>

            <div className="w-1 h-1 rounded-full bg-[#16324F] dark:bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-medium text-[#D9CDB8] dark:text-[#D9CDB8]">OWASP Zero-Trust</span>
            </div>
          </div>

          {/* 1-Click Interactive Role Sandbox Dock */}
          <div className="pointer-events-auto pt-3 pb-3 px-4 max-w-2xl mx-auto space-y-2 animate-hero-4 rounded-2xl bg-[#0F2A44] dark:bg-[#0A1E33] border border-[#16324F]">
            <div className="text-[11px] font-mono text-[#D9CDB8] dark:text-[#D9CDB8] flex items-center justify-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? '১-ক্লিক লাইভ রোল ট্রায়াল:' : '1-click role sandbox:'}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center">
              <button
                type="button"
                onClick={() =>
                  onDemoLogin('student@trainingpundit.com', 'Student@1234', '/learn/1')
                }
                className="min-h-[38px] px-3.5 rounded-xl border border-[#E0D3AF] dark:border-slate-700/80 bg-[#FBF3DC] dark:bg-[#16324F]/90 hover:border-[#F97316] text-xs font-medium text-[#0F2A44] dark:text-[#FFF7E8] whitespace-nowrap flex items-center justify-center gap-2 tactile-press cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                <span>{lang === 'bn' ? 'স্টুডেন্ট ক্লাসরুম' : 'Student player'}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onDemoLogin('trainer@trainingpundit.com', 'Trainer@1234', '/trainer')
                }
                className="min-h-[38px] px-3.5 rounded-xl border border-[#E0D3AF] dark:border-slate-700/80 bg-[#FBF3DC] dark:bg-[#16324F]/90 hover:border-[#F97316] text-xs font-medium text-[#0F2A44] dark:text-[#FFF7E8] whitespace-nowrap flex items-center justify-center gap-2 tactile-press cursor-pointer shadow-xs"
              >
                <Users className="w-3.5 h-3.5 text-[#F97316]" />
                <span>{lang === 'bn' ? 'ট্রেইনার স্টুডিও' : 'Trainer studio'}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onDemoLogin('admin@trainingpundit.com', 'Admin@1234', '/admin')
                }
                className="min-h-[38px] px-3.5 rounded-xl border border-[#D97706]/40 dark:border-amber-500/40 bg-[#D97706]/10 dark:bg-amber-500/10 text-[#B45309] dark:text-amber-300 text-xs font-medium whitespace-nowrap flex items-center justify-center gap-2 tactile-press cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'bn' ? 'অ্যাডমিন কনসোল' : 'Admin console'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Emerging Product Dashboard Preview */}
        <div className="mt-6 sm:mt-8 animate-hero-5 pointer-events-auto">
          <DashboardPreview lang={lang} onDemoLogin={onDemoLogin} />
        </div>
      </div>
    </section>
  )
}
