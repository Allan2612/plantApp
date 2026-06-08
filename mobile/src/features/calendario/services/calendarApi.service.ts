import { getApiBaseUrl } from "@/src/services/api/apiBaseUrl";
import {
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
} from "@/src/services/api/httpClient";

import type {
  CareRule,
  CareRuleInput,
  CareScheduleItem,
  CompleteTaskResult,
} from "../types";

function base(): string {
  return getApiBaseUrl();
}

export async function fetchUserCareSchedule(
  userId: string,
  fromDate?: string,
  toDate?: string,
): Promise<CareScheduleItem[]> {
  const params = new URLSearchParams();
  if (fromDate) params.set("from_date", fromDate);
  if (toDate) params.set("to_date", toDate);
  const qs = params.toString();
  const url = `${base()}/api/users/${userId}/care-schedule${qs ? `?${qs}` : ""}`;
  return httpGet<CareScheduleItem[]>(url);
}

export async function fetchCareRules(userPlantId: string): Promise<CareRule[]> {
  return httpGet<CareRule[]>(`${base()}/api/user-plants/${userPlantId}/care-rules`);
}

export async function createCareRule(
  userPlantId: string,
  rule: CareRuleInput,
): Promise<CareRule> {
  return httpPost<CareRule, CareRuleInput>(
    `${base()}/api/user-plants/${userPlantId}/care-rules`,
    rule,
  );
}

export async function updateCareRule(
  ruleId: string,
  payload: Partial<Pick<CareRule, "intervalDays" | "notes" | "anchorDate" | "active">>,
): Promise<CareRule> {
  return httpPatch<CareRule, typeof payload>(
    `${base()}/api/care-rules/${ruleId}`,
    payload,
  );
}

export async function deleteCareRuleApi(ruleId: string): Promise<void> {
  await httpDelete(`${base()}/api/care-rules/${ruleId}`);
}

export async function createCareTask(payload: {
  userId: string;
  userPlantId: string;
  type: CareScheduleItem["type"];
  scheduledFor: string;
  notes?: string | null;
}): Promise<CareScheduleItem> {
  return httpPost<CareScheduleItem, typeof payload>(
    `${base()}/api/care-schedule`,
    payload,
  );
}

export async function updateCareTask(
  taskId: string,
  payload: Partial<Pick<CareScheduleItem, "scheduledFor" | "notes" | "status">>,
): Promise<CareScheduleItem> {
  return httpPatch<CareScheduleItem, typeof payload>(
    `${base()}/api/care-schedule/${taskId}`,
    payload,
  );
}

export async function deleteCareTaskApi(taskId: string): Promise<void> {
  await httpDelete(`${base()}/api/care-schedule/${taskId}`);
}

export async function completeCareTask(
  taskId: string,
  completedAt: string,
  notes?: string | null,
): Promise<CompleteTaskResult> {
  return httpPost<CompleteTaskResult, { completedAt: string; notes: string | null; value: null }>(
    `${base()}/api/care-schedule/${taskId}/complete`,
    { completedAt, notes: notes ?? null, value: null },
  );
}
