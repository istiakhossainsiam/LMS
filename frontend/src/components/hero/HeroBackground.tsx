import React, { useState, useEffect, useRef } from 'react'

interface HeroBackgroundProps {
  videoSrc?: string
  className?: string
}

export const HeroBackground: React.FC<HeroBackgroundProps> = ({
  videoSrc = '/assets/learning-horizon.mp4',
  className = '',
}) => {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [canPlayVideo, setCanPlayVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Check reduced motion & data saver preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.innerWidth < 768
    const saveData = (navigator as any)?.connection?.saveData === true

    // Enable video only on desktop if not reduced motion and not data saver
    if (!prefersReducedMotion && !isMobile && !saveData && videoSrc) {
      setCanPlayVideo(true)
    }
  }, [videoSrc])

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none bg-[#0A1E33] ${className}`}
      style={{ zIndex: 0 }}
    >
      {/* 1. Static "Learning Horizon" Composition (Always Present Fallback & Native Mobile Canvas) */}
      <div className="absolute inset-0">
        {/* Deep Atmospheric Base Gradients */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 80% at 50% -10%, #0A1E33 0%, #0A1E33 65%, #0A1E33 100%)`,
          }}
        />

        {/* The Curved Learning Horizon Arc — warm orange glow (#F97316) on navy */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[580px] max-w-[160vw]">
          {/* Broad Atmospheric Aurora Glow */}
          <div
            className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[1100px] h-[340px] rounded-[100%] blur-[70px] opacity-70"
            style={{
              background: `radial-gradient(ellipse at 50% 40%, rgba(249, 115, 22, 0.45) 0%, rgba(249, 115, 22, 0.28) 45%, transparent 75%)`,
            }}
          />

          {/* Precision SVG Horizon Curve */}
          <svg
            className="absolute top-8 left-0 w-full h-[320px] overflow-visible"
            viewBox="0 0 1400 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="horizonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0" />
                <stop offset="25%" stopColor="#F97316" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#F97316" stopOpacity="0.85" />
                <stop offset="75%" stopColor="#F97316" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="horizonCore" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="10%" stopColor="#F97316" stopOpacity="0" />
                <stop offset="35%" stopColor="#FB923C" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#FFF1E6" stopOpacity="0.95" />
                <stop offset="65%" stopColor="#F97316" stopOpacity="0.7" />
                <stop offset="90%" stopColor="#F97316" stopOpacity="0" />
              </linearGradient>

              <filter id="softGlow" x="-20%" y="-40%" width="140%" height="180%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Diffused Outer Halo */}
            <path
              d="M 50 200 Q 700 20 1350 200"
              stroke="url(#horizonGlow)"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.65"
              filter="url(#softGlow)"
            />

            {/* Crisp Inner Horizon Line */}
            <path
              d="M 120 190 Q 700 30 1280 190"
              stroke="url(#horizonCore)"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.85"
            />
          </svg>

          {/* Quiet Center Mask for Uncompromised Headline Contrast */}
          <div
            className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[720px] h-[360px] rounded-full blur-[40px] pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, rgba(6, 11, 24, 0.85) 0%, rgba(6, 11, 24, 0.4) 60%, transparent 100%)`,
            }}
          />
        </div>

        {/* Static Procedural Dust / Starfield Particles (Drawn Once, Non-Animated to Avoid Paint Thrashing) */}
        <div className="absolute inset-0 opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12%" cy="18%" r="1" fill="#FFF7E8" opacity="0.4" />
            <circle cx="22%" cy="32%" r="1.5" fill="#F97316" opacity="0.6" />
            <circle cx="38%" cy="14%" r="1" fill="#FFF7E8" opacity="0.3" />
            <circle cx="48%" cy="26%" r="1.2" fill="#F97316" opacity="0.5" />
            <circle cx="64%" cy="12%" r="1.5" fill="#FFF7E8" opacity="0.55" />
            <circle cx="76%" cy="28%" r="1" fill="#F97316" opacity="0.4" />
            <circle cx="88%" cy="16%" r="1.4" fill="#FFF7E8" opacity="0.45" />
            <circle cx="94%" cy="38%" r="1" fill="#F97316" opacity="0.3" />
            <circle cx="18%" cy="58%" r="1.2" fill="#FFF7E8" opacity="0.25" />
            <circle cx="82%" cy="62%" r="1" fill="#FFF7E8" opacity="0.3" />
          </svg>
        </div>
      </div>

      {/* 2. Optional Seamless Video Layer (Fades in gently only if present & ready) */}
      {canPlayVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => setVideoLoaded(true)}
          onError={() => setVideoLoaded(false)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-40 mix-blend-screen' : 'opacity-0'
          }`}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* 3. Bottom Horizon Gradient Transition into Application Surface */}
      <div
        className="absolute bottom-0 inset-x-0 h-48 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, rgba(6, 11, 24, 0.8) 60%, #0A1E33 100%)`,
        }}
      />
    </div>
  )
}
