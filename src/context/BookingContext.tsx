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
