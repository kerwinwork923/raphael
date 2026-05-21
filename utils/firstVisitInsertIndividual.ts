import axios from "axios";

export const INSERT_INDIVIDUAL_API =
  "https://23700999.com:8081/HMA/api/bk/Insert_Individual";

export type InsertIndividualPayload = {
  AdminID: string;
  Token: string;
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

export type InsertIndividualResponse = {
  PID?: string;
  Result?: string;
  Message?: string;
};

export async function submitInsertIndividual(
  payload: InsertIndividualPayload
): Promise<InsertIndividualResponse> {
  const { data } = await axios.post<InsertIndividualResponse>(
    INSERT_INDIVIDUAL_API,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return data ?? {};
}
