<template>
  <div>
    <h1>尋找藍牙裝置</h1>
    <button @click="scanForDevices">尋找藍牙裝置</button>
    <div v-if="devices.length">
      <h2>可配對的藍牙裝置：</h2>
      <ul>
        <li v-for="(device, index) in devices" :key="index">
          {{ device.name || '無名稱裝置' }} (ID: {{ device.id }})
        </li>
      </ul>
    </div>
    <p v-else>尚未找到任何裝置。</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      devices: [], // 存儲掃描到的裝置
    };
  },
  methods: {
    async scanForDevices() {
      try {
        // 開始尋找藍牙裝置
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true, // 接受所有藍牙裝置
          optionalServices: ['generic_access'], // 可選，指定服務 UUID (可根據需求更改)
        });

        // 檢查裝置是否已經存在於清單中，避免重複
        const exists = this.devices.find((d) => d.id === device.id);
        if (!exists) {
          this.devices.push({
            name: device.name || '無名稱裝置',
            id: device.id,
          });
        }
      } catch (error) {
        console.error('藍牙掃描錯誤:', error);
        alert('無法掃描藍牙裝置，請確認瀏覽器支援並開啟藍牙。');
      }
    },
  },
};
</script>
