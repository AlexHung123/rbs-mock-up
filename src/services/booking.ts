import { request } from '@/utils/request';
import type { Booking, BookingDraftPayload, BookingStatus } from '@/types';

export interface ListMyBookingsParams {
  status?: BookingStatus;
  date?: string;
  roomId?: string;
}

export async function createBooking(payload: BookingDraftPayload) {
  return request<Booking>('/api/bookings', { method: 'POST', data: payload });
}

export async function listMyBookings(params: ListMyBookingsParams = {}) {
  return request<Booking[]>('/api/bookings/me', { params });
}

export async function listBookings(params: { date?: string; roomId?: string; status?: BookingStatus } = {}) {
  return request<Booking[]>('/api/bookings', { params });
}
