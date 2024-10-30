// HTML element ID List
// ==============================================================
const VIEW_FINISH_HR = "f_v_hr";
const VIEW_FINISH_HRV = "f_v_hrv";
const VIEW_FINISH_BIOAGE = "f_v_bioage";
const VIEW_FINISH_BA2 = "f_v_ba2";
const VIEW_FINISH_BA4 = "f_v_ba4";
const VIEW_FINISH_SBP = "f_v_sbp";
const VIEW_FINISH_DBP = "f_v_dbp";
const VIEW_FINISH_SPO2 = "f_v_spo2";
const VIEW_FINISH_RR = "f_v_rr";
const VIEW_FINISH_SI = "f_v_si";

const VIEW_FINISH_ANS_INDEX_SNS = "f_v_ans_index_sns";
const VIEW_FINISH_ANS_INDEX_PNS = "f_v_ans_index_pns";

const VIEW_FINISH_CANVAS_SP = "f_spower_canvas";
const VIEW_FINISH_ACTIVITY = "f_v_activity";
const VIEW_FINISH_EQUILIBRIUM = "f_v_equilibrium";
const VIEW_FINISH_HEALTH = "f_v_health";
const VIEW_FINISH_METABOLISM = "f_v_metabolism";
const VIEW_FINISH_RELAXATION = "f_v_relaxation";
const VIEW_FINISH_SLEEP = "f_v_sleep";
// const VIEW_FINISH_BTN_HOME = "f_eid_btn_home";
// const VIEW_BACK_BTN_HOME = "f_back";
const VIEW_FINISH_SP_PREFIX = "images/raphael/progress";
// ==============================================================

// Finish Page
// ==============================================================
let _finish_spower_chart = null;
let _finish_vital_result_printer = null;
const SetSPowerValue = (id, value) => {
  if (value >= 0) {
    document.getElementById(id).src =  `${VIEW_FINISH_SP_PREFIX}${value}.png`;
    show(id)
  }
  else {
    document.getElementById(id).src = ''
    hide(id)
  }
};

const InitFinish = () => {
  _finish_vital_result_printer = new VitalResultPrinter();
  _finish_vital_result_printer.setDefaultElement({
    hr_id: VIEW_FINISH_HR,
    hrv_id: VIEW_FINISH_HRV,
    sbp_id: VIEW_FINISH_SBP,
    dbp_id: VIEW_FINISH_DBP,
    rr_id: VIEW_FINISH_RR,
    spo2_id: VIEW_FINISH_SPO2,
    si_id: VIEW_FINISH_SI,
    bioage_id: VIEW_FINISH_BIOAGE,
    ba2_id: VIEW_FINISH_BA2,
    ba4_id: VIEW_FINISH_BA4
  });
  _finish_vital_result_printer.setAnsIndexElement({
    ans_index_sns_id: VIEW_FINISH_ANS_INDEX_SNS,
    ans_index_pns_id: VIEW_FINISH_ANS_INDEX_PNS
  });

  // 檢查 SPowerChart 是否存在
  // if (typeof SPowerChart !== 'undefined') {
  //   _finish_spower_chart = new SPowerChart(
  //     document.getElementById(VIEW_FINISH_CANVAS_SP).getContext("2d")
  //   );
  // } else {
  //   console.error("SPowerChart is not defined. Please ensure it is correctly included.");
  // }
};


const GoToFinish = () => {
  // 檢查 _finish_spower_chart 是否已初始化，避免 null 錯誤
  if (_finish_spower_chart) {
    _finish_spower_chart.reset();
  } else {
    console.warn("SPowerChart is not initialized.");
  }

  // 檢查 _finish_vital_result_printer 是否已初始化，避免 null 錯誤
  if (_finish_vital_result_printer) {
    _finish_vital_result_printer.reset();
  } else {
    console.warn("VitalResultPrinter is not initialized.");
  }

  let result = JSON.parse(sessionStorage.getItem("result"));
  let upbioage = 0;
  let upba2 = 0;
  let upba4 = 0;

  // 設定各項值
  SetSPowerValue(VIEW_FINISH_ACTIVITY, result.activity);
  SetSPowerValue(VIEW_FINISH_EQUILIBRIUM, result.equilibrium);
  SetSPowerValue(VIEW_FINISH_HEALTH, result.health);
  SetSPowerValue(VIEW_FINISH_METABOLISM, result.metabolism);
  SetSPowerValue(VIEW_FINISH_RELAXATION, result.relaxation);
  SetSPowerValue(VIEW_FINISH_SLEEP, result.sleep);

  let storedData = JSON.parse(sessionStorage.getItem("Age"));
  
  // 確認是否有資料
  if (storedData && storedData.length > 0) {
    // 處理 storedData 資料
    // ...
  } else {
    console.log("No stored data available.");
    alert("No stored data available.");
  }

  // 更新結果
  if (_finish_vital_result_printer) {
    _finish_vital_result_printer.update({
      hr: result.hr,
      hrv: result.hrv_indices.SDNNI,
      sbp: result.sbp,
      dbp: result.dbp,
      rr: result.rr,
      spo2: result.spo2,
      si: result.si,
      ans_index_sns: result.ANSIndex.SNS,
      ans_index_pns: result.ANSIndex.PNS,
      hr_valid: (result.signal_quality.hr_hrv > 0.7),
      bp_valid: (result.signal_quality.bp > 0.6),
      rr_valid: (result.signal_quality.resp > 0.7),
      spo2_valid: (result.signal_quality.spo2 > 0.9),
      bioage: upbioage,
      ba2: upba2,
      ba4: upba4
    });
  }

  setTimeout(() => {
    if (_finish_spower_chart) {
      _finish_spower_chart.update({
        activity: result.activity,
        equilibrium: result.equilibrium,
        health: result.health,
        metabolism: result.metabolism,
        relaxation: result.relaxation,
        sleep: result.sleep,
      });
    }
  }, 200);
};


// const GoToBasicInfo = () => {
//   window.location.href = "basic_info.html";
// }
// ==============================================================

document.addEventListener("DOMContentLoaded", () => {
  InitFinish();
  GoToFinish();
});
