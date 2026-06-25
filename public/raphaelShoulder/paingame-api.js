/**
 * Customer / Paingame REST API client
 * 實際伺服器行為（his.wisebalancehealth.com/CRM/api）：
 * - POST /customers：body 需帶 Key
 * - POST/PUT /paingame-records：body 不可帶 Key（會 500）
 * - 無 GET 列表 API（GET 會 405）→ 紀錄僅保留於當次 session 記憶體
 * - FirstDone / SecondDone / Doneagain：Y/N 字串
 */
(function (global) {
  var BASE = global.PAINGAME_API_BASE || "https://his.wisebalancehealth.com/CRM/api";
  var API_KEY = global.PAINGAME_API_KEY || "qrt897hpmd";

  function getDeviceInfo() {
    try {
      var ua = navigator.userAgent || "";
      var platform = navigator.platform || "";
      return (platform + " / " + ua).slice(0, 255);
    } catch (e) {
      return "";
    }
  }

  function getLineIdFromUrl() {
    try {
      var params = new URLSearchParams(location.search);
      return (
        params.get("LineID") ||
        params.get("lineid") ||
        params.get("lineId") ||
        ""
      );
    } catch (e) {
      return "";
    }
  }

  function withKey(body) {
    return Object.assign({ Key: API_KEY }, body || {});
  }

  function toInt(v) {
    if (v == null || v === "") return null;
    var n = parseInt(String(v), 10);
    return isNaN(n) ? null : n;
  }

  function ynFlag(v) {
    if (v == null || v === "") return null;
    if (v === true || v === "Y" || v === "y" || v === 1 || v === "1") return "Y";
    return "N";
  }

  function requestJson(method, path, body) {
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
            return { result: "fail", message: res.statusText || "Invalid JSON" };
          })
          .then(function (data) {
            return { ok: res.ok, status: res.status, data: data };
          });
      })
      .catch(function (err) {
        console.warn("[PaingameAPI]", method, path, err);
        return {
          ok: false,
          status: 0,
          data: { result: "fail", message: err.message || "Network error" },
        };
      });
  }

  function requestCustomer(method, path, body) {
    return requestJson(method, path, withKey(body));
  }

  /** paingame-records 不可帶 Key */
  function requestPaingame(method, path, body) {
    return requestJson(method, path, sanitizePaingamePayload(body));
  }

  function sideToLabel(side) {
    if (side === "left") return "左側";
    if (side === "right") return "右側";
    return side || null;
  }

  function handToLabel(side) {
    if (side === "left") return "左手";
    if (side === "right") return "右手";
    return side || null;
  }

  function labelToSide(label) {
    if (label === "左側") return "left";
    if (label === "右側") return "right";
    return null;
  }

  function handLabelToSide(label) {
    if (label === "左手") return "left";
    if (label === "右手") return "right";
    return null;
  }

  function neckLevelToInt(level) {
    if (level === "tight") return 8;
    if (level === "normal") return 4;
    return null;
  }

  function elbowLevelToInt(level) {
    if (level === "severe") return 8;
    if (level === "mild") return 4;
    return null;
  }

  function buildRecordPayload(S, extra) {
    var payload = {};
    var cid = toInt(S.cid);
    if (cid != null) payload.CID = cid;
    if (S.neckRSide != null) payload.RTurnSide = sideToLabel(S.neckRSide);
    if (S.neckRLevel != null) payload.RTurnLevel = neckLevelToInt(S.neckRLevel);
    if (S.neckLSide != null) payload.LTurnSide = sideToLabel(S.neckLSide);
    if (S.neckLLevel != null) payload.LTurnLevel = neckLevelToInt(S.neckLLevel);
    if (S.elbowInnerSide != null)
      payload.EblowUpHand = handToLabel(S.elbowInnerSide);
    if (S.elbowInnerLevel != null)
      payload.EblowUpHandLevel = elbowLevelToInt(S.elbowInnerLevel);
    if (S.elbowOuterSide != null)
      payload.EblowDownHand = handToLabel(S.elbowOuterSide);
    if (S.elbowOuterLevel != null)
      payload.EblowDownHandLevel = elbowLevelToInt(S.elbowOuterLevel);
    if (S.firstDone != null) payload.FirstDone = ynFlag(S.firstDone);
    if (S.secondDone != null) payload.SecondDone = ynFlag(S.secondDone);
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        if (extra[k] !== undefined && extra[k] !== null) payload[k] = extra[k];
      });
    }
    return sanitizePaingamePayload(payload);
  }

  function buildRecordPatch(S, extra) {
    var payload = buildRecordPayload(S, extra);
    delete payload.CID;
    return payload;
  }

  function sanitizePaingamePayload(payload) {
    var out = {};
    Object.keys(payload || {}).forEach(function (k) {
      if (k === "Key" || k === "SafeKey") return;
      var v = payload[k];
      if (v === undefined || v === null) return;
      if (
        k === "CID" ||
        k === "RID" ||
        k === "RTurnLevel" ||
        k === "LTurnLevel" ||
        k === "EblowUpHandLevel" ||
        k === "EblowDownHandLevel" ||
        k === "ResultFeelingScore"
      ) {
        var n = toInt(v);
        if (n != null) out[k] = n;
        return;
      }
      if (k === "FirstDone" || k === "SecondDone" || k === "Doneagain") {
        out[k] = ynFlag(v);
        return;
      }
      out[k] = v;
    });
    return out;
  }

  function mapApiRecordToLocal(row) {
    if (!row) return null;
    var score = Number(row.ResultFeelingScore);
    if (isNaN(score)) score = 10;
    var feeling = row.ResultFeeling || "";
    var improved =
      score < 8 ||
      feeling.indexOf("減輕") >= 0 ||
      feeling.indexOf("改善") >= 0;
    var rLvl = Number(row.RTurnLevel) || 0;
    var lLvl = Number(row.LTurnLevel) || 0;
    var neckSide =
      rLvl >= lLvl
        ? labelToSide(row.RTurnSide) || labelToSide(row.LTurnSide)
        : labelToSide(row.LTurnSide) || labelToSide(row.RTurnSide);
    var dateStr = row.createTime || row.updateTime || "";
    return {
      id: String(row.RID || ""),
      date: String(dateStr).slice(0, 10),
      neckSide: neckSide || "right",
      dominantArm:
        handLabelToSide(row.EblowUpHand) ||
        handLabelToSide(row.EblowDownHand) ||
        "right",
      pressPoints: [],
      beforeR: 10,
      beforeL: 10,
      afterR: score,
      afterL: score,
      improved: improved,
      worse: false,
      round2: null,
      _api: row,
    };
  }

  function resultFeelingText(improvePct) {
    if (improvePct >= 40) return "明顯改善";
    if (improvePct >= 20) return "疼痛減輕";
    return "感受相近";
  }

  function extractId(data, key) {
    if (!data) return null;
    if (data[key] != null && data[key] !== "") return String(data[key]).trim();
    if (data.data && data.data[key] != null) return String(data.data[key]).trim();
    return null;
  }

  function isFail(res) {
    var d = res && res.data;
    if (!d) return !res.ok;
    if (d.result === "fail" || d.Result === "fail" || d.Result === "FAIL") return true;
    if (res.status === 405 || res.status === 500) return true;
    return !res.ok;
  }

  function appendLocalRecord(S, localRec) {
    if (!localRec) return S.records || [];
    S.records = S.records || [];
    localRec.id = S.rid || localRec.id;
    var exists = S.records.some(function (r) {
      return String(r.id) === String(localRec.id);
    });
    if (!exists) S.records.push(localRec);
    return S.records;
  }

  var PaingameAPI = {
    BASE: BASE,
    API_KEY: API_KEY,
    getDeviceInfo: getDeviceInfo,
    getLineIdFromUrl: getLineIdFromUrl,
    buildRecordPayload: buildRecordPayload,
    mapApiRecordToLocal: mapApiRecordToLocal,
    resultFeelingText: resultFeelingText,

    addCustomer: function (data) {
      return requestCustomer("POST", "/customers", data);
    },

    addPaingameRecord: function (data) {
      return requestPaingame("POST", "/paingame-records", data);
    },

    updatePaingameRecord: function (rid, data) {
      return requestPaingame(
        "PUT",
        "/paingame-records",
        Object.assign({ RID: toInt(rid) }, data)
      );
    },

    /** API 無 GET 列表，回傳 session 內紀錄 */
    fetchRecords: function (S) {
      if (!S) return Promise.resolve([]);
      S.records = S.records || [];
      return Promise.resolve(S.records);
    },

    syncCustomer: function (S, name, mobile) {
      if (!name || !mobile) return Promise.resolve(null);
      S.lineId = S.lineId || getLineIdFromUrl();
      var body = {
        Name: name,
        Mobile: mobile,
        deviceInfo: getDeviceInfo(),
      };
      if (S.lineId) body.LineID = S.lineId;

      return PaingameAPI.addCustomer(body).then(function (res) {
        var cid = extractId(res.data, "CID");
        if (cid) {
          S.cid = cid;
          return S.cid;
        }
        console.warn(
          "[PaingameAPI] addCustomer:",
          (res.data && (res.data.message || res.data.Message)) || res.status
        );
        return null;
      });
    },

    ensurePaingameRecord: function (S) {
      if (S.rid || !S.cid) return Promise.resolve(S.rid || null);
      var payload = buildRecordPayload(S);
      if (!payload.CID) return Promise.resolve(null);
      return PaingameAPI.addPaingameRecord(payload).then(function (res) {
        var rid = extractId(res.data, "RID");
        if (rid) {
          S.rid = rid;
          return S.rid;
        }
        if (res.status === 500) {
          console.warn("[PaingameAPI] addPaingameRecord: server 500");
          return null;
        }
        console.warn(
          "[PaingameAPI] addPaingameRecord:",
          (res.data && (res.data.message || res.data.Message || res.data.Result)) ||
            res.status
        );
        return null;
      });
    },

    patchRecord: function (S, fields) {
      if (!S.rid) return Promise.resolve(null);
      return PaingameAPI.updatePaingameRecord(S.rid, fields).then(function (res) {
        if (isFail(res)) {
          console.warn(
            "[PaingameAPI] updatePaingameRecord:",
            (res.data && (res.data.message || res.data.Message || res.data.Result)) ||
              res.status
          );
        }
        return res;
      });
    },

    pushState: function (S, extra) {
      if (!S.cid) return Promise.resolve(null);
      return PaingameAPI.ensurePaingameRecord(S).then(function (rid) {
        if (!rid) return null;
        return PaingameAPI.patchRecord(S, buildRecordPatch(S, extra));
      });
    },

    onLogin: function (S, name, mobile) {
      S.lineId = S.lineId || getLineIdFromUrl();
      return PaingameAPI.syncCustomer(S, name, mobile);
    },

    onResult: function (S, improvePct, mainAfterScore, localRec) {
      return PaingameAPI.pushState(S, {
        ResultFeeling: resultFeelingText(improvePct),
        ResultFeelingScore: mainAfterScore,
        Doneagain: "N",
      }).then(function () {
        return appendLocalRecord(S, localRec);
      });
    },

    onRestart: function (S) {
      var p = S.rid
        ? PaingameAPI.patchRecord(S, { Doneagain: "Y" })
        : Promise.resolve(null);
      return p.then(function () {
        S.rid = null;
        S.firstDone = null;
        S.secondDone = null;
      });
    },

    resetSession: function (S) {
      S.cid = null;
      S.rid = null;
      S.firstDone = null;
      S.secondDone = null;
      S.records = [];
    },
  };

  global.PaingameAPI = PaingameAPI;
})(typeof window !== "undefined" ? window : this);
