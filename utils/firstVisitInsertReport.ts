import axios from "axios";

export const INSERT_REPORT_API =
  "https://23700999.com:8081/HMA/api/bk/Insert_Report";

export type LifeHistoryForm = {
  coffee: { option: string; amount: string; remark: string };
  tea: { option: string; amount: string; remark: string };
  smoking: { option: string; amount: string; remark: string };
  alcohol: { option: string; amount: string; remark: string };
  exercise: {
    option: string;
    timesPerWeek: string;
    minutesPerTime: string;
    remark: string;
  };
  workStatus: string;
  workRemark: string;
  sleepMed: string;
  sleepFrom: string;
  sleepTo: string;
  sleepFallHours: string;
  sleepWakeCount: string;
  sleepRemark: string;
  bpLevel: string;
  bpOther: string;
  bpSystolic: string;
  bpDiastolic: string;
  pulse: string;
  stressSource: string;
  skinAllergy: string;
  allergen: string;
  relaxHabits: string[];
  relaxOther: string;
  other: string;
};

export type InsertReportPayload = {
  AdminID: string;
  Token: string;
  PID: string;
  CoffeeCount: string;
  Coffeecup: string;
  CoffeeNote: string;
  TeaCount: string;
  Teacup: string;
  TeaNote: string;
  SmokeCount: string;
  Smokecup: string;
  SmokeNote: string;
  DrinkCount: string;
  Drinkcup: string;
  DrinkNote: string;
  ExerciseCount: string;
  ExerciseMin: string;
  ExerciseNote: string;
  WorkHour: string;
  WorkNote: string;
  SleepHour: string;
  FromSleep2: string;
  NF1: string;
  FromSleep3: string;
  NF2: string;
  ToSleep2: string;
  Awake: string;
  SleepNote: string;
  nmh: string;
  bloodPressure1: string;
  bloodPressure2: string;
  pulse: string;
  NMHOthers: string;
  pressure: string;
  Guo: string;
  GuoNote: string;
  Rolling: string;
  OtherProcessRolling: string;
  others: string;
};

export type InsertReportResponse = {
  PID?: string;
  Result?: string;
  Message?: string;
};

const HABIT_OPTION_MAP: Record<string, string> = {
  none: "0",
  occasionally: "1",
  yes: "2",
  quit: "3",
};

const WORK_STATUS_MAP: Record<string, string> = {
  none: "0",
  yes: "1",
  self: "2",
  retired: "3",
  student: "4",
};

const SLEEP_MED_MAP: Record<string, string> = {
  none: "6",
  occasionally: "7",
  daily: "8",
};

const BP_LEVEL_MAP: Record<string, string> = {
  normal: "nor",
  high: "hi",
  low: "low",
  other: "other",
};

const RELAX_LABEL_MAP: Record<string, string> = {
  none: "無",
  massage: "按摩",
  gym: "上健身房",
  spa: "SPA",
  yoga: "瑜珈",
  other: "其他",
};

function mapHabitOption(option: string): string {
  return HABIT_OPTION_MAP[option] ?? "";
}

function mapExerciseOption(option: string): string {
  if (option === "yes") return "1";
  if (option === "none") return "0";
  return "";
}

function mapWorkStatus(status: string): string {
  return WORK_STATUS_MAP[status] ?? "";
}

function mapSleepMed(value: string): string {
  return SLEEP_MED_MAP[value] ?? "";
}

function mapBpLevel(level: string): string {
  return BP_LEVEL_MAP[level] ?? "";
}

function mapSkinAllergy(value: string): string {
  if (value === "yes") return "1";
  if (value === "none") return "0";
  return "";
}

function buildRolling(habits: string[]): string {
  return habits
    .map((key) => RELAX_LABEL_MAP[key])
    .filter(Boolean)
    .join(",");
}

function buildExerciseNote(life: LifeHistoryForm): string {
  const parts: string[] = [];
  if (life.exercise.timesPerWeek.trim()) {
    parts.push(`${life.exercise.timesPerWeek.trim()}次/週`);
  }
  if (life.exercise.remark.trim()) {
    parts.push(life.exercise.remark.trim());
  }
  return parts.join("；");
}

export function buildInsertReportPayload(
  adminID: string,
  token: string,
  pid: string,
  life: LifeHistoryForm
): InsertReportPayload {
  return {
    AdminID: adminID,
    Token: token,
    PID: pid,
    CoffeeCount: mapHabitOption(life.coffee.option),
    Coffeecup: life.coffee.amount.trim(),
    CoffeeNote: life.coffee.remark.trim(),
    TeaCount: mapHabitOption(life.tea.option),
    Teacup: life.tea.amount.trim(),
    TeaNote: life.tea.remark.trim(),
    SmokeCount: mapHabitOption(life.smoking.option),
    Smokecup: life.smoking.amount.trim(),
    SmokeNote: life.smoking.remark.trim(),
    DrinkCount: mapHabitOption(life.alcohol.option),
    Drinkcup: life.alcohol.amount.trim(),
    DrinkNote: life.alcohol.remark.trim(),
    ExerciseCount: mapExerciseOption(life.exercise.option),
    ExerciseMin: life.exercise.minutesPerTime.trim(),
    ExerciseNote: buildExerciseNote(life),
    WorkHour: mapWorkStatus(life.workStatus),
    WorkNote: life.workRemark.trim(),
    SleepHour: mapSleepMed(life.sleepMed),
    FromSleep2: "PM",
    NF1: life.sleepFrom.trim(),
    FromSleep3: "AM",
    NF2: life.sleepTo.trim(),
    ToSleep2: life.sleepFallHours.trim(),
    Awake: life.sleepWakeCount.trim(),
    SleepNote: life.sleepRemark.trim(),
    nmh: mapBpLevel(life.bpLevel),
    bloodPressure1: life.bpSystolic.trim(),
    bloodPressure2: life.bpDiastolic.trim(),
    pulse: life.pulse.trim(),
    NMHOthers: life.bpOther.trim(),
    pressure: life.stressSource.trim(),
    Guo: mapSkinAllergy(life.skinAllergy),
    GuoNote: life.allergen.trim(),
    Rolling: buildRolling(life.relaxHabits),
    OtherProcessRolling: life.relaxOther.trim(),
    others: life.other.trim(),
  };
}

export async function submitInsertReport(
  payload: InsertReportPayload
): Promise<InsertReportResponse> {
  const response = await axios.post<InsertReportResponse>(INSERT_REPORT_API, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data ?? {};
}
