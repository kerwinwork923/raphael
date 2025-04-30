<template>
    <aside class="sidebar">
      <!-- logo -------------------------------------------------------- -->
      <div class="logo">
        <img src="/assets/imgs/backend/Subtract.svg" alt="Neuro-Plus+" />
        <h1>Neuro-Plus+</h1>
      </div>
  
      <div class="sidebarHR" />
  
      <!-- navigation -------------------------------------------------- -->
      <nav class="menu">
        <ul>
          <li :class="{ active: modelValue === 'member' }" @click="set('member')">
            <img src="/assets/imgs/backend/member.svg" alt="會員清單" />
            <span>會員清單</span>
          </li>
          <li :class="{ active: modelValue === 'push' }" @click="set('push')">
            <img src="/assets/imgs/backend/push.svg" alt="推播設定" />
            <span>推播設定</span>
          </li>
          <li :class="{ active: modelValue === 'points' }" @click="set('points')">
            <img src="/assets/imgs/backend/point.svg" alt="積分管理" />
            <span>積分管理</span>
          </li>
          <li :class="{ active: modelValue === 'account' }" @click="set('account')">
            <img src="/assets/imgs/backend/account.svg" alt="帳號管理" />
            <span>帳號管理</span>
          </li>
        </ul>
      </nav>
  
      <div class="sidebarHR" />
  
      <!-- user summary & logout --------------------------------------- -->
      <div class="sidebar-user">
        <div class="avatar">
          <img src="/assets/imgs/backend/user.svg" alt="avatar" />
          <div class="info">
            <p class="name">Steven Yeh</p>
            <p class="role">數位專員</p>
          </div>
        </div>
  
        <button class="logout" @click="handleLogout">
          <img src="/assets/imgs/backend/backendLogout.svg" alt="登出" />
          登出
        </button>
      </div>
    </aside>
  </template>
  
  <script setup>
  // 不用 TypeScript，直接以 JS 寫法
  const props = defineProps({
    modelValue: {
      type: String,
      default: 'member',
    },
  });
  const emit = defineEmits(['update:modelValue', 'logout']);
  
  function set(key) {
    emit('update:modelValue', key);
  }

  function handleLogout() {
  // 清除 localStorage 的 backendToken
  localStorage.removeItem("backendToken");

  console.log("清除 localStorage backendToken 完成，登出");

  // 登出後跳轉頁面
  window.location.href = "/raphaelBackend";
}

  </script>
  
  <style scoped lang="scss">
  $primary: #1d7ffa;
  $chip-success: #1ba39b;
  $border: #e5e9f2;
  $gray-600: #8a94a6;
  
  .sidebar {
    width: 240px;
    background: #fff;
    display: flex;
    flex-direction: column;
    padding: 24px 16px;
    border-right: 1px solid $border;
  
    .logo {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6px;
      margin-bottom: 1rem;
  
      h1 {
        color: #2d3047;
        font-size: 24px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.12px;
      }
      img {
        width: 40px;
      }
    }
  
    .sidebarHR {
      width: 100%;
      height: 1px;
      background-color: #b1c0d8;
    }
  
    .menu {
      flex: 1;
      margin-top: 0.75rem;
  
      ul {
        padding: 0;
        margin: 0;
        list-style: none;
  
        li {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          margin-top: 3px;
          cursor: pointer;
          color: #2d3047;
          transition: background 0.2s;
  
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
    }
  
    .sidebar-user {
      margin-top: 0.5rem;
  
      .avatar {
        display: flex;
        align-items: center;
        gap: 4px;
  
        img {
          border-radius: 50%;
          background: #f5f7fa;
          padding: 2px;
        }
  
        .info {
          .name {
            color: #2d3047;
            font-size: 18px;
            line-height: 1.25;
          }
          .role {
            color: #ccc;
            font-size: 14px;
          }
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
        letter-spacing: 2.7px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4px;
        cursor: pointer;
  
        img {
          width: 20px;
        }
      }
    }
  }
  </style>