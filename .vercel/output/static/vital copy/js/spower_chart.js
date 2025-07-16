"use strict";

class SPowerChart {
  constructor(canvas_ctx) {
    this._ctx = canvas_ctx;
    this._chart = null;
    this._init();
  }


  _init() {
    let datas_Radar = [0, 0, 0, 0, 0, 0];
    let Labesl_Radar = [
      "Activity",
      "Sleep",
      "Equilibruium",
      "Metabolism",
      "Health",
      "Relaxation"
    ];
    let RadarChartData = {
      labels: Labesl_Radar,
      datasets: [
        {
          label: "abc",
          backgroundColor: "rgba(60, 186, 162, 0.5)", 
          borderColor: "rgb(60, 186, 162)", 
          borderWidth: 2, 
          pointBackgroundColor: "rgb(60, 186, 162)",
          data: datas_Radar,
        },
      ],
    };

    let config_Radar = {
      type: "radar",
      data: RadarChartData,
      maintainAspectRatio: true,
      spanGaps: false,
      elements: {
        line: {
          tension: 0.000001,
        },
      },
      options: {
        legend: {
          position: "top",
          display: false,
        },
        title: {
          display: false,
          text: "",
        },
        scale: {
          beginAtZero: true,
          angleLines: {
            display: true,
          },
          gridLines: {
            color: ["grey", "grey", "grey", "grey", "grey"],
            display: true,
          },
          pointLabels: {
            fontColor: "red",
            fontSize: 24,
          },
          ticks: {
            beginAtZero: true,
            stepSize: 1,
          },
          max: 5,
          min: 0,
        },
      },
    };
    this._chart = new Chart(this._ctx, config_Radar);
    this._chart.update();
  }

  reset() {
    if (this._chart != null) {
      this._chart.data.datasets[0].data = [0, 0, 0, 0, 0, 0];
      this._chart.update();
    }
  }

  update({ activity, equilibrium, health, metabolism, relaxation, sleep }) {
    if (this._chart != null) {
      this._chart.data.datasets[0].data = [
        Math.max(0, activity),
        Math.max(0, sleep),
        Math.max(0, equilibrium),
        Math.max(0, metabolism),
        Math.max(0, health),
        Math.max(0, relaxation),
      ];
      this._chart.update();
    }
  }
}
