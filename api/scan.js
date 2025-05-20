
const ERROR_CODE = {
  NONE: "ERROR_NONE",
  INITIALIZATION_FAILED: "ERROR_INITIALIZATION_FAILED",
  SERVER_CONNECTION_FAILED: "ERROR_SERVER_CONNECTION_FAILED",
  HAS_INITIALIZED: "ERROR_HAS_INITIALIZED",
};

// HTML element ID List
// ==============================================================
const VIEW_SCAN_HR = "v_hr";
const VIEW_SCAN_HRV = "v_hrv";
const VIEW_SCAN_SBP = "v_sbp";
const VIEW_SCAN_DBP = "v_dbp";
const VIEW_SCAN_SPO2 = "v_spo2";
const VIEW_SCAN_RR = "v_rr";
const VIEW_SCAN_SI = "v_si";
const VIEW_SCAN_BIOAGE = "v_bioage"; //生理年齡
const VIEW_SCAN_BA2 = "v_ba2"; //生理年齡
const VIEW_SCAN_BA4 = "v_ba4"; //生理年齡

const VIEW_SCAN_CANVAS_LIVE = "live_canvas";
const VIEW_SCAN_IMAGE_MASK = "scan_live_mask";

const VIEW_SCAN_PROGRESS = "progress_scan";
const VIEW_SCAN_PROGRESS_VALUE = "progress_value";

const VIEW_SCAN_P_HINT = "scan_p_hint";
const VIEW_SCANNING_STATUS = "scanning_status";
const VIEW_S_CANCEL = "s_cancel";
const VIEW_LIVE_RECT = 'live_rect';

const MAX_MEASURING_SECOND = 50;
const your_auth_url = "wss://hcs-tyo.faceheart.com:9443/wasm/v2";
preditage=0;
// ==============================================================
let _scan_vital_result_printer = new VitalResultPrinter();
let nArray = [];

const OnVisibilityChange = () => {
  if (document.hidden) {
    console.log("unvisible")
    StoptMeasuring('basic_info.html');
  }
}

const OnResult = (result) => {
  console.log(JSON.stringify(result));
 
  const inputData = {values: [result.hrv_indices.SDNNI, result.hr, result.sbp, result.dbp]}; //SDNN, 心跳, 收縮壓, 舒張壓
  console.log('輸入資料:', inputData);
  // 使用 fetch 發送 POST 請求到 API
  fetch('https://114.34.55.242/predict', {
                 method: 'POST',
                 headers: {
                'Content-Type': 'application/json'
               },
               body: JSON.stringify(inputData) // 將數據轉換為 JSON 格式
               })
               .then(response => response.json())
               .then(data => {
                console.log('預測的生理年齡區段為:', data.predicted_age_group);
                preditage=data.predicted_age_group;
                 })
                .catch(error => {
                console.error('錯誤:', error);
    });


// 每次呼叫 OnResult 時，計算新的數據並將其推送到全域的 nArray 中
  nArray.push([
  preditage, // 計算生理年齡 bioage
  (29.83 - 0.2313 * result.hrv_indices.SDNNI - 0.1866 * result.hr) * 5, // 計算生理年齡 ba2
  (30.05 + -0.161 * result.hrv_indices.SDNNI + -0.129 * result.hr+ 0.00182 * Math.pow(result.hrv_indices.SDNN, 2)+ -0.00301 * result.hrv_indices.SDNN * result.hr+ 0.000204 * Math.pow(result.hr, 2))*5 // polynomial regression計算生理年齡 ba4
  ]);

  console.log(JSON.stringify(nArray));

  let fps = 30;
  let proc = result.frame_id * 100 / ((MAX_MEASURING_SECOND) * fps);

  document.getElementById(VIEW_SCAN_PROGRESS_VALUE).innerHTML = parseInt(proc) + '%';
  

  if ('scanning_status' in result && result.scanning_status != "") {
    console.log(result.scanning_status);
    document.getElementById(VIEW_SCANNING_STATUS).innerHTML = result.scanning_status;
    show(VIEW_SCANNING_STATUS)
  }
  else {
    show(VIEW_SCANNING_STATUS, false);
    _scan_vital_result_printer.update({
      hr:          result.hr,
      hrv:         result.hrv_indices.SDNNI,
      sbp:         result.sbp,
      dbp:         result.dbp,
      rr:          result.rr,
      spo2:        result.spo2,
      si:          result.si,
      hr_valid:    (result.signal_quality.hr_hrv > 0.7),
      bp_valid:    (result.signal_quality.bp > 0.6),
      rr_valid:    (result.signal_quality.resp > 0.7),
      spo2_valid:  (result.signal_quality.spo2 > 0.9),
      bioage:      preditage,
      ba2:         (29.83 - 0.2313 * result.hrv_indices.SDNNI - 0.1866 * result.hr)*5,
      ba4:         (30.05 + -0.161 * result.hrv_indices.SDNNI + -0.129 * result.hr+ 0.00182 * Math.pow(result.hrv_indices.SDNNI, 2)+ -0.00301 * result.hrv_indices.SDNNI * result.hr+ 0.000204 * Math.pow(result.hr, 2))*5
    });
 
    //ba4:(29.48 - 0.231 * result.hrv_indices.SDNN - 0.1879 * result.hr - 0.002 * result.sbp + 0.009 * result.dbp)*5

  }
  if (proc >= 100) {
    sessionStorage.setItem("result", JSON.stringify(result));
    sessionStorage.setItem("Age", JSON.stringify(nArray));
    document.removeEventListener("visibilitychange", OnVisibilityChange);
    StoptMeasuring('finish.html');
  }
}


let _ShowHintFlg = true;
const OnEvent = (x) => {
  console.log(JSON.stringify(x));
  if (x.state === '_canvas_size_change_') {
    let mask = document.getElementById(VIEW_LIVE_RECT)
    if (x.w > x.h) {
      mask.src = "images/live_rect_landscape.svg"
    }
    else {
      mask.src = "images/live_rect_portrait.svg"
    }
    mask.style.width = x.w;
    mask.style.height = x.h;
  }
  else if (x.state === '_camera_ready_') {
    StartMeasuring();
  }
  else if (x.state === '_camera_rsp_second_') {
    console.log(x.camera_rsp_second);
    _ShowHintFlg = !_ShowHintFlg;
    show(VIEW_SCAN_P_HINT, _ShowHintFlg)
  }
  else if (x.state === '_restart_') {
    if (x.reason === 'FACE_LOSS') {
      alert('FACE_LOSS');
    }
    else if (x.reason === 'MAX_MEASURE_TIME') {
      alert('MAX_MEASURE_TIME');
    }
    else if (x.reason === 'ABNORMAL_RESULT') {
      alert('ABNORMAL_RESULT');
    }
    StoptMeasuring('basic_info.html');
  }
  else if (x.state === '_connection_close_') {
    if (x.reason === 'reject') {
      alert('connect to server fail by reason: reject');
      StoptMeasuring('basic_info.html');
    }
    else if (x.reason === 'connect_failed') {
      alert('connect to server fail by reason: connect_failed');
      StoptMeasuring('basic_info.html');
    }
    else if (x.reason === 'path_not_found') {
      alert('connect to server fail by reason: path_not_found');
      StoptMeasuring('basic_info.html');
    }
  }
}

// const StartMeasuring = () => {
//   let user = JSON.parse(sessionStorage.getItem("data"));
//   console.log(user);
//   FHVitalsSDK.startMeasuring(user)
//     .then(result => {
//       if (result.error == ERROR_CODE.NONE) {
//         show(VIEW_SCAN_PROGRESS);
//         show(VIEW_SCAN_PROGRESS_VALUE);
//         hide(VIEW_SCAN_P_HINT)
//         document.getElementById(VIEW_SCANNING_STATUS).innerHTML = "";
//         document.getElementById(VIEW_SCAN_PROGRESS_VALUE).innerHTML = '0%';
//       }
//       else {
//         alert(`start measuring failed, reason=${result.error}`);
//         StoptMeasuring('basic_info.html');
//       }
//     })
// }
const StartMeasuring = () => {
  let user = JSON.parse(sessionStorage.getItem("data") || "{}");

  const payload = {
    height: Number(user.height) ,
    weight: Number(user.weight) ,
    sex: Number(user.sex) ,
    age: Number(user.age) ,
    bp_mode: user.bp_mode ,
    bp_group: user.bp_group ,
    virtual_id: user.virtual_id ,
  };

  // 這一行就是 alert 整個 payload 給你看
  alert(`Start Measuring Payload:\n${JSON.stringify(payload, null, 2)}`);

  FHVitalsSDK.startMeasuring(payload).then((result) => {
    if (result.error == ERROR_CODE.NONE) {
      show(VIEW_SCAN_PROGRESS);
      show(VIEW_SCAN_PROGRESS_VALUE);
      hide(VIEW_SCAN_P_HINT);
      document.getElementById(VIEW_SCANNING_STATUS).innerHTML = "";
      document.getElementById(VIEW_SCAN_PROGRESS_VALUE).innerHTML = "0%";
    } else {
      alert(`start measuring failed, reason=${result.error}`);
      StoptMeasuring("/user");
    }
  });
};


const StoptMeasuring = (html_page) => {
  FHVitalsSDK.stopMeasuring()
    .then(() => FHVitalsSDK.stopPreview())
    .then(() => {
      hide(VIEW_SCAN_PROGRESS);
      hide(VIEW_SCAN_PROGRESS_VALUE);

      window.location.href = html_page;

      setTimeout(() => {
        window.location.href = html_page;
      }, 1000);
    });
}


FHVitalsSDK.init({
  on_result: OnResult,
  on_event: OnEvent,
  config: {
    camera_prepare_second: 5,
    assets_folder_path: "./js/fhvitals",
    auth_url: your_auth_url
  }
})
  .then(result => {
    if (result.error != ERROR_CODE.NONE) {
      throw new Error(`init FHVitalsSDK failed, reason=${result.error}`);
    }
    const user = JSON.parse(sessionStorage.getItem('data'));
    return FHVitalsSDK.startPreview(VIEW_SCAN_CANVAS_LIVE, user.facing_mode);
  })
  .then(result => {
    if (result.error != ERROR_CODE.NONE) {
      throw new Error(`start preview failed, reason=${result.error}`);
    }
    show(VIEW_LIVE_RECT);
    show(VIEW_SCAN_P_HINT);
    document.getElementById(VIEW_SCANNING_STATUS).innerHTML = "Camera Ready";
  })
  .catch(e => {
    console.error(e);
    alert('init FHVitalsSDK failed');
    StoptMeasuring('basic_info.html');
  })

document.addEventListener("DOMContentLoaded", () => {
  console.log(`SDK version = ${FHVitalsSDK.version}`);

  if (your_auth_url.includes("XXXX.XXXX.XXXX")) {
    alert("Not set your_auth_url.\nPlease follow the \"readme_web.txt\" to change url");
    window.location.href = 'basic_info.html';
    return;
  }

  hide(VIEW_SCAN_P_HINT);
  hide(VIEW_SCAN_PROGRESS);
  hide(VIEW_SCAN_PROGRESS_VALUE);
  hide(VIEW_LIVE_RECT);
  document.getElementById(VIEW_SCANNING_STATUS).innerHTML = "Loading";
  show(VIEW_SCANNING_STATUS)

  _scan_vital_result_printer.setDefaultElement({
    hr_id:   VIEW_SCAN_HR,
    hrv_id:  VIEW_SCAN_HRV,
    sbp_id:  VIEW_SCAN_SBP,
    dbp_id:  VIEW_SCAN_DBP,
    rr_id:   VIEW_SCAN_RR,
    spo2_id: VIEW_SCAN_SPO2,
    si_id:   VIEW_SCAN_SI,
    bioage_id: VIEW_SCAN_BIOAGE,
    ba2_id: VIEW_SCAN_BA2,
    ba4_id: VIEW_SCAN_BA4
  });
  _scan_vital_result_printer.reset();

  document.getElementById(VIEW_S_CANCEL).onclick = () => StoptMeasuring('basic_info.html');
});

document.addEventListener("visibilitychange", OnVisibilityChange);
