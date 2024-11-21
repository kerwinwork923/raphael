<template>
  <div class="qrcode">
    <div id="qr-reader" style="width: 300px"></div>

    <div v-if="scannedText">
      <h3>掃描結果：</h3>
      <p>{{ scannedText }}</p>

      <h3>解析出的參數：</h3>
      <ul>
        <li><strong>Key:</strong> {{ key }}</li>
        <li><strong>Type:</strong> {{ type }}</li>
        <li><strong>NewOld:</strong> {{ newOld }}</li>
        <li><strong>Start:</strong> {{ cstart }}</li>
        <li><strong>End:</strong> {{ cend }}</li>
        <li><strong>Mobile:</strong> {{ mobile }}</li>
      </ul>

      <h3>所有查詢參數：</h3>
      <pre>{{ allParams }}</pre>
    </div>
  </div>
</template>

<script>
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";

const saveQRCode = async (key, type, newOld, cstart, cend, mobile) => {
  try {
    const response = await axios.post(
      "https://23700999.com:8081/HMA/TTEAddHomeOrder.jsp",
      {
        Key: key,
        Type: type,
        NewOld: newOld,
        Start: cstart,
        End: cend,
        Mobile: mobile,
      }
    );

    if (response.status === 200) {
      console.log("資料已成功送出:", response.data);
    } else {
      alert(`資料送出失敗 : ${response.data.Result}`);
    }
  } catch (err) {
    alert("資料送出失敗");
  }
};

export default {
  data() {
    return {
      html5QrCode: null,
      scannedText: null,
      key: null,
      type: null,
      newOld: null,
      cstart: null,
      cend: null,
      mobile: null,
      allParams: {}, // 用於顯示所有的查詢參數
    };
  },
  mounted() {
    this.startScanner();
  },
  beforeDestroy() {
    this.stopScanner();
  },
  methods: {
    // 啟動 QR Code 掃描器
    startScanner() {
      const qrCodeRegionId = "qr-reader";
      this.html5QrCode = new Html5Qrcode(qrCodeRegionId);

      this.html5QrCode
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (!this.scannedText) {
              this.scannedText = decodedText;
              this.processQRCode(decodedText);
              this.stopScanner();
              alert(!this.scannedText)
            }
          },
          (errorMessage) => {
            console.error("掃描錯誤：", errorMessage);
          }
        )
        .catch((err) => {
          console.error("相機啟動失敗：", err);
        });
    },
    // 停止掃描
    stopScanner() {
      if (this.html5QrCode) {
        this.html5QrCode.stop().then(() => {
          this.html5QrCode.clear();
        });
      }
    },
    // 處理 QR Code 並解析參數
    async processQRCode(decodedText) {
      try {
        // 檢查 URL 是否符合格式
        if (!decodedText.includes("HMA/TTEAddHomeOrder.jsp")) {
          alert("無效的 QR Code 內容");
          return;
        }

        const url = new URL(decodedText);
        const searchParams = new URLSearchParams(url.search);

        // 提取參數並更新 data
        this.key = searchParams.get("Key");
        this.type = searchParams.get("Type");
        this.newOld = searchParams.get("NewOld");
        this.cstart = searchParams.get("Start");
        this.cend = searchParams.get("End");
        this.mobile = searchParams.get("Mobile");

   

        // 將所有查詢參數轉換為物件格式
        this.allParams = {};
        for (const [key, value] of searchParams.entries()) {
          this.allParams[key] = value;
        }

        console.log("解析的參數：", {
          key: this.key,
          type: this.type,
          newOld: this.newOld,
          cstart: this.cstart,
          cend: this.cend,
          mobile: this.mobile,
        });

        console.log("所有查詢參數：", this.allParams);

        saveQRCode(
          this.key,
          this.type,
          this.newOld,
          this.cstart,
          this.cend,
          this.mobile
        );
      } catch (error) {
        console.error("URL 解析失敗：", error);
        alert("QR Code 內容格式錯誤，無法解析。");
      }
    },
  },
};
</script>

<style scoped>
#qr-reader {
  margin: auto;
  border: 2px solid #000;
 
}
.qrcode{
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99;
}
</style>
