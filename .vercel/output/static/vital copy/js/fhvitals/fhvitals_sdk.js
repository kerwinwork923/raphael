!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).FHVitals=t()}(this,(function(){"use strict";function e(e,t,a,i){return new(a||(a=Promise))((function(s,n){function r(e){try{h(i.next(e))}catch(e){n(e)}}function o(e){try{h(i.throw(e))}catch(e){n(e)}}function h(e){var t;e.done?s(e.value):(t=e.value,t instanceof a?t:new a((function(e){e(t)}))).then(r,o)}h((i=i.apply(e,t||[])).next())}))}"function"==typeof SuppressedError&&SuppressedError;class t{constructor(e){this._on_enter_frame=e.on_enter_frame,this._request_id=0,this._webcam=document.createElement("video"),this._webcam.setAttribute("webkit-playsinline","webkit-playsinline"),this._webcam.setAttribute("playsinline","true"),this.canvas=e.canvas_out,this._sn=0,this.doFrame=this.doFrame.bind(this),this.start=0,this._orientation="",this._stream=null,this._to_mirror=!1}open(e){const t=null!=e?e:"user",a={video:{width:{ideal:320,min:320,max:1920},height:{ideal:240,min:240,max:1080},frameRate:{ideal:30,max:30},facingMode:{ideal:t}}};return this._to_mirror="user"===t,new Promise(((e,t)=>{window.navigator.mediaDevices.getUserMedia(a).then((e=>(this._webcam.srcObject=e,this._stream=e.getTracks()[0],this._webcam.play()))).then((()=>{this.doFrame(0),e({width:this._webcam.videoWidth,height:this._webcam.videoHeight,orientation:this._orientation})})).catch((e=>{t(e)}))}))}stop(){if(cancelAnimationFrame(this._request_id),this._webcam.pause(),this._stream&&this._stream.stop(),this.canvas){const e=this.canvas.getContext("2d");null==e||e.clearRect(0,0,this.canvas.width,this.canvas.height)}}doFrame(e){if(e-this.start>30){this.start=e,cancelAnimationFrame(this._request_id);const t=this.canvas.getContext("2d");let a=window.innerWidth/this._webcam.videoWidth-1.5;a<=1?a=1:a>=3&&(a=3),t.canvas.style.width=this._webcam.videoWidth*a+"px",t.canvas.style.height=this._webcam.videoHeight*a+"px",this._to_mirror&&t.setTransform(-1,0,0,1,this.canvas.width,0),t.drawImage(this._webcam,0,0,this._webcam.videoWidth,this._webcam.videoHeight),this._sn+=1,this._on_enter_frame&&this._on_enter_frame({camera:this._webcam,ctx:t,sn:this._sn})}this._request_id=requestAnimationFrame(this.doFrame)}}let a={has_initialized:!1,has_loaded:!1,has_started:!1,error_code:0},i=null,s=null;const n="ERROR_NONE",r="ERROR_BUSY",o="ERROR_ASSETS_FOLDER_LOAD_FAILED",h="ERROR_HAS_INITIALIZED",d="LOAD_CANVAS_FAILED",_="CAMERA_OPEN_FAILED";let c,l=null,u=null,m=null,p=0,f=0,v=0,w=0;const g=()=>new Promise((e=>{null==u||u.stop(),e({error:n})})),b=()=>new Promise((e=>{!1!==a.has_started?null==m?(a.has_started=!1,m=t=>e({error:n}),null==l||l.postMessage({function:"FHVitalsStopMeasuring",type:"request"})):e({error:r}):e({error:n})})),y=({camera:e,ctx:t,sn:i})=>{if(a.has_started&&e.videoWidth&&e.videoHeight){let a=t.getImageData(0,0,e.videoWidth,e.videoHeight);null==l||l.postMessage({function:"FHVitalsPushFrame",type:"image",input:{image_data:a}})}if(s&&(t.canvas.style.width===p&&t.canvas.style.height===f||(p=t.canvas.style.width,f=t.canvas.style.height,s({state:"_canvas_size_change_",w:p,h:f})),v>0)){let e=Math.round((performance.now()-v)/1e3);e>c.camera_prepare_second?(v=-1,w=-1,s({state:"_camera_ready_",camera_prepare_second:c.camera_prepare_second})):w<e&&(w=e,s({state:"_camera_rsp_second_",camera_rsp_second:w}))}},A=e=>{const t=e.data.type;if("request"===t)null!=m&&"function"in e.data&&(m(e.data.result),m=null);else if("result"===t)i&&i(e.data.result);else if("event"===t&&s){"code"in e.data&&1006===e.data.code&&(e.data.reason="connect_failed"),"_connection_close_"===e.data.event_name&&b().then((()=>g()));const t=e.data.event_name;delete e.data.event_name,delete e.data.type,s(Object.assign({state:t},e.data))}};return{init:({on_result:t,on_event:a,config:n={camera_prepare_second:5,assets_folder_path:process.env.PUBLIC_URL+"/js/fhvitals/",auth_url:"",additional:null}})=>new Promise((d=>e(void 0,void 0,void 0,(function*(){if(i=t,s=a,null!=l)return void d({error:h});if(null!=m)return void d({error:r});c=n,void 0===c.assets_folder_path&&(c.assets_folder_path=process.env.PUBLIC_URL+"/js/fhvitals/");const e=yield(async()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11])))();l=new Worker(n.assets_folder_path+"/fhvitals_worker.js"),l.onerror=e=>{d({error:o})},l.onmessage=A,m=e=>d(e),l.postMessage({function:"FHVitalsInitialize",type:"request",input:{use_simd:e,auth_url:c.auth_url,additional:c.additional}})})))),startPreview:(e,a)=>new Promise((i=>{let s=document.getElementById(e);null!=s?(p=0,u=new t({canvas_out:s,on_enter_frame:y}),u.open(a).then((({width:e,height:t,orientation:a})=>{s.width=e,s.height=t,v=performance.now(),i({error:n})})).catch((e=>{i({error:_,message:e.message})}))):i({error:d})})),stopPreview:g,startMeasuring:e=>new Promise((t=>{null==m?(m=e=>{a.has_started=e.error==n,t(e)},null==l||l.postMessage({function:"FHVitalsStartMeasuring",type:"request",input:{sex:e.sex,age:e.age,height:e.height,weight:e.weight,bp_group:e.bp_group,bp_mode:e.bp_mode,virtual_id:e.virtual_id}})):t({error:r})})),stopMeasuring:b}}));

const FHVitalsSDK = {
  /**
   * SDK version.
   */
  version: "5.7.11",

  /**
   * Initialize the SDK.
   * 
   * @param {Function} on_result  Callback function for the result, (result) => {}
   *                               - @see result.
   *                               
   * @param {Function} on_event   Callback function for the event, (event) => {}
   *                               - _canvas_size_change_:                      camera size change by windows resize, event={"state":"_canvas_size_change_","w":"566px","h":"424.5px"}
   *                               - _camera_ready_:                            camera is ready,                      event={"state":"_camera_ready_","camera_prepare_second":5}
   *                               - _connection_activate_:                     auth success,                         event={"state":"_connection_activate_"}
   *                               - _connection_close_/path_not_found:         connection close,                     event={"state":"_connection_close_","code":1003,"reason":"path_not_found"}
   *                               - _connection_close_/connect_failed:         connection close,                     event={"state":"_connection_close_","code":1006,"reason":"connect_failed"}
   *                               - _connection_close_/reject:                 connection close,                     event={"state":"_connection_close_","code":1008,"reason":"reject"}
   *                               - _connection_close_/invalid_virtual_id:     connection close,                     event={"state":"_connection_close_","code":4010,"reason":"invalid_virtual_id"}
   *                               - _connection_close_/deactivated_virtual_id: connection close,                     event={"state":"_connection_close_","code":4011,"reason":"deactivated_virtual_id"}
   *                               - _restart_/MAX_MEASURE_TIME:                measurement time over 2min,           event={"state":"_restart_","reason":"MAX_MEASURE_TIME"}
   *                               - _restart_/FACE_LOSS:                       faceloss_sec > 5,                     event={"state":"_restart_","reason":"FACE_LOSS"}
   *                               - _restart_/ABNORMAL_RESULT:                 abnormal result,                      event={"state":"_restart_","reason":"ABNORMAL_RESULT"}
   * 
   * @param {Object}   config     Configuration object
   *                               - camera_prepare_second:  Camera prepare time (second)
   *                               - assets_folder_path:     Assets folder path "fhvitals"
   *                               - auth_url:               FaceHeart Auth URL
   * 
   * @returns {Promise}   result object, { error: ERROR_CODE }
   *                       - ERROR_CODE
   *                         - NONE:                      no error
   *                         - BUSY:                      busy to run the other function
   *                         - HAS_INITIALIZED:           already initialized
   *                         - WASM_LOAD_FAILED:          wasm load failed
   *                         - ASSETS_FOLDER_LOAD_FAILED: assets folder load failed
   * 
   * @var result = { 
   *      hr,              // Current heart rate value. (50-180)
   *      hrv,             // Current heart rate variability value.
   *      sbp,             // Current SBP value. (90-160)
   *      dbp,             // Current DBP value. (50-100)
   *      spo2,            // Current SpO2 value. (90-99)
   *      rr,              // Current respiratory rate value. (0-120)
   *      si,              // Current stress index.
   *      hrv_indices : {
   *        HF,            // Current ln(HF). (0-3000)
   *        LF,            // Current ln(LF). (0-3000)
   *        LF_HF_RATIO,   // Current LF/HF. (0-20)
   *        MEAN_RR,       // Current MEAN RRI. (0-2)
   *        PHF,           // Current HF%. (0-100)
   *        PLF,           // Current LF%. (0-100)
   *        RMSSD,         // Current RMSSD. (0-600)
   *        RRIV,          // Current RRIV. (0-100)
   *        SDNN,          // Current SDNN. (0-400)
   *        SD1,           // Current SD1. (0-2)
   *        SD2,           // Current SD2. (0-2)
   *        SDNNI,         // 
   *      },
   *      activity,        // Current health index. (0-5)
   *      equilibrium,     // Current health index. (0-5)
   *      health,          // Current health index. (0-5)
   *      metabolism,      // Current health index. (0-5)
   *      relaxation,      // Current health index. (0-5)
   *      sleep,           // Current health index. (0-5)
   *      ANSIndex : {
   *        PNS,           // Current ANS index. (-2-2)
   *        SNS            // Current ANS index. (-2-2)
   *      },
   *      PRQ,             // Current pulse respiratory quotient.
   *      frame_id,        // Frame count that the server receives during the measurement.
   *      face_loss,       // Frame count that not detected face during the measurement.
   *      image_quality: {
   *        brightness,    // Image quality score. (range: 0-1), good quality with score > 0.7
   *        contrast,      // Image quality score. (range: 0-1), good quality with score > 0.7
   *        motion         // Image quality score. (range: 0-1), good quality with score > 0.9 (The score can be affected by user motion or image noise. This variable is optional for tuning "experiment" based upon testing environment.)
   *      },
   *      signal_quality: {
   *        hr_hrv,        // Signal quality score. (range: 0-1), good quality with score > 0.7
   *        bp,            // Signal quality score. (range: 0-1), good quality with score > 0.6
   *        resp,          // Signal quality score. (range: 0-1), good quality with score > 0.7
   *        spo2           // Signal quality score. (range: 0-1), good quality with score > 0.9
   *      },
   * 
   *      // Available in future release
   *      HbA1c: {
   *        value,         // Current HbA1c value. (4.0–7.0)
   *        risk,          // Current HbA1c risk percentage. (0-100)
   *        range          // Current HbA1c range, consists of two numbers, one is lower bound and the other is the upper one.
   *      },
   *      hemoglobin,      // Current hemoglobin value. (10.5–16.0)
   *      cholesterol: {
   *        value,         // Current total cholesterol value. (120–245)
   *        risk,          // Current total cholesterol risk percentage. (0-100)
   *        range          // Current total cholesterol range. (CHOLESTEROL_NORMAL, CHOLESTEROL_BORDERLINE, CHOLESTEROL_HIGH, CHOLESTEROL_INVALID)
   *      },
   *      wellness_score,  // Current wellness score. (1-10)
   *      scanning_status  // Current status of the measurement. ("", "Motion", "FaceLoss")
   * }
   */
  init: ({ on_result, on_event, config }) => FHVitals.init({ on_result, on_event, config }),

  /**
   * Start the camera preview.
   * 
   * @param {String} canvas_id   Canvas ID from HTML
   * @param {String} facing_mode Camera facing mode, "user" (front) or "environment" (back)
   * 
   * @returns {Promise}   result object, { error: ERROR_CODE }
   *                       - ERROR_CODE
   *                         - NONE:                   no error
   *                         - CANVAS_LOAD_FAILED:     canvas load failed  
   *                         - CAMERA_OPEN_FAILED:     camera open failed
   */
  startPreview: (canvas_id, facing_mode) => FHVitals.startPreview(canvas_id, facing_mode),

  /**
   * Stop the camera preview.
   * 
   * @returns {Promise}   result object, { error: ERROR_CODE }
   *                       - ERROR_CODE
   *                         - NONE:                   no error
   */
  stopPreview: () => FHVitals.stopPreview(),

  /**
   *
   * Reset internal buffers and start the measuring progress.
   *
   * @param {Integer} height    Height (cm)
   * @param {Integer} weight    Weight (kgw)
   * @param {Integer} age       Age
   * @param {Integer} sex       Sex, 0 (female), 1 (male)
   * @param {String}  bp_mode   Blood Pressure Mode
   *                              - "binary":  The people are divided into 2 groups. Normal and pre-hypertension is one group, and hypertension is another.
   *                              - "ternary": The people are divided into 3 groups which are normal, pre-hypertension, and hypertension.
   * @param {String}  bp_group  Blood Pressure Group, 
   *                              - "normal":          SBP < 120, DBP < 80
   *                              - "prehypertension": 120 <= SBP < 140, 80 <= DBP < 90
   *                              - "hypertension":    SBP >= 140, DBP >= 90
   * @param {String|NULL}  virtual_id  Virtual ID (optional)
   * 
   * @returns {Promise}   result object, { error: ERROR_CODE }
   *                       - ERROR_CODE
   *                         - NONE:                   no error
   *                         - BUSY:                   busy to run the other function
   *                         - INITIALIZATION_FAILED:  not initialized
   */
  startMeasuring: ({ height, weight, sex, age, bp_group, bp_mode, virtual_id }) => FHVitals.startMeasuring({ height, weight, sex, age, bp_group, bp_mode, virtual_id }),

  /**
   *
   * Stop the measuring progress.
   *
   * @returns {Promise}   result object, { error: ERROR_CODE }
   *                       - ERROR_CODE
   *                         - NONE:                   no error
   *                         - BUSY:                   busy to run the other function
   */
  stopMeasuring: () => FHVitals.stopMeasuring(),
}
