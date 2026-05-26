import {
  getRegistrationSessionDateKey,
  normalizeDateKey,
  parseSessionDateFromNote,
  type SeminarEventCard,
} from "~/utils/seminarEventSessions";

/** 與後台 [eventType].vue 相同：報名／報到列表查詢 */
export const SEMINAR_REGISTER_QUERY_API =
  "https://23700999.com:8081/HMA/api/bk/His_Register_query";

export interface SeminarRegisterQueryPayload {
  AdminID: string | null;
  Token: string | null;
  EventType: string;
  /** 場次地區，例：台北 */
  Area?: string;
  /** 場次日期 YYYYMMDD，例：20260528 */
  RegisterDate?: string;
}

export function buildSeminarRegisterQueryPayload(params: {
  AdminID: string | null;
  Token: string | null;
  EventType: string;
  area?: string;
  registerDate?: string;
}): SeminarRegisterQueryPayload {
  const payload: SeminarRegisterQueryPayload = {
    AdminID: params.AdminID,
    Token: params.Token,
    EventType: params.EventType,
  };

  const area = params.area?.trim();
  if (area) payload.Area = area;

  const registerDate = normalizeDateKey(params.registerDate || "");
  if (registerDate) payload.RegisterDate = registerDate;

  return payload;
}

export function buildPayloadFromSessionCard(
  card: SeminarEventCard,
  adminID: string | null,
  token: string | null,
): SeminarRegisterQueryPayload {
  return buildSeminarRegisterQueryPayload({
    AdminID: adminID,
    Token: token,
    EventType: card.eventType,
    area: card.area,
    registerDate: card.eventDate,
  });
}

export interface SeminarRegisterApiItem {
  VIP?: string;
  PID?: string;
  RegisterDate?: string;
  Name?: string;
  Area?: string;
  Email?: string;
  Mobile?: string;
  CheckTime?: string;
  AID?: string;
  Note?: string;
  Qrcodecheck?: string;
  Qrcodetime?: string;
  EventType?: string;
}

export interface SeminarRegisterQueryResponse {
  Result?: string;
  regList?: SeminarRegisterApiItem[];
}

/** 篩選單一場次報名（地區 + 場次日期，與後台一致） */
export function filterRegistrationsBySession(
  list: SeminarRegisterApiItem[],
  session: SeminarEventCard,
): SeminarRegisterApiItem[] {
  return list.filter((item) => matchesSessionRegistration(item, session));
}

export function matchesSessionRegistration(
  item: SeminarRegisterApiItem,
  session: SeminarEventCard,
): boolean {
  const area = (item.Area || "").trim();
  if (area !== session.area) return false;

  const sessionDateKey = normalizeDateKey(session.eventDate);

  // 台中、高雄等日期待定場次：僅依地區，且排除備註內含明確場次日期的資料
  if (!sessionDateKey) {
    const noteDateKey = parseSessionDateFromNote(item.Note || "");
    return !noteDateKey;
  }

  const registrationSessionKey = getRegistrationSessionDateKey(
    item.RegisterDate || "",
    item.Note || "",
  );

  return registrationSessionKey === sessionDateKey;
}

/** 總報名數（後台 totalRegistrations） */
export function countSessionTotal(
  list: SeminarRegisterApiItem[],
  session: SeminarEventCard,
): number {
  return filterRegistrationsBySession(list, session).length;
}

/** 報到人數（後台 checkedInCount：Qrcodecheck + Qrcodetime） */
export function countSessionCheckedIn(
  list: SeminarRegisterApiItem[],
  session: SeminarEventCard,
): number {
  return filterRegistrationsBySession(list, session).filter(
    (item) => item.Qrcodecheck === "true" && Boolean(item.Qrcodetime),
  ).length;
}

export async function fetchSeminarRegisterList(
  payload: SeminarRegisterQueryPayload,
): Promise<SeminarRegisterApiItem[]> {
  const response = await fetch(SEMINAR_REGISTER_QUERY_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = (await response.json()) as SeminarRegisterQueryResponse;

  if (data?.Result === "OK" && Array.isArray(data.regList)) {
    return data.regList;
  }

  return [];
}
