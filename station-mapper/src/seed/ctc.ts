import { todayISO, type Site, type Station } from '../types'
import { saveMap, saveSite, getSite, deleteSite } from '../db'

// Clean redraw of the real CTC precinct base map (Construction Training Centre,
// Salisbury QLD): Buildings 1–4 + outbuildings, Ian Barclay Building 13, Central
// Drive, and Buildings 6, 7 & 8 on the elevated block. Geometry traced from the
// site plan used in the field; same 1500×1050 coordinate space, so the seeded
// station positions below line up 1:1.
const MAP_W = 1500
const MAP_H = 1050

const B_FILL = '#eef0f2'
const B_LINE = '#44607a'
const LBL = '#84919d'
const NAVY = '#14324A'

const vlabel = (x: number, y: number, text: string, size = 19) =>
  `<text x="${x}" y="${y}" transform="rotate(-90 ${x} ${y})" text-anchor="middle" font-size="${size}" fill="${LBL}" letter-spacing="3.5">${text}</text>`

export const CTC_MAP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${MAP_W}" height="${MAP_H}" viewBox="0 0 ${MAP_W} ${MAP_H}" font-family="Arial, Helvetica, sans-serif">
  <rect width="${MAP_W}" height="${MAP_H}" fill="#ffffff"/>

  <!-- title block -->
  <rect x="40" y="28" width="8" height="48" fill="#EE1C24"/>
  <text x="62" y="52" font-size="30" font-weight="bold" fill="${NAVY}" letter-spacing="2">CTC PRECINCT — FULL SITE PLAN</text>
  <text x="62" y="76" font-size="16" fill="#6b7280">Buildings 1–4 + outbuildings · Ian Barclay Building 13 · Buildings 6, 7 &amp; 8 (elevated block)</text>
  <text x="1460" y="46" text-anchor="end" font-size="15" font-weight="bold" fill="${NAVY}" letter-spacing="2">BASE MAP</text>
  <text x="1460" y="66" text-anchor="end" font-size="13" fill="#9aa5b1">Not to scale</text>

  <!-- compass -->
  <g transform="translate(1408,148)">
    <circle r="30" fill="#ffffff" stroke="#b8c2cc" stroke-width="2"/>
    <path d="M 0 -19 L 8 12 L 0 5 L -8 12 Z" fill="${NAVY}"/>
    <text y="-36" text-anchor="middle" font-size="15" font-weight="bold" fill="${NAVY}">N</text>
  </g>

  <!-- Central Drive -->
  <rect x="660" y="118" width="66" height="748" fill="#f3f5f6" stroke="#d5dade" stroke-width="1.5"/>
  <line x1="693" y1="132" x2="693" y2="852" stroke="#c6ced6" stroke-width="2" stroke-dasharray="18 14"/>
  ${vlabel(710, 380, 'CENTRAL DRIVE', 17)}

  <!-- grassed slope / elevated block -->
  <polygon points="878,115 926,115 988,1010 940,1010" fill="#e5efe4" stroke="#c8dac7" stroke-width="1.5"/>
  ${vlabel(946, 560, 'GRASSED SLOPE — ELEVATED BLOCK', 15)}

  <!-- outbuildings 12, 10, 11 -->
  <g transform="rotate(-14 88 155)">
    <rect x="58" y="118" width="60" height="74" fill="${B_FILL}" stroke="${B_LINE}" stroke-width="2"/>
    <text x="88" y="161" text-anchor="middle" font-size="17" fill="${LBL}">12</text>
  </g>
  <rect x="255" y="140" width="110" height="57" fill="${B_FILL}" stroke="${B_LINE}" stroke-width="2"/>
  <text x="310" y="174" text-anchor="middle" font-size="17" fill="${LBL}">10</text>
  <rect x="575" y="125" width="82" height="52" fill="${B_FILL}" stroke="${B_LINE}" stroke-width="2"/>
  <text x="616" y="157" text-anchor="middle" font-size="17" fill="${LBL}">11</text>

  <!-- Buildings 4 and 3 (shared party wall) -->
  <rect x="105" y="197" width="290" height="593" fill="${B_FILL}" stroke="${B_LINE}" stroke-width="2.5"/>
  <line x1="268" y1="197" x2="268" y2="790" stroke="${B_LINE}" stroke-width="2"/>
  <line x1="276" y1="197" x2="276" y2="790" stroke="${B_LINE}" stroke-width="1"/>
  ${vlabel(200, 480, 'BUILDING 4')}
  ${vlabel(335, 480, 'BUILDING 3')}

  <!-- laneway between 3 and 1, with Building 2 -->
  <line x1="432" y1="205" x2="432" y2="292" stroke="#aeb9c3" stroke-width="2.5" marker-end="url(#arr)"/>
  <line x1="458" y1="735" x2="458" y2="562" stroke="#aeb9c3" stroke-width="2.5" marker-end="url(#arr)"/>
  <defs>
    <marker id="arr" markerWidth="9" markerHeight="9" refX="4.5" refY="7" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M 0 0 L 9 0 L 4.5 9 Z" fill="#aeb9c3" transform="scale(1.6)"/>
    </marker>
  </defs>
  <rect x="398" y="425" width="112" height="130" fill="${B_FILL}" stroke="${B_LINE}" stroke-width="2.5"/>
  ${vlabel(455, 490, 'BLDG 2', 15)}

  <!-- Building 1 -->
  <rect x="510" y="197" width="127" height="578" fill="${B_FILL}" stroke="${B_LINE}" stroke-width="2.5"/>
  ${vlabel(574, 480, 'BUILDING 1')}

  <!-- Ian Barclay Building 13 -->
  <rect x="735" y="560" width="113" height="245" fill="${B_FILL}" stroke="${B_LINE}" stroke-width="2.5"/>
  ${vlabel(792, 682, 'IAN BARCLAY 13', 15)}
  <text x="792" y="795" text-anchor="middle" font-size="12" fill="${LBL}" letter-spacing="2">ENTRY</text>

  <!-- Building 6 (long diagonal on elevated block) -->
  <g transform="translate(1003,978) rotate(-47.5)">
    <polygon points="0,0 700,0 700,-88 530,-88 530,-72 350,-72 350,-88 160,-88 160,-72 0,-72"
      fill="${B_FILL}" stroke="${B_LINE}" stroke-width="2.5"/>
    <text x="350" y="-30" text-anchor="middle" font-size="19" fill="${LBL}" letter-spacing="3.5">BUILDING 6</text>
  </g>

  <!-- Building 8 -->
  <g transform="rotate(-10 1388 322)">
    <rect x="1300" y="264" width="176" height="116" fill="${B_FILL}" stroke="${B_LINE}" stroke-width="2.5"/>
    <text x="1388" y="328" text-anchor="middle" font-size="17" fill="${LBL}" letter-spacing="3">BUILDING 8</text>
  </g>

  <!-- Building 7 -->
  <g transform="rotate(-10 1398 845)">
    <rect x="1310" y="787" width="176" height="116" fill="${B_FILL}" stroke="${B_LINE}" stroke-width="2.5"/>
    <text x="1398" y="851" text-anchor="middle" font-size="17" fill="${LBL}" letter-spacing="3">BUILDING 7</text>
  </g>

  <!-- footnote -->
  <text x="62" y="1032" font-size="14" fill="#8b98a5">Bldg 13 across Central Drive from Bldg 1 · Bldgs 6, 7 &amp; 8 on the elevated block</text>
</svg>`

// Station positions extracted from the field-marked plan (fractions of the
// 1500×1050 map): [number, x, y]
const CTC_STATIONS: [number, number, number][] = [
  [1, 0.409, 0.7567],
  [2, 0.353, 0.7576],
  [3, 0.3237, 0.7281],
  [4, 0.3243, 0.6719],
  [5, 0.3263, 0.6195],
  [6, 0.3237, 0.5576],
  [7, 0.2843, 0.559],
  [8, 0.2823, 0.6076],
  [9, 0.2823, 0.6571],
  [10, 0.2817, 0.7148],
  [11, 0.049, 0.649],
  [12, 0.2303, 0.749],
  [13, 0.087, 0.649],
  [14, 0.1703, 0.7495],
  [15, 0.111, 0.749],
  [16, 0.0523, 0.6952],
  [17, 0.049, 0.5981],
  [18, 0.0843, 0.5305],
  [19, 0.0877, 0.4867],
  [20, 0.0657, 0.4329],
  [21, 0.0517, 0.3881],
  [22, 0.0657, 0.3443],
  [23, 0.0937, 0.3448],
  [24, 0.0933, 0.3038],
  [25, 0.0637, 0.3043],
  [26, 0.0633, 0.2557],
  [27, 0.0243, 0.1848],
  [28, 0.0257, 0.121],
  [29, 0.0587, 0.1043],
  [30, 0.0903, 0.1362],
  [31, 0.0837, 0.1938],
  [32, 0.1583, 0.149],
  [33, 0.2103, 0.171],
  [34, 0.2587, 0.149],
  [35, 0.106, 0.2157],
  [36, 0.1337, 0.1876],
  [37, 0.1837, 0.1905],
  [38, 0.259, 0.1886],
  [39, 0.2817, 0.2524],
  [40, 0.2813, 0.331],
  [41, 0.3277, 0.3667],
  [42, 0.3413, 0.1776],
  [43, 0.4143, 0.1757],
  [44, 0.3717, 0.1414],
  [45, 0.4553, 0.1424],
  [46, 0.4393, 0.2143],
  [47, 0.4393, 0.2557],
  [48, 0.4393, 0.3],
  [49, 0.4393, 0.3419],
  [50, 0.4363, 0.3862],
  [51, 0.4363, 0.4324],
  [52, 0.4363, 0.4757],
  [53, 0.4363, 0.519],
  [54, 0.4333, 0.5643],
  [55, 0.4333, 0.6052],
  [56, 0.4333, 0.6467],
  [57, 0.4333, 0.6886],
  [58, 0.4333, 0.7276],
  [59, 0.4337, 0.769],
  [60, 0.5037, 0.7852],
  [61, 0.5497, 0.7852],
  [62, 0.5763, 0.7362],
  [63, 0.579, 0.5824],
  [64, 0.5763, 0.541],
  [65, 0.5347, 0.5052],
  [66, 0.5037, 0.5052],
  [67, 0.4777, 0.7114],
  [68, 0.6553, 0.9433],
  [69, 0.6417, 0.8738],
  [70, 0.6923, 0.7971],
  [71, 0.7613, 0.6624],
  [72, 0.839, 0.519],
  [73, 0.8947, 0.4195],
  [74, 0.9717, 0.509],
  [75, 0.9203, 0.6081],
  [76, 0.8643, 0.7152],
  [77, 0.7907, 0.849],
  [78, 0.9533, 0.2229],
  [79, 0.8997, 0.2443],
  [80, 0.8513, 0.269],
  [81, 0.8713, 0.3405],
  [82, 0.9717, 0.869],
  [83, 0.9073, 0.8676],
  [84, 0.869, 0.8095],
  [85, 0.9107, 0.7143],
]

export const CTC_SITE_ID = 'seed-ctc-v2'
const OLD_SEED_ID = 'seed-ctc'

export async function ensureSeedSite(): Promise<void> {
  // retire the old placeholder seed if it was never worked on
  const old = await getSite(OLD_SEED_ID)
  if (old && old.stations.length === 0) await deleteSite(OLD_SEED_ID)

  if (await getSite(CTC_SITE_ID)) return
  const now = Date.now()
  const stations: Station[] = CTC_STATIONS.map(([num, x, y]) => ({
    id: `ctc-r${num}`,
    layer: 'rodent',
    num,
    x,
    y,
    label: '',
    product: 'Ditrak Snap Traps & Sticky Pads',
    condition: 'Not checked',
  }))
  const site: Site = {
    id: CTC_SITE_ID,
    createdAt: now,
    updatedAt: now,
    header: {
      siteName: 'Construction Training Centre',
      address: '460-492 Beaudesert Rd, Salisbury QLD 4107',
      technician: 'N. Navarro & J. Cartledge',
      product: 'Ditrak Snap Traps & Sticky Pads',
      date: todayISO(),
    },
    stations,
    mapType: 'image/svg+xml',
    mapW: MAP_W,
    mapH: MAP_H,
  }
  await saveMap(CTC_SITE_ID, new Blob([CTC_MAP_SVG], { type: 'image/svg+xml' }))
  await saveSite(site)
}
