import { useMemo } from "react";

import { daysInMonthGrid } from "../utils/dateRange";
import { useCalendarioStore } from "../store/calendario.feature.store";
import type { CareScheduleItem, CareTaskType } from "../types";

export interface DayCell {
  date: string;
  inMonth: boolean;
  types: CareTaskType[];
  hasTasks: boolean;
}

export function useMonthTasks(): DayCell[] {
  const visibleMonth = useCalendarioStore((s) => s.visibleMonth);
  const tasks = useCalendarioStore((s) => s.tasks);

  return useMemo(() => {
    const cells = daysInMonthGrid(visibleMonth.year, visibleMonth.month);
    const byDay = new Map<string, CareScheduleItem[]>();
    for (const t of tasks) {
      const day = t.scheduledFor.slice(0, 10);
      const arr = byDay.get(day) ?? [];
      arr.push(t);
      byDay.set(day, arr);
    }
    return cells.map((c) => {
      const items = byDay.get(c.date) ?? [];
      const types = Array.from(new Set(items.filter((i) => i.status === "pending").map((i) => i.type)));
      return { ...c, types, hasTasks: items.length > 0 };
    });
  }, [visibleMonth, tasks]);
}
