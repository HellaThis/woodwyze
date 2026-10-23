// All dimensions are in inches.

export type MaterialId = 'ply34' | 'mdf34' | 'ply12' | 'ply14' | 'maple44' | 'canary44'

export interface Material {
  id: MaterialId
  name: string
  /** Sheet goods are nested on sheets; lumber is bought by the board foot. */
  kind: 'sheet' | 'lumber'
  /** Finished thickness of the part. */
  thickness: number
  /** Sheet size; length runs with the face grain. Unused for lumber. */
  sheetLength: number
  sheetWidth: number
  pricePerSheet: number
  /** Lumber only: rough thickness bought (4/4 = 1") and price per board foot. */
  roughThickness?: number
  pricePerBF?: number
}

export interface Part {
  /** What the part is, e.g. "Side". */
  name: string
  /** Which box or section it belongs to, e.g. "Box 2". Empty for single-box projects. */
  group: string
  qty: number
  /** Along the grain. */
  length: number
  width: number
  material: MaterialId
  /** True when the part must follow the sheet's face grain (anything visible). */
  grain: boolean
  /** Inches of edge banding per piece. */
  edgeBand: number
}

export interface Hardware {
  name: string
  qty: number
  unitPrice: number
}

export interface ParamDef {
  key: string
  label: string
  unit: 'in' | 'count' | 'usd'
  min: number
  max: number
  step: number
  default: number
  help?: string
}

/** A rectangle in the front-view drawing, in inches from the bottom-left corner. */
export interface ElevationRect {
  x: number
  y: number
  w: number
  h: number
  kind: 'carcass' | 'door' | 'drawer' | 'shelf' | 'toekick' | 'opening' | 'frame' | 'cubby' | 'slab' | 'vessel' | 'wall'
  /** Which edge of a door the pull sits on. */
  pull?: 'left' | 'right'
  /** Wood tone for fronts in a contrasting species. */
  tone?: 'canary'
}

/** A design rule the project passes or fails, shown beside the quote. */
export interface Check {
  label: string
  ok: boolean
  detail: string
}

/** Something bought for the job that isn't cut from sheets or boards. */
export interface ExtraLine {
  label: string
  detail: string
  amount: number
}

export interface BuildResult {
  parts: Part[]
  hardware: Hardware[]
  /** Estimated shop hours to build and finish. */
  laborHours: number
  elevation: ElevationRect[]
  overall: { width: number; height: number; depth: number }
  notes: string[]
  checks?: Check[]
  extras?: ExtraLine[]
  /** Optional dimension labels for the front view (for example sink centers). */
  marks?: { x: number; label: string }[]
}

export interface BuildOptions {
  carcass: MaterialId
  back: MaterialId
}

export type Params = Record<string, number>

export interface Template {
  id: string
  name: string
  /** Who sees it first: pros quoting jobs, home shops planning builds, or both. */
  audience: 'shop' | 'home' | 'both'
  blurb: string
  /** False when the template picks its own back (the floating vanity uses 3/4 ply). */
  usesBackOption?: boolean
  /** Named starting points, e.g. a real customer's project. */
  presets?: { name: string; params: Params }[]
  params: ParamDef[]
  build: (p: Params, o: BuildOptions) => BuildResult
}

export interface Placement {
  name: string
  group: string
  x: number
  y: number
  /** Size as placed on the sheet (x extent, y extent). */
  w: number
  h: number
  rotated: boolean
}

export interface SheetLayout {
  material: MaterialId
  index: number
  placements: Placement[]
  /** Share of the sheet covered by parts, 0 to 1. */
  yield: number
}

export interface NestResult {
  sheets: SheetLayout[]
  /** Parts too big for one sheet; they need a joint or solid stock. */
  oversize: Part[]
}

export interface PriceSettings {
  shopRate: number
  markupPct: number
  edgeBandPerFoot: number
  materials: Record<MaterialId, Material>
}

export interface QuoteLine {
  label: string
  detail: string
  amount: number
}

export interface Costing {
  lines: QuoteLine[]
  materialCost: number
  hardwareCost: number
  laborCost: number
  subtotal: number
  markup: number
  total: number
  sheetCount: Record<string, number>
  boardFeet: Record<string, number>
}
