// Invented sample data for the prototype. None of these are real businesses.

export interface Supplier {
  id: string
  name: string
  kind: 'Hardwood dealer' | 'Sheet goods yard' | 'Tool and hardware store'
  city: string
  distance: number
  tier: 'Listed' | 'Partner' | 'Hosted'
  blurb: string
  carries: string[]
}

export const SUPPLIERS: Supplier[] = [
  {
    id: 'oak-and-iron',
    name: 'Oak & Iron Lumber (sample)',
    kind: 'Hardwood dealer',
    city: 'Benicia',
    distance: 6,
    tier: 'Partner',
    blurb: 'Domestic hardwoods by the board foot, slabs, and 4/4 to 12/4 walnut and white oak.',
    carries: ['Walnut', 'White oak', 'Hard maple', 'Live-edge slabs'],
  },
  {
    id: 'bayline-panel',
    name: 'Bayline Panel Supply (sample)',
    kind: 'Sheet goods yard',
    city: 'Fairfield',
    distance: 14,
    tier: 'Hosted',
    blurb: 'Prefinished maple, Baltic birch, MDF and edge banding, cut to size on request.',
    carries: ['Maple plywood', 'Baltic birch', 'MDF', 'Edge banding'],
  },
  {
    id: 'ridgeway-tool',
    name: 'Ridgeway Tool & Hardware (sample)',
    kind: 'Tool and hardware store',
    city: 'Napa',
    distance: 17,
    tier: 'Listed',
    blurb: 'Hinges, slides, pulls and finishing supplies, with same-week special orders.',
    carries: ['Hinges', 'Drawer slides', 'Pulls', 'Finishes'],
  },
  {
    id: 'carquinez-hardwoods',
    name: 'Carquinez Hardwoods (sample)',
    kind: 'Hardwood dealer',
    city: 'Martinez',
    distance: 11,
    tier: 'Listed',
    blurb: 'Reclaimed and urban-salvaged lumber, milled to order.',
    carries: ['Reclaimed redwood', 'Urban walnut', 'Cypress'],
  },
]

export interface Listing {
  supplierId: string
  name: string
  unit: string
  price: number
  proPrice: number
  stock: 'In stock' | 'Low' | 'Special order'
}

export const LISTINGS: Listing[] = [
  { supplierId: 'bayline-panel', name: '3/4" prefinished maple plywood, 4x8', unit: 'sheet', price: 104, proPrice: 94, stock: 'In stock' },
  { supplierId: 'bayline-panel', name: '1/4" maple plywood, 4x8', unit: 'sheet', price: 49, proPrice: 44, stock: 'In stock' },
  { supplierId: 'bayline-panel', name: '1/2" Baltic birch, 5x5', unit: 'sheet', price: 78, proPrice: 71, stock: 'Low' },
  { supplierId: 'bayline-panel', name: 'Maple edge banding, 13/16", 250 ft', unit: 'roll', price: 62, proPrice: 55, stock: 'In stock' },
  { supplierId: 'oak-and-iron', name: '8/4 black walnut, FAS', unit: 'board ft', price: 16.5, proPrice: 14.75, stock: 'In stock' },
  { supplierId: 'oak-and-iron', name: '4/4 white oak, rift sawn', unit: 'board ft', price: 13.25, proPrice: 11.9, stock: 'Low' },
  { supplierId: 'ridgeway-tool', name: 'Soft-close concealed hinge', unit: 'each', price: 6.25, proPrice: 5.4, stock: 'In stock' },
  { supplierId: 'ridgeway-tool', name: '21" undermount slides, pair', unit: 'pair', price: 31, proPrice: 27.5, stock: 'Special order' },
]

export interface QuoteRequest {
  id: string
  shop: string
  items: string
  neededBy: string
  status: 'New' | 'Answered' | 'Ordered'
}

export const QUOTE_REQUESTS: QuoteRequest[] = [
  { id: 'rq-1', shop: 'Mare Island Millwork (sample)', items: '9 sheets 3/4" maple ply, 2 sheets 1/4" maple, 1 roll edge banding', neededBy: 'Nov 4', status: 'New' },
  { id: 'rq-2', shop: 'Glen Cove Cabinet Co. (sample)', items: '4 sheets 3/4" maple ply, 1 sheet 1/2" Baltic birch', neededBy: 'Nov 6', status: 'Answered' },
  { id: 'rq-3', shop: 'Hiddenbrooke Built-ins (sample)', items: '14 sheets 3/4" MDF, 5 sheets 1/4" maple', neededBy: 'Nov 12', status: 'Ordered' },
]

export interface OutreachShop {
  id: string
  name: string
  city: string
  category: string
  fit: number
  source: 'C-6 license list' | 'OpenStreetMap'
  email: string | null
  stage: 'Not contacted' | 'Survey sent' | 'Answered' | 'Beta' | 'Call booked' | 'Unsubscribed'
}

export const OUTREACH_SHOPS: OutreachShop[] = [
  { id: 'demo-1042', name: 'Mare Island Millwork (sample)', city: 'Vallejo', category: 'Millwork', fit: 92, source: 'C-6 license list', email: 'hello@example.com', stage: 'Survey sent' },
  { id: 'demo-1043', name: 'Glen Cove Cabinet Co. (sample)', city: 'Vallejo', category: 'Cabinet maker', fit: 90, source: 'C-6 license list', email: 'office@example.com', stage: 'Answered' },
  { id: 'demo-1044', name: 'Hiddenbrooke Built-ins (sample)', city: 'Vallejo', category: 'Finish carpentry', fit: 78, source: 'C-6 license list', email: 'info@example.com', stage: 'Beta' },
  { id: 'demo-1045', name: 'Sonoma Joinery (sample)', city: 'Sonoma', category: 'Furniture maker', fit: 85, source: 'OpenStreetMap', email: 'studio@example.com', stage: 'Call booked' },
  { id: 'demo-1046', name: 'Delta Woodturners (sample)', city: 'Antioch', category: 'Woodturner', fit: 70, source: 'OpenStreetMap', email: null, stage: 'Not contacted' },
  { id: 'demo-1047', name: 'Suisun Custom Casework (sample)', city: 'Suisun City', category: 'Cabinet maker', fit: 88, source: 'C-6 license list', email: 'shop@example.com', stage: 'Not contacted' },
  { id: 'demo-1048', name: 'Napa Valley Stair & Rail (sample)', city: 'Napa', category: 'Stair builder', fit: 66, source: 'C-6 license list', email: 'quotes@example.com', stage: 'Unsubscribed' },
]

export const SURVEY_EMAIL = {
  subject: 'How do you quote custom jobs?',
  body: (name: string) => `Hi ${name},

I'm Adam, a woodworker and software engineer in Vallejo. I'm building a tool for small custom shops that turns a few dimensions into a priced quote, a cut list and a material order.

Before I build more of it, I'd like to know how your shop handles quoting today. One click answers the first question:

How long does a typical custom quote take you?
[Under 30 minutes] · [30 minutes to 2 hours] · [Over 2 hours] · [I don't do custom work]

That click opens three more quick questions, about 2 minutes. Shops that answer get first access and founding-shop pricing: 50% off the first year.

If you'd rather not hear from me, just reply "no thanks."

Adam Goldband
WoodWyze · {mailing address} · {unsubscribe link}`,
}

export const QUOTE_TIME_OPTIONS = [
  { id: 'under30', label: 'Under 30 minutes' },
  { id: '30to120', label: '30 minutes to 2 hours' },
  { id: 'over2h', label: 'Over 2 hours' },
  { id: 'nocustom', label: "I don't do custom work" },
]
