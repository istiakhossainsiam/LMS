import React, { useRef, useState, useCallback, useEffect } from 'react'

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  glare?: boolean
  maxTilt?: number
  scale?: number
  floating?: boolean
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  glare = true,
  maxTilt = 7,
  scale = 1.012,
  floating = false,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number | null>(null)
  const [isTouch, setIsTouch] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(pointer: coarse)').matches ||
      !window.matchMedia('(hover: hover)').matches ||
      window.innerWidth < 768
    )
  })
  const [transformStyle, setTransformStyle] = useState<string>('')
  const [glareStyle, setGlareStyle] = useState<{ opacity: number; x: number; y: number }>({
    opacity: 0,
    x: 50,
    y: 50,
  })
  const [isHovered, setIsHovered] = useState(false)

  // Detect mobile/touch devices once on mount to permanently bypass all 3D JS overhead on mobile
  useEffect(() => {
    const checkTouch = () => {
      const isCoarse = window.matchMedia('(pointer: coarse)').matches
      const noHover = !window.matchMedia('(hover: hover)').matches
      const isSmall = window.innerWidth < 768
      setIsTouch(isCoarse || noHover || isSmall)
    }
    checkTouch()
    window.addEventListener('resize', checkTouch, { passive: true })
    return () => window.removeEventListener('resize', checkTouch)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isTouch || !cardRef.current) return

      if (rafId.current) cancelAnimationFrame(rafId.current)

      rafId.current = requestAnimationFrame(() => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2

        const rotateX = ((y - centerY) / centerY) * -maxTilt
        const rotateY = ((x - centerX) / centerX) * maxTilt
        const glareX = (x / rect.width) * 100
        const glareY = (y / rect.height) * 100

        setTransformStyle(
          `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
        )
        setGlareStyle({ opacity: 0.16, x: glareX, y: glareY })
      })
    },
    [isTouch, maxTilt, scale]
  )

  const handleMouseEnter = useCallback(() => {
    if (isTouch) return
    setIsHovered(true)
  }, [isTouch])

  const handleMouseLeave = useCallback(() => {
    if (isTouch) return
    if (rafId.current) cancelAnimationFrame(rafId.current)
    setIsHovered(false)
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
    setGlareStyle((prev) => ({ ...prev, opacity: 0 }))
  }, [isTouch])

  // Pure zero-cost rendering for mobile/touch
  if (isTouch) {
    return (
      <div
        ref={cardRef}
        className={`relative rounded-3xl transition-transform duration-200 active:scale-[0.99] ${className}`}
        style={{ touchAction: 'pan-y pinch-zoom', ...props.style }}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transformStyle: 'preserve-3d',
        touchAction: 'pan-y pinch-zoom',
        transition: isHovered
          ? 'transform 100ms cubic-bezier(0.2, 0, 0, 1)'
          : 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        ...props.style,
      }}
      className={`relative rounded-3xl ${floating ? 'card-3d-floating' : ''} ${className}`}
      {...props}
    >
      {children}

      {glare && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] overflow-hidden transition-opacity duration-300"
          style={{
            opacity: glareStyle.opacity,
            background: `radial-gradient(circle 220px at ${glareStyle.x}% ${glareStyle.y}%, rgba(255, 255, 255, 0.75), transparent 70%)`,
          }}
        />
      )}
    </div>
  )
}

