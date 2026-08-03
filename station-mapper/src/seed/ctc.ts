import { BRAND } from '../brand'
import { todayISO, type Site } from '../types'
import { saveMap, saveSite, getSite } from '../db'

// Placeholder schematic site plan for the Construction Training Centre, Salisbury QLD.
// The legacy CTC_markup_prototype.html (and its base map) is not present in this
// repository, so this SVG stands in until the real plan is dropped in — replace it
// by deleting the site and re-creating it with the genuine base map upload.
const MAP_W = 1600
const MAP_H = 1100

const bldg = (x: number, y: number, w: number, h: number, label: string, sub = '') => `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#d9dde2" stroke="#9aa5b1" stroke-width="3"/>
    <text x="${x + w / 2}" y="${y + h / 2 - (sub ? 10 : -8)}" text-anchor="middle" font-size="30" font-weight="bold" fill="#5c6b7a">${label}</text>
    ${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 26}" text-anchor="middle" font-size="21" fill="#7d8a97">${sub}</text>` : ''}
  </g>`

const carpark = (x: number, y: number, w: number, h: number, cols: number) => {
  let lines = ''
  for (let i = 1; i < cols; i++) {
    const lx = x + (w / cols) * i
    lines += `<line x1="${lx}" y1="${y + 6}" x2="${lx}" y2="${y + h - 6}" stroke="#c2c9d1" stroke-width="2"/>`
  }
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#eceff2" stroke="#c2c9d1" stroke-width="2"/>${lines}</g>`
}

export const CTC_MAP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${MAP_W}" height="${MAP_H}" viewBox="0 0 ${MAP_W} ${MAP_H}" font-family="${BRAND.font}">
  <rect width="${MAP_W}" height="${MAP_H}" fill="#f4f5f7"/>
  <!-- site boundary -->
  <rect x="70" y="60" width="1460" height="930" fill="#eef0f3" stroke="#8b98a5" stroke-width="4" stroke-dasharray="14 8"/>
  <!-- internal driveway loop -->
  <path d="M 140 990 L 140 340 Q 140 300 180 300 L 1380 300 Q 1420 300 1420 340 L 1420 620" fill="none" stroke="#dfe3e8" stroke-width="56" stroke-linecap="round"/>
  <path d="M 140 990 L 140 340 Q 140 300 180 300 L 1380 300 Q 1420 300 1420 340 L 1420 620" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="20 16"/>
  ${bldg(230, 110, 340, 150, 'BUILDING 1', 'Administration')}
  ${bldg(640, 110, 300, 150, 'BUILDING 2', 'Training rooms')}
  ${bldg(1010, 110, 330, 150, 'BUILDING 3', 'Trade workshops')}
  ${bldg(230, 400, 380, 260, 'BUILDING 4', 'Main workshop hall')}
  ${bldg(700, 400, 300, 200, 'BUILDING 5', 'Plant shed')}
  ${bldg(700, 660, 300, 180, 'BUILDING 6', 'Stores')}
  ${bldg(1120, 420, 280, 160, 'CANTEEN', '')}
  ${carpark(230, 730, 400, 130, 8)}
  <text x="430" y="905" text-anchor="middle" font-size="22" fill="#8b98a5">CAR PARK</text>
  ${carpark(1120, 660, 280, 240, 5)}
  <text x="1260" y="935" text-anchor="middle" font-size="22" fill="#8b98a5">STAFF PARKING</text>
  <!-- grassed area -->
  <rect x="660" y="890" width="380" height="90" fill="#e7ece7" stroke="#c8d2c8" stroke-width="2"/>
  <text x="850" y="942" text-anchor="middle" font-size="20" fill="#93a093">GRASSED AREA</text>
  <!-- road -->
  <rect x="0" y="1020" width="${MAP_W}" height="80" fill="#dfe3e8"/>
  <line x1="0" y1="1060" x2="${MAP_W}" y2="1060" stroke="#ffffff" stroke-width="3" stroke-dasharray="30 22"/>
  <text x="800" y="1066" text-anchor="middle" font-size="24" fill="#7d8a97" letter-spacing="6">BEAUDESERT&#160;&#160;ROAD</text>
  <!-- gate -->
  <rect x="120" y="990" width="60" height="30" fill="#dfe3e8"/>
  <text x="205" y="1012" font-size="19" fill="#7d8a97">MAIN GATE</text>
  <!-- north arrow -->
  <g transform="translate(1480,120)">
    <circle r="34" fill="#ffffff" stroke="#8b98a5" stroke-width="2"/>
    <path d="M 0 -22 L 10 14 L 0 6 L -10 14 Z" fill="#5c6b7a"/>
    <text y="30" text-anchor="middle" font-size="17" fill="#5c6b7a" font-weight="bold">N</text>
  </g>
  <text x="80" y="45" font-size="21" fill="#9aa5b1">Construction Training Centre — schematic site plan (placeholder)</text>
</svg>`

export const CTC_SITE_ID = 'seed-ctc'

export async function ensureSeedSite(): Promise<void> {
  if (await getSite(CTC_SITE_ID)) return
  const now = Date.now()
  const site: Site = {
    id: CTC_SITE_ID,
    createdAt: now,
    updatedAt: now,
    header: {
      siteName: 'Construction Training Centre',
      address: '460-492 Beaudesert Rd, Salisbury QLD 4107',
      technician: BRAND.defaultTechnician,
      product: BRAND.defaultProduct,
      date: todayISO(),
    },
    stations: [],
    mapType: 'image/svg+xml',
    mapW: MAP_W,
    mapH: MAP_H,
  }
  await saveMap(CTC_SITE_ID, new Blob([CTC_MAP_SVG], { type: 'image/svg+xml' }))
  await saveSite(site)
}
