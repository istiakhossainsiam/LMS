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
    <section className="relative pt-6 sm:pt-14 pb-12 sm:pb-20 overflow-x-clip min-h-[640px]">
      {/* 1. Atmospheric Learning Horizon Base Layer */}
      <HeroBackground />

      {/* 2. Interactive Three.js + Ammo.js 3D Physics Canvas Layer */}
      <div className="absolute inset-0 z-[2] overflow-hidden">
        <ThreeHeroCanvas />
      </div>

      {/* 3. Centered Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pointer-events-none">
        <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Eyebrow Badge Pill with Signature Architectural Coordinates */}
          <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111F36]/90 backdrop-blur-md border border-slate-800 text-slate-300 text-xs font-mono shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-slate-300">
              {lang === 'bn' ? 'ঢাকা [২৩.৮১° উ, ৯০.৪১° পূ] • ট্রেনিং পণ্ডিত একাডেমি' : 'Dhaka [23.81° N, 90.41° E] • TrainingPundit Academy'}
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="font-display font-bold text-3xl sm:text-5xl md:text-6xl lg:text-[58px] text-[#F5F8FF] leading-[1.2] sm:leading-[1.15] tracking-tight pointer-events-auto select-none">
            {lang === 'bn' ? (
              <>
                শিখুন নিজের গতিতে,<br className="hidden sm:inline" />{' '}
                <span className="text-[#35C6BE]">এগিয়ে যান আত্মবিশ্বাসে</span>
              </>
            ) : (
              <>
                Learn at your own pace,<br className="hidden sm:inline" />{' '}
                <span className="text-[#35C6BE]">advance with confidence</span>
              </>
            )}
          </h1>

          {/* Value Proposition Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-[#A8B7CE] max-w-2xl mx-auto font-normal font-sans leading-relaxed pointer-events-auto">
            {lang === 'bn'
              ? 'কোর্স, লাইভ ক্লাস, অ্যাসাইনমেন্ট ও শেখার অগ্রগতি—সব এক জায়গায়। নিজের লক্ষ্য অনুযায়ী শেখা শুরু করুন, আর শেষ করা পাঠের পরের ধাপটি সহজেই খুঁজে নিন।'
              : 'Courses, live classes, assignments, and learning progress—all in one place. Start learning according to your goals, and seamlessly pick up where you left off.'}
          </p>

          {/* Action CTAs */}
          <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto min-h-[46px] px-7 rounded-xl bg-[#356DFF] hover:bg-[#4B7EFF] text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2 tactile-press shadow-xs transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === 'bn' ? 'শেখা চালিয়ে যান' : 'Continue learning'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/courses"
                className="w-full sm:w-auto min-h-[46px] px-7 rounded-xl bg-[#356DFF] hover:bg-[#4B7EFF] text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2 tactile-press shadow-xs transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>{lang === 'bn' ? 'কোর্স ক্যাটালগ' : 'Explore courses'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <a
              href="#curriculum"
              onClick={scrollToCurriculum}
              className="w-full sm:w-auto min-h-[46px] px-6 rounded-xl bg-[#111F36]/90 hover:bg-[#162744] backdrop-blur-sm border border-slate-800 text-[#F5F8FF] font-medium text-sm sm:text-base flex items-center justify-center gap-2 tactile-press transition-colors"
            >
              <Video className="w-4 h-4 text-slate-400" />
              <span>{lang === 'bn' ? 'কীভাবে কাজ করে' : 'How it works'}</span>
            </a>
          </div>

          {/* Trust Metrics Strip */}
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold tabular-nums text-[#F5F8FF]">4.95/5</span>
              <span>rating</span>
            </div>

            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="font-bold tabular-nums text-[#F5F8FF]">15,400+</span>
              <span>{lang === 'bn' ? 'গ্র্যাজুয়েট' : 'graduates'}</span>
            </div>

            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span className="font-bold tabular-nums text-[#F5F8FF]">50+</span>
              <span>{lang === 'bn' ? 'হায়ার পার্টনার' : 'hiring partners'}</span>
            </div>

            <div className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-medium text-slate-300">OWASP Zero-Trust</span>
            </div>
          </div>

          {/* 1-Click Interactive Role Sandbox Dock */}
          <div className="pointer-events-auto pt-3 max-w-xl mx-auto space-y-2 animate-hero-4">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? '১-ক্লিক লাইভ রোল ট্রায়াল:' : '1-click role sandbox:'}</span>
            </div>
            <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() =>
                  onDemoLogin('student@trainingpundit.com', 'Student@1234', '/learn/1')
                }
                className="min-h-[38px] px-3.5 rounded-xl border border-slate-700/80 bg-[#111F36]/90 hover:border-[#356DFF] text-xs font-medium text-[#F5F8FF] whitespace-nowrap flex items-center gap-2 tactile-press cursor-pointer shrink-0 shadow-xs"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                <span>{lang === 'bn' ? 'স্টুডেন্ট ক্লাসরুম' : 'Student player'}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onDemoLogin('trainer@trainingpundit.com', 'Trainer@1234', '/trainer')
                }
                className="min-h-[38px] px-3.5 rounded-xl border border-slate-700/80 bg-[#111F36]/90 hover:border-[#356DFF] text-xs font-medium text-[#F5F8FF] whitespace-nowrap flex items-center gap-2 tactile-press cursor-pointer shrink-0 shadow-xs"
              >
                <Users className="w-3.5 h-3.5 text-[#356DFF]" />
                <span>{lang === 'bn' ? 'ট্রেইনার স্টুডিও' : 'Trainer studio'}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onDemoLogin('admin@trainingpundit.com', 'Admin@1234', '/admin')
                }
                className="min-h-[38px] px-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-medium whitespace-nowrap flex items-center gap-2 tactile-press cursor-pointer shrink-0 shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'bn' ? 'অ্যাডমিন কনসোল' : 'Admin console'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Emerging Product Dashboard Preview */}
        <div className="mt-8 sm:mt-14 animate-hero-5 pointer-events-auto">
          <DashboardPreview lang={lang} onDemoLogin={onDemoLogin} />
        </div>
      </div>
    </section>
  )
}
