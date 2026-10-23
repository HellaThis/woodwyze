import { DEFAULT_PRICES } from './materials'
import { nestParts } from './nest'
import { priceJob } from './price'
import { clampParams, templateById } from './templates'
import type { BuildOptions, Params, PriceSettings } from './types'

export * from './types'
export * from './materials'
export * from './templates'
export * from './nest'
export * from './price'
export * from './dxf'
export * from './format'

/** Template + dimensions in, everything a quote or a build plan needs out. */
export function runJob(
  templateId: string,
  params: Params,
  options: BuildOptions = { carcass: 'ply34', back: 'ply14' },
  prices: PriceSettings = DEFAULT_PRICES,
) {
  const template = templateById(templateId)
  const p = clampParams(template, params)
  const build = template.build(p, options)
  const nest = nestParts(build.parts, prices.materials)
  const costing = priceJob(build, nest, prices)
  return { template, params: p, build, nest, costing }
}

export type JobResult = ReturnType<typeof runJob>
