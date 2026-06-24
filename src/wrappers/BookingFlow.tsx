import React from 'react';
import { BookingProvider } from '@/context/BookingContext';

const BookingFlow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BookingProvider>{children}</BookingProvider>
);

export default BookingFlow;
