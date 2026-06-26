import React, { useEffect, useMemo, useState } from 'react'
import { Button, Card, DatePicker, Space, Typography, message } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import type { TimeSlot } from '@/types'

const { Text } = Typography

export interface TimeRangeValue {
  startTime: string
  endTime: string
}

interface TimeSlotCalendarProps {
  date: string
  slots: string[]
  bookedSlots: TimeSlot[]
  value?: TimeRangeValue
  onChange?: (value?: TimeRangeValue) => void
  onDateChange?: (date: string) => void
  title?: string
  minTime?: string
  maxTime?: string
  loading?: boolean
  disablePastDays?: boolean
}

interface SlotRow {
  index: number
  startTime: string
  endTime?: string
  disabled: boolean
  booked: boolean
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function isTimeInRange(target: string, start: string, end: string): boolean {
  const t = timeToMinutes(target)
  return t >= timeToMinutes(start) && t < timeToMinutes(end)
}

function isSlotBooked(startTime: string, bookedSlots: TimeSlot[]): boolean {
  return bookedSlots.some(slot => isTimeInRange(startTime, slot.startTime, slot.endTime))
}

function overlapsBookedRange(startTime: string, endTime: string, bookedSlots: TimeSlot[]): boolean {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)

  return bookedSlots.some(slot => {
    const bookedStart = timeToMinutes(slot.startTime)
    const bookedEnd = timeToMinutes(slot.endTime)
    return start < bookedEnd && end > bookedStart
  })
}

function formatRangeLabel(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`
}

const TimeSlotCalendar: React.FC<TimeSlotCalendarProps> = ({
  date,
  slots,
  bookedSlots,
  value,
  onChange,
  onDateChange,
  title,
  minTime,
  maxTime,
  loading = false,
  disablePastDays = false
}) => {
  const [anchorTime, setAnchorTime] = useState<string | null>(null)
  const [hoverTime, setHoverTime] = useState<string | null>(null)
  const currentDate = useMemo(() => dayjs(date), [date])

  useEffect(() => {
    if (!value) {
      setAnchorTime(null)
      setHoverTime(null)
    }
  }, [value])

  useEffect(() => {
    setAnchorTime(null)
    setHoverTime(null)
  }, [date])

  const visibleSlots = useMemo(() => {
    return slots.filter(slot => {
      if (minTime && timeToMinutes(slot) < timeToMinutes(minTime)) return false
      if (maxTime && timeToMinutes(slot) >= timeToMinutes(maxTime)) return false
      return true
    })
  }, [slots, minTime, maxTime])

  const rows = useMemo<SlotRow[]>(() => {
    return visibleSlots.map((slot, index) => {
      const endTime = visibleSlots[index + 1]
      const booked = isSlotBooked(slot, bookedSlots)
      const disabled = booked || !endTime

      return {
        index,
        startTime: slot,
        endTime,
        booked,
        disabled
      }
    })
  }, [visibleSlots, bookedSlots])

  const selectedIndexes = useMemo(() => {
    if (!value) return new Set<number>()

    const startIdx = visibleSlots.indexOf(value.startTime)
    const endIdx = visibleSlots.indexOf(value.endTime)

    if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) return new Set<number>()

    const indexes = new Set<number>()
    for (let i = startIdx; i < endIdx; i += 1) {
      indexes.add(i)
    }
    return indexes
  }, [value, visibleSlots])

  const previewIndexes = useMemo(() => {
    if (!anchorTime || !hoverTime || value) return new Set<number>()

    const anchorIdx = visibleSlots.indexOf(anchorTime)
    const hoverIdx = visibleSlots.indexOf(hoverTime)

    if (anchorIdx < 0 || hoverIdx < 0) return new Set<number>()

    const min = Math.min(anchorIdx, hoverIdx)
    const max = Math.max(anchorIdx, hoverIdx)

    const indexes = new Set<number>()
    for (let i = min; i <= max; i += 1) {
      indexes.add(i)
    }
    return indexes
  }, [anchorTime, hoverTime, value, visibleSlots])

  const canSelectRange = (startIdx: number, endIdx: number): boolean => {
    const min = Math.min(startIdx, endIdx)
    const max = Math.max(startIdx, endIdx)

    for (let i = min; i <= max; i += 1) {
      const row = rows[i]
      if (!row || row.disabled || !row.endTime) {
        return false
      }
    }

    const startTime = visibleSlots[min]
    const endTime = visibleSlots[max + 1]

    if (!startTime || !endTime) return false
    if (overlapsBookedRange(startTime, endTime, bookedSlots)) return false

    return true
  }

  const emitSingleSlot = (row: SlotRow) => {
    if (!row.endTime || row.disabled) return

    onChange?.({
      startTime: row.startTime,
      endTime: row.endTime
    })

    setAnchorTime(null)
    setHoverTime(null)
  }

  const handleSlotClick = (row: SlotRow) => {
    if (row.disabled || !row.endTime) return

    if (!anchorTime) {
      setAnchorTime(row.startTime)
      setHoverTime(row.startTime)
      return
    }

    const anchorIdx = visibleSlots.indexOf(anchorTime)
    const currentIdx = visibleSlots.indexOf(row.startTime)

    if (anchorIdx < 0 || currentIdx < 0) {
      setAnchorTime(row.startTime)
      setHoverTime(row.startTime)
      return
    }

    if (anchorIdx === currentIdx) {
      emitSingleSlot(row)
      return
    }

    if (!canSelectRange(anchorIdx, currentIdx)) {
      message.warning('Selected range contains unavailable time')
      setAnchorTime(row.startTime)
      setHoverTime(row.startTime)
      return
    }

    const min = Math.min(anchorIdx, currentIdx)
    const max = Math.max(anchorIdx, currentIdx)

    const nextValue = {
      startTime: visibleSlots[min],
      endTime: visibleSlots[max + 1]
    }

    onChange?.(nextValue)
    setAnchorTime(null)
    setHoverTime(null)
  }

  const handleSlotHover = (row: SlotRow) => {
    if (!anchorTime || row.disabled || value) return
    setHoverTime(row.startTime)
  }

  const handleDateChange = (next: Dayjs | null) => {
    if (!next) return
    onDateChange?.(next.format('YYYY-MM-DD'))
  }

  const handlePrevDay = () => {
    onDateChange?.(currentDate.subtract(1, 'day').format('YYYY-MM-DD'))
  }

  const handleNextDay = () => {
    onDateChange?.(currentDate.add(1, 'day').format('YYYY-MM-DD'))
  }

  const handleToday = () => {
    onDateChange?.(dayjs().format('YYYY-MM-DD'))
  }

  const isAnchor = (row: SlotRow): boolean => {
    return anchorTime === row.startTime
  }

  const isSelected = (row: SlotRow): boolean => {
    return selectedIndexes.has(row.index)
  }

  const isPreview = (row: SlotRow): boolean => {
    if (value) return false
    return previewIndexes.has(row.index)
  }

  const isSelectionStart = (row: SlotRow): boolean => {
    return !!value && value.startTime === row.startTime
  }

  const isSelectionEnd = (row: SlotRow): boolean => {
    if (!value) return false
    const endIdx = visibleSlots.indexOf(value.endTime)
    return row.index === endIdx - 1
  }

  const getRowStyle = (row: SlotRow): React.CSSProperties => {
    const selected = isSelected(row)
    const preview = isPreview(row)
    const booked = row.booked
    const anchor = isAnchor(row)

    let background = '#ffffff'
    let color = 'rgba(0, 0, 0, 0.88)'
    let borderLeft = '4px solid transparent'
    let cursor: React.CSSProperties['cursor'] = row.disabled ? 'not-allowed' : 'pointer'

    if (booked) {
      background = 'repeating-linear-gradient(-45deg, #fafafa, #fafafa 6px, #f2f2f2 6px, #f2f2f2 12px)'
      color = 'rgba(0, 0, 0, 0.45)'
      borderLeft = '4px solid #d9d9d9'
    } else if (selected) {
      background = '#597ef7'
      color = '#ffffff'
      borderLeft = '4px solid #2f54eb'
    } else if (preview) {
      background = '#e6f4ff'
      color = 'rgba(0, 0, 0, 0.88)'
      borderLeft = '4px solid #91caff'
    } else if (anchor) {
      background = '#f0f5ff'
      color = 'rgba(0, 0, 0, 0.88)'
      borderLeft = '4px solid #2f54eb'
    }

    return {
      padding: '10px 12px',
      background,
      color,
      borderLeft,
      transition: 'all 0.2s ease',
      minHeight: 56,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      flexDirection: 'column',
      cursor,
      userSelect: 'none'
    }
  }

  const getTimeColStyle = (): React.CSSProperties => {
    return {
      padding: '10px 12px',
      borderRight: '1px solid #f0f0f0',
      minHeight: 56,
      background: '#fff',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start'
    }
  }

  return (
    <Card
      title={
        <Space size={8} wrap>
          <Button size="small" icon={<LeftOutlined />} onClick={handlePrevDay} />
          <DatePicker
            allowClear={false}
            value={currentDate}
            format="dddd, D MMMM YYYY"
            onChange={handleDateChange}
            disabledDate={disablePastDays ? current => !!current && current.startOf('day').isBefore(dayjs().startOf('day')) : undefined}
          />
          <Button size="small" type="primary" ghost onClick={handleToday}>
            Today
          </Button>
          <Button size="small" icon={<RightOutlined />} onClick={handleNextDay} />
          {title ? <Text strong>{title}</Text> : null}
        </Space>
      }
      loading={loading}
      extra={
        <Space size={8}>
          {value ? (
            <Button
              size="small"
              onClick={() => {
                onChange?.(undefined)
                setAnchorTime(null)
                setHoverTime(null)
              }}
            >
              Clear
            </Button>
          ) : null}
        </Space>
      }
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ borderTop: '1px solid #f0f0f0' }}>
        {rows.map(row => {
          const selected = isSelected(row)
          const preview = isPreview(row)
          const selectionStart = isSelectionStart(row)
          const selectionEnd = isSelectionEnd(row)

          return (
            <div
              key={row.startTime}
              onClick={() => handleSlotClick(row)}
              onMouseEnter={() => handleSlotHover(row)}
              style={{
                display: 'grid',
                gridTemplateColumns: '96px 1fr',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              <div style={getTimeColStyle()}>
                <Text style={{ fontSize: 12, lineHeight: '20px' }}>{row.startTime}</Text>
              </div>

              <div style={getRowStyle(row)}>
                {row.booked ? (
                  <Text style={{ fontSize: 12 }} type="secondary">
                    Unavailable
                  </Text>
                ) : selected ? (
                  <>
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#fff',
                        fontWeight: 600,
                        lineHeight: '18px'
                      }}
                    >
                      Selected Time
                    </Text>
                    {selectionStart || selectionEnd ? (
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'rgba(255,255,255,0.9)',
                          lineHeight: '18px'
                        }}
                      >
                        {value ? formatRangeLabel(value.startTime, value.endTime) : ''}
                      </Text>
                    ) : null}
                  </>
                ) : preview ? (
                  <>
                    <Text style={{ fontSize: 12, lineHeight: '18px' }}>Select end time</Text>
                    {anchorTime && hoverTime ? (
                      <Text style={{ fontSize: 12, color: '#666', lineHeight: '18px' }}>
                        {(() => {
                          const anchorIdx = visibleSlots.indexOf(anchorTime)
                          const hoverIdx = visibleSlots.indexOf(hoverTime)
                          const min = Math.min(anchorIdx, hoverIdx)
                          const max = Math.max(anchorIdx, hoverIdx)
                          const start = visibleSlots[min]
                          const end = visibleSlots[max + 1]
                          return start && end ? formatRangeLabel(start, end) : ''
                        })()}
                      </Text>
                    ) : null}
                  </>
                ) : isAnchor(row) ? (
                  <>
                    <Text style={{ fontSize: 12, fontWeight: 600, lineHeight: '18px' }}>Start time selected</Text>
                    <Text style={{ fontSize: 12, color: '#666', lineHeight: '18px' }}>Click another slot to finish selection</Text>
                  </>
                ) : (
                  <Text style={{ fontSize: 12, lineHeight: '18px' }}>Available</Text>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default TimeSlotCalendar
