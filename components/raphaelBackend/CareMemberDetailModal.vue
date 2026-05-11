<template>
  <transition name="care-member-fade">
    <div
      v-if="show && member"
      class="careMemberModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="careMemberModalTitle"
      @click.self="handleClose"
    >
      <div class="careMemberModal__panel" @click.stop>
        <header class="careMemberModal__head">
          <h2 id="careMemberModalTitle" class="careMemberModal__title">
            會員詳細資料
          </h2>
          <button type="button" class="careMemberModal__careBtn" @click="emitCare">
            <span class="careMemberModal__careIcon" aria-hidden="true">＋</span>
            關懷
          </button>
        </header>

        <section class="careMemberModal__profile">
          <div class="careMemberModal__nameRow">
            <strong class="careMemberModal__name">{{ member.name }}</strong>
            <span class="careMemberModal__levelTag">{{ levelTag }}</span>
          </div>
          <p class="careMemberModal__meta">
            病歷號 {{ chartNo }}｜{{ age }}歲｜{{ gender }}｜{{ city }}｜諮詢師
            {{ consultant }}
          </p>
        </section>

        <div class="careMemberModal__statGrid">
          <div class="careMemberModal__statCell">
            <span class="careMemberModal__statLabel">合約狀態</span>
            <span class="careMemberModal__statValue careMemberModal__statValue--info">
              {{ contractStatus }}
            </span>
          </div>
          <div class="careMemberModal__statCell">
            <span class="careMemberModal__statLabel">合約到期</span>
            <span class="careMemberModal__statValue careMemberModal__statValue--danger">
              {{ contractEnd }}（剩{{ contractDaysLeft }}天）
            </span>
          </div>
          <div class="careMemberModal__statCell">
            <span class="careMemberModal__statLabel">最近回診</span>
            <span class="careMemberModal__statValue">{{ lastVisit }}</span>
          </div>
          <div class="careMemberModal__statCell">
            <span class="careMemberModal__statLabel">下次回診</span>
            <span class="careMemberModal__statValue careMemberModal__statValue--accent">
              {{ nextVisit }}
            </span>
          </div>
        </div>

        <div class="careMemberModal__alertBar">
          <div class="careMemberModal__alertMain">
            <span class="careMemberModal__alertIcon" aria-hidden="true">⚠</span>
            <span>
              本週自動示警（{{ alertWeekRange }}）接頭不良 5 次（第 4 週）退費相關
            </span>
          </div>
          <div class="careMemberModal__alertActions">
            <button type="button" class="careMemberModal__btnOutline">
              ✓ 標記已確認
            </button>
            <button type="button" class="careMemberModal__btnGhost">忽略</button>
          </div>
        </div>

        <div class="careMemberModal__eventCards">
          <button
            type="button"
            class="careMemberModal__eventCard"
            @click="instrumentSubOpen = true"
          >
            <div class="careMemberModal__eventCardTop">
              <span class="careMemberModal__eventTitle">儀器操作事件</span>
              <span class="careMemberModal__signal careMemberModal__signal--red" />
            </div>
            <ul class="careMemberModal__eventList">
              <li>接頭接觸不良（5）</li>
              <li>治療紀錄遺漏（2）</li>
            </ul>
            <span class="careMemberModal__eventLink">事件紀錄（共 5 筆）</span>
          </button>
          <div class="careMemberModal__eventCard">
            <div class="careMemberModal__eventCardTop">
              <span class="careMemberModal__eventTitle">APP 留言事件</span>
              <span class="careMemberModal__signal careMemberModal__signal--red" />
            </div>
            <ul class="careMemberModal__eventList">
              <li>退費風險示警（1）</li>
              <li>APP 留言未留（2）</li>
            </ul>
            <span class="careMemberModal__eventLink">事件紀錄（共 2 筆）</span>
          </div>
          <div class="careMemberModal__eventCard">
            <div class="careMemberModal__eventCardTop">
              <span class="careMemberModal__eventTitle">健康數據事件</span>
              <span class="careMemberModal__signal careMemberModal__signal--yellow" />
            </div>
            <ul class="careMemberModal__eventList">
              <li>健康數據中斷（1）</li>
              <li>心率、血氧、睡眠未上傳</li>
            </ul>
            <span class="careMemberModal__eventLink">事件紀錄（共 2 筆）</span>
          </div>
        </div>

        <div class="careMemberModal__tabs">
          <button
            type="button"
            :class="{ active: activeTab === 'history' }"
            @click="activeTab = 'history'"
          >
            聯繫歷史
            <span class="careMemberModal__tabBadge">7</span>
          </button>
          <button
            type="button"
            :class="{ active: activeTab === 'basic' }"
            @click="activeTab = 'basic'"
          >
            基本資料
          </button>
        </div>

        <div v-if="activeTab === 'history'" class="careMemberModal__tabBody">
          <div class="careMemberModal__filters">
            <select class="careMemberModal__select" aria-label="來源">
              <option>全部來源</option>
              <option>LINE</option>
              <option>電話</option>
            </select>
            <select class="careMemberModal__select" aria-label="燈號">
              <option>全部燈號</option>
              <option>紅燈</option>
              <option>黃燈</option>
              <option>綠燈</option>
            </select>
            <div class="careMemberModal__dateRange">
              <span>區間</span>
              <input type="date" class="careMemberModal__dateInput" value="2026-05-08" />
              <span>—</span>
              <input type="date" class="careMemberModal__dateInput" value="2026-05-08" />
            </div>
            <button type="button" class="careMemberModal__btnGhost">清除</button>
          </div>

          <div class="careMemberModal__historyHead">
            <span>燈號</span>
            <span>來源</span>
            <span>事件摘要</span>
            <span>開案時間</span>
            <span>狀態</span>
          </div>
          <ul class="careMemberModal__historyList">
            <li
              v-for="(row, idx) in historyRows"
              :key="idx"
              class="careMemberModal__historyRow"
            >
              <span
                class="careMemberModal__dot"
                :class="`careMemberModal__dot--${row.light}`"
              />
              <span class="careMemberModal__srcTag">{{ row.source }}</span>
              <div class="careMemberModal__historyMain">
                <strong>{{ row.title }}</strong>
                <p class="careMemberModal__historySub">{{ row.sub }}</p>
                <div
                  v-if="row.alert"
                  class="careMemberModal__inlineAlert"
                  :class="`careMemberModal__inlineAlert--${row.alertTone}`"
                >
                  {{ row.alert }}
                </div>
                <p v-if="row.note" class="careMemberModal__historyNote">{{ row.note }}</p>
              </div>
              <time class="careMemberModal__historyTime">{{ row.time }}</time>
              <div class="careMemberModal__historyStatus">
                <button
                  v-if="row.status === 'tracking'"
                  type="button"
                  class="careMemberModal__statusPill careMemberModal__statusPill--track"
                >
                  追蹤中
                </button>
                <button
                  v-else
                  type="button"
                  class="careMemberModal__statusPill careMemberModal__statusPill--done"
                >
                  已結案
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div v-else class="careMemberModal__tabBody careMemberModal__basicBody">
          <div class="careMemberModal__basicCol">
            <section class="careMemberModal__cardBlock">
              <div class="careMemberModal__cardHead">
                <span>個人資料</span>
                <button type="button" class="careMemberModal__btnMini">編輯</button>
              </div>
              <dl class="careMemberModal__kv">
                <div><dt>姓名</dt><dd>{{ member.name }}</dd></div>
                <div><dt>性別</dt><dd>{{ gender }}</dd></div>
                <div><dt>生日</dt><dd>{{ birthday }}</dd></div>
                <div><dt>病歷號</dt><dd>{{ chartNo }}</dd></div>
                <div><dt>手機</dt><dd>{{ phone }}</dd></div>
                <div><dt>院所</dt><dd>{{ branch }}</dd></div>
                <div><dt>諮詢師</dt><dd>{{ consultant }}</dd></div>
                <div>
                  <dt>會員等級</dt>
                  <dd><span class="careMemberModal__vip">VIP</span></dd>
                </div>
              </dl>
            </section>
            <section class="careMemberModal__cardBlock">
              <div class="careMemberModal__cardHead"><span>合約資訊</span></div>
              <dl class="careMemberModal__kv">
                <div><dt>方案</dt><dd>年度旗艦方案</dd></div>
                <div>
                  <dt>回診狀態</dt>
                  <dd><span class="careMemberModal__ok">穩定回診</span></dd>
                </div>
                <div><dt>合約起迄</dt><dd>2025/07/01 — {{ contractEnd }}</dd></div>
                <div><dt>特殊備註</dt><dd class="careMemberModal__noteBox">{{ specialNote }}</dd></div>
              </dl>
            </section>
          </div>
          <div class="careMemberModal__basicCol careMemberModal__basicCol--wide">
            <section class="careMemberModal__cardBlock">
              <div class="careMemberModal__cardHead careMemberModal__cardHead--split">
                <span>設備使用履歷</span>
                <button type="button" class="careMemberModal__btnOutline careMemberModal__btnSm">
                  新增設備配發
                </button>
              </div>
              <div class="careMemberModal__deviceCard">
                <div class="careMemberModal__deviceTop">
                  <div>
                    <strong>主控制器（智平衡儀）</strong>
                    <p class="careMemberModal__muted">型號 MC-200｜序號 SN-882910</p>
                  </div>
                  <span class="careMemberModal__tagOk">使用中</span>
                </div>
                <div class="careMemberModal__progress">
                  <span>使用壽命進度</span>
                  <div class="careMemberModal__bar"><i style="width: 48%" /></div>
                  <span class="careMemberModal__muted">177 / 365 天（48%）</span>
                </div>
              </div>
              <div class="careMemberModal__deviceCard">
                <div class="careMemberModal__deviceTop">
                  <div>
                    <strong>第六代紅光理療衣</strong>
                    <p class="careMemberModal__muted">型號 RL-6｜序號 SN-441022</p>
                  </div>
                  <span class="careMemberModal__tagOk">使用中</span>
                </div>
                <div class="careMemberModal__progress">
                  <span>耐用參考進度（建議 180 天）</span>
                  <div class="careMemberModal__bar"><i style="width: 29%" /></div>
                  <span class="careMemberModal__muted">53 / 180 天（29%）</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <footer class="careMemberModal__footer">
          <button type="button" class="careMemberModal__closeMain" @click="handleClose">
            ✕ 關閉
          </button>
        </footer>
      </div>

      <!-- 儀器操作事件（子彈窗） -->
      <transition name="care-member-fade">
        <div
          v-if="instrumentSubOpen"
          class="careMemberModal careMemberModal--nested"
          @click.self="instrumentSubOpen = false"
        >
          <div class="careMemberModal__subPanel" @click.stop>
            <header class="careMemberModal__subHead">
              <strong>儀器操作事件</strong>
              <button
                type="button"
                class="careMemberModal__iconClose"
                aria-label="關閉"
                @click="instrumentSubOpen = false"
              >
                ✕
              </button>
            </header>
            <section class="careMemberModal__subSection">
              <h4>接頭不良 <small>本週 5 次</small></h4>
              <ul class="careMemberModal__subList">
                <li>
                  <time>2026/05/02 09:20</time>
                  <span class="careMemberModal__pill careMemberModal__pill--danger">C 接頭</span>
                  <span>接頭接觸不良（第 5 次）</span>
                </li>
                <li>
                  <time>2026/05/01 21:05</time>
                  <span class="careMemberModal__pill careMemberModal__pill--danger">C 接頭</span>
                  <span>接頭接觸不良（第 4 次）</span>
                </li>
              </ul>
            </section>
            <section class="careMemberModal__subSection">
              <h4>治療紀錄不完整 <small>本週 2 次</small></h4>
              <ul class="careMemberModal__subList">
                <li>
                  <time>2026/04/30 18:40</time>
                  <span class="careMemberModal__pill careMemberModal__pill--warn">未完成</span>
                  <span>當日治療紀錄未上傳</span>
                </li>
              </ul>
            </section>
            <footer class="careMemberModal__subFooter">
              <button type="button" class="careMemberModal__btnGhost" @click="instrumentSubOpen = false">
                關閉
              </button>
            </footer>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

/** 與照護追蹤列表列資料對齊的最小欄位 */
export interface CareMemberModalMember {
  id: string;
  name: string;
  memberCode: string;
  riskLabel: string;
  status: string;
  latestEvent?: string;
  nextFollowUp?: string;
}

const props = defineProps<{
  show: boolean;
  member: CareMemberModalMember | null;
}>();

const emit = defineEmits<{
  close: [];
  care: [member: CareMemberModalMember];
}>();

const activeTab = ref<"history" | "basic">("history");
const instrumentSubOpen = ref(false);

watch(
  () => props.show,
  (open: boolean) => {
    if (!open) {
      instrumentSubOpen.value = false;
      activeTab.value = "history";
    }
  },
);

const levelTag = computed(() => {
  if (!props.member) return "";
  if (props.member.riskLabel.includes("高") || props.member.riskLabel.includes("12"))
    return "紅2A+";
  if (props.member.riskLabel.includes("7")) return "紅2A+平";
  return "標準追蹤";
});

const chartNo = computed(() => {
  const id = props.member?.id ?? "";
  const n = id.replace(/\D/g, "") || "331";
  return `033${n.padStart(4, "0").slice(-4)}`;
});

const age = computed(() => 55);
const gender = computed(() => "男");
const city = computed(() => "台北");
const consultant = computed(() => "陳欣怡");
const contractStatus = computed(() => "第四代紅光合約中");
const contractEnd = computed(() => "2026/06/30");
const contractDaysLeft = computed(() => 57);
const lastVisit = computed(() => "2026/04/17 17:00");
const nextVisit = computed(() => props.member?.nextFollowUp ?? "2026/05/08 11:00");
const alertWeekRange = computed(() => "04/28—05/04");
const birthday = computed(() => "1968/05/12");
const phone = computed(() => "0912-345-678");
const branch = computed(() => "台北總院");
const specialNote = computed(
  () =>
    "電極貼附位置依衛教單調整；皮膚敏感處改以較低強度模式，並於回診時確認紅腫狀況。",
);

const historyRows = computed(() => [
  {
    light: "danger" as const,
    source: "LINE",
    title: "設備示警｜接頭不良",
    sub: `U3·S3｜提報：系統｜協作：${consultant.value}`,
    time: "2026/05/08 10:12",
    status: "tracking" as const,
    alert: "連續多次接頭接觸不良，已列為本週自動示警項目。",
    alertTone: "danger" as const,
    note: "諮詢師：已電聯說明重插步驟，約定 48 小時內回覆使用狀況。",
  },
  {
    light: "warning" as const,
    source: "照會",
    title: "穿戴數據中斷",
    sub: "心率、血氧 3 天未上傳",
    time: "2026/05/06 15:40",
    status: "tracking" as const,
    alert: "健康數據事件：建議建立聯繫任務。",
    alertTone: "warning" as const,
    note: "",
  },
  {
    light: "normal" as const,
    source: "看診摘要",
    title: "回診穩定",
    sub: "醫師摘要已歸檔",
    time: "2026/04/17 17:00",
    status: "closed" as const,
    alert: "",
    alertTone: "danger" as const,
    note: "醫師：用藥與紅光療程並行，囑咐定期回診。",
  },
]);

function handleClose() {
  emit("close");
}

function emitCare() {
  if (props.member) emit("care", props.member);
}
</script>

<style scoped lang="scss">
$teal: #1ba39b;
$red: #ff4d4f;
$orange: #faad14;
$text: #2d3047;
$muted: #8c8c8c;

.care-member-fade-enter-active,
.care-member-fade-leave-active {
  transition: opacity 0.2s ease;
}
.care-member-fade-enter-from,
.care-member-fade-leave-to {
  opacity: 0;
}

.careMemberModal {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(17, 24, 39, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;

  &--nested {
    z-index: 1200;
    background: rgba(17, 24, 39, 0.35);
    padding: 1.5rem;
  }
}

.careMemberModal__panel {
  width: 100%;
  max-width: 1040px;
  max-height: min(92vh, 900px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.18);
  border: 1px solid #e8edf5;
}

.careMemberModal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem 0.5rem;
  gap: 1rem;
}

.careMemberModal__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: $text;
}

.careMemberModal__careBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: none;
  border-radius: 999px;
  padding: 0.45rem 1rem;
  background: $teal;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.875rem;
  &:hover {
    filter: brightness(1.05);
  }
}

.careMemberModal__careIcon {
  font-weight: 400;
  font-size: 1rem;
  line-height: 1;
}

.careMemberModal__profile {
  padding: 0 1.25rem 0.75rem;
}

.careMemberModal__nameRow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.careMemberModal__name {
  font-size: 1.35rem;
  color: $text;
}

.careMemberModal__levelTag {
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.careMemberModal__meta {
  margin: 0.35rem 0 0;
  font-size: 0.8125rem;
  color: $muted;
}

.careMemberModal__statGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0 1.25rem 1rem;
}

.careMemberModal__statCell {
  border: 1px solid #e8edf5;
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: #fafbfd;
}

.careMemberModal__statLabel {
  font-size: 0.7rem;
  color: $muted;
  font-weight: 600;
}

.careMemberModal__statValue {
  font-size: 0.82rem;
  font-weight: 700;
  color: $text;
  line-height: 1.35;
  &--info {
    color: #1677ff;
  }
  &--danger {
    color: $red;
  }
  &--accent {
    color: $teal;
  }
}

.careMemberModal__alertBar {
  margin: 0 1.25rem 1rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  background: #fff1f0;
  border: 1px solid #ffccc7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.careMemberModal__alertMain {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 0.8125rem;
  color: #a8071a;
  line-height: 1.45;
  flex: 1;
  min-width: 200px;
}

.careMemberModal__alertIcon {
  flex-shrink: 0;
}

.careMemberModal__alertActions {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.careMemberModal__btnOutline {
  border: 1px solid $teal;
  background: #fff;
  color: $teal;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    background: rgba(27, 163, 155, 0.08);
  }
}

.careMemberModal__btnGhost {
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #595959;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  cursor: pointer;
  &:hover {
    border-color: #bfbfbf;
  }
}

.careMemberModal__btnSm {
  padding: 0.25rem 0.65rem;
  font-size: 0.7rem;
}

.careMemberModal__btnMini {
  border: none;
  background: transparent;
  color: $teal;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.careMemberModal__eventCards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
  padding: 0 1.25rem 1rem;
}

.careMemberModal__eventCard {
  text-align: left;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  padding: 0.75rem;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  font: inherit;
  color: inherit;
  &:hover {
    border-color: rgba(27, 163, 155, 0.45);
    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
  }
}

.careMemberModal__eventCardTop {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.careMemberModal__eventTitle {
  font-size: 0.875rem;
  font-weight: 700;
  color: $text;
}

.careMemberModal__signal {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  &--red {
    background: $red;
    box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.2);
  }
  &--yellow {
    background: $orange;
    box-shadow: 0 0 0 3px rgba(250, 173, 20, 0.2);
  }
}

.careMemberModal__eventList {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.78rem;
  color: #5f6b7c;
  line-height: 1.5;
}

.careMemberModal__eventLink {
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.72rem;
  color: $teal;
  font-weight: 700;
}

.careMemberModal__tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0 1.25rem;
  border-bottom: 1px solid #eef1f6;
  button {
    position: relative;
    border: none;
    background: transparent;
    padding: 0.65rem 0.5rem 0.85rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: $muted;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    &.active {
      color: $teal;
      &::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 3px;
        border-radius: 3px 3px 0 0;
        background: $teal;
      }
    }
  }
}

.careMemberModal__tabBadge {
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 0.25rem;
  border-radius: 999px;
  background: $red;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.careMemberModal__tabBody {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0.85rem 1.25rem 1rem;
}

.careMemberModal__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.careMemberModal__select {
  height: 34px;
  border-radius: 8px;
  border: 1px solid #dbe3f0;
  padding: 0 0.5rem;
  font-size: 0.8rem;
  color: $text;
  background: #fff;
}

.careMemberModal__dateRange {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: $muted;
  flex-wrap: wrap;
}

.careMemberModal__dateInput {
  height: 34px;
  border: 1px solid #dbe3f0;
  border-radius: 8px;
  padding: 0 0.35rem;
  font-size: 0.75rem;
}

.careMemberModal__historyHead {
  display: grid;
  grid-template-columns: 48px 72px 1fr 120px 88px;
  gap: 0.35rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: $muted;
  padding: 0.35rem 0.5rem;
  background: #f6f8fc;
  border-radius: 8px;
}

.careMemberModal__historyList {
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.careMemberModal__historyRow {
  display: grid;
  grid-template-columns: 48px 72px 1fr 120px 88px;
  gap: 0.35rem;
  align-items: start;
  padding: 0.65rem 0.5rem;
  border: 1px solid #edf1f6;
  border-radius: 10px;
  font-size: 0.8rem;
}

.careMemberModal__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 0.35rem;
  justify-self: center;
  &--danger {
    background: $red;
  }
  &--warning {
    background: $orange;
  }
  &--normal {
    background: #52c41a;
  }
}

.careMemberModal__srcTag {
  align-self: start;
  margin-top: 0.2rem;
  font-size: 0.65rem;
  font-weight: 700;
  color: #5f6b7c;
  background: #f0f2f5;
  border-radius: 6px;
  padding: 0.15rem 0.35rem;
  text-align: center;
}

.careMemberModal__historyMain {
  min-width: 0;
  strong {
    display: block;
    color: $text;
    font-size: 0.85rem;
  }
}

.careMemberModal__historySub {
  margin: 0.2rem 0 0;
  font-size: 0.72rem;
  color: $muted;
  line-height: 1.4;
}

.careMemberModal__inlineAlert {
  margin-top: 0.45rem;
  padding: 0.45rem 0.55rem;
  border-radius: 8px;
  font-size: 0.72rem;
  line-height: 1.45;
  &--danger {
    background: #fff1f0;
    color: #a8071a;
    border: 1px solid #ffccc7;
  }
  &--warning {
    background: #fffbe6;
    color: #ad6800;
    border: 1px solid #ffe58f;
  }
}

.careMemberModal__historyNote {
  margin: 0.4rem 0 0;
  font-size: 0.72rem;
  color: #5c6c80;
}

.careMemberModal__historyTime {
  font-size: 0.72rem;
  color: $muted;
  white-space: nowrap;
}

.careMemberModal__historyStatus {
  display: flex;
  justify-content: flex-end;
}

.careMemberModal__statusPill {
  border: none;
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: default;
  &--track {
    background: rgba(27, 163, 155, 0.12);
    color: $teal;
  }
  &--done {
    background: rgba(82, 196, 26, 0.12);
    color: #389e0d;
  }
}

.careMemberModal__basicBody {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr);
  gap: 0.75rem;
  align-items: start;
}

.careMemberModal__basicCol--wide {
  min-width: 0;
}

.careMemberModal__cardBlock {
  border: 1px solid #e8edf5;
  border-radius: 12px;
  padding: 0.75rem;
  background: #fafbfd;
  & + & {
    margin-top: 0.75rem;
  }
}

.careMemberModal__cardHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 700;
  font-size: 0.875rem;
  color: $text;
  &--split {
    flex-wrap: wrap;
    gap: 0.35rem;
  }
}

.careMemberModal__kv {
  margin: 0;
  display: grid;
  gap: 0.45rem;
  font-size: 0.8rem;
  > div {
    display: grid;
    grid-template-columns: 88px 1fr;
    gap: 0.35rem;
    align-items: start;
  }
  dt {
    margin: 0;
    color: $muted;
    font-weight: 600;
  }
  dd {
    margin: 0;
    color: $text;
  }
}

.careMemberModal__vip {
  display: inline-block;
  padding: 0.1rem 0.45rem;
  border-radius: 6px;
  background: rgba(27, 163, 155, 0.15);
  color: $teal;
  font-weight: 800;
  font-size: 0.75rem;
}

.careMemberModal__ok {
  color: #389e0d;
  font-weight: 700;
}

.careMemberModal__noteBox {
  line-height: 1.45;
  color: #5c6c80;
}

.careMemberModal__deviceCard {
  border: 1px solid #e8edf5;
  border-radius: 10px;
  padding: 0.65rem;
  background: #fff;
  & + & {
    margin-top: 0.5rem;
  }
}

.careMemberModal__deviceTop {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: flex-start;
  strong {
    font-size: 0.85rem;
    color: $text;
  }
}

.careMemberModal__muted {
  margin: 0.15rem 0 0;
  font-size: 0.72rem;
  color: $muted;
}

.careMemberModal__tagOk {
  flex-shrink: 0;
  font-size: 0.65rem;
  font-weight: 800;
  color: #389e0d;
  background: rgba(82, 196, 26, 0.12);
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
}

.careMemberModal__progress {
  margin-top: 0.5rem;
  display: grid;
  gap: 0.25rem;
  font-size: 0.72rem;
  color: $muted;
}

.careMemberModal__bar {
  height: 6px;
  border-radius: 999px;
  background: #edf1f6;
  overflow: hidden;
  i {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, $teal, #5cdbd3);
  }
}

.careMemberModal__footer {
  padding: 0.75rem 1.25rem 1rem;
  border-top: 1px solid #eef1f6;
  display: flex;
  justify-content: flex-end;
}

.careMemberModal__closeMain {
  border: 2px solid $teal;
  background: #fff;
  color: $teal;
  border-radius: 999px;
  padding: 0.5rem 1.35rem;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.875rem;
  &:hover {
    background: rgba(27, 163, 155, 0.06);
  }
}

/* 子彈窗 */
.careMemberModal__subPanel {
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e8edf5;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
  max-height: 80vh;
  overflow: auto;
}

.careMemberModal__subHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #eef1f6;
  strong {
    font-size: 1rem;
    color: $text;
  }
}

.careMemberModal__iconClose {
  border: none;
  background: #f5f7fa;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  color: #5f6b7c;
  line-height: 1;
  &:hover {
    background: #e8edf5;
  }
}

.careMemberModal__subSection {
  padding: 0.75rem 1rem;
  h4 {
    margin: 0 0 0.5rem;
    font-size: 0.875rem;
    color: $text;
    small {
      font-weight: 600;
      color: $muted;
      margin-left: 0.35rem;
    }
  }
}

.careMemberModal__subList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  li {
    display: grid;
    grid-template-columns: 108px auto 1fr;
    gap: 0.4rem;
    align-items: center;
    font-size: 0.78rem;
    color: $text;
  }
  time {
    color: $muted;
    font-size: 0.72rem;
  }
}

.careMemberModal__pill {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  white-space: nowrap;
  &--danger {
    background: #fff1f0;
    color: $red;
  }
  &--warn {
    background: #fff7e6;
    color: #d48806;
  }
}

.careMemberModal__subFooter {
  padding: 0.65rem 1rem 0.85rem;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #eef1f6;
}

@media (max-width: 960px) {
  .careMemberModal__statGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .careMemberModal__eventCards {
    grid-template-columns: 1fr;
  }
  .careMemberModal__historyHead,
  .careMemberModal__historyRow {
    grid-template-columns: 40px 64px 1fr;
    grid-template-rows: auto auto;
  }
  .careMemberModal__historyHead span:nth-child(4),
  .careMemberModal__historyHead span:nth-child(5) {
    display: none;
  }
  .careMemberModal__historyTime,
  .careMemberModal__historyStatus {
    grid-column: 3;
  }
  .careMemberModal__historyStatus {
    justify-content: flex-start;
  }
  .careMemberModal__basicBody {
    grid-template-columns: 1fr;
  }
}
</style>
