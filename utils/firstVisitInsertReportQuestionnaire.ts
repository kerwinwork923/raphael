import axios from "axios";

const API_BASE = "https://23700999.com:8081/HMA/api/bk";

export const INSERT_REPORT_FDISEASE_API = `${API_BASE}/Insert_Report_Fdisease`;
export const INSERT_REPORT_TAKEDRUG_API = `${API_BASE}/Insert_Report_TakeDrug`;
export const INSERT_REPORT_SREPORT_API = `${API_BASE}/Insert_Report_SReport`;

export type FamilyHistoryRowInput = {
  relation: string;
  diseases: string[];
  otherDisease: string;
  remark: string;
};

export type PresentHistoryRowInput = {
  category: string;
  symptoms: string;
  duration: string;
  remark: string;
};

export type InsertReportFdiseasePayload = {
  AdminID: string;
  Token: string;
  PID: string;
  FDisease: string;
  MDisease: string;
  PDisease: string;
  SDisease: string;
  ODisease: string;
  FOtherDisease: string;
  MOtherDisease: string;
  POtherDisease: string;
  SOtherDisease: string;
  OOtherDisease: string;
};

export type InsertReportTakeDrugPayload = {
  AdminID: string;
  Token: string;
  PID: string;
  TakeDrug: string;
};

export type InsertReportSReportItemPayload = {
  SOrder: string;
  CateName: string;
  Symptoms: string;
  DisTime: string;
  DisNote: string;
};

export type InsertReportSReportPayload = {
  AdminID: string;
  Token: string;
  PID: string;
  SReportList: InsertReportSReportItemPayload[];
};

export type InsertReportBasicResponse = {
  PID?: string;
  Result?: string; // OK / ...
  Message?: string;
};

const FAMILY_DISEASE_CODE_MAP: Record<string, string> = {
  heart: "HD",
  hypertension: "HT",
  diabetes: "DD",
  other: "OT",
};

function buildDiseaseCodeString(diseases: string[]): string {
  const codes = diseases
    .map((d) => FAMILY_DISEASE_CODE_MAP[d])
    .filter(Boolean);
  // 預設依照 prompt 的順序送出，避免前端選取順序不同導致比對困難
  const order = ["HD", "HT", "DD", "OT"];
  const set = new Set(codes);
  return order.filter((code) => set.has(code)).join(",");
}

function getOtherText(row: FamilyHistoryRowInput): string {
  // 以「備註」優先；若沒填備註就用「其它疾病文字」。
  return row.remark.trim() || row.otherDisease.trim();
}

function getRowByRelation(
  rows: FamilyHistoryRowInput[],
  relation: string,
): FamilyHistoryRowInput | undefined {
  return rows.find((r) => r.relation === relation);
}

export function buildInsertReportFdiseasePayload(
  adminID: string,
  token: string,
  pid: string,
  rows: FamilyHistoryRowInput[],
): InsertReportFdiseasePayload {
  const father = getRowByRelation(rows, "父");
  const mother = getRowByRelation(rows, "母");
  const spouse = getRowByRelation(rows, "配偶");
  const siblingsChildren = getRowByRelation(rows, "手足子女");
  const other = getRowByRelation(rows, "其它");

  const FDisease = father ? buildDiseaseCodeString(father.diseases) : "";
  const MDisease = mother ? buildDiseaseCodeString(mother.diseases) : "";
  const PDisease = spouse ? buildDiseaseCodeString(spouse.diseases) : "";
  const SDisease = siblingsChildren
    ? buildDiseaseCodeString(siblingsChildren.diseases)
    : "";
  const ODisease = other ? buildDiseaseCodeString(other.diseases) : "";

  const FOtherDisease = father ? getOtherText(father) : "";
  const MOtherDisease = mother ? getOtherText(mother) : "";
  const POtherDisease = spouse ? getOtherText(spouse) : "";
  const SOtherDisease = siblingsChildren ? getOtherText(siblingsChildren) : "";
  const OOtherDisease = other ? getOtherText(other) : "";

  return {
    AdminID: adminID,
    Token: token,
    PID: pid,
    FDisease,
    MDisease,
    PDisease,
    SDisease,
    ODisease,
    FOtherDisease,
    MOtherDisease,
    POtherDisease,
    SOtherDisease,
    OOtherDisease,
  };
}

export async function submitInsertReportFdisease(
  payload: InsertReportFdiseasePayload,
): Promise<InsertReportBasicResponse> {
  const response = await axios.post<InsertReportBasicResponse>(
    INSERT_REPORT_FDISEASE_API,
    payload,
    { headers: { "Content-Type": "application/json" } },
  );
  return response.data ?? {};
}

function parseTakeDrugText(input: string): string {
  const raw = input ?? "";
  // 支援「每行一筆」或「以逗號/換行分隔」貼上
  const items = raw
    .split(/[\r\n,]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

  // 去重但保留順序
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }

  return out.join(",");
}

export function buildInsertReportTakeDrugPayload(
  adminID: string,
  token: string,
  pid: string,
  takeDrugText: string,
): InsertReportTakeDrugPayload {
  return {
    AdminID: adminID,
    Token: token,
    PID: pid,
    TakeDrug: parseTakeDrugText(takeDrugText),
  };
}

export async function submitInsertReportTakeDrug(
  payload: InsertReportTakeDrugPayload,
): Promise<InsertReportBasicResponse> {
  const response = await axios.post<InsertReportBasicResponse>(
    INSERT_REPORT_TAKEDRUG_API,
    payload,
    { headers: { "Content-Type": "application/json" } },
  );
  return response.data ?? {};
}

export function buildInsertReportSReportPayload(
  adminID: string,
  token: string,
  pid: string,
  rows: PresentHistoryRowInput[],
): InsertReportSReportPayload {
  const filled = (rows ?? []).filter(
    (r) =>
      r.category.trim() ||
      r.symptoms.trim() ||
      r.duration.trim() ||
      r.remark.trim(),
  );

  const SReportList: InsertReportSReportItemPayload[] = filled.map(
    (r, idx) => ({
      SOrder: String(idx + 1),
      CateName: r.category.trim(),
      Symptoms: r.symptoms.trim(),
      DisTime: r.duration.trim(),
      DisNote: r.remark.trim(),
    }),
  );

  return {
    AdminID: adminID,
    Token: token,
    PID: pid,
    SReportList,
  };
}

export async function submitInsertReportSReport(
  payload: InsertReportSReportPayload,
): Promise<InsertReportBasicResponse> {
  const response = await axios.post<InsertReportBasicResponse>(
    INSERT_REPORT_SREPORT_API,
    payload,
    { headers: { "Content-Type": "application/json" } },
  );
  return response.data ?? {};
}

