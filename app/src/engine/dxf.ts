import type { Material, MaterialId, SheetLayout } from './types'

/**
 * Minimal R12 ASCII DXF of every sheet layout, in inches. Sheets are stacked
 * vertically 12" apart. Each part is a closed rectangle on layer PARTS with its
 * name on layer LABELS; the sheet outline is on layer SHEET.
 */
export function sheetsToDxf(sheets: SheetLayout[], materials: Record<MaterialId, Material>): string {
  const out: string[] = ['0', 'SECTION', '2', 'ENTITIES']
  const line = (layer: string, x1: number, y1: number, x2: number, y2: number) =>
    out.push('0', 'LINE', '8', layer, '10', f(x1), '20', f(y1), '11', f(x2), '21', f(y2))
  const rect = (layer: string, x: number, y: number, w: number, h: number) => {
    line(layer, x, y, x + w, y)
    line(layer, x + w, y, x + w, y + h)
    line(layer, x + w, y + h, x, y + h)
    line(layer, x, y + h, x, y)
  }
  const text = (layer: string, x: number, y: number, h: number, s: string) =>
    out.push('0', 'TEXT', '8', layer, '10', f(x), '20', f(y), '40', f(h), '1', s.replace(/[\r\n]/g, ' '))

  let offset = 0
  for (const sh of sheets) {
    const m = materials[sh.material]
    rect('SHEET', 0, offset, m.sheetLength, m.sheetWidth)
    text('LABELS', 0, offset + m.sheetWidth + 1.5, 1.5, `${m.name} - sheet ${sh.index}`)
    for (const p of sh.placements) {
      rect('PARTS', p.x, offset + p.y, p.w, p.h)
      const label = `${p.group ? p.group + ' ' : ''}${p.name} ${p.w}x${p.h}`
      text('LABELS', p.x + 0.5, offset + p.y + 0.5, 0.75, label)
    }
    offset += m.sheetWidth + 12
  }
  out.push('0', 'ENDSEC', '0', 'EOF')
  return out.join('\n')
}

const f = (n: number) => (Math.round(n * 1000) / 1000).toString()
