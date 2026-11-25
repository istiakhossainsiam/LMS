import React from 'react'

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  /** Kept for API compatibility — tilt/glare were removed in the UI redesign. */
  glare?: boolean
  maxTilt?: number
  scale?: number
  floating?: boolean
}

/**
 * Plain card wrapper (redesign 2026-11-25).
 * The old 3D tilt + radial glare conflicted with the quiet editorial
 * design system (DESIGN.md: no decorative gradients / 3D effects).
 * All call sites keep working unchanged; this is now just a div.
 */
export const Card3D: React.FC<Card3DProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`relative ${className}`} style={{ touchAction: 'pan-y pinch-zoom', ...props.style }} {...props}>
      {children}
    </div>
  )
}
