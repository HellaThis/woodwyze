import { MATERIALS } from './materials'
import { FLOATING_DOUBLE_VANITY } from './floatingVanity'
import type { BuildOptions, BuildResult, ElevationRect, Hardware, Params, Part, Template } from './types'

/** Round to the nearest 1/16". */
export const r16 = (n: number) => Math.round(n * 16) / 16

const REVEAL = 0.125 // gap between doors and around drawer fronts
const TOE = 4 // toe kick height for base cabinets

const HW = {
  hinge: (qty: number): Hardware => ({ name: 'Concealed hinge, soft close', qty, unitPrice: 5.5 }),
  pull: (qty: number): Hardware => ({ name: 'Pull, 5" center', qty, unitPrice: 6 }),
  pins: (qty: number): Hardware => ({ name: 'Shelf pin', qty, unitPrice: 0.25 }),
  slides: (qty: number): Hardware => ({ name: 'Undermount drawer slides, pair', qty, unitPrice: 28 }),
  screws: (qty: number): Hardware => ({ name: 'Assembly screws, box of 100', qty, unitPrice: 9 }),
}

function part(
  name: string,
  group: string,
  qty: number,
  length: number,
  width: number,
  material: Part['material'],
  grain: boolean,
  edgeBand = 0,
): Part {
  return { name, group, qty, length: r16(length), width: r16(width), material, grain, edgeBand: r16(edgeBand) }
}

/** Doors for one opening: one door up to 24" wide, two above that. */
function doorsFor(openingWidth: number, openingHeight: number) {
  const count = openingWidth > 24 ? 2 : 1
  const w = (openingWidth - REVEAL * (count + 1)) / count
  const h = openingHeight - REVEAL * 2
  return { count, w, h }
}

function mergeHardware(items: Hardware[]): Hardware[] {
  const map = new Map<string, Hardware>()
  for (const h of items) {
    if (h.qty <= 0) continue
    const prev = map.get(h.name)
    if (prev) prev.qty += h.qty
    else map.set(h.name, { ...h })
  }
  return [...map.values()]
}

// ── Base cabinet run ────────────────────────────────────────────────────────

function baseRun(p: Params, o: BuildOptions): BuildResult {
  const t = MATERIALS[o.carcass].thickness
  const boxes = Math.round(p.boxes)
  const bw = p.width / boxes
  const boxH = p.height - TOE
  const parts: Part[] = []
  const hw: Hardware[] = []
  const elevation: ElevationRect[] = []
  let doorTotal = 0

  for (let i = 0; i < boxes; i++) {
    const g = boxes > 1 ? `Box ${i + 1}` : ''
    const inside = bw - 2 * t
    parts.push(part('Side', g, 2, boxH, p.depth, o.carcass, true, boxH))
    parts.push(part('Bottom', g, 1, inside, p.depth, o.carcass, true))
    parts.push(part('Stretcher', g, 2, inside, 4, o.carcass, false))
    parts.push(part('Back', g, 1, boxH, bw - t, o.back, false))
    parts.push(part('Shelf', g, 1, inside - 0.0625, p.depth - 1, o.carcass, true, inside))
    parts.push(part('Toe kick', g, 1, bw, TOE, o.carcass, false))

    const d = doorsFor(bw, boxH)
    parts.push(part('Door', g, d.count, d.h, d.w, o.carcass, true, 2 * (d.h + d.w)))
    doorTotal += d.count
    hw.push(HW.hinge(2 * d.count), HW.pull(d.count), HW.pins(4))

    const x0 = i * bw
    elevation.push({ x: x0, y: 0, w: bw, h: TOE, kind: 'toekick' })
    elevation.push({ x: x0, y: TOE, w: bw, h: boxH, kind: 'carcass' })
    for (let k = 0; k < d.count; k++) {
      elevation.push({ x: x0 + REVEAL + k * (d.w + REVEAL), y: TOE + REVEAL, w: d.w, h: d.h, kind: 'door', pull: d.count === 2 && k === 0 ? 'right' : d.count === 2 ? 'left' : 'right' })
    }
  }
  hw.push(HW.screws(Math.max(1, Math.ceil(boxes / 3))))

  return {
    parts,
    hardware: mergeHardware(hw),
    laborHours: boxes * 2.5 + doorTotal * 0.75 + 1.5,
    elevation,
    overall: { width: p.width, height: p.height, depth: p.depth },
    notes: [
      `${boxes} frameless boxes, ${r16(bw)}" wide each, full-overlay doors with ${REVEAL}" reveals.`,
      'Countertop not included.',
    ],
  }
}

// ── Bookcase ───────────────────────────────────────────────────────────────

function bookcase(p: Params, o: BuildOptions): BuildResult {
  const t = MATERIALS[o.carcass].thickness
  const inside = p.width - 2 * t
  const shelves = Math.round(p.shelves)
  const fixed = p.height > 48 ? 1 : 0
  const parts: Part[] = [
    part('Side', '', 2, p.height, p.depth, o.carcass, true, p.height),
    part('Top and bottom', '', 2, inside, p.depth, o.carcass, true, inside),
    part('Back', '', 1, p.height, p.width, o.back, false),
  ]
  if (fixed) parts.push(part('Fixed shelf', '', 1, inside, p.depth, o.carcass, true, inside))
  if (shelves) parts.push(part('Adjustable shelf', '', shelves, inside - 0.0625, p.depth - 0.75, o.carcass, true, inside))

  const elevation: ElevationRect[] = [{ x: 0, y: 0, w: p.width, h: p.height, kind: 'carcass' }]
  const levels = shelves + fixed
  for (let i = 1; i <= levels; i++) {
    const y = t + ((p.height - 2 * t) * i) / (levels + 1)
    elevation.push({ x: t, y, w: inside, h: t, kind: 'shelf' })
  }

  return {
    parts,
    hardware: mergeHardware([HW.pins(shelves * 4), HW.screws(1)]),
    laborHours: 3 + shelves * 0.4 + fixed * 0.5,
    elevation,
    overall: { width: p.width, height: p.height, depth: p.depth },
    notes: [fixed ? 'A fixed shelf at mid-height stiffens the case.' : 'Short enough to skip a fixed shelf.'],
  }
}

// ── Vanity ─────────────────────────────────────────────────────────────────

function vanity(p: Params, o: BuildOptions): BuildResult {
  const t = MATERIALS[o.carcass].thickness
  const dt = MATERIALS.ply12.thickness
  const boxH = p.height - TOE
  const drawers = Math.round(p.drawers)
  const bank = drawers > 0 ? 15 : 0
  const sinkW = p.width - bank - (drawers > 0 ? t : 0)
  const parts: Part[] = [
    part('Side', '', 2, boxH, p.depth, o.carcass, true, boxH),
    part('Bottom', '', 1, p.width - 2 * t, p.depth, o.carcass, true),
    part('Stretcher', '', 2, p.width - 2 * t, 4, o.carcass, false),
    part('Back', '', 1, boxH, p.width - t, o.back, false),
    part('Toe kick', '', 1, p.width, TOE, o.carcass, false),
  ]
  const hw: Hardware[] = [HW.screws(1)]
  const elevation: ElevationRect[] = [
    { x: 0, y: 0, w: p.width, h: TOE, kind: 'toekick' },
    { x: 0, y: TOE, w: p.width, h: boxH, kind: 'carcass' },
  ]

  const d = doorsFor(sinkW, boxH)
  parts.push(part('Door', '', d.count, d.h, d.w, o.carcass, true, 2 * (d.h + d.w)))
  hw.push(HW.hinge(2 * d.count), HW.pull(d.count))
  for (let k = 0; k < d.count; k++) {
    elevation.push({ x: REVEAL + k * (d.w + REVEAL), y: TOE + REVEAL, w: d.w, h: d.h, kind: 'door', pull: d.count === 2 && k === 1 ? 'left' : 'right' })
  }

  if (drawers > 0) {
    parts.push(part('Divider', '', 1, boxH - t, p.depth - 1, o.carcass, true, boxH - t))
    const frontH = (boxH - REVEAL * (drawers + 1)) / drawers
    const boxDepth = Math.floor(p.depth - 3)
    const boxW = bank - 2 * t - 0.4 // undermount slide clearance, approximate
    const sideH = Math.max(3, Math.min(8, frontH - 1.5))
    parts.push(part('Drawer front', '', drawers, bank - REVEAL * 2, frontH, o.carcass, true, 2 * (bank + frontH)))
    parts.push(part('Drawer side', '', drawers * 2, boxDepth, sideH, 'ply12', false, boxDepth))
    parts.push(part('Drawer front and back', '', drawers * 2, boxW - 2 * dt, sideH, 'ply12', false, boxW))
    parts.push(part('Drawer bottom', '', drawers, boxDepth - dt, boxW - dt, 'ply14', false))
    hw.push(HW.slides(drawers), HW.pull(drawers))
    const x0 = p.width - bank
    for (let k = 0; k < drawers; k++) {
      elevation.push({ x: x0 + REVEAL, y: TOE + REVEAL + k * (frontH + REVEAL), w: bank - 2 * REVEAL, h: frontH, kind: 'drawer' })
    }
  }

  return {
    parts,
    hardware: mergeHardware(hw),
    laborHours: 3.5 + d.count * 0.75 + drawers * 1.25,
    elevation,
    overall: { width: p.width, height: p.height, depth: p.depth },
    notes: [
      drawers ? `${drawers}-drawer bank, 15" wide, beside the sink opening.` : 'Sink cabinet with doors only.',
      'Sink cutout and top not included.',
    ],
  }
}

// ── Built-in shelving wall ─────────────────────────────────────────────────

function builtIn(p: Params, o: BuildOptions): BuildResult {
  const t = MATERIALS[o.carcass].thickness
  const sections = Math.round(p.sections)
  const perSection = Math.round(p.shelves)
  const sw = (p.width - t * (sections + 1)) / sections
  const parts: Part[] = [
    part('End panel', '', 2, p.height, p.depth, o.carcass, true, p.height),
    part('Divider', '', sections - 1, p.height - 2 * t, p.depth, o.carcass, true, p.height),
    part('Top and bottom', '', 2 * sections, sw, p.depth, o.carcass, true, sw),
    part('Shelf', '', sections * perSection, sw - 0.0625, p.depth - 0.75, o.carcass, true, sw),
    part('Back', '', sections, p.height - 2 * t, sw + t, o.back, false),
  ].filter((x) => x.qty > 0)

  const elevation: ElevationRect[] = [{ x: 0, y: 0, w: p.width, h: p.height, kind: 'carcass' }]
  for (let s = 0; s < sections; s++) {
    const x = t + s * (sw + t)
    if (s > 0) elevation.push({ x: x - t, y: t, w: t, h: p.height - 2 * t, kind: 'shelf' })
    for (let i = 1; i <= perSection; i++) {
      elevation.push({ x, y: t + ((p.height - 2 * t) * i) / (perSection + 1), w: sw, h: t, kind: 'shelf' })
    }
  }

  return {
    parts,
    hardware: mergeHardware([HW.pins(sections * perSection * 4), HW.screws(Math.ceil(sections / 2))]),
    laborHours: 2 + sections * 2 + sections * perSection * 0.35 + 2, // +2 install
    elevation,
    overall: { width: p.width, height: p.height, depth: p.depth },
    notes: [`${sections} sections, ${r16(sw)}" clear between dividers.`, 'Includes 2 hours for on-site install.'],
  }
}

const dims = (w: [number, number, number], h: [number, number, number], d: [number, number, number]) => [
  { key: 'width', label: 'Width', unit: 'in' as const, min: w[0], max: w[1], step: 0.25, default: w[2] },
  { key: 'height', label: 'Height', unit: 'in' as const, min: h[0], max: h[1], step: 0.25, default: h[2] },
  { key: 'depth', label: 'Depth', unit: 'in' as const, min: d[0], max: d[1], step: 0.25, default: d[2] },
]

export const TEMPLATES: Template[] = [
  {
    id: 'base-run',
    name: 'Base cabinet run',
    audience: 'shop',
    blurb: 'Frameless kitchen or laundry base cabinets with doors and an adjustable shelf.',
    params: [
      ...dims([12, 144, 72], [30, 36, 34.5], [12, 25, 24]),
      { key: 'boxes', label: 'Boxes', unit: 'count', min: 1, max: 8, step: 1, default: 3 },
    ],
    build: baseRun,
  },
  {
    id: 'vanity',
    name: 'Bathroom vanity',
    audience: 'both',
    blurb: 'Sink cabinet with doors and an optional drawer bank.',
    params: [
      ...dims([24, 72, 36], [30, 36, 34.5], [16, 24, 21]),
      { key: 'drawers', label: 'Drawers', unit: 'count', min: 0, max: 4, step: 1, default: 3 },
    ],
    build: vanity,
  },
  {
    id: 'bookcase',
    name: 'Bookcase',
    audience: 'both',
    blurb: 'Freestanding case with adjustable shelves and a fixed shelf when it gets tall.',
    params: [
      ...dims([12, 48, 36], [24, 96, 72], [8, 16, 12]),
      { key: 'shelves', label: 'Adjustable shelves', unit: 'count', min: 0, max: 8, step: 1, default: 4 },
    ],
    build: bookcase,
  },
  {
    id: 'built-in',
    name: 'Built-in shelving wall',
    audience: 'shop',
    blurb: 'Floor-to-ceiling shelving in sections, built in the shop and installed on site.',
    params: [
      ...dims([36, 192, 120], [60, 96, 90], [10, 18, 14]),
      { key: 'sections', label: 'Sections', unit: 'count', min: 1, max: 8, step: 1, default: 4 },
      { key: 'shelves', label: 'Shelves per section', unit: 'count', min: 0, max: 8, step: 1, default: 4 },
    ],
    build: builtIn,
  },
  FLOATING_DOUBLE_VANITY,
]

export const templateById = (id: string) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]

export const defaultParams = (t: Template): Params => Object.fromEntries(t.params.map((p) => [p.key, p.default]))

export function clampParams(t: Template, p: Params): Params {
  const out: Params = {}
  for (const d of t.params) {
    const v = Number.isFinite(p[d.key]) ? p[d.key] : d.default
    out[d.key] = Math.min(d.max, Math.max(d.min, v))
  }
  return out
}
