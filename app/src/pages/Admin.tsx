import { useState } from 'react'
import { Link } from 'react-router-dom'
import { OUTREACH_SHOPS, QUOTE_TIME_OPTIONS, SURVEY_EMAIL } from '../data/sample'
import type { OutreachShop } from '../data/sample'
import { useSignups, useSurvey } from '../lib/store'

const STAGES: OutreachShop['stage'][] = ['Not contacted', 'Survey sent', 'Answered', 'Beta', 'Call booked', 'Unsubscribed']

function Tally({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map((r) => r[1]))
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 space-y-1.5">
        {rows.map(([label, n]) => (
          <li key={label} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
            <span>
              <span className="block">{label}</span>
              <span className="mt-0.5 block h-1.5 rounded bg-leaf" style={{ width: `${(n / max) * 100}%`, minWidth: n ? 4 : 0 }} />
            </span>
            <span className="num font-semibold">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Admin() {
  const { answers } = useSurvey()
  const { signups } = useSignups()
  const [preview, setPreview] = useState(OUTREACH_SHOPS[0])
  const count = (key: 'quoteTime' | 'lostMoney' | 'painPoint', options: string[]): [string, number][] =>
    options.map((o) => [o, answers.filter((a) => a[key] === o).length])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="display text-3xl text-forest">Outreach</h1>
      <p className="max-w-2xl text-graphite/70">
        Shops found from the California C-6 license list and OpenStreetMap, their survey status, and what they've told us. Sending is turned off in this prototype.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-5">
        {STAGES.slice(0, 5).map((s) => (
          <div key={s} className="border-t-2 border-forest pt-3">
            <p className="display num text-3xl text-forest">{OUTREACH_SHOPS.filter((x) => x.stage === s).length}</p>
            <p className="text-sm text-graphite/65">{s}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Shops</h2>
        <div className="panel mt-3 overflow-x-auto">
          <table className="table-plain w-full min-w-[720px]">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Kind</th>
                <th className="text-right">Fit</th>
                <th>Found in</th>
                <th>Stage</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {[...OUTREACH_SHOPS].sort((a, b) => b.fit - a.fit).map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.name}
                    <span className="block text-sm text-graphite/55">{s.city}</span>
                  </td>
                  <td>{s.category}</td>
                  <td className="text-right font-semibold">{s.fit}</td>
                  <td className="text-sm">{s.source}</td>
                  <td className="text-sm">{s.email ? s.stage : 'No email found'}</td>
                  <td className="text-right">
                    {s.email && s.stage !== 'Unsubscribed' && (
                      <button className="text-sm font-semibold text-leaf underline" onClick={() => setPreview(s)}>
                        Preview email
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Survey email to {preview.name}</h2>
          <div className="panel mt-3 p-5">
            <p className="text-sm text-graphite/60">Subject</p>
            <p className="font-semibold">{SURVEY_EMAIL.subject}</p>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{SURVEY_EMAIL.body(preview.name.replace(' (sample)', ''))}</pre>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-rule pt-4">
              <span className="w-full text-sm text-graphite/60">The four answer links, as this shop would get them:</span>
              {QUOTE_TIME_OPTIONS.map((o) => (
                <Link key={o.id} to={`/survey?t=${preview.id}&a=${o.id}`} className="btn-quiet py-1.5 text-sm">
                  {o.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Survey answers ({answers.length})</h2>
          <div className="panel mt-3 space-y-6 p-5">
            {answers.length === 0 ? (
              <p className="text-graphite/70">No answers yet. Click an answer link in the email preview to see one arrive here.</p>
            ) : (
              <>
                <Tally title="Time per quote" rows={count('quoteTime', QUOTE_TIME_OPTIONS.map((o) => o.label))} />
                <Tally title="Lost money on an underquote" rows={count('lostMoney', ['More than once', 'Once', 'No'])} />
                <Tally title="Most unpaid time" rows={count('painPoint', ['Quoting', 'Cut lists', 'Ordering materials', 'Tracking jobs', 'Invoicing'])} />
                <div>
                  <h3 className="text-sm font-semibold">Beta and call opt-ins</h3>
                  <ul className="mt-2 text-sm">
                    {answers
                      .filter((a) => a.optIn.includes('beta') || a.optIn.includes('call'))
                      .map((a) => (
                        <li key={a.token}>{a.shop}</li>
                      ))}
                  </ul>
                </div>
              </>
            )}
            <p className="border-t border-rule pt-4 text-sm text-graphite/65">Site signups: {signups.length}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
