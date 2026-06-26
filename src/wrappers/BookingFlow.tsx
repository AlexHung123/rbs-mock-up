import React from 'react';
import { Outlet } from 'umi';
import { BookingProvider } from '@/context/BookingContext';

const BookingFlow: React.FC = () => (
  <BookingProvider>
    <Outlet />
  </BookingProvider>
);

export default BookingFlow;
