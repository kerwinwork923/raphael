/**
 * 依登入部門 (A1–A9) 自動切換日報填寫畫面
 */
(function () {
  var SHIFT_HOURS_SM = {
    看診班: 8,
    行政班: 8,
    混合班: 8,
    活動班: 4,
    專案支援班: 4,
  };
  var SHIFT_HOURS_CS = {
    早班: 8,
    晚班: 5.5,
    假日班: 6,
    支援班: 2,
    遠端客服班: 4,
  };

  var opsState = {
    shift: "",
    location: "",
    feeling: "",
    actualWorkHours: 0,
    totalWorkHours: 0,
  };

  var paneCtx = {
    mode: "standard",
    deptKey: "A1",
    prjList: [],
    locations: [],
    shifts: [],
    workCategories: [],
    workDescHints: [],
    escapeHtml: function (s) {
      return String(s || "");
    },
    onHoursChange: function () {},
  };

  function getMode(deptKey) {
    if (typeof window.projectOSGetReportMode === "function") {
      return window.projectOSGetReportMode(deptKey);
    }
    return "standard";
  }

  function getShiftList(mode) {
    if (mode === "ops-cs") return Object.keys(SHIFT_HOURS_CS);
    if (mode === "ops-sm") {
      if (paneCtx.shifts && paneCtx.shifts.length) return paneCtx.shifts;
      return Object.keys(SHIFT_HOURS_SM);
    }
    return [];
  }

  function getShiftHoursMap(mode) {
    if (mode === "ops-cs") return SHIFT_HOURS_CS;
    if (mode === "ops-sm") return SHIFT_HOURS_SM;
    return {};
  }

  function getCategories() {
    var list = (paneCtx.workCategories || [])
      .map(function (x) {
        return String(x || "").trim();
      })
      .filter(Boolean);
    if (list.length) return list;
    if (typeof window.projectOSGetDeptCategoryDefaults === "function") {
      return window.projectOSGetDeptCategoryDefaults(paneCtx.deptKey);
    }
    return ["系統開發", "資料分析", "會議溝通", "文件撰寫", "行政作業", "其他"];
  }

  function buildSelectOptions(options, selected, emptyLabel) {
    var sel = String(selected || "").trim();
    var html = emptyLabel
      ? '<option value="">' + paneCtx.escapeHtml(emptyLabel) + "</option>"
      : "";
    (options || []).forEach(function (opt) {
      var v = String(opt || "").trim();
      if (!v) return;
      html +=
        '<option value="' +
        paneCtx.escapeHtml(v) +
        '"' +
        (sel === v ? " selected" : "") +
        ">" +
        paneCtx.escapeHtml(v) +
        "</option>";
    });
    if (sel && !(options || []).some(function (o) { return String(o).trim() === sel; })) {
      html +=
        '<option value="' +
        paneCtx.escapeHtml(sel) +
        '" selected>' +
        paneCtx.escapeHtml(sel) +
        "（歷史）</option>";
    }
    return html;
  }

  function normalizePrjEntry(opt) {
    if (opt && typeof opt === "object") {
      return {
        ProjectName: String(
          opt.ProjectName != null ? opt.ProjectName : opt.projectName || "",
        ).trim(),
        ProjectId: String(
          opt.ProjectId != null ? opt.ProjectId : opt.projectId || "",
        ).trim(),
      };
    }
    return { ProjectName: String(opt || "").trim(), ProjectId: "" };
  }

  function resolveProjectIdFromList(name, id) {
    var pid = String(id != null ? id : "").trim();
    if (pid) return pid;
    var n = String(name || "").trim();
    if (!n) return "";
    var found = (paneCtx.prjList || []).find(function (p) {
      var entry = normalizePrjEntry(p);
      return entry.ProjectName === n;
    });
    return found ? normalizePrjEntry(found).ProjectId : "";
  }

  function buildProjectSelectOptions(prjList, selectedName, selectedId, emptyLabel) {
    var selName = String(selectedName || "").trim();
    var selId = String(selectedId || "").trim();
    var html = emptyLabel
      ? '<option value="">' + paneCtx.escapeHtml(emptyLabel) + "</option>"
      : "";
    (prjList || []).forEach(function (opt) {
      var entry = normalizePrjEntry(opt);
      if (!entry.ProjectName) return;
      var isSelected = selName === entry.ProjectName || (selId && selId === entry.ProjectId);
      html +=
        '<option value="' +
        paneCtx.escapeHtml(entry.ProjectName) +
        '" data-project-id="' +
        paneCtx.escapeHtml(entry.ProjectId) +
        '"' +
        (isSelected ? " selected" : "") +
        ">" +
        paneCtx.escapeHtml(entry.ProjectName) +
        "</option>";
    });
    if (
      selName &&
      !(prjList || []).some(function (p) {
        return normalizePrjEntry(p).ProjectName === selName;
      })
    ) {
      html +=
        '<option value="' +
        paneCtx.escapeHtml(selName) +
        '" data-project-id="' +
        paneCtx.escapeHtml(selId) +
        '" selected>' +
        paneCtx.escapeHtml(selName) +
        "（歷史）</option>";
    }
    return html;
  }

  function bindProjectSelect(tr, initialProjectId) {
    var projSel = tr.querySelector('[data-key="ProjectName"]');
    var projIdEl = tr.querySelector('[data-key="ProjectId"]');
    if (!projSel || !projIdEl) return;
    var syncProjectId = function () {
      var opt = projSel.options[projSel.selectedIndex];
      var id = opt ? String(opt.getAttribute("data-project-id") || "").trim() : "";
      if (!id && projSel.value) {
        id = resolveProjectIdFromList(projSel.value, "");
      }
      projIdEl.value = id;
    };
    if (initialProjectId) {
      projIdEl.value = String(initialProjectId).trim();
    }
    projSel.addEventListener("change", syncProjectId);
    syncProjectId();
  }

  function prodQtyInput(key, value) {
    return (
      '<input data-key="' +
      key +
      '" data-qty type="number" min="0" step="1" value="' +
      paneCtx.escapeHtml(value || "") +
      '" class="qty-spin w-full border border-slate-200 rounded px-2 py-1.5" />'
    );
  }

  function bindRowHours(tr) {
    var hoursEl = tr.querySelector('[data-key="hours"]');
    if (hoursEl) {
      hoursEl.addEventListener("input", function () {
        paneCtx.onHoursChange();
      });
    }
  }

  function sumItemsBodyHours(tbodyId) {
    var rows = Array.from(
      document.querySelectorAll("#" + (tbodyId || "itemsBody") + " tr"),
    );
    return rows.reduce(function (sum, tr) {
      var el = tr.querySelector('[data-key="hours"]');
      var h = parseFloat(String(el && el.value ? el.value : "0"));
      return sum + (isNaN(h) ? 0 : h);
    }, 0);
  }

  function addStdRow(tbodyId, item, isProd) {
    var body = document.getElementById(tbodyId);
    if (!body) return;
    var data = item || {};
    var cats = getCategories();
    var projectId = resolveProjectIdFromList(data.ProjectName, data.ProjectId);
    var tr = document.createElement("tr");
    tr.dataset.bid = String(data.BID || "").trim();
    tr.dataset.aid = String(data.AID || "").trim();

    if (isProd) {
      tr.innerHTML =
        '<td class="px-2 py-2"><input data-key="desc" value="' +
        paneCtx.escapeHtml(data.desc) +
        '" class="w-full border border-slate-200 rounded px-2 py-1.5" /></td>' +
        '<td class="px-2 py-2"><select data-key="category" class="w-full border border-slate-200 rounded px-2 py-1.5">' +
        buildSelectOptions(cats, data.category, "請選擇") +
        "</select></td>" +
        '<td class="px-2 py-2"><input type="hidden" data-key="ProjectId" value="' +
        paneCtx.escapeHtml(projectId) +
        '" /><select data-key="ProjectName" class="w-full border border-slate-200 rounded px-2 py-1.5">' +
        buildProjectSelectOptions(
          paneCtx.prjList,
          data.ProjectName,
          projectId,
          "請選擇專案",
        ) +
        "</select></td>" +
        '<td class="px-2 py-2"><input data-key="hours" value="' +
        paneCtx.escapeHtml(data.hours) +
        '" type="number" min="0" step="0.5" class="w-full border border-slate-200 rounded px-2 py-1.5" /></td>' +
        '<td class="px-2 py-2">' +
        prodQtyInput("ALLPrdCnt", data.ALLPrdCnt) +
        "</td>" +
        '<td class="px-2 py-2"><select data-key="status" class="w-full border border-slate-200 rounded px-2 py-1.5">' +
        '<option value="">請選擇</option><option value="進行中"' +
        (data.status === "進行中" ? " selected" : "") +
        '>進行中</option><option value="已完成"' +
        (data.status === "已完成" ? " selected" : "") +
        '>已完成</option><option value="待處理"' +
        (data.status === "待處理" ? " selected" : "") +
        ">待處理</option></select></td>" +
        '<td class="px-2 py-2 text-center"><button type="button" class="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">刪除</button></td>';
    } else {
      tr.innerHTML =
        '<td class="px-2 py-2"><input data-key="desc" value="' +
        paneCtx.escapeHtml(data.desc) +
        '" class="w-full border border-slate-200 rounded px-2 py-1.5"  /></td>' +
        '<td class="px-2 py-2"><select data-key="category" class="w-full border border-slate-200 rounded px-2 py-1.5">' +
        buildSelectOptions(cats, data.category, "請選擇") +
        "</select></td>" +
        '<td class="px-2 py-2"><input type="hidden" data-key="ProjectId" value="' +
        paneCtx.escapeHtml(projectId) +
        '" /><select data-key="ProjectName" class="w-full border border-slate-200 rounded px-2 py-1.5">' +
        buildProjectSelectOptions(
          paneCtx.prjList,
          data.ProjectName,
          projectId,
          "請選擇專案",
        ) +
        "</select></td>" +
        '<td class="px-2 py-2"><input data-key="hours" value="' +
        paneCtx.escapeHtml(data.hours) +
        '" type="number" min="0" step="0.5" class="w-full border border-slate-200 rounded px-2 py-1.5" /></td>' +
        '<td class="px-2 py-2"><select data-key="status" class="w-full border border-slate-200 rounded px-2 py-1.5">' +
        '<option value="">請選擇</option><option value="進行中"' +
        (data.status === "進行中" ? " selected" : "") +
        '>進行中</option><option value="已完成"' +
        (data.status === "已完成" ? " selected" : "") +
        '>已完成</option><option value="待處理"' +
        (data.status === "待處理" ? " selected" : "") +
        ">待處理</option></select></td>" +
        '<td class="px-2 py-2 text-center"><button type="button" class="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">刪除</button></td>';
    }

    bindProjectSelect(tr, projectId);

    tr.querySelector("button").addEventListener("click", function () {
      tr.remove();
      paneCtx.onHoursChange();
    });
    bindRowHours(tr);
    body.appendChild(tr);
  }

  function stdTableHtml(isProd) {
    if (isProd) {
      return (
        '<div class="overflow-x-auto"><table class="item-table"><thead><tr>' +
        "<th>產品/工作項目</th><th>工作類別</th><th>專案</th><th>工時</th>" +
        "<th>生產數量</th><th>狀態</th><th>刪除</th>" +
        '</tr></thead><tbody id="itemsBody"></tbody></table></div>' +
        '<button type="button" id="btnAddRow" class="add-row-btn">+ 新增項目</button>'
      );
    }
    return (
      '<div class="overflow-x-auto"><table class="item-table"><thead><tr>' +
      '<th class="min-w-[220px]">工作內容</th><th class="min-w-[130px]">工作類別</th>' +
      '<th class="min-w-[180px]">專案</th><th class="min-w-[100px]">工時</th>' +
      '<th class="min-w-[120px]">狀態</th><th class="w-[68px]">刪除</th>' +
      '</tr></thead><tbody id="itemsBody"></tbody></table></div>' +
      '<button type="button" id="btnAddRow" class="add-row-btn">+ 新增項目</button>'
    );
  }

  function syncOpsHoursFromItems() {
    opsState.totalWorkHours = sumItemsBodyHours("itemsBody");
    opsState.actualWorkHours = opsState.totalWorkHours;
    paneCtx.onHoursChange();
  }

  function setOpsFeeling(val, btn) {
    opsState.feeling = val;
    document.querySelectorAll(".ops-feel-btn").forEach(function (b) {
      b.classList.remove("ring-2", "ring-blue-400", "bg-blue-50");
    });
    if (btn) btn.classList.add("ring-2", "ring-blue-400", "bg-blue-50");
  }

  function selectOpsShift(shiftName) {
    opsState.shift = shiftName;
    document.querySelectorAll(".shift-btn").forEach(function (btn) {
      btn.classList.toggle("sel", btn.getAttribute("data-shift") === shiftName);
    });
    syncOpsHoursFromItems();
  }

  function buildCsShiftButtons() {
    return Object.keys(SHIFT_HOURS_CS)
      .map(function (s) {
        return (
          '<button type="button" class="shift-btn" data-shift="' +
          paneCtx.escapeHtml(s) +
          '">' +
          paneCtx.escapeHtml(s) +
          "</button>"
        );
      })
      .join("");
  }

  function buildFeelingBlock() {
    return (
      '<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">' +
      '<div class="text-xs font-bold text-slate-600 mb-2">今日班別感受</div>' +
      '<div class="grid grid-cols-2 md:grid-cols-4 gap-2">' +
      '<button type="button" class="ops-feel-btn border border-slate-200 rounded-lg p-2 text-left text-xs" data-feel="穩定">😊 穩定</button>' +
      '<button type="button" class="ops-feel-btn border border-slate-200 rounded-lg p-2 text-left text-xs" data-feel="忙碌">⚡ 忙碌</button>' +
      '<button type="button" class="ops-feel-btn border border-slate-200 rounded-lg p-2 text-left text-xs" data-feel="壓力偏高">😤 壓力偏高</button>' +
      '<button type="button" class="ops-feel-btn border border-slate-200 rounded-lg p-2 text-left text-xs" data-feel="超載">🔥 超載</button>' +
      "</div></div>"
    );
  }

  function buildOpsPane(mode) {
    var isSM = mode === "ops-sm";
    opsState = {
      shift: "",
      location: "",
      feeling: "",
      actualWorkHours: 0,
      totalWorkHours: 0,
    };

    if (isSM) {
      var locSelect =
        '<select id="ops-location" class="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white">' +
        buildSelectOptions(paneCtx.locations, "", "— 請選擇院所 —") +
        "</select>";
      var shiftSelect =
        '<select id="ops-shift" class="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white">' +
        buildSelectOptions(getShiftList(mode), "", "— 請選擇班別 —") +
        "</select>";
      return (
        '<div class="space-y-4">' +
        '<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">' +
        '<div class="text-xs font-bold text-slate-600 mb-3">📍 院所與班別</div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">' +
        '<div><label class="block text-xs text-slate-500 mb-1">院所 / 地點</label>' +
        locSelect +
        "</div>" +
        '<div><label class="block text-xs text-slate-500 mb-1">班別</label>' +
        shiftSelect +
        "</div></div></div>" +
        buildFeelingBlock() +
        '<div class="text-xs font-bold text-slate-600">工作項目紀錄</div>' +
        stdTableHtml(false) +
        "</div>"
      );
    }

    return (
      '<div class="space-y-4">' +
      '<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">' +
      '<div class="text-xs font-bold text-slate-600 mb-2">🕐 今天什麼班？</div>' +
      '<div class="ops-shift-grid" id="ops-shift-grp">' +
      buildCsShiftButtons() +
      "</div></div>" +
      buildFeelingBlock() +
      '<div class="text-xs font-bold text-slate-600">工作項目紀錄</div>' +
      stdTableHtml(false) +
      "</div>"
    );
  }

  function bindOpsPaneEvents(mode) {
    var isSM = mode === "ops-sm";
    if (isSM) {
      var loc = document.getElementById("ops-location");
      var shift = document.getElementById("ops-shift");
      if (loc) {
        loc.addEventListener("change", function () {
          opsState.location = loc.value;
        });
      }
      if (shift) {
        shift.addEventListener("change", function () {
          selectOpsShift(shift.value);
        });
      }
    } else {
      document.querySelectorAll(".shift-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          selectOpsShift(btn.getAttribute("data-shift"));
        });
      });
    }
    document.querySelectorAll(".ops-feel-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setOpsFeeling(btn.getAttribute("data-feel"), btn);
      });
    });
  }

  window.ProjectOSDailyReportDept = {
    getOpsState: function () {
      return Object.assign({}, opsState);
    },

    configure: function (ctx) {
      paneCtx.mode = ctx.mode || "standard";
      paneCtx.deptKey = ctx.deptKey || "A1";
      paneCtx.prjList = ctx.prjList || [];
      paneCtx.locations = ctx.locations || [];
      paneCtx.shifts = ctx.shifts || [];
      paneCtx.workCategories = ctx.workCategories || [];
      paneCtx.escapeHtml = ctx.escapeHtml || function (s) { return String(s || ""); };
      paneCtx.onHoursChange = ctx.onHoursChange || function () {};
    },

    buildPane: function (deptKey, dailyCommon) {
      deptKey = deptKey || "A1";
      var mode = getMode(deptKey);
      paneCtx.deptKey = deptKey;
      paneCtx.mode = mode;
      if (dailyCommon) {
        paneCtx.prjList = dailyCommon.prjList || [];
        paneCtx.locations = dailyCommon.locations || [];
      }

      var wrap = document.getElementById("dept-pane");
      if (!wrap) return mode;

      var isProd = mode === "production";
      var isOps = mode === "ops-sm" || mode === "ops-cs";

      if (isOps) {
        wrap.innerHTML = buildOpsPane(mode);
        bindOpsPaneEvents(mode);
        addStdRow("itemsBody", {});
      } else {
        wrap.innerHTML = stdTableHtml(isProd);
        addStdRow("itemsBody", {}, isProd);
      }
      return mode;
    },

    clearPane: function (deptKey, dailyCommon) {
      this.buildPane(deptKey, dailyCommon);
    },

    addRow: function (tbodyId, item) {
      var isProd = paneCtx.mode === "production";
      addStdRow(tbodyId || "itemsBody", item, isProd);
    },

    readItemsFromTbody: function (tbodyId) {
      var isProd = paneCtx.mode === "production";
      var rows = Array.from(document.querySelectorAll("#" + (tbodyId || "itemsBody") + " tr"));
      return rows
        .map(function (tr) {
          var row = {
            BID: String(tr.dataset.bid || "").trim(),
            AID: String(tr.dataset.aid || "").trim(),
            desc: "",
            ProjectId: "",
            ProjectName: "",
            category: "",
            hours: "",
            status: "",
          };
          if (isProd) {
            row.ALLPrdCnt = "";
          }
          tr.querySelectorAll("[data-key]").forEach(function (el) {
            row[el.dataset.key] = String(el.value || "").trim();
          });
          if (!row.ProjectId && row.ProjectName) {
            row.ProjectId = resolveProjectIdFromList(row.ProjectName, "");
          }
          return row;
        })
        .filter(function (x) {
          return x.desc || x.ProjectName || x.category || x.hours || x.status;
        });
    },

    readReportMeta: function () {
      var mode = paneCtx.mode;
      if (mode === "ops-sm" || mode === "ops-cs") {
        if (mode === "ops-sm") {
          var loc = document.getElementById("ops-location");
          if (loc) opsState.location = loc.value;
        } else {
          opsState.location = "";
        }
        syncOpsHoursFromItems();
        return {
          shift: opsState.shift,
          location: opsState.location,
          feeling: opsState.feeling,
          actualWorkHours: "",
          totalHours: String(opsState.totalWorkHours),
        };
      }
      return {
        shift: "",
        location: "",
        feeling: "",
        actualWorkHours: "",
        totalHours: "",
      };
    },

    applyReportMeta: function (report) {
      var r = report || {};
      var mode = paneCtx.mode;
      if (mode !== "ops-sm" && mode !== "ops-cs") return;

      if (mode === "ops-sm") {
        var loc = document.getElementById("ops-location");
        if (loc) loc.value = String(r.location || "");
        opsState.location = String(r.location || "");
      }

      opsState.shift = String(r.shift || "");
      opsState.feeling = String(r.feeling || "");

      if (mode === "ops-cs") {
        document.querySelectorAll(".shift-btn").forEach(function (btn) {
          btn.classList.toggle("sel", btn.getAttribute("data-shift") === opsState.shift);
        });
      } else {
        var shiftSel = document.getElementById("ops-shift");
        if (shiftSel) shiftSel.value = opsState.shift;
      }

      document.querySelectorAll(".ops-feel-btn").forEach(function (btn) {
        if (btn.getAttribute("data-feel") === opsState.feeling) {
          setOpsFeeling(opsState.feeling, btn);
        }
      });
      syncOpsHoursFromItems();
    },

    calcTotalHours: function (tbodyId) {
      return sumItemsBodyHours(tbodyId || "itemsBody");
    },

    getMode: function () {
      return paneCtx.mode;
    },
  };
})();
