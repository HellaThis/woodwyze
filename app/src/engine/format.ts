/** 23.4375 → 23 7/16 */
export function fraction(n: number): string {
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  let whole = Math.floor(abs)
  let six = Math.round((abs - whole) * 16)
  if (six === 16) {
    whole += 1
    six = 0
  }
  if (six === 0) return `${sign}${whole}`
  let num = six
  let den = 16
  while (num % 2 === 0) {
    num /= 2
    den /= 2
  }
  return whole ? `${sign}${whole} ${num}/${den}` : `${sign}${num}/${den}`
}

export const inch = (n: number) => `${fraction(n)}"`

export const usd = (n: number) => {
  const digits = Number.isInteger(n) || Math.abs(n) >= 1000 ? 0 : 2
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits })
}
