
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
const VIEW_SCAN_CANVAS_LIVE = "live_canvas";
const VIEW_SCAN_IMAGE_MASK = "scan_live_mask";

const VIEW_SCAN_PROGRESS = "progress_scan";
const VIEW_SCAN_PROGRESS_VALUE = "progress_value";

const VIEW_SCAN_P_HINT = "scan_p_hint";
const VIEW_SCANNING_STATUS = "scanning_status";
const VIEW_S_CANCEL = "s_cancel";
const VIEW_LIVE_RECT = 'live_rect';

const MAX_MEASURING_SECOND = 50;
const your_auth_url = "wss://XXXX.XXXX.XXXX:9443/wasm/v2";
// ==============================================================
let _scan_vital_result_printer = new VitalResultPrinter();
let _live_video = null;
let _flag = false;
let _width = 0;
let _height = 0;

const OnVisibilityChange = () => {
  if (document.hidden) {
    console.log("unvisible")
    StoptMeasuring('/user');
  }
}


const StoptMeasuring = (html_page) => {
  if (_live_video) {
    _live_video.stop();
  }
  window.location.href = html_page;
}

const onFrameCapture = ({ camera, ctx, sn }) => {
  if (!_flag) {
    _flag = true;
    show(VIEW_LIVE_RECT);
    show(VIEW_SCAN_P_HINT);
    let mask = document.getElementById(VIEW_LIVE_RECT);
    if (_width > _height) {
      mask.src = "images/live_rect_landscape.svg"
    }
    else {
      mask.src = "images/live_rect_portrait.svg"
    }
    mask.style.width = `${_width}px`;
    mask.style.height = `${_height}px`;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  hide(VIEW_SCAN_P_HINT);
  hide(VIEW_SCAN_PROGRESS);
  hide(VIEW_SCAN_PROGRESS_VALUE);
  hide(VIEW_LIVE_RECT);
  show(VIEW_SCANNING_STATUS)

  _scan_vital_result_printer.setDefaultElement({
    hr_id:   VIEW_SCAN_HR,
    hrv_id:  VIEW_SCAN_HRV,
    sbp_id:  VIEW_SCAN_SBP,
    dbp_id:  VIEW_SCAN_DBP,
    rr_id:   VIEW_SCAN_RR,
    spo2_id: VIEW_SCAN_SPO2,
    si_id:   VIEW_SCAN_SI,
  });
  _scan_vital_result_printer.reset();

  document.getElementById(VIEW_S_CANCEL).onclick = () => StoptMeasuring('/user');

  _live_video = new camera({
    canvas_out: document.getElementById(VIEW_SCAN_CANVAS_LIVE),
    on_enter_frame: onFrameCapture,
  });
  _live_video
    .open()
    .then(({ width, height, orientation }) => {
      _width = width;
      _height = height;
      _orientation = orientation
      live_canvas.width = width;
      live_canvas.height = height;
    })
    .catch((e) => {
      console.log("Camera failed: ", e.message);
    });
});

document.addEventListener("visibilitychange", OnVisibilityChange);
