export type EventStatus = "active" | "closed" | "draft";

export interface EventAreaOption {
  area: string;
  location: string;
  status?: EventStatus;
  displayDate?: string;
  time?: string;
  eventDate?: string;
}

export interface SeminarEvent {
  id: string;
  title: string;
  category: string;
  eventType: string;
  eventDate: string;
  displayDate: string;
  time: string;
  status: EventStatus;
  areas: EventAreaOption[];
}

export interface SeminarEventCard {
  cardId: string;
  id: string;
  title: string;
  category: string;
  eventType: string;
  eventDate: string;
  displayDate: string;
  time: string;
  status: EventStatus;
  area: string;
  location: string;
}

/** vipl2 後台／入口列表地區排序 */
export const VIPL2_AREA_ORDER = ["台北", "新竹", "台中", "高雄"] as const;

/** 前台 qrcode 掃描頁使用的活動 id（不含 5/14 vipl1） */
export const QRCODE_SEMINAR_EVENT_IDS = new Set(["20260528-vipl2"]);

export const SEMINAR_EVENTS: SeminarEvent[] = [
  {
    id: "20260514-vipl1",
    title: "明明很不舒服，為什麼檢查都說沒問題？",
    category: "健康講座",
    eventType: "vipl1",
    eventDate: "20260514",
    displayDate: "2026 / 05 / 14（四）",
    time: "10:00",
    status: "active",
    areas: [
      {
        area: "台北",
        location: "台北新光摩天大樓 30樓之1",
      },
    ],
  },
  {
    id: "20260528-vipl2",
    title: "明明很不舒服，為什麼檢查都說沒問題？",
    category: "健康講座",
    eventType: "vipl2",
    eventDate: "20260528",
    displayDate: "2026 / 05 / 28（四）",
    time: "10:00",
    status: "active",
    areas: [
      {
        area: "台北",
        location: "台北新光摩天大樓 30樓之1",
        eventDate: "20260528",
        displayDate: "2026 / 05 / 28（四）",
        time: "10:00",
      },
      {
        area: "台北",
        location: "台北新光摩天大樓 30樓之1",
        eventDate: "20260611",
        displayDate: "2026 / 06 / 11（四）",
        time: "10:00",
      },
      {
        area: "新竹",
        location: "拉菲爾人本診所(新竹) 新竹市林森路196號2樓",
        eventDate: "20260617",
        displayDate: "2026 / 06 / 17（三）",
        time: "10:00",
      },
      {
        area: "台中",
        location: "活動資訊即將公布",
        status: "active",
        eventDate: "",
        displayDate: "日期待定",
        time: "時間待定",
      },
      {
        area: "高雄",
        location: "活動資訊即將公布",
        status: "active",
        eventDate: "",
        displayDate: "日期待定",
        time: "時間待定",
      },
    ],
  },
];

export function buildSeminarEventCards(
  events: SeminarEvent[] = SEMINAR_EVENTS,
): SeminarEventCard[] {
  return events.flatMap((event) =>
    event.areas.map((areaOption) => {
      const eventDate = areaOption.eventDate ?? event.eventDate;
      return {
        cardId: `${event.id}-${areaOption.area}-${eventDate || "tbd"}`,
        id: event.id,
        title: event.title,
        category: event.category,
        eventType: event.eventType,
        eventDate,
        displayDate: areaOption.displayDate ?? event.displayDate,
        time: areaOption.time ?? event.time,
        status: areaOption.status || event.status,
        area: areaOption.area,
        location: areaOption.location,
      };
    }),
  );
}

export function normalizeDateKey(value = ""): string {
  const digits = String(value).replace(/\D/g, "");
  return digits.length >= 8 ? digits.slice(0, 8) : "";
}

export function parseSessionDateFromNote(note = ""): string {
  const m = note.match(/場次日期[：:]\s*(\d{4})\/(\d{2})\/(\d{2})/);
  if (!m) return "";
  return `${m[1]}${m[2]}${m[3]}`;
}

export function getRegistrationSessionDateKey(
  registerDate = "",
  note = "",
): string {
  const fromNote = parseSessionDateFromNote(note);
  if (fromNote) return fromNote;
  return normalizeDateKey(registerDate);
}

export function isScannableSession(card: SeminarEventCard): boolean {
  return card.status !== "draft" && Boolean(normalizeDateKey(card.eventDate));
}

/** 前台 qrcode：vipl2 各場次（含台中、高雄保留席次；不含 5/14） */
export function isQrcodeSession(card: SeminarEventCard): boolean {
  if (!QRCODE_SEMINAR_EVENT_IDS.has(card.id)) return false;
  if (card.status === "draft") return false;
  if (card.area === "台北" || card.area === "新竹") {
    return Boolean(normalizeDateKey(card.eventDate));
  }
  return card.area === "台中" || card.area === "高雄";
}

export function sessionSelectLabel(card: SeminarEventCard): string {
  const date = card.displayDate.replace(/\s+/g, "");
  return `${card.area}｜${date}｜${card.time}｜${card.location}`;
}

export const DEFAULT_QRCODE_SESSION_CARD_ID =
  "20260528-vipl2-台北-20260611";
