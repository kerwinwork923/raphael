/**
 * ProjectOS 登入工作階段：Token、帳號、姓名
 * 部門與工作類別由日報頁 getDailyCommon 的 Dept / DeptWorkType 取得
 */
(function () {
  var DEFAULT_DEPT_KEY = "A1";

  var DEPT_LABELS = {
    A1: "數位轉型部",
    A2: "研發部",
    A3: "生產部",
    A4: "智慧醫療業務部",
    A5: "客服暨會員關係部",
    A6: "管理部",
    A7: "醫療營運部",
    A8: "創新研發處",
    A9: "業務發展處",
  };

  /** standard | production | ops-sm | ops-cs */
  var DEPT_REPORT_MODE = {
    A1: "standard",
    A2: "standard",
    A3: "production",
    A4: "ops-sm",
    A5: "ops-cs",
    A6: "standard",
    A7: "standard",
    A8: "standard",
    A9: "standard",
  };

  function normalizeDeptKey(raw) {
    var v = String(raw != null ? raw : "")
      .trim()
      .toUpperCase();
    if (/^A[1-9]$/.test(v)) return v;
    var m = v.match(/A([1-9])/);
    if (m) return "A" + m[1];
    return "";
  }

  function extractAdminName(loginResp, adminId) {
    var r = loginResp && typeof loginResp === "object" ? loginResp : {};
    var name = String(
      r.AdminName ||
        r.adminName ||
        r.Name ||
        r.name ||
        r.EmployeeName ||
        r.employeeName ||
        ""
    ).trim();
    return name || String(adminId || "").trim();
  }

  function clearAuthKeys(storage) {
    storage.removeItem("backendToken");
    storage.removeItem("adminID");
    storage.removeItem("adminName");
    storage.removeItem("deptWorkKey");
    storage.removeItem("deptWorkType");
  }

  window.projectOSApplyLoginSession = function (loginResp, adminId, remember) {
    var admin = String(adminId || "").trim();
    var token = loginResp && loginResp.Token ? String(loginResp.Token).trim() : "";
    if (!token || !admin) return;

    var storage = remember ? localStorage : sessionStorage;
    var other = remember ? sessionStorage : localStorage;
    clearAuthKeys(other);
    clearAuthKeys(storage);

    var adminName = extractAdminName(loginResp, admin);

    storage.setItem("backendToken", token);
    storage.setItem("adminID", admin);
    storage.setItem("adminName", adminName);
  };

  window.projectOSGetAuthStorage = function () {
    if (localStorage.getItem("backendToken")) return localStorage;
    if (sessionStorage.getItem("backendToken")) return sessionStorage;
    return localStorage;
  };

  /** 依 getDailyCommon 回傳的 Dept 部門名稱對應 A1–A9（僅供畫面模式判斷） */
  window.projectOSDeptNameToKey = function (deptName) {
    var name = String(deptName || "").trim();
    if (!name) return DEFAULT_DEPT_KEY;
    var keys = Object.keys(DEPT_LABELS);
    for (var i = 0; i < keys.length; i++) {
      if (DEPT_LABELS[keys[i]] === name) return keys[i];
    }
    for (var j = 0; j < keys.length; j++) {
      var label = DEPT_LABELS[keys[j]];
      if (name.indexOf(label) >= 0 || label.indexOf(name) >= 0) return keys[j];
    }
    return DEFAULT_DEPT_KEY;
  };

  window.projectOSGetDeptLabel = function (deptKey) {
    var k = normalizeDeptKey(deptKey) || DEFAULT_DEPT_KEY;
    return DEPT_LABELS[k] || "部門 " + k;
  };

  window.projectOSGetReportMode = function (deptKey) {
    var k = normalizeDeptKey(deptKey) || DEFAULT_DEPT_KEY;
    return DEPT_REPORT_MODE[k] || "standard";
  };

  window.projectOSClearSession = function () {
    clearAuthKeys(localStorage);
    clearAuthKeys(sessionStorage);
  };
})();
