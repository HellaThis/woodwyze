import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { OUTREACH_SHOPS, QUOTE_TIME_OPTIONS } from '../data/sample'
import { useSurvey } from '../lib/store'

const TOOLS = ['Paper or memory', 'Spreadsheet', 'SketchUp', 'Mozaik or Cabinet Vision', 'Other']
const LOST = ['More than once', 'Once', 'No']
const PAIN = ['Quoting', 'Cut lists', 'Ordering materials', 'Tracking jobs', 'Invoicing']
const OPT = [
  { id: 'notify', label: 'Tell me when it launches' },
  { id: 'beta', label: 'I want to be a beta tester, with founding-shop pricing' },
  { id: 'call', label: "I'm happy to do a 15-minute call" },
]

function Choice({ name, options, value, onChange }: { name: string; options: string[]; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => (
        <label key={o} className={`cursor-pointer rounded-md border px-3 py-2 text-[15px] focus-within:ring-2 focus-within:ring-leaf ${value === o ? 'border-forest bg-forest text-white' : 'border-rule bg-white hover:border-leaf'}`}>
          <input type="radio" name={name} className="sr-only" checked={value === o} onChange={() => onChange(o)} />
          {o}
        </label>
      ))}
    </div>
  )
}

export default function Survey() {
  const [search] = useSearchParams()
  const token = search.get('t') ?? 'demo-1042'
  const firstAnswer = search.get('a')
  const shop = OUTREACH_SHOPS.find((s) => s.id === token)
  const { answers, upsert } = useSurvey()
  const mine = answers.find((a) => a.token === token)
  const [form, setForm] = useState({ quoteTool: mine?.quoteTool, lostMoney: mine?.lostMoney, painPoint: mine?.painPoint, buyFrom: mine?.buyFrom ?? '', optIn: mine?.optIn ?? [] })
  const [done, setDone] = useState(false)

  // The click in the email is the answer to question one: record it on arrival.
  useEffect(() => {
    const label = QUOTE_TIME_OPTIONS.find((o) => o.id === firstAnswer)?.label
    if (label && mine?.quoteTime !== label) upsert({ token, shop: shop?.name ?? token, quoteTime: label })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstAnswer, token])

  const quoteTime = mine?.quoteTime ?? QUOTE_TIME_OPTIONS.find((o) => o.id === firstAnswer)?.label

  if (!quoteTime) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-sm text-graphite/60">{shop?.name}</p>
        <h1 className="display mt-1 text-3xl text-forest">How long does a typical custom quote take you?</h1>
        <p className="mt-2 text-graphite/70">This is the question in the email. Each answer is a link; one click records it.</p>
        <div className="mt-6 grid gap-2">
          {QUOTE_TIME_OPTIONS.map((o) => (
            <Link key={o.id} to={`/survey?t=${token}&a=${o.id}`} className="btn-quiet justify-start py-3 text-base">
              {o.label}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  if (done) {
    const beta = form.optIn.includes('beta') || form.optIn.includes('call')
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="display text-3xl text-forest">Thanks, that's everything.</h1>
        <p className="mt-3 text-[17px] text-graphite/80">
          {beta
            ? "Founding-shop pricing is locked in for you. Adam will reach out within two days to set up a time."
            : "Founding-shop pricing is locked in for you. We'll email you when WoodWyze opens."}
        </p>
        <p className="mt-6 text-[15px] text-graphite/70">While you're here, you can try the quote calculator now.</p>
        <Link to="/quote" className="btn-primary mt-3">
          Quote a job
        </Link>
      </div>
    )
  }

  const toggleOpt = (id: string) => setForm((f) => ({ ...f, optIn: f.optIn.includes(id) ? f.optIn.filter((x) => x !== id) : [...f.optIn, id] }))
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    upsert({ token, shop: shop?.name ?? token, ...form, buyFrom: form.buyFrom.trim() || undefined })
    setDone(true)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="rounded-md bg-mist px-4 py-3 text-[15px]" role="status">
        Got it: <span className="font-semibold">{quoteTime.toLowerCase()}</span>. Three more quick questions, about 2 minutes.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-8">
        <fieldset>
          <legend className="text-lg font-semibold">What do you quote with today?</legend>
          <Choice name="tool" options={TOOLS} value={form.quoteTool} onChange={(v) => setForm({ ...form, quoteTool: v })} />
        </fieldset>
        <fieldset>
          <legend className="text-lg font-semibold">In the past year, have you lost money on a job because it was underquoted?</legend>
          <Choice name="lost" options={LOST} value={form.lostMoney} onChange={(v) => setForm({ ...form, lostMoney: v })} />
        </fieldset>
        <fieldset>
          <legend className="text-lg font-semibold">Which part of a job eats the most unpaid time?</legend>
          <Choice name="pain" options={PAIN} value={form.painPoint} onChange={(v) => setForm({ ...form, painPoint: v })} />
        </fieldset>
        <label className="block">
          <span className="text-lg font-semibold">Where do you buy sheet goods and lumber?</span>
          <span className="block text-sm text-graphite/60">Optional</span>
          <input className="field mt-2" value={form.buyFrom} onChange={(e) => setForm({ ...form, buyFrom: e.target.value })} placeholder="The yard or dealer you use most" />
        </label>
        <fieldset>
          <legend className="text-lg font-semibold">Want in?</legend>
          <div className="mt-2 space-y-2">
            {OPT.map((o) => (
              <label key={o.id} className="flex cursor-pointer items-center gap-3 text-[16px]">
                <input type="checkbox" className="h-4 w-4 accent-forest" checked={form.optIn.includes(o.id)} onChange={() => toggleOpt(o.id)} />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
        <button className="btn-primary px-6 py-3 text-base" type="submit">
          Send answers
        </button>
      </form>
    </div>
  )
}
