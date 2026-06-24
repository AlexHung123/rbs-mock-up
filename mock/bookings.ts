import type { Request, Response } from 'express';
import { db } from './_db';
import type { BookingDraftPayload } from '@/types';

const CURRENT_USER_ID = 'mock-user-1';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function hasConflict(
  start: string,
  end: string,
  bookedSlots: { startTime: string; endTime: string }[],
): boolean {
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  return bookedSlots.some((slot) => {
    const bs = timeToMinutes(slot.startTime);
    const be = timeToMinutes(slot.endTime);
    return s < be && e > bs;
  });
}

export default {
  'GET /api/bookings': (req: Request, res: Response) => {
    const { date, roomId, status } = req.query;
    const items = db.listBookings({
      date: date as string | undefined,
      roomId: roomId as string | undefined,
      status: status as string | undefined,
    });
    res.json(items);
  },

  'GET /api/bookings/me': (req: Request, res: Response) => {
    const { status, date, roomId } = req.query;
    const items = db.listBookings({
      userId: CURRENT_USER_ID,
      status: status as string | undefined,
      date: date as string | undefined,
      roomId: roomId as string | undefined,
    });
    res.json(items);
  },

  'POST /api/bookings': (req: Request, res: Response) => {
    const payload = req.body as BookingDraftPayload;
    if (!payload.roomId || !payload.date || !payload.startTime || !payload.endTime || !payload.title) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }
    if (timeToMinutes(payload.startTime) >= timeToMinutes(payload.endTime)) {
      res.status(400).json({ message: 'End time must be after start time' });
      return;
    }
    const bookedSlots = db.getBookedSlots(payload.roomId, payload.date);
    if (hasConflict(payload.startTime, payload.endTime, bookedSlots)) {
      res.status(409).json({ message: 'Time slot conflicts with existing booking' });
      return;
    }
    const booking = db.createBooking(payload, CURRENT_USER_ID);
    res.json(booking);
  },
};
