"use strict";

class camera {
  constructor({ canvas_out, on_enter_frame = null }) {
    this._on_enter_frame = on_enter_frame;
    this._request_id = 0;
    this._webcam = document.createElement("video");
    this._webcam.setAttribute("webkit-playsinline", "webkit-playsinline");
    this._webcam.setAttribute("playsinline", true);
    this.canvas = canvas_out;
    this._sn = 0;
    this.doFrame = this.doFrame.bind(this);
    this.start = 0;
    this._orientation = "";
    this._stream = null;
  }
  open() {
    const _videoConstraints = {
      video: {
        width: { ideal: 320, min: 320, max: 1920 },
        height: { ideal: 240, min: 240, max: 1080 },
        frameRate: { ideal: 30, max: 30 },
        facingMode: { ideal: "user" }, // 可改成 'environment' 測試後置鏡頭
      },
    };
    return new Promise((resolve, reject) => {
      window.navigator.mediaDevices
        .getUserMedia(_videoConstraints)
        .then((mediaStream) => {
          this._webcam.srcObject = mediaStream;
          this._stream = mediaStream.getTracks()[0];
          return this._webcam.play();
        })
        .then(() => {
          resolve({
            width: this._webcam.videoWidth,
            height: this._webcam.videoHeight,
            orientation: this._orientation,
          });
          this.doFrame();
        })
        .catch((error) => {
          console.error("Error accessing the camera:", error.message);
          if (error.name === "NotAllowedError") {
            alert("請允許相機權限以正常使用應用程式。");
          } else if (error.name === "NotFoundError") {
            alert("未找到可用的相機設備。");
          }
          reject(error);
        });
    });
  }

  stop() {
    cancelAnimationFrame(this._request_id);
    this._webcam.pause();
    if (this._stream) {
      this._stream.stop();
    }
  }

  doFrame(timestamp) {
    if (timestamp - this.start > 30) {
      this.start = timestamp;
      cancelAnimationFrame(this._request_id);
      const ctx = this.canvas.getContext("2d");
      let draw_ratio = window.innerWidth / this._webcam.videoWidth - 1.5;
      if (draw_ratio <= 1) draw_ratio = 1;
      else if (draw_ratio >= 3) draw_ratio = 3;

      ctx.canvas.style.width = this._webcam.videoWidth * draw_ratio + "px";
      ctx.canvas.style.height = this._webcam.videoHeight * draw_ratio + "px";
      ctx.setTransform(-1, 0, 0, 1, this.canvas.width, 0);
      ctx.drawImage(
        this._webcam,
        0,
        0,
        this._webcam.videoWidth,
        this._webcam.videoHeight
      );

      this._sn += 1;
      if (this._on_enter_frame) {
        this._on_enter_frame({
          camera: this._webcam,
          ctx: ctx,
          sn: this._sn,
        });
      }
    }
    this._request_id = requestAnimationFrame(this.doFrame);
  }
}
