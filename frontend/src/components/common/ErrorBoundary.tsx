import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  /** Rendered instead of the child when it throws (e.g. no-WebGL devices). */
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Catches render errors from a subtree (notably the Three.js WebGL
 * canvases, which throw "Error creating WebGL context" on devices
 * without WebGL and used to unmount the entire app, header included).
 * Renders `fallback` (default: nothing) instead of crashing the page.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.warn('Recovered from a component error:', error)
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}
