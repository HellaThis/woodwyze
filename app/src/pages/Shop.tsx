import { useState } from 'react'
import { Link } from 'react-router-dom'
import { templateById, usd } from '../engine'
import { useProjects, useQuotes } from '../lib/store'
import type { QuoteStatus, SavedQuote } from '../lib/store'

const STATUS: { id: QuoteStatus; label: string }[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'sent', label: 'Sent' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
]

const statusClass: Record<QuoteStatus, string> = {
  draft: 'bg-mist text-graphite',
  sent: 'bg-birch/60 text-graphite',
  won: 'bg-leaf text-white',
  lost: 'bg-signal/10 text-signal',
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t-2 border-forest pt-3">
      <p className="display num text-3xl text-forest">{value}</p>
      <p className="text-sm text-graphite/65">{label}</p>
    </div>
  )
}

function Board({ quotes, onMove }: { quotes: SavedQuote[]; onMove: (id: string, s: QuoteStatus) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {STATUS.map((s) => {
        const list = quotes.filter((q) => q.status === s.id)
        return (
          <section key={s.id} className="rounded-lg bg-mist/60 p-3">
            <h3 className="mb-2 flex justify-between text-sm font-semibold">
              <span>{s.label}</span>
              <span className="num text-graphite/60">{list.length}</span>
            </h3>
            <ul className="space-y-2">
              {list.map((q) => (
                <li key={q.id} className="panel p-3">
                  <p className="font-semibold">{q.jobName}</p>
                  <p className="text-sm text-graphite/65">
                    #{q.number} · {q.customer}
                  </p>
                  <p className="num mt-1 font-semibold text-forest">{usd(q.total)}</p>
                  <label className="mt-2 block">
                    <span className="sr-only">Move quote {q.number}</span>
                    <select className="field py-1 text-sm" value={q.status} onChange={(e) => onMove(q.id, e.target.value as QuoteStatus)}>
                      {STATUS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </li>
              ))}
              {list.length === 0 && <li className="px-1 text-sm text-graphite/50">None</li>}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export default function Shop() {
  const { quotes, setStatus, remove } = useQuotes()
  const { projects, remove: removeProject } = useProjects()
  const [view, setView] = useState<'list' | 'board' | 'projects'>('list')

  const sent = quotes.filter((q) => q.status !== 'draft')
  const won = quotes.filter((q) => q.status === 'won')
  const resolved = quotes.filter((q) => q.status === 'won' || q.status === 'lost')
  const pipeline = quotes.filter((q) => q.status === 'sent').reduce((a, q) => a + q.total, 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-forest">My shop</h1>
          <p className="text-graphite/70">Every quote you save, where it stands, and the projects you've planned.</p>
        </div>
        <Link to="/quote" className="btn-primary">
          New quote
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
        <Stat label="Quotes sent" value={String(sent.length)} />
        <Stat label="Waiting on the customer" value={usd(pipeline)} />
        <Stat label="Won" value={usd(won.reduce((a, q) => a + q.total, 0))} />
        <Stat label="Win rate" value={resolved.length ? `${Math.round((won.length / resolved.length) * 100)}%` : 'No results yet'} />
      </div>

      <div className="mt-10 flex gap-2 border-b border-rule" role="tablist">
        {(
          [
            ['list', 'Quotes'],
            ['board', 'Job board'],
            ['projects', `Planned builds (${projects.length})`],
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

      <div className="mt-6">
        {view !== 'projects' && quotes.length === 0 && (
          <div className="panel p-8 text-center">
            <p className="text-lg font-semibold">No quotes yet</p>
            <p className="mt-1 text-graphite/70">Price your next job from its dimensions and save it here to track it.</p>
            <Link to="/quote" className="btn-primary mt-4">
              Quote a job
            </Link>
          </div>
        )}

        {view === 'list' && quotes.length > 0 && (
          <div className="panel overflow-x-auto">
            <table className="table-plain w-full min-w-[640px]">
              <thead>
                <tr>
                  <th>Quote</th>
                  <th>Customer</th>
                  <th>Job</th>
                  <th className="text-right">Total</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id}>
                    <td>#{q.number}</td>
                    <td>{q.customer}</td>
                    <td>
                      {q.jobName}
                      <span className="block text-sm text-graphite/55">{templateById(q.templateId).name}</span>
                    </td>
                    <td className="text-right font-semibold">{usd(q.total)}</td>
                    <td>
                      <label>
                        <span className="sr-only">Status of quote {q.number}</span>
                        <select
                          className={`rounded-md border-0 px-2 py-1 text-sm font-semibold ${statusClass[q.status]}`}
                          value={q.status}
                          onChange={(e) => setStatus(q.id, e.target.value as QuoteStatus)}
                        >
                          {STATUS.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </td>
                    <td className="whitespace-nowrap text-right">
                      <Link className="text-sm font-semibold text-leaf underline" to={`/quote?q=${q.id}`}>
                        Open
                      </Link>
                      <button className="ml-3 text-sm text-graphite/55 hover:text-signal" onClick={() => remove(q.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === 'board' && quotes.length > 0 && <Board quotes={quotes} onMove={setStatus} />}

        {view === 'projects' &&
          (projects.length === 0 ? (
            <div className="panel p-8 text-center">
              <p className="text-lg font-semibold">No planned builds yet</p>
              <p className="mt-1 text-graphite/70">Plan a bookcase or a vanity and save it to see it here.</p>
              <Link to="/plan" className="btn-primary mt-4">
                Plan a build
              </Link>
            </div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-3">
              {projects.map((p) => (
                <li key={p.id} className="panel p-4">
                  <p className="font-semibold">{p.name}</p>
                  <p className="num text-sm text-graphite/65">
                    {templateById(p.templateId).name}, {p.params.width}" wide
                  </p>
                  <div className="mt-3 flex gap-3 text-sm">
                    <Link className="font-semibold text-leaf underline" to={`/plan?p=${p.id}`}>
                      Open
                    </Link>
                    <button className="text-graphite/55 hover:text-signal" onClick={() => removeProject(p.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </div>
  )
}
