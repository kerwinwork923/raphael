<template>
  <div class="RWDCover" v-show="showCover" @click="toggleCollapse"></div>
  <aside class="sidebar" :class="[{ collapsed }, { open: showCover }]">
    <!-- ─────────── logo ─────────── -->
    <div class="logo" @click="goToHome">
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
        alt="收合側邊欄"
      />
    </div>

    <!-- ─────────── menu ─────────── -->
    <nav class="menu">
      <ul>

        <li 
          :class="{ 
            active: currentPage === 'member',
            'has-focus': focusedItem === 'member' 
          }" 
          @click="handleMenuClick({ key: 'member', path: '/raphaelBackend/member' })"
          @mouseenter="handleMouseEnter('member')"
          @mouseleave="handleMouseLeave"
          @focus="handleFocus('member')"
          @blur="handleBlur"
          tabindex="0"
          role="menuitem"
          aria-label="會員清單"
        >
          <img src="/assets/imgs/backend/member.svg" alt="會員清單" />
          <span v-show="!collapsed">會員清單</span>
        </li>

        <li 
          :class="{ 
            active: currentPage === 'customerSupportAdmin',
            'has-focus': focusedItem === 'customerSupportAdmin' 
          }" 
          @click="handleMenuClick({ key: 'customerSupportAdmin', path: '/raphaelBackend/customerSupportAdmin' })"
          @mouseenter="handleMouseEnter('customerSupportAdmin')"
          @mouseleave="handleMouseLeave"
          @focus="handleFocus('customerSupportAdmin')"
          @blur="handleBlur"
          tabindex="0"
          role="menuitem"
          aria-label="客服管理"
        >
          <img src="/assets/imgs/backend/customerSupportAdmin.svg" alt="客服管理" />
          <span v-show="!collapsed">客服管理</span>
        </li>

        <li 
          :class="{ 
            active: currentPage === 'videoManage',
            'has-focus': focusedItem === 'videoManage' 
          }" 
          @click="handleMenuClick({ key: 'videoManage', path: '/raphaelBackend/videoManage' })"
          @mouseenter="handleMouseEnter('videoManage')"
          @mouseleave="handleMouseLeave"
          @focus="handleFocus('videoManage')"
          @blur="handleBlur"
          tabindex="0"
          role="menuitem"
          aria-label="影音管理"
        >
          <img src="/assets/imgs/backend/videoManage.svg" alt="影音管理" />
          <span v-show="!collapsed">影音管理</span>
        </li>

        <!-- <li 
          :class="{ 
            active: currentPage === 'categoryManagement',
            'has-focus': focusedItem === 'categoryManagement' 
          }" 
          @click="handleMenuClick({ key: 'categoryManagement', path: '/raphaelBackend/categoryManagement' })"
          @mouseenter="handleMouseEnter('categoryManagement')"
          @mouseleave="handleMouseLeave"
          @focus="handleFocus('categoryManagement')"
          @blur="handleBlur"
          tabindex="0"
          role="menuitem"
          aria-label="分類管理"
        >
          <img src="/assets/imgs/backend/categoryManagement.svg" alt="分類管理" />
          <span v-show="!collapsed">分類管理</span>
        </li> -->

        <li 
          :class="{ 
            active: currentPage === 'order',
            'has-focus': focusedItem === 'order' 
          }" 
          @click="handleMenuClick({ key: 'order', path: '/raphaelBackend/order' })"
          @mouseenter="handleMouseEnter('order')"
          @mouseleave="handleMouseLeave"
          @focus="handleFocus('order')"
          @blur="handleBlur"
          tabindex="0"
          role="menuitem"
          aria-label="訂單管理"
        >
          <img src="/assets/imgs/backend/order.svg" alt="訂單管理" />
          <span v-show="!collapsed">訂單管理</span>
        </li>

        <li 
          :class="{ 
            active: currentPage === 'production',
            'has-focus': focusedItem === 'production' 
          }" 
          @click="handleMenuClick({ key: 'production', path: '/raphaelBackend/production' })"
          @mouseenter="handleMouseEnter('production')"
          @mouseleave="handleMouseLeave"
          @focus="handleFocus('production')"
          @blur="handleBlur"
          tabindex="0"
          role="menuitem"
          aria-label="生產管理"
        >
          <img src="/assets/imgs/backend/production.svg" alt="生產管理" />
          <span v-show="!collapsed">生產管理</span>
        </li>

        <!-- <li 
          :class="{ 
            active: currentPage === 'push',
            'has-focus': focusedItem === 'push' 
          }" 
          @click="handleMenuClick({ key: 'push', path: '/raphaelBackend/push' })"
          @mouseenter="handleMouseEnter('push')"
          @mouseleave="handleMouseLeave"
          @focus="handleFocus('push')"
          @blur="handleBlur"
          tabindex="0"
          role="menuitem"
          aria-label="推播設定"
        >
          <img src="/assets/imgs/backend/push.svg" alt="推播設定" />
          <span v-show="!collapsed">推播設定</span>
        </li> -->
        
        <!-- <li 
          :class="{ 
            active: currentPage === 'points',
            'has-focus': focusedItem === 'points' 
          }" 
          @click="handleMenuClick({ key: 'points', path: '/raphaelBackend/points' })"
          @mouseenter="handleMouseEnter('points')"
          @mouseleave="handleMouseLeave"
          @focus="handleFocus('points')"
          @blur="handleBlur"
          tabindex="0"
          role="menuitem"
          aria-label="積分管理"
        >
          <img src="/assets/imgs/backend/point.svg" alt="積分管理" />
          <span v-show="!collapsed">積分管理</span>
        </li> -->
        <!-- <li 
          :class="{ 
            active: currentPage === 'account',
            'has-focus': focusedItem === 'account' 
          }" 
          @click="handleMenuClick({ key: 'account', path: '/raphaelBackend/account' })"
          @mouseenter="handleMouseEnter('account')"
          @mouseleave="handleMouseLeave"
          @focus="handleFocus('account')"
          @blur="handleBlur"
          tabindex="0"
          role="menuitem"
          aria-label="帳號管理"
        >
          <img src="/assets/imgs/backend/account.svg" alt="帳號管理" />
          <span v-show="!collapsed">帳號管理</span>
        </li> -->
      </ul>
    </nav>

    <div class="sidebarHR" />

    <!-- ─────── user summary ＆ logout ─────── -->
    <div class="sidebar-user">
      <div class="avatar">
        <img v-show="!collapsed" src="/assets/imgs/backend/user.svg" alt="使用者頭像" />
        <div class="info" v-show="!collapsed">
          <p class="name">{{ userName || "管理員" }}</p>
          <p class="role">{{ roleName || "系統管理員" }}</p>
        </div>
      </div>

      <button 
        class="logout" 
        @click="handleLogout"
        @mouseenter="handleLogoutHover = true"
        @mouseleave="handleLogoutHover = false"
        :class="{ 'hover': handleLogoutHover }"
        tabindex="0"
        aria-label="登出系統"
      >
        <img src="/assets/imgs/backend/backendLogout.svg" alt="登出" />
        <span v-show="!collapsed">登出</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

// 路由相關
const router = useRouter();
const route = useRoute();

// props / emits
interface Props {
  modelValue?: string;
  currentPage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'member',
  currentPage: 'member'
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'page-change': [page: string];
  'logout': [];
}>();



// 當前頁面狀態
const currentPage = ref(props.currentPage);

// 焦點狀態管理
const focusedItem = ref<string | null>(null);
const handleLogoutHover = ref(false);

// 折疊狀態
const collapsed = ref(false);
const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
  // 儲存狀態到 localStorage
  localStorage.setItem('sidebarCollapsed', collapsed.value.toString());
};

// 使用者資訊
const userName = ref("");
const roleName = ref("");

// 裝置判斷 & 遮罩
const isMobile = ref(false);
const showCover = computed(() => isMobile.value && !collapsed.value);

// 監聽路由變化
watch(() => route.path, (newPath: string) => {
  if (newPath.includes('/member')) {
    currentPage.value = 'member';
    emit('update:modelValue', 'member');
    emit('page-change', 'member');
  } else if (newPath.includes('/order')) {
    currentPage.value = 'order';
    emit('update:modelValue', 'order');
    emit('page-change', 'order');
  } else if (newPath.includes('/production')) {
    currentPage.value = 'production';
    emit('update:modelValue', 'production');
    emit('page-change', 'production');
  } else if (newPath.includes('/push')) {
    currentPage.value = 'push';
    emit('update:modelValue', 'push');
    emit('page-change', 'push');
  } else if (newPath.includes('/points')) {
    currentPage.value = 'points';
    emit('update:modelValue', 'points');
    emit('page-change', 'points');
  } else if (newPath.includes('/account')) {
    currentPage.value = 'account';
    emit('update:modelValue', 'account');
    emit('page-change', 'account');
  }
  else if (newPath.includes('/videoManage')) {
    currentPage.value = 'videoManage';
    emit('update:modelValue', 'videoManage');
    emit('page-change', 'videoManage');
  } else if (newPath.includes('/categoryManagement')) {
    currentPage.value = 'categoryManagement';
    emit('update:modelValue', 'categoryManagement');
    emit('page-change', 'categoryManagement');
  }
}, { immediate: true });

// 監聽 props 變化
watch(() => props.currentPage, (newPage: string) => {
  if (newPage && newPage !== currentPage.value) {
    currentPage.value = newPage;
  }
});

// 菜單點擊處理
const handleMenuClick = (item: { key: string; path: string }) => {
  currentPage.value = item.key;
  emit('update:modelValue', item.key);
  emit('page-change', item.key);
  
  // 導航到對應頁面
  if (item.path && route.path !== item.path) {
    router.push(item.path);
  }
  
  // 手機版點擊後自動收合
  if (isMobile.value) {
    collapsed.value = true;
  }
};

// 焦點管理
const handleFocus = (key: string) => {
  focusedItem.value = key;
};

const handleBlur = () => {
  // 延遲清除焦點，避免點擊時閃爍
  setTimeout(() => {
    focusedItem.value = null;
  }, 100);
};

const handleMouseEnter = (key: string) => {
  if (!collapsed.value) {
    focusedItem.value = key;
  }
};

const handleMouseLeave = () => {
  focusedItem.value = null;
};

// 回到首頁
const goToHome = () => {
  router.push('/raphaelBackend');
};

// 畫面尺寸監聽
function handleResize() {
  isMobile.value = window.innerWidth <= 1024;
  if (isMobile.value) {
    collapsed.value = true; // 手機自動收合
  }
}

// 掛載與卸載監聽
onMounted(() => {
  // 從 localStorage 恢復折疊狀態
  const savedCollapsed = localStorage.getItem('sidebarCollapsed');
  if (savedCollapsed !== null) {
    collapsed.value = savedCollapsed === 'true';
  }

  userName.value = localStorage.getItem("adminID") || sessionStorage.getItem("adminID") || "";

  // 初始化裝置狀態
  isMobile.value = window.innerWidth <= 1024;
  if (isMobile.value) {
    collapsed.value = true; // 手機預設收合
  }

  window.addEventListener("resize", handleResize);
});

onUnmounted(() => window.removeEventListener("resize", handleResize));

// 登出
function handleLogout() {
  localStorage.removeItem("backendToken");
  sessionStorage.clear();
  emit('logout');
  window.location.href = "/raphaelBackend";
}
</script>

<style scoped lang="scss">
$chip-success: #1ba39b;
$border: #e5e9f2;
$primary-200: #1ba39b;
$red-500: #ec4f4f;

.RWDCover {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
  z-index: 98;
}

/* ─────────── 基本樣式 ─────────── */
.sidebar {
  height: 100vh;
  position: sticky;
  top: 0;
  width: 240px;
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  border-right: 1px solid $border;
  transition: width 0.25s ease; /* 平滑收合 */

  &.collapsed {
    width: 72px;

    /* 文字、icon 淡出 */
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

/* ====== 內容原有樣式 ====== */
.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
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
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  li {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 6px;
    margin-top: 1.5rem;
    color: #2d3047;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    outline: none;
    position: relative;
    
    @include respond-to("xl") {
      font-size: 1rem;
    }
    
    img {
      width: 20px;
      height: 20px;
      transition: filter 0.2s ease;
    }
    
    /* 焦點狀態 */
    &:focus-visible {
      outline: 2px solid $primary-200;
      outline-offset: 2px;
    }
    
    /* 懸停狀態 */
    &:hover {
      background: rgba($chip-success, 0.1);
      color: $chip-success;
      transform: translateX(4px);
    

    }
    
    /* 焦點狀態（非 active） */
    &.has-focus:not(.active) {
      background: rgba($chip-success, 0.05);
      color: $chip-success;
      
      img {
        filter: brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(130deg) brightness(118%) contrast(119%);
      }
    }
    
    /* 活動狀態 */
    &.active {
      background: $chip-success;
      color: #fff;
      font-weight: 600;
      transform: translateX(4px);
      box-shadow: 0 2px 8px rgba($chip-success, 0.3);
      
      img {
        filter: brightness(0) invert(1);
      }
      
      &::before {
        content: '';
        position: absolute;
        left: -16px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 20px;
        background: $chip-success;
        border-radius: 0 2px 2px 0;
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
      font-weight: 600;
    }
    
    .role {
      color: #ccc;
      font-size: 14px;
    }
  }
  
  .logout {
    margin-top: 12px;
    width: 100%;
    padding: 3px 8px;
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
    transition: all 0.2s ease;
    outline: none;
    
    img {
      width: 20px;
      transition: transform 0.2s ease;
    }
    
    &:hover,
    &.hover {
      background-color: $red-500;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba($red-500, 0.3);
      
      img {
        transform: scale(1.1);
      }
    }
    
    &:focus-visible {
      outline: 2px solid $red-500;
      outline-offset: 2px;
    }
  }
}

/* -------- 收合按鈕 -------- */
.sidebarHRWrap {
  position: relative;
  
  img {
    position: absolute;
    top: 0;
    right: -32px;
    transform: translateY(-50%);
    padding: 6px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    transition: all 0.25s ease;
    
    &:hover {
      box-shadow: 0px 0px 6px 0px $primary-200;
      transform: translateY(-50%) scale(1.1);
    }
    
    &:focus-visible {
      outline: 2px solid $primary-200;
      outline-offset: 2px;
    }
  }
  
  img.rotate {
    transform: translateY(-50%) rotate(180deg);
    
    @include respond-to("lg") {
      top: -34px;
      right: -64px;
    }
  }
}
</style>
