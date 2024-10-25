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
const VIEW_FINISH_BTN_HOME = "f_eid_btn_home";
const VIEW_BACK_BTN_HOME = "f_back";
const VIEW_FINISH_SP_PREFIX = "images/icon_sp_";
// ==============================================================

// Finish Page
// ==============================================================
let _finish_spower_chart = null;
let _finish_vital_result_printer = null;
const SetSPowerValue = (id, value) => {
  if (value >= 0) {
    document.getElementById(id).src =  `${VIEW_FINISH_SP_PREFIX}${value}.svg`;
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
    hr_id:   VIEW_FINISH_HR,
    hrv_id:  VIEW_FINISH_HRV,
    sbp_id:  VIEW_FINISH_SBP,
    dbp_id:  VIEW_FINISH_DBP,
    rr_id:   VIEW_FINISH_RR,
    spo2_id: VIEW_FINISH_SPO2,
    si_id:   VIEW_FINISH_SI,
    bioage_id: VIEW_FINISH_BIOAGE,
    ba2_id: VIEW_FINISH_BA2,
    ba4_id: VIEW_FINISH_BA4
  });
  _finish_vital_result_printer.setAnsIndexElement({
    ans_index_sns_id: VIEW_FINISH_ANS_INDEX_SNS,
    ans_index_pns_id: VIEW_FINISH_ANS_INDEX_PNS
  });

  _finish_spower_chart = new SPowerChart(
    document.getElementById(VIEW_FINISH_CANVAS_SP).getContext("2d")
  );
  document.getElementById(VIEW_FINISH_BTN_HOME).onclick = ()=> GoToBasicInfo()
  document.getElementById(VIEW_BACK_BTN_HOME).onclick = ()=> GoToBasicInfo()
};

const GoToFinish = () => {
  _finish_spower_chart.reset();
  _finish_vital_result_printer.reset();
  let result = JSON.parse(sessionStorage.getItem("result"));
  let upbioage=0;
  let upba2=0;
  let upba4=0;

  SetSPowerValue(VIEW_FINISH_ACTIVITY,    result.activity);
  SetSPowerValue(VIEW_FINISH_EQUILIBRIUM, result.equilibrium);
  SetSPowerValue(VIEW_FINISH_HEALTH,      result.health);
  SetSPowerValue(VIEW_FINISH_METABOLISM,  result.metabolism);
  SetSPowerValue(VIEW_FINISH_RELAXATION,  result.relaxation);
  SetSPowerValue(VIEW_FINISH_SLEEP,       result.sleep);
  
  let storedData = JSON.parse(sessionStorage.getItem("Age"));
  //console.log(storedData); // 這裡你將看到存入的 nArray 陣列
  //alert(storedData);

  if (storedData.length > 0) {
    // 建立三個陣列來分別存儲 A, B, C
    let aValues = [];
    let bValues = [];
    let cValues = [];
  
    // 遍歷 storedData，取出正值並分別存入三個陣列
    storedData.forEach(data => {
      let [a, b, c] = data;
      if (a > 0 && a<100) aValues.push(a);
      if (b > 0 && b<100) bValues.push(b);
      if (c > 0 && c<100) cValues.push(c);
    });
  
    // 計算平均值的函數
    const calculateAverage = (values) => {
      if (values.length === 0) return 0; // 避免除以 0
      let sum = values.reduce((acc, val) => acc + val, 0);
      return sum / values.length;
    };
    console.log(storedData)
    console.log(cValues)
   
// 函數：計算移除極端值後的平均數
  function trimmedMean(arr, trimPercent) {
  // 先對數據進行排序
    const sortedArr = arr.slice().sort((a, b) => a - b);
  // 計算要移除的數據筆數
    const trimCount = Math.floor(trimPercent * sortedArr.length);
  // 移除最小和最大指定百分比的數據
    const trimmedArr = sortedArr.slice(trimCount, sortedArr.length - trimCount);
  // 計算剩餘數據的平均數
    const sum = trimmedArr.reduce((acc, value) => acc + value, 0);
    const mean = sum / trimmedArr.length;
    return mean;
  }
  // 假設移除最小與最大各10%的數據
    const trimPercent = 0.1;  // 移除10%資料

 // 計算 A, B, C 的平均值
    //upbioage = calculateAverage(aValues);
    //upba2 = calculateAverage(bValues);
    //upba4 = calculateAverage(cValues);
    upbioage = trimmedMean(aValues, trimPercent);
    upba2 = trimmedMean(bValues, trimPercent);
    upba4 = trimmedMean(cValues, trimPercent);

    console.log("result:"+sessionStorage.getItem("result"));
    // alert("result:"+sessionStorage.getItem("result"));

    // 顯示結果
    console.log(`upbioage: ${upbioage}, upba2: ${upba2}, upba4: ${upba4}`);


  } else {
    console.log("No stored data available.");
    alert("No stored data available.");
  }

  _finish_vital_result_printer.update({
    hr:                result.hr,
    hrv:               result.hrv_indices.SDNNI,
    sbp:               result.sbp,
    dbp:               result.dbp,
    rr:                result.rr,
    spo2:              result.spo2,
    si:                result.si,
    ans_index_sns:     result.ANSIndex.SNS,
    ans_index_pns:     result.ANSIndex.PNS,
    hr_valid:          (result.signal_quality.hr_hrv > 0.7),
    bp_valid:          (result.signal_quality.bp > 0.6),
    rr_valid:          (result.signal_quality.resp > 0.7),
    spo2_valid:        (result.signal_quality.spo2 > 0.9),
    bioage:            upbioage,
    ba2:               upba2,
    ba4:               upba4
  });

  setTimeout(() => {
    _finish_spower_chart.update({
      activity:    result.activity,
      equilibrium: result.equilibrium,
      health:      result.health,
      metabolism:  result.metabolism,
      relaxation:  result.relaxation,
      sleep:       result.sleep,
    });
  }, 200);
};

const GoToBasicInfo = () => {
  window.location.href = "basic_info.html";
}
// ==============================================================

document.addEventListener("DOMContentLoaded", () => {
  InitFinish();
  GoToFinish();
});
