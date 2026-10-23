import type { Material, MaterialId, PriceSettings } from './types'

// Prices are editable sample defaults, not quotes from any supplier.
export const MATERIALS: Record<MaterialId, Material> = {
  ply34: { id: 'ply34', kind: 'sheet', name: '3/4" maple plywood', thickness: 0.75, sheetLength: 96, sheetWidth: 48, pricePerSheet: 98 },
  mdf34: { id: 'mdf34', kind: 'sheet', name: '3/4" MDF (paint grade)', thickness: 0.75, sheetLength: 96, sheetWidth: 48, pricePerSheet: 52 },
  ply12: { id: 'ply12', kind: 'sheet', name: '1/2" Baltic birch', thickness: 0.5, sheetLength: 60, sheetWidth: 60, pricePerSheet: 74 },
  ply14: { id: 'ply14', kind: 'sheet', name: '1/4" maple plywood', thickness: 0.25, sheetLength: 96, sheetWidth: 48, pricePerSheet: 46 },
  maple44: { id: 'maple44', kind: 'lumber', name: '4/4 hard maple', thickness: 0.75, sheetLength: 0, sheetWidth: 0, pricePerSheet: 0, roughThickness: 1, pricePerBF: 7.5 },
  canary44: { id: 'canary44', kind: 'lumber', name: '4/4 canarywood', thickness: 0.75, sheetLength: 0, sheetWidth: 0, pricePerSheet: 0, roughThickness: 1, pricePerBF: 14 },
}

export const DEFAULT_PRICES: PriceSettings = {
  shopRate: 85,
  markupPct: 25,
  edgeBandPerFoot: 0.35,
  materials: MATERIALS,
}

export const KERF = 0.125

/** Extra lumber bought for defects, snipe and milling: 30%. */
export const LUMBER_WASTE = 1.3
