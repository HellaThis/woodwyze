import { MATERIALS, fraction, inch } from '../engine'
import type { ElevationRect, SheetLayout } from '../engine'

const FILL: Record<ElevationRect['kind'], { fill: string; stroke: string }> = {
  carcass: { fill: '#f6ecd4', stroke: '#8a6a37' },
  door: { fill: '#e9d5a9', stroke: '#8a6a37' },
  drawer: { fill: '#e9d5a9', stroke: '#8a6a37' },
  shelf: { fill: '#d9bd84', stroke: '#8a6a37' },
  toekick: { fill: '#3b3f38', stroke: '#3b3f38' },
  opening: { fill: 'none', stroke: '#8a6a37' },
  frame: { fill: '#f3e6c8', stroke: '#8a6a37' }, // solid maple
  cubby: { fill: '#6f5a3a', stroke: '#5a4628' }, // shadowed open shelf
  slab: { fill: '#d9a441', stroke: '#8a5a1f' },
  vessel: { fill: '#ffffff', stroke: '#7a847c' },
  wall: { fill: '#d6dcd7', stroke: '#b9c2bb' },
}
const CANARY = { fill: '#e8b54c', stroke: '#8a5a1f' }

/** Front view of the project, to scale, with overall dimensions. */
export function Elevation({
  rects,
  width,
  height,
  marks = [],
  className = '',
}: {
  rects: ElevationRect[]
  width: number
  height: number
  marks?: { x: number; label: string }[]
  className?: string
}) {
  const pad = Math.max(4, width / 12)
  const vbW = width + pad * 2 + 6
  const vbH = height + pad * 2 + 6
  const flip = (y: number, h: number) => pad + height - y - h
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className={className} role="img" aria-label={`Front view, ${fraction(width)} by ${fraction(height)} inches`}>
      {rects.map((r, i) => (
        <rect
          key={i}
          x={pad + r.x}
          y={flip(r.y, r.h)}
          width={r.w}
          height={r.h}
          rx={r.kind === 'door' || r.kind === 'drawer' ? 0.6 : r.kind === 'vessel' ? Math.min(r.w, r.h) / 2.5 : 0}
          fill={(r.tone === 'canary' ? CANARY : FILL[r.kind]).fill}
          stroke={(r.tone === 'canary' ? CANARY : FILL[r.kind]).stroke}
          strokeWidth={0.35}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {rects
        .filter((r) => r.kind === 'door' || r.kind === 'drawer')
        .map((r, i) => {
          const cx = r.kind === 'drawer' ? r.x + r.w / 2 : r.pull === 'left' ? r.x + 2 : r.x + r.w - 2
          const len = Math.min(5, r.h * 0.45)
          const cy = r.kind === 'drawer' ? r.y + r.h / 2 : r.y + (r.h + len) / 2
          return r.kind === 'drawer' ? (
            <line key={`p${i}`} x1={pad + cx - 2.5} x2={pad + cx + 2.5} y1={flip(cy, 0)} y2={flip(cy, 0)} stroke="#3b3f38" strokeWidth={0.8} strokeLinecap="round" />
          ) : (
            <line key={`p${i}`} x1={pad + cx} x2={pad + cx} y1={flip(cy, 0)} y2={flip(cy - len, 0)} stroke="#3b3f38" strokeWidth={0.8} strokeLinecap="round" />
          )
        })}
      {marks.map((m, i) => (
        <g key={`m${i}`}>
          <line x1={pad + m.x} x2={pad + m.x} y1={pad} y2={pad + height} stroke="#2f855a" strokeWidth={0.3} strokeDasharray="1.2 1.2" vectorEffect="non-scaling-stroke" />
          <text x={pad + m.x} y={pad - 1.5} textAnchor="middle" fontSize={Math.max(3, width / 26)} fill="#2f855a" className="num">
            {m.label}
          </text>
        </g>
      ))}
      {/* floor */}
      {rects.some((r) => r.kind === 'wall') && <line x1={pad - 2} x2={pad + width + 2} y1={pad + height} y2={pad + height} stroke="#3b3f38" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />}
      {/* dimension lines */}
      <g stroke="#5b665c" strokeWidth={0.3} vectorEffect="non-scaling-stroke" fill="#5b665c">
        <line x1={pad} x2={pad + width} y1={pad + height + 5} y2={pad + height + 5} />
        <line x1={pad + width + 5} x2={pad + width + 5} y1={pad} y2={pad + height} />
      </g>
      <text x={pad + width / 2} y={pad + height + 4} textAnchor="middle" fontSize={Math.max(3, width / 22)} fill="#3b3f38" className="num">
        {inch(width)}
      </text>
      <text
        x={pad + width + 4}
        y={pad + height / 2}
        textAnchor="middle"
        fontSize={Math.max(3, width / 22)}
        fill="#3b3f38"
        transform={`rotate(-90 ${pad + width + 4} ${pad + height / 2})`}
        className="num"
      >
        {inch(height)}
      </text>
    </svg>
  )
}

/** One sheet of material with every part placed on it. */
export function SheetDrawing({ sheet }: { sheet: SheetLayout }) {
  const m = MATERIALS[sheet.material]
  const L = m.sheetLength
  const W = m.sheetWidth
  return (
    <figure className="panel p-3">
      <figcaption className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold">
          {m.name}, sheet {sheet.index}
        </span>
        <span className="num text-graphite/60">{Math.round(sheet.yield * 100)}% used</span>
      </figcaption>
      <svg viewBox={`-1 -1 ${L + 2} ${W + 2}`} className="w-full" role="img" aria-label={`${m.name} sheet ${sheet.index} with ${sheet.placements.length} parts`}>
        <rect x={0} y={0} width={L} height={W} fill="#faf6ec" stroke="#8a6a37" strokeWidth={0.4} />
        {/* grain lines along the sheet length */}
        {Array.from({ length: Math.floor(W / 6) }, (_, i) => (
          <line key={i} x1={0} x2={L} y1={(i + 1) * 6} y2={(i + 1) * 6} stroke="#ead9b3" strokeWidth={0.2} />
        ))}
        {sheet.placements.map((p, i) => {
          const fs = Math.min(3, Math.max(1.4, Math.min(p.w, p.h) / 4.5))
          const big = p.w > 10 && p.h > 5
          return (
            <g key={i}>
              <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="#e9d5a9" stroke="#8a6a37" strokeWidth={0.35} />
              <title>{`${p.group ? p.group + ', ' : ''}${p.name}: ${fraction(p.w)} x ${fraction(p.h)}${p.rotated ? ' (rotated)' : ''}`}</title>
              {big && (
                <>
                  <text x={p.x + 1.2} y={p.y + fs + 0.8} fontSize={fs} fill="#2b2f2c" fontWeight={600}>
                    {p.name}
                  </text>
                  <text x={p.x + 1.2} y={p.y + fs * 2 + 1.4} fontSize={fs * 0.85} fill="#4a514b" className="num">
                    {fraction(p.w)} x {fraction(p.h)}
                  </text>
                </>
              )}
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
