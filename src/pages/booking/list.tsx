import React, { useEffect, useMemo, useState } from 'react'
import { DatePicker, Select, Button, Typography, message, Spin } from 'antd'
import {
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  EllipsisOutlined
} from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import { listRooms } from '@/services/room'
import { listBookings } from '@/services/booking'
import type { Booking, RoomWithSlots } from '@/types'

const { Title, Text } = Typography

const START_HOUR = 9
const END_HOUR = 18
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60

const timelineHours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)

const formatHourLabel = (hour: number) => dayjs().hour(hour).minute(0).format('h:mm A')

const toMinutes = (time: string) => {
  const normalized = time.length === 5 ? `${time}:00` : time
  const [h, m] = normalized.split(':').map(Number)
  return h * 60 + m
}

const getBookingStyle = (booking: Booking) => {
  const start = toMinutes(booking.startTime)
  const end = toMinutes(booking.endTime)
  const left = ((start - START_HOUR * 60) / TOTAL_MINUTES) * 100
  const width = ((end - start) / TOTAL_MINUTES) * 100

  return {
    left: `${Math.max(left, 0)}%`,
    width: `${Math.max(width, 3)}%`
  }
}

const TimelineGrid: React.FC<{
  bookings: Booking[]
  onBookingClick: (booking: Booking) => void
}> = ({ bookings, onBookingClick }) => {
  const majorColumns = END_HOUR - START_HOUR
  const quarterTicks = Array.from({ length: majorColumns * 4 - 1 }, (_, i) => i + 1)

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        minHeight: 120,
        background: '#fff',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${timelineHours.length}, 1fr)`,
          height: 36,
          alignItems: 'center',
          padding: '0 10px',
          color: '#555',
          fontSize: 12,
          fontWeight: 600,
          borderBottom: '1px solid #f0f0f0',
          background: '#fff'
        }}
      >
        {timelineHours.map(hour => (
          <div key={hour} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
            {formatHourLabel(hour)}
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'relative',
          height: 84,
          margin: '0 10px',
          background: '#fff'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${majorColumns}, 1fr)`,
            pointerEvents: 'none'
          }}
        >
          {Array.from({ length: majorColumns }).map((_, i) => (
            <div
              key={i}
              style={{
                borderLeft: '1px solid #d9d9d9',
                height: '100%'
              }}
            />
          ))}
        </div>

        {quarterTicks.map(tick => (
          <div
            key={tick}
            style={{
              position: 'absolute',
              left: `${(tick / (majorColumns * 4)) * 100}%`,
              bottom: 0,
              width: 1,
              height: tick % 4 === 0 ? '100%' : 42,
              background: tick % 4 === 0 ? '#d9d9d9' : '#e8e8e8',
              pointerEvents: 'none'
            }}
          />
        ))}

        {bookings.map(booking => {
          const style = getBookingStyle(booking)

          return (
            <div
              key={booking.id}
              onClick={() => onBookingClick(booking)}
              style={{
                position: 'absolute',
                top: 12,
                height: 56,
                cursor: 'pointer',
                borderLeft: '3px solid #2f80ed',
                background: '#eef3ff',
                borderRadius: 2,
                padding: '6px 10px',
                overflow: 'hidden',
                ...style
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  fontSize: 10,
                  color: '#d46aa3',
                  background: '#f8dbea',
                  padding: '1px 6px',
                  borderRadius: 3,
                  marginBottom: 4,
                  fontWeight: 600
                }}
              >
                Booking ID : {booking.id}
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: '#333',
                  fontWeight: 600,
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {booking.title}
              </div>

              <div style={{ fontSize: 10, color: '#5b7bb2', marginTop: 2 }}>Classroom - {booking.roomId}</div>

              <div style={{ fontSize: 10, color: '#9aa3b2', marginTop: 2 }}>
                {dayjs(booking.startTime, ['HH:mm:ss', 'HH:mm']).format('h:mm A')} -{' '}
                {dayjs(booking.endTime, ['HH:mm:ss', 'HH:mm']).format('h:mm A')}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const RoomInfoCard: React.FC<{ room: RoomWithSlots }> = ({ room }) => {
  return (
    <div
      style={{
        width: 170,
        background: '#fff',
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid #f0f0f0'
      }}
    >
      <div>
        <Title level={4} style={{ margin: 0, fontSize: 18 }}>
          {room.id}
        </Title>

        <div style={{ marginTop: 8 }}>
          <Text
            style={{
              fontSize: 11,
              color: '#7a8cff',
              background: '#f1f4ff',
              padding: '2px 6px',
              borderRadius: 3,
              fontWeight: 600
            }}
          >
            {room.type}
          </Text>
        </div>

        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <EnvironmentOutlined style={{ color: '#999', fontSize: 12 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {room.floor}
          </Text>
        </div>

        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TeamOutlined style={{ color: '#999', fontSize: 12 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {room.capacity} Capacity
          </Text>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <Button type="text" icon={<EllipsisOutlined />} size="small" style={{ color: '#999', padding: 0 }} />
      </div>
    </div>
  )
}

const ListPage: React.FC = () => {
  const [date, setDate] = useState<Dayjs>(dayjs('2026-02-10'))
  const [roomType, setRoomType] = useState('Classroom')
  const [floor, setFloor] = useState('3F')
  const [roomId, setRoomId] = useState<string | undefined>()
  const [rooms, setRooms] = useState<RoomWithSlots[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [r, b] = await Promise.all([
        listRooms({
          date: date.format('YYYY-MM-DD'),
          type: roomType,
          floor
        }),
        listBookings({
          date: date.format('YYYY-MM-DD')
        })
      ])
      setRooms(r)
      setBookings(b)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [date, roomType, floor])

  const filteredRooms = useMemo(() => {
    if (!roomId) return rooms
    return rooms.filter(room => room.id === roomId)
  }, [rooms, roomId])

  const roomOptions = rooms.map(room => ({
    value: room.id,
    label: room.id
  }))

  const handleBookingClick = (b: Booking) => {
    message.info(`${b.title} (${b.startTime} - ${b.endTime})`)
  }

  const handlePrevDay = () => setDate(prev => prev.subtract(1, 'day'))
  const handleNextDay = () => setDate(prev => prev.add(1, 'day'))
  const handleToday = () => setDate(dayjs('2026-02-10'))

  return (
    <div
      style={{
        background: '#f5f5f5',
        minHeight: '100vh',
        padding: 24
      }}
    >
      {/* <div style={{ maxWidth: 1120, margin: '0 auto' }}> */}
      <Title level={3} style={{ marginTop: 0, marginBottom: 20 }}>
        Booking
      </Title>

      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: 16,
          marginBottom: 10,
          border: '1px solid #f0f0f0'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap'
          }}
        >
          <Button type="primary" size="small" onClick={handleToday} style={{ fontWeight: 600 }}>
            Today
          </Button>

          <Button size="small" icon={<LeftOutlined />} onClick={handlePrevDay} />
          <DatePicker
            value={date}
            onChange={d => d && setDate(d)}
            format="dddd, D MMMM YYYY"
            allowClear={false}
            suffixIcon={<CalendarOutlined />}
            size="small"
            style={{ width: 190 }}
          />
          <Button size="small" icon={<RightOutlined />} onClick={handleNextDay} />

          <Select
            value={roomType}
            onChange={setRoomType}
            size="small"
            style={{ width: 140 }}
            options={[{ value: 'Classroom', label: 'Classroom' }]}
          />

          <Select value={floor} onChange={setFloor} size="small" style={{ width: 70 }} options={[{ value: '3F', label: '3F' }]} />

          <Select
            value={roomId}
            onChange={setRoomId}
            placeholder="Room"
            allowClear
            size="small"
            style={{ width: 130 }}
            options={roomOptions}
          />

          <Button type="primary" size="small" icon={<SearchOutlined />} onClick={fetchData} />
        </div>
      </div>

      {loading ? (
        <div
          style={{
            background: '#fff',
            borderRadius: 8,
            padding: 40,
            textAlign: 'center'
          }}
        >
          <Spin />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredRooms.map(room => {
            const roomBookings = bookings.filter(b => b.roomId === room.id)

            return (
              <div
                key={room.id}
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  background: '#fff',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid #ececec'
                }}
              >
                <RoomInfoCard room={room} />

                <div
                  style={{
                    width: 18,
                    background: '#1f78ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}
                >
                  <LeftOutlined />
                </div>

                <TimelineGrid bookings={roomBookings} onBookingClick={handleBookingClick} />

                <div
                  style={{
                    width: 18,
                    background: '#1f78ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}
                >
                  <RightOutlined />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
    // </div>
  )
}

export default ListPage
