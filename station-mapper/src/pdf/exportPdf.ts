import { jsPDF } from 'jspdf'
import { BRAND } from '../brand'
import { LAYER_META, siteSlug, type LayerType, type Site, type Station } from '../types'
import { blobToDataURL, loadImage, rasterizeMap } from '../imageUtils'
import logoUrl from '../assets/logo.png'

// A4 portrait, millimetres
const PAGE_W = 210
const MARGIN = 15
const CONTENT_W = PAGE_W - MARGIN * 2
const FOOTER_TOP = 280
const TOTAL_PAGES_ALIAS = '{totalPages}'

const RED = BRAND.red
const NAVY = BRAND.navy
const INK = BRAND.ink
const TEAL = BRAND.teal
const GREY = '#6b7280'

function setFill(doc: jsPDF, hex: string) {
  doc.setFillColor(hex)
}

function setText(doc: jsPDF, hex: string) {
  doc.setTextColor(hex)
}

function drawMarker(doc: jsPDF, layer: LayerType, cx: number, cy: number, size: number, num?: number) {
  if (layer === 'rodent') {
    setFill(doc, RED)
    doc.rect(cx - size / 2, cy - size / 2, size, size, 'F')
  } else {
    setFill(doc, TEAL)
    doc.circle(cx, cy, size / 2, 'F')
  }
  if (num !== undefined) {
    setText(doc, '#ffffff')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(num > 99 ? 6.5 : num > 9 ? 8 : 9)
    doc.text(String(num), cx, cy + 0.1, { align: 'center', baseline: 'middle' })
  }
}

function drawFooters(doc: jsPDF) {
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setDrawColor(RED)
    doc.setLineWidth(0.5)
    doc.line(MARGIN, FOOTER_TOP + 3, PAGE_W - MARGIN, FOOTER_TOP + 3)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    setText(doc, GREY)
    doc.text(BRAND.footerLine, PAGE_W / 2, FOOTER_TOP + 8, { align: 'center' })
    doc.text(`Page ${i} of ${TOTAL_PAGES_ALIAS}`, PAGE_W / 2, FOOTER_TOP + 12.5, { align: 'center' })
  }
}

interface TableCtx {
  doc: jsPDF
  y: number
}

const COLS = [
  { title: '#', w: 12 },
  { title: 'Type', w: 30 },
  { title: 'Location', w: 76 },
  { title: 'Product', w: 36 },
  { title: 'Condition', w: 26 },
]

function colX(idx: number) {
  let x = MARGIN
  for (let i = 0; i < idx; i++) x += COLS[i].w
  return x
}

function drawTableHeader(ctx: TableCtx) {
  const { doc } = ctx
  setFill(doc, NAVY)
  doc.rect(MARGIN, ctx.y, CONTENT_W, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  setText(doc, '#ffffff')
  COLS.forEach((c, i) => {
    doc.text(c.title, colX(i) + 2.5, ctx.y + 5.4)
  })
  ctx.y += 8
}

function ensureRoom(ctx: TableCtx, needed: number) {
  if (ctx.y + needed > FOOTER_TOP - 4) {
    ctx.doc.addPage()
    ctx.y = 22
    drawTableHeader(ctx)
  }
}

function drawGroupRow(ctx: TableCtx, layer: LayerType, count: number) {
  ensureRoom(ctx, 16)
  const { doc } = ctx
  ctx.y += 3
  drawMarker(doc, layer, MARGIN + 3, ctx.y + 3, 4.2)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setText(doc, NAVY)
  doc.text(`${LAYER_META[layer].typeLabel}s (${count})`, MARGIN + 8, ctx.y + 4.4)
  ctx.y += 8.5
}

function drawStationRow(ctx: TableCtx, st: Station, zebra: boolean) {
  const { doc } = ctx
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const location = st.label.trim() || '—'
  const locLines: string[] = doc.splitTextToSize(location, COLS[2].w - 5)
  const prodLines: string[] = doc.splitTextToSize(st.product || '—', COLS[3].w - 5)
  const lines = Math.max(locLines.length, prodLines.length, 1)
  const rowH = Math.max(7.5, lines * 4.2 + 3.4)
  ensureRoom(ctx, rowH)

  if (zebra) {
    setFill(doc, '#f4f6f8')
    doc.rect(MARGIN, ctx.y, CONTENT_W, rowH, 'F')
  }
  doc.setDrawColor('#dfe3e8')
  doc.setLineWidth(0.2)
  doc.line(MARGIN, ctx.y + rowH, PAGE_W - MARGIN, ctx.y + rowH)

  const textY = ctx.y + 5.2
  drawMarker(doc, st.layer, colX(0) + 4.6, ctx.y + rowH / 2, 4.6, st.num)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  setText(doc, INK)
  doc.text(LAYER_META[st.layer].name, colX(1) + 2.5, textY)
  doc.text(locLines, colX(2) + 2.5, textY)
  doc.text(prodLines, colX(3) + 2.5, textY)
  const bad = st.condition === 'Activity' || st.condition === 'Damaged' || st.condition === 'Missing'
  if (bad) {
    setText(doc, RED)
    doc.setFont('helvetica', 'bold')
  }
  doc.text(st.condition, colX(4) + 2.5, textY)
  setText(doc, INK)
  ctx.y += rowH
}

export async function exportSitePdf(site: Site, mapBlob: Blob): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const h = site.header

  // ---------- page 1: header ----------
  const logoData = await blobToDataURL(await (await fetch(logoUrl)).blob())
  const logoImg = await loadImage(logoData)
  const logoH = 17
  const logoW = logoH * (logoImg.naturalWidth / logoImg.naturalHeight)
  doc.addImage(logoData, 'PNG', MARGIN, 11, logoW, logoH)

  const headX = MARGIN + logoW + 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  setText(doc, NAVY)
  doc.text('Rodent & Termite Station Plan', headX, 18)

  doc.setFontSize(10.5)
  setText(doc, INK)
  doc.text(h.siteName || 'Untitled site', headX, 24.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  setText(doc, GREY)
  if (h.address) doc.text(h.address, headX, 29)

  doc.setFontSize(9)
  setText(doc, INK)
  const metaY = 34.5
  doc.setFont('helvetica', 'bold')
  doc.text('Technician:', MARGIN, metaY)
  doc.text('Date:', MARGIN + 62, metaY)
  doc.text('Product:', MARGIN + 105, metaY)
  doc.setFont('helvetica', 'normal')
  doc.text(h.technician || '—', MARGIN + 19, metaY)
  doc.text(h.date || '—', MARGIN + 71.5, metaY)
  doc.text(h.product || '—', MARGIN + 119.5, metaY)

  doc.setDrawColor(RED)
  doc.setLineWidth(0.9)
  doc.line(MARGIN, 38, PAGE_W - MARGIN, 38)

  // ---------- page 1: map ----------
  const mapTop = 43
  const legendH = 14
  const maxMapH = FOOTER_TOP - 6 - legendH - mapTop
  const ratio = site.mapH / site.mapW
  let mapW = CONTENT_W
  let mapH = mapW * ratio
  if (mapH > maxMapH) {
    mapH = maxMapH
    mapW = mapH / ratio
  }
  const mapX = MARGIN + (CONTENT_W - mapW) / 2
  const { dataUrl, format } = await rasterizeMap(mapBlob, site.mapW, site.mapH)
  doc.setDrawColor('#c2c9d1')
  doc.setLineWidth(0.3)
  doc.addImage(dataUrl, format, mapX, mapTop, mapW, mapH)
  doc.rect(mapX, mapTop, mapW, mapH, 'S')

  const sorted = [...site.stations].sort((a, b) => a.num - b.num)
  for (const st of sorted) {
    drawMarker(doc, st.layer, mapX + st.x * mapW, mapTop + st.y * mapH, 4.6, st.num)
  }

  // ---------- page 1: legend ----------
  const legendY = mapTop + mapH + 7
  const rodentCount = site.stations.filter(s => s.layer === 'rodent').length
  const trelonaCount = site.stations.filter(s => s.layer === 'trelona').length
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  setText(doc, NAVY)
  doc.text('Legend', MARGIN, legendY)
  drawMarker(doc, 'rodent', MARGIN + 22, legendY - 1, 4.2)
  doc.setFont('helvetica', 'normal')
  setText(doc, INK)
  doc.text(`Rodent bait station (${rodentCount})`, MARGIN + 26.5, legendY)
  drawMarker(doc, 'trelona', MARGIN + 82, legendY - 1, 4.2)
  doc.text(`Trelona termite station (${trelonaCount})`, MARGIN + 86.5, legendY)

  // ---------- page 2+: register ----------
  doc.addPage()
  const ctx: TableCtx = { doc, y: 16 }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  setText(doc, NAVY)
  doc.text('Station Register', MARGIN, ctx.y + 4)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  setText(doc, GREY)
  doc.text(`${h.siteName} — ${h.date}`, PAGE_W - MARGIN, ctx.y + 4, { align: 'right' })
  ctx.y += 9
  drawTableHeader(ctx)

  if (!site.stations.length) {
    ctx.y += 8
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    setText(doc, GREY)
    doc.text('No stations recorded.', MARGIN + 2, ctx.y)
  } else {
    for (const layer of ['rodent', 'trelona'] as LayerType[]) {
      const group = sorted.filter(s => s.layer === layer)
      if (!group.length) continue
      drawGroupRow(ctx, layer, group.length)
      group.forEach((st, i) => drawStationRow(ctx, st, i % 2 === 1))
    }
  }

  drawFooters(doc)
  doc.putTotalPages(TOTAL_PAGES_ALIAS)

  doc.save(`${siteSlug(h.siteName)}_Station_Plan_${h.date}.pdf`)
}
