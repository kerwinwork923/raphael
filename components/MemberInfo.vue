<template>
  <div class="memberInfo">
    <!-- 會員頭像 + 等級名稱 + 歡迎訊息 -->
    <div class="levelGroup">
      <div class="imgGroup">
        <img :src="levelIcon" alt="會員等級圖示" />
      </div>
      <div class="levelTextGroup">
        <h4>{{ memberGradeName }}</h4>
        <p>{{ welcomeMessage }}</p>
      </div>
    </div>

    <!-- 消費＆積分資訊 -->
    <div class="consumptionPointsGroup">
      <div class="consumptionPoints">
        <p>{{ currentConsumption }}</p>
        <small>目前消費</small>
      </div>
      <div class="consumptionPoints">
        <p>{{ availablePoints }}點</p>
        <small>可兌換{{ canExchangeCount }}項 商品</small>
      </div>
    </div>

    <!-- 升級制度 -->
    <div class="pointInfoGroup" v-if="showPointInfo">
      <h3>升級制度</h3>
      <ul>
        <li>{{ keepGradeInfo }}</li>
        <li v-if="downgradeInfo">{{ downgradeInfo }}</li>
      </ul>
      <h3>等級特權</h3>
      <ul>
        <li v-for="(privilege, index) in privilegeList" :key="index">
          {{ privilege }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { usePoint } from "@/stores/point";

// 圖檔 import
import normalImg from "@/assets/imgs/point/normal.png";
import titaniumImg from "@/assets/imgs/point/titanium.png";
import silverImg from "@/assets/imgs/point/silver.png";
import goldImg from "@/assets/imgs/point/gold.png";

export default {
  name: "MemberInfo",

  props: {
    showPointInfo: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const pointStore = usePoint();
    const showPointInfo = computed(() => props.showPointInfo);
    // 會員等級名稱
    const memberGradeName = computed(() => pointStore.memberGradeName || "雲端會員");
    
    // 歡迎訊息
    const welcomeMessage = computed(() => {
      const localData = localStorage.getItem("userData");
      const { Name } = localData ? JSON.parse(localData) : {};
      return Name ? `${Name}，歡迎回來` : "歡迎回來";
    });

    // 目前消費金額
    const currentConsumption = computed(() => {
      // 缺
      // const upInfo = pointStore.upInfo || "";
      // // 從 "150000可升級金卡會員" 中提取數字
      // const match = upInfo.match(/(\d+)/);
      // if (match) {
      //   const amount = parseInt(match[1]);
      //   return `NT$${amount.toLocaleString()}`;
      // }
      return "缺";
    });

    // 可用積分
    const availablePoints = computed(() => {
      const str = pointStore.nowAvaPoints || "";
      const match = str.match(/\d+/);
      return match ? Number(match[0]) : 0;
    });

    // 可兌換商品數量
    const canExchangeCount = computed(() => {
      const canExchangeList = pointStore.bonusPaperList.filter((item) => item.Info === "兌換");
      return canExchangeList.length;
    });

    // 維持等級資訊
    const keepGradeInfo = computed(() => {
      const keepGrade = pointStore.keepGrade || "";
      return keepGrade || "再消費 NT$2,000 保持會員資格";
    });

    // 降級資訊
    const downgradeInfo = computed(() => {
      const upInfo = pointStore.upInfo || "";
      // 從 "150000可升級金卡會員" 中提取升級資訊
      if (upInfo.includes("可升級")) {
        return upInfo;
      }
      return "";
    });

    // 根據等級名稱對應圖片
    const levelIcon = computed(() => {
      switch (memberGradeName.value) {
        case "鈦金會員":
          return titaniumImg;
        case "金卡會員":
          return goldImg;
        case "銀卡會員":
          return silverImg;
        case "雲端會員":
          return normalImg;
        default:
          return normalImg;
      }
    });

    // 會員特權列表
    const privilegeList = computed(() => {
      const privileges = (pointStore.privillage || "")
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
      
      // 如果沒有特權資料，顯示預設特權
      if (privileges.length === 0) {
        return [
          "VIP專屬禮遇",
          "兌換獎品可立即使用",
          "任務積分*1.5倍",
          "消費100元換 1.5倍 的積分"
        ];
      }
      
      return privileges;
    });

    return {
      memberGradeName,
      welcomeMessage,
      currentConsumption,
      availablePoints,
      canExchangeCount,
      keepGradeInfo,
      downgradeInfo,
      levelIcon,
      privilegeList,
      showPointInfo,
    };
  },
};
</script>

<style lang="scss" scoped>
.memberInfo {
  .levelGroup {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.5rem;

    .imgGroup {
      width: 80px;
    }
    
    .levelTextGroup {
      h4 {
        color: var(--Neutral-black, #1e1e1e);
        font-size: var(--Text-font-size-20, 20px);
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.15px;
      }
      
      p {
        color: var(--Secondary-300, #b1c0d8);
        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.15px;
        margin-top: 0.2rem;
      }
    }
  }

  .consumptionPointsGroup {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.75rem;
    margin-bottom: 1rem;
    
    .consumptionPoints {
      border-radius: var(--Radius-r-20, 20px);
      background: var(--Secondary-100, #f5f7fa);
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
      width: 50%;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;

      p {
        color: var(--Neutral-black, #1e1e1e);
        text-align: center;
        font-size: var(--Text-font-size-24, 24px);
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.12px;
      }
      
      small {
        color: var(--Secondary-300, #b1c0d8);
        font-size: var(--Text-font-size-14, 14px);
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.1px;
      }
    }
  }

  .pointInfoGroup {
    margin-top: 0.75rem;
    
    h3 {
      color: var(--Neutral-black, #1e1e1e);
      font-size: var(--Text-font-size-20, 20px);
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.15px;
      margin-bottom: 0.75rem;
    }
    
    ul {
      li {
        border-radius: var(--Radius-r-20, 20px);
        background: var(--Secondary-100, #f5f7fa);
        box-shadow: 2px 4px 12px 0
          var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
        padding: 1rem;
        margin-bottom: 0.75rem;
        color: var(--Neutral-black, #1e1e1e);
        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 400;
        line-height: 1.5;
      }
    }
  }
}
</style>
