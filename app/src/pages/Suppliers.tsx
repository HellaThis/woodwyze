import { useState } from 'react'
import { LISTINGS, QUOTE_REQUESTS, SUPPLIERS } from '../data/sample'
import type { Listing, QuoteRequest } from '../data/sample'
import { usd } from '../engine'

function Directory() {
  const [kind, setKind] = useState('All')
  const kinds = ['All', ...new Set(SUPPLIERS.map((s) => s.kind))]
  const list = SUPPLIERS.filter((s) => kind === 'All' || s.kind === kind).sort((a, b) => a.distance - b.distance)
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div>
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by kind">
          {kinds.map((k) => (
            <button
              key={k}
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={`rounded-full border px-3 py-1 text-sm font-medium ${kind === k ? 'border-forest bg-forest text-white' : 'border-rule bg-white'}`}
            >
              {k}
            </button>
          ))}
        </div>
        <ul className="divide-y divide-rule border-y border-rule">
          {list.map((s) => (
            <li key={s.id} className="py-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-semibold">{s.name}</h3>
                <span className="num whitespace-nowrap text-sm text-graphite/60">{s.distance} mi</span>
              </div>
              <p className="text-sm text-graphite/65">
                {s.kind}, {s.city}
              </p>
              <p className="mt-1 text-[15px]">{s.blurb}</p>
              <p className="mt-2 text-sm text-graphite/70">Carries: {s.carries.join(', ')}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-lg font-semibold">In stock nearby</h2>
        <p className="text-sm text-graphite/65">Pro prices show for shops with a WoodWyze shop account.</p>
        <div className="panel mt-3 overflow-x-auto">
          <table className="table-plain w-full min-w-[480px]">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-right">Price</th>
                <th className="text-right">Pro</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {LISTINGS.map((l) => (
                <tr key={l.name}>
                  <td>
                    {l.name}
                    <span className="block text-sm text-graphite/55">{SUPPLIERS.find((s) => s.id === l.supplierId)?.name}</span>
                  </td>
                  <td className="text-right">
                    {usd(l.price)}
                    <span className="block text-xs text-graphite/55">per {l.unit}</span>
                  </td>
                  <td className="text-right font-semibold text-forest">{usd(l.proPrice)}</td>
                  <td className="text-sm">{l.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Portal() {
  const me = SUPPLIERS.find((s) => s.id === 'bayline-panel')!
  const [listings, setListings] = useState<Listing[]>(LISTINGS.filter((l) => l.supplierId === me.id))
  const [requests, setRequests] = useState<QuoteRequest[]>(QUOTE_REQUESTS)
  const [draft, setDraft] = useState({ name: '', unit: 'sheet', price: '', proPrice: '' })
  const [error, setError] = useState('')

  const addListing = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.name.trim() || !Number(draft.price)) {
      setError('Add a name and a price to list an item.')
      return
    }
    setListings([
      ...listings,
      { supplierId: me.id, name: draft.name.trim(), unit: draft.unit, price: Number(draft.price), proPrice: Number(draft.proPrice) || Number(draft.price), stock: 'In stock' },
    ])
    setDraft({ name: '', unit: 'sheet', price: '', proPrice: '' })
    setError('')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-4">
        <div>
          <h2 className="display text-2xl text-forest">{me.name}</h2>
          <p className="text-sm text-graphite/65">
            {me.kind}, {me.city} · {me.tier} plan
          </p>
        </div>
        <p className="text-sm text-graphite/70">This is what a supplier sees after signing in.</p>
      </div>

      <section>
        <h3 className="text-lg font-semibold">Requests from shops</h3>
        <ul className="mt-3 space-y-3">
          {requests.map((r) => (
            <li key={r.id} className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{r.shop}</p>
                <p className="text-[15px]">{r.items}</p>
                <p className="text-sm text-graphite/60">Needed by {r.neededBy}</p>
              </div>
              {r.status === 'New' ? (
                <button className="btn-primary" onClick={() => setRequests(requests.map((x) => (x.id === r.id ? { ...x, status: 'Answered' } : x)))}>
                  Send price and pickup date
                </button>
              ) : (
                <span className={`rounded-md px-2 py-1 text-sm font-semibold ${r.status === 'Ordered' ? 'bg-leaf text-white' : 'bg-mist'}`}>{r.status}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold">Your listings</h3>
        <div className="panel mt-3 overflow-x-auto">
          <table className="table-plain w-full min-w-[520px]">
            <thead>
              <tr>
                <th>Item</th>
                <th>Unit</th>
                <th className="text-right">Price</th>
                <th className="text-right">Pro price</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.name}>
                  <td>{l.name}</td>
                  <td>{l.unit}</td>
                  <td className="text-right">{usd(l.price)}</td>
                  <td className="text-right">{usd(l.proPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={addListing} className="mt-3 grid gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]" noValidate>
          <input className="field" placeholder="3/4 in. white oak plywood, 4x8" aria-label="Item" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <select className="field" aria-label="Unit" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })}>
            <option>sheet</option>
            <option>board ft</option>
            <option>each</option>
            <option>pair</option>
            <option>roll</option>
          </select>
          <input className="field" inputMode="decimal" placeholder="Price" aria-label="Price" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
          <input className="field" inputMode="decimal" placeholder="Pro price" aria-label="Pro price" value={draft.proPrice} onChange={(e) => setDraft({ ...draft, proPrice: e.target.value })} />
          <button className="btn-quiet" type="submit">
            Add listing
          </button>
          {error && <p className="text-sm text-signal sm:col-span-5">{error}</p>}
        </form>
      </section>
    </div>
  )
}

export default function Suppliers() {
  const [view, setView] = useState<'find' | 'portal'>('find')
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="display text-3xl text-forest">Suppliers</h1>
      <p className="max-w-2xl text-graphite/70">Local yards and dealers list what they stock. Shops send material lists straight from a quote and get a price back.</p>
      <div className="mt-6 flex gap-2 border-b border-rule" role="tablist">
        {(
          [
            ['find', 'Find a supplier'],
            ['portal', 'Supplier portal'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={`-mb-px border-b-2 px-3 py-2 text-[15px] font-semibold ${view === id ? 'border-forest text-forest' : 'border-transparent text-graphite/60'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6">{view === 'find' ? <Directory /> : <Portal />}</div>
    </div>
  )
}
