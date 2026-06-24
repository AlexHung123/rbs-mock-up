# Room Booking System — Booking Flow Design

**Date:** 2026-06-24
**Status:** Approved for implementation planning
**Scope:** Booking 4-step wizard + Room Booking View + minimal My Reservation stub

---

## 1. Goal & Scope

Build a demo of a Room Booking System frontend based on the mockup designs in
`Room booking system/`. The implementation covers the user-facing booking
journey end-to-end, plus two supporting pages.

### In scope
- **Booking 4-step wizard** (`/booking/room` → `/booking/details` → `/booking/confirm` → `/booking/success`)
- **Room Booking View** (`/booking/list`) — Gantt-style day view of room availability
- **My Reservation stub** (`/my-reservation`) — simple ProTable listing of mock bookings, reached from Step 4 "Go to Bookings Agenda"
- **Mock API** (Umi built-in `mock/`) with in-memory data only
- **Top navigation layout** matching mockup (My Reservation, Booking, Management, System; only Booking sub-items active)

### Out of scope (deferred)
- Login / authentication / real user identity
- Management module (Booking List, Equipment Inventory, Reports)
- System module (Users, Divisions, Policies, Holidays, System Params)
- My Reservation full feature set (Calendar, History tabs)
- localStorage / URL / server-side persistence — mock data resets on page refresh
- Unit / E2E tests (may be added later as a follow-up)

---

## 2. Tech Stack

| Concern | Choice |
|---|---|
| Framework | Umi 4 + React 18 (standard Umi; can be swapped to Umi Max if needed) |
| Language | TypeScript |
| UI library | Ant Design 5 |
| Pro components | `@ant-design/pro-components` 2.x (ProTable, ProForm, ProCard, Steps, Descriptions) |
| State | React Context (`BookingContext`) for cross-step booking draft data |
| Date/time | dayjs (built into Ant Design) |
| Mock | Umi built-in `mock/` folder (no MSW, no Express) |
| Router | Umi file-based routes |
| Persistence | None — all data in memory, resets on refresh |

No backend is built. All API calls resolve to in-memory mock handlers.

---

## 3. Project Structure

```
rbs-mock-up/
├── .umirc.ts                         # Umi config (routes, mock, antd plugin)
├── package.json
├── tsconfig.json
├── mock/
│   ├── _db.ts                        # In-memory data store (rooms, equipment, bookings)
│   ├── rooms.ts                      # GET /api/rooms, GET /api/rooms/:id
│   ├── equipment.ts                  # GET /api/equipment
│   └── bookings.ts                   # GET/POST /api/bookings, /api/bookings/me
├── src/
│   ├── layouts/
│   │   └── BasicLayout.tsx           # Top nav + sub-nav + content area
│   ├── pages/
│   │   ├── booking/
│   │   │   ├── room.tsx              # Step 1 — Select Room
│   │   │   ├── details.tsx           # Step 2 — Enter Booking Details
│   │   │   ├── confirm.tsx           # Step 3 — Confirm
│   │   │   ├── success.tsx           # Step 4 — Awaiting Approval
│   │   │   └── list.tsx              # Room Booking View (Gantt)
│   │   └── my-reservation/
│   │       └── index.tsx             # Bookings Agenda stub (ProTable)
│   ├── components/
│   │   ├── BookingSteps.tsx          # Top stepper (4 steps)
│   │   ├── RoomCard.tsx              # Room card on Step 1
│   │   ├── DayTimeline.tsx           # Day timeline on Step 2
│   │   └── RoomTimelineRow.tsx       # Single row in Room Booking View
│   ├── context/
│   │   └── BookingContext.tsx        # Draft booking state across steps
│   ├── services/
│   │   ├── room.ts                   # request wrappers
│   │   ├── equipment.ts
│   │   └── booking.ts
│   ├── hooks/
│   │   └── useBookingDraft.ts        # Read/write BookingContext with route-guard helpers
│   └── types/
│       └── index.ts                  # Shared TypeScript types
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-06-24-room-booking-system-design.md
```

---

## 4. Data Model

```ts
// src/types/index.ts

export type RoomType = 'Classroom';
export type Floor = '3F';

export interface Room {
  id: string;                    // 'C1'
  name: string;                  // 'Classroom - C1'
  type: RoomType;
  floor: Floor;
  capacity: number;              // 20 or 30
  image: string;                 // mock image URL
  description: string;
  fixedEquipment: string[];      // ['Microphone', 'Project system', ...]
  status: 'available' | 'maintenance';
}

export type EquipmentType = 'Notebook' | 'Microphone' | 'Television' | 'Projector';
export type EquipmentStatus = 'available' | 'reserved' | 'maintenance';

export interface Equipment {
  id: string;                    // 'N100001'
  type: EquipmentType;
  name: string;                  // 'Lenovo ThinkPad X1'
  status: EquipmentStatus;
  assignedRoomId?: string;       // storage / current room
  currentBookingId?: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'revoked' | 'waitlisted';

export interface Booking {
  id: string;                    // '100201'
  userId: string;                // 'mock-user-1'
  roomId: string;
  date: string;                  // '2026-02-10'
  startTime: string;             // '09:00'
  endTime: string;               // '12:30'
  title: string;
  remarks?: string;
  equipmentIds: string[];
  status: BookingStatus;
  createdAt: string;             // ISO
}

export interface TimeSlot {
  startTime: string;             // '09:00'
  endTime: string;               // '12:30'
  bookingId?: string;
  status: 'available' | 'booked' | 'buffer';
}
```

---

## 5. Mock API

All endpoints under `/api`. All responses are JSON. No auth headers.

| Method | Path | Query / Body | Response | Used by |
|---|---|---|---|---|
| GET | `/api/rooms` | `date`, `type`, `floor`, `capacity`, `availableOnly` | `Room[]` (with `bookedSlots: TimeSlot[]` per room) | Step 1, Room Booking View |
| GET | `/api/rooms/:id` | `date` | `Room & { bookedSlots: TimeSlot[] }` | Step 2 |
| GET | `/api/equipment` | `type`, `availableOnly` | `Equipment[]` | Step 2 dropdowns |
| GET | `/api/bookings` | `date`, `roomId`, `status` | `Booking[]` | Room Booking View, My Reservation |
| POST | `/api/bookings` | `Omit<Booking, 'id' \| 'status' \| 'createdAt'>` | `Booking` (assigned id, status='pending') | Step 3 → Step 4 |
| GET | `/api/bookings/me` | `status`, `date`, `roomId` | `Booking[]` (filtered to current user) | My Reservation stub |

### Mock data scale (per user decision: **精簡**)
- **Rooms:** 4 classrooms — C1, C2 (capacity 20), C3, C4 (capacity 30). All Classroom, 3F.
- **Equipment:** 5 items — 2× Notebook (Lenovo ThinkPad X1), 1× Microphone (MICPRO AT-70W UHF ANTENNAS), 1× Television (Interactive whiteboards), 1× Projector.
- **Bookings:** 5 historical records with ids 100201–100205, covering statuses approved / waitlisted / pending / rejected. One booking on 2026-02-10 in C1 (9:00–12:30) that creates a conflict for Step 2 demos.

The `mock/_db.ts` exports a singleton store with arrays and helper functions
(`listRooms`, `getRoomById`, `createBooking`, `listBookingsByUser`, …). All
mock handlers read/write from this store. Data is in-memory; refresh resets it.

---

## 6. Routing

File-based routes under `src/pages/`. `.umirc.ts` defines top-level redirects.

| Path | Page | Notes |
|---|---|---|
| `/` | redirect → `/booking/room` | Default landing |
| `/booking` | redirect → `/booking/room` | |
| `/booking/room` | `pages/booking/room.tsx` | Step 1 |
| `/booking/details` | `pages/booking/details.tsx` | Step 2 — guarded |
| `/booking/confirm` | `pages/booking/confirm.tsx` | Step 3 — guarded |
| `/booking/success` | `pages/booking/success.tsx` | Step 4 — guarded |
| `/booking/list` | `pages/booking/list.tsx` | Room Booking View |
| `/my-reservation` | `pages/my-reservation/index.tsx` | Stub |

### Route guards
Implemented in a layout wrapper around the wizard pages:

- `/booking/details`: requires `selectedRoomId` and `selectedDate` in context. Otherwise redirect to `/booking/room`.
- `/booking/confirm`: requires `startTime`, `endTime`, `title`. Otherwise redirect to `/booking/details`.
- `/booking/success`: requires `lastCreatedBookingId` in context. Otherwise redirect to `/booking/room`.

A small `useBookingDraft()` hook exposes `{ draft, setDraft, resetDraft, isStepReady }` so each guard is one line.

---

## 7. Page-by-Page Specification

### 7.1 Top Layout (`layouts/BasicLayout.tsx`)
- Logo + "Room Booking System" on the left
- Top nav items: **My Reservation** (with red dot indicating mock message), **Booking** (active), **Management** (disabled, greyed), **System** (disabled)
- "Close and back to iTMS" button on the right
- Sub-nav under Booking: **Make Reservation** | **Room Booking View** (active state highlights current sub-route)
- Content area: white card with `padding: 24px`

### 7.2 Step 1: Select Room — `/booking/room`
- **Header:** `BookingSteps` showing step 1 active
- **Filter bar:** date picker (default = today), Room Type select (Classroom), Floor select (3F), Capacity select (Any/20/30), "Available only" switch
- **Grid of `RoomCard`:** 4 cards. Each card shows:
  - Room image (16:9, rounded)
  - Name (e.g., "Classroom - C1")
  - Description paragraph
  - Location (📍 3F)
  - Capacity (👤 20)
  - Fixed Equipment bullet list
  - "Book" button (right-aligned, primary color)
- **C4 is unavailable** (already booked on the demo date). Its "Book" button is disabled with tooltip "Room is unavailable on this date".
- Clicking "Book" on an available room: `setDraft({ selectedRoomId, selectedDate })` → `history.push('/booking/details')`

### 7.3 Step 2: Enter Booking Details — `/booking/details`
- **Header:** `BookingSteps` showing step 2 active
- **Three-column layout:**
  - **Left:** Selected room summary card (image, name, location, capacity, "How to go" link)
  - **Middle:** Form
    - **Booking Details** card: Start Time (Select, 30-min slots 09:00–17:30), End Time (Select), Room Title (TextArea, required), Remarks (TextArea, optional)
    - **Room Equipment** card: Fixed Equipment (read-only list) + Equipment Request (dynamic list of 6 default rows; first 2 pre-filled with `{ type: 'Notebook', equipmentId: 'N100001' }` and `{ type: 'Notebook', equipmentId: 'N100002' }`). Each row has a Type select and an Item select (cascading). "Reset" and "+ Add Row" controls at the bottom.
  - **Right:** `DayTimeline` for the selected date showing 9:00–18:00 in 30-min rows. Existing bookings are filled blue blocks. The user's currently selected start–end range is shown as a darker blue overlay. Grey striped pattern = buffer/unavailable.
- **Validation:**
  - Start/End disabled if they overlap an existing booking in this room
  - End must be > Start
  - Room Title required
  - "Next" disabled until all required fields are valid
- **Footer:** "Back" (→ `/booking/room`) and "Next" (→ `/booking/confirm`)

### 7.4 Step 3: Confirm — `/booking/confirm`
- **Header:** `BookingSteps` showing step 3 active
- **Read-only summary** using `ProDescriptions`:
  - Room (image + name)
  - Date, Start–End time
  - Room Title, Remarks
  - Equipment Request as blue Tag chips
- **Footer:** "Back" (→ `/booking/details`) and "Confirm" (primary, → calls `POST /api/bookings` then `history.push('/booking/success')`)

### 7.5 Step 4: Awaiting Approval — `/booking/success`
- `BookingSteps` showing all 4 steps complete
- Centered message: "Your booking has been successfully made. Kindly check the booking status in My Reservation - Bookings Agenda. Thank you."
- **Booking Confirmed card** showing the newly created booking with status `pending` (yellow dot)
- "Go to Bookings Agenda" button (primary, right-aligned) → `/my-reservation`

### 7.6 Room Booking View — `/booking/list`
- Sub-nav now shows **Room Booking View** active
- **Filter bar:** date, Room Type, Floor, Room (Select), Search button
- **Gantt-style list:** one row per room. Each row is a horizontal timeline from 09:00 to 18:00 with hour gridlines. Bookings render as blue blocks positioned and sized by start/end time. A "›" button on the right edge indicates more bookings (mocked as scroll affordance).
- Click a booking block → drawer or alert showing its details (kept simple; no edit on this page)

### 7.7 My Reservation (stub) — `/my-reservation`
- "Close and back to iTMS" stays in the top-right
- Title: "My Reservation"
- Tabs: **Message** (placeholder empty state), **Bookings Agenda** (active), **Calendar**, **History** (all four visible but only Bookings Agenda renders content; the others are disabled placeholders matching the mockup nav)
- `ProTable` with columns: ID, Date, Time, Room, Meeting Title, Status (colored dot + label), Action (Edit button disabled)
- Filters: Status select, Date range, search box
- Pagination 10/page

---

## 8. State Management

### `BookingContext`
A single React Context provides the booking draft to all wizard pages.

```ts
interface BookingDraft {
  selectedRoomId?: string;
  selectedDate: string;                 // 'YYYY-MM-DD'
  startTime?: string;                    // 'HH:mm'
  endTime?: string;
  title?: string;
  remarks?: string;
  equipmentSelections: { type: EquipmentType; equipmentId: string }[];
  lastCreatedBookingId?: string;         // set by Step 3 confirm
}

interface BookingContextValue {
  draft: BookingDraft;
  setDraft: (patch: Partial<BookingDraft>) => void;
  resetDraft: () => void;
  isStepReady: (step: 1 | 2 | 3 | 4) => boolean;
}
```

The context is provided at the layout level for the `/booking/*` routes.
The `useBookingDraft()` hook in `src/hooks/` encapsulates read/write and exposes `isStepReady` for guards.

### Why Context (not Zustand)
Per user choice (option B), state is local to the booking flow. React Context is sufficient, adds no dependency, and the scope is small enough that the boilerplate of a state library isn't justified.

---

## 9. Service Layer

`src/services/{room,equipment,booking}.ts` export typed wrappers around Umi's `request`. They are the only place that calls the mock API. Components import these services — no raw `fetch`/`request` in components.

```ts
// src/services/booking.ts
import { request } from 'umi'; // Umi 4 (or '@umijs/max' if using Umi Max)
import type { Booking, BookingDraftPayload } from '@/types';

export async function createBooking(payload: BookingDraftPayload) {
  return request<Booking>('/api/bookings', { method: 'POST', data: payload });
}

export async function listMyBookings(params?: { status?: Booking['status']; date?: string }) {
  return request<Booking[]>('/api/bookings/me', { params });
}

// … similar for rooms, equipment
```

---

## 10. Validation & Edge Cases

- **Past dates:** `DatePicker.disabledDate` blocks dates before today.
- **Time conflict in Step 2:** Start/End Select options are filtered server-side (mock) and re-validated client-side. Conflicting ranges are disabled in the dropdown.
- **End ≤ Start:** "Next" disabled.
- **Required field Room Title:** form-level `rules: [{ required: true }]`.
- **Equipment dropdowns cascade:** Changing Type filters the Item dropdown to items of that type whose status is `available`.
- **No rooms available:** Friendly empty state with "Try a different date".
- **No bookings yet:** "No bookings" placeholder in My Reservation.
- **Mock reset on refresh:** Documented in the README; not surfaced to user as an error.

---

## 11. Out-of-Scope Items (Explicit)

- Authentication, login, role-based routing
- The Management module (Booking List approval, Equipment Inventory CRUD, Reports)
- The System module (Users, Divisions, Policies, Holidays, System Params)
- Full My Reservation (Calendar Day/Week/Month, History table)
- Form field i18n — all UI text in English
- localStorage / IndexedDB / server persistence
- Unit tests, integration tests, E2E tests
- CI/CD configuration

These can each become their own design + plan in a follow-up cycle.

---

## 12. Open Questions

None at design time. All clarifications resolved during brainstorming:

| # | Question | Decision |
|---|---|---|
| Q1 | Scope | C — Booking 4-step wizard + Room Booking View |
| Q2 | Data lifecycle | A — In-memory only |
| Q3 | End-of-flow destination | A — Navigate to My Reservation stub |
| Q4 | Mock data scale | A — 4 rooms, 5 equipment, 5 historical bookings |
| Q5 | Wizard architecture | B — Multi-route wizard |

---

## 13. Success Criteria

- `npm run dev` (Umi dev server) starts cleanly with no console errors.
- All 5 wizard screens render and match the mockups visually.
- Filter changes on Step 1 re-query the mock and update the room grid.
- Time conflict is enforced in Step 2 (overlapping times are disabled).
- Confirming Step 3 creates a new booking visible in Step 4 and in the My Reservation stub.
- Room Booking View shows the existing booking on C1 (9:00–12:30) on the default date.
- Navigating to `/booking/details` directly without selecting a room redirects to `/booking/room`.
- Page refresh resets the mock data (no errors).
