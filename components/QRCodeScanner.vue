<template>
  <RaphaelAlert
    v-if="alertVisible"
    :defaultContent="alertMessage"
    :showRedirectButton="false"
    @close="alertVisible = false"
  />
  <div class="cover" v-if="scannerVisible"></div>
  <div class="qrcode" v-if="scannerVisible">
    <div id="qr-reader"></div>
    <div class="close" v-if="scannerVisible" @click="closeScanner">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M13.2314 0.768622C13.3369 0.874111 13.3961 1.01719 13.3961 1.16637C13.3961 1.31555 13.3369 1.45863 13.2314 1.56412L7.7955 7L13.2314 12.4359C13.3369 12.5414 13.3961 12.6844 13.3961 12.8336C13.3961 12.9828 13.3369 13.1259 13.2314 13.2314C13.1259 13.3369 12.9828 13.3961 12.8336 13.3961C12.6845 13.3961 12.5414 13.3369 12.4359 13.2314L7 7.7955L1.56412 13.2314C1.45863 13.3369 1.31556 13.3961 1.16637 13.3961C1.01719 13.3961 0.874114 13.3369 0.768625 13.2314C0.663136 13.1259 0.603873 12.9828 0.603873 12.8336C0.603873 12.6844 0.663136 12.5414 0.768625 12.4359L6.20451 7L0.768625 1.56412C0.663136 1.45863 0.603873 1.31555 0.603873 1.16637C0.603873 1.01718 0.663136 0.874111 0.768625 0.768622C0.874114 0.663132 1.01719 0.603869 1.16637 0.603869C1.31556 0.603869 1.45863 0.663132 1.56412 0.768622L7 6.2045L12.4359 0.768622C12.5414 0.663132 12.6845 0.603869 12.8336 0.60387C12.9828 0.603869 13.1259 0.663132 13.2314 0.768622Z"
          fill="black"
        />
      </svg>
    </div>

    <!-- RaphaelAlert component -->
  </div>
</template>

<script>
import {
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import RaphaelAlert from "./Alert.vue";

const saveQRCode = async (
  key,
  type,
  newOld,
  cstart,
  cend,
  mobile,
  period,
  showAlert
) => {
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
        Period: period,
      }
    );

    if (response.status === 200) {
      showAlert(response.data.Result);
    } else {
      showAlert(`資料送出失敗 : ${response.data.Result}`);
    }
  } catch (err) {
    showAlert("資料送出失敗");
  }
};

export default {
  components: { RaphaelAlert },
  setup() {
    const html5QrCode = ref(null);
    const scannedText = ref(null);
    const alertVisible = ref(false);
    const alertMessage = ref("");
    const scannerVisible = ref(true);
    const isScannerReady = ref(false);
    const params = reactive({
      key: null,
      type: null,
      newOld: null,
      cstart: null,
      cend: null,
      mobile: null,
      period: null,
      allParams: {},
    });

    const showAlert = (message) => {
      alertMessage.value = message;
      alertVisible.value = true;
      scannerVisible.value = false;
    };

    const startScanner = async () => {
      isScannerReady.value = false; // 初始化為未就緒
      const qrCodeRegionId = "qr-reader";

      await nextTick(); // 等待 DOM 完全渲染
      const qrReaderElement = document.getElementById(qrCodeRegionId);
      if (!qrReaderElement) {
        console.error("qr-reader 元素未找到");
        showAlert("無法啟動掃描器，請檢查 DOM 結構");
        return;
      }

      html5QrCode.value = new Html5Qrcode(qrCodeRegionId);

      try {
        await html5QrCode.value.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (!scannedText.value) {
              scannedText.value = decodedText;
              processQRCode(decodedText);
              stopScanner();
            }
          }
        );
        isScannerReady.value = true; // 啟動成功後設為就緒
      } catch (err) {
        console.error("Error starting QR scanner:", err);
        showAlert("鏡頭啟動失敗，請檢查權限或重試。");
      }
    };

    const stopScanner = () => {
      if (html5QrCode.value && html5QrCode.value.isScanning) {
        html5QrCode.value
          .stop()
          .then(() => {
            html5QrCode.value.clear();
          })
          .catch((err) => {
            console.error("Error stopping QR scanner:", err);
          });
      }
    };

    const processQRCode = async (decodedText) => {
      try {
        if (!decodedText.includes("HMA/TTEAddHomeOrder.jsp")) {
          showAlert("無效的 QR Code 內容");
          return;
        }

        const url = new URL(decodedText);
        const searchParams = new URLSearchParams(url.search);

        params.key = searchParams.get("Key");
        params.type = searchParams.get("Type");
        params.newOld = searchParams.get("NewOld");
        params.cstart = searchParams.get("Start");
        params.cend = searchParams.get("End");
        params.mobile = searchParams.get("Mobile");
        params.period = searchParams.get("Period");

        params.allParams = {};
        for (const [key, value] of searchParams.entries()) {
          params.allParams[key] = value;
        }

        saveQRCode(
          params.key,
          params.type,
          params.newOld,
          params.cstart,
          params.cend,
          params.mobile,
          params.period,
          showAlert
        );
      } catch (error) {
        showAlert("QR Code 內容格式錯誤，無法解析。");
      }
    };

    onMounted(() => {
      startScanner();
    });

    onBeforeUnmount(() => {
      stopScanner();
    });

    const closeScanner = () => {
      stopScanner();
      scannerVisible.value = false;
    };

    return {
      scannedText,
      params,
      alertVisible,
      alertMessage,
      closeScanner,
      scannerVisible,
      isScannerReady,
    };
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.fade-enter {
  opacity: 0;
  transform: scale(0.9);
}
.fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

#qr-reader {
  margin: auto;

  /* height: 300px; */
  width: 300px;
  /* border-radius: 15px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center; */
}

.qrcode {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  animation: fade 0.5s ease-in-out;
}

.qrcode .close {
  position: absolute;
  display: flex;
  justify-content: center;
  width: 100%;
  bottom: -2.5rem;
}

.qrcode .close svg {
  width: 2rem;
  height: 2rem;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 0.5rem;
  border-radius: 50%;
  backdrop-filter: blur(2px);
  box-shadow: 0px 2px 20px 0px #666;
}

.cover {
  backdrop-filter: brightness(0.9);
}
</style>
