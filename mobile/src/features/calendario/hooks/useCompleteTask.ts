import { useState } from "react";

import { useAuthStore } from "@/src/store/auth.store";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";

import { completeCareTask } from "../services/calendarApi.service";
import {
  enqueueAction,
  saveCachedTasks,
} from "../services/calendarOffline.service";
import {
  cancelTaskNotification,
  scheduleTaskNotification,
} from "../services/localNotifications.service";
import { toISODate } from "../utils/dateRange";
import { useCalendarioStore } from "../store/calendario.feature.store";
import type { CareScheduleItem } from "../types";

export function useCompleteTask(getPlantNickname: (id: string) => string) {
  const profile = useAuthStore((s) => s.profile);
  const userId = profile?.user?.id ?? null;
  const { isConnected } = useNetworkStatus();
  const upsertTask = useCalendarioStore((s) => s.upsertTask);
  const tasks = useCalendarioStore((s) => s.tasks);
  const setTasks = useCalendarioStore((s) => s.setTasks);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function completeTask(task: CareScheduleItem) {
    if (!userId) return;
    setPendingId(task.id);
    const completedAt = toISODate(new Date());
    const optimistic: CareScheduleItem = { ...task, status: "completed" };
    upsertTask(optimistic);
    const nextTasks = tasks.map((t) => (t.id === task.id ? optimistic : t));
    await saveCachedTasks(userId, nextTasks);
    await cancelTaskNotification(task.id);

    if (isConnected === false) {
      await enqueueAction(userId, {
        kind: "complete",
        taskId: task.id,
        completedAt,
        notes: null,
      });
      setPendingId(null);
      return;
    }

    try {
      const result = await completeCareTask(task.id, completedAt, null);
      upsertTask(result.task);
      if (result.next) {
        upsertTask(result.next);
        await scheduleTaskNotification(result.next, getPlantNickname(result.next.userPlantId));
      }
      const refreshed = [
        ...nextTasks.filter((t) => t.id !== task.id && t.id !== result.next?.id),
        result.task,
        ...(result.next ? [result.next] : []),
      ];
      setTasks(refreshed);
      await saveCachedTasks(userId, refreshed);
    } catch {
      await enqueueAction(userId, {
        kind: "complete",
        taskId: task.id,
        completedAt,
        notes: null,
      });
    } finally {
      setPendingId(null);
    }
  }

  return { completeTask, pendingId };
}
