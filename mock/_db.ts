import type {
  Booking,
  BookingDraftPayload,
  Equipment,
  Room,
  TimeSlot,
} from '@/types';

const today = '2026-02-10';

const rooms: Room[] = [
  {
    id: 'C1',
    name: 'Classroom - C1',
    type: 'Classroom',
    floor: '3F',
    capacity: 20,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
    description:
      'Our classroom is professional and comfortable, with projector, sound system, and flexible seating. Spacious lighting supports discussions and practice, creating an efficient learning atmosphere.',
    fixedEquipment: [
      'Microphone',
      'Project system',
      'Flip chart (one set)',
      'DVD player',
      'Desktop PC',
      'Video cassette recorder',
    ],
    status: 'available',
  },
  {
    id: 'C2',
    name: 'Classroom - C2',
    type: 'Classroom',
    floor: '3F',
    capacity: 20,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
    description:
      'Our classroom is professional and comfortable, with projector, sound system, and flexible seating. Spacious lighting supports discussions and practice, creating an efficient learning atmosphere.',
    fixedEquipment: [
      'Microphone',
      'Project system',
      'Flip chart (one set)',
      'DVD player',
      'Desktop PC',
      'Video cassette recorder',
    ],
    status: 'available',
  },
  {
    id: 'C3',
    name: 'Classroom - C3',
    type: 'Classroom',
    floor: '3F',
    capacity: 30,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600',
    description:
      'Our classroom is professional and comfortable, with projector, sound system, and flexible seating. Spacious lighting supports discussions and practice, creating an efficient learning atmosphere.',
    fixedEquipment: [
      'Microphone',
      'Project system',
      'Flip chart (one set)',
      'DVD player',
      'Desktop PC',
      'Video cassette recorder',
    ],
    status: 'available',
  },
  {
    id: 'C4',
    name: 'Classroom - C4',
    type: 'Classroom',
    floor: '3F',
    capacity: 30,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600',
    description:
      'Our classroom is professional and comfortable, with projector, sound system, and flexible seating. Spacious lighting supports discussions and practice, creating an efficient learning atmosphere.',
    fixedEquipment: [
      'Microphone',
      'Project system',
      'Flip chart (one set)',
      'DVD player',
      'Desktop PC',
      'Video cassette recorder',
    ],
    status: 'available',
  },
];

const equipment: Equipment[] = [
  { id: 'N100001', type: 'Notebook', name: 'Lenovo ThinkPad X1', status: 'available' },
  { id: 'N100002', type: 'Notebook', name: 'Lenovo ThinkPad X1', status: 'available' },
  { id: 'M102122', type: 'Microphone', name: 'MICPRO AT-70W UHF ANTENNAS', status: 'maintenance', assignedRoomId: 'S1' },
  { id: 'T000111', type: 'Television', name: 'Interactive whiteboards', status: 'available', assignedRoomId: 'S1' },
  { id: 'P000201', type: 'Projector', name: 'Epson EB-685W Projector', status: 'available' },
];

const bookings: Booking[] = [
  {
    id: '100201',
    userId: 'mock-user-1',
    roomId: 'C1',
    date: today,
    startTime: '09:00',
    endTime: '12:30',
    title: 'Refresher on Storytelling Techniques and Tips for Daily Storytelling (I)',
    equipmentIds: ['N100001', 'N100002'],
    status: 'approved',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: '100202',
    userId: 'mock-user-1',
    roomId: 'C1',
    date: today,
    startTime: '14:00',
    endTime: '17:30',
    title: 'Refresher on Storytelling Techniques and Tips for Daily Storytelling (I)',
    equipmentIds: [],
    status: 'approved',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: '100203',
    userId: 'mock-user-1',
    roomId: 'C3',
    date: '2026-02-11',
    startTime: '09:00',
    endTime: '12:00',
    title: 'Refresher on Storytelling Techniques and Tips for Daily Storytelling (II)',
    equipmentIds: [],
    status: 'waitlisted',
    createdAt: '2026-02-02T10:00:00Z',
  },
  {
    id: '100204',
    userId: 'mock-user-1',
    roomId: 'C1',
    date: '2026-02-12',
    startTime: '09:00',
    endTime: '12:00',
    title: 'Refresher on Storytelling Techniques and Tips for Daily Storytelling (III)',
    equipmentIds: [],
    status: 'pending',
    createdAt: '2026-02-03T10:00:00Z',
  },
  {
    id: '100205',
    userId: 'mock-user-1',
    roomId: 'C1',
    date: '2026-02-12',
    startTime: '14:00',
    endTime: '17:30',
    title: '國際舞台上的中國──參與國際組織的角色與經驗',
    equipmentIds: [],
    status: 'rejected',
    createdAt: '2026-02-03T11:00:00Z',
  },
];

let bookingIdCounter = 100206;

export const db = {
  rooms,
  equipment,
  bookings,

  listRooms(): Room[] {
    return [...this.rooms];
  },

  getRoomById(id: string): Room | undefined {
    return this.rooms.find((r) => r.id === id);
  },

  listEquipment(filter?: { type?: string; availableOnly?: boolean }): Equipment[] {
    return this.equipment.filter((e) => {
      if (filter?.type && e.type !== filter.type) return false;
      if (filter?.availableOnly && e.status !== 'available') return false;
      return true;
    });
  },

  listBookings(filter?: {
    date?: string;
    roomId?: string;
    userId?: string;
    status?: string;
  }): Booking[] {
    return this.bookings.filter((b) => {
      if (filter?.date && b.date !== filter.date) return false;
      if (filter?.roomId && b.roomId !== filter.roomId) return false;
      if (filter?.userId && b.userId !== filter.userId) return false;
      if (filter?.status && b.status !== filter.status) return false;
      return true;
    });
  },

  getBookedSlots(roomId: string, date: string): TimeSlot[] {
    return this.bookings
      .filter((b) => b.roomId === roomId && b.date === date && b.status !== 'rejected' && b.status !== 'revoked')
      .map((b) => ({
        startTime: b.startTime,
        endTime: b.endTime,
        bookingId: b.id,
        status: 'booked' as const,
      }));
  },

  createBooking(payload: BookingDraftPayload, userId: string): Booking {
    const newBooking: Booking = {
      id: String(bookingIdCounter++),
      userId,
      ...payload,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.bookings.push(newBooking);
    return newBooking;
  },
};
