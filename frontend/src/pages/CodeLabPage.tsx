import React, { useEffect, useState } from 'react'
import {
  Code2,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Terminal,
  Trophy,
  Flame,
  Sparkles,
  ChevronRight,
  BookOpen,
  Check,
  AlertCircle,
  Zap,
} from 'lucide-react'
import { useAppStore, bf } from '../stores/useAppStore'
import { Card3D } from '../components/common/Card3D'

interface TestCase {
  input: string
  expected: string
  hidden?: boolean
}

interface CodeChallenge {
  id: number
  title: string
  title_bn: string
  category: string
  difficulty: string
  language: string
  description: string
  description_bn: string
  starter_code: string
  test_cases: TestCase[]
  points: number
}

interface TestResult {
  test_case_num: number
  input: string
  expected: string
  passed: boolean
  output: string
}

export const CodeLabPage: React.FC = () => {
  const { lang, user, showToast } = useAppStore()
  const [challenges, setChallenges] = useState<CodeChallenge[]>([])
  const [activeChallenge, setActiveChallenge] = useState<CodeChallenge | null>(null)
  const [code, setCode] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [allPassed, setAllPassed] = useState<boolean | null>(null)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [activeTab, setActiveTab] = useState<'problem' | 'output' | 'tests'>('problem')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/v1/public/codelab/challenges')
      if (res.ok) {
        const data = await res.json()
        setChallenges(data)
        if (data.length > 0) {
          setActiveChallenge(data[0])
          setCode(data[0].starter_code)
        }
      }
    } catch {
      showToast('Failed to load coding challenges', 'error')
    }
  }

  useEffect(() => {
    fetchChallenges()
  }, [])

  const handleSelectChallenge = (c: CodeChallenge) => {
    setActiveChallenge(c)
    setCode(c.starter_code)
    setTestResults([])
    setAllPassed(null)
    setActiveTab('problem')
  }

  const handleResetCode = () => {
    if (activeChallenge) {
      setCode(activeChallenge.starter_code)
      setTestResults([])
      setAllPassed(null)
      showToast(lang === 'bn' ? 'কোড রিসেট করা হয়েছে' : 'Code reset to starter template', 'info')
    }
  }

  const handleRunCode = async () => {
    if (!activeChallenge) return
    if (!user) {
      showToast(
        lang === 'bn' ? 'কোড রান ও মূল্যায়ন করতে প্রথমে সাইন ইন করুন' : 'Please sign in to run and submit code',
        'error'
      )
      return
    }

    try {
      setIsRunning(true)
      const token = localStorage.getItem('lwma_token')
      const res = await fetch(`/api/v1/student/codelab/challenges/${activeChallenge.id}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: code,
          language: activeChallenge.language,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setTestResults(data.results || [])
        setAllPassed(data.all_passed)
        setPointsEarned(data.points_earned || 0)
        setActiveTab('output')

        if (data.all_passed) {
          showToast(
            lang === 'bn'
              ? `অভিনন্দন! সকল টেস্ট পাস হয়েছে (+${data.points_earned} XP)`
              : `All test cases passed! (+${data.points_earned} XP awarded)`,
            'success'
          )
        } else {
          showToast(lang === 'bn' ? 'কিছু টেস্ট কেস ফেইল করেছে' : 'Some test cases failed', 'error')
        }
      } else {
        showToast(data.detail || 'Execution failed', 'error')
      }
    } catch {
      showToast('Network error during code execution', 'error')
    } finally {
      setIsRunning(false)
    }
  }

  const filteredChallenges = challenges.filter((c) => {
    if (selectedDifficulty === 'all') return true
    return c.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
  })

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-2xl bg-[#FBF3DC] dark:bg-[#102A44] text-[#0F2A44] dark:text-[#FFF7E8] border border-[#E0D3AF] dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full aurora-pill-accent text-xs font-mono font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-[#F97316]" />
            <span>{lang === 'bn' ? 'ইন্টারেক্টিভ ক্লাউড কোডল্যাব' : 'Interactive Cloud CodeLab'}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-display font-extrabold tracking-tight text-[#0F2A44] dark:text-[#FFF7E8]">
            {lang === 'bn' ? 'অ্যালগরিদম প্র্যাকটিস ও অটোমেটেড কোড ইভ্যালুয়েটর' : 'Algorithm Mastery & Code Evaluator'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#D9CDB8] max-w-xl leading-relaxed">
            {lang === 'bn'
              ? 'বাস্তব জীবনের অ্যালগরিদম ও ক্লাউড কোয়েরি প্রবলেম সমাধান করুন। কোড রান করুন, টেস্ট কেস ভ্যালিডেট করুন এবং এক্সপি অর্জন করুন।'
              : 'Write clean code, evaluate against test cases in real-time, and build problem-solving muscle memory.'}
          </p>
        </div>

        {/* User XP stats pill */}
        <div className="flex items-center gap-3.5 bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800 px-5 py-3.5 rounded-2xl shrink-0 shadow-xs relative z-10">
          <div className="w-11 h-11 rounded-xl bg-[#F97316] text-[#FBF3DC] flex items-center justify-center font-bold shadow-md shadow-[#F97316]/20">
            <Flame className="w-6 h-6 fill-current text-amber-300" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#6B7280] dark:text-[#D9CDB8] block font-semibold">
              {lang === 'bn' ? 'স্ট্রিক ও point' : 'Gamification Points'}
            </span>
            <span className="text-lg font-bold text-[#0F2A44] dark:text-[#FFF7E8] font-mono">
              +{pointsEarned > 0 ? pointsEarned : activeChallenge?.points || 50} XP
            </span>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-[#F97316]/10 dark:bg-[#F97316]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Grid: Challenge Sidebar + Code Editor Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Challenge Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-xs uppercase font-mono tracking-wider font-semibold text-[#6B7280] dark:text-[#D9CDB8]">
              {lang === 'bn' ? 'প্রবলেম তালিকা' : 'Challenges'} ({filteredChallenges.length})
            </h2>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1">
              {['all', 'easy', 'medium'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 min-h-[32px] rounded-lg text-[10px] font-mono capitalize tactile-press cursor-pointer font-semibold transition-colors ${
                    selectedDifficulty === diff
                      ? 'aurora-btn-primary shadow-xs'
                      : 'aurora-btn-secondary'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredChallenges.map((c) => {
              const isSelected = activeChallenge?.id === c.id
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectChallenge(c)}
                  className={`p-4 rounded-2xl aurora-card cursor-pointer tactile-press bg-[#FBF3DC] dark:bg-[#102A44] border transition-all ${
                    isSelected
                      ? 'border-[#F97316] dark:border-[#FB923C] ring-2 ring-[#F97316]/20 dark:ring-[#F97316]/20 shadow-md'
                      : 'border-[#E0D3AF] dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold font-display text-[#0F2A44] dark:text-[#FFF7E8] truncate">
                      {bf(c, 'title', lang)}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 border ${
                        c.difficulty.toLowerCase() === 'easy'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : c.difficulty.toLowerCase() === 'medium'
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {c.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2.5 text-[11px] font-mono text-[#6B7280] dark:text-[#D9CDB8]">
                    <span className="capitalize px-2 py-0.5 rounded-md bg-[#E9D9B4] dark:bg-[#16324F] font-semibold text-[#0F2A44] dark:text-[#FFF7E8] border border-[#E0D3AF] dark:border-slate-800">{c.language}</span>
                    <span className="text-[#F97316] dark:text-[#F97316] font-bold">+{c.points} XP</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Editor & Problem View */}
        <div className="lg:col-span-8 space-y-4">
          {activeChallenge ? (
            <div className="aurora-card-raised rounded-2xl overflow-hidden flex flex-col shadow-md border border-[#E0D3AF] dark:border-slate-800 bg-[#0A1E33]">
              {/* Header toolbar */}
              <div className="px-5 py-3.5 border-b border-slate-800 bg-[#102A44] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                  <span className="ml-2.5 text-xs font-mono font-bold text-[#FFF7E8]">
                    {activeChallenge.title} <span className="text-[#D9CDB8]">({activeChallenge.language.toUpperCase()})</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetCode}
                    className="min-h-[36px] px-3.5 rounded-xl aurora-btn-secondary text-xs font-medium flex items-center gap-1.5 tactile-press cursor-pointer"
                    title="Reset to starter code"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{lang === 'bn' ? 'রিসেট' : 'Reset'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="min-h-[36px] px-4 rounded-xl aurora-btn-primary text-xs font-semibold flex items-center gap-1.5 tactile-press cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {isRunning
                        ? lang === 'bn'
                          ? 'মূল্যায়ন চলছে...'
                          : 'Evaluating...'
                        : lang === 'bn'
                        ? 'কোড রান করুন'
                        : 'Run & Submit'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Code Editor Area */}
              <div className="p-4 bg-[#0A1E33] text-[#FFF7E8] font-mono text-xs sm:text-sm">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={14}
                  spellCheck={false}
                  className="w-full bg-transparent text-[#F97316] font-mono resize-y focus:outline-hidden leading-relaxed selection:bg-[#F97316]/30"
                  placeholder="# Write your solution here..."
                />
              </div>

              {/* Bottom Inspection Tabs (Problem Statement / Test Cases / Output Console) */}
              <div className="border-t border-slate-800 bg-[#102A44] p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  {[
                    { id: 'problem', label: lang === 'bn' ? 'সমস্যার বিবরণ' : 'Description', icon: BookOpen },
                    { id: 'tests', label: lang === 'bn' ? 'টেস্ট কেস' : 'Sample Tests', icon: CheckCircle2 },
                    { id: 'output', label: lang === 'bn' ? 'আউটপুট টার্মিনাল' : 'Evaluation Terminal', icon: Terminal },
                  ].map((tab) => {
                    const Icon = tab.icon
                    const isTabActive = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`min-h-[34px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 tactile-press cursor-pointer transition-colors ${
                          isTabActive
                            ? 'aurora-btn-primary shadow-xs'
                            : 'aurora-btn-secondary text-[#D9CDB8]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Tab 1: Problem Description */}
                {activeTab === 'problem' && (
                  <div className="text-xs sm:text-sm text-[#D9CDB8] space-y-2 max-h-48 overflow-y-auto leading-relaxed">
                    <p className="whitespace-pre-line font-sans">
                      {bf(activeChallenge, 'description', lang)}
                    </p>
                  </div>
                )}

                {/* Tab 2: Sample Tests */}
                {activeTab === 'tests' && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {activeChallenge.test_cases.map((tc, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#16324F] border border-slate-800 font-mono text-xs space-y-1"
                      >
                        <div className="text-[#D9CDB8]">
                          <span className="font-semibold text-[#FFF7E8]">Input:</span>{' '}
                          {tc.input}
                        </div>
                        <div className="text-[#F97316]">
                          <span className="font-semibold text-[#FFF7E8]">Expected:</span>{' '}
                          {tc.expected}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Evaluation Output */}
                {activeTab === 'output' && (
                  <div className="space-y-3">
                    {testResults.length === 0 ? (
                      <div className="p-6 text-center text-xs font-mono text-[#D9CDB8] bg-[#16324F] rounded-xl border border-slate-800">
                        {lang === 'bn'
                          ? 'কোড রান করুন ফলাফল দেখার জন্য...'
                          : 'Run your code to evaluate against test cases.'}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {allPassed ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-4 h-4" />
                                {lang === 'bn' ? 'সকল টেস্ট সফল হয়েছে!' : 'Accepted / All Tests Passed'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <XCircle className="w-4 h-4" />
                                {lang === 'bn' ? 'ভুল আউটপুট / টেস্ট ব্যর্থ' : 'Wrong Answer / Failed'}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-[#D9CDB8]">
                            Execution: ~42ms • Memory: 14MB
                          </span>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {testResults.map((r) => (
                            <div
                              key={r.test_case_num}
                              className={`p-3 rounded-xl border font-mono text-xs space-y-1 ${
                                r.passed
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold">Test Case #{r.test_case_num}</span>
                                <span>{r.passed ? 'PASSED' : 'FAILED'}</span>
                              </div>
                              <div className="text-[11px] opacity-80">Input: {r.input}</div>
                              <div className="text-[11px] opacity-80">Expected: {r.expected}</div>
                              <div className="text-[11px] font-semibold">Your Output: {r.output}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-[#6B7280] dark:text-[#D9CDB8]">Loading challenge workspace...</div>
          )}
        </div>
      </div>
    </div>
  )
}
