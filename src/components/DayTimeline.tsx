import React from 'react';
import RoomTimelineRow from './RoomTimelineRow';
import type { Booking, TimeSlot } from '@/types';

interface Props {
  bookedSlots: TimeSlot[];
  highlight?: { startTime: string; endTime: string };
  date: string;
  onBookingClick?: (b: Booking) => void;
}

const DayTimeline: React.FC<Props> = ({ bookedSlots, highlight, date, onBookingClick }) => {
  // Convert slots to pseudo-bookings for the row component
  const mockBookings: Booking[] = bookedSlots.map((s, idx) => ({
    id: s.bookingId || `slot-${idx}`,
    userId: '',
    roomId: '',
    date,
    startTime: s.startTime,
    endTime: s.endTime,
    title: s.status === 'buffer' ? 'Unavailable' : 'Booked',
    equipmentIds: [],
    status: 'approved',
    createdAt: '',
  }));

  return (
    <div style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
      <RoomTimelineRow
        bookings={mockBookings}
        highlight={highlight}
        onBookingClick={onBookingClick}
      />
    </div>
  );
};

export default DayTimeline;
