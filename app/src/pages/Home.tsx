import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Elevation, SheetDrawing } from '../components/Drawings'
import { inch, runJob, usd } from '../engine'
import { useSignups } from '../lib/store'
import type { Signup } from '../lib/store'

function LiveDemo() {
  const [width, setWidth] = useState(48)
  const [drawers, setDrawers] = useState(3)
  const job = useMemo(() => runJob('vanity', { width, height: 34.5, depth: 21, drawers }), [width, drawers])
  const firstSheet = job.nest.sheets[0]
  return (
    <div className="panel p-5 shadow-[0_1px_0_#c9d3ca]">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-semibold">Bathroom vanity</p>
        <p className="num text-sm text-graphite/65">
          {inch(width)} W x 34 1/2" H x 21" D
        </p>
      </div>
      <div className="mt-3 rounded-md bg-mist/50 p-3">
        <Elevation rects={job.build.elevation} width={job.build.overall.width} height={job.build.overall.height} className="mx-auto h-52 w-full" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1 flex justify-between text-sm text-graphite/75">
            <span>Width</span>
            <span className="num">{inch(width)}</span>
          </span>
          <input type="range" min={24} max={72} step={1} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-forest" />
        </label>
        <label className="block">
          <span className="mb-1 flex justify-between text-sm text-graphite/75">
            <span>Drawers</span>
            <span className="num">{drawers}</span>
          </span>
          <input type="range" min={0} max={4} step={1} value={drawers} onChange={(e) => setDrawers(Number(e.target.value))} className="w-full accent-forest" />
        </label>
      </div>
      <div className="mt-4 flex items-end justify-between border-t border-rule pt-4">
        <div>
          <p className="display num text-4xl text-forest">{usd(job.costing.total)}</p>
          <p className="text-sm text-graphite/65">Quote at $85/hr and 25% materials markup</p>
        </div>
        <p className="num text-right text-sm text-graphite/70">
          {job.build.parts.reduce((a, p) => a + p.qty, 0)} parts
          <br />
          {job.nest.sheets.length} sheets
        </p>
      </div>
      {firstSheet && (
        <div className="mt-4">
          <SheetDrawing sheet={firstSheet} />
        </div>
      )}
    </div>
  )
}

function SignupForm() {
  const { add } = useSignups()
  const [email, setEmail] = useState('')
  const [kind, setKind] = useState<Signup['kind']>('shop')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter an email address like you@yourshop.com.')
      return
    }
    add(email.trim(), kind)
    setDone(true)
  }
  if (done)
    return (
      <p className="text-[17px]" role="status">
        You're on the list. We'll email {email} when founding-shop pricing opens.
      </p>
    )
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_200px_auto]" noValidate>
      <label className="block">
        <span className="sr-only">Email</span>
        <input className="field" type="email" placeholder="you@yourshop.com" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} aria-invalid={!!error} aria-describedby={error ? 'signup-error' : undefined} />
      </label>
      <label className="block">
        <span className="sr-only">I am a</span>
        <select className="field" value={kind} onChange={(e) => setKind(e.target.value as Signup['kind'])}>
          <option value="shop">Custom shop</option>
          <option value="home">Home woodworker</option>
          <option value="supplier">Supplier</option>
        </select>
      </label>
      <button className="btn-primary" type="submit">
        Get early access
      </button>
      {error && (
        <p id="signup-error" className="text-sm text-signal sm:col-span-3">
          {error}
        </p>
      )}
    </form>
  )
}

const AUDIENCES = [
  {
    title: 'Custom shops',
    body: 'Quote a vanity, a run of bases or a built-in from its dimensions. The same numbers become the cut list, the sheet layouts and the material order, so you only do the takeoff once.',
    link: { to: '/quote', label: 'Quote a job' },
  },
  {
    title: 'Home woodworkers',
    body: 'Plan a bookcase or a vanity for your own house. Get every part, how to break down each sheet, and a shopping list you can take to a local yard.',
    link: { to: '/plan', label: 'Plan a build' },
  },
  {
    title: 'Local suppliers',
    body: 'List what you stock, answer material requests from shops nearby, and let us run your catalog and website if you want one.',
    link: { to: '/suppliers', label: 'List your yard' },
  },
]

const STEPS = [
  ['Enter the sizes', 'Pick a template and type the width, height and depth from the customer.'],
  ['Send the quote', 'Your rates and markup turn the parts into a price, ready to print or send.'],
  ['Cut from the layout', 'Win the job and the cut list and sheet layouts are already done.'],
  ['Order the material', 'Send the sheet and hardware list to a supplier near you.'],
]

const PRICING = [
  {
    group: 'Shops',
    tiers: [
      ['Free', '$0', '5 quotes a month'],
      ['Shop', '$79 a month', 'Unlimited quotes, your branding, job board'],
      ['Pro', '$199 a month', '3 users, invoicing, supplier ordering, DXF'],
    ],
  },
  {
    group: 'Home shops',
    tiers: [
      ['Home Free', '$0', '3 saved projects'],
      ['Hobby', '$6 a month', 'Unlimited projects, layouts, print-ready plans'],
    ],
  },
  {
    group: 'Suppliers',
    tiers: [
      ['Listed', '$0', 'Profile and 50 listings'],
      ['Partner', '$99 a month', 'Full catalog, pro pricing, shop requests'],
      ['Hosted', '$249 a month', 'Partner plus your website, hosted'],
    ],
  },
]

export default function Home() {
  return (
    <>
      <section className="border-b border-rule bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div>
            <h1 className="display text-[44px] text-forest sm:text-[60px]">From tape measure to priced quote in two minutes.</h1>
            <p className="mt-5 max-w-[34rem] text-[19px] leading-relaxed text-graphite/80">
              WoodWyze turns a few dimensions into a quote, a cut list, sheet layouts and a material order. Built for small custom shops, and for anyone planning a build at home.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/quote" className="btn-primary px-5 py-3 text-base">
                Quote a job free
              </Link>
              <Link to="/plan" className="btn-quiet px-5 py-3 text-base">
                Plan a home build
              </Link>
            </div>
            <p className="mt-4 text-sm text-graphite/60">Try the vanity on the right. Every number is calculated, nothing is canned.</p>
          </div>
          <LiveDemo />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="display text-3xl text-forest">One set of numbers, start to finish</h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-4">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="border-t-2 border-forest pt-4">
              <span className="num text-sm font-semibold text-leaf">Step {i + 1}</span>
              <h3 className="mt-1 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-[15px] text-graphite/75">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-rule bg-white">
        <div className="mx-auto grid max-w-6xl md:grid-cols-3 md:divide-x md:divide-rule">
          {AUDIENCES.map((a) => (
            <div key={a.title} className="border-b border-rule px-4 py-10 md:border-b-0 md:px-8">
              <h3 className="display text-2xl text-forest">{a.title}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-graphite/80">{a.body}</p>
              <Link to={a.link.to} className="mt-4 inline-block font-semibold text-leaf underline decoration-2 underline-offset-4">
                {a.link.label}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="display text-3xl text-forest">Pricing</h2>
        <p className="mt-2 max-w-2xl text-graphite/75">Month to month. Shops that answer our survey before launch get founding-shop pricing: 50% off the first year.</p>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {PRICING.map((g) => (
            <div key={g.group}>
              <h3 className="text-lg font-semibold">{g.group}</h3>
              <table className="mt-2 w-full">
                <tbody>
                  {g.tiers.map(([name, price, what]) => (
                    <tr key={name} className="border-t border-rule align-top">
                      <td className="py-3 pr-3 font-semibold">{name}</td>
                      <td className="num whitespace-nowrap py-3 pr-3 text-forest">{price}</td>
                      <td className="py-3 text-sm text-graphite/70">{what}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-forest text-white">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="display text-3xl">Get founding-shop pricing</h2>
          <p className="mt-2 text-white/80">We're opening to Bay Area shops first. Leave your email and we'll tell you when it's ready.</p>
          <div className="mt-6 rounded-lg bg-white p-4 text-graphite">
            <SignupForm />
          </div>
        </div>
      </section>
    </>
  )
}
