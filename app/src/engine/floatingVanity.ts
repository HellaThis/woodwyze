import { MATERIALS } from './materials'
import type { BuildOptions, BuildResult, Check, ElevationRect, Hardware, Params, Part, Template } from './types'

const r16 = (n: number) => Math.round(n * 16) / 16
const r32 = (n: number) => Math.round(n * 32) / 32

/**
 * Floating double vanity in an alcove, as designed for Adam's canary build (v3):
 * - one wall-hung maple ply carcass, Domino butt joints, no dados
 * - solid maple face frame with inset canary fronts: two doors per sink bay
 *   hide the traps, one large center drawer on 18" Blum Movento slides
 * - open towel shelf above, split by full-height uprights and a three-piece mid shelf
 * - back inset 3/4" for a French cleat, with a glued case cleat at the top and a
 *   spacer rail at the bottom so every structural screw passes through solid stock
 * - a live-edge slab scribed wall to wall on cleats, with vessel sinks centered
 *   on the alcove, the same distance from each wall
 */
function build(p: Params, o: BuildOptions): BuildResult {
  const t = MATERIALS[o.carcass].thickness
  const ffT = 0.75 // face frame thickness
  const stile = 1.5
  const mull = 1.5
  const brail = 1
  const mrail = 1
  const rev = 0.0625 // reveal around inset fronts
  const inset = 0.75 // back set in from the sides' rear edges, the cleat cavity
  const cleatH = 4
  const spacerH = 3
  const slideLen = 18 // Blum Movento 457 mm
  const boxT = MATERIALS.ply12.thickness

  const caseW = p.caseWidth
  const caseD = p.caseDepth
  const lowerOpen = p.lowerClear
  const upperOpen = p.upperClear
  const caseH = 3 * t + lowerOpen + upperOpen
  const sideD = caseD - ffT
  const intD = sideD - inset - t // front of carcass to front face of the back
  const inside = caseW - 2 * t

  // Sinks sit the same distance from each wall; the case is centered in the alcove.
  const endGap = (p.alcove - caseW) / 2
  const sinkFromCase = p.sinkFromWall - endGap
  const sinkCC = p.alcove - 2 * p.sinkFromWall
  const bayOpen = 2 * (sinkFromCase - stile) // each sink bay opening, centered on its sink
  const ctrOpen = caseW - 2 * stile - 2 * bayOpen - 2 * mull // drawer opening = Movento LW
  const openH = 2 * t + lowerOpen - brail - mrail
  const up1 = stile + bayOpen + mull - t // left face of the left upright, from the case's left end
  const up2 = caseW - stile - bayOpen - mull // left face of the right upright
  const counter = p.floorClear + caseH + p.slabThickness
  const rim = counter + p.vesselHeight

  const doorW = (bayOpen - 3 * rev) / 2
  const doorH = openH - 2 * rev
  const drawerW = ctrOpen - 2 * rev
  // Movento box outside width is roughly the opening less 13/32" for 1/2" sides; confirm with Blum's formula.
  const boxW = ctrOpen - 13 / 32
  const boxH = Math.min(9, openH - 1.5)

  const C = o.carcass
  const part = (name: string, group: string, qty: number, length: number, width: number, material: Part['material'], grain: boolean, edgeBand = 0): Part => ({
    name,
    group,
    qty,
    length: r16(length),
    width: r16(width),
    material,
    grain,
    edgeBand: r16(edgeBand),
  })

  const parts: Part[] = [
    // Carcass, 3/4 ply. Length is along the face grain.
    part('Side', 'Carcass', 2, sideD, caseH, C, true, caseH),
    part('Bottom', 'Carcass', 1, inside, intD, C, true),
    part('Subtop', 'Carcass', 1, inside, intD, C, true),
    part('Back', 'Carcass', 1, inside, caseH, C, true),
    part('Upright', 'Carcass', 2, caseH - 2 * t, intD, C, true),
    part('Mid shelf, sink bay', 'Carcass', 2, up1 - t, intD, C, true),
    part('Mid shelf, center', 'Carcass', 1, up2 - (up1 + t), intD, C, true),
    // Hanging
    part('Case cleat, 45 deg bevel down', 'Hanging', 1, inside, cleatH, C, false),
    part('Wall cleat, 45 deg bevel up', 'Hanging', 1, inside - 1, cleatH, C, false),
    part('Bottom spacer rail', 'Hanging', 1, inside, spacerH, C, false),
    part('Slab cleat, side wall', 'Hanging', 2, caseD, 1.5, C, false),
    part('Slab cleat, end gap', 'Hanging', 2, endGap, 1.5, C, false),
    // Face frame, solid maple
    part('Stile', 'Face frame', 2, caseH, stile, 'maple44', true),
    part('Top rail', 'Face frame', 1, caseW - 2 * stile, t, 'maple44', true),
    part('Mid rail', 'Face frame', 1, caseW - 2 * stile, mrail, 'maple44', true),
    part('Bottom rail', 'Face frame', 1, caseW - 2 * stile, brail, 'maple44', true),
    part('Lower mullion', 'Face frame', 2, openH, mull, 'maple44', true),
    part('Upper mullion', 'Face frame', 2, upperOpen, mull, 'maple44', true),
    // Inset fronts, canary, grain horizontal
    part('Door', 'Fronts', 4, doorW, doorH, 'canary44', true),
    part('Drawer front', 'Fronts', 1, drawerW, doorH, 'canary44', true),
    // Drawer box, 1/2 Baltic birch on Movento
    part('Drawer side', 'Drawer box', 2, slideLen, boxH, 'ply12', false),
    part('Drawer front and back', 'Drawer box', 2, boxW - 2 * boxT, boxH, 'ply12', false),
    part('Drawer bottom', 'Drawer box', 1, slideLen - boxT, boxW - boxT, 'ply14', false),
  ]

  // Domino count: roughly one every 6" along each joint, at least two.
  const dom = (len: number) => Math.max(2, Math.ceil(len / 6))
  const carcassJoints = [
    ...Array(4).fill(intD), // bottom and subtop to both sides
    ...Array(2).fill(caseH), // back to sides
    inside,
    inside, // back to bottom and subtop
    ...Array(4).fill(intD), // uprights to bottom and subtop
    ...Array(2).fill(caseH - 2 * t), // uprights to back
    ...Array(6).fill(intD), // three mid shelf pieces, both ends
    up1 - t,
    up1 - t,
    up2 - up1 - t, // mid shelf pieces to back
  ]
  const domino530 = carcassJoints.reduce((a, l) => a + dom(l), 0) + 4 + 4 + 2 // stiles to mid and bottom rails, lower mullions, upper mullions at the mid rail
  const domino420 = 2 + 2 // top rail ends, upper mullions at the top rail

  const studs = Math.max(2, Math.floor(caseW / 16))
  const hardware: Hardware[] = [
    { name: 'Inset soft-close hinge, face frame', qty: 8, unitPrice: 9 },
    { name: 'Blum Movento 18", pair, with locking devices', qty: 1, unitPrice: 95 },
    { name: 'Pull', qty: 5, unitPrice: 12 },
    { name: 'Domino 5x30', qty: domino530, unitPrice: 0.14 },
    { name: 'Domino 4x20', qty: domino420, unitPrice: 0.12 },
    { name: '5/16" structural screw, 6" (2 per stud, top and bottom rows)', qty: studs * 4, unitPrice: 1.6 },
    { name: 'Slotted slab fastener', qty: 10, unitPrice: 0.6 },
    { name: 'Wood plugs for counterbores', qty: studs * 4, unitPrice: 0.15 },
  ]

  // Front view: x from the left wall, y from the floor.
  const x0 = endGap
  const y0 = p.floorClear
  const lowerTop = y0 + t + lowerOpen + t // top of the mid shelf
  const elevation: ElevationRect[] = [
    { x: -2, y: 0, w: 2, h: rim + 4, kind: 'wall' },
    { x: p.alcove, y: 0, w: 2, h: rim + 4, kind: 'wall' },
    { x: x0, y: y0, w: caseW, h: caseH, kind: 'frame' },
    // open towel cubbies above the mid rail, one per face frame opening
    { x: x0 + stile, y: lowerTop, w: bayOpen, h: upperOpen, kind: 'cubby' },
    { x: x0 + stile + bayOpen + mull, y: lowerTop, w: ctrOpen, h: upperOpen, kind: 'cubby' },
    { x: x0 + caseW - stile - bayOpen, y: lowerTop, w: bayOpen, h: upperOpen, kind: 'cubby' },
  ]
  const openY = y0 + brail + rev
  for (const bayX of [x0 + stile, x0 + caseW - stile - bayOpen]) {
    elevation.push({ x: bayX + rev, y: openY, w: doorW, h: doorH, kind: 'door', tone: 'canary', pull: 'right' })
    elevation.push({ x: bayX + 2 * rev + doorW, y: openY, w: doorW, h: doorH, kind: 'door', tone: 'canary', pull: 'left' })
  }
  elevation.push({ x: x0 + stile + bayOpen + mull + rev, y: openY, w: drawerW, h: doorH, kind: 'drawer', tone: 'canary' })
  elevation.push({ x: 0, y: counter - p.slabThickness, w: p.alcove, h: p.slabThickness, kind: 'slab' })
  for (const sx of [p.sinkFromWall, p.alcove - p.sinkFromWall]) {
    elevation.push({ x: sx - p.vesselWidth / 2, y: counter, w: p.vesselWidth, h: p.vesselHeight, kind: 'vessel' })
  }

  const slabDepthNeeded = caseD + 1 // 1" overhang past the face frame
  const backStrip = Math.max(0, slabDepthNeeded - p.slabNarrowest)

  const checks: Check[] = [
    { label: 'Sinks symmetric in the alcove', ok: true, detail: `${fmt(p.sinkFromWall)}" from each wall, ${fmt(sinkCC)}" center to center` },
    { label: 'Sink spacing', ok: sinkCC >= 30, detail: sinkCC >= 30 ? 'At least 30" apart, so two people fit' : `Only ${fmt(sinkCC)}" apart; 30" is the usual minimum` },
    { label: 'Sinks centered on their bays', ok: Math.abs(stile + bayOpen / 2 - sinkFromCase) < 0.01, detail: `Bay openings ${fmt(bayOpen)}" wide, so each trap sits mid-bay behind its doors` },
    { label: 'Movento depth', ok: intD >= slideLen + 0.5, detail: `${fmt(intD)}" inside the inset back; an 18" Movento needs about 18 1/2"` },
    { label: 'Drawer opening', ok: ctrOpen >= 12 && openH >= 8, detail: `${fmt(ctrOpen)}" x ${fmt(openH)}" opening for the center drawer` },
    { label: 'Vessel rim height', ok: rim >= 32 && rim <= 37, detail: `Slab top at ${fmt(counter)}", rims at about ${fmt(rim)}" off the floor` },
    { label: 'Slab depth', ok: backStrip === 0, detail: backStrip === 0 ? `The narrowest point covers the ${fmt(slabDepthNeeded)}" needed` : `Glue a ${fmt(backStrip)}" back strip of matching stock to reach ${fmt(slabDepthNeeded)}"` },
    { label: 'Wall anchoring', ok: studs >= 4, detail: `${studs} studs at 16" on center behind the case, ${studs * 4} structural screws through solid stock only` },
  ]

  return {
    parts,
    hardware,
    laborHours: 34, // case, face frame, inset fitting, drawer, slab scribe and attach, hang
    elevation,
    overall: { width: p.alcove, height: rim, depth: caseD },
    notes: [
      `Case ${fmt(caseW)}" wide, centered with ${fmt(endGap)}" open at each wall under the slab, bottom ${fmt(p.floorClear)}" off the floor.`,
      `Locate the uprights from the face frame: their drawer-side faces land at ${fmt(up1 + t)}" and ${fmt(up2)}" from the case's left end, so the Movento slides mount without spacers.`,
      'Every structural screw passes through the case cleat (top row) or the spacer rail (bottom row), never across the empty cleat cavity.',
      `Drawer box about ${fmt(boxW)}" wide outside; confirm against Blum's Movento drawer formula before cutting.`,
      'Slab is the customer\'s, scribed wall to wall on cleats and fastened through the subtop with slotted screws.',
    ],
    checks,
    extras: p.slabCost > 0 ? [{ label: 'Live-edge slab', detail: `${fmt(p.alcove)}" scribed length`, amount: p.slabCost }] : [],
    marks: [
      { x: p.sinkFromWall, label: `${fmt(p.sinkFromWall)}"` },
      { x: p.alcove - p.sinkFromWall, label: `${fmt(p.sinkFromWall)}"` },
    ],
  }
}

function fmt(n: number) {
  const v = r32(n)
  const whole = Math.floor(v)
  let num = Math.round((v - whole) * 32)
  if (num === 0) return `${whole}`
  let den = 32
  while (num % 2 === 0) {
    num /= 2
    den /= 2
  }
  return whole ? `${whole} ${num}/${den}` : `${num}/${den}`
}

const ADAM_CANARY = {
  alcove: 84.4375,
  caseWidth: 72,
  sinkFromWall: 18,
  caseDepth: 21.75,
  lowerClear: 10,
  upperClear: 5.5,
  floorClear: 11.75,
  slabThickness: 1,
  slabNarrowest: 17,
  vesselWidth: 16,
  vesselHeight: 5,
  slabCost: 0,
}

export const FLOATING_DOUBLE_VANITY: Template = {
  id: 'floating-double',
  name: 'Floating double vanity',
  audience: 'both',
  blurb: 'Wall-hung, two vessel sinks in an alcove, face frame with inset doors and a center drawer, slab top.',
  usesBackOption: false,
  presets: [{ name: "Adam's canary vanity", params: ADAM_CANARY }],
  params: [
    { key: 'alcove', label: 'Alcove, wall to wall', unit: 'in', min: 48, max: 120, step: 0.0625, default: ADAM_CANARY.alcove },
    { key: 'caseWidth', label: 'Case width', unit: 'in', min: 40, max: 108, step: 0.25, default: ADAM_CANARY.caseWidth },
    { key: 'sinkFromWall', label: 'Sink center from wall', unit: 'in', min: 12, max: 40, step: 0.0625, default: ADAM_CANARY.sinkFromWall },
    { key: 'caseDepth', label: 'Case depth', unit: 'in', min: 18, max: 24, step: 0.25, default: ADAM_CANARY.caseDepth },
    { key: 'lowerClear', label: 'Door and drawer zone', unit: 'in', min: 7, max: 16, step: 0.25, default: ADAM_CANARY.lowerClear },
    { key: 'upperClear', label: 'Open shelf height', unit: 'in', min: 0, max: 10, step: 0.25, default: ADAM_CANARY.upperClear },
    { key: 'floorClear', label: 'Floor to case bottom', unit: 'in', min: 4, max: 18, step: 0.25, default: ADAM_CANARY.floorClear },
    { key: 'slabThickness', label: 'Slab thickness', unit: 'in', min: 0.75, max: 3, step: 0.0625, default: ADAM_CANARY.slabThickness },
    { key: 'slabNarrowest', label: 'Slab at its narrowest', unit: 'in', min: 12, max: 30, step: 0.25, default: ADAM_CANARY.slabNarrowest },
    { key: 'vesselWidth', label: 'Vessel width', unit: 'in', min: 10, max: 24, step: 0.25, default: ADAM_CANARY.vesselWidth },
    { key: 'vesselHeight', label: 'Vessel height', unit: 'in', min: 3, max: 8, step: 0.25, default: ADAM_CANARY.vesselHeight },
    { key: 'slabCost', label: 'Slab cost', unit: 'usd', min: 0, max: 5000, step: 25, default: ADAM_CANARY.slabCost, help: 'Leave at 0 when the customer supplies the slab' },
  ],
  build,
}
