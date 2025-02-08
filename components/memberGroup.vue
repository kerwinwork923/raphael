<template>
  <div class="memberGroup">
    <!-- 會員頭像 + 等級名稱 + 維持等級提示 -->
    <div class="memberTitleGroup">
      <div class="memberImage" v-if="levelIcon">
        <img :src="levelIcon" alt="會員等級圖示" />
      </div>
      <div class="memberTitleTextGroup">
        <h3>{{ memberGradeName }}</h3>
        <p>{{ keepGrade }}</p>
      </div>
    </div>

    <!-- 消費＆積分進度 -->
    <div class="consumingRecords">
      <!-- 左：再消費區塊 -->
      <div class="consumingRecordsItem consumingRecordsItem1">
        <h5>再消費</h5>
        <div class="consumingRecordsItemContent">
          <!-- 用 upInfoNumberFormatted 來顯示帶有千分號的金額 -->
          <div class="consumingRecordsNumber">
            {{ upInfoNumberFormatted }}
          </div>
          <h6>{{ upInfoText }}</h6>
        </div>
      </div>

      <div class="consumingRecordsLine"></div>

      <!-- 右：累積積分區塊 -->
      <div class="consumingRecordsItem consumingRecordsItem2">
        <h5>累積積分</h5>
        <div class="consumingRecordsItemContent">
          <div class="consumingRecordsNumber">{{ nowPoints }}點</div>
        </div>
      </div>
    </div>

    <!-- 會員特權: 預設不展開, 點擊時切換 -->
    <div class="privilege">
      <div class="privilegeTitleGroup" @click="togglePrivilege">
        <h4>當前等級特權</h4>
        <!-- 箭頭：朝右 => rotate(0deg)，展開 => rotate(90deg) -->
        <img
          class="arrowIcon"
          :class="{ down: privilegeOpen }"
          src="/assets/imgs/arrowDown.svg"
          alt="arrow"
        />
      </div>

      <!-- 展開/收起的內容用 v-if 或 transition -->
      <transition name="fade">
        <div class="privilegeContent" v-if="privilegeOpen">
          <ul>
            <li>任務積分 * 1.2倍</li>
            <li>消費100元換1.2倍的積分</li>
          </ul>
        </div>
      </transition>
    </div>

    <!-- 若 showExchangeGroup => 顯示分隔線 -->
    <div class="privilegeHR" v-if="showExchangeGroup"></div>

    <!-- 可兌換獎品區（用 props 傳入的 showExchangeGroup 來控制） -->
    <div class="exchangeGroup" v-if="showExchangeGroup">
      <h5>可兌換獎品</h5>
      <router-link to="pointExange">
        <div class="exchangeText">
          {{ canExchangeCount }}項
          <img src="/assets/imgs/arrowDown.svg" alt="" />
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePoint } from "@/stores/point";

// 圖檔 import
import normalImg from "@/assets/imgs/normal.svg";
import copperImg from "@/assets/imgs/copper.svg";
import silverImg from "@/assets/imgs/silver.svg";
import goldImg from "@/assets/imgs/gold.svg";

export default {
  name: "memberGroup",

  props: {
    showExchangeGroup: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const router = useRouter();
    const pointStore = usePoint();

    // 是否展開會員特權
    const privilegeOpen = ref(false);
    const togglePrivilege = () => {
      privilegeOpen.value = !privilegeOpen.value;
    };

    // 會員等級名稱 (e.g. "雲端會員"、"青銅會員"、"白銀會員"、"黃金會員")
    const memberGradeName = computed(() => pointStore.memberGradeName || "");
    // 維持等級文字
    const keepGrade = computed(() => pointStore.keepGrade || "");

    // 再消費資訊, e.g. "再消費630911可升級黃金會員"
    const upInfoRaw = computed(() => pointStore.upInfo || "");

    // 只取其中的數字 e.g. 630911
    const upInfoNumber = computed(() => {
      const match = upInfoRaw.value.match(/\d+/);
      return match ? match[0] : "";
    });

    // 顯示文字 => "再消費可升級黃金會員"
    const upInfoText = computed(() => {
      return upInfoRaw.value.replace(/\d+/, "");
    });

    // 把再消費金額加上千分位 => 630,911
    const upInfoNumberFormatted = computed(() => {
      const val = Number(upInfoNumber.value) || 0;
      // 用 toLocaleString 或自定義函式
      return val.toLocaleString();
    });

    // 目前累積積分 (e.g. "累積積分6141點" => 6141)
    const nowPoints = computed(() => {
      const str = pointStore.nowAvaPoints || "";
      const match = str.match(/\d+/);
      return match ? Number(match[0]) : 0;
    });

    // 根據等級名稱對應圖片
    const levelIcon = computed(() => {
      switch (memberGradeName.value) {
        case "黃金會員":
          return goldImg;
        case "白銀會員":
          return silverImg;
        case "青銅會員":
          return copperImg;
        case "雲端會員":
          return normalImg;
        default:
          return null; // 這裡改成 null，不要一開始就給 normalImg
      }
    });

    // 可兌換產品
    const canExchangeList = computed(() =>
      pointStore.bonusPaperList.filter((item) => item.Info === "兌換")
    );
    const canExchangeCount = computed(() => canExchangeList.value.length);

    // API
    const API_Bonus = async () => {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile, Name } = localData
        ? JSON.parse(localData)
        : {};

      if (!MID || !Token || !MAID || !Mobile) {
        localStorage.removeItem("userData");
        router.push("/");
        return;
      } else if (Name === "") {
        router.push("/changeMember");
        return;
      }

      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_Bonus.jsp",
          { MID, Token, MAID, Mobile }
        );
        if (response.status === 200) {
          pointStore.setNowBonusState(response.data.NowBonusState);
          console.log("API_Bonus 資料:", response.data.NowBonusState);
        } else {
          console.log("API_Bonus error:", response);
        }
      } catch (err) {
        console.log("API_Bonus catch error:", err);
      }
    };

    onMounted(() => {
      API_Bonus();
    });

    return {
      privilegeOpen,
      togglePrivilege,

      memberGradeName,
      keepGrade,
      upInfoRaw,
      upInfoNumber,
      upInfoText,
      upInfoNumberFormatted,
      nowPoints,
      levelIcon,
      canExchangeCount,
    };
  },
};
</script>

<style lang="scss">
.memberGroup {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  max-width: 768px;
  margin: 0 auto;

  .memberTitleGroup {
    display: flex;
    align-items: center;
    gap: 12px;
    .memberImage {
      width: 25%;
      display: flex;
      justify-content: center;
      img {
        width: 100%;
        max-width: 70px;
      }
    }
    .memberTitleTextGroup {
      width: 75%;
      h3 {
        color: #1e1e1e;
        font-family: "Noto Sans";
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 0.15px;
      }
      p {
        color: #666;
        margin-top: 0.25rem;
        font-family: "Noto Sans";
        font-size: 16px;
        font-weight: 400;
        line-height: 25.888px;
      }
    }
  }

  .consumingRecords {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
    .consumingRecordsItem {
      color: #ccc;
      font-family: "Noto Sans";
      font-size: 14px;
      letter-spacing: 0.048px;
      line-height: 1.25;      

      .consumingRecordsNumber {
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 0.15px;
      }
      .consumingRecordsItemContent {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
    .consumingRecordsItem1 {      
      flex: 1;
      .consumingRecordsNumber {
        color: #74bc1f;
      }
    }
    .consumingRecordsItem2 {
      width: 40%;
      .consumingRecordsNumber {
        color: #1fbcb3;
      }
    }
    .consumingRecordsLine {
      height: 57px;
      width: 1px;
      background-color: #eee;
    }
  }

  .privilege {
    margin-top: 1rem;

    /* 點擊區 */
    .privilegeTitleGroup {
      display: flex;
      justify-content: space-between;
      cursor: pointer;

      /* 箭頭預設指向右 */
      .arrowIcon {
        width: 1rem;
        transition: transform 0.2s ease;
        transform: rotate(-90deg);
        /* 如果 arrowDown.svg 是朝下箭頭，就先讓它旋轉-90deg當作"右箭頭"
             例如: transform: rotate(-90deg);
             再把 .down 改成 rotate(0deg)
             依你的實際箭頭圖檔方向來決定
          */
      }
      /* 特權展開後 => 箭頭朝下 */
      .arrowIcon.down {
        transform: rotate(0deg);
      }
    }

    /* 展開的內容 */
    .privilegeContent {
      border-radius: 8px;
      background: #f6f6f6;
      padding: 6px 12px;
      margin-top: 0.7rem;
      ul {
        list-style: inside;
        color: #666;
        font-size: 16px;
        li {
          line-height: 1.5;
        }
      }
    }
  }

  .privilegeHR {
    height: 1px;
    width: 100%;
    background-color: #eee;
    margin: 0.75rem 0;
  }

  .exchangeGroup {
    display: flex;
    justify-content: space-between;
    margin-top: 0.75rem;

    .exchangeText {
      display: flex;
      gap: 4px;
      align-items: center;
      color: #74bc1f;
      cursor: pointer;

      img {
        transform: rotate(-90deg);
        width: 1rem;
      }
    }
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.4s ease, transform 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
