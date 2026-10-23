import { describe, expect, it } from 'vitest'
import { DEFAULT_PRICES, KERF, MATERIALS, TEMPLATES, defaultParams, fraction, nestParts, runJob, sheetsToDxf } from './index'
import type { Part } from './types'

const overlaps = (a: { x: number; y: number; w: number; h: number }, b: typeof a) =>
  a.x < b.x + b.w - 1e-6 && b.x < a.x + a.w - 1e-6 && a.y < b.y + b.h - 1e-6 && b.y < a.y + a.h - 1e-6

describe('fraction', () => {
  it('formats sixteenths', () => {
    expect(fraction(23.4375)).toBe('23 7/16')
    expect(fraction(0.75)).toBe('3/4')
    expect(fraction(12)).toBe('12')
    expect(fraction(11.999)).toBe('12')
  })
})

describe('every template at its defaults', () => {
  for (const t of TEMPLATES) {
    it(`${t.name} nests without overlaps and prices sensibly`, () => {
      const job = runJob(t.id, defaultParams(t))
      expect(job.build.parts.length).toBeGreaterThan(0)
      expect(job.nest.oversize).toEqual([])
      const pieces = job.build.parts.filter((p) => MATERIALS[p.material].kind === 'sheet').reduce((a, p) => a + p.qty, 0)
      const placed = job.nest.sheets.reduce((a, s) => a + s.placements.length, 0)
      expect(placed).toBe(pieces)
      for (const sh of job.nest.sheets) {
        const m = MATERIALS[sh.material]
        for (const p of sh.placements) {
          expect(p.x + p.w).toBeLessThanOrEqual(m.sheetLength + 1e-6)
          expect(p.y + p.h).toBeLessThanOrEqual(m.sheetWidth + 1e-6)
        }
        for (let i = 0; i < sh.placements.length; i++)
          for (let j = i + 1; j < sh.placements.length; j++) expect(overlaps(sh.placements[i], sh.placements[j])).toBe(false)
        expect(sh.yield).toBeGreaterThan(0)
        expect(sh.yield).toBeLessThanOrEqual(1)
      }
      const c = job.costing
      expect(c.total).toBeGreaterThan(c.subtotal)
      expect(c.lines.reduce((a, l) => a + l.amount, 0)).toBeCloseTo(c.subtotal, 1)
    })
  }
})

describe('base cabinet run', () => {
  it('splits the width evenly and uses two doors on wide boxes', () => {
    const job = runJob('base-run', { width: 60, height: 34.5, depth: 24, boxes: 2 })
    const sides = job.build.parts.filter((p) => p.name === 'Side')
    expect(sides).toHaveLength(2)
    expect(sides[0].length).toBe(30.5) // 34.5 minus a 4" toe kick
    const bottom = job.build.parts.find((p) => p.name === 'Bottom')!
    expect(bottom.length).toBe(28.5) // 30 - 2 x 3/4
    const doors = job.build.parts.filter((p) => p.name === 'Door')
    expect(doors.every((d) => d.qty === 2)).toBe(true)
  })
})

describe('nesting', () => {
  it('rotates grainless parts and keeps grain parts aligned', () => {
    const parts: Part[] = [
      { name: 'Grain', group: '', qty: 1, length: 40, width: 30, material: 'ply34', grain: true, edgeBand: 0 },
      { name: 'Free', group: '', qty: 1, length: 30, width: 46, material: 'ply34', grain: false, edgeBand: 0 },
    ]
    const n = nestParts(parts, DEFAULT_PRICES.materials)
    const free = n.sheets.flatMap((s) => s.placements).find((p) => p.name === 'Free')!
    const grain = n.sheets.flatMap((s) => s.placements).find((p) => p.name === 'Grain')!
    expect(grain.rotated).toBe(false)
    expect(grain.w).toBe(40)
    expect(free.w * free.h).toBe(30 * 46)
  })

  it('leaves a kerf between neighbours in a strip', () => {
    const parts: Part[] = [{ name: 'Shelf', group: '', qty: 2, length: 30, width: 11, material: 'ply34', grain: true, edgeBand: 0 }]
    const [a, b] = nestParts(parts, DEFAULT_PRICES.materials).sheets[0].placements
    expect(b.x - (a.x + a.w)).toBeCloseTo(KERF)
  })

  it('flags parts larger than a sheet', () => {
    const job = runJob('base-run', { width: 144, height: 34.5, depth: 24, boxes: 1 })
    expect(job.nest.oversize.length).toBeGreaterThan(0)
  })
})

describe('dxf', () => {
  it('writes a well-formed entity section', () => {
    const job = runJob('bookcase', { width: 36, height: 72, depth: 12, shelves: 4 })
    const dxf = sheetsToDxf(job.nest.sheets, MATERIALS)
    expect(dxf.startsWith('0\nSECTION\n2\nENTITIES')).toBe(true)
    expect(dxf.trimEnd().endsWith('EOF')).toBe(true)
    expect(dxf).toContain('Adjustable shelf')
  })
})

describe("floating double vanity, Adam's canary preset", () => {
  const job = runJob('floating-double', defaultParams(TEMPLATES.find((t) => t.id === 'floating-double')!))
  const find = (name: string) => job.build.parts.find((p) => p.name === name)!

  it('matches the v3 cut list', () => {
    expect(find('Side')).toMatchObject({ length: 21, width: 17.75 })
    expect(find('Bottom')).toMatchObject({ length: 70.5, width: 19.5 })
    expect(find('Back')).toMatchObject({ length: 70.5, width: 17.75 })
    expect(find('Upright')).toMatchObject({ qty: 2, length: 16.25, width: 19.5 })
    expect(find('Mid shelf, sink bay')).toMatchObject({ qty: 2, length: 22.0625 })
    expect(find('Mid shelf, center')).toMatchObject({ qty: 1, length: 24.875 })
    expect(find('Wall cleat, 45 deg bevel up').length).toBe(69.5)
    expect(find('Door')).toMatchObject({ qty: 4, length: 10.1875, width: 9.375, material: 'canary44' })
    expect(find('Drawer front')).toMatchObject({ length: 24.75, width: 9.375 })
    expect(find('Stile')).toMatchObject({ length: 17.75, material: 'maple44' })
  })

  it('passes every design check except the slab depth, which needs a back strip', () => {
    const failing = job.build.checks!.filter((c) => !c.ok).map((c) => c.label)
    expect(failing).toEqual(['Slab depth'])
    expect(job.build.checks!.find((c) => c.label === 'Slab depth')!.detail).toContain('5 3/4')
  })

  it('keeps sinks symmetric when the alcove changes', () => {
    const j = runJob('floating-double', { ...defaultParams(TEMPLATES.find((t) => t.id === 'floating-double')!), alcove: 90 })
    const sym = j.build.checks!.find((c) => c.label === 'Sinks centered on their bays')!
    expect(sym.ok).toBe(true)
    expect(j.build.marks!.map((m) => m.x)).toEqual([18, 72])
  })

  it('prices solid lumber by the board foot and keeps it off the sheets', () => {
    expect(job.costing.boardFeet.maple44).toBeGreaterThan(0)
    expect(job.costing.boardFeet.canary44).toBeGreaterThan(0)
    expect(job.nest.sheets.some((s) => s.material === 'maple44' || s.material === 'canary44')).toBe(false)
    expect(job.nest.oversize).toEqual([])
  })
})
