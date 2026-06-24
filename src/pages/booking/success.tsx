import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Tag, Space } from 'antd';
import { history } from 'umi';
import dayjs from 'dayjs';
import BookingSteps from '@/components/BookingSteps';
import { getRoom } from '@/services/room';
import { listMyBookings } from '@/services/booking';
import { useBookingDraft } from '@/hooks/useBookingDraft';
import type { Booking, RoomWithSlots } from '@/types';

const { Title, Text } = Typography;

const STATUS_COLOR: Record<string, string> = {
  pending: 'gold',
  approved: 'blue',
  waitlisted: 'magenta',
  rejected: 'red',
  revoked: 'orange',
};

const SuccessPage: React.FC = () => {
  const { draft, resetDraft } = useBookingDraft();
  const [room, setRoom] = useState<RoomWithSlots | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!draft.lastCreatedBookingId) {
      history.replace('/booking/room');
      return;
    }
    listMyBookings().then((list) => {
      const found = list.find((b) => b.id === draft.lastCreatedBookingId);
      if (found) {
        setBooking(found);
        return getRoom(found.roomId, found.date).then(setRoom);
      }
      return null;
    });
  }, [draft.lastCreatedBookingId]);

  if (!booking || !room) return null;

  return (
    <div>
      <BookingSteps current={3} />

      <Title level={4} style={{ textAlign: 'center', marginBottom: 32 }}>
        Your booking has been successfully made. Kindly check the booking status in My
        Reservation - Bookings Agenda. Thank you.
      </Title>

      <Card
        title="Booking Confirmed"
        extra={
          <Button
            type="text"
            onClick={() => {
              resetDraft();
              history.push('/booking/room');
            }}
          >
            ⋯
          </Button>
        }
      >
        <div style={{ display: 'flex', gap: 24 }}>
          <div
            style={{
              width: 280,
              height: 160,
              background: `url(${room.image}) center/cover`,
              borderRadius: 8,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <Tag color="red" style={{ marginBottom: 8 }}>
              Booking ID : {booking.id}
            </Tag>
            <Title level={5} style={{ marginTop: 0 }}>
              {booking.title}
            </Title>
            <Space direction="vertical" size={4}>
              <a>Classroom - {room.id}</a>
              <Text type="secondary">⏱ {booking.startTime} - {booking.endTime}</Text>
              <Text type="secondary">📍 {room.floor}</Text>
              <Text type="secondary">👤 {room.capacity} Capacity</Text>
              <Text>
                <Tag color={STATUS_COLOR[booking.status]}>{booking.status}</Tag>
              </Text>
            </Space>
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Button type="primary" onClick={() => history.push('/my-reservation')}>
          Go to Bookings Agenda
        </Button>
      </div>
    </div>
  );
};

export default SuccessPage;
