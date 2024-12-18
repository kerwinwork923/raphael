<template>
  <div class="container">
    <h2 class="title">藍芽傳輸資料</h2>

    <!-- 步驟 1: 尋找藍牙裝置 -->
    <div class="field">
      <label>1.藍牙裝置連接</label>
      <button class="button" @click="findBluetoothDevice">尋找藍牙裝置</button>
      <p class="status">{{ status }}</p>
    </div>

    <!-- 步驟 2: 顯示選擇的藍牙裝置 -->
    <div class="field" v-if="deviceName">
      <label>已配對裝置</label>
      <div class="input-box">{{ deviceName }}</div>
    </div>

    <!-- 步驟 3: 輸入框 -->
    <div class="field" v-if="isConnected">
      <label>2. 輸入資料</label>
      <input
        v-model="inputText"
        type="text"
        placeholder="請輸入要傳送的資料"
        class="input-box"
      />
    </div>

    <!-- 步驟 4: 傳送按鈕 -->
    <div class="field" v-if="isConnected">
      <button class="button" @click="sendData">傳送</button>
      <p class="send-status">{{ sendStatus }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      status: '請尋找藍牙裝置...',
      deviceName: null,
      isConnected: false,
      inputText: '',
      sendStatus: '',
      selectedDevice: null,
      characteristic: null,
    };
  },
  methods: {
    async findBluetoothDevice() {
      try {
        this.status = '尋找藍牙裝置中...';
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb'],
        });

        this.deviceName = device.name || '無名稱裝置';
        this.selectedDevice = device;
        this.status = `已找到裝置: ${this.deviceName}`;
        this.connectToDevice();
      } catch (error) {
        console.error('尋找裝置失敗:', error);
        this.status = '未找到裝置';
      }
    },
    async connectToDevice() {
      try {
        this.status = '嘗試連接中...';
        const server = await this.selectedDevice.gatt.connect();
        const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        this.characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        this.isConnected = true;
        this.status = '裝置連接成功，準備傳送資料';
      } catch (error) {
        console.error('連接裝置失敗:', error);
        this.status = '連接裝置失敗';
      }
    },
    async sendData() {
      if (!this.characteristic || !this.inputText) {
        this.sendStatus = '請輸入資料後再傳送';
        return;
      }
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(this.inputText);
        await this.characteristic.writeValue(data);
        this.sendStatus = `資料已傳送: ${this.inputText}`;
      } catch (error) {
        console.error('傳送資料失敗:', error);
        this.sendStatus = '傳送資料失敗';
      }
    },
  },
};
</script>

<style scoped>
.container {
  font-family: Arial, sans-serif;
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
}

.field {
  margin-bottom: 15px;
}

label {
  display: block;
  font-size: 16px;
  color: #666;
  margin-bottom: 5px;
}

.input-box {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

.button {
  background-color: #90c639;
  color: #fff;
  padding: 10px 15px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  width: 100%;
}

.button:hover {
  background-color: #7aa62d;
}

.status,
.send-status {
  font-size: 14px;
  color: #333;
  margin-top: 5px;
}
</style>
