import { LUMBER_WASTE } from './materials'
import type { BuildResult, Costing, NestResult, PriceSettings, QuoteLine } from './types'

const money = (n: number) => Math.round(n * 100) / 100

export function priceJob(build: BuildResult, nest: NestResult, s: PriceSettings): Costing {
  const lines: QuoteLine[] = []
  const sheetCount: Record<string, number> = {}
  for (const sh of nest.sheets) sheetCount[sh.material] = (sheetCount[sh.material] ?? 0) + 1

  let materialCost = 0
  for (const [id, count] of Object.entries(sheetCount)) {
    const m = s.materials[id as keyof typeof s.materials]
    const amt = count * m.pricePerSheet
    materialCost += amt
    lines.push({ label: m.name, detail: `${count} sheet${count === 1 ? '' : 's'} at $${m.pricePerSheet}`, amount: money(amt) })
  }

  // Solid lumber: finished parts at rough thickness, plus waste, rounded up per species.
  const boardFeet: Record<string, number> = {}
  for (const p of build.parts) {
    const m = s.materials[p.material]
    if (m.kind !== 'lumber') continue
    boardFeet[m.id] = (boardFeet[m.id] ?? 0) + (p.qty * p.length * p.width * (m.roughThickness ?? 1)) / 144
  }
  for (const [id, raw] of Object.entries(boardFeet)) {
    const m = s.materials[id as keyof typeof s.materials]
    const bf = Math.ceil(raw * LUMBER_WASTE)
    boardFeet[id] = bf
    const amt = bf * (m.pricePerBF ?? 0)
    materialCost += amt
    lines.push({ label: m.name, detail: `${bf} bd ft at $${m.pricePerBF?.toFixed(2)}`, amount: money(amt) })
  }

  for (const x of build.extras ?? []) {
    materialCost += x.amount
    lines.push({ label: x.label, detail: x.detail, amount: money(x.amount) })
  }

  const bandInches = build.parts.reduce((a, p) => a + p.edgeBand * p.qty, 0)
  // 10% extra for trimming and waste.
  const bandFeet = Math.ceil((bandInches / 12) * 1.1)
  if (bandFeet > 0) {
    const amt = bandFeet * s.edgeBandPerFoot
    materialCost += amt
    lines.push({ label: 'Edge banding', detail: `${bandFeet} ft at $${s.edgeBandPerFoot.toFixed(2)}`, amount: money(amt) })
  }

  let hardwareCost = 0
  for (const h of build.hardware) {
    const amt = h.qty * h.unitPrice
    hardwareCost += amt
    lines.push({ label: h.name, detail: `${h.qty} at $${h.unitPrice.toFixed(2)}`, amount: money(amt) })
  }

  const laborCost = build.laborHours * s.shopRate
  lines.push({ label: 'Shop labor', detail: `${build.laborHours.toFixed(1)} hr at $${s.shopRate}/hr`, amount: money(laborCost) })

  const subtotal = materialCost + hardwareCost + laborCost
  const markup = (materialCost + hardwareCost) * (s.markupPct / 100)
  return {
    lines,
    materialCost: money(materialCost),
    hardwareCost: money(hardwareCost),
    laborCost: money(laborCost),
    subtotal: money(subtotal),
    markup: money(markup),
    total: money(subtotal + markup),
    sheetCount,
    boardFeet,
  }
}
