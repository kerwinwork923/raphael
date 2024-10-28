<template>
  <div class="HRVTest">
    <Navbar />

    <div class="scanWrap">
      <div class="scanBox">
        <img
          class="scan"
          src="../assets/imgs/HRV/live_rect_landscape.svg"
          alt=""
        />

        <div
          style="position: absolute; bottom: 25%; right: 12%"
          id="progress_scan"
        >
          <div class="progress green">
            <span class="progress-left">
              <span id="progress_left" className="progress-bar"></span>
            </span>
            <span class="progress-right">
              <span id="progress_right" className="progress-bar"></span>
            </span>
            <div class="progress-value" id="progress_value">100%</div>
          </div>

          <div
            class="text-secondary text-center text-break font-weight-bold"
            style="
              position: absolute;
              bottom: 85px;
              width: 80%;
              font-size: small;
            "
          >
            <h2 id="scanning_status"></h2>
          </div>

          <div
            class="text-white text-center text-break font-weight-bold"
            style="
              position: absolute;
              bottom: 150px;
              width: 80%;
              font-size: small;
            "
            id="scan_p_hint"
          >
            <p>請將您的臉放置於圓形中<br />檢測中請盡量不要晃動</p>
          </div>
        </div>
      </div>

      <div class="scanInfo">
        <div class="row">
          <div class="years">
            <h3>心理年齡</h3>
            <div class="value" id="v_ba4">25</div>
            <div class="info">years old</div>
            <img src="../assets/imgs/HRVFace.svg" class="HRVFace" alt="" />
          </div>
          <div class="HRV">
            <h3 id="v_hrv">心律變異性</h3>
            <div class="value">37</div>
            <div class="info">ms</div>
          </div>
        </div>

        <div class="row">
          <div class="Rhythm">
            <div class="titleGroup">
              <h3 id="v_hr">心率</h3>
              <img src="../assets/imgs/heartBeat.svg" alt="" />
            </div>
            <div class="value">60</div>
            <div class="info">bpm</div>
            <img class="bgImg" src="../assets/imgs/greenChart.svg" alt="" />
          </div>
          <div class="bloodPressure">
            <div class="titleGroup">
              <h3>血壓</h3>
              <img src="../assets/imgs/bloodPressure.svg" alt="" />
            </div>
            <div class="value"><span id="v_sbp">138</span>/<span id="v_dbp">42</span></div>
            <div class="info">mmHg</div>
            <img class="bgImg" src="../assets/imgs/purpleChart.svg" alt="" />
          </div>
        </div>
        <div class="row">
          <div class="BO">
            <div class="titleGroup">
              <h3 id="v_spo2">血氧</h3>
              <img src="../assets/imgs/spo2.svg" alt="" />
            </div>
            <div class="value">95</div>
            <div class="info">SpO2%</div>
            <img class="bgImg" src="../assets/imgs/blueChart.svg" alt="" />
          </div>
          <div class="breathe">
            <div class="titleGroup">
              <h3 id="v_rr">呼吸</h3>
              <img src="../assets/imgs/spo2.svg" alt="" />
            </div>
            <div class="value">100</div>
            <div class="info">bpm</div>
            <img class="bgImg" src="../assets/imgs/brownChart.svg" alt="" />
          </div>
          <div class="pressure">
            <div class="titleGroup">
              <h3 id="v_si">壓力</h3>
              <img src="../assets/imgs/pressure.svg" alt="" />
            </div>
            <div class="value">低</div>
            <div class="info">low</div>
            <img class="bgImg" src="../assets/imgs/redChart.svg" alt="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.HRVTest {
  background: url("../assets/imgs/gradient-bg.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  min-height: 100vh;
  width: 100%;
  .scanWrap {
    max-width: 90%;
    margin: 0 auto;
    padding-top: 3.25rem;
    .scanBox {
      border-radius: 8px;
      width: 100%;
      background-color: #191919;
      height: 480px;

      .progress {
        width: 100px;
        height: 100px;
        line-height: 100px;
        background: none;
        margin: 0 auto;
        box-shadow: none;
      }

      .progress:after {
        content: "";
        width: 80%;
        height: 80%;
        border-radius: 50%;
        border: 8px solid #fff;
        position: absolute;
        top: 0;
        left: 0;
      }

      .progress > span {
        width: 50%;
        height: 100%;
        overflow: hidden;
        position: absolute;
        top: 0;
        z-index: 1;
      }

      .progress .progress-left {
        left: 0;
      }

      .progress .progress-bar {
        width: 100%;
        height: 100%;
        background: none;
        border-width: 8px;
        border-style: solid;
        position: absolute;
        top: 0;
      }

      .progress .progress-left .progress-bar {
        left: 100%;
        border-top-right-radius: 80px;
        border-bottom-right-radius: 80px;
        border-left: 0;
        -webkit-transform-origin: center left;
        transform-origin: center left;
      }

      .progress .progress-right {
        right: 0;
      }

      .progress .progress-right .progress-bar {
        left: -100%;
        border-top-left-radius: 80px;
        border-bottom-left-radius: 80px;
        border-right: 0;
        -webkit-transform-origin: center right;
        transform-origin: center right;
        animation: loading-1 30s linear forwards;
      }

      .progress .progress-value {
        width: 90%;
        height: 90%;
        border-radius: 50%;
        background: #44484b;
        font-size: 20px;
        color: #fff;
        line-height: 80px;
        text-align: center;
        position: absolute;
        bottom: 2.5%;
        left: 2.5%;
      }

      .progress.blue .progress-bar {
        border-color: #049dff;
      }

      .progress.blue .progress-left .progress-bar {
        animation: loading-2 1.5s linear forwards 1.8s;
      }

      .progress.yellow .progress-bar {
        border-color: #fdba04;
      }

      .progress.yellow .progress-left .progress-bar {
        animation: loading-3 1s linear forwards 1.8s;
      }

      .progress.pink .progress-bar {
        border-color: #ed687c;
      }

      .progress.pink .progress-left .progress-bar {
        animation: loading-4 0.4s linear forwards 1.8s;
      }

      .progress.green .progress-bar {
        border-color: #25b18e;
      }

      .progress.green .progress-left .progress-bar {
        animation: loading-1 30s linear forwards 30s;
      }

      @keyframes loading-1 {
        0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
        }

        100% {
          -webkit-transform: rotate(180deg);
          transform: rotate(180deg);
        }
      }

      @keyframes loading-2 {
        0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
        }

        100% {
          -webkit-transform: rotate(144deg);
          transform: rotate(144deg);
        }
      }
    }
    .scanInfo {
      display: flex;
      margin-top: 10px;
      flex-wrap: wrap;
      justify-content: space-between;
      h3 {
        font-size: 20px;
        font-weight: 400;
        letter-spacing: 0.15px;
      }
      .row {
        display: flex;
        width: 100%;
        gap: 3%;
        margin-bottom: 1rem;
      }
      .years {
        width: 55%;
        padding: 6px;
        border-radius: 8px;
        background: linear-gradient(
          180deg,
          #74bc1f 0%,
          rgba(116, 188, 31, 0.35) 100%
        );
        padding: 12px;
        align-items: center;
        color: #fff;
        position: relative;
        overflow: hidden;
        .value {
          font-size: 48px;
          font-weight: bold;
          padding: 0.25rem 0;
        }
        .info {
          font-size: 1rem;
          font-weight: 400;
          letter-spacing: 0.5px;
        }
        .HRVFace {
          position: absolute;
          right: -22%;
          top: 0;
        }
      }
      .HRV {
        background: linear-gradient(
          180deg,
          #dfecc5 0%,
          rgba(223, 236, 197, 0.35) 100%
        );
        padding: 12px;
        border-radius: 8px;

        .value {
          color: #74bc1f;
          font-size: 48px;
          font-weight: bold;
          padding: 0.25rem 0;
        }
        .info {
          color: #666;
          font-size: 1rem;
          font-weight: 400;
          letter-spacing: 0.5px;
        }
        width: 45%;
      }
      .Rhythm,
      .bloodPressure {
        width: 50%;
        background-color: #fff;
        border-radius: 8px;
        border-top-style: 8px;
        position: relative;
        overflow: hidden;
        padding: 12px;
        .titleGroup {
          display: flex;
          justify-content: space-between;
        }
        .value {
          color: $raphael-green-400;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.12px;
          margin-top: 0.5rem;
        }
        .info {
          color: #ccc;

          letter-spacing: 0.5px;
        }
        .bgImg {
          position: absolute;
          bottom: 0%;
        }
      }
      .BO,
      .breathe,
      .pressure {
        width: 33.333%;
        background-color: #fff;
        border-radius: 8px;

        position: relative;
        overflow: hidden;
        padding: 12px;
        .titleGroup {
          display: flex;
          justify-content: space-between;
        }
        .value {
          color: $raphael-green-400;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.12px;
          margin-top: 0.5rem;
        }
        .info {
          color: #ccc;

          letter-spacing: 0.5px;
        }
        .bgImg {
          position: absolute;
          bottom: 0%;
        }
      }
    }
  }
}
</style>

<script>
import { ref } from "vue";
import Navbar from "../components/Navbar";
import RaphaelLoading from "../components/RaphaelLoading";
export default {
  components: { Navbar, RaphaelLoading },
  setup() {},
};
</script>
