<template>
  <RaphaelLoading v-if="isLoading" />
  <div class="finishWrap">
    <div class="finishGroup">


   <Navbar v-if="route.query.Version !== 'Detail'" /> 
    <div
      class="finishTitleMenu"
      v-if="route.query.Version === 'Detail'"
      :Text="currentDate"
    >
      <div class="backIcon" @click="goBack">
        <img src="/assets/imgs/backArrow.svg" alt="back" />
      </div>
      <h2>{{ currentDate }}</h2>
    </div>
    <div class="titleGroup">
      <div class="textGroup">
        <h3 class="nameText">{{ userName }}，您好</h3>
        <div class="timeGroup" >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z"
              stroke="#666666"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M6.33325 4.33334V7.66668H9.66659"
              stroke="#666666"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <h4>{{ currentDate }}</h4>
        </div>
      </div>  
      <div class="imgGroup">
        <a :href="`/healthData/${route.query.AID}`">
          <img src="@/assets/imgs/3dWatch.svg" class="watchImg" />
        </a>
       
        <img
          src="@/assets/imgs/doctor_nocomment.png"
          class="doctorImg"
          alt=""
        />
      </div>
    </div>

    <div class="scanInfo">
      <div class="row">
        <img :src="getImagePath('A', balanceScore)" alt="自律神經平衡" />
        <img :src="getImagePath('B', fatigueScore)" alt="生理疲勞" />
        <img :src="getImagePath('C', moodScore)" alt="心情指北針" />
        <img :src="getImagePath('D', pressureScore)" alt="血壓氣球" />
      </div>
      <div class="personalizedSuggestions">
        <h3>個人化建議</h3>
        <p>{{ personalizedSuggestion }}</p>
      </div>
      <div class="resultTextGroup">
      <h3>根據您的神經系統數據分析</h3>
      <p>{{ analysisResult }}</p>
    </div>
    </div>




  </div>
  <div class="subBtnGroup" v-if="!hasUID && route.query.Version !== 'Detail'">
      <router-link to="/HRVHistoryAll">
        <button class="backToUserBtn">HRV歷史紀錄</button>
      </router-link>
      <router-link to="/HRV">
        <button class="backToDetect">重新檢測</button>
      </router-link>
    </div>

    <div class="subBtnGroup2" v-if="hasUID && Flag==='1'">
      <router-link :to="`/usage/${ProductName}`">
        <button class="backToUserBtn2">返回穿衣紀錄</button>
      </router-link>
    </div>

    <div class="subBtnGroup2" v-if="hasUID && Flag==='2'">
      <router-link :to="`/usageHRVResult/${uid}`">
        <button class="backToUserBtn2">看報告</button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "../components/Navbar.vue";


// 狀態變數
const userName = ref("");
const currentDate = ref("");
const balanceScore = ref(3);
const fatigueScore = ref(3);
const moodScore = ref(3);
const pressureScore = ref(3);
const personalizedSuggestion = ref("");
const analysisResult = ref("");
const hasUID = ref(false);
const Flag = ref("");
const ProductName = ref("");
const uid = ref("");
const isLoading = ref(false);

// 路由相關
const route = useRoute();
const router  = useRouter();


// 計算屬性
const formattedDate = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}/${String(now.getDate()).padStart(2, "0")}`;
});

// 方法
const getImagePath = (type, score) => {
  return new URL(`../assets/imgs/tinified/${type}${score}.png`, import.meta.url)
    .href;
};

const fetchHRVData = async () => {
  try {
    isLoading.value = true;
    const userData = JSON.parse(localStorage.getItem("userData"));
    const aid = route.query.AID;

    if (!userData) {
      console.warn("No user data found");
      return;
    }

    const hrv3Params = {
      MID: userData.MID,
      Token: userData.Token,
      MAID: userData.MAID,
      Mobile: userData.Mobile,
      AID: aid || "",
    };

    const response = await fetch(
      "https://23700999.com:8081/HMA/api/fr/HRV3Detail",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hrv3Params),
      }
    );

    const data = await response.json();
    console.log("HRV3 API 回傳：", data);

    // 檢查是否有 UID
    if (data.UID) {
      hasUID.value = true;
      uid.value = data.UID;
      Flag.value = data.Flag;
      ProductName.value = data.ProductName;
    }

    // 計算各項指標
    const lf_hf = parseFloat(data.lf_hf);
    const sdnn = parseFloat(data.sdnn);
    const hbr = parseInt(data.hbr);
    const rr = parseInt(data.rr);
    const lf = parseFloat(data.lf);
    const hf = parseFloat(data.hf);
    const sbp = parseInt(data.sbp);
    const dbp = parseInt(data.dbp);

    // 更新分數和建議
    updateScores(lf_hf, sdnn, hbr, rr, lf, hf, sbp, dbp);
    updateSuggestions(lf_hf, sdnn, hbr, rr, lf, hf, sbp, dbp);
  } catch (error) {
    console.error("HRV3 API 錯誤：", error);
  } finally {
    isLoading.value = false;
  }
};

const updateScores = (lf_hf, sdnn, hbr, rr, lf, hf, sbp, dbp) => {
  // 自律神經平衡 (A)
  if (lf_hf > 2) balanceScore.value = 5;
  else if (lf_hf > 1.5) balanceScore.value = 4;
  else if (lf_hf >= 1) balanceScore.value = 3;
  else if (lf_hf >= 0.5) balanceScore.value = 2;
  else balanceScore.value = 1;

  // 生理疲勞 (B)
  if (sdnn < 20) fatigueScore.value = 5;
  else if (sdnn < 30) fatigueScore.value = 4;
  else if (sdnn < 50) fatigueScore.value = 3;
  else if (sdnn < 70) fatigueScore.value = 2;
  else fatigueScore.value = 1;

  // 心情指北針 (C)
  if (hbr && rr && lf && hf) {
    let score = 0;
    if (hbr > 90) score += 5;
    else if (hbr > 80) score += 4;
    else if (hbr > 70) score += 3;
    else if (hbr > 60) score += 2;
    else score += 1;

    if (rr > 18) score += 5;
    else if (rr > 15) score += 4;
    else if (rr > 12) score += 3;
    else if (rr > 10) score += 2;
    else score += 1;

    const lf_hf_ratio = lf / hf;
    if (lf_hf_ratio > 2) score += 5;
    else if (lf_hf_ratio > 1.5) score += 4;
    else if (lf_hf_ratio > 1) score += 3;
    else if (lf_hf_ratio > 0.5) score += 2;
    else score += 1;

    if (score >= 14) moodScore.value = 5;
    else if (score >= 12) moodScore.value = 4;
    else if (score >= 9) moodScore.value = 3;
    else if (score >= 5) moodScore.value = 2;
    else moodScore.value = 1;
  }

  // 血壓氣球 (D)
  if (sbp > 145 || dbp > 95) pressureScore.value = 5;
  else if (sbp >= 130 || dbp >= 85) pressureScore.value = 4;
  else if (sbp >= 110 && sbp <= 129 && dbp >= 70 && dbp <= 84)
    pressureScore.value = 3;
  else if (sbp >= 95 && dbp >= 60) pressureScore.value = 2;
  else pressureScore.value = 1;
};

const updateSuggestions = (lf_hf, sdnn, hbr, rr, lf, hf, sbp, dbp) => {
  const suggestions = [];

  // 自律神經平衡建議
  if (lf_hf > 2) {
    suggestions.push(
      "您的自律神經平衡顯示交感神經過度活躍，建議：\n1. 進行深呼吸練習\n2. 嘗試冥想或正念練習\n3. 避免過度刺激的活動\n4. 保持規律作息"
    );
  } else if (lf_hf > 1.5) {
    suggestions.push(
      "您的自律神經平衡顯示交感神經較為活躍，建議：\n1. 適度運動放鬆\n2. 保持充足睡眠\n3. 避免過度疲勞"
    );
  } else if (lf_hf >= 1) {
    suggestions.push(
      "您的自律神經平衡狀態良好，建議：\n1. 維持現有的生活習慣\n2. 保持規律運動\n3. 注意壓力管理"
    );
  } else if (lf_hf >= 0.5) {
    suggestions.push(
      "您的自律神經平衡顯示副交感神經較為活躍，建議：\n1. 適度增加運動量\n2. 保持活力作息\n3. 注意營養均衡"
    );
  } else {
    suggestions.push(
      "您的自律神經平衡顯示副交感神經過度活躍，建議：\n1. 增加有氧運動\n2. 保持規律作息\n3. 注意營養攝取"
    );
  }

  // 生理疲勞建議
  if (sdnn < 20) {
    suggestions.push(
      "\n您的生理疲勞程度較高，建議：\n1. 充分休息\n2. 避免過度勞累\n3. 保持規律作息\n4. 注意營養補充"
    );
  } else if (sdnn < 30) {
    suggestions.push(
      "\n您的生理疲勞程度中等，建議：\n1. 適度休息\n2. 保持規律運動\n3. 注意作息時間"
    );
  } else {
    suggestions.push(
      "\n您的生理疲勞程度正常，建議：\n1. 維持現有作息\n2. 保持規律運動\n3. 注意壓力管理"
    );
  }

  // 血壓建議
  if (sbp > 145 || dbp > 95) {
    suggestions.push(
      "\n您的血壓偏高，建議：\n1. 控制飲食，減少鹽分攝取\n2. 規律運動\n3. 定期監測血壓\n4. 必要時諮詢醫師"
    );
  } else if (sbp >= 130 || dbp >= 85) {
    suggestions.push(
      "\n您的血壓略高，建議：\n1. 注意飲食控制\n2. 保持適度運動\n3. 定期量測血壓"
    );
  } else if (sbp >= 110 && sbp <= 129 && dbp >= 70 && dbp <= 84) {
    suggestions.push(
      "\n您的血壓正常，建議：\n1. 維持健康生活習慣\n2. 保持規律運動\n3. 定期監測血壓"
    );
  } else if (sbp >= 95 && dbp >= 60) {
    suggestions.push(
      "\n您的血壓略低，建議：\n1. 注意營養攝取\n2. 適度運動增加活力\n3. 必要時諮詢醫師"
    );
  } else {
    suggestions.push(
      "\n您的血壓偏低，建議：\n1. 增加營養攝取\n2. 適度運動增加活力\n3. 必要時諮詢醫師"
    );
  }

  // 心情指北針建議
  if (moodScore.value >= 4) {
    suggestions.push(
      "\n您的心情狀態較為緊張，建議：\n1. 進行放鬆練習\n2. 保持充足睡眠\n3. 適度運動紓壓"
    );
  } else if (moodScore.value >= 3) {
    suggestions.push(
      "\n您的心情狀態穩定，建議：\n1. 維持現有生活習慣\n2. 保持規律運動\n3. 注意壓力管理"
    );
  } else {
    suggestions.push(
      "\n您的心情狀態良好，建議：\n1. 保持現有生活習慣\n2. 持續規律運動\n3. 維持良好作息"
    );
  }

  personalizedSuggestion.value = suggestions.join("");
  analysisResult.value =
    "根據您的檢測結果，我們為您提供了以上個人化建議。請根據建議調整生活習慣，定期進行檢測以追蹤改善情況。";
};

const goBack = () => {
  router.go(-1);
}

// 生命週期鉤子
onMounted(() => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  if (userData?.Name) {
    userName.value = userData.Name;
  }
  currentDate.value = formattedDate.value;



  fetchHRVData();
});
</script>

<style lang="scss" scoped>
// 變數定義
$primary-color: #74bc1f;
$text-color: #1e1e1e;
$neutral-color: #666;
$white: #fff;
$border-radius: 12px;

// 混合器
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.finishWrap {
  background: url("@/assets/imgs/gradient-bg.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  min-height: 100vh;
  width: 100%;
  .finishGroup{
    max-width: 976px;
    margin: 0 auto;
  }
  padding-bottom: 116px;
}

.finishTitleMenu {
  position: relative;
  gap: 16px;
  width: 100%;
  padding: 0 1rem;
  padding-top: 1rem;
  h2 {
    color: #000;
    text-align: center;
    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    line-height: 100%; /* 24px */
    letter-spacing: var(--Static-Body-Large-Tracking, 0.5px);
  }
  img {
    position: absolute;
    left: 5%;

    cursor: pointer;
    width: 32px;
    height: 32px;
  }
}
.titleGroup {
  @include flex-between;
  gap: 16px;
  width: 100%;
  padding: 0 1rem;
}

.textGroup {
  flex: 1;
  padding: 0.75rem;

  .timeGroup {
    @include flex-center;
    gap: 4px;
    margin-top: 0.25rem;
    justify-content: start;
    svg {
      transform: translateY(-4%);
    }

    h4 {
      font-size: 14px;
      font-weight: 400;
      margin: 0;
    }
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 400;
    margin: 0;
  }
}

.imgGroup {
  position: relative;

  .watchImg {
    position: absolute;
    top: 52%;
    right: 0;
    width: 26px;
    cursor: pointer;
  }

  .doctorImg {
    height: 150px;
  }
}

.scanInfo {
  max-width: 90%;
  margin-left: 5%;

  .row {
    @include flex-between;

    @media screen and (max-width: 768px) {
      flex-wrap: wrap;

      img {
        width: 49%;
      }
    }
  }
}

.personalizedSuggestions {
  background-color: $white;
  border-radius: $border-radius;
  border: 1px solid $white;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0px 0px 12px 0px $white inset, 0px 0px 6px 0px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(2px);
  margin-top: 0.75rem;
  padding: 1rem;
  margin-bottom: 0.75rem;

  h3 {
    color: $text-color;
    font-size: 20px;
    font-weight: 400;
    margin: 0 0 0.5rem 0;
    letter-spacing: 0.15px;
  }

  p {
    color: $text-color;
    font-size: 16px;
    font-weight: 400;
    margin: 0;
    letter-spacing: 0.09px;
    white-space: pre-line;
    line-height: 1.6;
  }
}

.resultTextGroup {
  background-color: $white;
  border-radius: $border-radius;

  padding: 1rem;


  h3 {
    color: $text-color;
    font-size: 20px;
    font-weight: 400;
    margin: 0 0 0.5rem 0;
    letter-spacing: 0.15px;
  }

  p {
    color: $text-color;
    font-size: 16px;
    font-weight: 400;
    margin: 0;
    letter-spacing: 0.09px;
    line-height: 1.6;
  }
}

.subBtnGroup,
.subBtnGroup2 {
  @include flex-between;
  width: 100%;
  gap: 0.75rem;
  padding: 0 1rem;
  padding-top: 0.75rem;
  padding-bottom: 3.125rem;
  position: fixed;
  bottom: 0;
  background: $white;

  a {
    text-decoration: none;
    width: 100%;
    text-align: center;
  }

  button {
    background-color: $primary-color;
    color: $white;
    padding: 8px;
    width: 100%;
    border-radius: 8px;
    border: none;
    font-size: 1rem;
    font-weight: 400;
    letter-spacing: 0.5px;
    transition: 0.25s ease;
    cursor: pointer;

    &:hover {
      filter: brightness(0.95);
    }
  }

  .backToUserBtn {
    background-color: #eee;
    color: $neutral-color;
  }
}
</style>
