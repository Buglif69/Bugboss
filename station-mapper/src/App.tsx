import { useEffect, useState } from 'react'
import SiteList from './components/SiteList'
import MapEditor from './components/MapEditor'
import { ensureSeedSite } from './seed/ctc'

export default function App() {
  const [ready, setReady] = useState(false)
  const [openSiteId, setOpenSiteId] = useState<string | null>(null)

  useEffect(() => {
    ensureSeedSite()
      .catch(err => console.error('Seed failed', err))
      .finally(() => setReady(true))
  }, [])

  if (!ready) return null

  return openSiteId ? (
    <MapEditor siteId={openSiteId} onBack={() => setOpenSiteId(null)} />
  ) : (
    <SiteList onOpen={setOpenSiteId} />
  )
}
