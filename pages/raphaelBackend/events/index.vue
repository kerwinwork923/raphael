<template>
    <div class="eventEntry">
      <Sidebar />
  
      <main class="content">
        <header class="page-header">
          <div>
            <h2 class="title">活動報名管理</h2>
         
          </div>
        </header>
  
        <section class="toolbar">
          <div class="search-wrapper">
            <input
              v-model="searchKeyword"
              class="search"
              type="text"
              placeholder="搜尋活動名稱、地點、日期"
            />
            <img src="/assets/imgs/backend/search.svg" alt="" />
          </div>
        </section>
  
        <section class="event-grid">
          <article
            v-for="event in filteredEvents"
            :key="event.id"
            class="event-card"
          >
            <div class="event-top">
              <span class="event-type">{{ event.category }}</span>
              <span class="status-badge" :class="event.status">
                {{ statusText(event.status) }}
              </span>
            </div>
  
            <h3>{{ event.title }}</h3>
  
            <div class="event-info">
              <p>
                <span>日期</span>
                <strong>{{ event.displayDate }}</strong>
              </p>
  
              <p>
                <span>時間</span>
                <strong>{{ event.time }}</strong>
              </p>
  
              <p>
                <span>地點</span>
                <strong>{{ event.location }}</strong>
              </p>
            </div>
  
            <div class="event-footer">
              <div class="event-actions">
                <a
                  class="entry-action-btn url"
                  :href="`/vip/${event.eventType}.html`"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  報名網址
                </a>
  
                <button
                  class="entry-action-btn list"
                  type="button"
                  @click="goToRegister(event)"
                >
                  進入名單
                </button>
              </div>
            </div>
          </article>
        </section>
  
        <div v-if="filteredEvents.length === 0" class="no-data">
          尚無符合條件的活動
        </div>
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, ref } from "vue";
  import { useRouter } from "vue-router";
  import Sidebar from "@/components/raphaelBackend/Sidebar.vue";
  import { useSeo } from "~/composables/useSeo";
  
  useSeo({
    title: "活動報名入口",
    description: "拉菲爾健康講座活動報名管理入口",
    url: "https://neuroplus.com.tw",
  });
  
  type EventStatus = "active" | "closed" | "draft";
  
  interface SeminarEvent {
    id: string;
    title: string;
    category: string;
    eventType: string;
    eventDate: string;
    displayDate: string;
    time: string;
    location: string;
    status: EventStatus;
  }
  
  const router = useRouter();
  
  const searchKeyword = ref("");
  
  const events = ref<SeminarEvent[]>([
    {
      id: "20260514-vipl1",
      title: "明明很不舒服，為什麼檢查都說沒問題？",
      category: "健康講座",
      eventType: "vipl1",
      eventDate: "20260514",
      displayDate: "2026 / 05 / 14（四）",
      time: "13:30",
      location: "台北新光摩天大樓 30樓之1",
      status: "active",
    },
  ]);
  
  const filteredEvents = computed(() => {
    const keyword = searchKeyword.value.trim().toLowerCase();
  
    if (!keyword) return events.value;
  
    return events.value.filter((event) =>
      [
        event.title,
        event.category,
        event.eventType,
        event.eventDate,
        event.displayDate,
        event.time,
        event.location,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  });
  
  function statusText(status: EventStatus) {
    return {
      active: "進行中",
      closed: "已結束",
      draft: "草稿",
    }[status];
  }
  
  function goToRegister(event: SeminarEvent) {
    router.push({
      path: `/raphaelBackend/events/${event.eventType}`,
      query: {
        eventDate: event.eventDate,
        title: event.title,
      },
    });
  }
  </script>
  
  <style scoped lang="scss">
  .eventEntry {
    display: flex;
    min-height: 100vh;
    background: $primary-100;
    gap: 1%;
  
    .content {
      flex: 1;
      padding: 1rem;
      padding-left: 0;
      width: 100%;
      margin: 0 auto;
  
      @include respond-to("lg") {
        padding-left: 1rem;
      }
    }
  
    .page-header {
      margin-bottom: 1.5rem;
  
      .title {
        color: $primary-600;
        font-size: 36px;
        font-weight: 700;
        letter-spacing: 0.09px;
        margin: 0;
  
        @include respond-to("lg") {
          padding-left: 36px;
        }
  
        @include respond-to("md") {
          font-size: 24px;
        }
      }
  
  
    }
  
    .toolbar {
      display: flex;
      justify-content: flex-start;
      gap: 1rem;
      width: 100%;
      margin-bottom: 1.5rem;
  
      @include respond-to("md") {
        flex-wrap: wrap;
      }
  
      .search-wrapper {
        position: relative;
        width: min(420px, 100%);
  
        img {
          width: 19px;
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
        }
      }
  
      .search {
        padding: 8px 12px 8px 36px;
        border: none;
        width: 100%;
        border-radius: 50px;
        background: #fff;
        box-shadow: 0px 2px 20px rgba(177, 192, 216, 0.25);
        transition: all ease 0.2s;
  
        &:hover {
          box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
        }
      }
    }
  
    .event-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
  
      @include respond-to("lg") {
        grid-template-columns: repeat(2, 1fr);
      }
  
      @include respond-to("md") {
        grid-template-columns: 1fr;
      }
    }
  
    .event-card {
      background: #fff;
      border-radius: 24px;
      padding: 1.5rem;
      border: 1px solid rgba(177, 192, 216, 0.25);
      box-shadow: 0px 2px 20px rgba(177, 192, 216, 0.25);
      transition: all ease 0.2s;
  
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0px 8px 28px rgba(177, 192, 216, 0.35);
      }
  
      .event-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
  
      .event-type {
        color: $chip-success;
        font-weight: 700;
        font-size: 14px;
      }
  
      h3 {
        color: $primary-600;
        font-size: 22px;
        line-height: 1.45;
        margin: 0 0 1.25rem;
        font-weight: 700;
      }
  
      .status-badge {
        padding: 4px 10px;
        border-radius: 50px;
        font-size: 13px;
        font-weight: 700;
        white-space: nowrap;
  
        &.active {
          border: 1px solid $chip-success;
          background: rgba(27, 163, 155, 0.1);
          color: $chip-success;
        }
  
        &.closed {
          border: 1px solid #999;
          background: rgba(153, 153, 153, 0.1);
          color: #777;
        }
  
        &.draft {
          border: 1px solid #c8923c;
          background: rgba(200, 146, 60, 0.1);
          color: #a36d18;
        }
      }
  
      .event-info {
        display: grid;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
  
        p {
          display: grid;
          grid-template-columns: 72px 1fr;
          gap: 0.75rem;
          margin: 0;
        }
  
        span {
          color: $raphael-gray-500;
          font-weight: 700;
        }
  
        strong {
          color: #555;
          font-weight: 600;
        }
      }
  
      .event-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        border-top: 1px solid #eef1f5;
        padding-top: 1rem;
      }
  
      .event-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
  
        @include respond-to("md") {
          width: 100%;
        }
      }
  
      .entry-action-btn {
        min-width: 92px;
        height: 40px;
        padding: 0 16px;
        border: none;
        border-radius: 50px;
        font-size: 14px;
        font-weight: 700;
        line-height: 40px;
        text-align: center;
        cursor: pointer;
        text-decoration: none;
        white-space: nowrap;
        transition: all ease 0.2s;
  
        &:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
  
        &.url {
          background: rgba(200, 146, 60, 0.12);
          color: #a36d18;
        }
  
        &.list {
          background: $chip-success;
          color: #fff;
        }
  
        @include respond-to("md") {
          flex: 1;
        }
      }
    }
  
    .no-data {
      margin-top: 1.5rem;
      background: #fff;
      border-radius: 20px;
      padding: 3rem;
      text-align: center;
      color: $raphael-gray-500;
      box-shadow: 0px 2px 20px rgba(177, 192, 216, 0.25);
    }
  }
  </style>