<template>
    <div class="specialAssistanceWrap">
        <div class="specialAssistanceContent">
            <TitleMenu Text="專人協助" positionType="sticky" link="/robotDemo" />

            <!-- 標籤切換器 -->
            <div class="tab-container">
                <button
                    v-for="tab in tabs"
                    :key="tab.value"
                    class="tab-btn"
                    :class="{ active: activeTab === tab.value }"
                    @click="activeTab = tab.value"
                >
                    {{ tab.label }}
                </button>
            </div>

            <!-- 諮詢記錄列表 -->
            <div class="consultation-list" v-if="filteredConsultations.length > 0">
                <div class="timeline-container">
                    <div
                        class="consultation-card"
                        v-for="consultation in filteredConsultations"
                        :key="consultation.id"
                    >
                        <div class="card-header">
                            <div class="card-date">{{ formatDateTime(consultation.date) }}</div>
                            <div class="card-status" :class="consultation.status">
                                {{ getStatusText(consultation.status) }}
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="summary-title">您口述的摘要內容</div>
                            <div class="summary-text">{{ consultation.summary }}</div>
                        </div>
                        <button class="view-progress-btn" @click="viewProgress(consultation.id)">
                            <span>查看進度</span>
                            <div class="arrow-circle">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                >
                                    <path
                                        d="M7.5 15L12.5 10L7.5 5"
                                        stroke="white"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </div>
                        </button>
                    </div>
                    <!-- 時間軸線 -->
                    <div class="timeline-line" v-if="filteredConsultations.length > 1"></div>
                </div>
            </div>

            <!-- 空狀態 -->
            <div class="empty-state" v-else>
                <div class="empty-card">
                    <div class="empty-character">
                        <img
                            src="/assets/imgs/robotSad.png"
                            alt="空狀態角色"
                            class="character-img"
                        />
                    </div>
                    <div class="empty-message">目前沒有資料</div>
                </div>
            </div>

            <!-- 新增諮詢按鈕 -->
            <button class="add-consultation-btn" @click="addConsultation">
                新增諮詢
            </button>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed } from "vue";
    import TitleMenu from "~/components/TitleMenu.vue";

    const localData = localStorage.getItem("userData");
    const localobj = localData ? JSON.parse(localData) : null;

    // 標籤選項
    const tabs = [
        { label: "待處理", value: "pending" },
        { label: "處理中", value: "in_progress" },
        { label: "已完成", value: "completed" },
    ];

    // 當前選中的標籤
    const activeTab = ref("pending");

    // 模擬諮詢資料（之後可以從 API 獲取）
    const consultations = ref([
        {
            id: 1,
            date: "2025-12-25T11:00:00",
            status: "pending",
            summary: "肩頸老是卡卡的、有時候會偏頭痛, 晚上也睡不好。我還提到飲食跟運...",
        },
        {
            id: 2,
            date: "2025-12-20T11:00:00",
            status: "pending",
            summary: "肩頸老是卡卡的、有時候會偏頭痛, 晚上也睡不好。我還提到飲食跟運...",
        },
        {
            id: 3,
            date: "2025-12-15T14:30:00",
            status: "in_progress",
            summary: "最近工作壓力大，睡眠品質不佳，希望能夠改善...",
        },
        {
            id: 4,
            date: "2025-12-10T09:00:00",
            status: "completed",
            summary: "經過諮詢後，已經開始執行改善計畫，效果良好...",
        },
    ]);

    // 根據選中標籤過濾諮詢記錄
    const filteredConsultations = computed(() => {
        return consultations.value.filter(
            (consultation) => consultation.status === activeTab.value
        );
    });

    // 格式化日期時間
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    };

    // 獲取狀態文字
    const getStatusText = (status) => {
        const statusMap = {
            pending: "待處理",
            in_progress: "處理中",
            completed: "已完成",
        };
        return statusMap[status] || status;
    };

    // 查看進度
    const viewProgress = (id) => {
        console.log("查看進度:", id);
        // TODO: 導航到進度詳情頁面
    };

    // 新增諮詢
    const addConsultation = () => {
        console.log("新增諮詢");
        // TODO: 導航到新增諮詢頁面或開啟表單
    };
</script>

<style lang="scss" scoped>
.specialAssistanceWrap {
    min-height: 100vh;

    padding-bottom: 100px; // 為底部按鈕留出空間
    @include gradientBg();
}

.specialAssistanceContent {
    width: 100%;
    max-width: 100%;
    padding: 0 1rem;
}

// 標籤切換器
.tab-container {
    display: flex;
    gap: 0.5rem;
    margin: 1rem 0;
    padding: 0.25rem;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 12px;
}

.tab-btn {
    flex: 1;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    color: var(--Primary-default, #74BC1F);
font-size: var(--Text-font-size-18, 18px);
font-style: normal;
font-weight: 400;
line-height: 100%; /* 18px */
letter-spacing: 2.7px;
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
        border-radius: var(--Radius-r-50, 50px);
background: var(--Secondary-100, #F5F7FA);
box-shadow: 2px 4px 12px 0 var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.70)) inset;
    }

    &:hover:not(.active) {
        background: rgba(223, 236, 197, 0.3);
    }
}

// 諮詢記錄列表
.consultation-list {
    margin-top: 1.5rem;
}

.timeline-container {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

// 時間軸線
.timeline-line {
    position: absolute;
    right: 1rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: repeating-linear-gradient(
        to bottom,
        #b1c0d8 0,
        #b1c0d8 6px,
        transparent 6px,
        transparent 12px
    );
    z-index: 0;

    // 在每個卡片位置添加圓形節點
    &::before {
        content: "";
        position: absolute;
        right: -5px;
        top: 2rem;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #b1c0d8;
        border: 2px solid #ffffff;
    }

    &::after {
        content: "";
        position: absolute;
        right: -5px;
        bottom: 2rem;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #b1c0d8;
        border: 2px solid #ffffff;
    }
}

// 諮詢卡片
.consultation-card {
    position: relative;
    background: #ffffff;
    border-radius: 16px;
    padding: 1.25rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    z-index: 1;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.card-date {
    font-size: 1rem;
    font-weight: 600;
    color: #1e1e1e;
}

.card-status {
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;

    &.pending {
        color: #ec4f4f;
        background: #fff5f5;
    }

    &.in_progress {
        color: #feac4a;
        background: #fef1e2;
    }

    &.completed {
        color: #74bc1f;
        background: #dfecc5;
    }
}

.card-body {
    margin-bottom: 1rem;
}

.summary-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: #666;
    margin-bottom: 0.5rem;
}

.summary-text {
    font-size: 0.9375rem;
    color: #1e1e1e;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
}

// 查看進度按鈕
.view-progress-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: #dfecc5;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;

    span {
        font-size: 0.9375rem;
        font-weight: 500;
        color: #1e1e1e;
    }

    .arrow-circle {
        width: 32px;
        height: 32px;
        background: #74bc1f;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &:hover {
        background: #cfe5b0;
        transform: translateY(-1px);

        .arrow-circle {
            background: #65a31b;
        }
    }
}

// 空狀態
.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
    padding: 2rem 1rem;
    width: 100%;
}

.empty-card {
    width: 100%;
    max-width: 400px;
    background: #ffffff;
    border-radius: 20px;
    padding: 3rem 2rem;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-character {
    margin-bottom: 1.5rem;

    .character-img {
        width: 100%;
        max-width: 200px;
        height: auto;
        object-fit: contain;
    }
}

.empty-message {
    font-size: 1.125rem;
    font-weight: 500;
    color: #666;
}

// 新增諮詢按鈕
.add-consultation-btn {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 2rem);
    max-width: 500px;
    padding: 1rem 2rem;
    background: #74bc1f;
    color: #ffffff;
    border: none;
    border-radius: 16px;
    font-size: 1.125rem;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(116, 188, 31, 0.3);
    transition: all 0.3s ease;
    z-index: 10;

    &:hover {
        background: #65a31b;
        transform: translateX(-50%) translateY(-2px);
        box-shadow: 0 6px 16px rgba(116, 188, 31, 0.4);
    }

    &:active {
        transform: translateX(-50%) translateY(0);
    }
}
</style>