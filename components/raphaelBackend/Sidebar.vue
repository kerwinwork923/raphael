<template>
  <div class="RWDCover" v-show="showCover" @click="toggleCollapse"></div>
  <aside class="sidebar" :class="[{ collapsed }, { open: showCover }]">
    <!-- ─────────── logo ─────────── -->
    <div class="logo">
      <img src="/assets/imgs/backend/Subtract.svg" alt="Neuro‑Plus+" />
      <h1 v-show="!collapsed">Neuro-Plus+</h1>
    </div>

    <!-- ─────────── 收合按鈕 ─────────── -->
    <div class="sidebarHRWrap">
      <div class="sidebarHR" />
      <img
        src="/assets/imgs/backend/slideIcon.svg"
        :class="{ rotate: collapsed }"
        @click="toggleCollapse"
      />
    </div>

    <!-- ─────────── menu ─────────── -->
    <nav class="menu">
      <ul>
        <li :class="{ active: modelValue === 'member' }" @click="set('member')">
          <img src="/assets/imgs/backend/member.svg" />
          <span v-show="!collapsed">會員清單</span>
        </li>
        <li :class="{ active: modelValue === 'push' }" @click="set('push')">
          <img src="/assets/imgs/backend/push.svg" />
          <span v-show="!collapsed">推播設定</span>
        </li>
        <li :class="{ active: modelValue === 'points' }" @click="set('points')">
          <img src="/assets/imgs/backend/point.svg" />
          <span v-show="!collapsed">積分管理</span>
        </li>
        <li
          :class="{ active: modelValue === 'account' }"
          @click="set('account')"
        >
          <img src="/assets/imgs/backend/account.svg" />
          <span v-show="!collapsed">帳號管理</span>
        </li>
      </ul>
    </nav>

    <div class="sidebarHR" />

    <!-- ─────── user summary ＆ logout ─────── -->
    <div class="sidebar-user">
      <div class="avatar">
        <img v-show="!collapsed" src="/assets/imgs/backend/user.svg" />
        <div class="info" v-show="!collapsed">
          <p class="name">{{ userName || "" }}</p>
          <p class="role">{{ roleName }}</p>
        </div>
      </div>

      <button class="logout" @click="handleLogout">
        <img src="/assets/imgs/backend/backendLogout.svg" />
        <span v-show="!collapsed">登出</span>
      </button>
    </div>
    
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

// props / emits
const props = defineProps({ modelValue: { type: String, default: "member" } });
const emit = defineEmits(["update:modelValue", "logout"]);
const set = (key) => emit("update:modelValue", key);

// 折疊狀態
const collapsed = ref(false);
const toggleCollapse = () => (collapsed.value = !collapsed.value);

// 使用者資訊
const userName = ref("");
const roleName = ref("");

// 裝置判斷 & 遮罩
const isMobile = ref(false);
const showCover = computed(() => isMobile.value && !collapsed.value);

// 畫面尺寸監聽
function handleResize() {
  isMobile.value = window.innerWidth <= 1024;


}

// 掛載與卸載監聽
onMounted(() => {
  userName.value =
    localStorage.getItem("adminID") ||
    sessionStorage.getItem("adminID") ||
    "";

  // 初始化裝置狀態
  isMobile.value = window.innerWidth <= 1024;
  collapsed.value = !isMobile.value ? false : false; // ✅ 手機預設展開

  window.addEventListener("resize", handleResize);
});

onUnmounted(() => window.removeEventListener("resize", handleResize));

// 登出
function handleLogout() {
  localStorage.removeItem("backendToken");
  sessionStorage.clear();
  window.location.href = "/raphaelBackend";
}
</script>

<style scoped lang="scss">
$chip-success: #1ba39b;
$border: #e5e9f2;
.RWDCover {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
  z-index: 98;
}
/* ─────────── 基本樣式 ─────────── */
.sidebar {
  width: 240px;
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  border-right: 1px solid $border;
  transition: width 0.25s ease; /* 平滑收合 */
  
  &.collapsed {
    width: 72px;

    /* 文字、icon 淡出（這段以前就有） */
    h1,
    .menu span,
    .sidebar-user .info,
    .logout span {
      opacity: 0;
      transform: scale(0.8);
      pointer-events: none;
    }
  }
  @include respond-to("xl") {
    width: 180px;
  }
  @include respond-to("lg") {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 99;

    /* 一律 240px；用 translateX 進出畫面 */
    width: 240px !important;
    transform: translateX(-100%);
    transition: transform 0.25s ease;

    &.open {
      /* showCover = true 時會加上 .open */
      transform: translateX(0);
    }
  }
}
/* 文字區塊淡入淡出 */
h1,
.menu span,
.sidebar-user .info,
.logout span {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.sidebar-user {
  margin-top: 0.5rem;
}

/* ====== 收合狀態 ====== */

/* -------- 內容原有樣式 (節錄重要部分) -------- */
.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-bottom: 1rem;
  img {
    width: 40px;
    @include respond-to("xl") {
      width: 34px;
    }
  }
  h1 {
    color: #2d3047;
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
    @include respond-to("xl") {
      font-size: 1.25rem;
    }
  }
}

.sidebarHR {
  width: 100%;
  height: 1px;
  background: #b1c0d8;
}

.menu {
  flex: 1;
  margin-top: 0.75rem;
  li {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 6px;
    margin-top: 3px;
    color: #2d3047;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
    @include respond-to("xl") {
      font-size: 1rem;
    }
    img {
      width: 20px;
      height: 20px;
    }
    &.active,
    &:hover {
      background: $chip-success;
      color: #fff;
      font-weight: 600;
      img {
        filter: brightness(0) invert(1);
      }
    }
  }
}

.sidebar-user {
  .avatar {
    display: flex;
    align-items: center;
    gap: 4px;
    img {
      border-radius: 50%;
      background: #f5f7fa;
      padding: 2px;
    }
    .name {
      color: #2d3047;
      font-size: 18px;
    }
    .role {
      color: #ccc;
      font-size: 14px;
    }
  }
  .logout {
    margin-top: 12px;
    width: 100%;
    padding: 9px 12px;
    background: #ec4f4f;
    border: none;
    border-radius: 6px;
    color: #f5f7fa;
    font-size: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    cursor: pointer;
    img {
      width: 20px;
    }
  }
}

/* -------- 收合按鈕 -------- */
.sidebarHRWrap {
  position: relative;
  img {
    position: absolute;
    top: 0;
    right: -15%;
    transform: translateY(-50%);
    padding: 6px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    transition: transform 0.25s ease;
  }
  img.rotate {
    transform: translateY(-50%) rotate(180deg);
  }
}
</style>
