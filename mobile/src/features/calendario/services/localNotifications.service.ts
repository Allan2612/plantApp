import Constants, { ExecutionEnvironment } from "expo-constants";

import { CARE_TYPE_META } from "../utils/careTypes";
import type { CareScheduleItem } from "../types";

// expo-notifications no funciona en Expo Go (SDK 53+). Carga perezosa y se omite si Expo Go.
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type NotificationsModule = typeof import("expo-notifications");

let cachedNotifications: NotificationsModule | null = null;
let handlerSet = false;

function getNotifications(): NotificationsModule | null {
  if (isExpoGo) return null;
  if (cachedNotifications) return cachedNotifications;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedNotifications = require("expo-notifications") as NotificationsModule;
    return cachedNotifications;
  } catch {
    return null;
  }
}

function ensureHandler(Notifications: NotificationsModule) {
  if (handlerSet) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerSet = true;
}

export async function ensurePermissions(): Promise<boolean> {
  const Notifications = getNotifications();
  if (!Notifications) return false;
  ensureHandler(Notifications);
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  if (!settings.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

function buildTrigger(scheduledFor: string): Date | null {
  const [y, m, d] = scheduledFor.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  const trigger = new Date(y, m - 1, d, 9, 0, 0, 0);
  if (trigger.getTime() <= Date.now()) return null;
  return trigger;
}

export async function scheduleTaskNotification(
  task: CareScheduleItem,
  plantNickname: string,
): Promise<string | null> {
  const Notifications = getNotifications();
  if (!Notifications) return null;
  ensureHandler(Notifications);
  if (task.status !== "pending") return null;
  const trigger = buildTrigger(task.scheduledFor);
  if (!trigger) return null;
  const meta = CARE_TYPE_META[task.type];

  try {
    const id = await Notifications.scheduleNotificationAsync({
      identifier: task.id,
      content: {
        title: `${meta.label} ${plantNickname}`,
        body: task.notes ?? `Recordatorio de cuidado`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
        channelId: "default",
      },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelTaskNotification(taskId: string): Promise<void> {
  const Notifications = getNotifications();
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(taskId);
  } catch {}
}

export async function syncNotifications(
  tasks: CareScheduleItem[],
  plantNameLookup: (userPlantId: string) => string,
): Promise<void> {
  const Notifications = getNotifications();
  if (!Notifications) return;
  ensureHandler(Notifications);
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
  for (const task of tasks) {
    if (task.status !== "pending") continue;
    await scheduleTaskNotification(task, plantNameLookup(task.userPlantId));
  }
}
