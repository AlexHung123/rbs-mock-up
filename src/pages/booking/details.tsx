import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Typography,
  Form,
  Select,
  Input,
  Button,
  Row,
  Col,
  Space,
  message,
} from 'antd';
import { Link, history } from 'umi';
import dayjs from 'dayjs';
import BookingSteps from '@/components/BookingSteps';
import DayTimeline from '@/components/DayTimeline';
import { getRoom } from '@/services/room';
import { listEquipment } from '@/services/equipment';
import { useBookingDraft } from '@/hooks/useBookingDraft';
import type { Equipment, RoomWithSlots, TimeSlot } from '@/types';

const { Title, Text } = Typography;

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
];

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

const DetailsPage: React.FC = () => {
  const { draft, setDraft } = useBookingDraft();
  const [form] = Form.useForm();
  const [room, setRoom] = useState<RoomWithSlots | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookedSlots, setBookedSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (!draft.selectedRoomId) {
      history.replace('/booking/room');
      return;
    }
    getRoom(draft.selectedRoomId, draft.selectedDate).then((r) => {
      setRoom(r);
      setBookedSlots(r.bookedSlots);
    });
    listEquipment().then(setEquipment);
    form.setFieldsValue({
      startTime: draft.startTime,
      endTime: draft.endTime,
      title: draft.title,
      remarks: draft.remarks,
    });
  }, [draft.selectedRoomId, draft.selectedDate, form]);

  const disabledTime = (kind: 'start' | 'end') => {
    return (time: string) => {
      if (kind === 'start') {
        return bookedSlots.some(
          (s) =>
            timeToMinutes(time) >= timeToMinutes(s.startTime) &&
            timeToMinutes(time) < timeToMinutes(s.endTime),
        );
      } else {
        const startVal = form.getFieldValue('startTime');
        if (!startVal) return false;
        if (timeToMinutes(time) <= timeToMinutes(startVal)) return true;
        return bookedSlots.some(
          (s) =>
            timeToMinutes(time) > timeToMinutes(s.startTime) &&
            timeToMinutes(time) <= timeToMinutes(s.endTime),
        );
      }
    };
  };

  const onValuesChange = (_: any, all: any) => {
    setDraft({
      startTime: all.startTime,
      endTime: all.endTime,
      title: all.title,
      remarks: all.remarks,
    });
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setDraft({
        startTime: values.startTime,
        endTime: values.endTime,
        title: values.title,
        remarks: values.remarks,
      });
      history.push('/booking/confirm');
    } catch {
      message.error('Please complete required fields');
    }
  };

  const equipmentByType = useMemo(() => {
    const map: Record<string, Equipment[]> = {};
    equipment.forEach((e) => {
      if (!map[e.type]) map[e.type] = [];
      map[e.type].push(e);
    });
    return map;
  }, [equipment]);

  if (!room) return null;

  return (
    <div>
      <BookingSteps current={1} />

      <Row gutter={16}>
        {/* Left: Room summary */}
        <Col xs={24} lg={6}>
          <Card
            cover={
              <div
                style={{
                  height: 160,
                  background: `url(${room.image}) center/cover`,
                }}
              />
            }
          >
            <Card.Meta
              title={room.name}
              description={
                <Space direction="vertical" size={4}>
                  <Text type="secondary">{room.floor}</Text>
                  <Text type="secondary">{room.capacity} Capacity</Text>
                </Space>
              }
            />
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <Link>How to go</Link>
            </div>
          </Card>
        </Col>

        {/* Middle: Form */}
        <Col xs={24} lg={12}>
          <Card title="Booking Details" style={{ marginBottom: 16 }}>
            <Form layout="vertical" form={form} onValuesChange={onValuesChange}>
              <Form.Item label="Start Time" name="startTime" rules={[{ required: true }]}>
                <Select
                  placeholder="Please select"
                  options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
                  disabled={disabledTime('start')}
                />
              </Form.Item>
              <Form.Item label="End Time" name="endTime" rules={[{ required: true }]}>
                <Select
                  placeholder="Please select"
                  options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
                  disabled={disabledTime('end')}
                />
              </Form.Item>
              <Form.Item label="Room Title" name="title" rules={[{ required: true }]}>
                <Input.TextArea rows={3} placeholder="Please enter" />
              </Form.Item>
              <Form.Item label="Remarks" name="remarks">
                <Input.TextArea rows={3} placeholder="Please enter" />
              </Form.Item>
            </Form>
          </Card>

          <Card title="Room Equipment">
            <Text strong>Fixed Equipment:</Text>
            <ul style={{ marginTop: 4 }}>
              {room.fixedEquipment.map((eq) => (
                <li key={eq}>{eq}</li>
              ))}
            </ul>
            <div style={{ marginTop: 12 }}>
              <Text strong>Equipment Request:</Text>
              <div style={{ marginTop: 8 }}>
                {draft.equipmentSelections.map((sel, idx) => (
                  <Row gutter={8} key={idx} style={{ marginBottom: 8 }}>
                    <Col span={8}>
                      <Select
                        value={sel.type}
                        style={{ width: '100%' }}
                        options={Object.keys(equipmentByType).map((t) => ({ value: t, label: t }))}
                        onChange={(v) => {
                          const next = [...draft.equipmentSelections];
                          next[idx] = { type: v, equipmentId: '' };
                          setDraft({ equipmentSelections: next });
                        }}
                        placeholder="Please select"
                      />
                    </Col>
                    <Col span={16}>
                      <Select
                        value={sel.equipmentId || undefined}
                        style={{ width: '100%' }}
                        options={(equipmentByType[sel.type] || []).map((e) => ({
                          value: e.id,
                          label: e.name,
                        }))}
                        onChange={(v) => {
                          const next = [...draft.equipmentSelections];
                          next[idx] = { type: sel.type, equipmentId: v };
                          setDraft({ equipmentSelections: next });
                        }}
                        placeholder="Please select"
                      />
                    </Col>
                  </Row>
                ))}
                <Space>
                  <Button onClick={() => setDraft({ equipmentSelections: [] })}>Reset</Button>
                  <Button
                    type="link"
                    onClick={() =>
                      setDraft({
                        equipmentSelections: [
                          ...draft.equipmentSelections,
                          { type: 'Notebook', equipmentId: '' },
                        ],
                      })
                    }
                  >
                    + Add Row
                  </Button>
                </Space>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right: Timeline */}
        <Col xs={24} lg={6}>
          <Card title={dayjs(draft.selectedDate).format('dddd, DD MMMM YYYY')}>
            <DayTimeline
              bookedSlots={bookedSlots}
              highlight={
                draft.startTime && draft.endTime
                  ? { startTime: draft.startTime, endTime: draft.endTime }
                  : undefined
              }
              date={draft.selectedDate}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => history.push('/booking/room')}>Back</Button>
        <Button type="primary" onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default DetailsPage;
