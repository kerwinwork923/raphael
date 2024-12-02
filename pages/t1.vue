<template>
    <div>
      <canvas ref="chartCanvas"></canvas>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted } from "vue";
  import { Chart, registerables } from "chart.js";
  import ChartDataLabels from "chartjs-plugin-datalabels"; // 引入 DataLabels 插件
  
  Chart.register(...registerables, ChartDataLabels);
  
  export default {
    setup() {
      const chartCanvas = ref(null);
      let chartInstance = null;
  
      const initChart = () => {
        const ctx = chartCanvas.value.getContext("2d");
  
        // 示例數據
        const labels = [
          "10/21",
          "10/22",
          "10/23",
          "10/24",
          "10/25",
          "10/26",
          "10/27",
        ];
        const dataset1 = [20, 35, 50, 65, 80, 30, 45]; // 第一組數據
        const dataset2 = [15, 30, 45, 60, 75, 25, 40]; // 第二組數據
        const difference = dataset1.map((val, index) => val - dataset2[index]); // 差值
  
        chartInstance = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "使用前",
                data: dataset1,
                backgroundColor: "#74BC1F",
                borderColor: "#74BC1F",
                borderWidth: 1,
                order: 1, // 確保柱狀圖在後面
                datalabels: {
                  color: "#FFFFFF", // 數值字體顏色為白色
                  font: {
                    size: 10, // 字體大小設置為 10
                  },
                  offset: 2, // 距離頂部的距離設置為 2px
                },
              },
              {
                label: "使用後",
                data: dataset2,
                backgroundColor: "#1FBCB3",
                borderColor: "#1FBCB3",
                borderWidth: 1,
                order: 1, // 確保柱狀圖在後面
                datalabels: {
                  color: "#FFFFFF", // 數值字體顏色為白色
                  font: {
                    size: 10, // 字體大小設置為 10
                  },
                  offset: 2, // 距離頂部的距離設置為 2px
                },
              },
              {
                label: "改善幅度",
                data: difference,
                type: "line",
                borderColor: "#FEC37D", // 橙色線段
                backgroundColor: "#FEC37D", // 點的背景（實際會被 `pointBackgroundColor` 覆蓋）
                pointBackgroundColor: "#FFFFFF", // 原點為白色
                pointBorderColor: "#FEC37D", // 原點邊框顏色為橙色
                fill: false, // 不填充折線下方區域
                tension: 0.3, // 平滑折線
                pointRadius: 5, // 顯示數據點
                yAxisID: "y", // 使用主軸
                order: 0, // 確保折線圖在最前面
                datalabels: {
                  display: false, // 禁用改善幅度的數值顯示
                },
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: "Physiological Age Comparison (7 Days)",
              },
              tooltip: {
                mode: "index",
                intersect: false,
              },
              datalabels: {
                display: true, // 默認顯示數值（針對柱狀圖有效）
                anchor: "end", // 將數值與柱狀圖頂端對齊
                align: "start", // 數值與柱狀圖頂部位置對齊
              },
            },
            scales: {
              y: {
                type: "linear",
                position: "left",
                ticks: {
                  stepSize: 15,
                  callback: (value) => (value % 15 === 0 ? value : null),
                },
              },
              x: {
                grid: {
                  drawOnChartArea: false, // 僅顯示 Y 軸網格線
                },
              },
            },
          },
        });
      };
  
      const destroyChart = () => {
        if (chartInstance) {
          chartInstance.destroy();
          chartInstance = null;
        }
      };
  
      onMounted(() => {
        initChart();
      });
  
      onUnmounted(() => {
        destroyChart();
      });
  
      return {
        chartCanvas,
      };
    },
  };
  </script>
  
  <style>
  canvas {
    max-width: 100%;
  }
  </style>
  