import React, { useState } from 'react';
import {
  Typography,
  Tabs,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Tag,
} from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { listMyBookings } from '@/services/booking';
import type { Booking, BookingStatus } from '@/types';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const STATUS_COLOR: Record<BookingStatus, string> = {
  pending: 'gold',
  approved: 'blue',
  waitlisted: 'magenta',
  rejected: 'red',
  revoked: 'orange',
};

const MyReservationPage: React.FC = () => {
  const [status, setStatus] = useState<BookingStatus | undefined>();

  const columns: ProColumns<Booking>[] = [
    { title: 'ID', dataIndex: 'id', width: 100 },
    { title: 'Date', dataIndex: 'date', width: 120 },
    {
      title: 'Time',
      dataIndex: 'time',
      width: 160,
      render: (_, r) => `${r.startTime} - ${r.endTime}`,
    },
    { title: 'Room', dataIndex: 'roomId', width: 100 },
    { title: 'Meeting Title', dataIndex: 'title', ellipsis: true },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (_, r) => (
        <Tag color={STATUS_COLOR[r.status]} style={{ border: 'none', background: 'transparent', paddingLeft: 0 }}>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background:
                r.status === 'pending'
                  ? '#faad14'
                  : r.status === 'approved'
                    ? '#1677ff'
                    : r.status === 'rejected'
                      ? '#ff4d4f'
                      : r.status === 'waitlisted'
                        ? '#eb2f96'
                        : '#fa8c16',
              marginRight: 6,
            }}
          />
          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 100,
      render: () => <Button size="small" disabled>Edit</Button>,
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        My Reservation
      </Title>

      <Tabs
        activeKey="agenda"
        items={[
          {
            key: 'message',
            label: (
              <span>
                <span style={{ color: '#ff4d4f' }}>●</span> Message
              </span>
            ),
            disabled: true,
            children: <div>No messages</div>,
          },
          { key: 'agenda', label: 'Bookings Agenda' },
          { key: 'calendar', label: 'Calendar', disabled: true },
          { key: 'history', label: 'History', disabled: true },
        ]}
      />

      <div
        style={{
          background: '#fafafa',
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Space wrap>
          <Input placeholder="Please enter" style={{ width: 180 }} prefix="ID :" />
          <span>Date :</span>
          <RangePicker />
          <span>Status :</span>
          <Select
            placeholder="Please select"
            value={status}
            onChange={setStatus}
            allowClear
            style={{ width: 180 }}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'revoked', label: 'Revoked' },
              { value: 'waitlisted', label: 'Wait listed' },
            ]}
          />
          <Button>Reset</Button>
          <Button type="primary">Search</Button>
          <Button type="text">Collapse</Button>
        </Space>
      </div>

      <ProTable<Booking>
        headerTitle="Booking Reservation"
        rowKey="id"
        columns={columns}
        request={async () => {
          const data = await listMyBookings({ status });
          return {
            data,
            success: true,
            total: data.length,
          };
        }}
        pagination={{ pageSize: 10 }}
        search={false}
        options={{ reload: true, density: true, setting: true }}
      />
    </div>
  );
};

export default MyReservationPage;
