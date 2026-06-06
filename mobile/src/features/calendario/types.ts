export type CareTaskType = "watering" | "fertilizing" | "pruning" | "rotation";
export type CareTaskStatus = "pending" | "completed" | "skipped";

export interface CareScheduleItem {
  id: string;
  userId: string;
  userPlantId: string;
  type: CareTaskType;
  status: CareTaskStatus;
  scheduledFor: string;     // YYYY-MM-DD
  notes: string | null;
  ruleId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareRule {
  id: string;
  userId: string;
  userPlantId: string;
  type: CareTaskType;
  intervalDays: number;
  notes: string | null;
  anchorDate: string;
  lastGeneratedUntil: string | null;
  active: boolean;
}

export interface CareRuleInput {
  type: CareTaskType;
  intervalDays: number;
  notes?: string | null;
  anchorDate?: string | null;
}

export interface CompleteTaskResult {
  task: CareScheduleItem;
  history: { id: string; completedAt: string };
  next: CareScheduleItem | null;
}

export type QueuedAction =
  | { kind: "create"; payload: Omit<CareScheduleItem, "id" | "createdAt" | "updatedAt"> }
  | { kind: "update"; taskId: string; payload: Partial<CareScheduleItem> }
  | { kind: "delete"; taskId: string }
  | { kind: "complete"; taskId: string; completedAt: string; notes: string | null };
