import { useCallback, useEffect, useState } from 'react'
import type { BuildOptions, Params } from '../engine'

/**
 * Prototype persistence: everything lives in this browser's localStorage.
 * Swap these functions for Supabase calls when the backend exists; the page
 * code only talks to this module.
 */

export type QuoteStatus = 'draft' | 'sent' | 'won' | 'lost'

export interface SavedQuote {
  id: string
  number: number
  customer: string
  jobName: string
  templateId: string
  params: Params
  options: BuildOptions
  total: number
  status: QuoteStatus
  createdAt: string
  updatedAt: string
}

export interface SavedProject {
  id: string
  name: string
  templateId: string
  params: Params
  options: BuildOptions
  createdAt: string
}

export interface ShopProfile {
  shopName: string
  ownerName: string
  city: string
  shopRate: number
  markupPct: number
  prices: Record<string, number>
}

export interface SurveyAnswer {
  token: string
  shop: string
  quoteTime?: string
  quoteTool?: string
  lostMoney?: string
  painPoint?: string
  buyFrom?: string
  optIn: string[]
  at: string
}

export interface Signup {
  email: string
  kind: 'shop' | 'home' | 'supplier'
  at: string
}

const KEYS = {
  quotes: 'ww.quotes',
  projects: 'ww.projects',
  profile: 'ww.profile',
  survey: 'ww.survey',
  signups: 'ww.signups',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable (private window); the page keeps working in memory */
  }
  window.dispatchEvent(new CustomEvent('ww-store', { detail: key }))
}

function useStored<T>(key: string, fallback: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => read(key, fallback))
  useEffect(() => {
    const onChange = (e: Event) => {
      if ((e as CustomEvent).detail === key) setValue(read(key, fallback))
    }
    window.addEventListener('ww-store', onChange)
    return () => window.removeEventListener('ww-store', onChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  const set = useCallback(
    (v: T) => {
      setValue(v)
      write(key, v)
    },
    [key],
  )
  return [value, set]
}

export const uid = () => Math.random().toString(36).slice(2, 10)
const now = () => new Date().toISOString()

export const DEFAULT_PROFILE: ShopProfile = {
  shopName: 'Your shop',
  ownerName: '',
  city: '',
  shopRate: 85,
  markupPct: 25,
  prices: {},
}

export function useProfile() {
  return useStored<ShopProfile>(KEYS.profile, DEFAULT_PROFILE)
}

export function useQuotes() {
  const [quotes, setQuotes] = useStored<SavedQuote[]>(KEYS.quotes, [])
  const save = (q: Omit<SavedQuote, 'id' | 'number' | 'createdAt' | 'updatedAt' | 'status'> & { id?: string; status?: QuoteStatus }) => {
    const existing = q.id ? quotes.find((x) => x.id === q.id) : undefined
    if (existing) {
      const next = { ...existing, ...q, updatedAt: now() } as SavedQuote
      setQuotes(quotes.map((x) => (x.id === existing.id ? next : x)))
      return next
    }
    const number = 1001 + quotes.reduce((m, x) => Math.max(m, x.number - 1000), 0)
    const created: SavedQuote = { ...q, id: uid(), number, status: q.status ?? 'draft', createdAt: now(), updatedAt: now() } as SavedQuote
    setQuotes([created, ...quotes])
    return created
  }
  const setStatus = (id: string, status: QuoteStatus) =>
    setQuotes(quotes.map((x) => (x.id === id ? { ...x, status, updatedAt: now() } : x)))
  const remove = (id: string) => setQuotes(quotes.filter((x) => x.id !== id))
  return { quotes, save, setStatus, remove }
}

export function useProjects() {
  const [projects, setProjects] = useStored<SavedProject[]>(KEYS.projects, [])
  const save = (p: Omit<SavedProject, 'id' | 'createdAt'> & { id?: string }) => {
    if (p.id && projects.some((x) => x.id === p.id)) {
      setProjects(projects.map((x) => (x.id === p.id ? { ...x, ...p } : x)))
      return p.id
    }
    const id = uid()
    setProjects([{ ...p, id, createdAt: now() }, ...projects])
    return id
  }
  const remove = (id: string) => setProjects(projects.filter((x) => x.id !== id))
  return { projects, save, remove }
}

export function useSurvey() {
  const [answers, setAnswers] = useStored<SurveyAnswer[]>(KEYS.survey, [])
  const upsert = (a: Partial<SurveyAnswer> & { token: string; shop: string }) => {
    const prev = answers.find((x) => x.token === a.token)
    const next: SurveyAnswer = { optIn: [], ...prev, ...a, at: now() }
    setAnswers(prev ? answers.map((x) => (x.token === a.token ? next : x)) : [next, ...answers])
  }
  return { answers, upsert }
}

export function useSignups() {
  const [signups, setSignups] = useStored<Signup[]>(KEYS.signups, [])
  const add = (email: string, kind: Signup['kind']) => setSignups([{ email, kind, at: now() }, ...signups])
  return { signups, add }
}
