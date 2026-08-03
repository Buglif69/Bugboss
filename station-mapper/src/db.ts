import { openDB, type IDBPDatabase } from 'idb'
import type { Site } from './types'

const DB_NAME = 'slugabug-station-mapper'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase> | null = null

function db(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(d) {
        if (!d.objectStoreNames.contains('sites')) d.createObjectStore('sites', { keyPath: 'id' })
        if (!d.objectStoreNames.contains('maps')) d.createObjectStore('maps')
      },
    })
  }
  return dbPromise
}

export async function listSites(): Promise<Site[]> {
  const sites = (await (await db()).getAll('sites')) as Site[]
  return sites.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getSite(id: string): Promise<Site | undefined> {
  return (await db()).get('sites', id)
}

export async function saveSite(site: Site): Promise<void> {
  await (await db()).put('sites', site)
}

export async function deleteSite(id: string): Promise<void> {
  const d = await db()
  await d.delete('sites', id)
  await d.delete('maps', id)
}

export async function saveMap(siteId: string, blob: Blob): Promise<void> {
  await (await db()).put('maps', blob, siteId)
}

export async function getMap(siteId: string): Promise<Blob | undefined> {
  return (await db()).get('maps', siteId)
}
