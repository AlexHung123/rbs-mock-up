export type RoomType = 'Classroom';
export type Floor = '3F';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  floor: Floor;
  capacity: number;
  image: string;
  description: string;
  fixedEquipment: string[];
  status: 'available' | 'maintenance';
}

export type EquipmentType = 'Notebook' | 'Microphone' | 'Television' | 'Projector';
export type EquipmentStatus = 'available' | 'reserved' | 'maintenance';

export interface Equipment {
  id: string;
  type: EquipmentType;
  name: string;
  status: EquipmentStatus;
  assignedRoomId?: string;
  currentBookingId?: string;
}

export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'revoked'
  | 'waitlisted';

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  title: string;
  remarks?: string;
  equipmentIds: string[];
  status: BookingStatus;
  createdAt: string;  // ISO
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  bookingId?: string;
  status: 'available' | 'booked' | 'buffer';
}

export interface RoomWithSlots extends Room {
  bookedSlots: TimeSlot[];
}

export interface BookingDraftPayload {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  remarks?: string;
  equipmentIds: string[];
}

export interface EquipmentSelection {
  type: EquipmentType;
  equipmentId: string;
}
