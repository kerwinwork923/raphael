/**
 * 肩頸開關 AI 工具 — V9 REST API Client
 * Base: https://api.aiwisebalance.com/v1
 * Override: window.SHOULDER_API_BASE = 'https://...'
 */
(function (global) {
  var BASE = global.SHOULDER_API_BASE || "https://his.wisebalancehealth.com/CRM/api";

  function request(method, path, body) {
    var opts = {
      method: method,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    };
    if (body !== undefined) opts.body = JSON.stringify(body);
    return fetch(BASE + path, opts)
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return { message: res.statusText || "Invalid JSON" };
          })
          .then(function (data) {
            return { ok: res.ok, status: res.status, data: data };
          });
      })
      .catch(function (err) {
        console.warn("[ShoulderAPI]", method, path, err);
        return {
          ok: false,
          status: 0,
          data: { message: err.message || "Network error" },
        };
      });
  }

  function apiUserStorageKey(userId) {
    return "shoulder_api_" + userId;
  }

  function loadApiUser(S) {
    if (!S || !S.userId) return;
    try {
      var d = JSON.parse(localStorage.getItem(apiUserStorageKey(S.userId)) || "null");
      if (d) {
        S.apiUserId = d.apiUserId || null;
        S.userCode = d.userCode || null;
      }
    } catch (e) {}
  }

  function saveApiUser(S) {
    if (!S || !S.userId || !S.apiUserId) return;
    localStorage.setItem(
      apiUserStorageKey(S.userId),
      JSON.stringify({ apiUserId: S.apiUserId, userCode: S.userCode || "" })
    );
  }

  function ensureSyncFlags(S) {
    if (!S._apiSync) {
      S._apiSync = {
        neckRight: false,
        neckLeft: false,
        elbowInner: false,
        elbowOuter: false,
        press: false,
        outcome: false,
        complete: false,
      };
    }
    return S._apiSync;
  }

  function resetSession(S) {
    S.sessionId = null;
    S.sessionToken = null;
    S._apiSync = {
      neckRight: false,
      neckLeft: false,
      elbowInner: false,
      elbowOuter: false,
      press: false,
      outcome: false,
      complete: false,
    };
  }

  function emojiToNeckLevel(score) {
    if (score == null || score === "") return "normal";
    return Number(score) >= 3 ? "tight" : "normal";
  }

  function buildPressPoints(S) {
    if (!S.pressPoints || !S.pressPoints.length) return [];
    return S.pressPoints.map(function (p) {
      return {
        rank: p.isPrimary ? 1 : 2,
        side: p.side,
        zone: p.zone,
        zone_name: p.zoneName || "",
        zone_note: p.zoneNote || "",
        is_primary: !!p.isPrimary,
      };
    });
  }

  var ShoulderAPI = {
    BASE: BASE,

    login: function (name, phone) {
      return request("POST", "/users/login", { name: name, phone: phone });
    },
    createSession: function (userId, sessionToken, sourceUrl, round2Group) {
      var body = {
        user_id: userId,
        session_token: sessionToken,
        source_url: sourceUrl || (typeof location !== "undefined" ? location.href : ""),
      };
      if (round2Group) body.round2_group = round2Group;
      return request("POST", "/sessions", body);
    },
    patchNeck: function (sessionId, data) {
      return request("PATCH", "/sessions/" + sessionId + "/neck", data);
    },
    patchElbow: function (sessionId, data) {
      return request("PATCH", "/sessions/" + sessionId + "/elbow", data);
    },
    patchPress: function (sessionId, points) {
      return request("PATCH", "/sessions/" + sessionId + "/press", { points: points });
    },
    patchOutcome: function (sessionId, data) {
      return request("PATCH", "/sessions/" + sessionId + "/outcome", data);
    },
    completeSession: function (sessionId) {
      return request("PATCH", "/sessions/" + sessionId + "/complete", {});
    },
    getUser: function (userCode) {
      return request("GET", "/users/" + encodeURIComponent(userCode));
    },
    getUserSessions: function (userCode) {
      return request("GET", "/users/" + encodeURIComponent(userCode) + "/sessions");
    },
    getSession: function (sessionId) {
      return request("GET", "/sessions/" + sessionId);
    },

    loadApiUser: loadApiUser,
    saveApiUser: saveApiUser,
    resetSession: resetSession,

    syncLogin: function (S, name, phone) {
      if (!name || !phone) return Promise.resolve(null);
      loadApiUser(S);
      return ShoulderAPI.login(name, phone).then(function (res) {
        var d = res.data || {};
        if (d.user_id) {
          S.apiUserId = d.user_id;
          S.userCode = d.user_code || S.userCode;
          saveApiUser(S);
          return d;
        }
        console.warn("[ShoulderAPI] login failed:", d.message || res.status);
        return null;
      });
    },

    ensureSession: function (S) {
      ensureSyncFlags(S);
      if (S.sessionId) return Promise.resolve(S.sessionId);
      if (!S.apiUserId) return Promise.resolve(null);
      S.sessionToken = String(Date.now());
      return ShoulderAPI.createSession(
        S.apiUserId,
        S.sessionToken,
        typeof location !== "undefined" ? location.href : "",
        S.round2Key || null
      ).then(function (res) {
        var d = res.data || {};
        if (d.session_id) {
          S.sessionId = d.session_id;
          return S.sessionId;
        }
        console.warn("[ShoulderAPI] createSession failed:", d.message || res.status);
        return null;
      });
    },

    syncNeckRight: function (S) {
      var flags = ensureSyncFlags(S);
      if (flags.neckRight || !S.sessionId) return Promise.resolve(null);
      if (S._apiLegacy) {
        if (S.neckR == null) return Promise.resolve(null);
        flags.neckRight = true;
        return ShoulderAPI.patchNeck(S.sessionId, {
          direction: "right",
          tight_side: S.neckSide || "right",
          level: emojiToNeckLevel(S.neckR),
        });
      }
      if (!S.neckRSide || !S.neckRLevel) return Promise.resolve(null);
      flags.neckRight = true;
      return ShoulderAPI.patchNeck(S.sessionId, {
        direction: "right",
        tight_side: S.neckRSide,
        level: S.neckRLevel,
      });
    },

    syncNeckLeft: function (S) {
      var flags = ensureSyncFlags(S);
      if (flags.neckLeft || !S.sessionId) return Promise.resolve(null);
      if (S._apiLegacy) {
        if (S.neckL == null) return Promise.resolve(null);
        flags.neckLeft = true;
        return ShoulderAPI.patchNeck(S.sessionId, {
          direction: "left",
          tight_side: S.neckSide || "left",
          level: emojiToNeckLevel(S.neckL),
        });
      }
      if (!S.neckLSide || !S.neckLLevel) return Promise.resolve(null);
      flags.neckLeft = true;
      return ShoulderAPI.patchNeck(S.sessionId, {
        direction: "left",
        tight_side: S.neckLSide,
        level: S.neckLLevel,
      });
    },

    syncElbowInner: function (S) {
      var flags = ensureSyncFlags(S);
      if (flags.elbowInner || !S.sessionId) return Promise.resolve(null);
      if (!S.elbowInnerSide || !S.elbowInnerLevel) return Promise.resolve(null);
      flags.elbowInner = true;
      return ShoulderAPI.patchElbow(S.sessionId, {
        test_type: "inner",
        sore_side: S.elbowInnerSide,
        level: S.elbowInnerLevel,
      });
    },

    syncElbowOuter: function (S) {
      var flags = ensureSyncFlags(S);
      if (flags.elbowOuter || !S.sessionId) return Promise.resolve(null);
      if (!S.elbowOuterSide || !S.elbowOuterLevel) return Promise.resolve(null);
      flags.elbowOuter = true;
      return ShoulderAPI.patchElbow(S.sessionId, {
        test_type: "outer",
        sore_side: S.elbowOuterSide,
        level: S.elbowOuterLevel,
      });
    },

    syncPress: function (S) {
      var flags = ensureSyncFlags(S);
      if (flags.press || !S.sessionId) return Promise.resolve(null);
      var points = buildPressPoints(S);
      if (!points.length) return Promise.resolve(null);
      flags.press = true;
      return ShoulderAPI.patchPress(S.sessionId, points);
    },

    syncOutcome: function (S) {
      var flags = ensureSyncFlags(S);
      if (flags.outcome || !S.sessionId) return Promise.resolve(null);
      if (S.afterR == null && S.afterL == null) return Promise.resolve(null);
      flags.outcome = true;
      var afterR = S.afterR;
      var afterL = S.afterL;
      if (S._apiLegacy) {
        if (afterR != null) afterR = Math.min(10, Math.max(1, (Number(afterR) + 1) * 2));
        if (afterL != null) afterL = Math.min(10, Math.max(1, (Number(afterL) + 1) * 2));
      }
      return ShoulderAPI.patchOutcome(S.sessionId, {
        after_right: afterR != null ? afterR : null,
        after_left: afterL != null ? afterL : null,
        main_side: S.neckSide || null,
      });
    },

    syncComplete: function (S) {
      var flags = ensureSyncFlags(S);
      if (flags.complete || !S.sessionId) return Promise.resolve(null);
      flags.complete = true;
      return ShoulderAPI.completeSession(S.sessionId).then(function (res) {
        if (!res.ok) {
          console.warn("[ShoulderAPI] complete failed:", (res.data && res.data.message) || res.status);
          flags.complete = false;
        }
        return res;
      });
    },

    /** 登入後初始化 */
    onLogin: function (S, name, phone) {
      return ShoulderAPI.syncLogin(S, name, phone).then(function () {
        return ShoulderAPI.ensureSession(S);
      });
    },

    /** 結果頁：寫入 outcome + complete */
    onResult: function (S) {
      return ShoulderAPI.syncOutcome(S).then(function () {
        return ShoulderAPI.syncComplete(S);
      });
    },

    /** 重新測試：開新 session */
    onRestart: function (S) {
      resetSession(S);
      return ShoulderAPI.ensureSession(S);
    },
  };

  global.ShoulderAPI = ShoulderAPI;
})(typeof window !== "undefined" ? window : this);
