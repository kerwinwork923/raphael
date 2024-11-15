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
const VIEW_FINISH_SYN = "f_v_syn"; //交感佔比%

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
// let _finish_spower_chart = null;
let _finish_vital_result_printer = null;
let infodata = JSON.parse(sessionStorage.getItem("data"));

const SetSPowerValue = (id, value) => {
  if (value >= 0) {
    document.getElementById(id).src = `${VIEW_FINISH_SP_PREFIX}${value}.svg`;
    show(id);
  } else {
    document.getElementById(id).src = "";
    hide(id);
  }
};

function SDNNdetermineAge(SDNN, gender) {
  const ageGroups = [
    { ageMax: 0.083, male: 99.6, female: 109.2 }, // <1 month
    { ageMax: 0.167, male: 99.4, female: 108.8 }, // 1 to 2 months
    { ageMax: 0.417, male: 98.8, female: 108.1 }, // 3 to 5 months
    { ageMax: 0.917, male: 98.1, female: 107.1 }, // 6 to 11 months
    { ageMax: 2, male: 95.4, female: 103.8 }, // 1 to 2 years
    { ageMax: 4, male: 91.3, female: 98.6 },
    { ageMax: 7, male: 86.0, female: 92.3 },
    { ageMax: 11, male: 78.3, female: 84.0 },
    { ageMax: 15, male: 69.3, female: 75.2 },
    { ageMax: 19, male: 60.7, female: 67.3 },
    { ageMax: 29, male: 48.5, female: 56.0 },
    { ageMax: 39, male: 37.5, female: 43.4 },
    { ageMax: 49, male: 30.4, female: 33.3 },
    { ageMax: 59, male: 24.4, female: 25.6 },
    { ageMax: 69, male: 20.4, female: 20.7 },
    { ageMax: 79, male: 17.8, female: 17.9 },
    { ageMax: 89, male: 15.6, female: 16.1 },
  ];

  let genderKey = "male";
  if (gender == 1) {
    genderKey = "male";
  } else {
    genderKey = "female";
  }
  console.log("genderKey=", genderKey, "/SDNN=", SDNN);

  for (let i = 0; i < ageGroups.length - 1; i++) {
    const currentGroup = ageGroups[i];
    const nextGroup = ageGroups[i + 1];

    const currentSDNN = currentGroup[genderKey];
    const nextSDNN = nextGroup[genderKey];

    if (SDNN <= currentSDNN && SDNN >= nextSDNN) {
      // 使用線性插值計算年齡
      const ageEstimate =
        currentGroup.ageMax +
        ((SDNN - currentSDNN) / (nextSDNN - currentSDNN)) *
        (nextGroup.ageMax - currentGroup.ageMax);
      return ageEstimate;
    }
  }
  return 0;
}

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
    ba4_id: VIEW_FINISH_BA4,
    syn_id: VIEW_FINISH_SYN,
  });
  _finish_vital_result_printer.setAnsIndexElement({
    ans_index_sns_id: VIEW_FINISH_ANS_INDEX_SNS,
    ans_index_pns_id: VIEW_FINISH_ANS_INDEX_PNS,
  });

  // _finish_spower_chart = new SPowerChart(
  //   document.getElementById(VIEW_FINISH_CANVAS_SP).getContext("2d")
  // );
  document.getElementById(VIEW_FINISH_BTN_HOME).onclick = () => GoToBasicInfo();
  document.getElementById(VIEW_BACK_BTN_HOME).onclick = () => GoToBasicInfo();
};
let upbioage = 0;

let upba2 = 0;
let upba4 = 0;
let pLF = 0;
let pHF = 0;
let aSDNN = 0;
let aSDNNage = 0;
const GoToFinish = () => {
  // _finish_spower_chart.reset();
  _finish_vital_result_printer.reset();
  let result = JSON.parse(sessionStorage.getItem("result"));

  SetSPowerValue(VIEW_FINISH_ACTIVITY, result.activity);
  SetSPowerValue(VIEW_FINISH_EQUILIBRIUM, result.equilibrium);
  SetSPowerValue(VIEW_FINISH_HEALTH, result.health);
  SetSPowerValue(VIEW_FINISH_METABOLISM, result.metabolism);
  SetSPowerValue(VIEW_FINISH_RELAXATION, result.relaxation);
  SetSPowerValue(VIEW_FINISH_SLEEP, result.sleep);

  let storedData = JSON.parse(sessionStorage.getItem("Age"));
  console.log(storedData);

  if (storedData.length > 0) {
    let aValues = [];
    let bValues = [];
    let cValues = [];
    let dValues = [];
    let eValues = [];
    let fValues = [];
    let gValues = [];
    let hValues = [];

    // 遍歷 storedData，取出正值並分別存入三個陣列
    storedData.forEach((data) => {
      let [a, b, c, d, e, f, g, h] = data;
      if (a > 0 && a < 100) aValues.push(a);
      if (b > 0 && b < 100) bValues.push(b);
      if (c > 0 && c < 100) cValues.push(c);
      if (d > 0 && d < 100) dValues.push(d);
      if (e > 0 && e < 100) eValues.push(e);
      if (f > 0) fValues.push(f);
      if (g > 0) gValues.push(g);
      if (h > 0) hValues.push(h);
    });

    console.log("PLF=", dValues);
    console.log("PHF=", eValues);
    console.log("LF=", fValues);
    console.log("HF=", gValues);
    console.log("SDNNI=", hValues);

    // 計算平均值的函數
    const calculateAverage = (values) => {
      if (values.length === 0) return 0; // 避免除以 0
      let sum = values.reduce((acc, val) => acc + val, 0);
      return sum / values.length;
    };

    // 函數：計算移除極端值後的平均數
    function trimmedMean(arr, trimPercent) {
      // 先對數據進行排序
      const sortedArr = arr.slice().sort((a, b) => a - b);
      // 計算要移除的數據筆數
      const trimCount = Math.floor(trimPercent * sortedArr.length);
      // 移除最小和最大指定百分比的數據
      const trimmedArr = sortedArr.slice(
        trimCount,
        sortedArr.length - trimCount
      );
      // 計算剩餘數據的平均數
      const sum = trimmedArr.reduce((acc, value) => acc + value, 0);
      const mean = sum / trimmedArr.length;
      return mean;
    }
    // 假設移除最小與最大各5%的數據
    const trimPercent = 0.05; // 移除5%資料

    // 計算 A, B, C 的平均值
    upbioage = trimmedMean(aValues, trimPercent);
    upba2 = trimmedMean(bValues, trimPercent);
    upba4 = trimmedMean(cValues, trimPercent);
    pLF = trimmedMean(dValues, trimPercent);
    pHF = trimmedMean(eValues, trimPercent);
    aSDNN = trimmedMean(hValues, trimPercent);
    let SDNNc = aSDNN * Math.exp(-0.02263 * (60 - result.hr));
    aSDNNage = SDNNdetermineAge(SDNNc, infodata.sex);

    console.log("result:" + sessionStorage.getItem("result"));

    // 顯示結果
    console.log(
      `upbioage: ${aSDNNage}, upba2: ${upba2}, upba4: ${upba4}, SYN%: ${pLF}`
    );
    // SaveHRV2(result, upba2, upba4, aSDNNage, pLF, pHF);
  } else {
    console.log("No stored data available.");
    alert("No stored data available.");
  }

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
    hr_valid: result.signal_quality.hr_hrv > 0.7,
    bp_valid: result.signal_quality.bp > 0.6,
    rr_valid: result.signal_quality.resp > 0.7,
    spo2_valid: result.signal_quality.spo2 > 0.9,
    bioage: aSDNNage,
    ba2: upba2,
    ba4: upba4,
    syn: pLF,
  });

  // setTimeout(() => {
  //   _finish_spower_chart.update({
  //     activity: result.activity,
  //     equilibrium: result.equilibrium,
  //     health: result.health,
  //     metabolism: result.metabolism,
  //     relaxation: result.relaxation,
  //     sleep: result.sleep,
  //   });
  // }, 200);
};

const GoToBasicInfo = () => {
  window.location.href = "/user";
};
// ==============================================================

document.addEventListener("DOMContentLoaded", () => {
  InitFinish();
  GoToFinish();
});
