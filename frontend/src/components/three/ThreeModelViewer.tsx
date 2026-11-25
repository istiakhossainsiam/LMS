import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Box, Layers, RotateCcw } from 'lucide-react'

interface ThreeModelViewerProps {
  title?: string
  subtitle?: string
  className?: string
  height?: string
}

export const ThreeModelViewer: React.FC<ThreeModelViewerProps> = ({
  title = 'Autonomous Node Architecture',
  subtitle = 'Blender Shaded 3D Procedural Core • Orbit to Inspect',
  className = '',
  height = 'h-72 sm:h-80',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRotating, setIsRotating] = useState(true)
  const [wireframe, setWireframe] = useState(false)
  const resetCameraRef = useRef<(() => void) | null>(null)
  const toggleWireframeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationFrameId: number
    let isVisible = true

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    )
    camera.position.set(4, 3, 5)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // 2. Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxDistance = 10
    controls.minDistance = 2.5
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.8
    controls.enablePan = false

    resetCameraRef.current = () => {
      camera.position.set(4, 3, 5)
      controls.target.set(0, 0, 0)
      controls.update()
    }

    // 3. Studio Lights
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
    keyLight.position.set(5, 8, 4)
    keyLight.castShadow = true
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0x35c6be, 2.2)
    rimLight.position.set(-4, -2, -4)
    scene.add(rimLight)

    const blueLight = new THREE.PointLight(0x356dff, 3, 10)
    blueLight.position.set(0, 1.5, 0)
    scene.add(blueLight)

    const ambientLight = new THREE.AmbientLight(0x0c1528, 1.5)
    scene.add(ambientLight)

    // 4. Construct Procedural Blender 3D Architectural Node
    const rootGroup = new THREE.Group()
    scene.add(rootGroup)

    const materialsToToggle: THREE.MeshStandardMaterial[] = []

    // Center Core (Chamfered Tech Hub)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x14213a,
      roughness: 0.25,
      metalness: 0.85,
    })
    materialsToToggle.push(coreMat)
    const coreGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4)
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    coreMesh.castShadow = true
    coreMesh.receiveShadow = true
    rootGroup.add(coreMesh)

    // Core Edge Wireframe Overlay
    const wireGeo = new THREE.EdgesGeometry(coreGeo)
    const wireMat = new THREE.LineBasicMaterial({ color: 0x35c6be, linewidth: 2 })
    const wireLine = new THREE.LineSegments(wireGeo, wireMat)
    coreMesh.add(wireLine)

    // Inner Glowing Crystal (Icosahedron)
    const crystalGeo = new THREE.IcosahedronGeometry(0.55, 0)
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x356dff,
      emissive: 0x356dff,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9,
    })
    materialsToToggle.push(crystalMat)
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat)
    rootGroup.add(crystalMesh)

    // Orbital Data Rings
    const ringGeo = new THREE.TorusGeometry(2.1, 0.04, 16, 64)
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x35c6be,
      metalness: 0.9,
      roughness: 0.2,
    })
    materialsToToggle.push(ringMat)
    const ring1 = new THREE.Mesh(ringGeo, ringMat)
    ring1.rotation.x = Math.PI * 0.35
    rootGroup.add(ring1)

    const ring2 = new THREE.Mesh(ringGeo, ringMat)
    ring2.rotation.y = Math.PI * 0.45
    ring2.scale.set(1.15, 1.15, 1.15)
    rootGroup.add(ring2)

    // Satellite Data Cubes orbiting around core
    const satellites: THREE.Mesh[] = []
    const satGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35)
    for (let i = 0; i < 4; i++) {
      const satMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x356dff : 0x35c6be,
        roughness: 0.3,
        metalness: 0.7,
      })
      materialsToToggle.push(satMat)
      const sat = new THREE.Mesh(satGeo, satMat)
      sat.castShadow = true
      rootGroup.add(sat)
      satellites.push(sat)
    }

    toggleWireframeRef.current = () => {
      setWireframe((prev) => {
        const next = !prev
        materialsToToggle.forEach((m) => {
          m.wireframe = next
        })
        return next
      })
    }

    // 5. IntersectionObserver for auto-pause when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting
        })
      },
      { threshold: 0.05 }
    )
    observer.observe(container)

    // 6. Resize handling
    const handleResize = () => {
      if (!container) return
      const width = container.clientWidth
      const height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // 7. Render Loop
    let clock = new THREE.Clock()
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      if (!isVisible) return

      const delta = clock.getDelta()
      const time = performance.now() * 0.001

      // Gentle internal orbits
      crystalMesh.rotation.y += delta * 1.2
      crystalMesh.rotation.x += delta * 0.8

      ring1.rotation.z += delta * 0.5
      ring2.rotation.x += delta * 0.4

      satellites.forEach((sat, i) => {
        const angle = time * 1.5 + (i * Math.PI) / 2
        const radius = 2.0
        sat.position.set(Math.cos(angle) * radius, Math.sin(angle * 0.7) * 0.8, Math.sin(angle) * radius)
        sat.rotation.x += delta * 2
        sat.rotation.y += delta * 2
      })

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      observer.disconnect()
      window.removeEventListener('resize', handleResize)

      coreGeo.dispose()
      wireGeo.dispose()
      crystalGeo.dispose()
      ringGeo.dispose()
      satGeo.dispose()
      materialsToToggle.forEach((m) => m.dispose())
      wireMat.dispose()
      controls.dispose()
      renderer.dispose()

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div className={`aurora-card rounded-2xl overflow-hidden bg-[#060B18] border border-[#E2E8F2] dark:border-slate-800 flex flex-col justify-between relative shadow-lg ${className}`}>
      {/* Header Bar with 3D Controls */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between z-10 bg-[#0C1528]/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-[#35C6BE]" />
            <h3 className="font-display font-bold text-sm text-[#F5F8FF]">{title}</h3>
          </div>
          <p className="text-[11px] font-mono text-[#A8B7CE] mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => toggleWireframeRef.current?.()}
            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
              wireframe
                ? 'bg-[#356DFF] text-white border-[#356DFF]'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Toggle Wireframe Shading"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => resetCameraRef.current?.()}
            className="p-1.5 rounded-lg border bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white text-xs cursor-pointer transition-colors"
            title="Reset 3D Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className={`w-full ${height} cursor-grab active:cursor-grabbing select-none relative`}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      />

      {/* Footer Info HUD */}
      <div className="px-4 py-2.5 bg-[#0C1528]/60 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#35C6BE]" />
          <span>THREE.JS WEBGL RENDERER • BLENDER STUDIO LIGHTING</span>
        </span>
        <span className="hidden sm:inline text-slate-500">DRAG TO ORBIT • SCROLL TO ZOOM</span>
      </div>
    </div>
  )
}
