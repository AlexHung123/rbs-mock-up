import React, { useEffect, useState } from 'react';
import { DatePicker, Select, Switch, Space, Button, Row, Col, Typography } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { history } from 'umi';
import BookingSteps from '@/components/BookingSteps';
import RoomCard from '@/components/RoomCard';
import { listRooms } from '@/services/room';
import { useBookingDraft } from '@/hooks/useBookingDraft';
import type { RoomWithSlots } from '@/types';

const { Title } = Typography;

const RoomPage: React.FC = () => {
  const { draft, setDraft } = useBookingDraft();
  const [rooms, setRooms] = useState<RoomWithSlots[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Dayjs>(dayjs(draft.selectedDate));
  const [capacity, setCapacity] = useState<number | undefined>();
  const [availableOnly, setAvailableOnly] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await listRooms({
        date: date.format('YYYY-MM-DD'),
        type: 'Classroom',
        floor: '3F',
        capacity,
        availableOnly,
      });
      setRooms(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, capacity, availableOnly]);

  const handleBook = (room: RoomWithSlots) => {
    setDraft({
      selectedRoomId: room.id,
      selectedDate: date.format('YYYY-MM-DD'),
      startTime: undefined,
      endTime: undefined,
      title: undefined,
      remarks: undefined,
      equipmentSelections: [
        { type: 'Notebook', equipmentId: 'N100001' },
        { type: 'Notebook', equipmentId: 'N100002' },
        { type: 'Notebook', equipmentId: '' },
        { type: 'Notebook', equipmentId: '' },
        { type: 'Notebook', equipmentId: '' },
        { type: 'Notebook', equipmentId: '' },
      ],
    });
    history.push('/booking/details');
  };

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        Booking
      </Title>
      <BookingSteps current={0} />

      <div
        style={{
          background: '#fafafa',
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Button icon={<LeftOutlined />} />
        <DatePicker
          value={date}
          onChange={(d) => d && setDate(d)}
          format="dddd, DD MMMM YYYY"
          allowClear={false}
        />
        <Button icon={<RightOutlined />} />
        <Select
          value="Classroom"
          style={{ width: 160 }}
          options={[{ value: 'Classroom', label: 'Classroom' }]}
        />
        <Select
          value="3F"
          style={{ width: 100 }}
          options={[{ value: '3F', label: '3F' }]}
        />
        <Select
          placeholder="Capacity"
          value={capacity}
          onChange={setCapacity}
          allowClear
          style={{ width: 140 }}
          options={[
            { value: 20, label: '20' },
            { value: 30, label: '30' },
          ]}
        />
        <Space>
          Available:
          <Switch checked={availableOnly} onChange={setAvailableOnly} />
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {rooms.map((room) => (
          <Col key={room.id} xs={24} sm={12} md={8} lg={6}>
            <RoomCard room={room} onBook={() => handleBook(room)} />
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: 16, textAlign: 'center', color: '#999' }}>
        Total {rooms.length} items
      </div>
    </div>
  );
};

export default RoomPage;
