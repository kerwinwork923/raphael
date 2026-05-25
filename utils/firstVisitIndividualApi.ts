import axios from "axios";

const API_BASE = "https://23700999.com:8081/HMA/api/bk";

export const QUERY_INDIVIDUAL_API = `${API_BASE}/Query_Individual`;
export const MODIFY_INDIVIDUAL_API = `${API_BASE}/Modify_Individual`;

export type IndividualAuthPayload = {
  AdminID: string;
  Token: string;
};

export type QueryIndividualPayload = IndividualAuthPayload & {
  PID: string;
  Mobile: string;
};

export type QueryIndividualResponse = {
  PID?: string;
  Name?: string;
  Mobile?: string;
  Birthday?: string;
  Source?: string;
  SourceDate?: string;
  Height?: string;
  Weight?: string;
  TT_Type?: string;
  TT_Size?: string;
  Result?: string;
  Message?: string;
};

export type ModifyIndividualPayload = IndividualAuthPayload & {
  PID: string;
  Name: string;
  Mobile: string;
  Birthday: string;
  Source: string;
  SourceDate: string;
  Height: string;
  Weight: string;
  TT_Type: string;
  TT_Size: string;
};

export type ModifyIndividualResponse = {
  PID?: string;
  Result?: string;
  Message?: string;
};

export async function queryIndividual(
  payload: QueryIndividualPayload
): Promise<QueryIndividualResponse> {
  const { data } = await axios.post<QueryIndividualResponse>(
    QUERY_INDIVIDUAL_API,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return data ?? {};
}

export async function modifyIndividual(
  payload: ModifyIndividualPayload
): Promise<ModifyIndividualResponse> {
  const { data } = await axios.post<ModifyIndividualResponse>(
    MODIFY_INDIVIDUAL_API,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return data ?? {};
}
