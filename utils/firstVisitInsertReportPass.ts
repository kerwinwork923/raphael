import axios from "axios";

export const INSERT_REPORT_PASS_API =
  "https://23700999.com:8081/HMA/api/bk/Insert_Report_Pass";

export type PastHistoryRowInput = {
  disease: string;
  time: string;
  treatments: string[];
  remark: string;
};

export type PassItem = {
  PassDisease: string;
  PYearFound: string;
  Process: string;
  OtherProcess: string;
};

export type InsertReportPassPayload = {
  AdminID: string;
  Token: string;
  PID: string;
  Pass: PassItem[];
};

export type InsertReportPassResponse = {
  PID?: string;
  Result?: string;
  Message?: string;
};

const TREATMENT_CODE_MAP: Record<string, string> = {
  medication: "DP",
  surgery: "OP",
  radiation: "RC",
  other: "OT",
};

function buildProcess(treatments: string[]): string {
  return treatments
    .map((key) => TREATMENT_CODE_MAP[key])
    .filter(Boolean)
    .join(",");
}

export function buildInsertReportPassPayload(
  adminID: string,
  token: string,
  pid: string,
  rows: PastHistoryRowInput[]
): InsertReportPassPayload {
  const pass = rows
    .filter((row) => row.disease.trim())
    .map((row) => ({
      PassDisease: row.disease.trim(),
      PYearFound: row.time.trim(),
      Process: buildProcess(row.treatments),
      OtherProcess: row.remark.trim(),
    }));

  return {
    AdminID: adminID,
    Token: token,
    PID: pid,
    Pass: pass,
  };
}

export async function submitInsertReportPass(
  payload: InsertReportPassPayload
): Promise<InsertReportPassResponse> {
  const response = await axios.post<InsertReportPassResponse>(
    INSERT_REPORT_PASS_API,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data ?? {};
}
