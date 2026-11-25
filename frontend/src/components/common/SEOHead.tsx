import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppStore } from '../../stores/useAppStore'

interface SEOProps {
  title?: string
  description?: string
  canonicalUrl?: string
  schemaJson?: Record<string, any>
}

const routeSEOMap: Record<string, { titleBn: string; titleEn: string; descBn: string; descEn: string }> = {
  '/': {
    titleBn: 'Training Pundit — Full-Stack Cloud & Software Engineering LMS',
    titleEn: 'Training Pundit — Full-Stack Cloud & Software Engineering LMS',
    descBn: 'বাংলায় প্রোডাকশন-রেডি ক্লাউড ইঞ্জিনিয়ারিং, রিয়্যাক্ট ১৯, ফাস্টএপিআই ও ডিস্ট্রিবিউটেড সিস্টেমস শিখুন। সরাসরি লাইভ মেন্টরশিপ ও জব প্লেসমেন্ট।',
    descEn: 'Master production-grade cloud engineering, React 19, FastAPI, and distributed systems in Bengali & English with 1-on-1 mentorship.',
  },
  '/courses': {
    titleBn: 'কোর্সসমূহ ও ক্যারিয়ার ট্র্যাকস | Training Pundit',
    titleEn: 'Career Tracks & Cloud Courses | Training Pundit',
    descBn: 'আধুনিক সফটওয়্যার ডেভেলপমেন্ট, ক্লাউড আর্কিটেকচার ও ডেভঅপসের সকল মাস্টারক্লাস ও লাইভ ব্যাচ এক্সপ্লোর করুন।',
    descEn: 'Explore industry-vetted career tracks in modern web, cloud infrastructure, and zero-trust backend systems.',
  },
  '/jobs': {
    titleBn: 'জব প্লেসমেন্ট ক্যাম্প ও গ্র্যাজুয়েট হায়ার | Training Pundit',
    titleEn: 'Job Placement Camp & Talent Pipeline | Training Pundit',
    descBn: 'সার্টিফাইড গ্র্যাজুয়েটদের জন্য দেশের শীর্ষ টেক কোম্পানি ব্রেন স্টেশন ২৩, আস্থা আইটি ও রিভ সিস্টেমে সরাসরি ইন্টারভিউ ও ক্যারিয়ার সুযোগ।',
    descEn: 'Direct career placement pipeline for certified engineers at top tech firms including Brain Station 23, Astha IT, and REVE Systems.',
  },
  '/codelab': {
    titleBn: 'ইন্টারেক্টিভ ক্লাউড কোডল্যাব | Training Pundit',
    titleEn: 'Interactive Cloud CodeLab & Evaluator | Training Pundit',
    descBn: 'ব্রাউজারেই বাস্তব জীবনের অ্যালগরিদম ও এসকিউএল সিকিউরিটি প্রবলেম সমাধান করুন। রিয়েল-টাইম টেস্ট কেস ও এক্সপি আর্ন করুন।',
    descEn: 'Solve real-world algorithm and database security challenges in your browser with instant test validation and gamification XP.',
  },
  '/store': {
    titleBn: 'ডিজিটাল অ্যাসেট স্টোর ও আর্কিটেকচার হ্যান্ডবুক | Training Pundit',
    titleEn: 'Digital Asset Store & Architecture Vault | Training Pundit',
    descBn: 'প্রোডাকশন-গ্রেড বয়লারপ্লেট, ক্লাউড ব্লুপ্রিন্ট ও আর্কিটেকচার হ্যান্ডবুক সংগ্রহ করুন।',
    descEn: 'Download production-ready microservice boilerplates, architectural handbooks, and design token kits.',
  },
  '/blog': {
    titleBn: 'ইঞ্জিনিয়ারিং ও সাইবার সিকিউরিটি ব্লগ | Training Pundit',
    titleEn: 'Engineering & Cybersecurity Articles | Training Pundit',
    descBn: 'ফাস্টএপিআই, এসকিউএল ইনজেকশন প্রতিরোধ, রিয়্যাক্ট ১৯ পারফরম্যান্স ও ক্লাউড সিস্টেম নিয়ে টেকনিক্যাল আর্টিকেল।',
    descEn: 'Deep-dive technical articles on FastAPI, OWASP security defenses, React 19 performance, and cloud systems.',
  },
  '/verify-certificate': {
    titleBn: 'অফিশিয়াল সার্টিফিকেট ভেরিফিকেশন পোর্টাল | Training Pundit',
    titleEn: 'Official Certificate Verification Portal | Training Pundit',
    descBn: 'সার্টিফিকেট আইডি অথবা কিউআর কোডের মাধ্যমে তাৎক্ষণিকভাবে প্রজেক্ট গ্রেড ও কোর্স সমাপ্তির সত্যতা যাচাই করুন।',
    descEn: 'Verify genuine student credentials, course completion, and capstone grades via authenticated cryptographic IDs.',
  },
  '/leaderboard': {
    titleBn: 'স্টুডেন্ট লিডারবোর্ড ও লার্নিং স্ট্রিক | Training Pundit',
    titleEn: 'Student Leaderboard & Learning Streaks | Training Pundit',
    descBn: 'নিয়মিত পড়াশোনার ধারাবাহিকতা বজায় রেখে লিডারবোর্ডের শীর্ষে পৌঁছান এবং বিশেষ ব্যাজ আনলক করুন।',
    descEn: 'Track continuous learning streaks, assessment milestones, and compete on the global cohort leaderboard.',
  },
}

export const SEOHead: React.FC<SEOProps> = ({ title, description, canonicalUrl, schemaJson }) => {
  const location = useLocation()
  const { lang } = useAppStore()

  useEffect(() => {
    // 1. Resolve Title & Description
    const routeInfo = routeSEOMap[location.pathname]
    let resolvedTitle = title
    let resolvedDesc = description

    if (!resolvedTitle && routeInfo) {
      resolvedTitle = lang === 'bn' ? routeInfo.titleBn : routeInfo.titleEn
    }
    if (!resolvedTitle) {
      resolvedTitle = 'Training Pundit — Cloud LMS 2.0'
    }

    if (!resolvedDesc && routeInfo) {
      resolvedDesc = lang === 'bn' ? routeInfo.descBn : routeInfo.descEn
    }
    if (!resolvedDesc) {
      resolvedDesc =
        'বাংলায় প্রোডাকশন-রেডি ক্লাউড ইঞ্জিনিয়ারিং, রিয়্যাক্ট ১৯, ফাস্টএপিআই ও ডিস্ট্রিবিউটেড সিস্টেমস শিখুন।'
    }

    // 2. Update Document Title
    document.title = resolvedTitle

    // 3. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', resolvedDesc)

    // 4. Update OG & Twitter Meta
    const updateOrCreateMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    updateOrCreateMeta('property', 'og:title', resolvedTitle)
    updateOrCreateMeta('property', 'og:description', resolvedDesc)
    updateOrCreateMeta('name', 'twitter:title', resolvedTitle)
    updateOrCreateMeta('name', 'twitter:description', resolvedDesc)

    // 5. Update Canonical Tag
    let canonical = document.querySelector('link[rel="canonical"]')
    const targetUrl = canonicalUrl || `https://trainingpundit.com${location.pathname}`
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', targetUrl)

    // 6. Optional Dynamic Schema JSON-LD injection
    if (schemaJson) {
      const scriptId = 'dynamic-route-schema'
      let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null
      if (!scriptEl) {
        scriptEl = document.createElement('script')
        scriptEl.id = scriptId
        scriptEl.type = 'application/ld+json'
        document.head.appendChild(scriptEl)
      }
      scriptEl.textContent = JSON.stringify(schemaJson)
    }

    // Scroll to top with smooth behavior on route change
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname, lang, title, description, canonicalUrl, schemaJson])

  return null
}
