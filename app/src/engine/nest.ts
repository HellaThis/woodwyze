import { KERF } from './materials'
import type { Material, MaterialId, NestResult, Part, Placement, SheetLayout } from './types'

interface Piece {
  name: string
  group: string
  /** Along the grain (sheet x). */
  l: number
  w: number
  grain: boolean
}

interface Strip {
  y: number
  height: number
  x: number
}

interface OpenSheet {
  strips: Strip[]
  usedY: number
  placements: Placement[]
}

/**
 * Strip packing on each sheet: parts sorted by width, laid left to right in
 * strips that run along the grain, with a saw kerf between every cut. Parts
 * without visible grain may rotate. This is a guillotine-friendly layout a
 * shop can actually cut on a table saw or track saw, not an optimal nest.
 */
export function nestParts(parts: Part[], materials: Record<MaterialId, Material>): NestResult {
  const sheets: SheetLayout[] = []
  const oversize: Part[] = []
  const byMaterial = new Map<MaterialId, Piece[]>()

  for (const p of parts) {
    const m = materials[p.material]
    if (m.kind === 'lumber') continue // bought by the board foot, not nested
    const fits =
      (p.length <= m.sheetLength && p.width <= m.sheetWidth) ||
      (!p.grain && p.width <= m.sheetLength && p.length <= m.sheetWidth)
    if (!fits) {
      oversize.push(p)
      continue
    }
    const list = byMaterial.get(p.material) ?? []
    for (let i = 0; i < p.qty; i++) list.push({ name: p.name, group: p.group, l: p.length, w: p.width, grain: p.grain })
    byMaterial.set(p.material, list)
  }

  for (const [matId, pieces] of byMaterial) {
    const m = materials[matId]
    // Widest strips first, longest within a strip first.
    pieces.sort((a, b) => b.w - a.w || b.l - a.l)
    const open: OpenSheet[] = []

    for (const pc of pieces) {
      const options: { l: number; w: number; rotated: boolean }[] = [{ l: pc.l, w: pc.w, rotated: false }]
      if (!pc.grain) options.push({ l: pc.w, w: pc.l, rotated: true })
      let placed = false

      // 1. An existing strip with room along x, tall enough for the piece.
      for (const s of open) {
        for (const strip of s.strips) {
          for (const o of options) {
            if (o.w <= strip.height && strip.x + o.l <= m.sheetLength + 1e-6) {
              s.placements.push({ name: pc.name, group: pc.group, x: strip.x, y: strip.y, w: o.l, h: o.w, rotated: o.rotated })
              strip.x += o.l + KERF
              placed = true
              break
            }
          }
          if (placed) break
        }
        if (placed) break
      }

      // 2. A new strip on a sheet with room left across its width.
      if (!placed) {
        for (const s of open) {
          for (const o of options) {
            if (s.usedY + o.w <= m.sheetWidth + 1e-6 && o.l <= m.sheetLength + 1e-6) {
              const strip = { y: s.usedY, height: o.w, x: o.l + KERF }
              s.strips.push(strip)
              s.usedY += o.w + KERF
              s.placements.push({ name: pc.name, group: pc.group, x: 0, y: strip.y, w: o.l, h: o.w, rotated: o.rotated })
              placed = true
              break
            }
          }
          if (placed) break
        }
      }

      // 3. A fresh sheet.
      if (!placed) {
        const o = options.find((op) => op.l <= m.sheetLength && op.w <= m.sheetWidth) ?? options[0]
        open.push({
          strips: [{ y: 0, height: o.w, x: o.l + KERF }],
          usedY: o.w + KERF,
          placements: [{ name: pc.name, group: pc.group, x: 0, y: 0, w: o.l, h: o.w, rotated: o.rotated }],
        })
      }
    }

    open.forEach((s, i) => {
      const area = s.placements.reduce((a, p) => a + p.w * p.h, 0)
      sheets.push({ material: matId, index: i + 1, placements: s.placements, yield: area / (m.sheetLength * m.sheetWidth) })
    })
  }

  return { sheets, oversize }
}
