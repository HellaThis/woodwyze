import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  DEFAULT_PRICES,
  MATERIALS,
  TEMPLATES,
  defaultParams,
  fraction,
  inch,
  runJob,
  sheetsToDxf,
  templateById,
  usd,
} from '../engine'
import type { BuildOptions, MaterialId, Params, PriceSettings } from '../engine'
import { useProfile, useProjects, useQuotes } from '../lib/store'
import { Elevation, SheetDrawing } from './Drawings'
import { SUPPLIERS } from '../data/sample'

type Mode = 'shop' | 'home'
type Tab = 'quote' | 'cuts' | 'sheets' | 'shopping'

const FREE_QUOTES_PER_MONTH = 5
// The hosted demo can't download files or open the print dialog, so those buttons only show in the full app.
const DEMO = import.meta.env.VITE_DEMO === '1'

function download(name: string, text: string, type = 'application/dxf') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export default function Workspace({ mode }: { mode: Mode }) {
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const [profile] = useProfile()
  const { quotes, save: saveQuote } = useQuotes()
  const { projects, save: saveProject } = useProjects()

  const visible = TEMPLATES.filter((t) => t.audience === 'both' || t.audience === mode)
  // Open a saved quote (?q=) or project (?p=), or preload a template (?t=), as the outreach emails do.
  const loaded =
    mode === 'shop' ? quotes.find((q) => q.id === search.get('q')) : projects.find((p) => p.id === search.get('p'))
  const startId = loaded?.templateId ?? (search.get('t') && TEMPLATES.some((t) => t.id === search.get('t')) ? search.get('t')! : visible[0].id)
  const [editingId] = useState(loaded?.id)
  const [templateId, setTemplateId] = useState(startId)
  const template = templateById(templateId)
  const [params, setParams] = useState<Params>(() => loaded?.params ?? defaultParams(templateById(startId)))
  const [options, setOptions] = useState<BuildOptions>(loaded?.options ?? { carcass: 'ply34', back: 'ply14' })
  const [tab, setTab] = useState<Tab>(mode === 'shop' ? 'quote' : 'cuts')
  const [customer, setCustomer] = useState(loaded && 'customer' in loaded ? loaded.customer : '')
  const [jobName, setJobName] = useState(loaded ? ('jobName' in loaded ? loaded.jobName : loaded.name) : '')
  const [savedMsg, setSavedMsg] = useState('')

  const prices: PriceSettings = useMemo(() => {
    const materials = { ...DEFAULT_PRICES.materials }
    for (const [id, price] of Object.entries(profile.prices ?? {})) {
      const m = materials[id as MaterialId]
      if (m) materials[id as MaterialId] = m.kind === 'lumber' ? { ...m, pricePerBF: price } : { ...m, pricePerSheet: price }
    }
    return { ...DEFAULT_PRICES, shopRate: profile.shopRate, markupPct: profile.markupPct, materials }
  }, [profile])

  const job = useMemo(() => runJob(templateId, params, options, prices), [templateId, params, options, prices])
  const { build, nest, costing } = job

  const monthKey = new Date().toISOString().slice(0, 7)
  const usedThisMonth = quotes.filter((q) => q.createdAt.startsWith(monthKey)).length

  const pickTemplate = (id: string) => {
    setTemplateId(id)
    setParams(defaultParams(templateById(id)))
    setSavedMsg('')
  }

  const setParam = (key: string, v: number) => setParams((p) => ({ ...p, [key]: v }))

  const onSave = () => {
    if (mode === 'shop') {
      const q = saveQuote({
        id: editingId,
        customer: customer.trim() || 'Customer',
        jobName: jobName.trim() || template.name,
        templateId,
        params: job.params,
        options,
        total: costing.total,
      })
      setSavedMsg(`Saved as quote #${q.number}.`)
    } else {
      saveProject({ id: editingId, name: jobName.trim() || template.name, templateId, params: job.params, options })
      setSavedMsg('Project saved to My shop.')
    }
  }

  const pieceCount = build.parts.reduce((a, p) => a + p.qty, 0)
  const sheetTotal = nest.sheets.length
  const tabs: { id: Tab; label: string }[] =
    mode === 'shop'
      ? [
          { id: 'quote', label: 'Quote' },
          { id: 'cuts', label: 'Cut list' },
          { id: 'sheets', label: `Sheet layouts (${sheetTotal})` },
        ]
      : [
          { id: 'cuts', label: 'Cut list' },
          { id: 'sheets', label: `Sheet layouts (${sheetTotal})` },
          { id: 'shopping', label: 'Shopping list' },
        ]

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[320px_1fr]">
      {/* ── Inputs ─────────────────────────────────────────── */}
      <aside className="no-print space-y-6 lg:sticky lg:top-4 lg:self-start">
        <div>
          <h1 className="display text-3xl text-forest">{mode === 'shop' ? 'Quote a job' : 'Plan a build'}</h1>
          <p className="mt-1 text-[15px] text-graphite/70">
            {mode === 'shop'
              ? 'Enter the dimensions. The price, cut list and sheet layouts update as you type.'
              : 'Pick a project, set your sizes, and get the cut list and what to buy.'}
          </p>
        </div>

        <fieldset>
          <legend className="label">Project</legend>
          <div className="space-y-1.5">
            {visible.map((t) => (
              <label
                key={t.id}
                className={`flex cursor-pointer gap-3 rounded-md border px-3 py-2.5 ${
                  t.id === templateId ? 'border-leaf bg-white' : 'border-rule bg-white/60 hover:border-leaf/60'
                }`}
              >
                <input type="radio" name="template" className="mt-1 accent-forest" checked={t.id === templateId} onChange={() => pickTemplate(t.id)} />
                <span>
                  <span className="block text-[15px] font-semibold">{t.name}</span>
                  <span className="block text-sm text-graphite/65">{t.blurb}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {template.presets && (
          <div>
            <span className="label">Start from</span>
            <div className="flex flex-wrap gap-2">
              {template.presets.map((pr) => (
                <button key={pr.name} type="button" className="btn-quiet py-1.5 text-sm" onClick={() => setParams({ ...pr.params })}>
                  {pr.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="label col-span-2">Sizes</legend>
          {template.params.map((d) => (
            <label key={d.key} className="block">
              <span className="mb-1 block text-sm text-graphite/75">
                {d.label}
                {d.unit === 'in' ? ' (in)' : d.unit === 'usd' ? ' ($)' : ''}
              </span>
              <input
                type="number"
                className="field"
                min={d.min}
                max={d.max}
                step={d.step}
                value={params[d.key] ?? d.default}
                onChange={(e) => setParam(d.key, Number(e.target.value))}
                aria-describedby={d.help ? `help-${d.key}` : undefined}
              />
              {d.help && (
                <span id={`help-${d.key}`} className="mt-1 block text-xs text-graphite/60">
                  {d.help}
                </span>
              )}
            </label>
          ))}
          {template.params.some((d) => params[d.key] !== job.params[d.key]) && (
            <p className="col-span-2 text-sm text-signal">Some sizes are outside what this template supports and were limited to its range.</p>
          )}
        </fieldset>

        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="label col-span-2">Materials</legend>
          <label className="block">
            <span className="mb-1 block text-sm text-graphite/75">Case and doors</span>
            <select className="field" value={options.carcass} onChange={(e) => setOptions({ ...options, carcass: e.target.value as MaterialId })}>
              <option value="ply34">{MATERIALS.ply34.name}</option>
              <option value="mdf34">{MATERIALS.mdf34.name}</option>
            </select>
          </label>
          {template.usesBackOption !== false && (
          <label className="block">
            <span className="mb-1 block text-sm text-graphite/75">Back</span>
            <select className="field" value={options.back} onChange={(e) => setOptions({ ...options, back: e.target.value as MaterialId })}>
              <option value="ply14">{MATERIALS.ply14.name}</option>
              <option value="ply12">{MATERIALS.ply12.name}</option>
            </select>
          </label>
          )}
        </fieldset>
      </aside>

      {/* ── Results ────────────────────────────────────────── */}
      <section className="min-w-0 space-y-6">
        <div className="panel grid gap-6 p-5 md:grid-cols-[1fr_260px]">
          <div className="flex min-h-[220px] items-end justify-center rounded-md bg-mist/50 p-4">
            <Elevation rects={build.elevation} width={build.overall.width} height={build.overall.height} marks={build.marks} className="max-h-[320px] w-full" />
          </div>
          <div className="flex flex-col justify-between gap-4">
            <div>
              <p className="text-sm text-graphite/65">{template.name}</p>
              <p className="num mt-0.5 text-[15px]">
                {inch(build.overall.width)} W x {inch(build.overall.height)} H x {inch(build.overall.depth)} D
              </p>
              {mode === 'shop' ? (
                <p className="display num mt-3 text-[44px] text-forest">{usd(Math.round(costing.total))}</p>
              ) : (
                <p className="display num mt-3 text-[44px] text-forest">{usd(Math.round(costing.materialCost + costing.hardwareCost))}</p>
              )}
              <p className="text-sm text-graphite/65">{mode === 'shop' ? 'Quote total' : 'Estimated materials and hardware'}</p>
            </div>
            <dl className="num grid grid-cols-3 gap-2 border-t border-rule pt-3 text-center">
              <div>
                <dt className="text-xs text-graphite/60">Parts</dt>
                <dd className="text-lg font-semibold">{pieceCount}</dd>
              </div>
              <div>
                <dt className="text-xs text-graphite/60">Sheets</dt>
                <dd className="text-lg font-semibold">{sheetTotal}</dd>
              </div>
              <div>
                <dt className="text-xs text-graphite/60">{mode === 'shop' ? 'Shop hours' : 'Build hours'}</dt>
                <dd className="text-lg font-semibold">{build.laborHours.toFixed(1)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {build.checks && (
          <section className="panel p-5" aria-labelledby="checks-heading">
            <h2 id="checks-heading" className="flex items-baseline justify-between gap-3 font-semibold">
              <span>Design checks</span>
              <span className={`num text-sm ${build.checks.every((c) => c.ok) ? 'text-leaf' : 'text-signal'}`}>
                {build.checks.filter((c) => c.ok).length} of {build.checks.length} pass
              </span>
            </h2>
            <ul className="mt-3 grid gap-x-6 gap-y-2 md:grid-cols-2">
              {build.checks.map((c) => (
                <li key={c.label} className="flex gap-2.5 text-[15px]">
                  <span
                    className={`mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${c.ok ? 'bg-leaf' : 'bg-signal'}`}
                    aria-label={c.ok ? 'Pass' : 'Needs attention'}
                  >
                    {c.ok ? '✓' : '!'}
                  </span>
                  <span>
                    <span className="font-medium">{c.label}.</span> <span className="text-graphite/70">{c.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {nest.oversize.length > 0 && (
          <p className="rounded-md border border-signal/40 bg-signal/5 px-4 py-3 text-[15px] text-signal">
            {nest.oversize.map((p) => `${p.group ? p.group + ' ' : ''}${p.name.toLowerCase()} (${fraction(p.length)} x ${fraction(p.width)})`).join(', ')}{' '}
            won't fit on one sheet. Add a box to split the run, or plan a joint.
          </p>
        )}

        <div className="no-print flex flex-wrap items-center gap-2 border-b border-rule" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-3 py-2 text-[15px] font-semibold ${
                tab === t.id ? 'border-forest text-forest' : 'border-transparent text-graphite/60 hover:text-graphite'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'quote' && (
          <div className="panel p-5">
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="label">Customer</span>
                <input className="field" placeholder="Jordan Park" value={customer} onChange={(e) => setCustomer(e.target.value)} />
              </label>
              <label className="block">
                <span className="label">Job name</span>
                <input className="field" placeholder="Laundry room bases" value={jobName} onChange={(e) => setJobName(e.target.value)} />
              </label>
            </div>
            <table className="table-plain w-full">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="hidden sm:table-cell">Detail</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {costing.lines.map((l) => (
                  <tr key={l.label}>
                    <td>{l.label}</td>
                    <td className="hidden text-graphite/65 sm:table-cell">{l.detail}</td>
                    <td className="text-right">{usd(l.amount)}</td>
                  </tr>
                ))}
                <tr>
                  <td>Materials and hardware markup</td>
                  <td className="hidden text-graphite/65 sm:table-cell">{prices.markupPct}%</td>
                  <td className="text-right">{usd(costing.markup)}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Total</td>
                  <td className="hidden sm:table-cell" />
                  <td className="text-right text-lg font-semibold">{usd(costing.total)}</td>
                </tr>
              </tbody>
            </table>
            <ul className="mt-4 space-y-1 text-sm text-graphite/70">
              {build.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
              <li>
                Rates: ${prices.shopRate}/hr shop rate, {prices.markupPct}% on materials and hardware.{' '}
                <button className="text-leaf underline" onClick={() => navigate('/settings')}>
                  Change rates and sheet prices
                </button>
              </li>
            </ul>
          </div>
        )}

        {tab === 'cuts' && (
          <div className="panel overflow-x-auto">
            <table className="table-plain w-full min-w-[560px]">
              <thead>
                <tr>
                  <th>Part</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Length</th>
                  <th className="text-right">Width</th>
                  <th>Material</th>
                  <th>Grain</th>
                </tr>
              </thead>
              <tbody>
                {build.parts.map((p, i) => (
                  <tr key={i}>
                    <td>
                      {p.group && <span className="text-graphite/55">{p.group} </span>}
                      {p.name}
                    </td>
                    <td className="text-right">{p.qty}</td>
                    <td className="text-right">{inch(p.length)}</td>
                    <td className="text-right">{inch(p.width)}</td>
                    <td className="text-graphite/75">{MATERIALS[p.material].name}</td>
                    <td className="text-graphite/75">{p.grain ? 'Lengthwise' : 'Any'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'sheets' && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {nest.sheets.map((s) => (
                <SheetDrawing key={`${s.material}-${s.index}`} sheet={s} />
              ))}
            </div>
            {Object.keys(costing.boardFeet).length > 0 && (
              <p className="panel px-4 py-3 text-[15px]">
                Solid lumber, bought by the board foot with 30% extra for milling:{' '}
                {Object.entries(costing.boardFeet)
                  .map(([id, bf]) => `${bf} bd ft of ${MATERIALS[id as MaterialId].name}`)
                  .join(', ')}
                .
              </p>
            )}
          </div>
        )}

        {tab === 'shopping' && (
          <div className="grid gap-4 md:grid-cols-[1fr_280px]">
            <div className="panel p-5">
              <table className="table-plain w-full">
                <tbody>
                  {costing.lines
                    .filter((l) => l.label !== 'Shop labor')
                    .map((l) => (
                      <tr key={l.label}>
                        <td>{l.label}</td>
                        <td className="text-graphite/65">{l.detail}</td>
                        <td className="text-right">{usd(l.amount)}</td>
                      </tr>
                    ))}
                  <tr>
                    <td className="font-semibold">Estimated total</td>
                    <td />
                    <td className="text-right font-semibold">{usd(costing.materialCost + costing.hardwareCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="panel p-5">
              <h3 className="font-semibold">Carried nearby</h3>
              <ul className="mt-2 space-y-2 text-[15px]">
                {SUPPLIERS.slice(0, 3).map((s) => (
                  <li key={s.id}>
                    <span className="font-medium">{s.name}</span>
                    <span className="block text-sm text-graphite/65">
                      {s.city}, {s.distance} mi
                    </span>
                  </li>
                ))}
              </ul>
              <button className="btn-quiet mt-4 w-full" onClick={() => navigate('/suppliers')}>
                See suppliers
              </button>
            </div>
          </div>
        )}

        <div className="no-print panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-graphite/70">
            {savedMsg ? (
              <span className="font-medium text-leaf" role="status">
                {savedMsg}
              </span>
            ) : mode === 'shop' ? (
              <span className="num">
                Free plan: {Math.min(usedThisMonth, FREE_QUOTES_PER_MONTH)} of {FREE_QUOTES_PER_MONTH} quotes used this month.
              </span>
            ) : (
              <span>Save it to come back later, or print it for the shop.</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {mode === 'home' && (
              <input className="field w-48" placeholder="Project name" value={jobName} onChange={(e) => setJobName(e.target.value)} aria-label="Project name" />
            )}
            {!DEMO && (
              <>
                <button className="btn-quiet" onClick={() => download(`${template.id}-sheets.dxf`, sheetsToDxf(nest.sheets, prices.materials))}>
                  Download DXF
                </button>
                <button className="btn-quiet" onClick={() => window.print()}>
                  Print
                </button>
              </>
            )}
            <button className="btn-primary" onClick={onSave}>
              {mode === 'shop' ? 'Save quote' : 'Save project'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
