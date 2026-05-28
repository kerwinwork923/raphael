import axios from "axios";
import type { LifeHistoryForm } from "@/utils/firstVisitInsertReport";
import type {
  FamilyHistoryRowInput,
  PresentHistoryRowInput,
} from "@/utils/firstVisitInsertReportQuestionnaire";

const API_BASE = "https://23700999.com:8081/HMA/api/bk";

export const QUERY_REPORT_API = `${API_BASE}/Query_Report`;
export const QUERY_REPORT_TAKEDRUG_API = `${API_BASE}/Insert_Report_QueryTakeDrug`;
export const QUERY_REPORT_SREPORT_API = `${API_BASE}/Insert_Report_QuerySReport`;

export type QueryReportPayload = {
  AdminID: string;
  Token: string;
  PID: string;
};

export type QueryReportResponse = {
  PID?: string;
  Result?: string;
  Message?: string;
  CoffeeCount?: string;
  Coffeecup?: string;
  CoffeeNote?: string;
  TeaCount?: string;
  Teacup?: string;
  TeaNote?: string;
  SmokeCount?: string;
  Smokecup?: string;
  SmokeNote?: string;
  DrinkCount?: string;
  Drinkcup?: string;
  DrinkNote?: string;
  ExerciseCount?: string;
  Exerciseday?: string;
  ExerciseMin?: string;
  ExerciseNote?: string;
  WorkHour?: string;
  WorkNote?: string;
  SleepHour?: string;
  FromSleep2?: string;
  NF1?: string;
  FromSleep3?: string;
  NF2?: string;
  ToSleep2?: string;
  Awake?: string;
  SleepNote?: string;
  nmh?: string;
  bloodPressure1?: string;
  bloodPressure2?: string;
  pulse?: string;
  NMHOthers?: string;
  pressure?: string;
  Guo?: string;
  GuoNote?: string;
  Rolling?: string;
  OtherProcessRolling?: string;
  others?: string;
  PassDisease1?: string;
  PYearFound1?: string;
  Process1?: string;
  OtherProcess1?: string;
  PassDisease2?: string;
  PYearFound2?: string;
  Process2?: string;
  OtherProcess2?: string;
  PassDisease3?: string;
  PYearFound3?: string;
  Process3?: string;
  OtherProcess3?: string;
  PassDisease4?: string;
  PYearFound4?: string;
  Process4?: string;
  OtherProcess4?: string;
  PassDisease5?: string;
  PYearFound5?: string;
  Process5?: string;
  OtherProcess5?: string;
  PassDisease6?: string;
  PYearFound6?: string;
  Process6?: string;
  OtherProcess6?: string;
  PassDisease7?: string;
  PYearFound7?: string;
  Process7?: string;
  OtherProcess7?: string;
  PassDisease8?: string;
  PYearFound8?: string;
  Process8?: string;
  OtherProcess8?: string;
  FDisease?: string;
  MDisease?: string;
  PDisease?: string;
  SDisease?: string;
  ODisease?: string;
  FOtherDisease?: string;
  MOtherDisease?: string;
  POtherDisease?: string;
  SOtherDisease?: string;
  OOtherDisease?: string;
};

export type QueryTakeDrugResponse = {
  PID?: string;
  TakeDrug?: string;
  Result?: string;
  Message?: string;
};

export type QuerySReportItem = {
  SOrder?: string;
  CateName?: string;
  Symptoms?: string;
  DisTime?: string;
  DisNote?: string;
};

export type QuerySReportResponse = {
  PID?: string;
  SReportList?: QuerySReportItem[];
  Result?: string;
  Message?: string;
};

export type PastHistoryRowOutput = {
  disease: string;
  time: string;
  treatments: string[];
  remark: string;
};

const HABIT_API_TO_FORM: Record<string, LifeHistoryForm["coffee"]["option"]> = {
  "0": "none",
  "1": "occasionally",
  "2": "yes",
  "3": "quit",
};

const WORK_API_TO_FORM: Record<string, string> = {
  "0": "none",
  "1": "yes",
  "2": "self",
  "3": "retired",
  "4": "student",
};

const SLEEP_API_TO_FORM: Record<string, string> = {
  "6": "none",
  "7": "occasionally",
  "8": "daily",
};

const BP_API_TO_FORM: Record<string, string> = {
  nor: "normal",
  hi: "high",
  low: "low",
  other: "other",
};

const RELAX_LABEL_TO_KEY: Record<string, string> = {
  無: "none",
  按摩: "massage",
  上健身房: "gym",
  SPA: "spa",
  瑜珈: "yoga",
  其他: "other",
};

const TREATMENT_CODE_TO_KEY: Record<string, string> = {
  DP: "medication",
  OP: "surgery",
  RC: "radiation",
  OT: "other",
};

const FAMILY_CODE_TO_KEY: Record<string, string> = {
  HD: "heart",
  HT: "hypertension",
  DD: "diabetes",
  OT: "other",
};

function str(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

function mapHabitFromApi(
  count: string,
  amount: string,
  remark: string,
): LifeHistoryForm["coffee"] {
  return {
    option: HABIT_API_TO_FORM[count] ?? "",
    amount: str(amount),
    remark: str(remark),
  };
}

function parseTreatments(process: string): string[] {
  return str(process)
    .split(",")
    .map((c) => TREATMENT_CODE_TO_KEY[c.trim()])
    .filter(Boolean);
}

function parseDiseaseCodes(codes: string): string[] {
  return str(codes)
    .split(",")
    .map((c) => FAMILY_CODE_TO_KEY[c.trim()])
    .filter(Boolean);
}

function parseRelaxHabits(rolling: string): string[] {
  return str(rolling)
    .split(",")
    .map((label) => RELAX_LABEL_TO_KEY[label.trim()])
    .filter(Boolean);
}

function parseExerciseRemark(note: string, hasExerciseday: boolean): string {
  const raw = str(note);
  if (!raw || hasExerciseday) return raw;
  const m = raw.match(/^(\d+)\s*次\/週[；;]?\s*(.*)$/);
  if (m) return m[2]?.trim() ?? "";
  return raw;
}

export function mapQueryReportToLife(data: QueryReportResponse): LifeHistoryForm {
  const exerciseday = str(data.Exerciseday);
  const exerciseNote = str(data.ExerciseNote);

  return {
    coffee: mapHabitFromApi(
      str(data.CoffeeCount),
      str(data.Coffeecup),
      str(data.CoffeeNote),
    ),
    tea: mapHabitFromApi(str(data.TeaCount), str(data.Teacup), str(data.TeaNote)),
    smoking: mapHabitFromApi(
      str(data.SmokeCount),
      str(data.Smokecup),
      str(data.SmokeNote),
    ),
    alcohol: mapHabitFromApi(
      str(data.DrinkCount),
      str(data.Drinkcup),
      str(data.DrinkNote),
    ),
    exercise: {
      option:
        str(data.ExerciseCount) === "1"
          ? "yes"
          : str(data.ExerciseCount) === "0"
            ? "none"
            : "",
      timesPerWeek: exerciseday || (() => {
        const m = exerciseNote.match(/^(\d+)\s*次\/週/);
        return m ? m[1] : "";
      })(),
      minutesPerTime: str(data.ExerciseMin),
      remark: parseExerciseRemark(exerciseNote, Boolean(exerciseday)),
    },
    workStatus: WORK_API_TO_FORM[str(data.WorkHour)] ?? "",
    workRemark: str(data.WorkNote),
    sleepMed: SLEEP_API_TO_FORM[str(data.SleepHour)] ?? "",
    sleepFrom: str(data.NF1),
    sleepTo: str(data.NF2),
    sleepFallHours: str(data.ToSleep2),
    sleepWakeCount: str(data.Awake),
    sleepRemark: str(data.SleepNote),
    bpLevel: BP_API_TO_FORM[str(data.nmh)] ?? "",
    bpOther: str(data.NMHOthers),
    bpSystolic: str(data.bloodPressure1),
    bpDiastolic: str(data.bloodPressure2),
    pulse: str(data.pulse),
    stressSource: str(data.pressure),
    skinAllergy:
      str(data.Guo) === "1" ? "yes" : str(data.Guo) === "0" ? "none" : "",
    allergen: str(data.GuoNote),
    relaxHabits: parseRelaxHabits(str(data.Rolling)),
    relaxOther: str(data.OtherProcessRolling),
    other: str(data.others),
  };
}

export function mapQueryReportToPastHistory(
  data: QueryReportResponse,
): PastHistoryRowOutput[] {
  const rows: PastHistoryRowOutput[] = [];

  for (let i = 1; i <= 8; i++) {
    const disease = str(
      (data as Record<string, unknown>)[`PassDisease${i}`],
    );
    if (!disease) continue;

    rows.push({
      disease,
      time: str((data as Record<string, unknown>)[`PYearFound${i}`]),
      treatments: parseTreatments(
        str((data as Record<string, unknown>)[`Process${i}`]),
      ),
      remark: str((data as Record<string, unknown>)[`OtherProcess${i}`]),
    });
  }

  return rows;
}

function mapFamilyRow(
  relation: string,
  diseaseCodes: string,
  otherNote: string,
): FamilyHistoryRowInput {
  const diseases = parseDiseaseCodes(diseaseCodes);
  return {
    relation,
    diseases,
    otherDisease: diseases.includes("other") ? "" : "",
    remark: str(otherNote),
  };
}

export function mapQueryReportToFamilyHistory(
  data: QueryReportResponse,
): FamilyHistoryRowInput[] {
  return [
    mapFamilyRow("父", str(data.FDisease), str(data.FOtherDisease)),
    mapFamilyRow("母", str(data.MDisease), str(data.MOtherDisease)),
    mapFamilyRow("配偶", str(data.PDisease), str(data.POtherDisease)),
    mapFamilyRow("手足子女", str(data.SDisease), str(data.SOtherDisease)),
    mapFamilyRow("其它", str(data.ODisease), str(data.OOtherDisease)),
  ];
}

export function mapTakeDrugToText(takeDrug: string): string {
  return str(takeDrug)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");
}

export function mapSReportListToPresentHistory(
  list: QuerySReportItem[],
): PresentHistoryRowInput[] {
  return (list ?? [])
    .filter(
      (item) =>
        str(item.CateName) ||
        str(item.Symptoms) ||
        str(item.DisTime) ||
        str(item.DisNote),
    )
    .map((item) => ({
      category: str(item.CateName),
      symptoms: str(item.Symptoms),
      duration: str(item.DisTime),
      remark: str(item.DisNote),
    }));
}

export function isQueryOk(result?: string): boolean {
  return str(result) === "OK";
}

export async function queryReport(
  payload: QueryReportPayload,
): Promise<QueryReportResponse> {
  const { data } = await axios.post<QueryReportResponse>(QUERY_REPORT_API, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data ?? {};
}

export async function queryReportTakeDrug(
  payload: QueryReportPayload,
): Promise<QueryTakeDrugResponse> {
  const { data } = await axios.post<QueryTakeDrugResponse>(
    QUERY_REPORT_TAKEDRUG_API,
    payload,
    { headers: { "Content-Type": "application/json" } },
  );
  return data ?? {};
}

export async function queryReportSReport(
  payload: QueryReportPayload,
): Promise<QuerySReportResponse> {
  const { data } = await axios.post<QuerySReportResponse>(
    QUERY_REPORT_SREPORT_API,
    payload,
    { headers: { "Content-Type": "application/json" } },
  );
  return data ?? {};
}
