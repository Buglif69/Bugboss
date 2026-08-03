import { useEffect, useRef, useState } from 'react'
import logo from '../assets/logo.png'
import { BRAND } from '../brand'
import { deleteSite, listSites, saveMap, saveSite } from '../db'
import { todayISO, type Site } from '../types'
import { imageSizeFromBlob } from '../imageUtils'

interface Props {
  onOpen: (siteId: string) => void
}

export default function SiteList({ onOpen }: Props) {
  const [sites, setSites] = useState<Site[]>([])
  const [thumbs, setThumbs] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  async function refresh() {
    const list = await listSites()
    setSites(list)
    const { getMap } = await import('../db')
    const entries: Record<string, string> = {}
    for (const s of list) {
      const blob = await getMap(s.id)
      if (blob) entries[s.id] = URL.createObjectURL(blob)
    }
    setThumbs(prev => {
      Object.values(prev).forEach(URL.revokeObjectURL)
      return entries
    })
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleUpload(file: File) {
    const ok = ['image/png', 'image/jpeg', 'image/svg+xml']
    if (!ok.includes(file.type)) {
      alert('Please upload a PNG, JPG or SVG base map.')
      return
    }
    const name = prompt('Site name?', file.name.replace(/\.[^.]+$/, ''))
    if (name === null) return
    const address = prompt('Site address? (can be edited later)', '') ?? ''
    let size
    try {
      size = await imageSizeFromBlob(file)
    } catch {
      alert('Could not read that image — is the file valid?')
      return
    }
    const now = Date.now()
    const site: Site = {
      id: `site-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now,
      updatedAt: now,
      header: {
        siteName: name.trim() || 'Untitled site',
        address,
        technician: BRAND.defaultTechnician,
        product: BRAND.defaultProduct,
        date: todayISO(),
      },
      stations: [],
      mapType: file.type,
      mapW: size.w,
      mapH: size.h,
    }
    await saveMap(site.id, file)
    await saveSite(site)
    onOpen(site.id)
  }

  async function handleDelete(site: Site) {
    if (!confirm(`Delete "${site.header.siteName}" and all its stations? This cannot be undone.`)) return
    await deleteSite(site.id)
    refresh()
  }

  return (
    <div>
      <div className="topbar">
        <img className="logo" src={logo} alt="Slug-A-Bug" />
        <div className="title">Station Mapper</div>
      </div>
      <div className="site-list">
        <h1>Sites</h1>
        <div className="cards">
          {sites.map(s => (
            <div className="card" key={s.id}>
              <div
                className="thumb"
                role="button"
                tabIndex={0}
                onClick={() => onOpen(s.id)}
                style={{ cursor: 'pointer' }}
              >
                {thumbs[s.id] && <img src={thumbs[s.id]} alt="" />}
              </div>
              <div className="body">
                <div className="name">{s.header.siteName}</div>
                <div className="meta">
                  {s.header.address || 'No address set'}
                  <br />
                  {s.stations.filter(st => st.layer === 'rodent').length} rodent ·{' '}
                  {s.stations.filter(st => st.layer === 'trelona').length} Trelona · updated{' '}
                  {new Date(s.updatedAt).toLocaleDateString()}
                </div>
                <div className="row">
                  <button className="btn dark" onClick={() => onOpen(s.id)}>
                    Open
                  </button>
                  <button className="del" onClick={() => handleDelete(s)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button className="new-site" onClick={() => fileRef.current?.click()}>
            <span className="plus">＋</span>
            New site
            <small>Upload a base map (PNG / JPG / SVG)</small>
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          style={{ display: 'none' }}
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) handleUpload(f)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
