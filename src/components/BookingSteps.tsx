import React from 'react';
import { Steps } from 'antd';

const items = [
  { title: 'Select Room' },
  { title: 'Enter Booking Details' },
  { title: 'Confirm Booking Details' },
  { title: 'Awaiting Approval' },
];

interface Props {
  current: 0 | 1 | 2 | 3;
}

const BookingSteps: React.FC<Props> = ({ current }) => (
  <Steps
    current={current}
    items={items}
    style={{ marginBottom: 32, padding: '0 40px' }}
  />
);

export default BookingSteps;
