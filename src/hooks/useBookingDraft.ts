import { useContext } from 'react';
import { BookingContext, BookingContextValue } from '@/context/BookingContext';

export function useBookingDraft(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error('useBookingDraft must be used within a BookingProvider');
  }
  return ctx;
}
