import { useEffect, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { categoryMeta, normalizeType } from '../../components/sections/FabricCategoriesSection'
import { useMaterials } from '../../contexts/MaterialsContext'
import { NO_FABRIC_PARTS } from '../../utils/textureUtils'
import { getPartOptions, type SelectedMaterial } from './MaterialSelector'
import { partLabel } from './PartDropdown'

/** Movement (px) / duration (ms) under which a pointer press counts as a tap rather than a rotate-drag. */
const TAP_MAX_MOVE = 6
const TAP_MAX_MS = 500

export interface FabricHotspotState {
  /** Bumped on every tap so the hotspot element remounts and model-viewer reads the new position */
  key: number
  position: string
  normal: string
  /** Product part that was tapped (e.g. "Seat"), or null for a fabric mesh outside the selectable parts */
  part: string | null
  placeX: 'left' | 'right'
  placeY: 'above' | 'below'
}

/**
 * Tap a fabric part of the <model-viewer> sofa to pin an info box to that spot.
 * The mesh is found with a raycast against the fabric meshes; the pin is a model-viewer hotspot
 * (from the public positionAndNormalFromPoint), so it follows the model as the camera moves.
 */
export function useFabricHotspot({ mvRef, meshesRef, productName, enabled }: {
  mvRef: RefObject<HTMLElement | null>
  meshesRef: RefObject<any[]>
  productName: string
  enabled: boolean
}) {
  const [hotspot, setHotspot] = useState<FabricHotspotState | null>(null)
  const close = () => setHotspot(null)

  // Latest product inside the listeners without re-binding them
  const productRef = useRef(productName)
  useEffect(() => { productRef.current = productName })

  // A different product means a different model — drop any pin from the old one
  useEffect(() => { setHotspot(null) }, [productName])

  useEffect(() => {
    if (!hotspot) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setHotspot(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [hotspot])

  useEffect(() => {
    const mv = mvRef.current as any
    if (!mv || !enabled) return
    let down: { x: number; y: number; t: number } | null = null

    const onDown = (e: PointerEvent) => {
      // Presses on the hotspot itself (close / View Details) are not model taps
      down = (e.target as Element).closest?.('[slot^="hotspot"]') ? null : { x: e.clientX, y: e.clientY, t: Date.now() }
    }

    const onUp = (e: PointerEvent) => {
      const start = down
      down = null
      if (!start) return
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > TAP_MAX_MOVE || Date.now() - start.t > TAP_MAX_MS) return

      const sceneSymbol = Object.getOwnPropertySymbols(mv).find((s) => s.description === 'scene')
      const scene = sceneSymbol ? mv[sceneSymbol] : null
      const camera = scene?.getCamera?.() ?? scene?.camera
      if (!camera) return

      const rect = mv.getBoundingClientRect()
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(ndc, camera)
      const meshes = (meshesRef.current ?? []).filter((m) => m.visible && !(m.name ?? '').toLowerCase().includes('shadow'))
      const hit = raycaster.intersectObjects(meshes, false)[0]
      const name = (hit?.object.name ?? '').toLowerCase()

      // Missed the model, or tapped a non-fabric part (legs, wood…)
      if (!hit || NO_FABRIC_PARTS.some((p) => name.includes(p))) { setHotspot(null); return }

      const point = mv.positionAndNormalFromPoint?.(e.clientX, e.clientY)
      if (!point) { setHotspot(null); return }

      const part = getPartOptions(productRef.current).find((p) => p !== 'All' && name.includes(p.toLowerCase())) ?? null
      setHotspot({
        key: Date.now(),
        position: point.position.toString(),
        normal: point.normal.toString(),
        part,
        // Open the box away from the nearest edges so it stays inside the viewer
        placeX: e.clientX - rect.left > rect.width / 2 ? 'left' : 'right',
        placeY: e.clientY - rect.top > rect.height / 2 ? 'above' : 'below',
      })
    }

    mv.addEventListener('pointerdown', onDown)
    mv.addEventListener('pointerup', onUp)
    return () => {
      mv.removeEventListener('pointerdown', onDown)
      mv.removeEventListener('pointerup', onUp)
    }
  }, [mvRef, meshesRef, enabled])

  return { hotspot, close }
}

/** Dot → box spacing (px) and the minimum margin the box keeps from the viewer's edges */
const BOX_GAP = 24
const EDGE = 8
/** Strips the box keeps clear of: the product / gallery buttons on top, the part dropdown + AI button at the bottom */
const RESERVE_TOP = 44
const RESERVE_BOTTOM = 64

interface Placement {
  x: 'left' | 'right' | 'center'
  y: 'above' | 'below'
  /** Horizontal nudge (px) for a centred box near the viewer's edges */
  shift: number
}

/** Fabric shown on a tapped part: its own override, else the whole-sofa fabric. */
export const fabricForPart = (
  part: string | null,
  baseMaterial: SelectedMaterial | null,
  partOverrides: Record<string, SelectedMaterial>,
) => (part ? partOverrides[part] : undefined) ?? baseMaterial

export interface AppliedFabric {
  material: SelectedMaterial
  /** Parts this fabric was applied to; empty = the whole-sofa fabric */
  parts: string[]
}

/** Distinct fabrics shown on the model: the whole-sofa fabric first, then part overrides that differ from it. */
export const appliedFabrics = (
  baseMaterial: SelectedMaterial | null,
  partOverrides: Record<string, SelectedMaterial>,
): AppliedFabric[] => {
  const list: AppliedFabric[] = baseMaterial ? [{ material: baseMaterial, parts: [] }] : []
  for (const [part, mat] of Object.entries(partOverrides)) {
    if (baseMaterial && mat.id === baseMaterial.id) continue
    const same = list.find((f) => f.material.id === mat.id)
    if (same) same.parts.push(part)
    else list.push({ material: mat, parts: [part] })
  }
  return list
}

/** Dot + info box, rendered as a child of <model-viewer> so it tracks the model. */
export default function FabricHotspot({ hotspot, material, onClose }: {
  hotspot: FabricHotspotState | null
  material: SelectedMaterial | null
  onClose: () => void
}) {
  const { collections } = useMaterials()
  const ref = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [place, setPlace] = useState<Placement>({ x: hotspot?.placeX ?? 'right', y: hotspot?.placeY ?? 'below', shift: 0 })
  useEffect(() => { if (hotspot) setPlace({ x: hotspot.placeX, y: hotspot.placeY, shift: 0 }) }, [hotspot?.key])

  // Keep the box inside the viewer as the dot moves with the model. Sides only change once the current
  // one stops fitting (no flicker mid-drag); when neither side fits (narrow phone viewer) the box sits
  // centred above/below the dot, nudged in from the edges.
  useEffect(() => {
    const el = ref.current
    const mv = el?.closest('model-viewer')
    if (!el || !mv) return
    let frame = 0
    const check = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const dot = el.getBoundingClientRect()
        const box = mv.getBoundingClientRect()
        const cw = cardRef.current?.offsetWidth ?? 240
        const ch = cardRef.current?.offsetHeight ?? 130
        const cx = dot.left + dot.width / 2 - box.left
        const cy = dot.top + dot.height / 2 - box.top
        const fitsRight = cx + BOX_GAP + cw <= box.width - EDGE
        const fitsLeft = cx - BOX_GAP - cw >= EDGE
        setPlace((p) => {
          let x = p.x
          if (x === 'right' && !fitsRight) x = fitsLeft ? 'left' : 'center'
          else if (x === 'left' && !fitsLeft) x = fitsRight ? 'right' : 'center'
          else if (x === 'center' && (fitsRight || fitsLeft)) x = fitsRight ? 'right' : 'left'
          // Side boxes hang from the dot's level; centred boxes sit fully clear of it
          const fitsBelow = (x === 'center' ? cy + BOX_GAP + ch : cy - 8 + ch) <= box.height - RESERVE_BOTTOM
          const fitsAbove = (x === 'center' ? cy - BOX_GAP - ch : cy + 8 - ch) >= RESERVE_TOP
          let y = p.y
          if (y === 'below' && !fitsBelow && fitsAbove) y = 'above'
          else if (y === 'above' && !fitsAbove && fitsBelow) y = 'below'
          // Short viewer where neither fits fully: use whichever side has more room
          else if (!fitsBelow && !fitsAbove) y = box.height - RESERVE_BOTTOM - cy > cy - RESERVE_TOP ? 'below' : 'above'
          const left = cx - cw / 2
          const shift = x === 'center' ? Math.min(Math.max(EDGE, left), box.width - cw - EDGE) - left : 0
          return x === p.x && y === p.y && Math.abs(shift - p.shift) < 1 ? p : { x, y, shift }
        })
      })
    }
    check()
    mv.addEventListener('camera-change', check)
    return () => { mv.removeEventListener('camera-change', check); cancelAnimationFrame(frame) }
  }, [hotspot?.key])

  if (!hotspot || !material) return null

  const collectionId = collections.find((c) => c.name === material.collectionName)?.id
  const typeLabel = categoryMeta[normalizeType(material.materialType)]?.label ?? material.materialType
  const detailsUrl = collectionId ? `/collections/${collectionId}/${encodeURIComponent(material.materialCode)}` : null

  return (
    <div
      key={hotspot.key}
      ref={ref}
      slot="hotspot-fabric"
      data-position={hotspot.position}
      data-normal={hotspot.normal}
      // model-viewer 4 only toggles data-visible (point facing the camera) when asked to via this attribute;
      // without it the box is treated as hidden — faded and click-through, so taps fell into the scene
      data-visibility-attribute="visible"
      className="fabric-hotspot relative w-3.5 h-3.5"
    >
      {/* Dot */}
      <span className="absolute -inset-1.5 rounded-full bg-primary/40 animate-ping" aria-hidden="true" />
      <span className="absolute inset-0 rounded-full bg-primary border-2 border-white shadow-md" aria-hidden="true" />

      {/* Info box */}
      <div
        ref={cardRef}
        role="dialog"
        aria-label={`${material.fabricName} details`}
        className={`fabric-hotspot-card absolute w-56 sm:w-60 bg-white border border-stone-200 shadow-2xl transition-opacity duration-200 text-left
          ${place.x === 'left' ? 'right-6 origin-right' : place.x === 'right' ? 'left-6 origin-left' : 'left-1/2 -translate-x-1/2'}
          ${place.x === 'center' ? (place.y === 'below' ? 'top-6 origin-top' : 'bottom-6 origin-bottom') : (place.y === 'below' ? '-top-2' : '-bottom-2')}`}
        // 'backwards' (not 'both') so the animation doesn't pin opacity: 1 over the facing-away fade afterwards
        style={{ animation: 'kaira-fade-scale-in 0.25s ease-out backwards', marginLeft: place.shift || undefined }}
      >
        {/* Compact on phones (short viewer); the shade line shows from sm up (the name already carries the code) */}
        <div className="flex gap-2.5 sm:gap-3 p-2.5 sm:p-3">
          {/* Plain img: the texture is already in the browser cache from being applied to the model */}
          <img
            src={material.textureUrl}
            alt=""
            className="w-11 h-11 sm:w-14 sm:h-14 shrink-0 object-cover border border-stone-200 bg-stone-100"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
              {hotspot.part ? partLabel(hotspot.part) : 'Fabric'}
            </p>
            <p className="mt-0.5 text-[13px] font-bold text-secondary-dark leading-tight truncate">{material.fabricName}</p>
            <p className="mt-0.5 text-[10px] text-secondary-dark/70 truncate">
              {typeLabel}{material.colorGroup ? ` · ${material.colorGroup}` : ''}
            </p>
            <p className="hidden sm:block text-[10px] text-secondary-dark/50 truncate">Shade {material.materialCode}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ touchAction: 'manipulation' }}
            className="-mt-1 -mr-1 w-7 h-7 shrink-0 flex items-center justify-center text-secondary-dark/50 hover:text-secondary-dark hover:bg-stone-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {detailsUrl && (
          <a
            href={detailsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ touchAction: 'manipulation' }}
            className="flex items-center justify-center gap-1.5 h-8 sm:h-9 bg-secondary-dark hover:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-[0.15em] transition-colors"
          >
            View Details
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}
