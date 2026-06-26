import React, { useEffect, useMemo, useState } from 'react'
import { Card, Typography, Form, Select, Input, Button, Row, Col, Space, message, Divider } from 'antd'
import { Link, useNavigate } from 'umi'
import dayjs from 'dayjs'
import BookingSteps from '@/components/BookingSteps'
import TimeSlotCalendar from '@/components/TimeSlotCalendar'
import { getRoom } from '@/services/room'
import { listEquipment } from '@/services/equipment'
import { useBookingDraft } from '@/hooks/useBookingDraft'
import type { Equipment, RoomWithSlots } from '@/types'

const { Text } = Typography

const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00'
]

const DetailsPage: React.FC = () => {
  const { draft, setDraft } = useBookingDraft()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const [room, setRoom] = useState<RoomWithSlots | null>(null)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!draft.selectedRoomId) {
      navigate('/booking/room', { replace: true })
      return
    }

    let mounted = true

    const init = async () => {
      try {
        setLoading(true)

        const [roomRes, equipmentRes] = await Promise.all([getRoom(draft.selectedRoomId, draft.selectedDate), listEquipment()])

        if (!mounted) return

        setRoom(roomRes)
        setEquipment(equipmentRes)

        form.setFieldsValue({
          startTime: draft.startTime,
          endTime: draft.endTime,
          title: draft.title,
          remarks: draft.remarks
        })
      } catch (error) {
        message.error('Failed to load booking details')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [draft.selectedRoomId, draft.selectedDate, draft.startTime, draft.endTime, draft.title, draft.remarks, form, navigate])

  const equipmentByType = useMemo(() => {
    const map: Record<string, Equipment[]> = {}

    equipment.forEach(item => {
      if (!map[item.type]) {
        map[item.type] = []
      }
      map[item.type].push(item)
    })

    return map
  }, [equipment])

  const onValuesChange = (_changedValues: any, allValues: any) => {
    setDraft({
      startTime: allValues.startTime,
      endTime: allValues.endTime,
      title: allValues.title,
      remarks: allValues.remarks
    })
  }

  const handleTimeChange = async (range?: { startTime: string; endTime: string }) => {
    form.setFieldsValue({
      startTime: range?.startTime,
      endTime: range?.endTime
    })

    setDraft({
      startTime: range?.startTime,
      endTime: range?.endTime
    })

    try {
      await form.validateFields(['startTime', 'endTime'])
    } catch (error) {
      // ignore validation throw, UI will display message automatically
    }
  }

  const handleNext = async () => {
    try {
      const values = await form.validateFields()

      setDraft({
        title: values.title,
        remarks: values.remarks
      })

      navigate('/booking/confirm')
    } catch (error) {
      message.error('Please complete required fields')
    }
  }

  const handleResetEquipment = () => {
    setDraft({
      equipmentSelections: []
    })
  }

  const handleAddEquipmentRow = () => {
    setDraft({
      equipmentSelections: [...draft.equipmentSelections, { type: '', equipmentId: '' }]
    })
  }

  if (!room) {
    return null
  }

  return (
    <div>
      <BookingSteps current={1} />

      <Row gutter={[16, 16]}>
        {/* Left: Room summary + form */}
        <Col xs={24} xl={12}>
          <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: 16 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr',
                gap: 16,
                alignItems: 'start'
              }}
            >
              <div
                style={{
                  height: 140,
                  borderRadius: 8,
                  background: `url(${room.image}) center/cover`
                }}
              />
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        lineHeight: '28px',
                        marginBottom: 8
                      }}
                    >
                      {room.name}
                    </div>

                    <Space direction="vertical" size={4}>
                      <Text type="secondary">{room.floor}</Text>
                      <Text type="secondary">{room.capacity} Capacity</Text>
                    </Space>
                  </div>

                  <Link to="/booking/room">Change room</Link>
                </div>

                <div style={{ marginTop: 20, textAlign: 'right' }}>
                  <Link to="/map">How to go</Link>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Booking Details" loading={loading} style={{ marginBottom: 16 }}>
            <Form layout="vertical" form={form} onValuesChange={onValuesChange}>
              <Form.Item label="Room Title" name="title" rules={[{ required: true, message: 'Please enter room title' }]}>
                <Input.TextArea rows={3} placeholder="Please enter" />
              </Form.Item>

              <Form.Item label="Remarks" name="remarks">
                <Input.TextArea rows={4} placeholder="Please enter" />
              </Form.Item>
            </Form>
          </Card>

          <Card title="Room Equipment" loading={loading}>
            <Text strong>Fixed Equipment:</Text>
            <ul style={{ marginTop: 8, paddingLeft: 18, marginBottom: 16 }}>
              {room.fixedEquipment.map(item => (
                <li key={item} style={{ marginBottom: 4 }}>
                  {item}
                </li>
              ))}
            </ul>

            <Divider style={{ margin: '12px 0' }} />

            <Text strong>Equipment Request:</Text>

            <div style={{ marginTop: 12 }}>
              {draft.equipmentSelections.length === 0 ? (
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary">No additional equipment selected</Text>
                </div>
              ) : null}

              {draft.equipmentSelections.map((selection, index) => (
                <Row gutter={8} key={index} style={{ marginBottom: 8 }}>
                  <Col span={8}>
                    <Select
                      value={selection.type || undefined}
                      style={{ width: '100%' }}
                      placeholder="Please select"
                      options={Object.keys(equipmentByType).map(type => ({
                        value: type,
                        label: type
                      }))}
                      onChange={value => {
                        const next = [...draft.equipmentSelections]
                        next[index] = {
                          type: value,
                          equipmentId: ''
                        }

                        setDraft({
                          equipmentSelections: next
                        })
                      }}
                    />
                  </Col>

                  <Col span={16}>
                    <Select
                      value={selection.equipmentId || undefined}
                      style={{ width: '100%' }}
                      placeholder="Please select"
                      options={(equipmentByType[selection.type] || []).map(item => ({
                        value: item.id,
                        label: item.name
                      }))}
                      onChange={value => {
                        const next = [...draft.equipmentSelections]
                        next[index] = {
                          type: selection.type,
                          equipmentId: value
                        }

                        setDraft({
                          equipmentSelections: next
                        })
                      }}
                      disabled={!selection.type}
                    />
                  </Col>
                </Row>
              ))}

              <Space>
                <Button onClick={handleResetEquipment}>Reset</Button>
                <Button type="link" onClick={handleAddEquipmentRow}>
                  + Add Row
                </Button>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Right: calendar view */}
        <Col xs={24} xl={12}>
          <Card title={dayjs(draft.selectedDate).format('dddd, DD MMMM YYYY')} loading={loading} bodyStyle={{ padding: 0 }}>
            <TimeSlotCalendar
              date={draft.selectedDate}
              slots={TIME_SLOTS}
              bookedSlots={room.bookedSlots}
              value={
                draft.startTime && draft.endTime
                  ? {
                      startTime: draft.startTime,
                      endTime: draft.endTime
                    }
                  : undefined
              }
              onChange={handleTimeChange}
              minTime="09:00"
              maxTime="18:00"
            />
          </Card>
        </Col>
      </Row>

      <div
        style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Button onClick={() => navigate('/booking/room')}>Back</Button>
        <Button type="primary" onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  )
}

export default DetailsPage
