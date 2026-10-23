import { useState } from 'react'
import { MATERIALS } from '../engine'
import type { MaterialId } from '../engine'
import { DEFAULT_PROFILE, useProfile } from '../lib/store'

export default function Settings() {
  const [profile, setProfile] = useProfile()
  const [draft, setDraft] = useState(profile)
  const [saved, setSaved] = useState(false)
  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => {
    setDraft({ ...draft, [k]: v })
    setSaved(false)
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="display text-3xl text-forest">Rates and prices</h1>
      <p className="text-graphite/70">Every quote uses these. Set them to what you charge and what you pay.</p>
      <form
        className="mt-6 space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          setProfile(draft)
          setSaved(true)
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">Shop name</span>
            <input className="field" value={draft.shopName} onChange={(e) => set('shopName', e.target.value)} />
          </label>
          <label className="block">
            <span className="label">City</span>
            <input className="field" value={draft.city} onChange={(e) => set('city', e.target.value)} />
          </label>
          <label className="block">
            <span className="label">Shop rate ($ per hour)</span>
            <input className="field" type="number" min={0} value={draft.shopRate} onChange={(e) => set('shopRate', Number(e.target.value))} />
          </label>
          <label className="block">
            <span className="label">Markup on materials and hardware (%)</span>
            <input className="field" type="number" min={0} value={draft.markupPct} onChange={(e) => set('markupPct', Number(e.target.value))} />
          </label>
        </div>
        <fieldset>
          <legend className="label">What you pay for material</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(MATERIALS) as MaterialId[]).map((id) => (
              <label key={id} className="block">
                <span className="mb-1 block text-sm text-graphite/75">
                  {MATERIALS[id].name}{' '}
                  {MATERIALS[id].kind === 'lumber' ? '(per board ft)' : `(${MATERIALS[id].sheetLength / 12}x${MATERIALS[id].sheetWidth / 12} ft sheet)`}
                </span>
                <input
                  className="field"
                  type="number"
                  min={0}
                  step={MATERIALS[id].kind === 'lumber' ? 0.25 : 1}
                  value={draft.prices[id] ?? (MATERIALS[id].kind === 'lumber' ? MATERIALS[id].pricePerBF : MATERIALS[id].pricePerSheet)}
                  onChange={(e) => set('prices', { ...draft.prices, [id]: Number(e.target.value) })}
                />
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex items-center gap-3">
          <button className="btn-primary" type="submit">
            Save rates
          </button>
          <button
            type="button"
            className="btn-quiet"
            onClick={() => {
              setDraft(DEFAULT_PROFILE)
              setSaved(false)
            }}
          >
            Reset to sample rates
          </button>
          {saved && (
            <span className="text-sm font-medium text-leaf" role="status">
              Rates saved.
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
