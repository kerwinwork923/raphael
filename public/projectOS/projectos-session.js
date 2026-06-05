/**
 * ProjectOS 登入工作階段：Token、帳號、姓名、部門代碼 (A1–A9)、DeptWorkType
 */
(function () {
  var VALID_DEPT_KEYS = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9"];
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

  function extractDeptWorkKey(loginResp) {
    var r = loginResp && typeof loginResp === "object" ? loginResp : {};
    var fields = [
      r.DeptWorkKey,
      r.deptWorkKey,
      r.Department,
      r.department,
      r.DeptKey,
      r.deptKey,
      r.WorkDept,
      r.AdminDept,
      r.DeptCode,
    ];
    for (var i = 0; i < fields.length; i++) {
      var key = normalizeDeptKey(fields[i]);
      if (key) return key;
    }
    return DEFAULT_DEPT_KEY;
  }

  function extractDeptWorkType(loginResp) {
    var r = loginResp && typeof loginResp === "object" ? loginResp : {};
    var raw = r.DeptWorkType != null ? r.DeptWorkType : r.deptWorkType;
    if (!raw || typeof raw !== "object") return {};
    return raw;
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

    var deptKey = extractDeptWorkKey(loginResp);
    var deptWorkType = extractDeptWorkType(loginResp);
    var adminName = extractAdminName(loginResp, admin);

    storage.setItem("backendToken", token);
    storage.setItem("adminID", admin);
    storage.setItem("adminName", adminName);
    storage.setItem("deptWorkKey", deptKey);
    try {
      storage.setItem("deptWorkType", JSON.stringify(deptWorkType));
    } catch (e) {
      storage.setItem("deptWorkType", "{}");
    }
  };

  window.projectOSGetAuthStorage = function () {
    if (localStorage.getItem("backendToken")) return localStorage;
    if (sessionStorage.getItem("backendToken")) return sessionStorage;
    return localStorage;
  };

  window.projectOSGetDeptWorkKey = function () {
    var storage = window.projectOSGetAuthStorage();
    var key = normalizeDeptKey(storage.getItem("deptWorkKey"));
    return key || DEFAULT_DEPT_KEY;
  };

  window.projectOSGetDeptWorkTypeMap = function () {
    var storage = window.projectOSGetAuthStorage();
    try {
      var raw = storage.getItem("deptWorkType");
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  };

  window.projectOSGetDeptLabel = function (deptKey) {
    var k = normalizeDeptKey(deptKey) || DEFAULT_DEPT_KEY;
    return DEPT_LABELS[k] || "部門 " + k;
  };

  window.projectOSGetReportMode = function (deptKey) {
    var k = normalizeDeptKey(deptKey) || DEFAULT_DEPT_KEY;
    return DEPT_REPORT_MODE[k] || "standard";
  };

  window.projectOSGetCategoryOptions = function (deptKey) {
    var k = normalizeDeptKey(deptKey) || window.projectOSGetDeptWorkKey();
    var map = window.projectOSGetDeptWorkTypeMap();
    var list = Array.isArray(map[k]) ? map[k] : [];
    return list
      .map(function (x) {
        return String(x || "").trim();
      })
      .filter(Boolean);
  };

  window.projectOSClearSession = function () {
    clearAuthKeys(localStorage);
    clearAuthKeys(sessionStorage);
  };
})();
