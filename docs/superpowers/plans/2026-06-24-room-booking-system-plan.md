# Room Booking System — Booking Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the user-facing booking flow of a Room Booking System using Umi 4 + React 18 + Ant Design 5 + ProComponents, with Umi built-in mock backend.

**Architecture:** Multi-route wizard (one route per step) sharing a React Context for draft state. Umi file-based routing. In-memory mock data store, no persistence. 4-step wizard → minimal My Reservation stub for end-of-flow landing.

**Tech Stack:** Umi 4, React 18, TypeScript, Ant Design 5, @ant-design/pro-components 2.x, dayjs, mockjs.

**Reference Spec:** `docs/superpowers/specs/2026-06-24-room-booking-system-design.md`
**Reference Mockups:** `Room booking system/*.png`

---

## File Structure

Files created during this plan:

```
rbs-mock-up/
├── package.json                                    # Task 1
├── tsconfig.json                                   # Task 1
├── .umirc.ts                                       # Task 1
├── .gitignore                                      # Task 1
├── mock/
│   ├── _db.ts                                      # Task 3 (singleton store)
│   ├── rooms.ts                                    # Task 4
│   ├── equipment.ts                                # Task 5
│   └── bookings.ts                                 # Task 6
├── src/
│   ├── layouts/BasicLayout.tsx                     # Task 9
│   ├── pages/
│   │   ├── booking/room.tsx                        # Task 13
│   │   ├── booking/details.tsx                     # Task 14
│   │   ├── booking/confirm.tsx                     # Task 15
│   │   ├── booking/success.tsx                     # Task 16
│   │   ├── booking/list.tsx                        # Task 17
│   │   └── my-reservation/index.tsx                # Task 18
│   ├── components/
│   │   ├── BookingSteps.tsx                        # Task 10
│   │   ├── RoomCard.tsx                            # Task 11
│   │   ├── DayTimeline.tsx                         # Task 12
│   │   └── RoomTimelineRow.tsx                     # Task 12
│   ├── context/BookingContext.tsx                  # Task 8
│   ├── hooks/useBookingDraft.ts                    # Task 8
│   ├── services/
│   │   ├── room.ts                                 # Task 7
│   │   ├── equipment.ts                            # Task 7
│   │   └── booking.ts                              # Task 7
│   └── types/index.ts                              # Task 2
└── docs/superpowers/
    ├── specs/2026-06-24-room-booking-system-design.md   (already written)
    └── plans/2026-06-24-room-booking-system-plan.md     (this file)
```

---

## Task 1: Initialize Umi Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.umirc.ts`
- Create: `.gitignore`

- [ ] **Step 1: Initialize git repo**

```bash
cd "D:\Projects\rbs-mock-up"
git init
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "rbs-mock-up",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "umi dev",
    "build": "umi build",
    "preview": "umi preview"
  },
  "dependencies": {
    "@ant-design/icons": "^5.2.0",
    "@ant-design/pro-components": "^2.6.0",
    "antd": "^5.12.0",
    "dayjs": "^1.11.10",
    "mockjs": "^1.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "umi": "^4.0.80"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "module": "ESNext",
    "moduleResolution": "node",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "mock/**/*", ".umirc.ts"]
}
```

- [ ] **Step 4: Create `.umirc.ts`**

```ts
import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    { path: '/', redirect: '/booking/room' },
    { path: '/booking', redirect: '/booking/room' },
    { path: '/booking/room', component: 'booking/room' },
    { path: '/booking/details', component: 'booking/details' },
    { path: '/booking/confirm', component: 'booking/confirm' },
    { path: '/booking/success', component: 'booking/success' },
    { path: '/booking/list', component: 'booking/list' },
    { path: '/my-reservation', component: 'my-reservation/index' },
    { path: '*', component: '404' },
  ],
  layout: { name: 'BasicLayout', locale: false },
  antd: {},
  mock: {},
  npmClient: 'npm',
  define: {
    'process.env.NODE_ENV': 'development',
  },
});
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules/
dist/
.umi/
.mock/
.env.local
*.log
```

- [ ] **Step 6: Install dependencies**

Run: `cd "D:\Projects\rbs-mock-up" && npm install`
Expected: completes without errors; `node_modules/` and `package-lock.json` created.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: scaffold Umi 4 project with ProComponents"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Create `src/types/index.ts`**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add shared TypeScript types for rooms, equipment, bookings"
```

---

## Task 3: Mock Database Singleton

**Files:**
- Create: `mock/_db.ts`

- [ ] **Step 1: Create `mock/_db.ts`**

```ts
import type {
  Booking,
  BookingDraftPayload,
  Equipment,
  Room,
  TimeSlot,
} from '@/types';

const today = '2026-02-10';

const rooms: Room[] = [
  {
    id: 'C1',
    name: 'Classroom - C1',
    type: 'Classroom',
    floor: '3F',
    capacity: 20,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
    description:
      'Our classroom is professional and comfortable, with projector, sound system, and flexible seating. Spacious lighting supports discussions and practice, creating an efficient learning atmosphere.',
    fixedEquipment: [
      'Microphone',
      'Project system',
      'Flip chart (one set)',
      'DVD player',
      'Desktop PC',
      'Video cassette recorder',
    ],
    status: 'available',
  },
  {
    id: 'C2',
    name: 'Classroom - C2',
    type: 'Classroom',
    floor: '3F',
    capacity: 20,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
    description:
      'Our classroom is professional and comfortable, with projector, sound system, and flexible seating. Spacious lighting supports discussions and practice, creating an efficient learning atmosphere.',
    fixedEquipment: [
      'Microphone',
      'Project system',
      'Flip chart (one set)',
      'DVD player',
      'Desktop PC',
      'Video cassette recorder',
    ],
    status: 'available',
  },
  {
    id: 'C3',
    name: 'Classroom - C3',
    type: 'Classroom',
    floor: '3F',
    capacity: 30,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600',
    description:
      'Our classroom is professional and comfortable, with projector, sound system, and flexible seating. Spacious lighting supports discussions and practice, creating an efficient learning atmosphere.',
    fixedEquipment: [
      'Microphone',
      'Project system',
      'Flip chart (one set)',
      'DVD player',
      'Desktop PC',
      'Video cassette recorder',
    ],
    status: 'available',
  },
  {
    id: 'C4',
    name: 'Classroom - C4',
    type: 'Classroom',
    floor: '3F',
    capacity: 30,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600',
    description:
      'Our classroom is professional and comfortable, with projector, sound system, and flexible seating. Spacious lighting supports discussions and practice, creating an efficient learning atmosphere.',
    fixedEquipment: [
      'Microphone',
      'Project system',
      'Flip chart (one set)',
      'DVD player',
      'Desktop PC',
      'Video cassette recorder',
    ],
    status: 'available',
  },
];

const equipment: Equipment[] = [
  { id: 'N100001', type: 'Notebook', name: 'Lenovo ThinkPad X1', status: 'available' },
  { id: 'N100002', type: 'Notebook', name: 'Lenovo ThinkPad X1', status: 'available' },
  { id: 'M102122', type: 'Microphone', name: 'MICPRO AT-70W UHF ANTENNAS', status: 'maintenance', assignedRoomId: 'S1' },
  { id: 'T000111', type: 'Television', name: 'Interactive whiteboards', status: 'available', assignedRoomId: 'S1' },
  { id: 'P000201', type: 'Projector', name: 'Epson EB-685W Projector', status: 'available' },
];

const bookings: Booking[] = [
  {
    id: '100201',
    userId: 'mock-user-1',
    roomId: 'C1',
    date: today,
    startTime: '09:00',
    endTime: '12:30',
    title: 'Refresher on Storytelling Techniques and Tips for Daily Storytelling (I)',
    equipmentIds: ['N100001', 'N100002'],
    status: 'approved',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: '100202',
    userId: 'mock-user-1',
    roomId: 'C1',
    date: today,
    startTime: '14:00',
    endTime: '17:30',
    title: 'Refresher on Storytelling Techniques and Tips for Daily Storytelling (I)',
    equipmentIds: [],
    status: 'approved',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: '100203',
    userId: 'mock-user-1',
    roomId: 'C3',
    date: '2026-02-11',
    startTime: '09:00',
    endTime: '12:00',
    title: 'Refresher on Storytelling Techniques and Tips for Daily Storytelling (II)',
    equipmentIds: [],
    status: 'waitlisted',
    createdAt: '2026-02-02T10:00:00Z',
  },
  {
    id: '100204',
    userId: 'mock-user-1',
    roomId: 'C1',
    date: '2026-02-12',
    startTime: '09:00',
    endTime: '12:00',
    title: 'Refresher on Storytelling Techniques and Tips for Daily Storytelling (III)',
    equipmentIds: [],
    status: 'pending',
    createdAt: '2026-02-03T10:00:00Z',
  },
  {
    id: '100205',
    userId: 'mock-user-1',
    roomId: 'C1',
    date: '2026-02-12',
    startTime: '14:00',
    endTime: '17:30',
    title: '國際舞台上的中國──參與國際組織的角色與經驗',
    equipmentIds: [],
    status: 'rejected',
    createdAt: '2026-02-03T11:00:00Z',
  },
];

let bookingIdCounter = 100206;

export const db = {
  rooms,
  equipment,
  bookings,

  listRooms(): Room[] {
    return [...this.rooms];
  },

  getRoomById(id: string): Room | undefined {
    return this.rooms.find((r) => r.id === id);
  },

  listEquipment(filter?: { type?: string; availableOnly?: boolean }): Equipment[] {
    return this.equipment.filter((e) => {
      if (filter?.type && e.type !== filter.type) return false;
      if (filter?.availableOnly && e.status !== 'available') return false;
      return true;
    });
  },

  listBookings(filter?: {
    date?: string;
    roomId?: string;
    userId?: string;
    status?: string;
  }): Booking[] {
    return this.bookings.filter((b) => {
      if (filter?.date && b.date !== filter.date) return false;
      if (filter?.roomId && b.roomId !== filter.roomId) return false;
      if (filter?.userId && b.userId !== filter.userId) return false;
      if (filter?.status && b.status !== filter.status) return false;
      return true;
    });
  },

  getBookedSlots(roomId: string, date: string): TimeSlot[] {
    return this.bookings
      .filter((b) => b.roomId === roomId && b.date === date && b.status !== 'rejected' && b.status !== 'revoked')
      .map((b) => ({
        startTime: b.startTime,
        endTime: b.endTime,
        bookingId: b.id,
        status: 'booked' as const,
      }));
  },

  createBooking(payload: BookingDraftPayload, userId: string): Booking {
    const newBooking: Booking = {
      id: String(bookingIdCounter++),
      userId,
      ...payload,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.bookings.push(newBooking);
    return newBooking;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add mock/_db.ts
git commit -m "feat(mock): add in-memory data store with rooms, equipment, bookings"
```

---

## Task 4: Rooms Mock Handlers

**Files:**
- Create: `mock/rooms.ts`

- [ ] **Step 1: Create `mock/rooms.ts`**

```ts
import type { Request, Response } from 'express';
import { db } from './_db';

export default {
  'GET /api/rooms': (req: Request, res: Response) => {
    const { date, type, floor, capacity, availableOnly } = req.query;
    let rooms = db.listRooms();

    if (type) rooms = rooms.filter((r) => r.type === type);
    if (floor) rooms = rooms.filter((r) => r.floor === floor);
    if (capacity) rooms = rooms.filter((r) => String(r.capacity) === String(capacity));

    const targetDate = (date as string) || '2026-02-10';
    const roomsWithSlots = rooms.map((room) => {
      const bookedSlots = db.getBookedSlots(room.id, targetDate);
      const isAvailable = bookedSlots.length === 0;
      if (availableOnly === 'true' && !isAvailable) return null;
      return { ...room, bookedSlots };
    }).filter(Boolean);

    res.json(roomsWithSlots);
  },

  'GET /api/rooms/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const { date } = req.query;
    const room = db.getRoomById(id);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }
    const targetDate = (date as string) || '2026-02-10';
    const bookedSlots = db.getBookedSlots(id, targetDate);
    res.json({ ...room, bookedSlots });
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add mock/rooms.ts
git commit -m "feat(mock): add rooms API handlers"
```

---

## Task 5: Equipment Mock Handlers

**Files:**
- Create: `mock/equipment.ts`

- [ ] **Step 1: Create `mock/equipment.ts`**

```ts
import type { Request, Response } from 'express';
import { db } from './_db';

export default {
  'GET /api/equipment': (req: Request, res: Response) => {
    const { type, availableOnly } = req.query;
    const items = db.listEquipment({
      type: type as string | undefined,
      availableOnly: availableOnly === 'true',
    });
    res.json(items);
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add mock/equipment.ts
git commit -m "feat(mock): add equipment API handler"
```

---

## Task 6: Bookings Mock Handlers

**Files:**
- Create: `mock/bookings.ts`

- [ ] **Step 1: Create `mock/bookings.ts`**

```ts
import type { Request, Response } from 'express';
import { db } from './_db';
import type { BookingDraftPayload } from '@/types';

const CURRENT_USER_ID = 'mock-user-1';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function hasConflict(
  start: string,
  end: string,
  bookedSlots: { startTime: string; endTime: string }[],
): boolean {
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  return bookedSlots.some((slot) => {
    const bs = timeToMinutes(slot.startTime);
    const be = timeToMinutes(slot.endTime);
    return s < be && e > bs;
  });
}

export default {
  'GET /api/bookings': (req: Request, res: Response) => {
    const { date, roomId, status } = req.query;
    const items = db.listBookings({
      date: date as string | undefined,
      roomId: roomId as string | undefined,
      status: status as string | undefined,
    });
    res.json(items);
  },

  'GET /api/bookings/me': (req: Request, res: Response) => {
    const { status, date, roomId } = req.query;
    const items = db.listBookings({
      userId: CURRENT_USER_ID,
      status: status as string | undefined,
      date: date as string | undefined,
      roomId: roomId as string | undefined,
    });
    res.json(items);
  },

  'POST /api/bookings': (req: Request, res: Response) => {
    const payload = req.body as BookingDraftPayload;
    if (!payload.roomId || !payload.date || !payload.startTime || !payload.endTime || !payload.title) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }
    if (timeToMinutes(payload.startTime) >= timeToMinutes(payload.endTime)) {
      res.status(400).json({ message: 'End time must be after start time' });
      return;
    }
    const bookedSlots = db.getBookedSlots(payload.roomId, payload.date);
    if (hasConflict(payload.startTime, payload.endTime, bookedSlots)) {
      res.status(409).json({ message: 'Time slot conflicts with existing booking' });
      return;
    }
    const booking = db.createBooking(payload, CURRENT_USER_ID);
    res.json(booking);
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add mock/bookings.ts
git commit -m "feat(mock): add bookings API handlers with conflict validation"
```

---

## Task 7: Service Layer

**Files:**
- Create: `src/services/room.ts`
- Create: `src/services/equipment.ts`
- Create: `src/services/booking.ts`

- [ ] **Step 1: Create `src/services/room.ts`**

```ts
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
```

- [ ] **Step 2: Create `src/services/equipment.ts`**

```ts
import { request } from 'umi';
import type { Equipment, EquipmentType } from '@/types';

export interface ListEquipmentParams {
  type?: EquipmentType;
  availableOnly?: boolean;
}

export async function listEquipment(params: ListEquipmentParams = {}) {
  return request<Equipment[]>('/api/equipment', { params });
}
```

- [ ] **Step 3: Create `src/services/booking.ts`**

```ts
import { request } from 'umi';
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
```

- [ ] **Step 4: Commit**

```bash
git add src/services/
git commit -m "feat(services): add typed API service wrappers"
```

---

## Task 8: BookingContext + useBookingDraft Hook

**Files:**
- Create: `src/context/BookingContext.tsx`
- Create: `src/hooks/useBookingDraft.ts`

- [ ] **Step 1: Create `src/context/BookingContext.tsx`**

```tsx
import React, { createContext, useCallback, useMemo, useState } from 'react';
import type { EquipmentSelection } from '@/types';

export interface BookingDraft {
  selectedRoomId?: string;
  selectedDate: string;
  startTime?: string;
  endTime?: string;
  title?: string;
  remarks?: string;
  equipmentSelections: EquipmentSelection[];
  lastCreatedBookingId?: string;
}

export interface BookingContextValue {
  draft: BookingDraft;
  setDraft: (patch: Partial<BookingDraft>) => void;
  resetDraft: () => void;
  isStepReady: (step: 1 | 2 | 3 | 4) => boolean;
}

const initialDraft: BookingDraft = {
  selectedDate: '2026-02-10',
  equipmentSelections: [],
};

export const BookingContext = createContext<BookingContextValue | null>(null);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draft, setDraftState] = useState<BookingDraft>(initialDraft);

  const setDraft = useCallback((patch: Partial<BookingDraft>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraftState({ ...initialDraft });
  }, []);

  const isStepReady = useCallback(
    (step: 1 | 2 | 3 | 4): boolean => {
      switch (step) {
        case 1:
          return true; // Step 1 is always reachable
        case 2:
          return Boolean(draft.selectedRoomId && draft.selectedDate);
        case 3:
          return Boolean(
            draft.selectedRoomId &&
              draft.selectedDate &&
              draft.startTime &&
              draft.endTime &&
              draft.title,
          );
        case 4:
          return Boolean(draft.lastCreatedBookingId);
        default:
          return false;
      }
    },
    [draft],
  );

  const value = useMemo<BookingContextValue>(
    () => ({ draft, setDraft, resetDraft, isStepReady }),
    [draft, setDraft, resetDraft, isStepReady],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};
```

- [ ] **Step 2: Create `src/hooks/useBookingDraft.ts`**

```ts
import { useContext } from 'react';
import { BookingContext, BookingContextValue } from '@/context/BookingContext';

export function useBookingDraft(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error('useBookingDraft must be used within a BookingProvider');
  }
  return ctx;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/context/ src/hooks/
git commit -m "feat(state): add BookingContext and useBookingDraft hook"
```

---

## Task 9: BasicLayout with Top Navigation

**Files:**
- Create: `src/layouts/BasicLayout.tsx`

- [ ] **Step 1: Create `src/layouts/BasicLayout.tsx`**

```tsx
import React from 'react';
import { Layout, Menu, Button, Space } from 'antd';
import {
  CalendarOutlined,
  EditOutlined,
  ToolOutlined,
  SettingOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useModel, history } from 'umi';

const { Header, Content } = Layout;

const BOOKING_SUB_ROUTES = [
  { key: '/booking/room', label: 'Make Reservation' },
  { key: '/booking/list', label: 'Room Booking View' },
];

const BasicLayout: React.FC = () => {
  const location = useLocation();

  const isBookingArea = location.pathname.startsWith('/booking');
  const isMyReservation = location.pathname.startsWith('/my-reservation');

  const activeTopKey = isMyReservation ? '/my-reservation' : isBookingArea ? '/booking' : '';

  const activeSubKey = BOOKING_SUB_ROUTES.find((r) => location.pathname.startsWith(r.key))?.key;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: 48,
              fontWeight: 600,
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
                marginRight: 8,
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
              if (key === '/my-reservation') history.push('/my-reservation');
              if (key === '/booking') history.push('/booking/room');
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
                        marginLeft: 4,
                      }}
                    />
                  </span>
                ),
                label: 'My Reservation',
              },
              {
                key: '/booking',
                icon: <EditOutlined />,
                label: 'Booking',
              },
              {
                key: '/management',
                icon: <ToolOutlined />,
                label: 'Management',
                disabled: true,
              },
              {
                key: '/system',
                icon: <SettingOutlined />,
                label: 'System',
                disabled: true,
              },
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
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Menu
            mode="horizontal"
            selectedKeys={[activeSubKey || '']}
            style={{ borderBottom: 'none' }}
            onClick={({ key }) => history.push(key)}
            items={BOOKING_SUB_ROUTES.map((r) => ({ key: r.key, label: r.label }))}
          />
        </div>
      )}

      <Content style={{ padding: '24px 32px' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 8,
            padding: 24,
            minHeight: 'calc(100vh - 200px)',
          }}
        >
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default BasicLayout;
```

- [ ] **Step 2: Verify dev server starts**

Run: `cd "D:\Projects\rbs-mock-up" && npm run dev`
Expected: Server starts on http://localhost:8000 (or 3000), page loads, top nav visible. If the page shows 404 (since no pages exist yet), that's expected — just confirm no runtime errors.

Stop the server (Ctrl+C) before proceeding.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/
git commit -m "feat(layout): add BasicLayout with top nav and booking sub-nav"
```

---

## Task 10: BookingSteps Component

**Files:**
- Create: `src/components/BookingSteps.tsx`

- [ ] **Step 1: Create `src/components/BookingSteps.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BookingSteps.tsx
git commit -m "feat(components): add BookingSteps wizard stepper"
```

---

## Task 11: RoomCard Component

**Files:**
- Create: `src/components/RoomCard.tsx`

- [ ] **Step 1: Create `src/components/RoomCard.tsx`**

```tsx
import React from 'react';
import { Card, Button, Typography, Space, Tag } from 'antd';
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/RoomCard.tsx
git commit -m "feat(components): add RoomCard with availability-aware Book button"
```

---

## Task 12: DayTimeline + RoomTimelineRow Components

**Files:**
- Create: `src/components/DayTimeline.tsx`
- Create: `src/components/RoomTimelineRow.tsx`

- [ ] **Step 1: Create `src/components/RoomTimelineRow.tsx`**

```tsx
import React from 'react';
import type { Booking } from '@/types';

interface Props {
  startHour?: number; // 9
  endHour?: number;   // 18
  bookings: Booking[];
  highlight?: { startTime: string; endTime: string };
  onBookingClick?: (b: Booking) => void;
  height?: number;
}

const HOURS = (start: number, end: number) => Array.from({ length: end - start }, (_, i) => start + i);

function timeToPercent(time: string, startHour: number, endHour: number): number {
  const [h, m] = time.split(':').map(Number);
  const minutes = h * 60 + m;
  const totalMinutes = (endHour - startHour) * 60;
  return ((minutes - startHour * 60) / totalMinutes) * 100;
}

const RoomTimelineRow: React.FC<Props> = ({
  startHour = 9,
  endHour = 18,
  bookings,
  highlight,
  onBookingClick,
  height = 60,
}) => {
  const hours = HOURS(startHour, endHour);

  return (
    <div
      style={{
        position: 'relative',
        height,
        background: '#fff',
        border: '1px solid #f0f0f0',
        borderRadius: 4,
      }}
    >
      {/* Hour gridlines */}
      {hours.map((h, idx) => (
        <div
          key={h}
          style={{
            position: 'absolute',
            left: `${(idx / (endHour - startHour)) * 100}%`,
            top: 0,
            bottom: 0,
            borderLeft: '1px dashed #e8e8e8',
          }}
        />
      ))}
      {/* Hour labels */}
      {hours.map((h, idx) => (
        <div
          key={`label-${h}`}
          style={{
            position: 'absolute',
            left: `${(idx / (endHour - startHour)) * 100}%`,
            top: 4,
            transform: 'translateX(2px)',
            fontSize: 11,
            color: '#999',
          }}
        >
          {h}:00
        </div>
      ))}
      {/* Bookings */}
      {bookings.map((b) => {
        const left = timeToPercent(b.startTime, startHour, endHour);
        const width =
          timeToPercent(b.endTime, startHour, endHour) - left;
        return (
          <div
            key={b.id}
            onClick={() => onBookingClick?.(b)}
            style={{
              position: 'absolute',
              left: `${left}%`,
              width: `${width}%`,
              top: 24,
              bottom: 8,
              background: '#e6f4ff',
              borderLeft: '3px solid #1677ff',
              borderRadius: 4,
              padding: '4px 6px',
              fontSize: 11,
              cursor: onBookingClick ? 'pointer' : 'default',
              overflow: 'hidden',
            }}
            title={`${b.startTime} - ${b.endTime}: ${b.title}`}
          >
            <div style={{ fontWeight: 500, color: '#1677ff' }}>{b.title}</div>
            <div style={{ color: '#888' }}>
              {b.startTime} - {b.endTime}
            </div>
          </div>
        );
      })}
      {/* Highlighted user range */}
      {highlight && (
        <div
          style={{
            position: 'absolute',
            left: `${timeToPercent(highlight.startTime, startHour, endHour)}%`,
            width: `${
              timeToPercent(highlight.endTime, startHour, endHour) -
              timeToPercent(highlight.startTime, startHour, endHour)
            }%`,
            top: 24,
            bottom: 8,
            background: '#1677ff',
            borderRadius: 4,
          }}
        />
      )}
    </div>
  );
};

export default RoomTimelineRow;
```

- [ ] **Step 2: Create `src/components/DayTimeline.tsx`**

```tsx
import React from 'react';
import RoomTimelineRow from './RoomTimelineRow';
import type { Booking, TimeSlot } from '@/types';

interface Props {
  bookedSlots: TimeSlot[];
  highlight?: { startTime: string; endTime: string };
  date: string;
  onBookingClick?: (b: Booking) => void;
}

const DayTimeline: React.FC<Props> = ({ bookedSlots, highlight, date, onBookingClick }) => {
  // Convert slots to pseudo-bookings for the row component
  const mockBookings: Booking[] = bookedSlots.map((s, idx) => ({
    id: s.bookingId || `slot-${idx}`,
    userId: '',
    roomId: '',
    date,
    startTime: s.startTime,
    endTime: s.endTime,
    title: s.status === 'buffer' ? 'Unavailable' : 'Booked',
    equipmentIds: [],
    status: 'approved',
    createdAt: '',
  }));

  return (
    <div style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
      <RoomTimelineRow
        bookings={mockBookings}
        highlight={highlight}
        onBookingClick={onBookingClick}
      />
    </div>
  );
};

export default DayTimeline;
```

- [ ] **Step 3: Commit**

```bash
git add src/components/DayTimeline.tsx src/components/RoomTimelineRow.tsx
git commit -m "feat(components): add DayTimeline and RoomTimelineRow"
```

---

## Task 13: Step 1 — Select Room Page

**Files:**
- Create: `src/pages/booking/room.tsx`

- [ ] **Step 1: Create `src/pages/booking/room.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import { DatePicker, Select, Switch, Space, Button, Row, Col, Typography } from 'antd';
import { LeftOutlined, RightOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { history } from 'umi';
import BookingSteps from '@/components/BookingSteps';
import RoomCard from '@/components/RoomCard';
import { listRooms } from '@/services/room';
import { useBookingDraft } from '@/hooks/useBookingDraft';
import type { RoomWithSlots } from '@/types';

const { Title } = Typography;

const RoomPage: React.FC = () => {
  const { draft, setDraft } = useBookingDraft();
  const [rooms, setRooms] = useState<RoomWithSlots[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Dayjs>(dayjs(draft.selectedDate));
  const [capacity, setCapacity] = useState<number | undefined>();
  const [availableOnly, setAvailableOnly] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await listRooms({
        date: date.format('YYYY-MM-DD'),
        type: 'Classroom',
        floor: '3F',
        capacity,
        availableOnly,
      });
      setRooms(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, capacity, availableOnly]);

  const handleBook = (room: RoomWithSlots) => {
    setDraft({
      selectedRoomId: room.id,
      selectedDate: date.format('YYYY-MM-DD'),
      startTime: undefined,
      endTime: undefined,
      title: undefined,
      remarks: undefined,
      equipmentSelections: [
        { type: 'Notebook', equipmentId: 'N100001' },
        { type: 'Notebook', equipmentId: 'N100002' },
        { type: 'Notebook', equipmentId: '' },
        { type: 'Notebook', equipmentId: '' },
        { type: 'Notebook', equipmentId: '' },
        { type: 'Notebook', equipmentId: '' },
      ],
    });
    history.push('/booking/details');
  };

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        Booking
      </Title>
      <BookingSteps current={0} />

      <div
        style={{
          background: '#fafafa',
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Button icon={<LeftOutlined />} />
        <DatePicker
          value={date}
          onChange={(d) => d && setDate(d)}
          format('dddd, DD MMMM YYYY')
          allowClear={false}
        />
        <Button icon={<RightOutlined />} />
        <Select
          value="Classroom"
          style={{ width: 160 }}
          options={[{ value: 'Classroom', label: 'Classroom' }]}
        />
        <Select
          value="3F"
          style={{ width: 100 }}
          options={[{ value: '3F', label: '3F' }]}
        />
        <Select
          placeholder="Capacity"
          value={capacity}
          onChange={setCapacity}
          allowClear
          style={{ width: 140 }}
          options={[
            { value: 20, label: '20' },
            { value: 30, label: '30' },
          ]}
        />
        <Space>
          Available:
          <Switch checked={availableOnly} onChange={setAvailableOnly} />
        </Space>
      </div>

      <Row gutter={[16, 16]} loading={loading}>
        {rooms.map((room) => (
          <Col key={room.id} xs={24} sm={12} md={8} lg={6}>
            <RoomCard room={room} onBook={() => handleBook(room)} />
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: 16, textAlign: 'center', color: '#999' }}>
        Total {rooms.length} items
      </div>
    </div>
  );
};

export default RoomPage;
```

- [ ] **Step 2: Verify in browser**

Run: `cd "D:\Projects\rbs-mock-up" && npm run dev`
Open http://localhost:8000 — page should redirect to `/booking/room` and show 4 room cards. C4's Book button should be disabled.
Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/booking/room.tsx
git commit -m "feat(booking): add Step 1 Select Room page"
```

---

## Task 14: Step 2 — Enter Booking Details Page

**Files:**
- Create: `src/pages/booking/details.tsx`

- [ ] **Step 1: Create `src/pages/booking/details.tsx`**

```tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Typography,
  Form,
  Select,
  Input,
  Button,
  Row,
  Col,
  Space,
  message,
} from 'antd';
import { Link, history } from 'umi';
import dayjs from 'dayjs';
import BookingSteps from '@/components/BookingSteps';
import DayTimeline from '@/components/DayTimeline';
import { getRoom } from '@/services/room';
import { listEquipment } from '@/services/equipment';
import { useBookingDraft } from '@/hooks/useBookingDraft';
import type { Equipment, RoomWithSlots, TimeSlot } from '@/types';

const { Title, Text } = Typography;

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
];

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

const DetailsPage: React.FC = () => {
  const { draft, setDraft } = useBookingDraft();
  const [form] = Form.useForm();
  const [room, setRoom] = useState<RoomWithSlots | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookedSlots, setBookedSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (!draft.selectedRoomId) {
      history.replace('/booking/room');
      return;
    }
    getRoom(draft.selectedRoomId, draft.selectedDate).then((r) => {
      setRoom(r);
      setBookedSlots(r.bookedSlots);
    });
    listEquipment().then(setEquipment);
    form.setFieldsValue({
      startTime: draft.startTime,
      endTime: draft.endTime,
      title: draft.title,
      remarks: draft.remarks,
    });
  }, [draft.selectedRoomId, draft.selectedDate, form]);

  const disabledTime = (kind: 'start' | 'end') => {
    return (time: string) => {
      if (kind === 'start') {
        return bookedSlots.some(
          (s) =>
            timeToMinutes(time) >= timeToMinutes(s.startTime) &&
            timeToMinutes(time) < timeToMinutes(s.endTime),
        );
      } else {
        const startVal = form.getFieldValue('startTime');
        if (!startVal) return false;
        if (timeToMinutes(time) <= timeToMinutes(startVal)) return true;
        return bookedSlots.some(
          (s) =>
            timeToMinutes(time) > timeToMinutes(s.startTime) &&
            timeToMinutes(time) <= timeToMinutes(s.endTime),
        );
      }
    };
  };

  const onValuesChange = (_: any, all: any) => {
    setDraft({
      startTime: all.startTime,
      endTime: all.endTime,
      title: all.title,
      remarks: all.remarks,
    });
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setDraft({
        startTime: values.startTime,
        endTime: values.endTime,
        title: values.title,
        remarks: values.remarks,
      });
      history.push('/booking/confirm');
    } catch {
      message.error('Please complete required fields');
    }
  };

  const equipmentByType = useMemo(() => {
    const map: Record<string, Equipment[]> = {};
    equipment.forEach((e) => {
      if (!map[e.type]) map[e.type] = [];
      map[e.type].push(e);
    });
    return map;
  }, [equipment]);

  if (!room) return null;

  return (
    <div>
      <BookingSteps current={1} />

      <Row gutter={16}>
        {/* Left: Room summary */}
        <Col xs={24} lg={6}>
          <Card
            cover={
              <div
                style={{
                  height: 160,
                  background: `url(${room.image}) center/cover`,
                }}
              />
            }
          >
            <Card.Meta
              title={room.name}
              description={
                <Space direction="vertical" size={4}>
                  <Text type="secondary">{room.floor}</Text>
                  <Text type="secondary">{room.capacity} Capacity</Text>
                </Space>
              }
            />
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <Link>How to go</Link>
            </div>
          </Card>
        </Col>

        {/* Middle: Form */}
        <Col xs={24} lg={12}>
          <Card title="Booking Details" style={{ marginBottom: 16 }}>
            <Form layout="vertical" form={form} onValuesChange={onValuesChange}>
              <Form.Item label="Start Time" name="startTime" rules={[{ required: true }]}>
                <Select
                  placeholder="Please select"
                  options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
                  disabled={disabledTime('start')}
                />
              </Form.Item>
              <Form.Item label="End Time" name="endTime" rules={[{ required: true }]}>
                <Select
                  placeholder="Please select"
                  options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
                  disabled={disabledTime('end')}
                />
              </Form.Item>
              <Form.Item label="Room Title" name="title" rules={[{ required: true }]}>
                <Input.TextArea rows={3} placeholder="Please enter" />
              </Form.Item>
              <Form.Item label="Remarks" name="remarks">
                <Input.TextArea rows={3} placeholder="Please enter" />
              </Form.Item>
            </Form>
          </Card>

          <Card title="Room Equipment">
            <Text strong>Fixed Equipment:</Text>
            <ul style={{ marginTop: 4 }}>
              {room.fixedEquipment.map((eq) => (
                <li key={eq}>{eq}</li>
              ))}
            </ul>
            <div style={{ marginTop: 12 }}>
              <Text strong>Equipment Request:</Text>
              <div style={{ marginTop: 8 }}>
                {draft.equipmentSelections.map((sel, idx) => (
                  <Row gutter={8} key={idx} style={{ marginBottom: 8 }}>
                    <Col span={8}>
                      <Select
                        value={sel.type}
                        style={{ width: '100%' }}
                        options={Object.keys(equipmentByType).map((t) => ({ value: t, label: t }))}
                        onChange={(v) => {
                          const next = [...draft.equipmentSelections];
                          next[idx] = { type: v, equipmentId: '' };
                          setDraft({ equipmentSelections: next });
                        }}
                        placeholder="Please select"
                      />
                    </Col>
                    <Col span={16}>
                      <Select
                        value={sel.equipmentId || undefined}
                        style={{ width: '100%' }}
                        options={(equipmentByType[sel.type] || []).map((e) => ({
                          value: e.id,
                          label: e.name,
                        }))}
                        onChange={(v) => {
                          const next = [...draft.equipmentSelections];
                          next[idx] = { type: sel.type, equipmentId: v };
                          setDraft({ equipmentSelections: next });
                        }}
                        placeholder="Please select"
                      />
                    </Col>
                  </Row>
                ))}
                <Space>
                  <Button onClick={() => setDraft({ equipmentSelections: [] })}>Reset</Button>
                  <Button
                    type="link"
                    onClick={() =>
                      setDraft({
                        equipmentSelections: [
                          ...draft.equipmentSelections,
                          { type: 'Notebook', equipmentId: '' },
                        ],
                      })
                    }
                  >
                    + Add Row
                  </Button>
                </Space>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right: Timeline */}
        <Col xs={24} lg={6}>
          <Card title={dayjs(draft.selectedDate).format('dddd, DD MMMM YYYY')}>
            <DayTimeline
              bookedSlots={bookedSlots}
              highlight={
                draft.startTime && draft.endTime
                  ? { startTime: draft.startTime, endTime: draft.endTime }
                  : undefined
              }
              date={draft.selectedDate}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => history.push('/booking/room')}>Back</Button>
        <Button type="primary" onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default DetailsPage;
```

- [ ] **Step 2: Verify in browser**

Run: `cd "D:\Projects\rbs-mock-up" && npm run dev`
Open http://localhost:8000/booking/details — should redirect to Step 1 if no room selected. After selecting a room, Step 2 should show with form, equipment list, and timeline. The 09:00–12:30 slot should be disabled in Start Time if the room is C1.
Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/booking/details.tsx
git commit -m "feat(booking): add Step 2 Enter Booking Details page"
```

---

## Task 15: Step 3 — Confirm Page

**Files:**
- Create: `src/pages/booking/confirm.tsx`

- [ ] **Step 1: Create `src/pages/booking/confirm.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import { Card, Button, Descriptions, Tag, message } from 'antd';
import { history } from 'umi';
import dayjs from 'dayjs';
import BookingSteps from '@/components/BookingSteps';
import { getRoom } from '@/services/room';
import { createBooking } from '@/services/booking';
import { useBookingDraft } from '@/hooks/useBookingDraft';
import type { RoomWithSlots } from '@/types';

const ConfirmPage: React.FC = () => {
  const { draft, setDraft } = useBookingDraft();
  const [room, setRoom] = useState<RoomWithSlots | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!draft.selectedRoomId || !draft.startTime || !draft.endTime || !draft.title) {
      history.replace('/booking/details');
      return;
    }
    getRoom(draft.selectedRoomId, draft.selectedDate).then(setRoom);
  }, [draft.selectedRoomId, draft.selectedDate, draft.startTime, draft.endTime, draft.title]);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const booking = await createBooking({
        roomId: draft.selectedRoomId!,
        date: draft.selectedDate,
        startTime: draft.startTime!,
        endTime: draft.endTime!,
        title: draft.title!,
        remarks: draft.remarks,
        equipmentIds: draft.equipmentSelections
          .map((s) => s.equipmentId)
          .filter(Boolean),
      });
      setDraft({ lastCreatedBookingId: booking.id });
      history.push('/booking/success');
    } catch (e: any) {
      message.error(e?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (!room) return null;

  return (
    <div>
      <BookingSteps current={2} />

      <Card title="Booking Room Details" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <div
            style={{
              width: 280,
              height: 160,
              background: `url(${room.image}) center/cover`,
              borderRadius: 8,
              flexShrink: 0,
            }}
          />
          <Descriptions column={1} style={{ flex: 1 }}>
            <Descriptions.Item label="Room Title">
              <strong>{draft.title}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Room Type">{room.type}</Descriptions.Item>
            <Descriptions.Item label="Room">{room.id}</Descriptions.Item>
            <Descriptions.Item label="Location">{room.floor}</Descriptions.Item>
            <Descriptions.Item label="Date">
              {dayjs(draft.selectedDate).format('dddd, DD MMMM YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Time">
              {draft.startTime} - {draft.endTime}
            </Descriptions.Item>
            <Descriptions.Item label="Max Capacity">{room.capacity}</Descriptions.Item>
            <Descriptions.Item label="Fixed Equipment">
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {room.fixedEquipment.map((eq) => (
                  <li key={eq}>{eq}</li>
                ))}
              </ul>
            </Descriptions.Item>
            <Descriptions.Item label="Equipment Request">
              {draft.equipmentSelections
                .filter((s) => s.equipmentId)
                .map((s) => {
                  const item = s.equipmentId; // equipment lookup not needed in mock
                  return (
                    <Tag color="blue" key={s.equipmentId} style={{ marginBottom: 4 }}>
                      {s.type} - {item}
                    </Tag>
                  );
                })}
            </Descriptions.Item>
            {draft.remarks && (
              <Descriptions.Item label="Remarks">{draft.remarks}</Descriptions.Item>
            )}
          </Descriptions>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => history.push('/booking/details')}>Back</Button>
        <Button type="primary" onClick={handleConfirm} loading={submitting}>
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default ConfirmPage;
```

- [ ] **Step 2: Verify in browser**

Run dev server. Navigate to `/booking/confirm` after completing Step 2. Should show read-only summary with all entered data.
Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/booking/confirm.tsx
git commit -m "feat(booking): add Step 3 Confirm page"
```

---

## Task 16: Step 4 — Success Page

**Files:**
- Create: `src/pages/booking/success.tsx`

- [ ] **Step 1: Create `src/pages/booking/success.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, message, Tag, Space } from 'antd';
import { history } from 'umi';
import dayjs from 'dayjs';
import BookingSteps from '@/components/BookingSteps';
import { getRoom } from '@/services/room';
import { listMyBookings } from '@/services/booking';
import { useBookingDraft } from '@/hooks/useBookingDraft';
import type { Booking, RoomWithSlots } from '@/types';

const { Title, Text } = Typography;

const STATUS_COLOR: Record<string, string> = {
  pending: 'gold',
  approved: 'blue',
  waitlisted: 'magenta',
  rejected: 'red',
  revoked: 'orange',
};

const SuccessPage: React.FC = () => {
  const { draft, resetDraft } = useBookingDraft();
  const [room, setRoom] = useState<RoomWithSlots | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!draft.lastCreatedBookingId) {
      history.replace('/booking/room');
      return;
    }
    listMyBookings().then((list) => {
      const found = list.find((b) => b.id === draft.lastCreatedBookingId);
      if (found) {
        setBooking(found);
        return getRoom(found.roomId, found.date).then(setRoom);
      }
      return null;
    });
  }, [draft.lastCreatedBookingId]);

  if (!booking || !room) return null;

  return (
    <div>
      <BookingSteps current={3} />

      <Title level={4} style={{ textAlign: 'center', marginBottom: 32 }}>
        Your booking has been successfully made. Kindly check the booking status in My
        Reservation - Bookings Agenda. Thank you.
      </Title>

      <Card
        title="Booking Confirmed"
        extra={
          <Button
            type="text"
            onClick={() => {
              resetDraft();
              history.push('/booking/room');
            }}
          >
            ⋯
          </Button>
        }
      >
        <div style={{ display: 'flex', gap: 24 }}>
          <div
            style={{
              width: 280,
              height: 160,
              background: `url(${room.image}) center/cover`,
              borderRadius: 8,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <Tag color="red" style={{ marginBottom: 8 }}>
              Booking ID : {booking.id}
            </Tag>
            <Title level={5} style={{ marginTop: 0 }}>
              {booking.title}
            </Title>
            <Space direction="vertical" size={4}>
              <a>Classroom - {room.id}</a>
              <Text type="secondary">⏱ {booking.startTime} - {booking.endTime}</Text>
              <Text type="secondary">📍 {room.floor}</Text>
              <Text type="secondary">👤 {room.capacity} Capacity</Text>
              <Text>
                <Tag color={STATUS_COLOR[booking.status]}>{booking.status}</Tag>
              </Text>
            </Space>
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Button type="primary" onClick={() => history.push('/my-reservation')}>
          Go to Bookings Agenda
        </Button>
      </div>
    </div>
  );
};

export default SuccessPage;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/booking/success.tsx
git commit -m "feat(booking): add Step 4 Success page"
```

---

## Task 17: Room Booking View Page

**Files:**
- Create: `src/pages/booking/list.tsx`

- [ ] **Step 1: Create `src/pages/booking/list.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import { DatePicker, Select, Button, Space, Typography, Row, Col, message } from 'antd';
import { LeftOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import RoomTimelineRow from '@/components/RoomTimelineRow';
import { listRooms } from '@/services/room';
import { listBookings } from '@/services/booking';
import type { Booking, RoomWithSlots } from '@/types';

const { Title, Text } = Typography;

const ListPage: React.FC = () => {
  const [date, setDate] = useState<Dayjs>(dayjs('2026-02-10'));
  const [rooms, setRooms] = useState<RoomWithSlots[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const [r, b] = await Promise.all([
        listRooms({ date: date.format('YYYY-MM-DD'), type: 'Classroom', floor: '3F' }),
        listBookings({ date: date.format('YYYY-MM-DD') }),
      ]);
      setRooms(r);
      setBookings(b);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [date]);

  const handleBookingClick = (b: Booking) => {
    message.info(`${b.title} (${b.startTime} - ${b.endTime})`);
  };

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        Booking
      </Title>

      <div
        style={{
          background: '#fafafa',
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Button type="primary">Today</Button>
        <Button icon={<LeftOutlined />} />
        <DatePicker
          value={date}
          onChange={(d) => d && setDate(d)}
          format('dddd, DD MMMM YYYY')
          allowClear={false}
        />
        <Button icon={<RightOutlined />} />
        <Select value="Classroom" style={{ width: 160 }} options={[{ value: 'Classroom', label: 'Classroom' }]} />
        <Select value="3F" style={{ width: 100 }} options={[{ value: '3F', label: '3F' }]} />
        <Select placeholder="Room" style={{ width: 140 }} allowClear />
        <Button type="primary" icon={<SearchOutlined />} />
      </div>

      {loading && <Text>Loading...</Text>}

      <Row gutter={[0, 12]}>
        {rooms.map((room) => {
          const roomBookings = bookings.filter((b) => b.roomId === room.id);
          return (
            <Col key={room.id} span={24}>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <div
                  style={{
                    width: 180,
                    padding: 12,
                    background: '#fff',
                    border: '1px solid #f0f0f0',
                    borderRadius: 4,
                    marginRight: 8,
                  }}
                >
                  <Title level={5} style={{ margin: 0 }}>
                    {room.id}
                  </Title>
                  <Tag color="blue" style={{ marginTop: 4 }}>
                    {room.type}
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">📍 {room.floor}</Text>
                  </div>
                  <div>
                    <Text type="secondary">👤 {room.capacity} Capacity</Text>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <RoomTimelineRow
                    bookings={roomBookings}
                    onBookingClick={handleBookingClick}
                  />
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default ListPage;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/booking/list.tsx
git commit -m "feat(booking): add Room Booking View (Gantt) page"
```

---

## Task 18: My Reservation Stub Page

**Files:**
- Create: `src/pages/my-reservation/index.tsx`

- [ ] **Step 1: Create `src/pages/my-reservation/index.tsx`**

```tsx
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
    { title: 'Time', dataIndex: 'time', width: 160, render: (_, r) => `${r.startTime} - ${r.endTime}` },
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
            label: <span><span style={{ color: '#ff4d4f' }}>●</span> Message</span>,
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
        request={async (params) => {
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/my-reservation/
git commit -m "feat(my-reservation): add stub Bookings Agenda page with ProTable"
```

---

## Task 19: Wrap Booking Routes with Provider + 404 Page

**Files:**
- Modify: `.umirc.ts` (add wrapper layout for `/booking/*`)

- [ ] **Step 1: Add 404 page**

Create `src/pages/404.tsx`:

```tsx
import React from 'react';
import { Result, Button } from 'antd';
import { history } from 'umi';

const NotFoundPage: React.FC = () => (
  <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={
      <Button type="primary" onClick={() => history.push('/booking/room')}>
        Back to Booking
      </Button>
    }
  />
);

export default NotFoundPage;
```

- [ ] **Step 2: Add a wrapper for the booking flow that injects the BookingProvider**

Umi 4 supports `wrappers` in `.umirc.ts`. Replace `.umirc.ts` with:

```ts
import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    { path: '/', redirect: '/booking/room' },
    { path: '/booking', redirect: '/booking/room' },
    { path: '/booking/room', component: 'booking/room', wrappers: ['@/wrappers/BookingFlow'] },
    { path: '/booking/details', component: 'booking/details', wrappers: ['@/wrappers/BookingFlow'] },
    { path: '/booking/confirm', component: 'booking/confirm', wrappers: ['@/wrappers/BookingFlow'] },
    { path: '/booking/success', component: 'booking/success', wrappers: ['@/wrappers/BookingFlow'] },
    { path: '/booking/list', component: 'booking/list' },
    { path: '/my-reservation', component: 'my-reservation/index' },
    { path: '*', component: '404' },
  ],
  layout: { name: 'BasicLayout', locale: false },
  antd: {},
  mock: {},
  npmClient: 'npm',
  define: {
    'process.env.NODE_ENV': 'development',
  },
});
```

- [ ] **Step 3: Create `src/wrappers/BookingFlow.tsx`**

```tsx
import React from 'react';
import { BookingProvider } from '@/context/BookingContext';

const BookingFlow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BookingProvider>{children}</BookingProvider>
);

export default BookingFlow;
```

- [ ] **Step 4: Verify route guards work**

Run dev server. Try to access `/booking/details` directly without going through Step 1 — should redirect to `/booking/room` (handled in `details.tsx` useEffect).
Stop the server.

- [ ] **Step 5: Commit**

```bash
git add src/pages/404.tsx src/wrappers/BookingFlow.tsx .umirc.ts
git commit -m "feat(routing): add 404 page and BookingProvider wrapper for booking flow"
```

---

## Task 20: End-to-End Smoke Test

**Files:** None (verification only)

- [ ] **Step 1: Start the dev server**

Run: `cd "D:\Projects\rbs-mock-up" && npm run dev`
Expected: Server starts without compile errors.

- [ ] **Step 2: Walk through the full wizard**

Manual checklist:

1. Open `http://localhost:8000` → redirects to `/booking/room`.
2. **Step 1:** 4 room cards visible. C4's "Book" button is disabled. Click "Book" on C1.
3. **Step 2:** Form is shown. Try selecting 09:00 as Start Time — should be disabled (conflicts with the 9:00–12:30 mock booking). Select 14:00 as start. Enter a Room Title. Click Next.
4. **Step 3:** Confirm page shows all entered data. Click Confirm.
5. **Step 4:** "Your booking has been successfully made." message appears. Status shows "Pending". Click "Go to Bookings Agenda".
6. **My Reservation:** The new booking appears at the top of the table.
7. **Room Booking View:** Navigate via the sub-nav. The new 14:00–17:30 booking on C1 should be visible alongside the existing 9:00–12:30 booking.
8. **Route guard:** Open a new tab and navigate directly to `/booking/confirm` — should redirect to `/booking/details`, which then redirects to `/booking/room` (no draft).

- [ ] **Step 3: Stop the server**

```bash
# Ctrl+C in the terminal
```

- [ ] **Step 4: Commit any final fixes**

```bash
git add .
git commit -m "chore: smoke test passed" --allow-empty
```

---

## Self-Review Checklist (run before declaring done)

- [ ] All 20 tasks completed
- [ ] `npm run dev` runs without errors
- [ ] All 5 mockup screens (`2-Bookings_Grid-*.png`) match in look-and-feel
- [ ] Route guards prevent direct access to protected steps
- [ ] Time conflicts are disabled in Step 2 dropdowns
- [ ] Created booking shows up in My Reservation stub
- [ ] Room Booking View shows existing + new bookings
- [ ] No console errors during the smoke test
- [ ] Git history is clean with one commit per task
