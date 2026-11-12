'use client'

import { useEffect, useRef, useState } from 'react'

import { getActivityAxisLabels, type ActivityBucket, type ActivityGrouping, type ActivityRange, type ApplicationActivity } from '@/lib/application-activity'
import styles from '@/app/ui.module.css'

type ApplicationActivitySectionProps = { activity: ApplicationActivity }

const RANGES: { value: ActivityRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '3m', label: 'Last 3 months' },
  { value: '12m', label: 'Last 12 months' },
]

function formatDate(value: string, monthly = false, year = false) {
  return new Date(value).toLocaleDateString('en-CA', {
    month: 'short',
    ...(!monthly && { day: 'numeric' }),
    ...(year && { year: 'numeric' }),
    timeZone: 'UTC',
  })
}

function bucketLabel(bucket: ActivityBucket, grouping: ActivityGrouping) {
  if (grouping === 'month') return formatDate(bucket.start, true, true)
  if (bucket.start === bucket.end) return formatDate(bucket.start, false, true)
  return `${formatDate(bucket.start, false, true)} – ${formatDate(bucket.end, false, true)}`
}

export function ApplicationActivitySection({ activity }: ApplicationActivitySectionProps) {
  const [range, setRange] = useState<ActivityRange>('7d')
  const [chartWidth, setChartWidth] = useState(260)
  const barsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!barsRef.current) return
    const observer = new ResizeObserver(([entry]) => setChartWidth(entry.contentRect.width))
    observer.observe(barsRef.current)
    return () => observer.disconnect()
  }, [activity.total])
  const { buckets, grouping } = activity.series[range]
  const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1)
  // Even steps keep every grid line on a whole application count.
  const step = Math.max(1, Math.ceil(maxCount / 4))
  const tickCount = Math.ceil(maxCount / step)
  const scaleMax = tickCount * step
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => scaleMax - index * step)
  const periodTotal = buckets.reduce((total, bucket) => total + bucket.count, 0)
  const axisLabels = getActivityAxisLabels(activity.series[range], chartWidth)
  const totalLabel = activity.total > 1 ? 'Total applications' : 'Total application'

  return (
    <section className={styles.activitySection} aria-labelledby="activity-heading">
      <div className={styles.filterHeader}>
        <h2 id="activity-heading">My activity</h2>
      </div>

      <dl className={styles.activitySummary} aria-label="Application activity summary">
        <div className={styles.activityMetric} aria-label={`${totalLabel}: ${activity.total}`}>
          <dt className={styles.activityMetricLabel}>{totalLabel}</dt>
          <dd className={styles.activityMetricValue}>{activity.total}</dd>
        </div>
        <div className={styles.activityMetric} aria-label={`Applications this week: ${activity.thisWeek}`}>
          <dt className={styles.activityMetricLabel}>This week</dt>
          <dd className={styles.activityMetricValue}>{activity.thisWeek}</dd>
        </div>
        <div className={styles.activityMetric} aria-label={`Applications this month: ${activity.thisMonth}`}>
          <dt className={styles.activityMetricLabel}>This month</dt>
          <dd className={styles.activityMetricValue}>{activity.thisMonth}</dd>
        </div>
      </dl>

      {activity.total > 0 && (
        <div className={styles.activityChart}>
          <div className={styles.activityChartHeader}>
            <h3>Applications over time</h3>
            <select
              className={styles.activityPeriod}
              aria-label="Activity time period"
              value={range}
              onChange={(event) => setRange(event.target.value as ActivityRange)}
            >
              {RANGES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          <div className={styles.activityPlot}>
            <div className={styles.activityScale} aria-hidden="true">
              {ticks.map((tick) => <span key={tick} style={{ top: `${(1 - tick / scaleMax) * 100}%` }}>{tick}</span>)}
            </div>
            <div className={styles.activityChartViewport}>
              <div className={styles.activityChartContent} style={{ minWidth: `${buckets.length * 6}px` }}>
                <div className={styles.activityGrid} aria-hidden="true">
                  {ticks.map((tick) => <div key={tick} style={{ top: `${(1 - tick / scaleMax) * 100}%` }} />)}
                </div>
                <div
                  ref={barsRef}
                  className={styles.activityBars}
                  role="list"
                  aria-label={`Applications submitted per ${grouping}`}
                >
                  {buckets.map((bucket, index) => {
                    const barHeight = (bucket.count / scaleMax) * 100
                    const label = bucketLabel(bucket, grouping)
                    const applicationLabel = bucket.count === 1 ? 'application' : 'applications'
                    const tooltipOffset = buckets.length === 1 ? 50 : index / (buckets.length - 1) * 100

                    return (
                      <div
                        key={bucket.start}
                        className={styles.activityBarItem}
                        role="listitem"
                        tabIndex={bucket.count > 0 ? 0 : undefined}
                        onPointerDown={bucket.count > 0 ? (event) => event.currentTarget.focus() : undefined}
                        aria-label={`${label}: ${bucket.count} ${applicationLabel}`}
                      >
                        {bucket.count > 0 && (
                          <div
                            className={styles.activityTooltip}
                            aria-hidden="true"
                            style={{
                              ...(barHeight > 50
                                ? { top: `calc(${100 - barHeight}% + 8px)` }
                                : { bottom: `calc(${barHeight}% + 8px)` }),
                              transform: `translateX(-${tooltipOffset}%)`,
                            }}
                          >
                            <strong>{bucket.count} {applicationLabel}</strong>
                            <span>{label}</span>
                          </div>
                        )}
                        <div className={styles.activityBarTrack} aria-hidden="true">
                          <div className={styles.activityBar} style={{ height: `${barHeight}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className={styles.activityAxis} aria-hidden="true">
                  {axisLabels.map(({ index, date, position, label }) => (
                    <time
                      key={date}
                      dateTime={date}
                      style={{
                        // Use the same columns and gaps as the bars, so each
                        // date ticks align with their actual position in the plot.
                        left: `calc((100% - ${(buckets.length - 1) * 3}px) * ${(index + position) / buckets.length} + ${index * 3}px)`,
                      }}
                    ><span>{label}</span></time>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {periodTotal === 0 && (
            <p className={styles.activityEmpty}>No applications in this period. Try a longer time range.</p>
          )}
        </div>
      )}
    </section>
  )
}
