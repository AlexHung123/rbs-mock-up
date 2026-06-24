import { request } from 'umi';
import type { RoomWithSlots } from '@/types';

export interface ListRoomsParams {
  date?: string;
  type?: string;
  floor?: string;
  capacity?: number;
  availableOnly?: boolean;
}

export async function listRooms(params: ListRoomsParams = {}) {
  return request<RoomWithSlots[]>('/api/rooms', { params });
}

export async function getRoom(id: string, date?: string) {
  return request<RoomWithSlots>(`/api/rooms/${id}`, { params: { date } });
}
