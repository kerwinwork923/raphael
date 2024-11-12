<template>
  <HRVAlert />
  <RaphaelLoading v-if="loading" />
  <DSPRSelect />
  <div class="HRVHistory">
    <div class="titleGroup">
      <img src="/assets/imgs/backArrow.png" @click="goBack" alt="" />
      <h2>檢測HRV</h2>
    </div>
    <div class="detectWrap">
      <h3>檢測紀錄</h3>
      <div class="detectList">
        <div class="detectItem" v-for="item in limitedHRVData" :key="item.AID">
          <a :href="`detail.html?AID=${item.AID}`">
            <div class="timeGroup">
              <div class="timeIcon">
                <img src="../assets/imgs/detectTime.svg" alt="" />
              </div>
              <div class="time">{{ formatTimestampMDH(item.CheckTime) }}</div>
            </div>
            <div class="infoGroup">
              <div class="detectAgeGroup">
                <h4>生理年齡</h4>
                <h5>
                  <span>{{ item.bioage }}</span
                  >歲
                </h5>
              </div>
              <div class="detectHRVGroup">
                <h4>HRV</h4>
                <h5 :class="{ redValue: isHRVBelowAverage(item.HRV) }">
                  <span>{{ Math.round(item.HRV * 10) / 10 }}</span
                  >ms
                </h5>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M5.99159 3.37719L11.4726 8.99994L5.99159 14.6227C5.89346 14.7232 5.83853 14.858 5.83853 14.9984C5.83853 15.1389 5.89346 15.2737 5.99159 15.3742C6.03925 15.4228 6.09613 15.4615 6.15891 15.4879C6.2217 15.5142 6.28911 15.5278 6.35721 15.5278C6.42531 15.5278 6.49273 15.5142 6.55551 15.4879C6.61829 15.4615 6.67518 15.4228 6.72284 15.3742L12.5548 9.39257C12.6572 9.28752 12.7145 9.14664 12.7145 8.99994C12.7145 8.85325 12.6572 8.71236 12.5548 8.60732L6.72396 2.62569C6.67627 2.57671 6.61924 2.53777 6.55625 2.51119C6.49326 2.4846 6.42558 2.4709 6.35721 2.4709C6.28884 2.4709 6.22116 2.4846 6.15817 2.51119C6.09518 2.53777 6.03816 2.57671 5.99046 2.62569C5.89234 2.72615 5.8374 2.86101 5.8374 3.00144C5.8374 3.14187 5.89234 3.27673 5.99046 3.37719L5.99159 3.37719Z"
                  fill="#666666"
                />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </div>
    <a href="/HRVHistoryAll" class="goToHistoryAll"
      >歷史紀錄
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M13.3335 8L9.3335 12L13.3335 8ZM13.3335 8L9.3335 4L13.3335 8ZM13.3335 8L6.3335 8L13.3335 8ZM2.66683 8L4.3335 8L2.66683 8Z"
          fill="#EC4F4F"
        />
        <path
          d="M13.3335 8L9.3335 12M13.3335 8L9.3335 4M13.3335 8L6.3335 8M2.66683 8L4.3335 8"
          stroke="#EC4F4F"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </a>
    <button class="goToHRVBtn" @click="openHRVAlert">前往檢測</button>
  </div>
</template>
<script>
import { useRouter } from "vue-router";
import { formatTimestampMDH } from "~/fn/utils";
import HRVAlert from "~/components/HRVAlert.vue";
import RaphaelLoading from "../components/RaphaelLoading";
import DSPRSelect from "../components/DSPRSelect.vue";
import axios from "axios";
import { useCommon } from "../stores/common";
import { useUserData } from "~/fn/api";
export default {
  components: { RaphaelLoading, HRVAlert, DSPRSelect },
  setup() {
    const router = useRouter();
    const HRVData = ref([]);
    const userData = JSON.parse(localStorage.getItem("userData"));
    const store = useCommon();
    const loading = ref(false);
    const goBack = () => {
      router.push("/user");
    };
    const API_HRV2 = async () => {
      try {
        loading.value = true;
        const response = await fetch(
          "https://23700999.com:8081/HMA/API_HRV2.jsp",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              MID: userData.MID,
              MAID: userData.MAID,
              Token: userData.Token,
              Mobile: userData.Mobile,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          HRVData.value = data.HRV2;
        } else {
          console.error("Response not OK", response.status);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        loading.value = false;
      }
    };

    API_HRV2();

    const limitedHRVData = computed(() => HRVData.value.slice(0, 10));

    function getHRVRange(age, gender) {
      if (age >= 0 && age <= 29) return gender === "M" ? [29, 53] : [30, 57];
      else if (age >= 30 && age <= 39)
        return gender === "M" ? [25, 47] : [25, 44];
      else if (age >= 40 && age <= 49)
        return gender === "M" ? [21, 40] : [20, 40];
      else if (age >= 50 && age <= 59)
        return gender === "M" ? [15, 34] : [18, 38];
      else if (age >= 60) return gender === "M" ? [16, 33] : [15, 30];

      return [0, Infinity];
    }

    function isHRVBelowAverage(HRV) {
      const age = userData.Birthday
        ? new Date().getFullYear() - new Date(userData.Birthday).getFullYear()
        : 0;

      const range = getHRVRange(age, userData.Sex);
      return HRV < range[0];
    }

    useUserData();

    const openHRVAlert = async () => {
      store.showHRVAlert = true;
    };

    return {
      HRVData,
      limitedHRVData,
      formatTimestampMDH,
      isHRVBelowAverage,
      goBack,
      openHRVAlert,
      loading,
    };
  },
};
</script>
<style lang="scss">
.HRVHistory {
  background: url("../assets/imgs/gradient-bg.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  min-height: 100vh;
  width: 100%;
  padding: 0 5%;
}
.titleGroup {
  padding-top: 1.5rem;

  img {
    position: absolute;
    width: 14px;
    left: 3.5%;
    cursor: pointer;
  }
  h2 {
    text-align: center;
    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.5px;
  }
}

.detectWrap {
  background-color: #fff;
  min-height: 70vh;

  max-width: 768px;
  margin: 1.5rem auto 0;
  border-radius: 12px;

  h3 {
    text-align: center;
    color: #1e1e1e;
    text-align: center;
    font-family: "Noto Sans";
    font-size: 24px;
    font-weight: 400;
    letter-spacing: 0.5px;
    padding-top: 0.75rem;
  }

  .detectList {
    overflow-y: auto;
    max-height: 70vh;
  }

  .detectItem {
    width: 100%;
    margin: 0 auto;
    animation: fadeIn2 1s ease forwards;
    animation-delay: 0s;
    opacity: 0;
    @for $i from 1 through 10 {
      &:nth-child(#{$i}) {
        animation-delay: $i * 0.07s;
      }
    }
    a {
      text-decoration: none;
      color: #1e1e1e;
      display: flex;
      padding: 0 5%;
      .timeGroup {
        display: flex;
        align-items: center;
        gap: 4px;
        width: 45%;
        padding: 1.25rem 0;
        .timeIcon {
          border-radius: 7px;
          padding: 6px;
          border: 1px solid var(--brand-green-400, #74bc1f);
        }
        .time {
          font-family: "Noto Sans";
          font-size: 20px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.15px;
          margin-left: 0.5rem;
        }
      }
      .infoGroup {
        width: 60%;
        display: flex;
        align-items: center;
        white-space: nowrap;
        justify-content: end;

        white-space: nowrap h4 {
          color: #666;
          font-size: 1rem;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .detectAgeGroup {
          margin-right: 0.75rem;
        }
        .detectHRVGroup {
          margin-right: 0.5rem;
        }
        h5 {
          color: #b3b3b3;
          font-family: "Noto Sans";
          font-size: 1rem;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.5px;
          margin-top: 0.25rem;
          span {
            color: #1e1e1e;
            font-family: "Noto Sans";
            font-size: 1.5rem;
            font-style: normal;
            font-weight: 700;
            letter-spacing: 0.12px;
            margin-right: 0.5rem;
          }
        }
        .redValue {
          color: #ec4f4f;
        }
        svg {
          width: 18px;
        }
      }
      &:hover {
        background-color: #f4f4f4;
      }
    }
  }
}

@keyframes fadeIn2 {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.goToHistoryAll {
  color: #ec4f4f;
  text-align: center;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  letter-spacing: 0.09px;
  display: inline-block;
  width: 100%;
  margin-top: 0.75rem;
}

.goToHRVBtn {
  width: 100%;

  border-radius: 8px;
  background: #74bc1f;

  font-size: 18px;
  color: #fff;
  border: none;
  padding: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 100%;
  letter-spacing: 0.09px;
  margin-top: 5vh;
}
</style>
