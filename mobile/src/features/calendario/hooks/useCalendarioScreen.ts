import { useEffect, useState } from "react";

import { useAuthStore } from "@/src/store/auth.store";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import { usePlantsStore } from "@/src/store/plants.store";

import { fetchUserCareSchedule } from "../services/calendarApi.service";
import { useQueueDrainer } from "./useQueueDrainer";
import {
  loadCachedTasks,
  saveCachedTasks,
} from "../services/calendarOffline.service";
import { ensurePermissions, syncNotifications } from "../services/localNotifications.service";
import { useCalendarioStore } from "../store/calendario.feature.store";

export function useCalendarioScreen() {
  useQueueDrainer();

  const profile = useAuthStore((s) => s.profile);
  const userId = profile?.user?.id ?? null;
  const { isConnected } = useNetworkStatus();
  const tasks = useCalendarioStore((s) => s.tasks);
  const setTasks = useCalendarioStore((s) => s.setTasks);
  const setIsLoading = useCalendarioStore((s) => s.setIsLoading);
  const selectedDate = useCalendarioStore((s) => s.selectedDate);
  const setSelectedDate = useCalendarioStore((s) => s.setSelectedDate);
  const visibleMonth = useCalendarioStore((s) => s.visibleMonth);
  const setVisibleMonth = useCalendarioStore((s) => s.setVisibleMonth);
  const plants = usePlantsStore((s) => s.plants);
  const [permissionAsked, setPermissionAsked] = useState(false);

  function getPlantNickname(userPlantId: string): string {
    const entry = plants.find((p) => {
      const payload = (p as { userPlant?: Record<string, unknown> })?.userPlant ?? p;
      return (payload as { id?: string })?.id === userPlantId;
    });
    if (!entry) return "Planta";
    const payload = (entry as { userPlant?: Record<string, unknown> })?.userPlant ?? entry;
    return ((payload as { nickname?: string })?.nickname) ?? "Planta";
  }

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const cached = await loadCachedTasks(userId);
      if (!cancelled && cached.length) setTasks(cached);
      setIsLoading(true);
      try {
        const fresh = await fetchUserCareSchedule(userId);
        if (cancelled) return;
        setTasks(fresh);
        await saveCachedTasks(userId, fresh);
        await syncNotifications(fresh, getPlantNickname);
      } catch {
        // silencio — cache ya está visible
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (permissionAsked) return;
    setPermissionAsked(true);
    ensurePermissions().catch(() => {});
  }, [permissionAsked]);

  return {
    isConnected,
    tasks,
    selectedDate,
    setSelectedDate,
    visibleMonth,
    setVisibleMonth,
    getPlantNickname,
  };
}
