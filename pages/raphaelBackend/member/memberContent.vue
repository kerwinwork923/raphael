<template>
  <div class="memberInfo">
    <Sidebar />

    <!-- ───── 彈窗 ───── -->
    <ContractUserAlert
      v-if="showContract"
      :contracts="contractList"
      :member-name="member?.Name ?? ''"
      @close="closeContract"
    />
    <HRVUserAlertAlert
      v-if="showHRV"
      :record="selectedHRV"
      @close="closeHRV"
    />

    <AutonomicNerveAlert v-if="false" />
    <LifeDetectAlert v-if="false" />
    <BabyRecordAlert v-if="false" />

    <!-- ───── 主要內容 ───── -->
    <div class="memberInfoContent">
      <!-- 標題列 -->
      <div class="memberInfoTitle">
        <h3>{{ member?.Name ?? "—" }}</h3>
        <div class="optionGroup">
          <button @click="goBack">
            <img src="/assets/imgs/backend/back.svg" alt />返回
          </button>

          <button class="btn refresh" @click="refresh">資料更新</button>
          <span class="updated-time">最後更新: {{ lastUpdated || "—" }}</span>
        </div>
      </div>

      <!-- 卡片群 -->
      <div class="memberInfoCardWrap">
        <!-- █ 基本資料 + 合約 ------------------------------------------------ -->
        <div class="memberInfoRow">
          <div class="memberInfoCardGroup">
            <!-- 基本資料 -->
            <div class="memberInfoCard2">
              <h3>基本資料</h3>
              <h5>{{ member?.GradeName || "—" }}</h5>

              <div class="memberInfoList">
                <div class="memberInfoListTitle">
                  <img src="/assets/imgs/backend/birthday.svg" alt />生日
                </div>
                <div class="memberInfoListContent">
                  {{ member?.Birthday || "—" }}
                </div>
              </div>

              <div class="memberInfoList">
                <div class="memberInfoListTitle">
                  <img src="/assets/imgs/backend/phone.svg" alt />電話
                </div>
                <div class="memberInfoListContent">
                  {{ member?.Mobile || "—" }}
                </div>
              </div>

              <div class="memberInfoList">
                <div class="memberInfoListTitle">
                  <img src="/assets/imgs/backend/time.svg" alt />註冊時間
                </div>
                <div class="memberInfoListContent">
                  {{ member?.CheckTime || "—" }}
                </div>
              </div>

              <div class="memberInfoTagsGroup">
                <div class="memberInfoTag" v-if="member?.memType">
                  {{ member.memType }}
                </div>
              </div>
            </div>

            <!-- 合約 (沒有資料也要顯示空殼) -->
            <div class="memberInfoCard2">
              <template v-if="currentOrder">
                <h3>{{ currentOrder.ProductName }}</h3>
                <h5>目前合約</h5>

                <div class="memberInfoList">
                  <div class="memberInfoListTitle">
                    <img src="/assets/imgs/backend/time.svg" alt />開始時間
                  </div>
                  <div class="memberInfoListContent">
                    {{ currentOrder.RentStart }}
                  </div>
                </div>
                <div class="memberInfoList">
                  <div class="memberInfoListTitle">
                    <img src="/assets/imgs/backend/time.svg" alt />結束時間
                  </div>
                  <div class="memberInfoListContent">
                    {{ currentOrder.RentEnd }}
                  </div>
                </div>

                <div class="memberInfoWarning" v-if="isExpired">
                  合約已於
                  <h6>{{ currentOrder.RentEnd }} 到期</h6>
                  <div class="memberInfoWarning">
                    目前尚未續約，請確認是否續約以恢復服務。
                  </div>
                </div>
              </template>
              <template v-else>
                <h3>—</h3>
                <h5>目前合約</h5>
                <p style="text-align: center; padding: 8px 0">尚無合約資料</p>
              </template>

              <button class="consumptionBtn" @click="openContract">
                <img src="/assets/imgs/backend/time2.svg" alt />消費紀錄
              </button>
            </div>
          </div>

          <!-- █ 使用紀錄查詢 ------------------------------------------------- -->
          <div class="memberInfoCard">
            <h3>使用紀錄查詢</h3>
            <div class="memberInfoTitleGroup">
              <small>已使用 {{ totalHome }} 次</small>
              <VueDatePicker
                v-model="homeDateRange"
                range
                class="memberInfoDate1"
                :enable-time-picker="false"
                format="yyyy/MM/dd"
                placeholder="使用日期區間"
                prepend-icon="i-calendar"
              />
            </div>

            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div class="memberInfoTableTitleItem">APP 使用日期</div>
                <div class="memberInfoTableTitleItem">APP 結束日期</div>
                <div class="memberInfoTableTitleItem">間隔天數</div>
              </div>
              <div class="memberInfoTableHR" />

              <template v-if="paginatedHome.length">
                <div
                  class="memberInfoTableRow"
                  v-for="row in paginatedHome"
                  :key="row.StartTime"
                >
                  <div class="memberInfoTableRowItem">{{ row.StartTime }}</div>
                  <div class="memberInfoTableRowItem">{{ row.EndTime }}</div>
                  <div class="memberInfoTableRowItem">
                    {{ row.Interval }} 天
                  </div>
                </div>
              </template>
              <div class="memberInfoTableRow" v-else>
                <div class="memberInfoTableRowItem" style="width: 100%">
                  尚無資料
                </div>
              </div>
            </div>

            <!-- 分頁 10/頁 -->
            <nav class="pagination" v-if="totalHome">
              <button
                class="btn-page"
                :disabled="pageHome === 1"
                @click="gotoHome(1)"
              >
                &lt;&lt;
              </button>
              <button
                class="btn-page"
                :disabled="pageHome === 1"
                @click="prevHome"
              >
                &lt;
              </button>
              <button
                class="btn-page btn-page-number"
                v-for="p in pageNumberList"
                :key="p"
                :class="{ active: pageHome === p }"
                :disabled="p === '...'"
                @click="typeof p === 'number' && gotoHome(p)"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="pageHome === totalPagesHome"
                @click="nextHome"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="pageHome === totalPagesHome"
                @click="gotoHome(totalPagesHome)"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>

          <!-- 使用紀錄分析 -->
          <div class="memberInfoCard">
            <h3>使用紀錄分析</h3>
            <UsageAnalysisChart :usage-data="filteredHomeForChart" />
          </div>
        </div>

        <!-- █ HRV ----------------------------------------------------------- -->
        <div class="memberInfoRow">
          <div class="memberInfoCard w-half">
            <h3>HRV檢測紀錄查詢</h3>
            <div class="memberInfoTitleGroup">
              <small>共 {{ totalHRV }} 筆</small>
              <VueDatePicker
                v-model="hrvRange"
                range
                :enable-time-picker="false"
                format="yyyy/MM/dd"
              />
            </div>

            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div class="memberInfoTableTitleItem">檢測時間</div>
                <div class="memberInfoTableTitleItem">生理年齡</div>
                <div class="memberInfoTableTitleItem">HRV</div>
                <div class="memberInfoTableTitleItem">間隔天數</div>
              </div>
              <div class="memberInfoTableHR" />

              <template v-if="paginatedHRV.length">
                <div
                  class="memberInfoTableRow"
                  v-for="h in paginatedHRV"
                  :key="h.CheckTime"
                >
                  <div class="memberInfoTableRowItem">{{ h.CheckTime }}</div>
                  <div class="memberInfoTableRowItem">{{ h.bioage }}</div>
                  <div class="memberInfoTableRowItem">{{ h.HRV }}</div>
                  <div class="memberInfoTableRowItem">
                    {{ h.diffDays || "—" }}
                  </div>

                  <img
                    src="/assets/imgs/backend/goNext.svg"
                    alt="detail"
                    style="cursor: pointer"
                    @click="openHRV(h)"
                  />
                </div>
              </template>
              <div class="memberInfoTableRow" v-else>
                <div class="memberInfoTableRowItem" style="width: 100%">
                  尚無資料
                </div>
              </div>
            </div>

            <!-- 分頁 4/頁 -->
            <nav class="pagination" v-if="totalHRV">
              <button
                class="btn-page"
                :disabled="pageHRV === 1"
                @click="gotoHRV(1)"
              >
                &lt;&lt;
              </button>
              <button
                class="btn-page"
                :disabled="pageHRV === 1"
                @click="prevHRV"
              >
                &lt;
              </button>
              <button
                class="btn-page btn-page-number"
                v-for="p in pageNumberListHRV"
                :key="p"
                :class="{ active: pageHRV === p }"
                @click="gotoHRV(p)"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="pageHRV === totalPagesHRV"
                @click="nextHRV"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="pageHRV === totalPagesHRV"
                @click="gotoHRV(totalPagesHRV)"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>

          <div class="memberInfoCard w-half">
            <h3>HRV檢測紀錄分析</h3>
            <AnalysisChart
              :records="hrvRecords"
              :range="hrvRange"
              date-key="CheckTime"
              primary-key="bioage"
              secondary-key="HRV"
              primary-label="生理年齡"
              secondary-label="HRV"
            />
          </div>
        </div>

        <!-- █ 自律神經 ------------------------------------------------------- -->
        <div class="memberInfoRow">
          <div class="memberInfoCard w-half">
            <h3>自律神經檢測紀錄查詢</h3>
            <div class="memberInfoTitleGroup">
              <small>共 {{ totalANS }} 筆</small>
              <VueDatePicker
                v-model="ansRange"
                range
                :enable-time-picker="false"
                format="yyyy/MM/dd"
              />
            </div>

            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div class="memberInfoTableTitleItem">檢測時間</div>
                <div class="memberInfoTableTitleItem">分數</div>
                <div class="memberInfoTableTitleItem">嚴重程度</div>
                <div class="memberInfoTableTitleItem">天數差</div>
              </div>
              <div class="memberInfoTableHR" />

              <template v-if="paginatedANS.length">
                <div
                  class="memberInfoTableRow"
                  v-for="a in paginatedANS"
                  :key="a.CheckTime"
                >
                  <div class="memberInfoTableRowItem">{{ a.CheckTime }}</div>
                  <div class="memberInfoTableRowItem">{{ a.Score ?? "—" }}</div>
                  <div class="memberInfoTableRowItem">{{ a.Level ?? "—" }}</div>
                  <div class="memberInfoTableRowItem">
                    {{ a.diffDays ?? "—" }}
                  </div>
                  <img src="/assets/imgs/backend/goNext.svg" alt />
                </div>
              </template>
              <div class="memberInfoTableRow" v-else>
                <div class="memberInfoTableRowItem" style="width: 100%">
                  尚無資料
                </div>
              </div>
            </div>

            <nav class="pagination" v-if="totalANS">
              <button
                class="btn-page"
                :disabled="pageANS === 1"
                @click="goto(pageANS, 1)"
              >
                &lt;&lt;
              </button>
              <button
                class="btn-page"
                :disabled="pageANS === 1"
                @click="prev(pageANS)"
              >
                &lt;
              </button>
              <button
                class="btn-page btn-page-number"
                v-for="p in totalPagesANS"
                :key="p"
                :class="{ active: pageANS === p }"
                @click="goto(pageANS, p)"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="pageANS === totalPagesANS"
                @click="next(pageANS, totalPagesANS)"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="pageANS === totalPagesANS"
                @click="goto(pageANS, totalPagesANS)"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>

          <div class="memberInfoCard w-half">
            <h3>自律神經檢測紀錄分析</h3>
            <AnalysisChart
              :records="ansRecords"
              date-key="CheckTime"
              primary-key="TotalScore"
              primary-label="檢測分數"
            />
          </div>
        </div>

        <!-- █ 生活檢測 ------------------------------------------------------- -->
        <div class="memberInfoRow">
          <div class="memberInfoCard w-half">
            <h3>生活檢測紀錄查詢</h3>
            <div class="memberInfoTitleGroup">
              <small>共 {{ totalLife }} 筆</small>
              <VueDatePicker
                range
                v-model="lifeRange"
                :enable-time-picker="false"
                format="yyyy/MM/dd"
              />
            </div>

            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div class="memberInfoTableTitleItem">檢測時間</div>
                <div class="memberInfoTableTitleItem">分數</div>
                <div class="memberInfoTableTitleItem">生活品質</div>
                <div class="memberInfoTableTitleItem">天數差</div>
              </div>
              <div class="memberInfoTableHR" />

              <template v-if="paginatedLife.length">
                <div
                  class="memberInfoTableRow"
                  v-for="l in paginatedLife"
                  :key="l.CheckTime"
                >
                  <div class="memberInfoTableRowItem">{{ l.CheckTime }}</div>
                  <div class="memberInfoTableRowItem">{{ l.Score ?? "—" }}</div>
                  <div class="memberInfoTableRowItem">
                    {{ l.Quality ?? "—" }}
                  </div>
                  <div class="memberInfoTableRowItem">
                    {{ l.diffDays ?? "—" }}
                  </div>
                  <img src="/assets/imgs/backend/goNext.svg" alt />
                </div>
              </template>
              <div class="memberInfoTableRow" v-else>
                <div class="memberInfoTableRowItem" style="width: 100%">
                  尚無資料
                </div>
              </div>
            </div>

            <nav class="pagination" v-if="totalLife">
              <button
                class="btn-page"
                :disabled="pageLife === 1"
                @click="goto(pageLife, 1)"
              >
                &lt;&lt;
              </button>
              <button
                class="btn-page"
                :disabled="pageLife === 1"
                @click="prev(pageLife)"
              >
                &lt;
              </button>
              <button
                class="btn-page btn-page-number"
                v-for="p in totalPagesLife"
                :key="p"
                :class="{ active: pageLife === p }"
                @click="goto(pageLife, p)"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="pageLife === totalPagesLife"
                @click="next(pageLife, totalPagesLife)"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="pageLife === totalPagesLife"
                @click="goto(pageLife, totalPagesLife)"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>

          <div class="memberInfoCard w-half">
            <h3>生活檢測紀錄分析</h3>
            <AnalysisChart
              :records="lifeRecords"
              date-key="CheckTime"
              primary-key="Score"
              primary-label="檢測分數"
            />
          </div>
        </div>

        <!-- █ 寶貝檢測 ------------------------------------------------------- -->
        <div class="memberInfoRow">
          <div class="memberInfoCard w-half">
            <h3>寶貝檢測紀錄查詢</h3>
            <div class="memberInfoTitleGroup">
              <small>共 {{ totalChild }} 筆</small>
              <VueDatePicker
                range
                v-model="babyRange"
                :enable-time-picker="false"
                format="yyyy/MM/dd"
              />
            </div>

            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div class="memberInfoTableTitleItem">檢測時間</div>
                <div class="memberInfoTableTitleItem">分數</div>
                <div class="memberInfoTableTitleItem">嚴重程度</div>
                <div class="memberInfoTableTitleItem">天數差</div>
              </div>
              <div class="memberInfoTableHR" />

              <template v-if="paginatedChild.length">
                <div
                  class="memberInfoTableRow"
                  v-for="c in paginatedChild"
                  :key="c.CheckTime"
                >
                  <div class="memberInfoTableRowItem">{{ c.CheckTime }}</div>
                  <div class="memberInfoTableRowItem">{{ c.Score ?? "—" }}</div>
                  <div class="memberInfoTableRowItem">{{ c.Level ?? "—" }}</div>
                  <div class="memberInfoTableRowItem">
                    {{ c.diffDays ?? "—" }}
                  </div>
                  <img src="/assets/imgs/backend/goNext.svg" alt />
                </div>
              </template>
              <div class="memberInfoTableRow" v-else>
                <div class="memberInfoTableRowItem" style="width: 100%">
                  尚無資料
                </div>
              </div>
            </div>

            <nav class="pagination" v-if="totalChild">
              <button
                class="btn-page"
                :disabled="pageChild === 1"
                @click="goto(pageChild, 1)"
              >
                &lt;&lt;
              </button>
              <button
                class="btn-page"
                :disabled="pageChild === 1"
                @click="prev(pageChild)"
              >
                &lt;
              </button>
              <button
                class="btn-page btn-page-number"
                v-for="p in totalPagesChild"
                :key="p"
                :class="{ active: pageChild === p }"
                @click="goto(pageChild, p)"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="pageChild === totalPagesChild"
                @click="next(pageChild, totalPagesChild)"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="pageChild === totalPagesChild"
                @click="goto(pageChild, totalPagesChild)"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>

          <div class="memberInfoCard w-half">
            <h3>寶貝檢測紀錄分析</h3>
            <AnalysisChart
              :records="childANS"
              date-key="CheckTime"
              primary-key="Score"
              primary-label="檢測分數"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import VueDatePicker from "@vuepic/vue-datepicker";

import Sidebar from "~/components/raphaelBackend/Sidebar.vue";
import UsageAnalysisChart from "~/components/raphaelBackend/UsageAnalysisChart.vue";
import AnalysisChart from "~/components/raphaelBackend/AnalysisChart.vue";
import ContractUserAlert from "~/components/raphaelBackend/ContractUserAlert.vue";
import HRVUserAlertAlert from "~/components/raphaelBackend/HRVUserAlert.vue";
import AutonomicNerveAlert from "~/components/raphaelBackend/AutonomicNerve.vue";
import LifeDetectAlert from "~/components/raphaelBackend/LifeDetectAlert.vue";
import BabyRecordAlert from "~/components/raphaelBackend/BabyRecordAlert.vue";

/* ---------- 型別 ---------- */
type ApiMember = {
  Name: string;
  Birthday: string;
  Mobile: string;
  GradeName: string;
  memType: string;
  CheckTime: string;
};
type ApiOrder = { ProductName: string; RentStart: string; RentEnd: string };

/* ---------- Utils ---------- */
function getAuth() {
  return {
    token:
      localStorage.getItem("backendToken") ??
      sessionStorage.getItem("backendToken"),
    admin: localStorage.getItem("adminID") ?? sessionStorage.getItem("adminID"),
    sel: JSON.parse(localStorage.getItem("selectedMember") ?? "{}") as {
      MID?: string;
      Mobile?: string;
    },
  };
}

const showContract = ref(false);
const contractList = ref<any[]>([]);

/* ---------- refs ---------- */
const homeDateRange = ref<Date[] | null>(null);
const homeChartDateRange = ref<Date[] | null>(null);

const member = ref<ApiMember | null>(null);
const currentOrder = ref<ApiOrder | null>(null);
const lastUpdated = ref("");
const showHRV = ref(false);
const selectedHRV = ref<any>(null);

const homeOrders = ref<any[]>([]);
const hrvRecords = ref<any[]>([]);
const ansRecords = ref<any[]>([]);
const lifeRecords = ref<any[]>([]);
const childANS = ref<any[]>([]);

const hrvRange = ref<Date[] | null>(null);
const ansRange = ref<Date[] | null>(null);
const lifeRange = ref<Date[] | null>(null);
const babyRange = ref<Date[] | null>(null);

/* ---------- paging helpers ---------- */
const PAGE_MAIN = 4;
const PAGE_SUB = 4;

const pageNumberList = computed(() => {
  const total = totalPagesHome.value;
  const current = pageHome.value;
  const maxButtons = 5;
  const pages: number[] = [];

  if (total <= maxButtons) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    let start = Math.max(1, current - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;

    if (end > total) {
      end = total;
      start = total - maxButtons + 1;
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }

  return pages;
});

const filteredHome = computed(() => {
  if (!homeDateRange.value || homeDateRange.value.length < 2)
    return homeOrders.value;
  const [from, to] = homeDateRange.value;
  const start = from.getTime(),
    end = to.getTime();
  return homeOrders.value.filter((r) => {
    const ms = Date.parse(r.StartTime.replace(/\//g, "-"));
    return ms >= start && ms <= end;
  });
});

const filteredHomeForChart = computed(() => {
  if (!homeChartDateRange.value || homeChartDateRange.value.length < 2)
    return homeOrders.value;

  const [from, to] = homeChartDateRange.value;
  const start = from.getTime();
  const end = to.getTime();

  return homeOrders.value.filter((r) => {
    const ms = Date.parse(r.StartTime.replace(/\//g, "-"));
    return ms >= start && ms <= end;
  });
});

/* 使用紀錄 */
const pageHome = ref(1);

const totalHome = computed(() => filteredHome.value.length);

const totalPagesHome = computed(() =>
  Math.max(1, Math.ceil(totalHome.value / PAGE_MAIN))
);
const paginatedHome = computed(() => {
  const s = (pageHome.value - 1) * PAGE_MAIN;
  return filteredHome.value.slice(s, s + PAGE_MAIN);
});

// 使用紀錄專用
function gotoHome(p: number) {
  pageHome.value = p;
}
function prevHome() {
  if (pageHome.value > 1) pageHome.value--;
}
function nextHome() {
  if (pageHome.value < totalPagesHome.value) pageHome.value++;
}

/* HRV */
const pageHRV = ref(1);
/* 以 HRV 為例，其餘四個區塊做相同調整 ---------------------------- */
const totalHRV = computed(() => filteredHRV.value.length);

const totalPagesHRV = computed(() =>
  Math.max(1, Math.ceil(totalHRV.value / PAGE_SUB))
);
const paginatedHRV = computed(() => {
  const s = (pageHRV.value - 1) * PAGE_SUB;
  return filteredHRV.value.slice(s, s + PAGE_SUB);
});

/* ANS */
const pageANS = ref(1);
const totalANS = computed(() => ansRecords.value.length);
const totalPagesANS = computed(() =>
  Math.max(1, Math.ceil(totalANS.value / PAGE_SUB))
);
const paginatedANS = computed(() => {
  const s = (pageANS.value - 1) * PAGE_SUB;
  return ansRecords.value.slice(s, s + PAGE_SUB);
});

/* LIFE */
const pageLife = ref(1);
const totalLife = computed(() => lifeRecords.value.length);
const totalPagesLife = computed(() =>
  Math.max(1, Math.ceil(totalLife.value / PAGE_SUB))
);
const paginatedLife = computed(() => {
  const s = (pageLife.value - 1) * PAGE_SUB;
  return lifeRecords.value.slice(s, s + PAGE_SUB);
});

/* CHILD */
const pageChild = ref(1);
const totalChild = computed(() => childANS.value.length);
const totalPagesChild = computed(() =>
  Math.max(1, Math.ceil(totalChild.value / PAGE_SUB))
);
const paginatedChild = computed(() => {
  const s = (pageChild.value - 1) * PAGE_SUB;
  return childANS.value.slice(s, s + PAGE_SUB);
});

function gotoHRV(p: number) {
  pageHRV.value = p;
}
function prevHRV() {
  if (pageHRV.value > 1) pageHRV.value--;
}
function nextHRV() {
  if (pageHRV.value < totalPagesHRV.value) pageHRV.value++;
}

/* ---------- API ---------- */
async function fetchBasic() {
  const { token, admin, sel } = getAuth();
  if (!token || !admin || !sel.MID) return;
  const r = await fetch("https://23700999.com:8081/HMA/API_MemberDetail.jsp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      AdminID: admin,
      Token: token,
      MID: sel.MID,
      Mobile: sel.Mobile ?? "",
    }),
  });
  const j = await r.json();
  if (j.Result !== "OK") return;
  member.value = j.MemberDetail.Member;
  currentOrder.value = j.MemberDetail.NowOrderList?.[0] ?? null;
  lastUpdated.value = new Date().toLocaleString("zh-TW");
}

async function fetchExtras() {
  const { token, admin, sel } = getAuth();
  if (!token || !admin || !sel.MID) return;

  // 👉 一律帶空字串，後端就會給「全部資料」
  const empty = { StartDate: "", EndDate: "" };

  const post = (url: string, extra = empty) =>
    fetch(`https://23700999.com:8081/HMA/${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        AdminID: admin,
        Token: token,
        MID: sel.MID,
        Mobile: sel.Mobile ?? "",
        ...extra,
      }),
    }).then((r) => r.json());

  const [useRes, hrvRes, ansRes, lifeRes, babyRes] = await Promise.all([
    post("API_MemberUseRecord.jsp"),
    post("API_MemberHRV2.jsp"),
    post("API_MemberANS.jsp"),
    post("API_MemberSleepRec.jsp"),
    post("API_MemberChildANS.jsp", { CID: "" }),
  ]);

  homeOrders.value = useRes?.MemberUseRecode?.UseRecodeList ?? [];
  hrvRecords.value = hrvRes?.MemberHRV2?.HRV2List ?? [];
  ansRecords.value = ansRes?.MemberANS?.ANSList ?? [];
  lifeRecords.value = lifeRes?.MemberSleepRec?.SleepRecList ?? [];
  childANS.value = babyRes?.MemberChildANS?.ChildScore ?? [];
}

function openHRV(rec: any) {
  selectedHRV.value = rec;   // 把整筆傳給 Alert
  showHRV.value = true;
}
function closeHRV() {
  showHRV.value = false;
}

/* ---------- 共用範本 ---------- */
const makeFiltered = <T>(
  src: Ref<T[]>,
  range: Ref<Date[] | null>,
  dateKey: keyof T // 欄位名稱，如 'CheckTime'
) =>
  computed(() => {
    if (!range.value || range.value.length < 2) return src.value;
    const [from, to] = range.value;
    const start = from.getTime();
    const end = to.getTime();
    return src.value.filter((r: any) => {
      const ms = Date.parse(
        (r[dateKey] as string).split(" ")[0].replace(/\//g, "-")
      );
      return ms >= start && ms <= end;
    });
  });

/* ---------- 各列表 ---------- */
/* 列表：依 range 過濾 ------------------------------------- */
const filteredHRV = makeFiltered(hrvRecords, hrvRange, "CheckTime");
const filteredANS = makeFiltered(ansRecords, ansRange, "CheckTime");
const filteredLife = makeFiltered(lifeRecords, lifeRange, "CheckTime");
const filteredChild = makeFiltered(childANS, babyRange, "CheckTime");

/* 圖表：只要原始陣列 (完整) ------------------------------ */
const chartHRV = computed(() => hrvRecords.value); // 全部資料
const chartANS = computed(() => ansRecords.value);
const chartLife = computed(() => lifeRecords.value);
const chartChild = computed(() => childANS.value);

/* ---------- watch & lifecycle ---------- */
watch(homeDateRange, () => {
  pageHome.value = 1;
});

function pageButtons(total: number, current: number, max = 5) {
  const pages: number[] = [];
  if (total <= max) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    let start = Math.max(1, current - Math.floor(max / 2));
    let end = start + max - 1;
    if (end > total) {
      end = total;
      start = total - max + 1;
    }
    for (let i = start; i <= end; i++) pages.push(i);
  }
  return pages;
}

const pageNumberListHRV = computed(() =>
  pageButtons(totalPagesHRV.value, pageHRV.value)
);
const pageNumberListANS = computed(() =>
  pageButtons(totalPagesANS.value, pageANS.value)
);
const pageNumberListLife = computed(() =>
  pageButtons(totalPagesLife.value, pageLife.value)
);
const pageNumberListChild = computed(() =>
  pageButtons(totalPagesChild.value, pageChild.value)
);

onMounted(() => {
  fetchBasic();
  fetchExtras();
});

/* ---------- 分頁操作 ---------- */
function goto(refVar: Ref<number>, p: number) {
  refVar.value = p;
}
function prev(refVar: Ref<number>) {
  if (refVar.value > 1) refVar.value--;
}
function next(refVar: Ref<number>, totalPages: number) {
  if (refVar.value < totalPages) refVar.value++;
}

function openContract() {
  // 這裡示範直接用 currentOrder，也可以改呼叫 API 取得完整歷史
  contractList.value = currentOrder.value ? [currentOrder.value] : [];
  showContract.value = true;
}

function closeContract() {
  showContract.value = false;
}

/* ---------- 其他 ---------- */
const router = useRouter();
function refresh() {
  fetchBasic();
  fetchExtras();
}
function goBack() {
  window.location.href = "/raphaelBackend/member";
}
</script>

<style scoped lang="scss">
.memberInfo {
  display: flex;
  min-height: 100vh;
  background: $primary-100;
  gap: 1%;

  .w-half {
    width: 49% !important;
  }
  .memberInfoContent {
    padding: 24px;

    width: 84%;
    margin: 0 auto;

    .memberInfoTitle {
      width: 100%;
      display: flex;
      justify-content: space-between;
      .optionGroup {
        display: flex;
        align-items: center;
        gap: 8px;
        button {
          display: flex;
          gap: 4px;
          img {
            width: 18px;
          }
          background-color: $primary-200;
          border: none;
          color: var(--Primary-100, #f5f7fa);
          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 400;
          padding: 0.25rem 0.5rem;
          letter-spacing: 0.25px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          &:hover {
            background-color: $primary-300;
          }
          @include respond-to("lg") {
            font-size: 1rem;
            padding: 0.25rem 0.5rem;
          }
        }
      }
      h3 {
        color: var(--Primary-600, #2d3047);
        text-align: center;
        font-size: 32px;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.09px;
      }
    }
    .memberInfoCardWrap {
      .memberInfoRow {
        width: 100%;
        display: flex;
        gap: 12px;
        margin-top: 1rem;
        h3 {
          color: var(--Primary-600, #2d3047);
          font-family: "Noto Sans";
          font-size: var(--Text-font-size-24, 20px);
          font-weight: bold;
          letter-spacing: 0.12px;
          margin-bottom: 0.75rem;
        }
        h5 {
          color: var(--Primary-300, #6d8ab6);
          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.09px;
          margin-bottom: 0.25rem;
        }
        .memberInfoWarning {
          color: var(--Warning-default, #ec4f4f);
          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.09px;
          padding: 0.25rem 0;
        }

        .memberInfoCard {
          padding: 1rem;
          background-color: #fff;
          border-radius: 20px;
          position: relative;
          .pagination {
            max-width: 100%;
            flex-wrap: wrap;
            overflow: hidden;
          }
        }

        .memberInfoList {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--Primary-200, #b1c0d8);
          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.09px;
          line-height: 1.5;

          img {
            transform: translateY(3px);
          }
          .memberInfoListContent {
            color: var(--Primary-600, #2d3047);
          }
        }
        .memberInfoTagsGroup {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 1rem;
          .memberInfoTag {
            border-radius: 50px;
            border: 1px solid var(--Primary-default, #1ba39b);
            background: var(--primary-400-opacity-10, rgba(27, 163, 155, 0.1));
            color: var(--Primary-default, #1ba39b);
            text-align: center;
            font-family: "Noto Sans";
            font-size: var(--Text-font-size-18, 18px);
            font-style: normal;
            font-weight: 400;
            line-height: 100%; /* 18px */
            letter-spacing: 0.09px;
            padding: 8px;

            img {
              width: 1rem;
            }
          }
        }
        .consumptionBtn {
          width: 100%;
          padding: 6px 8px;
          color: var(--Primary-default, #1ba39b);

          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 400;
          line-height: 100%; /* 18px */
          letter-spacing: 0.09px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: transparent;
          border: none;
          border: 1px solid #1ba39b;
          border-radius: 6px;
          margin-top: 0.75rem;
          cursor: pointer;
        }
        .memberInfoTitleGroup {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 0.75rem;
          small {
            white-space: nowrap;
          }
          .memberInfoDate1 {
            width: 60%;
          }
        }
      }
      .memberInfoCardGroup {
        display: flex;
        flex-direction: column;

        width: 29%;
        gap: 12px;
        justify-content: space-between;
        .memberInfoCard2 {
          padding: 1rem;
          width: 100%;
          border-radius: 20px;
          background-color: #fff;
        }
      }
    }
    small {
      color: var(--Primary-200, #b1c0d8);
      font-family: "Noto Sans";
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.5px;
    }
    .memberInfoTable {
      .memberInfoTableTitle {
        display: flex;
        white-space: nowrap;
        font-size: 1rem;
        .memberInfoTableTitleItem {
          width: 33.3333%;
          text-align: center;
        }
      }
      .memberInfoTableHR {
        height: 1px;
        width: 100%;
        background-color: #b1c0d8;
        margin-top: 0.5rem;
      }
      .memberInfoTableRow {
        display: flex;
        align-items: center;
        position: relative;
        img {
          position: absolute;
          right: 0;
        }
        .memberInfoTableRowItem {
          width: 33.3333%;
          text-align: center;
          padding: 0.75rem;
        }
      }
    }
  }
  .pagination {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-top: 4px;
    margin-bottom: 24px;
    .btn-page {
      padding: 6px 10px;
      min-width: 32px;

      border-radius: 4px;

      background-color: transparent;
      cursor: pointer;
      border: none;
      &.active {
        background: $chip-success;
        color: white;
        border-color: $chip-success;
      }
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .btn-page-number {
      background: white;
    }
  }
}
</style>
