import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Send,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  FileCheck,
} from 'lucide-react'
import { apiFetch } from '../lib/api'
import { useAppStore, bf } from '../stores/useAppStore'
import { Card3D } from '../components/common/Card3D'

interface JobPosting {
  id: number
  title: string
  title_bn: string
  company_name: string
  company_logo: string
  location: string
  job_type: string
  salary_range: string
  experience_level: string
  description: string
  description_bn: string
  skills?: string[]
  skills_required?: string[]
}

interface JobApplication {
  id: number
  job_id: number
  job_title: string
  company_name: string
  company_logo: string
  salary_range: string
  location: string
  status: string
  applied_at: string
}

export const JobPlacementPage: React.FC = () => {
  const { lang, user, showToast } = useAppStore()
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'browse' | 'my_applications'>('browse')
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [coverNote, setCoverNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const data = await apiFetch<JobPosting[]>('/public/jobs')
      setJobs(data || [])
      if (data && data.length > 0 && !selectedJob) {
        setSelectedJob(data[0])
      }
    } catch {
      showToast(lang === 'bn' ? 'জব সার্কুলার লোড হতে সমস্যা হয়েছে' : 'Failed to load job listings', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    if (!user) return
    try {
      const data = await apiFetch<JobApplication[]>('/student/job-applications')
      setApplications(data || [])
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    if (activeTab === 'my_applications') {
      fetchApplications()
    }
  }, [activeTab, user])

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJob) return
    if (!user) {
      showToast(lang === 'bn' ? 'আবেদন করতে প্রথমে লগইন করুন' : 'Please log in to apply', 'error')
      return
    }
    if (!portfolioUrl.trim()) {
      showToast(lang === 'bn' ? 'পোর্টফোলিও লিংক দিন' : 'Please provide your portfolio/GitHub link', 'error')
      return
    }

    try {
      setIsSubmitting(true)
      await apiFetch(`/student/jobs/${selectedJob.id}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          portfolio_url: portfolioUrl.trim(),
          cover_note: coverNote.trim(),
        }),
      })

      showToast(
        lang === 'bn' ? 'আবেদন সফলভাবে গৃহীত হয়েছে!' : 'Application submitted successfully!',
        'success'
      )
      setIsApplyModalOpen(false)
      setPortfolioUrl('')
      setCoverNote('')
      fetchApplications()
    } catch (err: any) {
      showToast(err.message || 'Application failed', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredJobs = jobs.filter((j) => {
    const jobSkills = j.skills_required || j.skills || []
    const matchesSearch =
      (j.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.company_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobSkills.some((s) => (s || '').toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFilter =
      filterType === 'all' ||
      (j.job_type || '').toLowerCase().includes(filterType.toLowerCase())
    return matchesSearch && matchesFilter
  })

  const hasAppliedToSelected = applications.some((a) => a.job_id === selectedJob?.id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Hero Header with Academic Aurora Atmosphere */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#0C1528] shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#356DFF]/5 via-transparent to-[#35C6BE]/5 dark:from-[#356DFF]/10 dark:to-[#35C6BE]/10 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full aurora-pill-teal text-xs font-semibold uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#35C6BE]" />
            <span>{lang === 'bn' ? 'অফিশিয়াল গ্র্যাজুয়েট হায়ারিং ক্যাম্প' : 'Talent Placement Camp 2026'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-[#14213A] dark:text-[#F5F8FF]">
            {lang === 'bn'
              ? 'লার্ন উইথ মারুফ আহমেদ গ্র্যাজুয়েট হায়ারিং পুল'
              : 'Direct Career Placement at Top Tech Companies'}
          </h1>
          <p className="text-sm sm:text-base text-[#5D6B82] dark:text-[#A8B7CE] max-w-2xl leading-relaxed">
            {lang === 'bn'
              ? 'আমাদের সার্টিফিকেট অর্জনকারী ও কোর্স সম্পন্নকারী শিক্ষার্থীদের সরাসরি ব্রেন স্টেশন ২৩, আস্থা আইটি, রিভ সিস্টেমসসহ দেশের শীর্ষস্থানীয় টেক কোম্পানিতে ইন্টারভিউ ও ফুল-টাইম জবের সুযোগ।'
              : 'Exclusively for our certified graduates. Connect with leading tech hiring partners in Bangladesh and globally without resume gatekeeping.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm text-[#5D6B82] dark:text-[#A8B7CE] font-mono">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#356DFF]" />
              <span>{lang === 'bn' ? '৫০+ হায়ারিং পার্টনার্স' : '50+ Partner Companies'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#35C6BE]" />
              <span>{lang === 'bn' ? '১০০% ভেরিফাইড স্কিল রিকমেন্ডেশন' : 'Verified Skill Credentials'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-amber-500" />
              <span>{lang === 'bn' ? 'জিরো থার্ড-পার্টি ফি' : 'Direct Employer Pipeline'}</span>
            </div>
          </div>

          {/* Hiring Partner Logo Strip */}
          <div className="pt-4 border-t border-[#E2E8F2] dark:border-slate-800 flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5D6B82] dark:text-[#A8B7CE] font-semibold">
              Trusted By:
            </span>
            {['Brain Station 23', 'Astha IT', 'REVE Systems', 'Technosoft BD', 'TigerIT BD'].map((partner, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-[#14213A] dark:text-[#F5F8FF] text-xs font-mono font-medium"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>

        {/* Decorative soft glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#356DFF]/10 dark:bg-[#356DFF]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F2] dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tactile-press flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'browse'
                ? 'aurora-btn-primary shadow-sm'
                : 'aurora-btn-secondary'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{lang === 'bn' ? 'জব সার্কুলার' : 'Open Positions'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'browse' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-[#14213A] dark:text-[#F5F8FF]'
            }`}>
              {jobs.length}
            </span>
          </button>

          {user && (
            <button
              type="button"
              onClick={() => setActiveTab('my_applications')}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tactile-press flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'my_applications'
                  ? 'aurora-btn-primary shadow-sm'
                  : 'aurora-btn-secondary'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>{lang === 'bn' ? 'আমার আবেদনসমূহ' : 'My Applications'}</span>
              {applications.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500 text-white">
                  {applications.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Search & Filter */}
        {activeTab === 'browse' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-[#5D6B82] dark:text-[#A8B7CE] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'bn' ? 'পদবী বা কোম্পানি খুঁজুন...' : 'Search role, company, skill...'}
                className="w-full pl-9 pr-3 py-2 min-h-[40px] text-xs rounded-xl border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#111F36] text-[#14213A] dark:text-[#F5F8FF] focus:outline-hidden focus:border-[#356DFF] focus:ring-2 focus:ring-[#356DFF]/20"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="py-2 px-3 min-h-[40px] text-xs rounded-xl border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#111F36] text-[#14213A] dark:text-[#F5F8FF] focus:outline-hidden focus:border-[#356DFF] cursor-pointer"
            >
              <option value="all">{lang === 'bn' ? 'সব কাজের ধরন' : 'All Work Types'}</option>
              <option value="remote">{lang === 'bn' ? 'ফুল-টাইম রিমোট' : 'Remote'}</option>
              <option value="hybrid">{lang === 'bn' ? 'হাইব্রিড' : 'Hybrid'}</option>
              <option value="on-site">{lang === 'bn' ? 'অন-সাইট' : 'On-Site'}</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content Body */}
      {activeTab === 'browse' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Job List Left / Top */}
          <div className="lg:col-span-5 space-y-3 max-h-[800px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-sm text-[#5D6B82] dark:text-[#A8B7CE]">Loading open positions...</div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#5D6B82] dark:text-[#A8B7CE] bg-white dark:bg-[#0C1528] rounded-2xl border border-[#E2E8F2] dark:border-slate-800">
                {lang === 'bn' ? 'কোনো জব সার্কুলার পাওয়া যায়নি।' : 'No job positions match your filter.'}
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 rounded-2xl aurora-card cursor-pointer tactile-press bg-white dark:bg-[#0C1528] border transition-all ${
                      isSelected
                        ? 'border-[#356DFF] dark:border-[#35C6BE] ring-2 ring-[#356DFF]/20 dark:ring-[#35C6BE]/20 shadow-md'
                        : 'border-[#E2E8F2] dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={job.company_logo}
                        alt={job.company_name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-700 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-display font-bold text-sm text-[#14213A] dark:text-[#F5F8FF] truncate">
                            {bf(job, 'title', lang)}
                          </h3>
                        </div>
                        <p className="text-xs text-[#5D6B82] dark:text-[#A8B7CE] font-medium">
                          {job.company_name}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-[#5D6B82] dark:text-[#A8B7CE] font-mono">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#356DFF]" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#35C6BE]" />
                            {job.job_type}
                          </span>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[#E2E8F2] dark:border-slate-800/80">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {job.salary_range}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F5F7FB] dark:bg-[#111F36] text-[#5D6B82] dark:text-[#A8B7CE] border border-[#E2E8F2] dark:border-slate-800">
                            {job.experience_level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Job Detail Right */}
          <div className="aurora-card-raised lg:col-span-7 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl sticky top-20 border border-[#E2E8F2] dark:border-slate-800 bg-white dark:bg-[#0C1528]">
            {selectedJob ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F2] dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedJob.company_logo}
                      alt={selectedJob.company_name}
                      className="w-14 h-14 rounded-2xl object-cover bg-slate-100 dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-700 shadow-xs"
                    />
                    <div>
                      <h2 className="text-lg sm:text-xl font-display font-bold text-[#14213A] dark:text-[#F5F8FF]">
                        {bf(selectedJob, 'title', lang)}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-[#5D6B82] dark:text-[#A8B7CE]">
                        <span className="font-semibold text-[#14213A] dark:text-[#F5F8FF]">
                          {selectedJob.company_name}
                        </span>
                        <span>•</span>
                        <span>{selectedJob.location}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        showToast(lang === 'bn' ? 'আবেদন করতে প্রথমে লগইন করুন' : 'Please sign in to apply', 'error')
                        return
                      }
                      setIsApplyModalOpen(true)
                    }}
                    disabled={hasAppliedToSelected}
                    className={`min-h-[44px] px-6 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 tactile-press cursor-pointer ${
                      hasAppliedToSelected
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-not-allowed'
                        : 'aurora-btn-primary shadow-md'
                    }`}
                  >
                    {hasAppliedToSelected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'আবেদন সম্পন্ন' : 'Applied'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{lang === 'bn' ? '১-ক্লিকে আবেদন করুন' : '1-Click Apply'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Job Metadata Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-[#5D6B82] dark:text-[#A8B7CE] block">
                      {lang === 'bn' ? 'বেতন স্কেল' : 'Salary Range'}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {selectedJob.salary_range}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-[#5D6B82] dark:text-[#A8B7CE] block">
                      {lang === 'bn' ? 'কাজের ধরন' : 'Job Type'}
                    </span>
                    <span className="text-xs font-semibold text-[#14213A] dark:text-[#F5F8FF]">
                      {selectedJob.job_type}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-mono text-[#5D6B82] dark:text-[#A8B7CE] block">
                      {lang === 'bn' ? 'অভিজ্ঞতা' : 'Experience'}
                    </span>
                    <span className="text-xs font-semibold text-[#14213A] dark:text-[#F5F8FF]">
                      {selectedJob.experience_level}
                    </span>
                  </div>
                </div>

                {/* Required Tech Stack / Skills */}
                <div className="space-y-2">
                  <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-[#5D6B82] dark:text-[#A8B7CE]">
                    {lang === 'bn' ? 'প্রয়োজনীয় টেক স্ট্যাক' : 'Required Skills'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedJob.skills_required || selectedJob.skills || []).map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-xl bg-[#F5F7FB] dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-800 text-[#14213A] dark:text-[#F5F8FF] text-xs font-mono font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Role Description */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-[#5D6B82] dark:text-[#A8B7CE]">
                    {lang === 'bn' ? 'দায়িত্ব ও কাজের বিবরণ' : 'Role Overview & Responsibilities'}
                  </h3>
                  <p className="text-sm text-[#14213A] dark:text-[#A8B7CE] leading-relaxed whitespace-pre-line">
                    {bf(selectedJob, 'description', lang)}
                  </p>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-[#5D6B82] dark:text-[#A8B7CE] text-sm">
                Select a position to view details
              </div>
            )}
          </div>
        </div>
      ) : (
        /* My Applications Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-[#14213A] dark:text-[#F5F8FF]">
              {lang === 'bn' ? 'আমার সাবমিটকৃত আবেদনসমূহ' : 'My Job Applications'}
            </h2>
            <span className="text-xs font-mono text-[#5D6B82] dark:text-[#A8B7CE]">
              {applications.length} {lang === 'bn' ? 'টি আবেদন' : 'applications'}
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0C1528] rounded-3xl border border-[#E2E8F2] dark:border-slate-800 space-y-3 shadow-sm">
              <Briefcase className="w-10 h-10 text-[#5D6B82] dark:text-[#A8B7CE] mx-auto" />
              <h3 className="text-base font-bold text-[#14213A] dark:text-[#F5F8FF]">
                {lang === 'bn' ? 'এখনো কোনো আবেদন করেননি' : 'No applications submitted yet'}
              </h3>
              <p className="text-xs text-[#5D6B82] dark:text-[#A8B7CE] max-w-sm mx-auto">
                {lang === 'bn'
                  ? 'ওপেন পজিশন তালিকা থেকে আপনার পছন্দের কোম্পানিতে আবেদন করুন।'
                  : 'Browse open positions and submit your portfolio directly to hiring partners.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('browse')}
                className="px-4 py-2 min-h-[40px] rounded-xl aurora-btn-primary text-xs font-semibold tactile-press cursor-pointer shadow-md"
              >
                {lang === 'bn' ? 'সার্কুলার ব্রাউজ করুন' : 'Browse Open Roles'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0C1528] border border-[#E2E8F2] dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={app.company_logo}
                        alt={app.company_name}
                        className="w-11 h-11 rounded-xl object-cover bg-slate-100 dark:bg-[#111F36] border border-[#E2E8F2] dark:border-slate-700"
                      />
                      <div>
                        <h3 className="font-display font-bold text-sm text-[#14213A] dark:text-[#F5F8FF]">
                          {app.job_title}
                        </h3>
                        <p className="text-xs text-[#5D6B82] dark:text-[#A8B7CE] font-semibold">
                          {app.company_name}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider aurora-pill-teal">
                      {app.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#5D6B82] dark:text-[#A8B7CE] font-mono pt-2 border-t border-[#E2E8F2] dark:border-slate-800">
                    <span>{app.salary_range}</span>
                    <span>•</span>
                    <span>{app.location}</span>
                    <span>•</span>
                    <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 1-Click Application Modal */}
      {isApplyModalOpen && selectedJob && (
        <div
          className="fixed inset-0 z-50 bg-[#060B18]/70 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl aurora-card-raised border border-[#E2E8F2] dark:border-slate-800 p-6 space-y-5 shadow-2xl bg-white dark:bg-[#0C1528]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-[#14213A] dark:text-[#F5F8FF]">
                  {lang === 'bn' ? 'চাকরিতে আবেদন ফরম' : 'Direct Talent Application'}
                </h3>
                <p className="text-xs text-[#5D6B82] dark:text-[#A8B7CE]">
                  {selectedJob.title} • {selectedJob.company_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="w-8 h-8 rounded-xl border border-[#E2E8F2] dark:border-slate-800 flex items-center justify-center text-[#5D6B82] hover:text-[#14213A] dark:hover:text-[#F5F8FF] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#14213A] dark:text-[#F5F8FF]">
                  {lang === 'bn' ? 'পোর্টফোলিও বা গিটহাব ইউআরএল *' : 'Portfolio / GitHub Repository URL *'}
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/your-username/cloud-lms-project"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm rounded-xl border border-[#E2E8F2] dark:border-slate-800 bg-[#F5F7FB] dark:bg-[#111F36] text-[#14213A] dark:text-[#F5F8FF] focus:outline-hidden focus:border-[#356DFF] focus:ring-2 focus:ring-[#356DFF]/20 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#14213A] dark:text-[#F5F8FF]">
                  {lang === 'bn' ? 'কভার নোট বা বিশেষ দক্ষতা (ঐচ্ছিক)' : 'Cover Note / Highlighted Achievements (Optional)'}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    lang === 'bn'
                      ? 'আপনার ক্লাউড লার্নিং অভিজ্ঞতা এবং শীর্ষ প্রজেক্ট সম্পর্কে সংক্ষেপে লিখুন...'
                      : 'Briefly mention your certifications, full-stack tech stack, and key project metrics...'
                  }
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E2E8F2] dark:border-slate-800 bg-[#F5F7FB] dark:bg-[#111F36] text-[#14213A] dark:text-[#F5F8FF] focus:outline-hidden focus:border-[#356DFF] focus:ring-2 focus:ring-[#356DFF]/20"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#356DFF]/10 border border-[#356DFF]/20 text-[11px] text-[#14213A] dark:text-[#A8B7CE] leading-relaxed">
                {lang === 'bn'
                  ? 'আপনার প্ল্যাটফর্ম সার্টিফিকেট, কুইজ স্কোর ও ধারাবাহিকতার হিস্ট্রি আবেদনের সাথে সরাসরি কোম্পানির এইচআর পোর্টালে যুক্ত হবে।'
                  : 'Your verified LWMA certificates, assessment scores, and streak data will be attached to this application automatically.'}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold aurora-btn-secondary cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[42px] px-5 py-2 rounded-xl aurora-btn-primary text-xs font-semibold tactile-press flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'আবেদন পাঠান' : 'Submit Application'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
