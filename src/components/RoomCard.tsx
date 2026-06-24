import React from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import type { RoomWithSlots } from '@/types';

const { Title, Paragraph, Text } = Typography;

interface Props {
  room: RoomWithSlots;
  onBook?: () => void;
}

const RoomCard: React.FC<Props> = ({ room, onBook }) => {
  const isUnavailable = room.bookedSlots.length > 0 || room.status === 'maintenance';

  return (
    <Card
      hoverable
      style={{ height: '100%' }}
      bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div
        style={{
          width: '100%',
          height: 160,
          background: `url(${room.image}) center/cover`,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />
      <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
        {room.name}
      </Title>
      <Paragraph
        style={{ color: '#666', fontSize: 13, marginBottom: 12, minHeight: 60 }}
        ellipsis={{ rows: 3 }}
      >
        {room.description}
      </Paragraph>
      <Space direction="vertical" size={6} style={{ marginBottom: 12, fontSize: 13 }}>
        <Text type="secondary">
          <EnvironmentOutlined /> {room.floor}
        </Text>
        <Text type="secondary">
          <UserOutlined /> {room.capacity} Capacity
        </Text>
      </Space>
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ fontSize: 13 }}>
          Fixed Equipment
        </Text>
        <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: 12, color: '#666' }}>
          {room.fixedEquipment.map((eq) => (
            <li key={eq}>{eq}</li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ textAlign: 'right' }}>
        <Button
          type="primary"
          disabled={isUnavailable}
          onClick={onBook}
          title={isUnavailable ? 'Room is unavailable on this date' : ''}
        >
          Book
        </Button>
      </div>
    </Card>
  );
};

export default RoomCard;
