import React from 'react';
import type { Booking } from '@/types';

interface Props {
  startHour?: number; // 9
  endHour?: number;   // 18
  bookings: Booking[];
  highlight?: { startTime: string; endTime: string };
  onBookingClick?: (b: Booking) => void;
  height?: number;
}

const HOURS = (start: number, end: number) => Array.from({ length: end - start }, (_, i) => start + i);

function timeToPercent(time: string, startHour: number, endHour: number): number {
  const [h, m] = time.split(':').map(Number);
  const minutes = h * 60 + m;
  const totalMinutes = (endHour - startHour) * 60;
  return ((minutes - startHour * 60) / totalMinutes) * 100;
}

const RoomTimelineRow: React.FC<Props> = ({
  startHour = 9,
  endHour = 18,
  bookings,
  highlight,
  onBookingClick,
  height = 60,
}) => {
  const hours = HOURS(startHour, endHour);

  return (
    <div
      style={{
        position: 'relative',
        height,
        background: '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: 4,
      }}
    >
      {/* Hour gridlines */}
      {hours.map((h, idx) => (
        <div
          key={h}
          style={{
            position: 'absolute',
            left: `${(idx / (endHour - startHour)) * 100}%`,
            top: 0,
            bottom: 0,
            borderLeft: '1px dashed #e8e8e8',
          }}
        />
      ))}
      {/* Hour labels */}
      {hours.map((h, idx) => (
        <div
          key={`label-${h}`}
          style={{
            position: 'absolute',
            left: `${(idx / (endHour - startHour)) * 100}%`,
            top: 4,
            transform: 'translateX(2px)',
            fontSize: 11,
            color: '#999',
          }}
        >
          {h}:00
        </div>
      ))}
      {/* Bookings */}
      {bookings.map((b) => {
        const left = timeToPercent(b.startTime, startHour, endHour);
        const width =
          timeToPercent(b.endTime, startHour, endHour) - left;
        return (
          <div
            key={b.id}
            onClick={() => onBookingClick?.(b)}
            style={{
              position: 'absolute',
              left: `${left}%`,
              width: `${width}%`,
              top: 24,
              bottom: 8,
              background: '#e6f4ff',
              borderLeft: '3px solid #1677ff',
              borderRadius: 4,
              padding: '4px 6px',
              fontSize: 11,
              cursor: onBookingClick ? 'pointer' : 'default',
              overflow: 'hidden',
            }}
            title={`${b.startTime} - ${b.endTime}: ${b.title}`}
          >
            <div style={{ fontWeight: 500, color: '#1677ff' }}>{b.title}</div>
            <div style={{ color: '#888' }}>
              {b.startTime} - {b.endTime}
            </div>
          </div>
        );
      })}
      {/* Highlighted user range */}
      {highlight && (
        <div
          style={{
            position: 'absolute',
            left: `${timeToPercent(highlight.startTime, startHour, endHour)}%`,
            width: `${
              timeToPercent(highlight.endTime, startHour, endHour) -
              timeToPercent(highlight.startTime, startHour, endHour)
            }%`,
            top: 24,
            bottom: 8,
            background: '#1677ff',
            borderRadius: 4,
          }}
        />
      )}
    </div>
  );
};

export default RoomTimelineRow;
