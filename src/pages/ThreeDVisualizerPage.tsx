import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const fabricOptions = [
  { id: 'gold-velvet',    label: 'Gold Velvet',      color: 0xC5A552, metalness: 0.1, roughness: 0.6 },
  { id: 'midnight-blue',  label: 'Midnight Blue',    color: 0x1A2C5B, metalness: 0.0, roughness: 0.8 },
  { id: 'ivory-linen',   label: 'Ivory Linen',      color: 0xF5F0E8, metalness: 0.0, roughness: 0.9 },
  { id: 'forest-green',  label: 'Forest Cashmere',  color: 0x2D4A35, metalness: 0.0, roughness: 0.75 },
  { id: 'blush-velvet',  label: 'Blush Velvet',     color: 0xD4A0A0, metalness: 0.0, roughness: 0.65 },
  { id: 'cognac-leather',label: 'Cognac Leather',   color: 0x8B4A2A, metalness: 0.15, roughness: 0.5 },
  { id: 'charcoal-wool', label: 'Charcoal Wool',    color: 0x2C2C2C, metalness: 0.0, roughness: 0.85 },
  { id: 'terracotta',    label: 'Terracotta Linen', color: 0xC4704A, metalness: 0.0, roughness: 0.8 },
]

const modelOptions = [
  { id: 'torus-knot', label: 'Fabric Roll', shape: 'torusKnot' },
  { id: 'sphere',     label: 'Cushion',     shape: 'sphere' },
  { id: 'torus',      label: 'Ring Sample', shape: 'torus' },
  { id: 'box',        label: 'Upholstery',  shape: 'box' },
]

const ThreeDVisualizerPage = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    mesh: THREE.Mesh
    controls: OrbitControls
    animId: number
  } | null>(null)

  const [activeFabric, setActiveFabric] = useState(fabricOptions[0])
  const [activeModel, setActiveModel] = useState(modelOptions[0])
  const [isRotating, setIsRotating] = useState(true)

  // Build scene on mount
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f0e0b)
    scene.fog = new THREE.Fog(0x0f0e0b, 8, 20)

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    )
    camera.position.set(0, 0, 4)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0xfff4e0, 2.5)
    keyLight.position.set(5, 8, 5)
    keyLight.castShadow = true
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xc5a552, 0.8)
    fillLight.position.set(-5, 0, -3)
    scene.add(fillLight)

    const rimLight = new THREE.PointLight(0xffffff, 0.6)
    rimLight.position.set(0, -4, -3)
    scene.add(rimLight)

    // Ground plane (subtle)
    const groundGeo = new THREE.PlaneGeometry(20, 20)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a1610, roughness: 1 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -2.2
    ground.receiveShadow = true
    scene.add(ground)

    // Initial mesh
    const geometry = buildGeometry(activeModel.shape)
    const material = new THREE.MeshStandardMaterial({
      color: activeFabric.color,
      metalness: activeFabric.metalness,
      roughness: activeFabric.roughness,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    scene.add(mesh)

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 2
    controls.maxDistance = 10
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.5

    // Animate
    let animId: number = 0
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const handleResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    sceneRef.current = { renderer, scene, camera, mesh, controls, animId }

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update fabric / material
  useEffect(() => {
    if (!sceneRef.current) return
    const mat = sceneRef.current.mesh.material as THREE.MeshStandardMaterial
    mat.color.setHex(activeFabric.color)
    mat.metalness = activeFabric.metalness
    mat.roughness = activeFabric.roughness
    mat.needsUpdate = true
  }, [activeFabric])

  // Update model shape
  useEffect(() => {
    if (!sceneRef.current) return
    const { mesh } = sceneRef.current
    mesh.geometry.dispose()
    mesh.geometry = buildGeometry(activeModel.shape)
  }, [activeModel])

  // Toggle auto-rotation
  useEffect(() => {
    if (!sceneRef.current) return
    sceneRef.current.controls.autoRotate = isRotating
  }, [isRotating])

  return (
    <div className="min-h-screen bg-charcoal flex flex-col">
      {/* Page heading */}
      <div className="pt-24 pb-6 px-6 lg:px-10 max-w-7xl mx-auto w-full">
        <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-2">
          Interactive Studio
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-cream">
          3D Fabric Visualizer
        </h1>
        <p className="text-stone-400 mt-2 max-w-xl">
          Select a fabric and model shape, then drag to rotate. Experience KAIRA textures in
          photorealistic 3D before you order.
        </p>
      </div>

      {/* Main layout */}
      <div className="flex-1 grid lg:grid-cols-[280px_1fr] gap-0 max-w-7xl mx-auto w-full px-6 lg:px-10 pb-10">
        {/* Sidebar */}
        <aside className="space-y-6 lg:pr-8">
          {/* Fabric selector */}
          <div>
            <h3 className="text-cream/60 text-xs tracking-widest uppercase mb-3">
              Select Fabric
            </h3>
            <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
              {fabricOptions.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFabric(f)}
                  title={f.label}
                  className={`group relative aspect-square border-2 transition-all duration-200 ${
                    activeFabric.id === f.id
                      ? 'border-gold scale-105'
                      : 'border-transparent hover:border-white/20'
                  }`}
                  style={{ backgroundColor: `#${f.color.toString(16).padStart(6, '0')}` }}
                >
                  <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-cream text-[9px] p-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-gold text-xs mt-3 tracking-wider">{activeFabric.label}</p>
          </div>

          {/* Model selector */}
          <div>
            <h3 className="text-cream/60 text-xs tracking-widest uppercase mb-3">
              Model Shape
            </h3>
            <div className="space-y-2">
              {modelOptions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveModel(m)}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-all duration-200 ${
                    activeModel.id === m.id
                      ? 'bg-gold text-charcoal'
                      : 'border border-white/10 text-cream/70 hover:border-gold/50 hover:text-cream'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div>
            <h3 className="text-cream/60 text-xs tracking-widest uppercase mb-3">
              Controls
            </h3>
            <button
              onClick={() => setIsRotating((r) => !r)}
              className={`w-full px-3 py-2.5 text-xs tracking-widest uppercase transition-all ${
                isRotating
                  ? 'bg-gold/20 border border-gold text-gold'
                  : 'border border-white/20 text-cream/50 hover:border-gold/50'
              }`}
            >
              {isRotating ? 'Auto-Rotate: On' : 'Auto-Rotate: Off'}
            </button>
            <p className="text-stone-500 text-xs mt-3 leading-relaxed">
              Drag to rotate · Scroll to zoom · Right-click to pan
            </p>
          </div>
        </aside>

        {/* Canvas */}
        <div className="relative min-h-[500px] lg:min-h-0 border border-white/5">
          <div ref={mountRef} className="w-full h-full absolute inset-0" />
          {/* Overlay corner decorations */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-gold/40 pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-gold/40 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-gold/40 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-gold/40 pointer-events-none" />
          {/* Label */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-1.5 border border-white/10 pointer-events-none">
            <p className="text-cream/60 text-xs tracking-widest uppercase">
              {activeModel.label} · {activeFabric.label}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function buildGeometry(shape: string): THREE.BufferGeometry {
  switch (shape) {
    case 'sphere':
      return new THREE.SphereGeometry(1.4, 64, 64)
    case 'torus':
      return new THREE.TorusGeometry(1.2, 0.45, 32, 100)
    case 'box':
      return new THREE.BoxGeometry(2, 1.4, 2, 4, 4, 4)
    case 'torusKnot':
    default:
      return new THREE.TorusKnotGeometry(1, 0.35, 128, 16)
  }
}

export default ThreeDVisualizerPage
