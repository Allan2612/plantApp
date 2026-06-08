import { create } from "zustand";

import type { CareRule, CareScheduleItem } from "../types";

interface CalendarioState {
  selectedDate: string;
  visibleMonth: { year: number; month: number };
  tasks: CareScheduleItem[];
  rulesByPlant: Record<string, CareRule[]>;
  isLoading: boolean;
  setSelectedDate: (d: string) => void;
  setVisibleMonth: (year: number, month: number) => void;
  setTasks: (tasks: CareScheduleItem[]) => void;
  upsertTask: (task: CareScheduleItem) => void;
  removeTask: (taskId: string) => void;
  setRulesForPlant: (plantId: string, rules: CareRule[]) => void;
  setIsLoading: (v: boolean) => void;
}

function todayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const useCalendarioStore = create<CalendarioState>((set) => ({
  selectedDate: todayISO(),
  visibleMonth: { year: new Date().getFullYear(), month: new Date().getMonth() },
  tasks: [],
  rulesByPlant: {},
  isLoading: false,
  setSelectedDate: (d) => set({ selectedDate: d }),
  setVisibleMonth: (year, month) => set({ visibleMonth: { year, month } }),
  setTasks: (tasks) => set({ tasks }),
  upsertTask: (task) =>
    set((state) => {
      const idx = state.tasks.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const next = state.tasks.slice();
        next[idx] = task;
        return { tasks: next };
      }
      return { tasks: [...state.tasks, task] };
    }),
  removeTask: (taskId) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) })),
  setRulesForPlant: (plantId, rules) =>
    set((state) => ({ rulesByPlant: { ...state.rulesByPlant, [plantId]: rules } })),
  setIsLoading: (v) => set({ isLoading: v }),
}));
