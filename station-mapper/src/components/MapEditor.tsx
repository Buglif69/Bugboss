import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import logo from '../assets/logo.png'
import { getMap, getSite, saveSite } from '../db'
import { LAYER_META, type Condition, type LayerType, type Site, type Station } from '../types'
import RegisterPanel from './RegisterPanel'
import { exportSitePdf } from '../pdf/exportPdf'

interface Props {
  siteId: string
  onBack: () => void
}

interface View {
  scale: number
  tx: number
  ty: number
}

const MARKER_PX = 30
const CLICK_SLOP = 5

export default function MapEditor({ siteId, onBack }: Props) {
  const [site, setSite] = useState<Site | null>(null)
  const [mapUrl, setMapUrl] = useState<string | null>(null)
  const [view, setView] = useState<View>({ scale: 1, tx: 0, ty: 0 })
  const [activeLayer, setActiveLayer] = useState<LayerType>('rodent')
  const [placing, setPlacing] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saved, setSaved] = useState(true)
  const [exporting, setExporting] = useState(false)

  const wrapRef = useRef<HTMLDivElement>(null)
  const undoStack = useRef<Station[][]>([])
  const siteRef = useRef<Site | null>(null)
  siteRef.current = site

  // gesture state (refs — no re-render churn during drags)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{
    mode: 'pan' | 'marker' | 'pinch' | null
    startX: number
    startY: number
    moved: boolean
    stationId?: string
    stationStart?: { x: number; y: number }
    viewStart?: View
    pinchDist?: number
    pinchMid?: { x: number; y: number }
    preDrag?: Station[]
  }>({ mode: null, startX: 0, startY: 0, moved: false })

  // ---------- load ----------
  useEffect(() => {
    let url: string | null = null
    ;(async () => {
      const s = await getSite(siteId)
      const blob = await getMap(siteId)
      if (!s || !blob) {
        alert('Site could not be loaded.')
        onBack()
        return
      }
      url = URL.createObjectURL(blob)
      setSite(s)
      setMapUrl(url)
    })()
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [siteId, onBack])

  const fit = useCallback(() => {
    const wrap = wrapRef.current
    const s = siteRef.current
    if (!wrap || !s) return
    const cw = wrap.clientWidth
    const ch = wrap.clientHeight
    const scale = Math.min(cw / s.mapW, ch / s.mapH) * 0.96
    setView({
      scale,
      tx: (cw - s.mapW * scale) / 2,
      ty: (ch - s.mapH * scale) / 2,
    })
  }, [])

  // fit once the map is known and the wrapper has a size
  useEffect(() => {
    if (site && mapUrl) requestAnimationFrame(fit)
  }, [site?.id, mapUrl, fit])

  // ---------- autosave (debounced) ----------
  useEffect(() => {
    if (!site) return
    setSaved(false)
    const t = setTimeout(async () => {
      await saveSite({ ...site, updatedAt: Date.now() })
      setSaved(true)
    }, 400)
    return () => clearTimeout(t)
  }, [site])

  // ---------- mutations ----------
  const pushUndo = useCallback((stations: Station[]) => {
    undoStack.current.push(stations.map(st => ({ ...st })))
    if (undoStack.current.length > 60) undoStack.current.shift()
  }, [])

  const updateStations = useCallback((fn: (prev: Station[]) => Station[], snapshot = true) => {
    setSite(prev => {
      if (!prev) return prev
      if (snapshot) pushUndo(prev.stations)
      return { ...prev, stations: fn(prev.stations) }
    })
  }, [pushUndo])

  function placeStation(mapX: number, mapY: number) {
    const s = siteRef.current
    if (!s) return
    const nums = s.stations.filter(st => st.layer === activeLayer).map(st => st.num)
    const num = nums.length ? Math.max(...nums) + 1 : 1
    const station: Station = {
      id: `st-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      layer: activeLayer,
      num,
      x: Math.min(1, Math.max(0, mapX / s.mapW)),
      y: Math.min(1, Math.max(0, mapY / s.mapH)),
      label: '',
      product: LAYER_META[activeLayer].defaultProduct(s.header.product),
      condition: 'Sound',
    }
    updateStations(prev => [...prev, station])
    setSelectedId(station.id)
  }

  function deleteStation(id: string) {
    updateStations(prev => prev.filter(st => st.id !== id))
    setSelectedId(sel => (sel === id ? null : sel))
  }

  function undo() {
    const prev = undoStack.current.pop()
    if (!prev) return
    setSite(s => (s ? { ...s, stations: prev } : s))
    setSelectedId(null)
  }

  function renumber() {
    updateStations(prev => {
      const next = [...prev]
      for (const layer of ['rodent', 'trelona'] as LayerType[]) {
        next
          .filter(st => st.layer === layer)
          .sort((a, b) => a.num - b.num)
          .forEach((st, i) => {
            const idx = next.findIndex(n => n.id === st.id)
            next[idx] = { ...st, num: i + 1 }
          })
      }
      return next
    })
  }

  function clearAll() {
    const s = siteRef.current
    if (!s || !s.stations.length) return
    if (!confirm(`Remove all ${s.stations.length} stations (both layers) from this map?`)) return
    updateStations(() => [])
    setSelectedId(null)
  }

  // ---------- keyboard ----------
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        deleteStation(selectedId)
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  // ---------- pointer / gesture handling ----------
  function screenToMap(clientX: number, clientY: number) {
    const rect = wrapRef.current!.getBoundingClientRect()
    return {
      x: (clientX - rect.left - view.tx) / view.scale,
      y: (clientY - rect.top - view.ty) / view.scale,
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    const wrap = wrapRef.current
    if (!wrap || !site) return
    wrap.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      gesture.current = {
        mode: 'pinch',
        startX: e.clientX,
        startY: e.clientY,
        moved: true,
        viewStart: { ...view },
        pinchDist: Math.hypot(a.x - b.x, a.y - b.y),
        pinchMid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      }
      return
    }

    const markerEl = (e.target as HTMLElement).closest('[data-station-id]') as HTMLElement | null
    if (markerEl) {
      const id = markerEl.dataset.stationId!
      const st = site.stations.find(s => s.id === id)
      setSelectedId(id)
      gesture.current = {
        mode: 'marker',
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
        stationId: id,
        stationStart: st ? { x: st.x, y: st.y } : undefined,
        preDrag: site.stations.map(s => ({ ...s })),
      }
    } else {
      gesture.current = {
        mode: 'pan',
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
        viewStart: { ...view },
      }
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesture.current
    if (!g.mode) return

    if (g.mode === 'pinch' && pointers.current.size >= 2 && g.viewStart && g.pinchDist && g.pinchMid) {
      const [a, b] = [...pointers.current.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      const rect = wrapRef.current!.getBoundingClientRect()
      const factor = dist / g.pinchDist
      const scale = clampScale(g.viewStart.scale * factor)
      const applied = scale / g.viewStart.scale
      setView({
        scale,
        tx: mid.x - rect.left - (g.pinchMid.x - rect.left - g.viewStart.tx) * applied,
        ty: mid.y - rect.top - (g.pinchMid.y - rect.top - g.viewStart.ty) * applied,
      })
      return
    }

    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    if (Math.hypot(dx, dy) > CLICK_SLOP) g.moved = true

    if (g.mode === 'pan' && g.viewStart) {
      setView({ scale: g.viewStart.scale, tx: g.viewStart.tx + dx, ty: g.viewStart.ty + dy })
    } else if (g.mode === 'marker' && g.moved && g.stationId && g.stationStart) {
      const s = siteRef.current!
      const nx = g.stationStart.x + dx / (view.scale * s.mapW)
      const ny = g.stationStart.y + dy / (view.scale * s.mapH)
      updateStations(
        prev =>
          prev.map(st =>
            st.id === g.stationId
              ? { ...st, x: Math.min(1, Math.max(0, nx)), y: Math.min(1, Math.max(0, ny)) }
              : st,
          ),
        false,
      )
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId)
    const g = gesture.current
    if (g.mode === 'pinch') {
      if (pointers.current.size < 2) gesture.current = { mode: null, startX: 0, startY: 0, moved: false }
      return
    }
    if (g.mode === 'pan' && !g.moved) {
      // simple click on empty space
      if (placing) {
        const { x, y } = screenToMap(e.clientX, e.clientY)
        const s = siteRef.current!
        if (x >= 0 && y >= 0 && x <= s.mapW && y <= s.mapH) placeStation(x, y)
        else setSelectedId(null)
      } else {
        setSelectedId(null)
      }
    }
    if (g.mode === 'marker' && g.moved && g.preDrag) {
      // one undo entry for the whole drag
      pushUndo(g.preDrag)
    }
    gesture.current = { mode: null, startX: 0, startY: 0, moved: false }
  }

  function clampScale(s: number) {
    return Math.min(12, Math.max(0.02, s))
  }

  function zoomAt(clientX: number, clientY: number, factor: number) {
    const rect = wrapRef.current!.getBoundingClientRect()
    setView(v => {
      const scale = clampScale(v.scale * factor)
      const applied = scale / v.scale
      const px = clientX - rect.left
      const py = clientY - rect.top
      return { scale, tx: px - (px - v.tx) * applied, ty: py - (py - v.ty) * applied }
    })
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault()
    zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 1 / 1.12)
  }

  function zoomCenter(factor: number) {
    const rect = wrapRef.current!.getBoundingClientRect()
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor)
  }

  // ---------- export ----------
  async function handleExport() {
    const s = siteRef.current
    if (!s) return
    if (!s.stations.length && !confirm('No stations placed yet — export an empty plan?')) return
    setExporting(true)
    try {
      const blob = await getMap(s.id)
      if (!blob) throw new Error('Base map missing')
      await exportSitePdf(s, blob)
    } catch (err) {
      console.error(err)
      alert('PDF export failed: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setExporting(false)
    }
  }

  const markerScale = useMemo(() => 1 / view.scale, [view.scale])

  if (!site || !mapUrl) return null

  return (
    <div className="editor">
      <div className="topbar">
        <button className="btn ghost" onClick={onBack}>
          ← Sites
        </button>
        <img className="logo" src={logo} alt="Slug-A-Bug" />
        <div className="title">{site.header.siteName}</div>
        <div className="spacer" />
        <span className="savestate">{saved ? 'Saved ✓' : 'Saving…'}</span>
      </div>

      <div className="toolbar">
        <div className="layer-toggle">
          <button
            className={activeLayer === 'rodent' ? 'on rodent' : ''}
            onClick={() => setActiveLayer('rodent')}
          >
            Rodent
          </button>
          <button
            className={activeLayer === 'trelona' ? 'on trelona' : ''}
            onClick={() => setActiveLayer('trelona')}
          >
            Trelona
          </button>
        </div>
        <button className={placing ? 'btn active' : 'btn'} onClick={() => setPlacing(p => !p)}>
          Place {placing ? 'ON' : 'OFF'}
        </button>
        <div className="sep" />
        <button className="btn" onClick={undo}>
          Undo
        </button>
        <button className="btn" onClick={renumber}>
          Renumber
        </button>
        <button className="btn danger" onClick={clearAll}>
          Clear all
        </button>
        <div className="sep" />
        <button className="btn" onClick={() => zoomCenter(1.25)}>
          Zoom +
        </button>
        <button className="btn" onClick={() => zoomCenter(1 / 1.25)}>
          Zoom −
        </button>
        <button className="btn" onClick={fit}>
          Fit
        </button>
        <div className="sep" />
        <button className="btn primary" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting…' : 'Export PDF'}
        </button>
        <span className="hint">
          {placing
            ? `Click map to place ${LAYER_META[activeLayer].name} station · drag markers to move · Del removes selected`
            : 'Placing off — click selects, drag pans'}
        </span>
      </div>

      <div className="editor-main">
        <div
          ref={wrapRef}
          className="canvas-wrap"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          <div
            className="canvas-inner"
            style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})` }}
          >
            <img className="basemap" src={mapUrl} width={site.mapW} height={site.mapH} alt="Base map" draggable={false} />
            {site.stations.map(st => (
              <div
                key={st.id}
                data-station-id={st.id}
                className={`marker ${st.layer}${selectedId === st.id ? ' selected' : ''}`}
                style={{
                  left: st.x * site.mapW,
                  top: st.y * site.mapH,
                  width: MARKER_PX,
                  height: MARKER_PX,
                  fontSize: st.num > 99 ? 11 : 14,
                  transform: `translate(-50%, -50%) scale(${markerScale})`,
                }}
              >
                {st.num}
              </div>
            ))}
          </div>
        </div>

        <RegisterPanel
          site={site}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onHeaderChange={h => setSite(s => (s ? { ...s, header: h } : s))}
          onStationChange={(id, patch) =>
            updateStations(prev => prev.map(st => (st.id === id ? { ...st, ...patch } : st)), false)
          }
          onStationDelete={deleteStation}
        />
      </div>
    </div>
  )
}

export type StationPatch = Partial<Pick<Station, 'label' | 'product' | 'condition'>> & {
  condition?: Condition
}
