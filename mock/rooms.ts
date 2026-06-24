import type { Request, Response } from 'express';
import { db } from './_db';

export default {
  'GET /api/rooms': (req: Request, res: Response) => {
    const { date, type, floor, capacity, availableOnly } = req.query;
    let rooms = db.listRooms();

    if (type) rooms = rooms.filter((r) => r.type === type);
    if (floor) rooms = rooms.filter((r) => r.floor === floor);
    if (capacity) rooms = rooms.filter((r) => String(r.capacity) === String(capacity));

    const targetDate = (date as string) || '2026-02-10';
    const roomsWithSlots = rooms.map((room) => {
      const bookedSlots = db.getBookedSlots(room.id, targetDate);
      const isAvailable = bookedSlots.length === 0;
      if (availableOnly === 'true' && !isAvailable) return null;
      return { ...room, bookedSlots };
    }).filter(Boolean);

    res.json(roomsWithSlots);
  },

  'GET /api/rooms/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const { date } = req.query;
    const room = db.getRoomById(id);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }
    const targetDate = (date as string) || '2026-02-10';
    const bookedSlots = db.getBookedSlots(id, targetDate);
    res.json({ ...room, bookedSlots });
  },
};
