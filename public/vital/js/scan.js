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
const VIEW_SCAN_SYN = "v_syn"; //交感佔比%

const VIEW_SCAN_CANVAS_LIVE = "live_canvas";
const VIEW_SCAN_IMAGE_MASK = "scan_live_mask";

const VIEW_SCAN_PROGRESS = "progress_scan";
const VIEW_SCAN_PROGRESS_VALUE = "progress_value";

const VIEW_SCAN_P_HINT = "scan_p_hint";
const VIEW_SCANNING_STATUS = "scanning_status";
const VIEW_S_CANCEL = "s_cancel";
const VIEW_LIVE_RECT = "live_rect";

const MAX_MEASURING_SECOND = 50;
const your_auth_url = "wss://hcs-tyo.faceheart.com:9543/wasm/v2";
preditage = 0;
// ==============================================================
let _scan_vital_result_printer = new VitalResultPrinter();
let _max_measuring_second = 60;
let nArray = [];
let nHRV=[];
let infodata = JSON.parse(sessionStorage.getItem("data"));

const OnVisibilityChange = () => {
  if (document.hidden) {
    console.log("unvisible");
    StoptMeasuring("/user");
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

  //const genderKey = gender.toLowerCase() === 'male' ? 'male' : 'female';
  let genderKey = "male";
  if (gender == 1) {
    genderKey = "male";
  } else {
    genderKey = "female";
  }

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

function RMSSDdetermineAge(RMSSD, gender) {
  const ageGroups = [
    { ageMax: 0.083, male: 153.1, female: 161.9 }, // <1 month
    { ageMax: 0.167, male: 152.4, female: 161.1 }, // 1 to 2 months
    { ageMax: 0.417, male: 150.9, female: 159.6 }, // 3 to 5 months
    { ageMax: 0.917, male: 148.8, female: 157.3 }, // 6 to 11 months
    { ageMax: 2, male: 141.9, female: 150.0 }, // 1 to 2 years
    { ageMax: 4, male: 131.4, female: 138.9 },
    { ageMax: 7, male: 118.8, female: 126.0 },
    { ageMax: 11, male: 102.1, female: 109.7 },
    { ageMax: 15, male: 84.8, female: 93.6 },
    { ageMax: 19, male: 70.1, female: 80.4 },
    { ageMax: 29, male: 51.9, female: 63.7 },
    { ageMax: 39, male: 37.7, female: 47.7 },
    { ageMax: 49, male: 29.9, female: 35.8 },
    { ageMax: 59, male: 24.1, female: 27.3 },
    { ageMax: 69, male: 20.7, female: 22.6 },
    { ageMax: 79, male: 19.0, female: 20.3 },
    { ageMax: 89, male: 17.9, female: 19.2 },
  ];

  //const genderKey = gender.toLowerCase() === 'male' ? 'male' : 'female';
  let genderKey = "male";
  if (gender == 1) {
    genderKey = "male";
  } else {
    genderKey = "female";
  }

  for (let i = 0; i < ageGroups.length - 1; i++) {
    const currentGroup = ageGroups[i];
    const nextGroup = ageGroups[i + 1];

    const currentRMSSD = currentGroup[genderKey];
    const nextRMSSD = nextGroup[genderKey];

    if (RMSSD <= currentRMSSD && RMSSD >= nextRMSSD) {
      // 使用線性插值計算年齡
      const ageEstimate =
        currentGroup.ageMax +
        ((RMSSD - currentRMSSD) / (nextRMSSD - currentRMSSD)) *
          (nextGroup.ageMax - currentGroup.ageMax);
      return ageEstimate;
    }
  }
  return 0;
}

const OnResult = (result) => {
  console.log(JSON.stringify(result));
  //let RMSSDc = result.hrv_indices.RMSSD * Math.exp(-0.03243 * (60 - result.hr));
  let SDNNc = result.hrv_indices.SDNNI * Math.exp(-0.02263 * (60 - result.hr));
  //let RMSSDage = RMSSDdetermineAge(RMSSDc, infodata.sex);
  let SDNNage = SDNNdetermineAge(SDNNc, infodata.sex);

  console.log(JSON.stringify(nArray));

  let fps = 30;
  let proc = result.frame_id * 100 / ((_max_measuring_second) * fps);

  document.getElementById(VIEW_SCAN_PROGRESS_VALUE).innerHTML = parseInt(proc) + '%';

  console.log(proc, result.scanning_status);
  
  if (result.scanning_status != "Motion") {
    nHRV.push([
       result.hrv_indices.HF,
       result.hrv_indices.LF,
       result.hrv_indices.SDNN,
       result.hrv_indices.SDNNI
    ]);
   } else{
      nHRV.push([ '','','',''
     ]);
   }
  console.log(nHRV);

  if (proc > 75 && result.scanning_status != "Motion") {
    nArray.push([
      SDNNage,
      (1.22998789167383e-5 * Math.pow(result.hrv_indices.HF, 2) -
        0.00285801868585652 * result.hrv_indices.HF * result.hr -
        0.000239207626756333 * result.hrv_indices.HF * result.hrv_indices.LF +
        0.000115433772745047 * result.hrv_indices.HF * result.hrv_indices.SDNNI +
        0.192669128355982 * result.hrv_indices.HF -
        0.00503253900946111 * Math.pow(result.hr, 2) -
        0.00270880024950466 * result.hr * result.hrv_indices.LF +
        0.0109856786957088 * result.hr * result.hrv_indices.SDNNI +
        0.259208120733664 * result.hr -
        0.000103105240872536 * Math.pow(result.hrv_indices.LF, 2) +
        0.000641149188132378 * result.hrv_indices.LF * result.hrv_indices.SDNNI +
        0.165776939998542 * result.hrv_indices.LF +
        0.000594377645649714 * Math.pow(result.hrv_indices.SDNNI, 2) -
        0.929727006002682 * result.hrv_indices.SDNNI +
        20.6746119954053) *
        5,
      (30.05 +
        -0.161 * result.hrv_indices.SDNNI +
        -0.129 * result.hr +
        0.00182 * Math.pow(result.hrv_indices.SDNNI, 2) +
        -0.00301 * result.hrv_indices.SDNNI * result.hr +
        0.000204 * Math.pow(result.hr, 2)) *
        5, // polynomial regression計算生理年齡 ba4
      result.hrv_indices.PLF,
      result.hrv_indices.PHF,
      result.hrv_indices.LF,
      result.hrv_indices.HF,
      result.hrv_indices.SDNNI,
    ]);
  }

  if ("scanning_status" in result && result.scanning_status != "") {
    console.log(result.scanning_status);
    document.getElementById(VIEW_SCANNING_STATUS).innerHTML = result.scanning_status;
    show(VIEW_SCANNING_STATUS);
  } else {
    show(VIEW_SCANNING_STATUS, false);
    
    _scan_vital_result_printer.update({
      hr: result.hr,
      hrv: result.hrv_indices.SDNNI,
      sbp: result.sbp,
      dbp: result.dbp,
      rr: result.rr,
      spo2: result.spo2,
      si: result.si,
      hr_valid: (result.signal_quality.hr_hrv > 0.7),
      bp_valid: (result.signal_quality.bp > 0.6),
      rr_valid: (result.signal_quality.resp > 0.7),
      spo2_valid: (result.signal_quality.spo2 > 0.9),
      bioage: SDNNage,
      ba2:
        (1.22998789167383e-5 * Math.pow(result.hrv_indices.HF, 2) -
          0.00285801868585652 * result.hrv_indices.HF * result.hr -
          0.000239207626756333 * result.hrv_indices.HF * result.hrv_indices.LF +
          0.000115433772745047 *
            result.hrv_indices.HF *
            result.hrv_indices.SDNNI +
          0.192669128355982 * result.hrv_indices.HF -
          0.00503253900946111 * Math.pow(result.hr, 2) -
          0.00270880024950466 * result.hr * result.hrv_indices.LF +
          0.0109856786957088 * result.hr * result.hrv_indices.SDNNI +
          0.259208120733664 * result.hr -
          0.000103105240872536 * Math.pow(result.hrv_indices.LF, 2) +
          0.000641149188132378 *
            result.hrv_indices.LF *
            result.hrv_indices.SDNNI +
          0.165776939998542 * result.hrv_indices.LF +
          0.000594377645649714 * Math.pow(result.hrv_indices.SDNNI, 2) -
          0.929727006002682 * result.hrv_indices.SDNNI +
          20.6746119954053) *
        5,
      ba4:
        (30.05 +
          -0.161 * result.hrv_indices.SDNNI +
          -0.129 * result.hr +
          0.00182 * Math.pow(result.hrv_indices.SDNNI, 2) +
          -0.00301 * result.hrv_indices.SDNNI * result.hr +
          0.000204 * Math.pow(result.hr, 2)) *
        5,
      syn: result.hrv_indices.PLF,
    });

    //ba4:(29.48 - 0.231 * result.hrv_indices.SDNN - 0.1879 * result.hr - 0.002 * result.sbp + 0.009 * result.dbp)*5
  }
  if (proc >= 100) {
    sessionStorage.setItem("result", JSON.stringify(result));
    sessionStorage.setItem("Age", JSON.stringify(nArray));
    sessionStorage.setItem("rHRV", JSON.stringify(nHRV));
    document.removeEventListener("visibilitychange", OnVisibilityChange);
    StoptMeasuring("finish.html");
  }
};

let _ShowHintFlg = true;
const OnEvent = (x) => {
  console.log(JSON.stringify(x));
  if (x.state === "_canvas_size_change_") {
    let mask = document.getElementById(VIEW_LIVE_RECT);
    if (x.w > x.h) {
      mask.src = "images/live_rect_landscape.svg";
    } else {
      mask.src = "images/live_rect_portrait.svg";
    }
    mask.style.width = x.w;
    mask.style.height = x.h;
  } else if (x.state === "_camera_ready_") {
    StartMeasuring();
  } else if (x.state === "_camera_rsp_second_") {
    console.log(x.camera_rsp_second);
    _ShowHintFlg = !_ShowHintFlg;
    show(VIEW_SCAN_P_HINT, _ShowHintFlg);
  } else if (x.state === "_restart_") {
    if (x.reason === "FACE_LOSS") {
      alert("FACE_LOSS");
    } else if (x.reason === "MAX_MEASURE_TIME") {
      alert("MAX_MEASURE_TIME");
    } else if (x.reason === "ABNORMAL_RESULT") {
      alert("ABNORMAL_RESULT");
    }
    StoptMeasuring("/user");
  } else if (x.state === "_connection_close_") {
    if (x.reason === "reject") {
      alert("connect to server fail by reason: reject");
      StoptMeasuring("/user");
    } else if (x.reason === "connect_failed") {
      alert("connect to server fail by reason: connect_failed");
      StoptMeasuring("/user");
    } else if (x.reason === "path_not_found") {
      alert("connect to server fail by reason: path_not_found");
      StoptMeasuring("/user");
    }
  }
};

const StartMeasuring = () => {
  let user = JSON.parse(sessionStorage.getItem("data"));
  console.log(user);
  FHVitalsSDK.startMeasuring(user).then((result) => {
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
};

FHVitalsSDK.init({
  on_result: OnResult,
  on_event: OnEvent,
  config: {
    camera_prepare_second: 5,
    assets_folder_path: "./js/fhvitals",
    auth_url: your_auth_url,
  },
})
  .then((result) => {
    if (result.error != ERROR_CODE.NONE) {
      throw new Error(`init FHVitalsSDK failed, reason=${result.error}`);
    }
    const user = JSON.parse(sessionStorage.getItem("data"));
    _max_measuring_second = 60 * user.time;
    return FHVitalsSDK.startPreview(VIEW_SCAN_CANVAS_LIVE, user.facing_mode);
  })
  .then((result) => {
    if (result.error != ERROR_CODE.NONE) {
      throw new Error(`start preview failed, reason=${result.error}`);
    }
    show(VIEW_LIVE_RECT);
    show(VIEW_SCAN_P_HINT);
    document.getElementById(VIEW_SCANNING_STATUS).innerHTML = "Camera Ready";
  })
  .catch((e) => {
    console.error(e);
    alert("init FHVitalsSDK failed");
    StoptMeasuring("/user");
  });

document.addEventListener("DOMContentLoaded", () => {
  console.log(`SDK version = ${FHVitalsSDK.version}`);

  if (your_auth_url.includes("XXXX.XXXX.XXXX")) {
    alert(
      'Not set your_auth_url.\nPlease follow the "readme_web.txt" to change url'
    );
    window.location.href = "/user";
    return;
  }

  hide(VIEW_SCAN_P_HINT);
  hide(VIEW_SCAN_PROGRESS);
  hide(VIEW_SCAN_PROGRESS_VALUE);
  hide(VIEW_LIVE_RECT);
  document.getElementById(VIEW_SCANNING_STATUS).innerHTML = "Loading";
  show(VIEW_SCANNING_STATUS);

  _scan_vital_result_printer.setDefaultElement({
    hr_id: VIEW_SCAN_HR,
    hrv_id: VIEW_SCAN_HRV,
    sbp_id: VIEW_SCAN_SBP,
    dbp_id: VIEW_SCAN_DBP,
    rr_id: VIEW_SCAN_RR,
    spo2_id: VIEW_SCAN_SPO2,
    si_id: VIEW_SCAN_SI,
    bioage_id: VIEW_SCAN_BIOAGE,
    ba2_id: VIEW_SCAN_BA2,
    ba4_id: VIEW_SCAN_BA4,
    syn_id: VIEW_SCAN_SYN,
  });
  _scan_vital_result_printer.reset();

  document.getElementById(VIEW_S_CANCEL).onclick = () =>
    StoptMeasuring("/user");
});

document.addEventListener("visibilitychange", OnVisibilityChange);
