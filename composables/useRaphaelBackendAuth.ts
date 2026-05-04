/** 後台會員清單驗證用（與 useMemberListStore 相同端點） */
const BACKEND_HOME_API = "https://23700999.com:8081/HMA/API_Home.jsp";

export function clearRaphaelBackendSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("backendToken");
    localStorage.removeItem("adminID");
    localStorage.removeItem("adminName");
    localStorage.removeItem("selectedMember");
    sessionStorage.removeItem("backendToken");
    sessionStorage.removeItem("adminID");
    sessionStorage.removeItem("adminName");
  } catch {
    /* ignore */
  }
}

/** HTTP 401/403 或後端 Result／Message 表示 Token／登入失效 */
export function isBackendApiUnauthorized(
  data: unknown,
  httpStatus?: number
): boolean {
  if (httpStatus === 401 || httpStatus === 403) return true;
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  const r = d.Result;
  if (r == null) return false;
  const rs = String(r).toUpperCase();
  if (rs === "OK") return false;
  if (rs === "NOTOKTOKEN") return true;
  const msg = String(d.Message ?? d.message ?? "").toUpperCase();
  if (
    rs.includes("TOKEN") ||
    rs.includes("AUTH") ||
    rs === "UNAUTHORIZED" ||
    rs === "FORBIDDEN" ||
    rs.includes("LOGIN")
  ) {
    return true;
  }
  if (
    msg.includes("TOKEN") ||
    msg.includes("AUTH") ||
    msg.includes("登入") ||
    msg.includes("過期")
  ) {
    return true;
  }
  return false;
}

export function redirectToRaphaelBackendLogin() {
  clearRaphaelBackendSession();
  if (typeof window !== "undefined") {
    window.location.href = "/raphaelBackend";
  }
}

/** 若為未授權則已執行導向登入，回傳 true 表示呼叫端應中止後續邏輯 */
export function redirectToRaphaelBackendLoginIfUnauthorized(
  data: unknown,
  httpStatus?: number
): boolean {
  if (!isBackendApiUnauthorized(data, httpStatus)) return false;
  redirectToRaphaelBackendLogin();
  return true;
}

export type RaphaelBackendProbeOutcome =
  | "valid"
  | "missing_credentials"
  | "unauthorized"
  | "invalid_response"
  | "network_error";

/**
 * 以 API_Home 驗證目前 storage 內 Token。
 * - unauthorized：已呼叫 clearRaphaelBackendSession（登入頁可不再導頁）
 */
export async function probeRaphaelBackendSessionOutcome(): Promise<RaphaelBackendProbeOutcome> {
  if (typeof window === "undefined") return "network_error";
  const token =
    localStorage.getItem("backendToken") ||
    sessionStorage.getItem("backendToken");
  const adminID =
    localStorage.getItem("adminID") || sessionStorage.getItem("adminID");
  if (!token || !adminID) return "missing_credentials";

  try {
    const res = await fetch(BACKEND_HOME_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        AdminID: adminID,
        Token: token,
        Keyword: "",
        StartDate: "",
        EndDate: "",
        ProductName: "",
        memType: "",
      }),
    });
    const data = (await res.json()) as {
      Result?: string;
      MemberList?: unknown;
    };
    if (isBackendApiUnauthorized(data, res.status)) {
      clearRaphaelBackendSession();
      return "unauthorized";
    }
    if (String(data.Result) === "OK" && Array.isArray(data.MemberList)) {
      return "valid";
    }
    return "invalid_response";
  } catch {
    return "network_error";
  }
}

/**
 * 以 API_Home 驗證目前 storage 內 Token 是否仍有效（供登入頁使用）。
 * 無效且為未授權時會清除過期憑證（不導頁）。
 */
export async function probeRaphaelBackendSession(): Promise<boolean> {
  const outcome = await probeRaphaelBackendSessionOutcome();
  return outcome === "valid";
}

/**
 * 有 Sidebar 的後台頁共用：缺憑證或 Token 失效時導回登入。
 * 網路錯誤或非授權類失敗不導頁，避免誤踢正常使用者。
 */
export async function guardRaphaelBackendSidebarSession(): Promise<void> {
  const outcome = await probeRaphaelBackendSessionOutcome();
  if (outcome === "missing_credentials" || outcome === "unauthorized") {
    redirectToRaphaelBackendLogin();
  }
}
