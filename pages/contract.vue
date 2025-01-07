<template>
  <!-- 載入中 -->
  <RaphaelLoading v-if="loading" />

  <!-- 主要容器：當 loading 結束後才顯示 -->
  <div v-else class="contractWrap">
    <TitleMenu Text="追蹤合約" link="/user" />

    <!-- 篩選選單 -->
    <div class="contractTopMenu">
      <!-- 產品篩選 -->
      <div class="contractTopMenuItem" style="border-radius: 12px 0 0 12px">
        <div class="contractTopMenuTextBox" @click="toggleProductBox">
          <img src="/assets/imgs/filter.svg" alt="" />
          <h4>{{ selectedProduct ? selectedProduct : "所有產品" }}</h4>
        </div>
        <div v-if="productBoxVisible" class="productBox">
          <!-- 讓使用者可點擊選擇「所有產品」 -->
          <div class="contractTopProduct" @click="onSelectProduct(null)">
            所有產品
          </div>
          <!-- 動態列出四種產品 -->
          <div
            class="contractTopProduct"
            v-for="(prod, idx) in productOptions"
            :key="idx"
            @click="onSelectProduct(prod)"
          >
            {{ prod }}
          </div>
        </div>
        |
      </div>

      <!-- 狀態篩選 -->
      <div class="contractTopMenuItem" style="border-radius: 0 12px 12px 0">
        <div class="contractTopMenuTextBox" @click="toggleStateBox">
          <img src="/assets/imgs/filter.svg" alt="" />
          <h4>{{ selectedState ? selectedState : "所有狀態" }}</h4>
        </div>
        <div v-if="stateBoxVisible" class="stateBox">
          <!-- 讓使用者可點擊選擇「所有狀態」 -->
          <div class="contractTopState" @click="onSelectState(null)">
            所有狀態
          </div>
          <!-- 只有「進行中」「已到期」兩種 -->
          <div
            class="contractTopState"
            v-for="(st, idx) in stateOptions"
            :key="idx"
            @click="onSelectState(st)"
          >
            {{ st }}
          </div>
        </div>
      </div>
    </div>

    <!-- 合約內容區塊：這裡改用過濾後的 filteredContracts -->
    <div class="contractContentGroup">
      <div
        class="contractContent"
        v-for="(item, index) in filteredContracts"
        :key="index"
      >
        <!-- 合約標題、價格區 -->
        <div class="contractContentTitleGroup">
          <h3>{{ item.ProductName }}</h3>
          <div class="contractContentTitleTag">
            <img src="../assets/imgs/contractTag.svg" alt="" />
            <!-- 如果有金額，可以放這裡 -->
            <div class="contractPrice">
              {{ toThousands(item.TotalFee) }}
            </div>
          </div>
        </div>

        <!-- 進度條區塊 -->
        <div class="progressGroup">
          <div class="contractProgress">
            <div class="contractProgressTextGroup">
              <div
                v-if="
                  item.Still > 0 && item.UsedRatio > 0 && item.UsedRatio < 100
                "
                class="todayIcon"
                :style="{
                  left: item.UsedRatio + '%',
                }"
              >
                今天
              </div>
            </div>
            <div class="contractProgressBarGroup">
              <!-- progress 寬度用 UsedRatio (例如 0 ~ 100)，Still > 0 為綠，<= 0 為紅 -->
              <div
                class="contractProgressBar"
                :style="{
                  width: item.UsedRatio + '%',
                  backgroundColor: item.Still > 0 ? '#1FBCB3' : '#EC4F4F',
                }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 合約日期區塊 -->
        <div class="contractDayGroup">
          <div class="startTimeGroup">
            <h6>開始時間</h6>
            <h5>{{ item.RentStart }}</h5>
          </div>

          <!-- 如果剩餘天數 <= 0，就表示到期，給它另一個樣式 -->
          <div
            class="contractDayWarn"
            :class="{ contractDayWarn2: item.Still <= 0 }"
          >
            <img
              v-if="item.Still > 0"
              src="@/assets/imgs/contractTime.svg"
              alt="contract time"
            />
            <img
              v-else
              src="@/assets/imgs/contractWarning.svg"
              alt="contract warning"
            />
            <!-- API 的 Info 帶有「還有 XX 天」或「已到期」等文字 -->
            <h5>{{ item.Info }}</h5>
          </div>

          <div class="endTimeGroup">
            <h6>到期日期</h6>
            <h5>{{ item.RentEnd }}</h5>
          </div>
        </div>

        <!-- 若 PdfFileName 不為空，就顯示查看連結，並另開視窗 -->
        <div class="linkGroup">
          <a
            v-if="item.PdfFileName"
            :href="item.PdfFileName"
            target="_blank"
            rel="noopener noreferrer"
          >
            查看內容
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 18 18"
                fill="#74BC1F"
              >
                <path
                  d="M6.65764 3.75271L12.7476 10.0002L6.65764 16.2477C6.54862 16.3593 6.48758 16.5092 6.48758 16.6652C6.48758 16.8212 6.54862 16.9711 6.65764 17.0827C6.7106 17.1368 6.77381 17.1797 6.84356 17.209C6.91332 17.2383 6.98823 17.2534 7.06389 17.2534C7.13956 17.2534 7.21447 17.2383 7.28422 17.209C7.35398 17.1797 7.41719 17.1368 7.47014 17.0827L13.9501 10.4365C14.0639 10.3197 14.1276 10.1632 14.1276 10.0002C14.1276 9.83722 14.0639 9.68068 13.9501 9.56396L7.47139 2.91771C7.4184 2.86328 7.35504 2.82002 7.28505 2.79048C7.21506 2.76094 7.13986 2.74572 7.06389 2.74572C6.98793 2.74572 6.91273 2.76094 6.84274 2.79048C6.77275 2.82002 6.70939 2.86328 6.65639 2.91771C6.54737 3.02933 6.48633 3.17917 6.48633 3.33521C6.48633 3.49124 6.54737 3.64109 6.65639 3.75271L6.65764 3.75271Z"
                  fill="#74BC1F"
                />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import RaphaelLoading from "@/components/RaphaelLoading.vue";
import TitleMenu from "@/components/TitleMenu.vue";

export default {
  components: {
    RaphaelLoading,
    TitleMenu,
  },
  setup() {
    const router = useRouter();
    const productBoxVisible = ref(false);
    const stateBoxVisible = ref(false);
    const contractList = ref([]);
    const loading = ref(false);

    // 產品選單
    const productOptions = [
      "雙效紅光調節衣",
      "三效深眠衣",
      "神經調節衣",
      "居家治療儀",
    ];
    // 狀態選單
    const stateOptions = ["進行中", "已到期"];

    // 當前選擇的產品 / 狀態（null 代表「所有」）
    const selectedProduct = ref(null);
    const selectedState = ref(null);

    // 切換顯示下拉
    function toggleProductBox() {
      productBoxVisible.value = !productBoxVisible.value;
      stateBoxVisible.value = false;
    }
    function toggleStateBox() {
      stateBoxVisible.value = !stateBoxVisible.value;
      productBoxVisible.value = false;
    }

    // 點擊產品選項
    function onSelectProduct(prod) {
      selectedProduct.value = prod; // 若為 null => 「所有產品」
      productBoxVisible.value = false;
    }

    // 點擊狀態選項
    function onSelectState(st) {
      selectedState.value = st; // 若為 null => 「所有狀態」
      stateBoxVisible.value = false;
    }

    // 驗證 localStorage 內的使用者資訊
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

    // 撈取合約列表 API
    const API_Contract = async () => {
      try {
        loading.value = true;
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_Contract.jsp",
          {
            MID,
            Token,
            MAID,
            Mobile,
          }
        );
        if (response.status === 200) {
          // 將回傳結果存在 contractList 中
          contractList.value = response.data.ContractList;
          console.log("contractList:", contractList.value);
        }
      } catch (err) {
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    // 頁面載入時呼叫 API
    API_Contract();

    // 計算過濾後的合約列表
    const filteredContracts = computed(() => {
      return contractList.value.filter((item) => {
        // 1. 產品過濾
        const passProduct =
          !selectedProduct.value || item.ProductName === selectedProduct.value;

        // 2. 狀態過濾
        //   - "進行中": Still > 0
        //   - "已到期": Still <= 0
        //   - null 代表「所有狀態」
        let passState = true;
        if (selectedState.value === "進行中") {
          passState = item.Still > 0;
        } else if (selectedState.value === "已到期") {
          passState = item.Still <= 0;
        }

        return passProduct && passState;
      });
    });

    // 將數字轉成千分號字串
    const toThousands = (num) => {
      if (!num) return "0";
      // 也可先轉成數字再處理，例如: num = Number(num) || 0;
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return {
      // 變數與方法
      loading,
      productBoxVisible,
      stateBoxVisible,
      contractList,
      selectedProduct,
      selectedState,
      productOptions,
      stateOptions,

      // 方法
      toggleProductBox,
      toggleStateBox,
      onSelectProduct,
      onSelectState,

      // 計算屬性
      filteredContracts,
      toThousands,
    };
  },
};
</script>

<style lang="scss">
.contractWrap {
  background-color: $raphael-gray-100;
  min-height: 100vh;
  padding: 0 1rem 2.5rem;
  position: relative;

  .contractTopMenu {
    display: flex;
    color: #666;
    background-color: $raphael-gray-100;
    position: sticky;
    z-index: 1;
    top: 5%;
    padding-top: 4%;

    .contractTopMenuItem {
      display: flex;
      width: 50%;
      position: relative;
      background-color: #fff;
      padding: 12px 0;

      align-items: center;

      .contractTopMenuTextBox {
        display: flex;
        gap: 2px;
        width: 100%;
        padding-left: 0.6rem;
        cursor: pointer;
      }

      .productBox,
      .stateBox {
        display: flex;
        flex-direction: column;
        cursor: pointer;
        gap: 1rem;
        position: absolute;
        top: 92%;
        left: 0;
        background: rgba(255, 255, 255, 0.85);
        width: 95%;
        border-radius: 8px;
        text-align: center;
        padding: 0.75rem;
        font-size: 18px;
        max-height: 200px;
        backdrop-filter: blur(6px);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
        overflow-y: auto;
        transform: 0.25s all ease;
        animation: 0.3s fadeIn forwards;
        z-index: 10;
      }
    }
  }

  .contractContentGroup {
    margin-top: 1.5rem;

    .contractContent {
      background: #fff;
      padding: 12px;
      margin-top: 1rem;
      border-radius: 8px;
      .contractContentTitleGroup {
        display: flex;
        justify-content: space-between;

        h3 {
          color: #1e1e1e;
          font-family: "Noto Sans";
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.15px;
        }
        .contractContentTitleTag {
          display: flex;
          background: var(--primary-orange-100, #fef1e2);
          padding: 2px 6px;
          gap: 4px;
          color: #a34c1b;
          font-size: 18px;
          font-weight: 400;
          letter-spacing: 0.09px;
          border-radius: 50px;
        }
      }

      .progressGroup {
        .contractProgress {
          width: 100%;
          position: relative;
          .contractProgressTextGroup {
            position: absolute;
            top: -18px;
            width: 100%;
            height: 0;
            pointer-events: none;

            .todayIcon {
              position: absolute;
              transform: translateX(-50%);
              white-space: nowrap;
              color: #1fbcb3;
              letter-spacing: 0.04px;
              font-size: 12px;
            }
          }

          .contractProgressBarGroup {
            margin-top: 0.5rem;
            border-radius: 50px;
            background: #fff;
            overflow: hidden;
          }

          .contractProgressBarGroup {
            width: 100%;
            height: 12px;
            margin-top: 1.55rem;
            border-radius: 50px;
            background: #fff;
            box-shadow: inset 0px 1px 2px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            .contractProgressBar {
              height: 100%;
            }
          }
        }
      }

      .contractDayGroup {
        display: flex;
        justify-content: space-between;
        margin-top: 0.75rem;

        .startTimeGroup,
        .endTimeGroup {
          h6 {
            color: #ccc;
            font-size: 14px;
            font-weight: 400;
            letter-spacing: 0.048px;
          }
          h5 {
            color: #1e1e1e;
            font-size: 16px;
            font-weight: 400;
            letter-spacing: 0.5px;
          }
        }

        .contractDayWarn {
          display: flex;
          align-items: center;
          gap: 4px;
          border-radius: 4px;
          border: 1px solid #1fbcb3;
          background: rgba(31, 188, 179, 0.1);
          color: #1fbcb3;
          font-size: 16px;
          font-weight: 400;
          letter-spacing: 0.5px;
          padding: 8px;

          &.contractDayWarn2 {
            border-color: #ec4f4f;
            background: rgba(236, 79, 79, 0.1);
            color: #ec4f4f;
          }
        }
      }

      .linkGroup {
        text-align: right;
        margin-top: 0.75rem;

        a {
          display: inline;
          color: #74bc1f;
          font-size: 18px;
          font-weight: 400;
          letter-spacing: 0.09px;
          text-decoration: none;
        }
      }
    }
  }
}
</style>
