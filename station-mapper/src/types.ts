export type LayerType = 'rodent' | 'trelona'

export const CONDITIONS = ['Sound', 'Activity', 'Damaged', 'Missing', 'Replaced', 'Not checked'] as const
export type Condition = (typeof CONDITIONS)[number]

export interface Station {
  id: string
  layer: LayerType
  num: number
  /** position as fraction (0–1) of the base map's intrinsic width/height */
  x: number
  y: number
  label: string
  product: string
  condition: Condition
}

export interface JobHeader {
  siteName: string
  address: string
  technician: string
  product: string
  /** ISO date yyyy-mm-dd */
  date: string
}

export interface Site {
  id: string
  createdAt: number
  updatedAt: number
  header: JobHeader
  stations: Station[]
  /** MIME type of the stored base map blob */
  mapType: string
  /** intrinsic pixel size of the base map */
  mapW: number
  mapH: number
}

export const LAYER_META: Record<LayerType, { name: string; typeLabel: string; color: string; defaultProduct: (jobProduct: string) => string }> = {
  rodent: {
    name: 'Rodent',
    typeLabel: 'Rodent bait station',
    color: '#EE1C24',
    defaultProduct: jobProduct => jobProduct || 'Solontra',
  },
  trelona: {
    name: 'Trelona',
    typeLabel: 'Trelona termite station',
    color: '#14B8A6',
    defaultProduct: () => 'Trelona ATBS',
  },
}

export function todayISO(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function siteSlug(name: string): string {
  return (
    name
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'Site'
  )
}
