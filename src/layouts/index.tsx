import React from 'react'
import { Layout, Menu, Button } from 'antd'
import { CalendarOutlined, EditOutlined, ToolOutlined, SettingOutlined, CloseOutlined } from '@ant-design/icons'
import { Outlet, useLocation, history } from 'umi'

const { Header, Content } = Layout

const BOOKING_SUB_ROUTES = [
  { key: '/booking/room', label: 'Make Reservation' },
  { key: '/booking/list', label: 'Room Booking View' }
]

const BasicLayout: React.FC = () => {
  const location = useLocation()

  const isBookingArea = location.pathname.startsWith('/booking')
  const isMyReservation = location.pathname.startsWith('/my-reservation')

  const activeTopKey = isMyReservation ? '/my-reservation' : isBookingArea ? '/booking' : ''

  const activeSubKey = BOOKING_SUB_ROUTES.find(r => location.pathname.startsWith(r.key))?.key

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: 48,
              fontWeight: 600
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: '#1677ff',
                borderRadius: 6,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8
              }}
            >
              <CalendarOutlined />
            </div>
            Room Booking System
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[activeTopKey]}
            style={{ borderBottom: 'none', flex: 1 }}
            onClick={({ key }) => {
              if (key === '/my-reservation') history.push('/my-reservation')
              if (key === '/booking') history.push('/booking/room')
            }}
            items={[
              {
                key: '/my-reservation',
                icon: (
                  <span>
                    <CalendarOutlined />
                    <span
                      style={{
                        display: 'inline-block',
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#ff4d4f',
                        marginLeft: 4
                      }}
                    />
                  </span>
                ),
                label: 'My Reservation'
              },
              {
                key: '/booking',
                icon: <EditOutlined />,
                label: 'Booking'
              },
              {
                key: '/management',
                icon: <ToolOutlined />,
                label: 'Management',
                disabled: true
              },
              {
                key: '/system',
                icon: <SettingOutlined />,
                label: 'System',
                disabled: true
              }
            ]}
          />
        </div>
        <Button icon={<CloseOutlined />}>Close and back to iTMS</Button>
      </Header>

      {isBookingArea && (
        <div
          style={{
            background: '#fff',
            padding: '0 24px',
            borderBottom: '1px solid #f0f0f0'
          }}
        >
          <Menu
            mode="horizontal"
            selectedKeys={[activeSubKey || '']}
            style={{ borderBottom: 'none' }}
            onClick={({ key }) => history.push(key)}
            items={BOOKING_SUB_ROUTES.map(r => ({ key: r.key, label: r.label }))}
          />
        </div>
      )}

      <Content style={{ padding: '24px 32px' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 8,
            padding: 24,
            minHeight: 'calc(100vh - 200px)'
          }}
        >
          <Outlet />
        </div>
      </Content>
    </Layout>
  )
}

export default BasicLayout
