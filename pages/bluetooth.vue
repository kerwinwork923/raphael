<template>
  <div>
    <h1>Bluetooth Communication</h1>
    <button @click="connectToDevice">Connect to Device</button>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'No device connected.',
    };
  },
  methods: {
    async connectToDevice() {
      try {
        // 尋找藍牙裝置
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service'], // 可自定義 Service UUID
        });

        this.message = `Connected to: ${device.name}`;
        
        // 連接裝置的 GATT 伺服器
        const server = await device.gatt.connect();
        
        // 獲取服務與特徵值
        const service = await server.getPrimaryService('battery_service'); // 替換為你的服務 UUID
        const characteristic = await service.getCharacteristic('battery_level'); // 替換為你的特徵 UUID

        // 讀取特徵值
        const value = await characteristic.readValue();
        const batteryLevel = value.getUint8(0);
        this.message = `Battery Level: ${batteryLevel}%`;
      } catch (error) {
        console.error(error);
        this.message = 'Failed to connect to device.';
      }
    },
  },
};
</script>
