<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(...registerables, ChartDataLabels);

export default {
  setup() {
    const chartCanvas = ref(null);
    let chartInstance = null;

    const initChart = () => {
      const ctx = chartCanvas.value.getContext("2d");

      const labels = [
        "10/21",
        "10/22",
        "10/23",
        "10/24",
        "10/25",
        "10/26",
        "10/27",
      ];
      const dataset1 = [20, 25, 60, 65, 80, 30, 45];
      const dataset2 = [15, 30, 45, 60, 75, 25, 40];
      const difference = dataset1.map((val, index) => val - dataset2[index]);

      chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "改善幅度",
              data: difference,
              type: "line",
              borderColor: "#FEC37D",
              backgroundColor: "#FEC37D",
              pointBackgroundColor: "#FFFFFF",
              pointBorderColor: "#FEC37D",
              pointRadius: 5,
              pointBorderWidth: 2,
              fill: false,
              tension: 0.3,
              datalabels: {
                display: false,
              },
            },
            {
              label: "使用前",
              data: dataset1,
              backgroundColor: "#74BC1F",
              borderColor: "#74BC1F",
              borderWidth: 1,
              datalabels: {
                color: "#FFFFFF",
                font: { size: 10 },
                offset: 2,
              },
            },
            {
              label: "使用后",
              data: dataset2,
              backgroundColor: "#1FBCB3",
              borderColor: "#1FBCB3",
              borderWidth: 1,
              datalabels: {
                color: "#FFFFFF",
                font: { size: 10 },
                offset: 2,
              },
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: false,
              text: "",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
            legend: {
              display: true,
              position: "bottom",
              labels: {
                usePointStyle: true,
                pointStyle: "circle",
                boxWidth: 12,
                boxHeight: 12,
                padding: 20,
                generateLabels: (chart) => {
                  const datasets = chart.data.datasets;
                  const order = ["使用前", "使用后", "改善幅度"];
                  return order.map((label) => {
                    const dataset = datasets.find((ds) => ds.label === label);
                    return {
                      text: dataset.label,
                      fillStyle: dataset.backgroundColor || dataset.borderColor,
                      hidden: !chart.isDatasetVisible(
                        datasets.indexOf(dataset)
                      ),
                      datasetIndex: datasets.indexOf(dataset),
                      strokeStyle: "transparent", // 设置边框为透明
                      borderWidth: 0, // 强制设置边框宽度为 0
                    };
                  });
                },
              },
            },
            datalabels: {
              display: true,
              anchor: "end",
              align: "start",
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
                drawOnChartArea: false,
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
