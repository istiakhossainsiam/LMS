import React, { useState } from 'react'
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  Flame,
  LayoutDashboard,
  Play,
  ShieldCheck,
  Sparkles,
  Trophy,
  Video,
  Zap,
} from 'lucide-react'

interface DashboardPreviewProps {
  lang?: 'bn' | 'en'
  onDemoLogin?: (email: string, pass: string, dest: string) => void
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({
  lang = 'bn',
  onDemoLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'classes' | 'assignments'>('overview')

  const tabs = [
    { id: 'overview', bn: 'ওভারভিউ', en: 'Overview', icon: LayoutDashboard },
    { id: 'courses', bn: 'আমার কোর্স', en: 'My Courses', icon: BookOpen },
    { id: 'classes', bn: 'লাইভ ক্লাস', en: 'Live Classes', icon: Video },
    { id: 'assignments', bn: 'অ্যাসাইনমেন্ট', en: 'Assignments', icon: FileText },
  ] as const

  const handleResumeClick = () => {
    if (onDemoLogin) {
      onDemoLogin('student@learnwithmarufahmed.com', 'Student@1234', '/learn/1')
    } else {
      window.location.href = '/learn/1'
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto rounded-2xl sm:rounded-3xl bg-[#0C1528] border border-slate-800/90 shadow-[0_-10px_40px_-5px_rgba(53,109,255,0.22),0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden transition-all text-slate-100">
      {/* 1. Luminous Horizon Top Glow Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#356DFF] to-[#35C6BE] opacity-90" />

      {/* 2. Top Bar & Telemetry Strip */}
      <div className="px-3.5 sm:px-6 py-3 border-b border-slate-800/80 bg-[#090F1E]/95 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Window Dots & Platform Status */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-400 hidden sm:inline">
            learnwithmaruf.com/dashboard
          </span>
          <span className="px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-800/60 text-[#35C6BE] text-[10px] font-mono font-bold tracking-wider uppercase">
            {lang === 'bn' ? 'স্টুডেন্ট ক্লাসরুম ভিউ' : 'Student Studio'}
          </span>
        </div>

        {/* Right: Live Telemetry Badges */}
        <div className="flex items-center gap-2 sm:gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="font-semibold">{lang === 'bn' ? 'সিঙ্গেল-ডিভাইস লক অন' : 'Zero-Trust Lock'}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111F36] border border-slate-700/60 text-slate-300">
            <Clock className="w-3 h-3 text-[#356DFF]" />
            <span>{lang === 'bn' ? 'হার্টবিট: ৪২ms' : 'Sync: 42ms'}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/50 border border-amber-800/50 text-amber-300 font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{lang === 'bn' ? '৭ দিনের স্ট্রিক' : '7d Streak'}</span>
          </div>
        </div>
      </div>

      {/* 3. Internal Navigation Tabs */}
      <div className="px-3.5 sm:px-6 pt-3 pb-2 border-b border-slate-800/80 bg-[#0C1528] flex items-center gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isSelected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 whitespace-nowrap tactile-press cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#356DFF] text-white font-semibold shadow-md shadow-blue-900/40'
                  : 'bg-[#111F36]/80 text-[#A8B7CE] hover:text-[#F5F8FF] hover:bg-[#111F36] border border-slate-800/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? tab.bn : tab.en}</span>
            </button>
          )
        })}
      </div>

      {/* 4. Active Dashboard Surface */}
      <div className="p-3.5 sm:p-6 lg:p-7 space-y-5 sm:space-y-6">
        {/* Top Row: Hero Resume Learning Card + Live Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Main Course Progress Hero (Col 7) */}
          <div className="lg:col-span-7 rounded-2xl bg-[#111F36] border border-slate-800/90 p-4 sm:p-6 space-y-4 shadow-lg relative overflow-hidden">
            {/* Subtle Aurora Ambient Corner Glow */}
            <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#356DFF]/15 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#356DFF]/20 border border-[#356DFF]/30 text-[#86EFAC] text-[11px] font-mono font-bold">
                {lang === 'bn' ? 'চলমান কোর্স • ব্যাচ ৪' : 'Active Track • Batch 4'}
              </span>
              <span className="text-xs font-mono font-bold text-[#35C6BE]">
                {lang === 'bn' ? '৬৮% সম্পন্ন' : '68% Completed'}
              </span>
            </div>

            <div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-[#F5F8FF] leading-snug">
                {lang === 'bn'
                  ? 'প্রোডাকশন-গ্রেড ক্লাউড ও সফটওয়্যার ইঞ্জিনিয়ারিং'
                  : 'Production-Grade Cloud & Software Engineering'}
              </h3>
              <p className="text-xs sm:text-sm text-[#A8B7CE] mt-1 line-clamp-2">
                {lang === 'bn'
                  ? 'পরবর্তী পাঠ: মডিউল ১৯ — ডিস্ট্রিবিউটেড মেসেজ কিউ ও রেডিস ক্লাস্টার আর্কিটেকচার'
                  : 'Next: Module 19 — Distributed Message Queues & Redis Cluster Architecture'}
              </p>
            </div>

            {/* Precision Gradient Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2 rounded-full bg-slate-900/90 overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#356DFF] via-[#35C6BE] to-[#86EFAC] transition-all duration-1000"
                  style={{ width: '68%' }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{lang === 'bn' ? '১৮ / ২৬ টি পাঠ শেষ' : '18 of 26 lessons done'}</span>
                <span>{lang === 'bn' ? '৩টি প্রোজেক্ট জমা দেওয়া হয়েছে' : '3 projects submitted'}</span>
              </div>
            </div>

            {/* Resume Button */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResumeClick}
                className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-[#356DFF] to-[#2E5BE5] hover:from-[#4B7EFF] hover:to-[#356DFF] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 tactile-press cursor-pointer shadow-md shadow-blue-900/40"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === 'bn' ? 'পাঠ চালিয়ে যান (Resume)' : 'Continue Learning'}</span>
              </button>

              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#35C6BE]" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'স্বয়ংক্রিয় প্রগ্রেস সিঙ্ক' : 'Auto-synced'}</span>
              </span>
            </div>
          </div>

          {/* Side Stack: Live Class & Assignment Cards (Col 5) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Class Notification Card */}
            <div className="rounded-2xl bg-[#111F36] border border-slate-800/90 p-4 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                  <Video className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'আজকের লাইভ সেশন' : 'Next Live Session'}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-950/70 border border-amber-800/50 text-amber-300 font-mono text-[10px] font-bold">
                  {lang === 'bn' ? 'রাত ৯:০০ টা' : '9:00 PM'}
                </span>
              </div>
              <h4 className="font-semibold text-xs sm:text-sm text-[#F5F8FF] leading-snug">
                {lang === 'bn'
                  ? 'সিস্টেম ডিজাইন ডিপ-ডাইভ: মাইক্রোসার্ভিস লোড ব্যালেন্সিং'
                  : 'System Design Deep-Dive: Microservice Load Balancing'}
              </h4>
              <p className="text-[11px] text-[#A8B7CE]">
                {lang === 'bn'
                  ? 'প্রভাষক: মারুফ আহমেদ • জুম রুম ৮:৪৫ এ ওপেন হবে'
                  : 'Instructor: Maruf Ahmed • Room opens at 8:45 PM'}
              </p>
            </div>

            {/* Upcoming Assignment Tracker */}
            <div className="rounded-2xl bg-[#111F36] border border-slate-800/90 p-4 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#35C6BE]">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'কোডিং ল্যাব অ্যাসাইনমেন্ট' : 'CodeLab Assignment'}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-800/50 text-[#86EFAC] font-mono text-[10px] font-bold">
                  {lang === 'bn' ? '২ দিন বাকি' : '2 days left'}
                </span>
              </div>
              <h4 className="font-semibold text-xs sm:text-sm text-[#F5F8FF] leading-snug">
                {lang === 'bn'
                  ? 'অ্যাসাইনমেন্ট ৪: এএসটি প্যারামিটারাইজড সিকিউরিটি ফিল্টার'
                  : 'Assignment 4: AST Parameterized Security Filter'}
              </h4>
              <div className="flex items-center justify-between text-[11px] text-[#A8B7CE] pt-1">
                <span>{lang === 'bn' ? 'অটো-গ্রেডার: প্রস্তুত' : 'Auto-Grading: Ready'}</span>
                <span className="text-[#356DFF] font-semibold font-mono">+৫০ XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Key Student Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-800/80">
          {[
            {
              bn: 'সেশন ওয়াচটাইম',
              en: 'Watch Time',
              val: '৪৮.৫ ঘণ্টা',
              enVal: '48.5 hrs',
              sub: '৯৮% এটেনডেন্স',
            },
            {
              bn: 'সলভড চ্যালেঞ্জ',
              en: 'Solved Labs',
              val: '৩৪ টি',
              enVal: '34 Labs',
              sub: '১০০% টেস্ট পাস',
            },
            {
              bn: 'অর্জিত স্কিল ব্যাজ',
              en: 'Skill Badges',
              val: '৮ টি',
              enVal: '8 Badges',
              sub: 'ভেরিফায়েড ক্রেডেনশিয়াল',
            },
            {
              bn: 'লিডারবোর্ড র‍্যাংক',
              en: 'Leaderboard',
              val: '#৪',
              enVal: '#4',
              sub: 'টপ ৫% শিক্ষার্থীদের মধ্যে',
            },
          ].map((m, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#090F1E]/80 border border-slate-800/70 text-center"
            >
              <div className="font-display font-extrabold text-base sm:text-lg text-[#F5F8FF] tabular-nums">
                {lang === 'bn' ? m.val : m.enVal}
              </div>
              <div className="text-[11px] font-medium text-slate-300 mt-0.5 truncate">
                {lang === 'bn' ? m.bn : m.en}
              </div>
              <div className="text-[9px] font-mono text-[#35C6BE] mt-0.5 truncate">
                {m.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
