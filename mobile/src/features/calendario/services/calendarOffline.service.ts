import { cacheGet, cacheSet } from "@/src/services/offlineCache";

import type { CareRule, CareScheduleItem, QueuedAction } from "../types";

const TASKS_KEY = (userId: string) => `calendar.tasks.${userId}`;
const RULES_KEY = (plantId: string) => `calendar.rules.${plantId}`;
const QUEUE_KEY = (userId: string) => `calendar.queue.${userId}`;

export async function loadCachedTasks(userId: string): Promise<CareScheduleItem[]> {
  return (await cacheGet<CareScheduleItem[]>(TASKS_KEY(userId))) ?? [];
}

export async function saveCachedTasks(userId: string, tasks: CareScheduleItem[]): Promise<void> {
  await cacheSet(TASKS_KEY(userId), tasks);
}

export async function loadCachedRules(plantId: string): Promise<CareRule[]> {
  return (await cacheGet<CareRule[]>(RULES_KEY(plantId))) ?? [];
}

export async function saveCachedRules(plantId: string, rules: CareRule[]): Promise<void> {
  await cacheSet(RULES_KEY(plantId), rules);
}

export async function readQueue(userId: string): Promise<QueuedAction[]> {
  return (await cacheGet<QueuedAction[]>(QUEUE_KEY(userId))) ?? [];
}

export async function enqueueAction(userId: string, action: QueuedAction): Promise<void> {
  const queue = await readQueue(userId);
  queue.push(action);
  await cacheSet(QUEUE_KEY(userId), queue);
}

export async function clearQueue(userId: string): Promise<void> {
  await cacheSet<QueuedAction[]>(QUEUE_KEY(userId), []);
}

export async function popFront(userId: string): Promise<QueuedAction | null> {
  const queue = await readQueue(userId);
  if (queue.length === 0) return null;
  const next = queue.shift()!;
  await cacheSet(QUEUE_KEY(userId), queue);
  return next;
}
