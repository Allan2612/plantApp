import { useEffect, useRef } from "react";

import { useAuthStore } from "@/src/store/auth.store";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";

import {
  completeCareTask,
  createCareTask,
  deleteCareTaskApi,
  fetchUserCareSchedule,
  updateCareTask,
} from "../services/calendarApi.service";
import {
  popFront,
  saveCachedTasks,
} from "../services/calendarOffline.service";
import { useCalendarioStore } from "../store/calendario.feature.store";

export function useQueueDrainer() {
  const profile = useAuthStore((s) => s.profile);
  const userId = profile?.user?.id ?? null;
  const { isConnected } = useNetworkStatus();
  const setTasks = useCalendarioStore((s) => s.setTasks);
  const draining = useRef(false);

  useEffect(() => {
    if (!userId || isConnected !== true || draining.current) return;
    (async () => {
      draining.current = true;
      try {
        let next = await popFront(userId);
        while (next) {
          try {
            if (next.kind === "create") {
              await createCareTask({
                userId: next.payload.userId,
                userPlantId: next.payload.userPlantId,
                type: next.payload.type,
                scheduledFor: next.payload.scheduledFor,
                notes: next.payload.notes,
              });
            } else if (next.kind === "update") {
              await updateCareTask(next.taskId, next.payload as Partial<{ scheduledFor: string; notes: string | null; status: "pending" | "completed" | "skipped" }>);
            } else if (next.kind === "delete") {
              await deleteCareTaskApi(next.taskId);
            } else if (next.kind === "complete") {
              await completeCareTask(next.taskId, next.completedAt, next.notes);
            }
          } catch {
            // descarte tras fallo (1 intento ya, drop)
          }
          next = await popFront(userId);
        }
        const fresh = await fetchUserCareSchedule(userId);
        setTasks(fresh);
        await saveCachedTasks(userId, fresh);
      } finally {
        draining.current = false;
      }
    })();
  }, [userId, isConnected, setTasks]);
}
