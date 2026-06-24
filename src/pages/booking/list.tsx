import React, { useEffect, useState } from 'react';
import { DatePicker, Select, Button, Space, Typography, Row, Col, Tag, message } from 'antd';
import { LeftOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import RoomTimelineRow from '@/components/RoomTimelineRow';
import { listRooms } from '@/services/room';
import { listBookings } from '@/services/booking';
import type { Booking, RoomWithSlots } from '@/types';

const { Title, Text } = Typography;

const ListPage: React.FC = () => {
  const [date, setDate] = useState<Dayjs>(dayjs('2026-02-10'));
  const [rooms, setRooms] = useState<RoomWithSlots[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const [r, b] = await Promise.all([
        listRooms({ date: date.format('YYYY-MM-DD'), type: 'Classroom', floor: '3F' }),
        listBookings({ date: date.format('YYYY-MM-DD') }),
      ]);
      setRooms(r);
      setBookings(b);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [date]);

  const handleBookingClick = (b: Booking) => {
    message.info(`${b.title} (${b.startTime} - ${b.endTime})`);
  };

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        Booking
      </Title>

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
        <Button type="primary">Today</Button>
        <Button icon={<LeftOutlined />} />
        <DatePicker
          value={date}
          onChange={(d) => d && setDate(d)}
          format="dddd, DD MMMM YYYY"
          allowClear={false}
        />
        <Button icon={<RightOutlined />} />
        <Select value="Classroom" style={{ width: 160 }} options={[{ value: 'Classroom', label: 'Classroom' }]} />
        <Select value="3F" style={{ width: 100 }} options={[{ value: '3F', label: '3F' }]} />
        <Select placeholder="Room" style={{ width: 140 }} allowClear />
        <Button type="primary" icon={<SearchOutlined />} />
      </div>

      {loading && <Text>Loading...</Text>}

      <Row gutter={[0, 12]}>
        {rooms.map((room) => {
          const roomBookings = bookings.filter((b) => b.roomId === room.id);
          return (
            <Col key={room.id} span={24}>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <div
                  style={{
                    width: 180,
                    padding: 12,
                    background: '#fff',
                    border: '1px solid #f0f0f0',
                    borderRadius: 4,
                    marginRight: 8,
                  }}
                >
                  <Title level={5} style={{ margin: 0 }}>
                    {room.id}
                  </Title>
                  <Tag color="blue" style={{ marginTop: 4 }}>
                    {room.type}
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">📍 {room.floor}</Text>
                  </div>
                  <div>
                    <Text type="secondary">👤 {room.capacity} Capacity</Text>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <RoomTimelineRow
                    bookings={roomBookings}
                    onBookingClick={handleBookingClick}
                  />
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default ListPage;
