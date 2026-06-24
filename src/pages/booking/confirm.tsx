import React, { useEffect, useState } from 'react';
import { Card, Button, Descriptions, Tag, message } from 'antd';
import { history } from 'umi';
import dayjs from 'dayjs';
import BookingSteps from '@/components/BookingSteps';
import { getRoom } from '@/services/room';
import { createBooking } from '@/services/booking';
import { useBookingDraft } from '@/hooks/useBookingDraft';
import type { RoomWithSlots } from '@/types';

const ConfirmPage: React.FC = () => {
  const { draft, setDraft } = useBookingDraft();
  const [room, setRoom] = useState<RoomWithSlots | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!draft.selectedRoomId || !draft.startTime || !draft.endTime || !draft.title) {
      history.replace('/booking/details');
      return;
    }
    getRoom(draft.selectedRoomId, draft.selectedDate).then(setRoom);
  }, [draft.selectedRoomId, draft.selectedDate, draft.startTime, draft.endTime, draft.title]);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const booking = await createBooking({
        roomId: draft.selectedRoomId!,
        date: draft.selectedDate,
        startTime: draft.startTime!,
        endTime: draft.endTime!,
        title: draft.title!,
        remarks: draft.remarks,
        equipmentIds: draft.equipmentSelections
          .map((s) => s.equipmentId)
          .filter(Boolean),
      });
      setDraft({ lastCreatedBookingId: booking.id });
      history.push('/booking/success');
    } catch (e: any) {
      message.error(e?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (!room) return null;

  return (
    <div>
      <BookingSteps current={2} />

      <Card title="Booking Room Details" style={{ marginBottom: 24 }}>
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
          <Descriptions column={1} style={{ flex: 1 }}>
            <Descriptions.Item label="Room Title">
              <strong>{draft.title}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Room Type">{room.type}</Descriptions.Item>
            <Descriptions.Item label="Room">{room.id}</Descriptions.Item>
            <Descriptions.Item label="Location">{room.floor}</Descriptions.Item>
            <Descriptions.Item label="Date">
              {dayjs(draft.selectedDate).format('dddd, DD MMMM YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Time">
              {draft.startTime} - {draft.endTime}
            </Descriptions.Item>
            <Descriptions.Item label="Max Capacity">{room.capacity}</Descriptions.Item>
            <Descriptions.Item label="Fixed Equipment">
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {room.fixedEquipment.map((eq) => (
                  <li key={eq}>{eq}</li>
                ))}
              </ul>
            </Descriptions.Item>
            <Descriptions.Item label="Equipment Request">
              {draft.equipmentSelections
                .filter((s) => s.equipmentId)
                .map((s) => {
                  const item = s.equipmentId; // equipment lookup not needed in mock
                  return (
                    <Tag color="blue" key={s.equipmentId} style={{ marginBottom: 4 }}>
                      {s.type} - {item}
                    </Tag>
                  );
                })}
            </Descriptions.Item>
            {draft.remarks && (
              <Descriptions.Item label="Remarks">{draft.remarks}</Descriptions.Item>
            )}
          </Descriptions>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => history.push('/booking/details')}>Back</Button>
        <Button type="primary" onClick={handleConfirm} loading={submitting}>
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default ConfirmPage;
