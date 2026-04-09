import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Profile,
  WorkOrderWithDetails,
  DashboardStats,
} from "@/types";

interface AppState {
  // Auth state
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;

  // Active work order state
  activeWorkOrder: WorkOrderWithDetails | null;
  setActiveWorkOrder: (workOrder: WorkOrderWithDetails | null) => void;
  updateActiveWorkOrder: (updates: Partial<WorkOrderWithDetails>) => void;

  // Timer state
  timerStart: number | null;
  timerPauseStart: number | null;
  totalPausedTime: number;
  isPaused: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => { duration: number; pausedTime: number };
  resetTimer: () => void;

  // Dashboard stats (cached)
  dashboardStats: DashboardStats | null;
  setDashboardStats: (stats: DashboardStats | null) => void;

  // Pending photos (for offline support)
  pendingPhotos: Array<{
    id: string;
    workOrderId: string;
    type: string;
    file: File;
    timestamp: number;
  }>;
  addPendingPhoto: (photo: {
    id: string;
    workOrderId: string;
    type: string;
    file: File;
  }) => void;
  removePendingPhoto: (id: string) => void;
  clearPendingPhotos: (workOrderId: string) => void;

  // Network status
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  // Language preference
  locale: string;
  setLocale: (locale: string) => void;

  // Reset all state
  reset: () => void;
}

const initialTimerState = {
  timerStart: null,
  timerPauseStart: null,
  totalPausedTime: 0,
  isPaused: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth state
      profile: null,
      setProfile: (profile) => set({ profile }),

      // Active work order
      activeWorkOrder: null,
      setActiveWorkOrder: (workOrder) =>
        set({
          activeWorkOrder: workOrder,
          ...(workOrder ? { timerStart: Date.now() } : { timerStart: null }),
        }),
      updateActiveWorkOrder: (updates) =>
        set((state) => ({
          activeWorkOrder: state.activeWorkOrder
            ? { ...state.activeWorkOrder, ...updates }
            : null,
        })),

      // Timer
      ...initialTimerState,
      startTimer: () =>
        set({
          timerStart: Date.now(),
          isPaused: false,
          totalPausedTime: 0,
        }),
      pauseTimer: () =>
        set((state) => ({
          timerPauseStart: Date.now(),
          isPaused: true,
        })),
      resumeTimer: () =>
        set((state) => ({
          totalPausedTime: state.totalPausedTime + (Date.now() - (state.timerPauseStart || 0)),
          timerPauseStart: null,
          isPaused: false,
        })),
      stopTimer: () => {
        const state = get();
        const now = Date.now();
        const totalPausedTime = state.isPaused
          ? state.totalPausedTime + (now - (state.timerPauseStart || 0))
          : state.totalPausedTime;
        const duration = now - (state.timerStart || 0) - totalPausedTime;
        return { duration, pausedTime: totalPausedTime };
      },
      resetTimer: () => set(initialTimerState),

      // Dashboard
      dashboardStats: null,
      setDashboardStats: (stats) => set({ dashboardStats: stats }),

      // Pending photos
      pendingPhotos: [],
      addPendingPhoto: (photo) =>
        set((state) => ({
          pendingPhotos: [...state.pendingPhotos, { ...photo, timestamp: Date.now() }],
        })),
      removePendingPhoto: (id) =>
        set((state) => ({
          pendingPhotos: state.pendingPhotos.filter((p) => p.id !== id),
        })),
      clearPendingPhotos: (workOrderId) =>
        set((state) => ({
          pendingPhotos: state.pendingPhotos.filter(
            (p) => p.workOrderId !== workOrderId
          ),
        })),

      // Network
      isOnline: true,
      setIsOnline: (online) => set({ isOnline: online }),

      // Language
      locale: "pl",
      setLocale: (locale) => set({ locale }),

      // Reset
      reset: () =>
        set({
          profile: null,
          activeWorkOrder: null,
          dashboardStats: null,
          pendingPhotos: [],
          ...initialTimerState,
        }),
    }),
    {
      name: "hvacpass-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        locale: state.locale,
        pendingPhotos: state.pendingPhotos,
        activeWorkOrder: state.activeWorkOrder,
        timerStart: state.timerStart,
        timerPauseStart: state.timerPauseStart,
        totalPausedTime: state.totalPausedTime,
        isPaused: state.isPaused,
      }),
    }
  )
);

// Selectors
export const selectProfile = (state: AppState) => state.profile;
export const selectActiveWorkOrder = (state: AppState) => state.activeWorkOrder;
export const selectIsTimerRunning = (state: AppState) =>
  state.timerStart !== null && !state.isPaused;
export const selectElapsedTime = (state: AppState) => {
  if (!state.timerStart) return 0;
  const now = Date.now();
  const totalPausedTime = state.isPaused
    ? state.totalPausedTime + (now - (state.timerPauseStart || 0))
    : state.totalPausedTime;
  return now - state.timerStart - totalPausedTime;
};