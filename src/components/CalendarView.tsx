import React, { useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { LeftOutlined, RightOutlined, DownOutlined, CalendarOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import { listMyBookings } from '@/services/booking'
import type { Booking, BookingStatus } from '@/types'
import './CalendarView.less'

type ViewMode = 'day' | 'week' | 'month'

const MOCK_TODAY = dayjs('2026-02-10')
const START_HOUR = 9
const END_HOUR = 19
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
const HOUR_HEIGHT = 78
const TIME_COL_WIDTH = 74

const MONTH_EVENT_COLOR: Record<BookingStatus, string> = {
  pending: '#faad14',
  approved: '#5b8ff9',
  waitlisted: '#f0c419',
  rejected: '#ff7875',
  revoked: '#fa8c16'
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function formatHour12(h: number): string {
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:00 ${period}`
}

function getWeekDates(date: Dayjs): Dayjs[] {
  const start = date.subtract(date.day(), 'day')
  return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'))
}

function getMonthGrid(date: Dayjs): Dayjs[] {
  const startOfMonth = date.startOf('month')
  const start = startOfMonth.subtract(startOfMonth.day(), 'day')
  return Array.from({ length: 42 }, (_, i) => start.add(i, 'day'))
}

function weekOfMonth(date: Dayjs): number {
  return Math.ceil(date.date() / 7)
}

const CalendarView: React.FC = () => {
  const [view, setView] = useState<ViewMode>('day')
  const [currentDate, setCurrentDate] = useState<Dayjs>(MOCK_TODAY)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await listMyBookings()
        if (mounted) setBookings(data)
      } catch (error) {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [])

  const goPrev = () => {
    if (view === 'day') setCurrentDate(d => d.subtract(1, 'day'))
    else if (view === 'week') setCurrentDate(d => d.subtract(7, 'day'))
    else setCurrentDate(d => d.subtract(1, 'month'))
  }

  const goNext = () => {
    if (view === 'day') setCurrentDate(d => d.add(1, 'day'))
    else if (view === 'week') setCurrentDate(d => d.add(7, 'day'))
    else setCurrentDate(d => d.add(1, 'month'))
  }

  const goToday = () => setCurrentDate(MOCK_TODAY)

  const viewMenu: MenuProps['items'] = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' }
  ]

  const handleViewSelect: MenuProps['onClick'] = ({ key }) => {
    setView(key as ViewMode)
  }

  const toolbarDateFormat = useMemo(() => {
    if (view === 'day') return 'dddd, D MMMM YYYY'
    return 'MMMM YYYY'
  }, [view])

  const renderDayWeekEvent = (b: Booking) => {
    return (
      <div className="calendar-event-block">
        <div className="calendar-event-booking-id">Booking ID : {b.id}</div>

        <div className="calendar-event-title" title={b.title}>
          {b.title}
        </div>

        <div className="calendar-event-room">Classroom - {b.roomId}</div>

        <div className="calendar-event-time">
          {b.startTime} - {b.endTime}
        </div>
      </div>
    )
  }

  const renderWeekHeader = (days: Dayjs[]) => {
    return (
      <div className="calendar-week-header">
        <div className="calendar-week-title">Week {weekOfMonth(currentDate)}</div>

        {days.map(d => {
          const isToday = d.isSame(MOCK_TODAY, 'day')
          return (
            <div key={d.format('YYYY-MM-DD')} className="calendar-week-day-header">
              <div className="calendar-week-day-name">{d.format('ddd').toUpperCase()}</div>
              <div className={`calendar-week-day-date ${isToday ? 'is-today' : ''}`}>{d.date()}</div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderDayWeekView = (isWeek: boolean) => {
    const days = isWeek ? getWeekDates(currentDate) : [currentDate]
    const visibleBookings = bookings.filter(b => days.some(d => d.format('YYYY-MM-DD') === b.date))

    return (
      <div className="calendar-shell">
        {isWeek ? renderWeekHeader(days) : null}

        <div
          className="calendar-time-grid"
          style={{
            gridTemplateColumns: `${TIME_COL_WIDTH}px ${isWeek ? 'repeat(7, 1fr)' : '1fr'}`
          }}
        >
          <div className="calendar-time-col">
            {HOURS.map((h, i) => (
              <div key={h} className={`calendar-time-label-row ${i === 0 ? 'is-first' : ''}`} style={{ height: HOUR_HEIGHT }}>
                <span className="calendar-time-label">{formatHour12(h)}</span>
              </div>
            ))}
          </div>

          {days.map((d, dayIdx) => {
            const dayBookings = visibleBookings.filter(b => b.date === d.format('YYYY-MM-DD'))

            return (
              <div key={dayIdx} className="calendar-day-col">
                {HOURS.map((h, i) => (
                  <div
                    key={h}
                    className={`calendar-hour-cell ${i === 0 ? 'is-first' : ''}`}
                    style={{
                      top: i * HOUR_HEIGHT,
                      height: HOUR_HEIGHT
                    }}
                  />
                ))}

                {dayBookings.map(b => {
                  const startMin = timeToMinutes(b.startTime)
                  const endMin = timeToMinutes(b.endTime)
                  const rawTop = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT
                  const top = Math.max(0, rawTop)
                  const rawHeight = ((endMin - startMin) / 60) * HOUR_HEIGHT
                  const height = Math.max(54, Math.min(HOURS.length * HOUR_HEIGHT - top, rawHeight))

                  return (
                    <div
                      key={b.id}
                      className="calendar-event-wrap"
                      style={{
                        top,
                        height
                      }}
                    >
                      {renderDayWeekEvent(b)}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    const monthGrid = getMonthGrid(currentDate)
    const weeks: Dayjs[][] = []
    for (let i = 0; i < monthGrid.length; i += 7) {
      weeks.push(monthGrid.slice(i, i + 7))
    }

    return (
      <div className="calendar-shell calendar-month-shell">
        <div className="calendar-month-weekday-row">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="calendar-month-weekday">
              {d}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="calendar-month-row">
            {week.map((d, di) => {
              const dayBookings = bookings.filter(b => b.date === d.format('YYYY-MM-DD'))
              const isToday = d.isSame(MOCK_TODAY, 'day')
              const inMonth = d.month() === currentDate.month()
              const visible = dayBookings.slice(0, 3)
              const extra = dayBookings.length - 3

              return (
                <div key={di} className={`month-cell ${!inMonth ? 'is-outside' : ''}`}>
                  <div className={`month-cell-topline ${isToday ? 'is-today' : ''}`} />
                  <div className="month-cell-date">{d.format('DD')}</div>

                  {visible.map(b => (
                    <div
                      key={b.id}
                      className="month-event-bar"
                      title={`${b.title} (${b.startTime}-${b.endTime})`}
                      style={{
                        background: MONTH_EVENT_COLOR[b.status]
                      }}
                    >
                      {b.title}
                    </div>
                  ))}

                  {extra > 0 ? <div className="month-more">More ...</div> : null}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="calendar-page">
      <div className="calendar-toolbar">
        <div className="calendar-toolbar-left">
          <Button type="primary" onClick={goToday} className="calendar-today-btn">
            Today
          </Button>
        </div>

        <div className="calendar-toolbar-center">
          <Button className="calendar-nav-btn" onClick={goPrev} icon={<LeftOutlined style={{ fontSize: 10 }} />} />

          <DatePicker
            className="reservation-picker"
            value={currentDate}
            onChange={d => d && setCurrentDate(d)}
            allowClear={false}
            format={toolbarDateFormat}
            inputReadOnly
            suffixIcon={<CalendarOutlined style={{ fontSize: 11 }} />}
            size="small"
          />

          <Button className="calendar-nav-btn" onClick={goNext} icon={<RightOutlined style={{ fontSize: 10 }} />} />
        </div>

        <div className="calendar-toolbar-right">
          <Dropdown
            trigger={['click']}
            menu={{
              items: viewMenu,
              onClick: handleViewSelect,
              selectedKeys: [view]
            }}
            classNames={{
              root: 'reservation-view-dropdown'
            }}
          >
            <Button type="link" className="calendar-view-trigger">
              {view.charAt(0).toUpperCase() + view.slice(1)}
              <DownOutlined style={{ marginLeft: 6, fontSize: 10 }} />
            </Button>
          </Dropdown>
        </div>
      </div>

      {loading ? (
        <div className="calendar-loading">Loading...</div>
      ) : view === 'month' ? (
        renderMonthView()
      ) : (
        renderDayWeekView(view === 'week')
      )}
    </div>
  )
}

export default CalendarView
