import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  FolderGit2,
  HelpCircle,
  Lock,
  Maximize,
  MessageSquare,
  Minimize,
  Play,
  Plus,
  Send,
  ShieldCheck,
  Video,
  Code2,
  Zap,
} from 'lucide-react'
import { apiFetch } from '../lib/api'
import { useAppStore, bf } from '../stores/useAppStore'

type PlayerTab = 'curriculum' | 'quiz' | 'notes' | 'discussions' | 'project' | 'codelab'

export const CoursePlayerPage: React.FC = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { lang, accessToken, showToast } = useAppStore()
  const [data, setData] = useState<any>(null)
  const [activeLesson, setActiveLesson] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<PlayerTab>('curriculum')
  const [loading, setLoading] = useState(true)

  // Notes state
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizResult, setQuizResult] = useState<any>(null)
  const [submittingQuiz, setSubmittingQuiz] = useState(false)

  // Discussions state
  const [discussions, setDiscussions] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyParentId, setReplyParentId] = useState<number | null>(null)

  // Project submission state
  const [projectUrl, setProjectUrl] = useState('')
  const [projectNotes, setProjectNotes] = useState('')

  // Issue report state
  const [reportText, setReportText] = useState('')
  const [showReportModal, setShowReportModal] = useState(false)

  // No-YouTube-chrome player: the iframe's own title bar carries the
  // "Watch on YouTube" / Share button, so a solid LMS header bar covers
  // the top strip of the video and fullscreen runs on the wrapper (not
  // the iframe), keeping the bar visible in fullscreen too.
  const playerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void playerRef.current?.requestFullscreen()
    }
  }
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const loadPlayer = async (keepLessonId?: number) => {
    try {
      const res = await apiFetch(`/student/player/${courseId}`)
      setData(res)
      if (res.project_submission) {
        setProjectUrl(res.project_submission.github_or_live_url || '')
        setProjectNotes(res.project_submission.notes || '')
      }
      const unlocked = (res.lessons || []).filter((l: any) => !l.is_locked)
      const target =
        (keepLessonId && res.lessons.find((l: any) => l.id === keepLessonId && !l.is_locked)) ||
        unlocked.find((l: any) => !l.is_completed) ||
        unlocked[0] ||
        res.lessons[0]
      if (target) {
        selectLesson(target)
      }
    } catch (err: any) {
      showToast(err.message, 'error')
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const selectLesson = (lesson: any) => {
    if (lesson.is_locked) {
      showToast(
        lang === 'bn'
          ? 'পূর্ববর্তী লেসনের ৮০% ভিডিও ও কুইজ সম্পন্ন করলে এই লেসনটি আনলক হবে।'
          : 'Complete 80% watch time & pass the quiz of the previous lesson to unlock.',
        'info'
      )
      return
    }
    setActiveLesson(lesson)
    setNoteText(lesson.note_content || '')
    setQuizAnswers({})
    setQuizResult(null)
    apiFetch(`/student/lessons/${lesson.id}/discussions`)
      .then((res) => setDiscussions(res))
      .catch(() => setDiscussions([]))
  }

  useEffect(() => {
    loadPlayer()
  }, [courseId])

  const handleWatchHeartbeat = async (targetPct: number) => {
    if (!activeLesson) return
    const totalSecs = (activeLesson.duration_minutes || 20) * 60
    const watchedSecs = Math.round((targetPct / 100) * totalSecs)
    try {
      const res = await apiFetch(`/student/lessons/${activeLesson.id}/heartbeat`, {
        method: 'POST',
        body: JSON.stringify({ watched_seconds: watchedSecs, total_seconds: totalSecs }),
      })
      setActiveLesson((prev: any) => ({
        ...prev,
        watch_percentage: res.watch_percentage,
        watched_seconds: res.watched_seconds,
      }))
      showToast(
        lang === 'bn'
          ? `সার্ভার হার্টবিট সিঙ্ক সম্পন্ন: ${res.watch_percentage}% দেখা হয়েছে`
          : `Server Heartbeat Synced: ${res.watch_percentage}% watched`,
        'success'
      )
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleCompleteLesson = async () => {
    if (!activeLesson) return
    try {
      const res = await apiFetch(`/student/lessons/${activeLesson.id}/complete`, {
        method: 'POST',
      })
      showToast(
        res.certificate_minted
          ? `Congratulations! Course 100% Complete — Certificate ${res.certificate_minted} Issued!`
          : lang === 'bn'
          ? 'লেসন সম্পন্ন হয়েছে এবং পরবর্তী লেসন আনলক হয়েছে!'
          : 'Lesson verified complete! Next lesson unlocked.',
        'success'
      )
      await loadPlayer(activeLesson.id)
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeLesson) return
    setSubmittingQuiz(true)
    try {
      const res = await apiFetch(`/student/lessons/${activeLesson.id}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: quizAnswers }),
      })
      setQuizResult(res)
      if (res.passed) {
        showToast(
          lang === 'bn'
            ? `অভিনন্দন! আপনি ${res.score}% স্কোর করে কুইজে উত্তীর্ণ হয়েছেন!`
            : `Passed Assessment with ${res.score}%!`,
          'success'
        )
        await loadPlayer(activeLesson.id)
      } else {
        showToast(
          lang === 'bn'
            ? `স্কোর: ${res.score}% (পাস মার্ক ${res.pass_mark}%)। আবার চেষ্টা করুন (${res.attempts_used}/3)।`
            : `Score: ${res.score}% (Required: ${res.pass_mark}%). Attempts used: ${res.attempts_used}/3.`,
          'error'
        )
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmittingQuiz(false)
    }
  }

  const handleInsertTimestamp = () => {
    const secs = activeLesson?.watched_seconds || 255
    const mm = String(Math.floor(secs / 60)).padStart(2, '0')
    const ss = String(secs % 60).padStart(2, '0')
    setNoteText((prev) => `${prev}${prev ? '\n' : ''}[${mm}:${ss}] `)
  }

  const handleSaveNote = async () => {
    if (!activeLesson) return
    setSavingNote(true)
    try {
      await apiFetch(`/student/lessons/${activeLesson.id}/note`, {
        method: 'PUT',
        body: JSON.stringify({ content: noteText }),
      })
      showToast(lang === 'bn' ? 'নোট সেভ করা হয়েছে!' : 'Study notes saved safely!', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSavingNote(false)
    }
  }

  const handleDownloadNotePdf = async () => {
    if (!activeLesson) return
    try {
      const res = await fetch(`/api/v1/student/lessons/${activeLesson.id}/note/pdf`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error('Could not export PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `LWMA-Notes-Lesson-${activeLesson.id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handlePostDiscussion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeLesson || !newComment.trim()) return
    try {
      await apiFetch(`/student/lessons/${activeLesson.id}/discussions`, {
        method: 'POST',
        body: JSON.stringify({ comment: newComment, parent_id: replyParentId }),
      })
      setNewComment('')
      setReplyParentId(null)
      const updated = await apiFetch(`/student/lessons/${activeLesson.id}/discussions`)
      setDiscussions(updated)
      showToast(lang === 'bn' ? 'মন্তব্য পোস্ট হয়েছে' : 'Question posted to thread', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await apiFetch(`/student/courses/${courseId}/project`, {
        method: 'POST',
        body: JSON.stringify({ github_or_live_url: projectUrl, notes: projectNotes }),
      })
      setData((prev: any) => ({ ...prev, project_submission: res }))
      showToast(lang === 'bn' ? 'প্রজেক্ট সাবমিট হয়েছে!' : 'Final project submitted for mentor review!', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeLesson) return
    try {
      const res = await apiFetch(`/student/lessons/${activeLesson.id}/report`, {
        method: 'POST',
        body: JSON.stringify({ issue_type: 'Video/Content', description: reportText }),
      })
      showToast(res.message, 'success')
      setReportText('')
      setShowReportModal(false)
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-96 rounded-3xl bg-slate-200/70 dark:bg-slate-900/70 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-6 py-0 sm:py-6">
      {/* Top Course Progress Strip */}
      <div className="px-4 sm:px-0 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link
            to="/dashboard"
            className="min-h-[40px] min-w-[40px] rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 tactile-press"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-sm sm:text-lg text-slate-900 dark:text-white line-clamp-1">
              {bf(data.course, 'title', lang)}
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span>Course Progress: {data.course.progress}%</span>
              {data.certificate && (
                <Link
                  to={`/verify-certificate?id=${data.certificate.certificate_id}`}
                  className="text-[#D97706] font-bold hover:underline flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5" /> Cert: {data.certificate.certificate_id}
                </Link>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowReportModal(true)}
          className="min-h-[38px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 hover:text-[#D97706] flex items-center gap-1.5 cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'সমস্যা রিপোর্ট' : 'Report Issue'}</span>
        </button>
      </div>

      {/* Main Responsive Player Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Sticky Mobile 16:9 Video Player + Interactive Action Bar + Tabbed Sheets */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sticky 16:9 Video Viewport on Mobile */}
          <div className="sticky top-14 sm:top-16 z-30 sm:static bg-slate-950 sm:rounded-3xl overflow-hidden border-y sm:border border-slate-800 shadow-2xl">
            <div ref={playerRef} className="relative aspect-video bg-slate-950">
              {activeLesson?.video_id ? (
                <iframe
                  key={activeLesson.id}
                  title={bf(activeLesson, 'title', lang)}
                  src={`https://www.youtube.com/embed/${activeLesson.video_id}?rel=0&modestbranding=1&iv_load_policy=3&fs=0&playsinline=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  Select an unlocked lesson to begin playback
                </div>
              )}

              {/* LMS header bar over the video: covers YouTube's own title
                  bar (the "Watch on YouTube" / Share button lives there),
                  so students stay inside the LMS. */}
              {activeLesson?.video_id && (
                <div className="absolute top-0 inset-x-0 z-10 h-12 sm:h-14 bg-[#0F2A44] border-b border-[#16324F] flex items-center gap-2 px-3 sm:px-4">
                  <Play className="w-3.5 h-3.5 text-[#F97316] fill-current shrink-0" />
                  <span className="flex-1 min-w-0 truncate text-xs sm:text-sm font-semibold text-[#FBF3DC]">
                    {bf(activeLesson, 'title', lang)}
                  </span>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="shrink-0 w-8 h-8 rounded-lg bg-[#16324F] hover:bg-[#1d4066] text-[#FBF3DC] flex items-center justify-center cursor-pointer"
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Anti-Piracy Floating Student Watermark */}
              <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute top-16 right-3 z-20 px-2.5 py-1 rounded-md bg-slate-950/65 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white/65"
              >
                {data.watermark}
              </div>
            </div>

            {/* Video Telemetry & Server Heartbeat Bar */}
            {activeLesson && (
              <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="text-[11px] sm:text-xs font-mono">
                    <span className="text-slate-400">Watch: </span>
                    <span
                      className={`font-bold ${
                        activeLesson.watch_percentage >= 80 ? 'text-[#34D399]' : 'text-[#F59E0B]'
                      }`}
                    >
                      {activeLesson.watch_percentage}%
                    </span>
                    <span className="text-slate-500 hidden sm:inline"> (Min 80% required)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleWatchHeartbeat(Math.min(100, (activeLesson.watch_percentage || 0) + 45))}
                    className="h-8 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#FB923C] text-[10px] sm:text-[11px] font-mono font-semibold cursor-pointer tactile-press"
                    title="Sync watch progress heartbeat to server"
                  >
                    + Sync 85% Heartbeat
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {activeLesson.resource_download_token && (
                    <a
                      href={`/api/v1/vault/download/${activeLesson.resource_download_token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="min-h-[36px] sm:min-h-[38px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 tactile-press"
                    >
                      <Download className="w-3.5 h-3.5 text-[#FB923C]" />
                      <span className="hidden sm:inline">{lang === 'bn' ? 'রিসোর্স ফাইল' : 'Resource Vault'}</span>
                      <span className="sm:hidden">{lang === 'bn' ? 'ফাইল' : 'Vault'}</span>
                    </a>
                  )}

                  {activeLesson.has_quiz && !activeLesson.quiz_passed ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab('quiz')}
                      className="min-h-[36px] sm:min-h-[38px] px-3.5 sm:px-4 rounded-xl bg-[#D97706] hover:bg-[#F59E0B] text-slate-950 text-xs font-bold flex items-center gap-1.5 tactile-press cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'কুইজ দিন' : 'Take Quiz'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCompleteLesson}
                      className="min-h-[36px] sm:min-h-[38px] px-3.5 sm:px-4 rounded-xl bg-[#059669] hover:bg-[#34D399] text-slate-950 text-xs font-bold flex items-center gap-1.5 tactile-press cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {activeLesson.is_completed
                          ? lang === 'bn'
                            ? 'সম্পন্ন'
                            : 'Done'
                          : lang === 'bn'
                          ? 'কমপ্লিট করুন'
                          : 'Complete'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile & Desktop Interactive Player Tabs */}
          <div className="px-4 sm:px-0 space-y-4">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200 dark:border-slate-800">
              {[
                { id: 'curriculum', label: lang === 'bn' ? 'লেসন তালিকা' : 'Curriculum', icon: BookOpen },
                {
                  id: 'quiz',
                  label: lang === 'bn' ? 'কুইজ অ্যাসেসমেন্ট' : `Quiz (${activeLesson?.questions?.length || 0})`,
                  icon: HelpCircle,
                },
                { id: 'notes', label: lang === 'bn' ? 'টাইমস্ট্যাম্প নোট' : 'Smart Notes', icon: FileText },
                { id: 'discussions', label: lang === 'bn' ? 'প্রশ্নোত্তর (Q&A)' : 'Mentor Q&A', icon: MessageSquare },
                { id: 'project', label: lang === 'bn' ? 'প্রজেক্ট ও লাইভ' : 'Project & Live', icon: FolderGit2 },
                { id: 'codelab', label: lang === 'bn' ? 'কোডল্যাব' : 'CodeLab', icon: Code2 },
              ].map((t) => {
                const Icon = t.icon
                const active = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as PlayerTab)}
                    className={`min-h-[40px] sm:min-h-[44px] px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 tactile-press cursor-pointer shrink-0 transition-all ${
                      active
                        ? 'aurora-btn-primary shadow-sm'
                        : 'text-[#6B7280] dark:text-[#D9CDB8] hover:text-[#0F2A44] dark:hover:text-[#FFF7E8] hover:bg-slate-100 dark:hover:bg-[#16324F]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </div>

            {/* TAB 1: Curriculum & Active Lesson Overview + Mobile Lesson Playlist */}
            {activeTab === 'curriculum' && activeLesson && (
              <div className="space-y-4">
                <div className="aurora-card rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 bg-[#FBF3DC] dark:bg-[#102A44] border border-[#E0D3AF] dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md aurora-pill-accent font-mono text-xs font-semibold">
                      Lesson #{activeLesson.order} • Pass Mark {activeLesson.pass_mark}%
                    </span>
                    {activeLesson.quiz_passed && (
                      <span className="px-2.5 py-1 rounded-md aurora-pill-accent font-mono text-xs font-bold">
                        Quiz Passed ({activeLesson.quiz_score}%)
                      </span>
                    )}
                  </div>
                  <h2 className="font-display font-bold text-base sm:text-xl text-[#0F2A44] dark:text-[#FFF7E8]">
                    {bf(activeLesson, 'title', lang)}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#D9CDB8] leading-relaxed font-sans">
                    {bf(activeLesson, 'description', lang)}
                  </p>
                </div>

                {/* Mobile In-Tab Playlist (Instantly accessible on phones) */}
                <div className="lg:hidden aurora-card rounded-2xl overflow-hidden bg-[#FBF3DC] dark:bg-[#102A44] border border-[#E0D3AF] dark:border-slate-800">
                  <div className="p-3.5 border-b border-[#E0D3AF] dark:border-slate-800 flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-[#0F2A44] dark:text-[#FFF7E8]">
                      {lang === 'bn' ? 'সকল লেসন তালিকা' : 'Lesson Playlist'}
                    </span>
                    <span className="text-xs font-mono text-[#F97316] dark:text-[#F97316] font-semibold">
                      {data.lessons.filter((l: any) => l.is_completed).length}/{data.lessons.length} Done
                    </span>
                  </div>
                  <div className="divide-y divide-[#E0D3AF] dark:divide-slate-800">
                    {data.lessons.map((les: any) => {
                      const isCurrent = activeLesson?.id === les.id
                      return (
                        <button
                          key={les.id}
                          type="button"
                          onClick={() => selectLesson(les)}
                          className={`w-full p-3.5 text-left flex items-start justify-between gap-3 transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-[#F97316]/15 border-l-4 border-[#F97316]'
                              : 'hover:bg-[#E9D9B4] dark:hover:bg-[#16324F]/60'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5">
                              {les.is_completed ? (
                                <CheckCircle2 className="w-4 h-4 text-[#F97316]" />
                              ) : les.is_locked ? (
                                <Lock className="w-4 h-4 text-slate-400" />
                              ) : (
                                <Play className="w-4 h-4 text-[#F97316]" />
                              )}
                            </div>
                            <div>
                              <div
                                className={`text-xs font-semibold ${
                                  isCurrent
                                    ? 'text-[#F97316] dark:text-[#F97316]'
                                    : 'text-[#0F2A44] dark:text-[#FFF7E8]'
                                }`}
                              >
                                #{les.order}. {bf(les, 'title', lang)}
                              </div>
                              <div className="text-[10px] font-mono text-[#6B7280] dark:text-[#D9CDB8] flex items-center gap-1.5 mt-0.5">
                                <span>{les.duration_minutes}m</span>
                                {les.is_completed && <span className="text-[#F97316]">✓ Completed</span>}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Server-Verified Quiz Engine (Zero Answer Leakage on Fail!) */}
            {activeTab === 'quiz' && activeLesson && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#FBF3DC] dark:bg-[#102A44] p-5 sm:p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                      {lang === 'bn' ? 'লেসন কুইজ ভেরিফিকেশন' : 'Server-Graded Technical Assessment'}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">
                      Pass Mark: {activeLesson.pass_mark}% • Max 3 Failed Attempts before 5-Min Cooldown
                    </p>
                  </div>
                  {activeLesson.quiz_score !== null && (
                    <span className="px-3 py-1 rounded-full bg-[#F97316]/15 text-[#F97316] font-mono text-xs font-bold">
                      Best Score: {activeLesson.quiz_score}%
                    </span>
                  )}
                </div>

                {(activeLesson.questions || []).length === 0 ? (
                  <p className="text-sm text-slate-500">No quiz required for this lesson.</p>
                ) : (
                  <form onSubmit={handleSubmitQuiz} className="space-y-6">
                    {activeLesson.questions.map((q: any, idx: number) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm text-slate-900 dark:text-white">
                            {idx + 1}. {bf(q, 'text', lang)}
                          </p>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                            {q.question_type}
                          </span>
                        </div>

                        {q.question_type.toUpperCase() === 'SHORT' ? (
                          <input
                            type="text"
                            required
                            value={quizAnswers[String(q.id)] || ''}
                            onChange={(e) => setQuizAnswers({ ...quizAnswers, [String(q.id)]: e.target.value })}
                            placeholder={lang === 'bn' ? 'আপনার উত্তর লিখুন...' : 'Type your concise answer...'}
                            className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#FBF3DC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-base"
                          />
                        ) : (
                          <div className="space-y-2">
                            {(q.choices || []).map((ch: any) => {
                              const checked = quizAnswers[String(q.id)] === String(ch.id)
                              return (
                                <label
                                  key={ch.id}
                                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                    checked
                                      ? 'border-[#F97316] bg-[#F97316]/10'
                                      : 'border-slate-200 dark:border-slate-800 bg-[#FBF3DC] dark:bg-slate-950'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`q_${q.id}`}
                                    required
                                    checked={checked}
                                    onChange={() =>
                                      setQuizAnswers({ ...quizAnswers, [String(q.id)]: String(ch.id) })
                                    }
                                    className="w-4 h-4 accent-orange-600"
                                  />
                                  <span className="text-sm text-slate-800 dark:text-slate-200">
                                    {bf(ch, 'text', lang)}
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                        )}

                        {quizResult?.question_results && (
                          <div className="text-xs font-mono">
                            {quizResult.question_results[String(q.id)] ? (
                              <span className="text-[#059669] font-semibold">✓ Correct</span>
                            ) : (
                              <span className="text-rose-500 font-semibold">
                                ✗ Incorrect (Answer key protected by Zero-Leakage Policy)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      type="submit"
                      disabled={submittingQuiz}
                      className="min-h-[48px] px-6 rounded-xl btn-luxury-primary text-white font-semibold text-sm flex items-center justify-center gap-2 tactile-press cursor-pointer shadow-md"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {submittingQuiz
                          ? 'Grading on Server...'
                          : lang === 'bn'
                          ? 'কুইজ সাবমিট করুন'
                          : 'Submit Assessment'}
                      </span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: Timestamped Smart Notes (Preserves SQL/Code safely + PDF Export) */}
            {activeTab === 'notes' && activeLesson && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#FBF3DC] dark:bg-[#102A44] p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                       {lang === 'bn' ? 'স্মার্ট স্টাডি নোটবুক' : 'Timestamped Code & Study Notes'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {lang === 'bn'
                        ? 'SQL কোড (SELECT * FROM users -- comment) ও টাইমস্ট্যাম্প নিরাপদে লিখুন'
                        : 'Supports SQL queries, code blocks, and clickable [MM:SS] markers'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleInsertTimestamp}
                      className="min-h-[40px] px-3 rounded-xl bg-slate-900/5 dark:bg-[#FBF3DC]/10 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold flex items-center gap-1.5 tactile-press cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Timestamp</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadNotePdf}
                      className="min-h-[40px] px-3 rounded-xl btn-luxury-glass text-xs font-semibold flex items-center gap-1.5 tactile-press cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={7}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write your study notes, SQL queries, or [04:15] key takeaways..."
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-sm leading-relaxed focus:outline-none focus:border-slate-900/30"
                />

                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="min-h-[46px] px-6 rounded-xl btn-luxury-primary text-white text-xs sm:text-sm font-semibold tactile-press cursor-pointer shadow-md"
                >
                  {savingNote ? 'Saving...' : lang === 'bn' ? 'নোট সেভ করুন' : 'Save Study Notes'}
                </button>
              </div>
            )}

            {/* TAB 4: Threaded Q&A Discussions (XSS Sanitized) */}
            {activeTab === 'discussions' && activeLesson && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#FBF3DC] dark:bg-[#102A44] p-5 sm:p-6 space-y-6">
                <form onSubmit={handlePostDiscussion} className="space-y-3">
                  <label className="block font-display font-bold text-base text-slate-900 dark:text-white">
                    {replyParentId
                      ? `Replying to comment #${replyParentId}`
                      : lang === 'bn'
                      ? 'মেন্টরকে প্রশ্ন করুন (Q&A)'
                      : 'Ask a Technical Question in This Lesson'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={
                        lang === 'bn'
                          ? 'আপনার প্রশ্ন বা কোড সমস্যার কথা লিখুন...'
                          : 'Ask about FastAPI, SQLAlchemy, React, or share a snippet...'
                      }
                      className="flex-1 min-h-[46px] px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-base"
                    />
                    <button
                      type="submit"
                      className="min-h-[46px] px-5 rounded-xl btn-luxury-primary text-white text-xs font-semibold flex items-center gap-1.5 tactile-press cursor-pointer shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      <span>Post</span>
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  {discussions.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">
                            {d.user_name}
                          </span>
                          {d.is_mentor_reply && (
                            <span className="px-2 py-0.5 rounded bg-[#F97316]/20 text-[#FB923C] text-[10px] font-mono font-bold">
                              MENTOR
                            </span>
                          )}
                          {d.is_pinned && (
                            <span className="px-2 py-0.5 rounded bg-[#D97706]/20 text-[#F59E0B] text-[10px] font-mono font-bold">
                              PINNED
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setReplyParentId(d.id)}
                          className="text-xs text-[#F97316] hover:underline cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{d.comment}</p>

                      {(d.replies || []).length > 0 && (
                        <div className="pl-4 border-l-2 border-[#F97316]/40 space-y-2.5 pt-2">
                          {d.replies.map((rep: any) => (
                            <div key={rep.id} className="text-xs sm:text-sm space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {rep.user_name}
                                </span>
                                {rep.is_mentor_reply && (
                                  <span className="px-1.5 py-0.5 rounded bg-[#059669]/20 text-[#34D399] text-[10px] font-mono font-bold">
                                    VERIFIED MENTOR
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-600 dark:text-slate-300">{rep.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: Final Project & Live Classes */}
            {activeTab === 'project' && (
              <div className="space-y-6">
                {data.course.final_project_title && (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#FBF3DC] dark:bg-[#102A44] p-5 sm:p-6 space-y-4">
                    <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                      Final Capstone Project: {data.course.final_project_title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {data.course.final_project_description}
                    </p>

                    {data.project_submission?.grade !== null && data.project_submission?.grade !== undefined && (
                      <div className="p-4 rounded-xl bg-[#059669]/12 border border-[#059669]/30 text-sm">
                        <div className="font-bold text-[#059669]">
                          Graded by Mentor: {data.project_submission.grade} / 100
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          Feedback: {data.project_submission.feedback}
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleProjectSubmit} className="space-y-3">
                      <input
                        type="url"
                        required
                        value={projectUrl}
                        onChange={(e) => setProjectUrl(e.target.value)}
                        placeholder="https://github.com/username/capstone-project"
                        className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-base"
                      />
                      <textarea
                        rows={3}
                        value={projectNotes}
                        onChange={(e) => setProjectNotes(e.target.value)}
                        placeholder="Architecture notes, live demo credentials, or deployment notes..."
                        className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
                      />
                      <button
                        type="submit"
                        className="min-h-[46px] px-5 rounded-xl btn-luxury-primary text-white text-xs sm:text-sm font-semibold tactile-press cursor-pointer shadow-md"
                      >
                        {lang === 'bn' ? 'প্রজেক্ট সাবমিট করুন' : 'Submit Capstone for Grading'}
                      </button>
                    </form>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#FBF3DC] dark:bg-[#102A44] p-5 sm:p-6 space-y-4">
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Video className="w-4 h-4 text-slate-900 dark:text-white" />
                    <span>{lang === 'bn' ? 'নির্ধারিত লাইভ ক্লাস' : 'Scheduled Live Classes'}</span>
                  </h3>
                  {(data.live_classes || []).map((lc: any) => (
                    <div
                      key={lc.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">
                          {bf(lc, 'title', lang)}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          {new Date(lc.date_time).toLocaleString()} • {lc.platform}
                        </div>
                      </div>
                      <a
                        href={lc.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-[40px] px-4 rounded-xl btn-luxury-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        Join Session
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: In-Player Interactive CodeLab Runner */}
            {activeTab === 'codelab' && (
              <div className="space-y-4">
                <div className="apple-card rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#059669]/15 text-[#059669] text-xs font-mono font-semibold">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Interactive Code Practice</span>
                      </div>
                      <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mt-1">
                        {lang === 'bn' ? 'লেসন সংশ্লিষ্ট কোড প্র্যাকটিস' : 'In-Player CodeLab Challenge'}
                      </h2>
                    </div>
                    <Link
                      to="/codelab"
                      className="px-4 py-2 rounded-xl btn-luxury-primary text-white text-xs font-semibold flex items-center gap-1.5 tactile-press shrink-0 shadow-sm"
                    >
                      <span>{lang === 'bn' ? 'ফুল-স্ক্রিন কোডল্যাব' : 'Open Fullscreen CodeLab'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {lang === 'bn'
                      ? 'ভিডিও দেখার পাশাপাশি সরাসরি ব্রাউজারে কোড লিখুন এবং টেস্ট কেস চালিয়ে ফলাফল যাচাই করুন।'
                      : 'Solve coding problems directly alongside the lecture. Write your solution and verify against test cases in real-time.'}
                  </p>

                  <div className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs space-y-2 border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                      <span>Python 3.14 • Zero-Sandboxed Runtime</span>
                      <span className="text-[#34D399] font-bold">Ready</span>
                    </div>
                    <p className="text-slate-400">
                      # Problem: Safe Parameterized DB Query Formulation
                    </p>
                    <pre className="text-[#34D399] overflow-x-auto whitespace-pre-wrap">
                      {`def filter_students(min_score: int):\n    # Return parameterized SQL bindings to eliminate injection risks\n    return ("SELECT * FROM users WHERE score >= :min_score", {"min_score": min_score})`}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-mono text-slate-500">
                      {lang === 'bn' ? '৫০+ ইন্টারভিউ প্রবলেম উপলব্ধ' : '50+ Verified Assessment Problems'}
                    </span>
                    <Link
                      to="/codelab"
                      className="text-xs font-semibold text-slate-900 dark:text-white hover:underline flex items-center gap-1"
                    >
                      <span>{lang === 'bn' ? 'কোডল্যাব ব্রাউজ করুন' : 'Browse All Code Challenges'}</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Columns: Sequential Course Syllabus Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-4 px-4 sm:px-0">
          <div className="apple-card rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
                {lang === 'bn' ? 'কোর্স মডিউল ও লেসন' : 'Course Curriculum'}
              </h2>
              <span className="text-xs font-mono text-slate-900 dark:text-white font-semibold">
                {data.lessons.filter((l: any) => l.is_completed).length}/{data.lessons.length} Done
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.lessons.map((les: any) => {
                const isCurrent = activeLesson?.id === les.id
                return (
                  <button
                    key={les.id}
                    type="button"
                    onClick={() => selectLesson(les)}
                    className={`w-full p-4 text-left flex items-start justify-between gap-3 transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-900/10 dark:bg-[#FBF3DC]/10 border-l-4 border-slate-900 dark:border-white'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {les.is_completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                        ) : les.is_locked ? (
                          <Lock className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Play className="w-4 h-4 text-slate-900 dark:text-white" />
                        )}
                      </div>
                      <div>
                        <div
                          className={`text-xs sm:text-sm font-semibold ${
                            les.is_locked
                              ? 'text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {bf(les, 'title', lang)}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {les.duration_minutes}m
                          </span>
                          {!les.is_locked && (
                            <span>• Watched {les.watch_percentage}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Issue Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleReportIssue}
            className="w-full max-w-md rounded-2xl bg-[#FBF3DC] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl"
          >
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Report Lesson Issue
            </h3>
            <textarea
              required
              rows={4}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Describe the video, audio, or quiz issue..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="min-h-[42px] px-4 rounded-xl btn-luxury-glass text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-4 rounded-xl btn-luxury-primary text-white text-xs font-semibold cursor-pointer shadow-md"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
