<script>
import { ref, reactive, onMounted, onBeforeUnmount, watch } from "vue";
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
  z-index: 99;
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
