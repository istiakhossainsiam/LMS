import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Compass,
  GraduationCap,
  Home,
  Languages,
  Layers,
  LogOut,
  Moon,
  ShieldCheck,
  ShoppingBag,
  Sun,
  Trophy,
  User,
  Wrench,
  X,
  ArrowRight,
  FileText,
  Briefcase,
  Code2,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { useAppStore, bf } from '../../stores/useAppStore'

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    lang,
    toggleLang,
    theme,
    toggleTheme,
    user,
    clearAuth,
    compareCourses,
    toggleCompareCourse,
    isCompareDrawerOpen,
    setCompareDrawerOpen,
    toastMessage,
  } = useAppStore()

  const [isUserMenuOpen, setUserMenuOpen] = useState(false)
  const [isMoreMenuOpen, setMoreMenuOpen] = useState(false)

  // Auto-close dropdowns on navigation
  useEffect(() => {
    setUserMenuOpen(false)
    setMoreMenuOpen(false)
  }, [location.pathname])

  // Context Role Detection
  const isHomeRoute = location.pathname === '/'
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isTrainerRoute = location.pathname.startsWith('/trainer')
  const isStudentRoute = location.pathname.startsWith('/dashboard')
  const isPublicRoute = !isAdminRoute && !isTrainerRoute && !isStudentRoute

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const isMoreActive = ['/leaderboard', '/blog', '/verify-certificate'].some((p) =>
    location.pathname.startsWith(p)
  )

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // ignore
    }
    clearAuth()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF3DC] text-[#0F2A44] dark:bg-[#0A1E33] dark:text-slate-100 mb-safe-nav md:pb-0 overflow-x-clip">
      {/* Top Translucent Apple Glass Header — Context & Role Sensitive */}
      <header
        className="sticky top-0 z-40 bg-[#0F2A44] dark:bg-[#0A1E33] border-b border-[#16324F] shadow-sm transition-colors"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Identity — Changes dynamically with active Context */}
          {isAdminRoute ? (
            <Link
              to="/admin"
              className="flex items-center gap-2.5 tactile-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded-xl shrink-0 select-none"
            >
              <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl bg-[#F97316] text-[#FBF3DC] flex items-center justify-center shadow-xs shrink-0 font-bold">
                <ShieldCheck className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
              </div>
              <div className="leading-tight shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-sm sm:text-base tracking-tight text-[#FBF3DC] dark:text-[#FFF7E8] whitespace-nowrap">
                    {lang === 'bn' ? 'অ্যাডমিন কনসোল' : 'Admin Console'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-[#16324F] dark:bg-[#16324F] border border-[#16324F] text-[#D9CDB8] dark:text-[#D9CDB8] font-mono text-[9px] font-semibold">
                    Console
                  </span>
                </div>
                <span className="text-[10px] font-mono font-medium text-[#D9CDB8] dark:text-[#D9CDB8] whitespace-nowrap block">
                  Training Pundit • Management
                </span>
              </div>
            </Link>
          ) : isTrainerRoute ? (
            <Link
              to="/trainer"
              className="flex items-center gap-2.5 tactile-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded-xl shrink-0 select-none"
            >
              <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl bg-[#F97316] text-[#FBF3DC] flex items-center justify-center shadow-xs shrink-0 font-bold">
                <Wrench className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
              </div>
              <div className="leading-tight shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-sm sm:text-base tracking-tight text-[#FBF3DC] dark:text-[#FFF7E8] whitespace-nowrap">
                    {lang === 'bn' ? 'ইন্সট্রাক্টর স্টুডিও' : 'Trainer Studio'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-[#16324F] dark:bg-[#16324F] border border-[#16324F] text-[#D9CDB8] dark:text-[#D9CDB8] font-mono text-[9px] font-semibold">
                    Studio
                  </span>
                </div>
                <span className="text-[10px] font-mono font-medium text-[#D9CDB8] dark:text-[#D9CDB8] whitespace-nowrap block">
                  Training Pundit Authoring
                </span>
              </div>
            </Link>
          ) : isStudentRoute ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 tactile-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded-xl shrink-0 select-none"
            >
              <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl bg-[#F97316] text-[#FBF3DC] flex items-center justify-center shadow-xs shrink-0 font-bold">
                <BookOpen className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
              </div>
              <div className="leading-tight shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-sm sm:text-base tracking-tight text-[#FBF3DC] dark:text-[#FFF7E8] whitespace-nowrap">
                    {lang === 'bn' ? 'লার্নিং পোর্টাল' : 'Student Hub'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-[#16324F] dark:bg-[#16324F] border border-[#16324F] text-[#D9CDB8] dark:text-[#D9CDB8] font-mono text-[9px] font-semibold">
                    Classroom
                  </span>
                </div>
                <span className="text-[10px] font-mono font-medium text-[#D9CDB8] dark:text-[#D9CDB8] whitespace-nowrap block">
                  TrainingPundit Academy
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-2.5 tactile-press focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded-xl shrink-0 select-none"
            >
              <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl bg-[#F97316] text-[#FBF3DC] flex items-center justify-center shadow-xs shrink-0 border border-[#F97316]/50">
                <GraduationCap className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" aria-hidden="true" />
              </div>
              <div className="leading-tight shrink-0 hidden sm:block">
                <span className="font-display font-bold text-sm sm:text-base tracking-tight text-[#FBF3DC] dark:text-[#FFF7E8] whitespace-nowrap block">
                  {lang === 'bn' ? 'ট্রেনিং পণ্ডিত' : 'Training Pundit'}
                </span>
                <span className="text-[10px] font-mono font-medium text-[#F97316] dark:text-[#F97316] whitespace-nowrap block">
                  Cloud LMS 2.0
                </span>
              </div>
            </Link>
          )}

          {/* Desktop Primary Navigation — Context-Sensitive */}
          {isAdminRoute ? (
            /* Admin Center Navigation */
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0" aria-label="Admin Navigation">
              <span className="px-2.5 py-1 rounded-lg bg-[#F97316]/10 border border-[#F97316]/20 text-[#FB923C] dark:text-[#FB923C] font-mono text-xs font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                <span>Console mode</span>
              </span>
              <Link
                to="/trainer"
                className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap tactile-press text-[#D9CDB8] dark:text-[#D9CDB8] hover:text-[#FBF3DC] dark:hover:text-[#FFF7E8] hover:bg-[#16324F] dark:hover:bg-[#16324F]"
              >
                <Wrench className="w-3.5 h-3.5 text-[#F97316]" />
                <span>{lang === 'bn' ? 'ইন্সট্রাক্টর স্টুডিও' : 'Trainer studio'}</span>
              </Link>
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap tactile-press text-[#D9CDB8] dark:text-[#D9CDB8] hover:text-[#FBF3DC] dark:hover:text-[#FFF7E8] hover:bg-[#16324F] dark:hover:bg-[#16324F]"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#F97316]" />
                <span>{lang === 'bn' ? 'স্টুডেন্ট ভিউ' : 'Student view'}</span>
              </Link>
              <Link
                to="/courses"
                className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap tactile-press text-[#D9CDB8] dark:text-[#D9CDB8] hover:text-[#FBF3DC] dark:hover:text-[#FFF7E8] hover:bg-[#16324F] dark:hover:bg-[#16324F]"
              >
                <Compass className="w-3.5 h-3.5 text-[#D9CDB8]" />
                <span>{lang === 'bn' ? 'কোর্স ক্যাটালগ' : 'Course catalog'}</span>
              </Link>
            </nav>
          ) : isTrainerRoute ? (
            /* Trainer Studio Center Navigation */
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0" aria-label="Trainer Navigation">
              <span className="px-2.5 py-1 rounded-lg bg-[#F97316]/10 border border-[#F97316]/20 text-[#FB923C] dark:text-[#FB923C] font-mono text-xs font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                <span>Studio workspace</span>
              </span>
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap tactile-press text-[#D9CDB8] dark:text-[#D9CDB8] hover:text-[#FBF3DC] dark:hover:text-[#FFF7E8] hover:bg-[#16324F] dark:hover:bg-[#16324F]"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#F97316]" />
                <span>{lang === 'bn' ? 'লার্নিং ক্লাসরুম' : 'Student classroom'}</span>
              </Link>
              {(user?.is_staff || user?.is_superuser) && (
                <Link
                  to="/admin"
                  className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap tactile-press bg-[#F97316]/10 text-[#FB923C] dark:text-[#FB923C] hover:bg-[#F97316]/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>{lang === 'bn' ? 'অ্যাডমিন কনসোল' : 'Admin console'}</span>
                </Link>
              )}
              <Link
                to="/courses"
                className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap tactile-press text-[#D9CDB8] dark:text-[#D9CDB8] hover:text-[#FBF3DC] dark:hover:text-[#FFF7E8] hover:bg-[#16324F] dark:hover:bg-[#16324F]"
              >
                <Compass className="w-3.5 h-3.5 text-[#D9CDB8]" />
                <span>{lang === 'bn' ? 'কোর্স ক্যাটালগ' : 'Course catalog'}</span>
              </Link>
            </nav>
          ) : isStudentRoute ? (
            /* Student Learning Dashboard Center Navigation */
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0" aria-label="Student Navigation">
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold flex items-center gap-1.5 bg-[#F97316]/10 text-[#FB923C] dark:text-[#FB923C] border border-[#F97316]/20"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#F97316]" />
                <span>{lang === 'bn' ? 'আমার কোর্স ও অগ্রগতি' : 'My Courses'}</span>
              </Link>
              <Link
                to="/courses"
                className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap tactile-press text-[#D9CDB8] dark:text-[#D9CDB8] hover:text-[#FBF3DC] dark:hover:text-[#FFF7E8] hover:bg-[#16324F] dark:hover:bg-[#16324F]"
              >
                <Compass className="w-3.5 h-3.5 text-[#D9CDB8]" />
                <span>{lang === 'bn' ? 'কোর্স ক্যাটালগ' : 'Explore Courses'}</span>
              </Link>
              <Link
                to="/codelab"
                className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap tactile-press text-[#D9CDB8] dark:text-[#D9CDB8] hover:text-[#FBF3DC] dark:hover:text-[#FFF7E8] hover:bg-[#16324F] dark:hover:bg-[#16324F]"
              >
                <Code2 className="w-3.5 h-3.5 text-[#F97316]" />
                <span>{lang === 'bn' ? 'কোডল্যাব' : 'CodeLab'}</span>
              </Link>
              <Link
                to="/jobs"
                className="px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap tactile-press text-[#D9CDB8] dark:text-[#D9CDB8] hover:text-[#FBF3DC] dark:hover:text-[#FFF7E8] hover:bg-[#16324F] dark:hover:bg-[#16324F]"
              >
                <Briefcase className="w-3.5 h-3.5 text-[#F97316]" />
                <span>{lang === 'bn' ? 'জব ক্যাম্প' : 'Career Placement'}</span>
              </Link>
            </nav>
          ) : (
            /* Public Learning Platform Center Navigation */
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0" aria-label="Main Navigation">
              {[
                { to: '/courses', label: lang === 'bn' ? 'কোর্সসমূহ' : 'Courses', icon: Compass },
                { to: '/codelab', label: lang === 'bn' ? 'কোডল্যাব' : 'CodeLab', icon: Code2 },
                { to: '/jobs', label: lang === 'bn' ? 'ক্যারিয়ার' : 'Career', icon: Briefcase },
                { to: '/store', label: lang === 'bn' ? 'স্টোর' : 'Store', icon: ShoppingBag },
              ].map((item) => {
                const Icon = item.icon
                const active = isActive(item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap tactile-press transition-colors ${
                      active
                        ? 'bg-[#16324F] text-[#FBF3DC] dark:bg-[#16324F] dark:text-[#FFF7E8] font-bold'
                        : 'text-[#D9CDB8] dark:text-[#D9CDB8] hover:text-[#FBF3DC] dark:hover:text-[#FFF7E8] hover:bg-[#16324F] dark:hover:bg-[#16324F]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 stroke-[2]" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              {/* "More / এক্সপ্লোর" Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen(!isMoreMenuOpen)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-semibold flex items-center gap-1 whitespace-nowrap tactile-press transition-colors cursor-pointer ${
                    isMoreActive
                      ? 'bg-[#16324F] text-[#FBF3DC] dark:bg-[#16324F] dark:text-[#FFF7E8] font-bold'
                      : 'text-[#D9CDB8] dark:text-[#D9CDB8] hover:text-[#FBF3DC] dark:hover:text-[#FFF7E8] hover:bg-[#16324F] dark:hover:bg-[#16324F]'
                  }`}
                  aria-expanded={isMoreMenuOpen}
                  aria-label="More navigation options"
                >
                  <span>{lang === 'bn' ? 'আরও' : 'More'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isMoreMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isMoreMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMoreMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute left-0 mt-2 w-56 rounded-2xl apple-glass border border-slate-200/90 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      {[
                        {
                          to: '/leaderboard',
                          label: lang === 'bn' ? 'লিডারবোর্ড' : 'Leaderboard',
                          sub: 'XP & Coding Ranks',
                          icon: Trophy,
                        },
                        {
                          to: '/blog',
                          label: lang === 'bn' ? 'ব্লগ ও রিসোর্স' : 'Articles & Guides',
                          sub: 'Engineering Insights',
                          icon: FileText,
                        },
                        {
                          to: '/verify-certificate',
                          label: lang === 'bn' ? 'সার্টিফিকেট যাচাই' : 'Verify Certificate',
                          sub: 'QR Hash Check',
                          icon: ShieldCheck,
                        },
                      ].map((m) => {
                        const Icon = m.icon
                        const active = isActive(m.to)
                        return (
                          <Link
                            key={m.to}
                            to={m.to}
                            onClick={() => setMoreMenuOpen(false)}
                            className={`flex items-start gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                              active
                                ? 'bg-[#16324F] text-[#FBF3DC] dark:bg-[#16324F] dark:text-[#FFF7E8] font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            <Icon className="w-4 h-4 mt-0.5 text-[#F97316] shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold">{m.label}</div>
                              <div className="text-[10px] text-[#D9CDB8] dark:text-[#D9CDB8] font-mono">
                                {m.sub}
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </nav>
          )}

          {/* Right Controls: Role Actions, Live Site, Compare, Theme, User */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* 1-Click Fast Switch to Live Site (when inside Admin or Trainer console) */}
            {(isAdminRoute || isTrainerRoute) && (
              <Link
                to="/"
                className="h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-xl border border-[#16324F] bg-[#16324F] dark:bg-[#16324F] text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600 tactile-press shadow-2xs"
                title="View Live Platform"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#F97316]" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'লাইভ সাইট' : 'Live Site'}</span>
              </Link>
            )}

            {/* Direct Quick Role Navigation Pills when on Public/Student pages */}
            {!isAdminRoute && user && (
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                {(user.is_staff || user.is_superuser) && (
                  <Link
                    to="/admin"
                    className="h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-xl bg-[#F97316]/15 border border-[#F97316]/30 text-[#FB923C] dark:text-[#FB923C] text-xs font-semibold flex items-center gap-1.5 tactile-press shadow-2xs hover:bg-[#F97316]/25"
                    title="Executive Admin Console"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>{lang === 'bn' ? 'অ্যাডমিন' : 'Admin'}</span>
                  </Link>
                )}

                {(user.is_trainer || user.is_staff || user.is_superuser) && !isTrainerRoute && (
                  <Link
                    to="/trainer"
                    className="h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-xl bg-[#F97316]/15 border border-[#F97316]/30 text-[#FB923C] dark:text-[#FB923C] text-xs font-semibold flex items-center gap-1.5 tactile-press shadow-2xs hover:bg-[#F97316]/25"
                    title="Instructor Studio"
                  >
                    <Wrench className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>{lang === 'bn' ? 'স্টুডিও' : 'Studio'}</span>
                  </Link>
                )}

                {!isStudentRoute && (
                  <Link
                    to="/dashboard"
                    className="h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-xl border border-[#16324F] bg-[#16324F] dark:bg-[#16324F] text-xs font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-200 hover:border-slate-400 tactile-press shadow-2xs"
                    title="My Learning Dashboard"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#F97316]" />
                    <span className="hidden xl:inline">{lang === 'bn' ? 'ক্লাসরুম' : 'Classroom'}</span>
                  </Link>
                )}
              </div>
            )}

            {/* Compare Courses Pill (if items selected) */}
            {compareCourses.length > 0 && (
              <button
                type="button"
                onClick={() => setCompareDrawerOpen(true)}
                className="h-8 sm:h-8.5 px-2 sm:px-2.5 rounded-xl bg-[#F97316]/15 border border-[#F97316]/30 text-[#FB923C] dark:text-[#FB923C] text-xs font-semibold flex items-center gap-1 tactile-press cursor-pointer"
                aria-label="Open course comparison drawer"
              >
                <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'তুলনা' : 'Compare'}</span>
                <span className="font-mono px-1 py-0.2 rounded bg-[#F97316] text-[#FBF3DC] font-bold text-[10px]">
                  {compareCourses.length}
                </span>
              </button>
            )}

            {/* Segmented Utility Capsule (Language + Theme) */}
            <div className="flex items-center rounded-xl border border-[#16324F] bg-[#16324F] dark:bg-[#16324F] p-0.5 shadow-2xs backdrop-blur-md">
              <button
                type="button"
                onClick={toggleLang}
                className="h-7 sm:h-7.5 px-2 rounded-lg text-[11px] font-mono font-bold text-[#FBF3DC] dark:text-[#FBF3DC] hover:text-white dark:hover:text-white hover:bg-[#0F2A44] dark:hover:bg-[#0F2A44] transition-colors cursor-pointer flex items-center gap-1"
                aria-label="Toggle Language"
                title="Toggle Language"
              >
                <Languages className="w-3 h-3 text-[#D9CDB8]" />
                <span>{lang === 'bn' ? 'EN' : 'বাং'}</span>
              </button>

              <div className="w-px h-3.5 bg-[#0F2A44] dark:bg-[#0F2A44] mx-0.5" />

              <button
                type="button"
                onClick={toggleTheme}
                className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg flex items-center justify-center text-[#FBF3DC] dark:text-[#FBF3DC] hover:text-white dark:hover:text-white hover:bg-[#0F2A44] dark:hover:bg-[#0F2A44] transition-colors cursor-pointer"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-[#FB923C]" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                )}
              </button>
            </div>

            {/* User Account / Profile Dropdown Pill */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                  className="h-8 sm:h-8.5 pl-1.5 pr-2 sm:pr-2.5 rounded-xl border border-[#16324F] bg-[#16324F] dark:bg-[#16324F] hover:bg-[#0A1E33] dark:hover:bg-[#0A1E33] text-[#FBF3DC] dark:text-[#FFF7E8] text-xs font-semibold flex items-center gap-1.5 sm:gap-2 tactile-press cursor-pointer shadow-2xs"
                  aria-expanded={isUserMenuOpen}
                  aria-label="User Account Menu"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#F97316] text-[#FBF3DC] dark:bg-[#F97316] dark:text-[#FBF3DC] flex items-center justify-center font-bold text-[11px] shrink-0">
                    {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] xl:max-w-[120px] truncate font-medium">
                    {user.full_name}
                  </span>
                  {user.is_staff ? (
                    <span className="hidden md:inline px-1.5 py-0.2 rounded-md bg-[#F97316]/15 text-[#FB923C] dark:text-[#FB923C] text-[10px] font-mono font-bold">
                      Admin
                    </span>
                  ) : user.is_trainer ? (
                    <span className="hidden md:inline px-1.5 py-0.2 rounded-md bg-[#F97316]/15 text-[#FB923C] dark:text-[#FB923C] text-[10px] font-mono font-bold">
                      Studio
                    </span>
                  ) : null}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* User Dropdown Glass Card */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl apple-glass border border-slate-200/90 dark:border-slate-800 shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 space-y-0.5">
                        <div className="font-bold text-slate-900 dark:text-white truncate text-sm">
                          {user.full_name}
                        </div>
                        <div className="text-[11px] font-mono text-[#D9CDB8] dark:text-[#D9CDB8] truncate">
                          {user.email || 'student@lwma.io'}
                        </div>
                      </div>

                      <div className="py-1.5 space-y-0.5">
                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium flex items-center gap-2.5 transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-[#F97316]" />
                          <span>{lang === 'bn' ? 'আমার ক্লাসরুম ও কোর্স' : 'My Learning Classroom'}</span>
                        </Link>

                        {(user.is_staff || user.is_superuser) && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full px-3 py-2 rounded-xl text-[#FB923C] dark:text-[#FB923C] bg-[#F97316]/10 hover:bg-[#F97316]/20 font-semibold flex items-center gap-2.5 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-[#F97316]" />
                            <span>{lang === 'bn' ? 'অ্যাডমিন কনসোল' : 'Admin Console'}</span>
                          </Link>
                        )}

                        {(user.is_trainer || user.is_staff || user.is_superuser) && (
                          <Link
                            to="/trainer"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium flex items-center gap-2.5 transition-colors"
                          >
                            <Wrench className="w-4 h-4 text-[#D9CDB8]" />
                            <span>{lang === 'bn' ? 'ইন্সট্রাক্টর স্টুডিও' : 'Instructor Studio'}</span>
                          </Link>
                        )}

                        <Link
                          to="/"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium flex items-center gap-2.5 transition-colors"
                        >
                          <Compass className="w-4 h-4 text-[#F97316]" />
                          <span>{lang === 'bn' ? 'পাবলিক হোম ও ক্যাটালগ' : 'Public Website'}</span>
                        </Link>

                        <Link
                          to="/verify-certificate"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium flex items-center gap-2.5 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#F97316]" />
                          <span>{lang === 'bn' ? 'সার্টিফিকেট যাচাই' : 'Verify Certificate'}</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-200/80 dark:border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            handleLogout()
                          }}
                          className="w-full px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{lang === 'bn' ? 'লগআউট করুন' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="h-8 sm:h-8.5 px-3.5 sm:px-4 rounded-xl aurora-btn-primary text-xs font-semibold flex items-center gap-1.5 tactile-press shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'লগইন' : 'Sign In'}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-18 right-3 sm:right-4 z-50 max-w-sm rounded-2xl px-4 py-3 shadow-xl border backdrop-blur-xl flex items-center gap-3 text-xs sm:text-sm font-medium bg-[#102A44]/95 text-[#FFF7E8] border-slate-700/80"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              toastMessage.type === 'error'
                ? 'bg-rose-500'
                : toastMessage.type === 'success'
                ? 'bg-[#F97316]'
                : 'bg-[#F97316]'
            }`}
          />
          <span>{toastMessage.title}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-x-clip">{children}</main>

      {/* Desktop / Tablet Academic Aurora Footer */}
      <footer className="border-t border-slate-200/90 dark:border-slate-800/80 bg-[#0A1E33] dark:bg-[#0A1E33] py-12 sm:py-16 mt-16 text-[#FBF3DC] dark:text-[#FFF7E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F97316] text-[#FBF3DC] flex items-center justify-center shadow-md">
                <GraduationCap className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
              </div>
              <span className="font-display font-extrabold text-lg sm:text-xl text-[#FBF3DC] dark:text-[#FFF7E8] tracking-tight">
                {lang === 'bn' ? 'ট্রেনিং পণ্ডিত একাডেমি' : 'Training Pundit'}
              </span>
            </div>
            <p className="text-sm text-[#D9CDB8] dark:text-[#D9CDB8] max-w-md leading-relaxed font-sans">
              {lang === 'bn'
                ? 'প্র্যাকটিক্যাল প্রোডাকশন প্রজেক্ট, সার্ভার-ভেরিফাইড অ্যাসেসমেন্ট এবং সরাসরি ক্যারিয়ার মেন্টরশিপের মাধ্যমে ক্লাউড ও সফটওয়্যার ইঞ্জিনিয়ারিং শেখার আধুনিক প্ল্যাটফর্ম।'
                : 'Enterprise-grade cloud engineering, distributed systems, and career placement platform engineered with zero-trust security and fluid mobile ergonomics.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-[#D9CDB8] dark:text-[#D9CDB8]">
              <span>support@trainingpundit.com</span>
              <span>•</span>
              <span>+880 1711-223344</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-full aurora-pill-accent text-[10px] font-bold">
                OWASP Zero-Trust Verified
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#FB923C] dark:text-[#FB923C] font-bold">
              {lang === 'bn' ? 'প্ল্যাটফর্ম ও একাডেমি' : 'Platform & Tracks'}
            </h3>
            <ul className="space-y-2 text-sm text-[#D9CDB8] dark:text-[#D9CDB8]">
              <li><Link to="/courses" className="hover:text-[#F97316] dark:hover:text-[#FB923C] transition-colors">{lang === 'bn' ? 'সকল কোর্স ক্যাটালগ' : 'All Courses'}</Link></li>
              <li><Link to="/jobs" className="hover:text-[#F97316] dark:hover:text-[#FB923C] transition-colors">{lang === 'bn' ? 'জব প্লেসমেন্ট ক্যাম্প' : 'Career Placement Camp'}</Link></li>
              <li><Link to="/codelab" className="hover:text-[#F97316] dark:hover:text-[#FB923C] transition-colors">{lang === 'bn' ? 'ইন্টারেক্টিভ কোডল্যাব' : 'Interactive CodeLab'}</Link></li>
              <li><Link to="/store" className="hover:text-[#F97316] dark:hover:text-[#FB923C] transition-colors">{lang === 'bn' ? 'ডিজিটাল স্টোর ও রিসোর্স' : 'Digital Asset Store'}</Link></li>
              <li><Link to="/verify-certificate" className="hover:text-[#F97316] dark:hover:text-[#FB923C] transition-colors">{lang === 'bn' ? 'সার্টিফিকেট যাচাই' : 'Verify Certificate'}</Link></li>
              <li><Link to="/leaderboard" className="hover:text-[#F97316] dark:hover:text-[#FB923C] transition-colors">{lang === 'bn' ? 'স্টুডেন্ট লিডারবোর্ড' : 'Student Leaderboard'}</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#FB923C] dark:text-[#FB923C] font-bold">
              {lang === 'bn' ? 'ওয়ার্কস্পেস পোর্টাল' : 'Portals'}
            </h3>
            <ul className="space-y-2 text-sm text-[#D9CDB8] dark:text-[#D9CDB8]">
              <li><Link to="/dashboard" className="hover:text-[#F97316] dark:hover:text-[#FB923C] transition-colors">{lang === 'bn' ? 'স্টুডেন্ট ক্লাসরুম' : 'Student Dashboard'}</Link></li>
              <li><Link to="/trainer" className="hover:text-[#F97316] dark:hover:text-[#FB923C] transition-colors">{lang === 'bn' ? 'ইন্সট্রাক্টর স্টুডিও' : 'Trainer Studio'}</Link></li>
              <li><Link to="/admin" className="hover:text-[#F97316] dark:hover:text-[#FB923C] transition-colors">{lang === 'bn' ? 'অ্যাডমিন কনসোল' : 'Admin Console'}</Link></li>
              <li><Link to="/blog" className="hover:text-[#F97316] dark:hover:text-[#FB923C] transition-colors">{lang === 'bn' ? 'ইঞ্জিনিয়ারিং ব্লগ' : 'Engineering Articles'}</Link></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Course Comparison Slide-Up Sheet */}
      {isCompareDrawerOpen && compareCourses.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-[#0A1E33]/70 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Course Comparison Sheet"
          onClick={() => setCompareDrawerOpen(false)}
        >
          <div
            className="w-full max-w-5xl rounded-t-3xl sm:rounded-3xl bg-[#FBF3DC] dark:bg-[#102A44] border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="font-display font-bold text-lg text-[#0F2A44] dark:text-[#FFF7E8]">
                  {lang === 'bn' ? 'কোর্স তুলনা টেবিল' : 'Side-by-Side Course Comparison'}
                </h2>
                <p className="text-xs text-[#6B7280] dark:text-[#D9CDB8]">
                  {lang === 'bn'
                    ? 'আপনার জন্য সেরা ক্যারিয়ার ট্র্যাকটি বেছে নিন'
                    : 'Compare pricing, hours, format, and curriculum depth'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompareDrawerOpen(false)}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                aria-label="Close comparison drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
              {compareCourses.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800/90 p-4 bg-slate-50/70 dark:bg-[#16324F] flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-md aurora-pill-accent font-semibold">
                        {c.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCompareCourse(c)}
                        className="text-xs text-rose-500 hover:underline cursor-pointer"
                      >
                        {lang === 'bn' ? 'সরান' : 'Remove'}
                      </button>
                    </div>
                    <h3 className="font-display font-bold text-base text-[#0F2A44] dark:text-[#FFF7E8]">
                      {bf(c, 'title', lang)}
                    </h3>
                    <div className="space-y-1.5 pt-2 text-xs text-[#6B7280] dark:text-[#D9CDB8] border-t border-slate-200/70 dark:border-slate-800">
                      <div className="flex justify-between">
                        <span>{lang === 'bn' ? 'কোর্স ফি:' : 'Tuition Fee:'}</span>
                        <span className="font-mono font-bold text-[#0F2A44] dark:text-[#FFF7E8]">৳{c.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{lang === 'bn' ? 'সময়কাল:' : 'Duration:'}</span>
                        <span className="font-mono">{c.duration_hours} hrs</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{lang === 'bn' ? 'লেসন সংখ্যা:' : 'Lessons:'}</span>
                        <span className="font-mono">{c.lesson_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{lang === 'bn' ? 'ফরমেট:' : 'Delivery:'}</span>
                        <span className="font-semibold text-emerald-600 dark:text-[#86EFAC]">
                          {c.is_live_course ? 'Live + Recorded' : 'Self-Paced HD'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{lang === 'bn' ? 'শিক্ষার্থী:' : 'Students:'}</span>
                        <span className="font-mono">{c.students_count}+</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/courses/${c.id}`}
                    onClick={() => setCompareDrawerOpen(false)}
                    className="min-h-[44px] w-full rounded-xl aurora-btn-primary text-xs font-semibold flex items-center justify-center gap-1.5 tactile-press"
                  >
                    <span>{lang === 'bn' ? 'বিস্তারিত দেখুন' : 'View Track'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Native Floating Bottom Navigation Dock (< 768px) — Clean Floating Dock */}
      <nav
        aria-label="Mobile Primary Navigation"
        className="md:hidden fixed bottom-2 inset-x-2.5 sm:inset-x-6 z-40 bg-[#0F2A44]/95 dark:bg-[#102A44]/95 rounded-2xl border border-[#16324F] dark:border-slate-800/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md transform-gpu"
        style={{ touchAction: 'manipulation' }}
      >
        <div className="grid grid-cols-5 gap-1 px-1.5 py-1.5 items-center">
          {[
            { to: '/', label: lang === 'bn' ? 'হোম' : 'Home', icon: Home },
            { to: '/courses', label: lang === 'bn' ? 'কোর্স' : 'Courses', icon: Compass },
            { to: user ? '/dashboard' : '/login', label: lang === 'bn' ? 'ক্লাসরুম' : 'Learning', icon: BookOpen },
            { to: '/store', label: lang === 'bn' ? 'স্টোর' : 'Store', icon: ShoppingBag },
            {
              to: user ? (user.is_staff ? '/admin' : user.is_trainer ? '/trainer' : '/dashboard') : '/login',
              label: user ? (user.is_staff ? 'Admin' : user.is_trainer ? 'Studio' : 'Profile') : lang === 'bn' ? 'অ্যাকাউন্ট' : 'Account',
              icon: user?.is_staff ? ShieldCheck : user?.is_trainer ? Wrench : User,
            },
          ].map((tab) => {
            const Icon = tab.icon
            const active = isActive(tab.to)
            return (
              <Link
                key={tab.label}
                to={tab.to}
                className={`min-h-[46px] rounded-xl flex flex-col items-center justify-center gap-0.5 tactile-press transition-colors duration-150 ${
                  active
                    ? 'bg-[#F97316] text-[#FBF3DC] font-bold shadow-xs'
                    : 'text-[#D9CDB8] dark:text-[#D9CDB8] hover:text-[#FBF3DC] dark:hover:text-[#FFF7E8] hover:bg-[#16324F] dark:hover:bg-[#16324F] font-medium'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
                <span className="text-[10px] leading-none truncate max-w-[56px] tracking-tight">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
