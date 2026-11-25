import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { AmmoPhysics } from 'three/examples/jsm/physics/AmmoPhysics.js'

interface ThreeHeroCanvasProps {
  className?: string
}

export const ThreeHeroCanvas: React.FC<ThreeHeroCanvasProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [wireframeMode, setWireframeMode] = useState(false)
  const [physicsReady, setPhysicsReady] = useState(false)
  const [objectsCount, setObjectsCount] = useState(0)

  // References to communicate with animation loop
  const triggerDropRef = useRef<(() => void) | null>(null)
  const toggleWireframeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationFrameId: number
    let isVisible = true
    let physicsInstance: any = null

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    // Soft atmospheric fog matching deep navy background (#0A1E33)
    scene.fog = new THREE.FogExp2(0x060b18, 0.035)

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 3, 14)
    camera.lookAt(0, 0, 0)

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
    renderer.toneMappingExposure = 1.15
    container.appendChild(renderer.domElement)

    // 2. Blender Studio 3-Point Lighting Setup
    // Key Light (Warm soft studio spotlight)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
    keyLight.position.set(6, 12, 8)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 30
    keyLight.shadow.bias = -0.0005
    scene.add(keyLight)

    // Fill Light (warm orange accent #F97316)
    const fillLight = new THREE.DirectionalLight(0xF97316, 1.4)
    fillLight.position.set(-8, 4, -4)
    scene.add(fillLight)

    // Rim / Edge Light (light orange accent #FB923C)
    const rimLight = new THREE.DirectionalLight(0xFB923C, 2.0)
    rimLight.position.set(0, -6, -6)
    scene.add(rimLight)

    // Ambient soft base
    const ambientLight = new THREE.AmbientLight(0x102A44, 1.2)
    scene.add(ambientLight)

    // 3. Materials (Blender Clay & Architectural Shading)
    const materials = [
      new THREE.MeshStandardMaterial({
        color: 0x0F2A44,
        roughness: 0.35,
        metalness: 0.65,
        wireframe: false,
      }),
      new THREE.MeshStandardMaterial({
        color: 0xF97316,
        roughness: 0.25,
        metalness: 0.5,
        wireframe: false,
      }),
      new THREE.MeshStandardMaterial({
        color: 0xFB923C,
        roughness: 0.2,
        metalness: 0.8,
        wireframe: false,
      }),
      new THREE.MeshStandardMaterial({
        color: 0x1f2e4d,
        roughness: 0.4,
        metalness: 0.3,
        wireframe: false,
      }),
    ]

    // 4. Boundary Floor & Walls for Physics Collisions
    const floorGeo = new THREE.BoxGeometry(28, 1, 20)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x060b18,
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
      opacity: 0.2,
    })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.position.set(0, -4.5, 0)
    floor.receiveShadow = true
    floor.userData.physics = { mass: 0, restitution: 0.7 }
    scene.add(floor)

    // 5. Physics Interactive Meshes
    const dynamicMeshes: THREE.Mesh[] = []
    const fallbackBodies: Array<{
      mesh: THREE.Mesh
      velocity: THREE.Vector3
      angularVelocity: THREE.Vector3
      mass: number
      restitution: number
    }> = []

    const geometries = [
      new THREE.BoxGeometry(1.2, 1.2, 1.2),
      new THREE.IcosahedronGeometry(0.85, 0),
      new THREE.DodecahedronGeometry(0.9, 0),
      new THREE.CylinderGeometry(0.6, 0.6, 1.2, 16),
      new THREE.OctahedronGeometry(0.95, 0),
    ]

    const spawnBlock = (x: number, y: number, z: number, matIdx: number, geoIdx: number) => {
      const geo = geometries[geoIdx % geometries.length]
      const mat = materials[matIdx % materials.length].clone()
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(x, y, z)
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData.physics = { mass: 1.5, restitution: 0.65 }

      scene.add(mesh)
      dynamicMeshes.push(mesh)

      // Fallback velocity for seamless physics simulation if Ammo is delayed or loading
      fallbackBodies.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.2) * 2.0,
          (Math.random() - 0.5) * 1.5
        ),
        angularVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        mass: 1.5,
        restitution: 0.65,
      })

      if (physicsInstance && typeof physicsInstance.addMesh === 'function') {
        physicsInstance.addMesh(mesh, 1.5, 0.65)
      }

      setObjectsCount(dynamicMeshes.length)
    }

    // Spawn initial aesthetic architectural clusters (left and right flanks of hero)
    // Left cluster
    spawnBlock(-5.5, 2.5, -2, 0, 0)
    spawnBlock(-4.2, 4.0, 0, 1, 1)
    spawnBlock(-6.0, 0.5, -1, 2, 2)
    spawnBlock(-3.8, 1.5, -3, 3, 3)

    // Right cluster
    spawnBlock(5.2, 3.0, -1, 1, 4)
    spawnBlock(4.0, 1.8, -2, 2, 0)
    spawnBlock(6.2, 4.2, 0, 0, 1)
    spawnBlock(4.5, 0.8, -3, 3, 2)

    // 6. Initialize Ammo.js Physics Engine with graceful fallback
    let isAmmoActive = false
    AmmoPhysics()
      .then((physics) => {
        physicsInstance = physics
        // Add floor and meshes to Ammo physics world
        physics.addMesh(floor, 0, 0.8)
        dynamicMeshes.forEach((m) => {
          physics.addMesh(m, m.userData.physics?.mass || 1.5, m.userData.physics?.restitution || 0.65)
        })
        isAmmoActive = true
        setPhysicsReady(true)
      })
      .catch((err) => {
        // High-speed Verlet fallback operates seamlessly
        console.warn('Ammo.js CDN initialization fallback to internal Verlet physics:', err?.message || err)
        setPhysicsReady(true)
      })

    // 7. Raycasting & Interactive Pointer Physics
    const mouse = new THREE.Vector2(-999, -999)
    const raycaster = new THREE.Raycaster()
    const planeIntersect = new THREE.Vector3()
    const mathPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      raycaster.ray.intersectPlane(mathPlane, planeIntersect)

      // Apply repulsive physics force field to nearby 3D blocks
      if (planeIntersect) {
        dynamicMeshes.forEach((mesh, idx) => {
          const distSq = mesh.position.distanceToSquared(planeIntersect)
          if (distSq < 16) {
            const pushDir = new THREE.Vector3().subVectors(mesh.position, planeIntersect).normalize()
            const pushStrength = (16 - distSq) * 0.08
            mesh.position.addScaledVector(pushDir, pushStrength)
            mesh.rotation.x += pushStrength * 0.5
            mesh.rotation.y += pushStrength * 0.5

            if (fallbackBodies[idx]) {
              fallbackBodies[idx].velocity.addScaledVector(pushDir, pushStrength * 1.5)
            }
          }
        })
      }
    }

    const handleClick = () => {
      // Spawn a new floating block at random top coordinate
      const spawnX = (Math.random() - 0.5) * 8
      const spawnY = 4.5 + Math.random() * 2
      const spawnZ = (Math.random() - 0.5) * 3
      spawnBlock(spawnX, spawnY, spawnZ, Math.floor(Math.random() * 4), Math.floor(Math.random() * 5))
    }

    container.addEventListener('pointermove', handlePointerMove, { passive: true })
    container.addEventListener('click', handleClick)

    // Trigger refs for external HUD buttons
    triggerDropRef.current = () => {
      for (let i = 0; i < 3; i++) {
        const x = (Math.random() - 0.5) * 7
        const y = 4 + Math.random() * 3
        const z = (Math.random() - 0.5) * 4
        spawnBlock(x, y, z, Math.floor(Math.random() * 4), Math.floor(Math.random() * 5))
      }
    }

    toggleWireframeRef.current = () => {
      setWireframeMode((prev) => {
        const next = !prev
        materials.forEach((m) => {
          m.wireframe = next
        })
        dynamicMeshes.forEach((mesh) => {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              if ('wireframe' in mat) (mat as THREE.MeshStandardMaterial).wireframe = next
            })
          } else if (mesh.material && 'wireframe' in mesh.material) {
            (mesh.material as THREE.MeshStandardMaterial).wireframe = next
          }
        })
        return next
      })
    }

    // 8. IntersectionObserver to strictly PAUSE rendering when scrolled off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting
        })
      },
      { threshold: 0.05 }
    )
    observer.observe(container)

    // 9. Resize Observer
    const handleResize = () => {
      if (!container) return
      const width = container.clientWidth
      const height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // 10. Main 60 FPS Render Loop with Physics Step
    let lastTime = performance.now()
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      if (!isVisible) return

      const delta = Math.min(clock.getDelta(), 0.05)
      const time = performance.now() * 0.001

      // Gentle floating orbital rotation for lights
      rimLight.position.x = Math.sin(time * 0.8) * 8
      rimLight.position.z = Math.cos(time * 0.8) * 6 - 4

      // Step physics (Ammo or High-Speed Verlet Fallback)
      if (isAmmoActive && physicsInstance && typeof physicsInstance.step === 'function') {
        physicsInstance.step()
      } else {
        // High-speed collision & gravity fallback loop
        const gravity = -9.8
        const floorY = -3.8
        const boundaryX = 9.0

        fallbackBodies.forEach((body) => {
          // Apply gravity and damping
          body.velocity.y += gravity * delta
          body.velocity.x *= 0.99
          body.velocity.z *= 0.99

          body.mesh.position.addScaledVector(body.velocity, delta)
          body.mesh.rotation.x += body.angularVelocity.x * delta
          body.mesh.rotation.y += body.angularVelocity.y * delta
          body.mesh.rotation.z += body.angularVelocity.z * delta

          // Floor bounce
          if (body.mesh.position.y < floorY) {
            body.mesh.position.y = floorY
            body.velocity.y = -body.velocity.y * body.restitution
            body.velocity.x += (Math.random() - 0.5) * 0.5
            body.velocity.z += (Math.random() - 0.5) * 0.5
            // Add gentle anti-gravity buoyancy so elements never completely sleep
            if (Math.abs(body.velocity.y) < 1.0) {
              body.velocity.y = 2.5 + Math.random() * 2.0
            }
          }

          // Lateral boundary wrap/bounce
          if (Math.abs(body.mesh.position.x) > boundaryX) {
            body.velocity.x = -body.velocity.x * 0.8
            body.mesh.position.x = Math.sign(body.mesh.position.x) * boundaryX
          }
        })
      }

      renderer.render(scene, camera)
    }

    animate()

    // 11. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId)
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('click', handleClick)

      geometries.forEach((g) => g.dispose())
      materials.forEach((m) => m.dispose())
      floorGeo.dispose()
      floorMat.dispose()
      renderer.dispose()

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'pan-y pinch-zoom' }}
        title="Interactive Three.js & Ammo.js Physics Canvas. Move mouse to repel, click to spawn 3D modules."
      />

      {/* Floating Blender HUD Controller Strip */}
      <div className="absolute top-3 right-3 sm:right-6 z-20 flex items-center gap-2 pointer-events-auto">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#102A44]/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-300 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>THREE.JS + AMMO.JS {physicsReady ? 'READY' : 'INIT'}</span>
          <span className="text-slate-500">•</span>
          <span className="text-[#F97316]">{objectsCount} BODIES</span>
        </div>

        <button
          type="button"
          onClick={() => triggerDropRef.current?.()}
          className="px-2.5 py-1 rounded-lg bg-[#16324F]/90 hover:bg-[#16324F] border border-slate-700/80 text-[11px] font-mono text-slate-200 hover:text-white transition-colors cursor-pointer shadow-sm tactile-press flex items-center gap-1"
          title="Drop 3D physics geometry blocks"
        >
          <span>+ Drop 3D</span>
        </button>

        <button
          type="button"
          onClick={() => toggleWireframeRef.current?.()}
          className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer shadow-sm tactile-press ${
            wireframeMode
              ? 'bg-[#F97316] text-[#FBF3DC] border-[#F97316]'
              : 'bg-[#16324F]/90 hover:bg-[#16324F] border-slate-700/80 text-slate-200 hover:text-white'
          }`}
          title="Toggle Blender wireframe viewport shading"
        >
          <span>{wireframeMode ? 'Solid Mode' : 'Wireframe'}</span>
        </button>
      </div>
    </div>
  )
}
