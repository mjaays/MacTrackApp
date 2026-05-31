interface LineChartPoint {
  date: string
  value: number
}

interface LineChartProps {
  points: LineChartPoint[]
  targetValue?: number | null
  unit?: string
}

/**
 * Minimal dependency-free SVG line chart.
 * Renders a value line with point dots, optional dashed target line, and
 * min/max + first/last axis labels. Scales to its container via viewBox.
 */
export function LineChart({ points, targetValue = null, unit = '' }: LineChartProps) {
  if (!points || points.length < 2) return null

  const W = 640
  const H = 240
  const padL = 44
  const padR = 16
  const padT = 16
  const padB = 28

  const values = points.map((p) => p.value)
  const candidates = targetValue != null ? [...values, targetValue] : values
  let minV = Math.min(...candidates)
  let maxV = Math.max(...candidates)
  if (minV === maxV) {
    minV -= 1
    maxV += 1
  }
  const padV = (maxV - minV) * 0.08 || 1
  minV -= padV
  maxV += padV

  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const x = (i: number) => padL + (i / (points.length - 1)) * plotW
  const y = (v: number) => padT + (1 - (v - minV) / (maxV - minV)) * plotH

  const linePoints = points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')

  const fmtVal = (v: number) => (Math.round(v * 10) / 10).toString()
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })

  const targetY = targetValue != null ? y(targetValue) : null

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Weight trend">
        {/* y-axis min/max guide labels */}
        <text className="line-chart-axis" x={padL - 8} y={y(maxV) + 4} textAnchor="end">{fmtVal(maxV)}</text>
        <text className="line-chart-axis" x={padL - 8} y={y(minV) + 4} textAnchor="end">{fmtVal(minV)}</text>

        {/* baseline */}
        <line className="line-chart-grid" x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} />

        {/* target line */}
        {targetY != null && (
          <>
            <line className="line-chart-target" x1={padL} y1={targetY} x2={W - padR} y2={targetY} />
            <text className="line-chart-target-label" x={W - padR} y={targetY - 6} textAnchor="end">
              target {fmtVal(targetValue as number)}{unit}
            </text>
          </>
        )}

        {/* value line */}
        <polyline className="line-chart-line" points={linePoints} fill="none" />

        {/* point dots */}
        {points.map((p, i) => (
          <circle key={i} className="line-chart-dot" cx={x(i)} cy={y(p.value)} r={3} />
        ))}

        {/* x-axis first/last date labels */}
        <text className="line-chart-axis" x={padL} y={H - 8} textAnchor="start">{fmtDate(points[0].date)}</text>
        <text className="line-chart-axis" x={W - padR} y={H - 8} textAnchor="end">{fmtDate(points[points.length - 1].date)}</text>
      </svg>
    </div>
  )
}
