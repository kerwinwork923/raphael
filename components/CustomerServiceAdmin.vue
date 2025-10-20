<template>
  <div class="admin-panel">
    <div class="admin-header">
      <h2>客服管理面板</h2>
      <div class="status-indicator" :class="serviceStatus">
        {{ statusText }}
      </div>
    </div>

    <div class="admin-content">
      <!-- 客服狀態控制 -->
      <div class="status-control">
        <h3>客服狀態</h3>
        <div class="status-buttons">
          <button 
            class="status-btn" 
            :class="{ active: serviceStatus === 'available' }"
            @click="setStatus('available')"
          >
            在線
          </button>
          <button 
            class="status-btn" 
            :class="{ active: serviceStatus === 'busy' }"
            @click="setStatus('busy')"
          >
            忙碌
          </button>
          <button 
            class="status-btn" 
            :class="{ active: serviceStatus === 'offline' }"
            @click="setStatus('offline')"
          >
            離線
          </button>
        </div>
      </div>

      <!-- 處理完成按鈕 -->
      <div class="completion-control">
        <h3>服務完成</h3>
        <button 
          class="complete-btn" 
          @click="markAsCompleted"
          :disabled="!hasActiveConversation"
        >
          標記為處理完成
        </button>
        <p class="help-text">點擊後將向用戶顯示滿意度評分視窗</p>
      </div>

      <!-- 滿意度統計 -->
      <div class="satisfaction-stats" v-if="satisfactionRatings.length > 0">
        <h3>滿意度統計</h3>
        <div class="stats-grid">
          <div class="stat-item" v-for="(count, rating) in satisfactionStats" :key="rating">
            <div class="rating-display">
              <span class="stars">{{ '★'.repeat(rating) }}{{ '☆'.repeat(5 - rating) }}</span>
              <span class="rating-text">{{ getRatingText(rating) }}</span>
            </div>
            <div class="count">{{ count }} 次</div>
          </div>
        </div>
        <div class="average-rating">
          平均評分: {{ averageRating.toFixed(1) }} / 5.0
        </div>
      </div>

      <!-- 最近評分記錄 -->
      <div class="recent-ratings" v-if="recentRatings.length > 0">
        <h3>最近評分</h3>
        <div class="rating-list">
          <div 
            class="rating-item" 
            v-for="(rating, index) in recentRatings.slice(0, 5)" 
            :key="index"
          >
            <div class="rating-info">
              <span class="rating-stars">{{ '★'.repeat(rating.score) }}{{ '☆'.repeat(5 - rating.score) }}</span>
              <span class="rating-time">{{ formatTime(rating.timestamp) }}</span>
            </div>
            <div class="rating-comment" v-if="rating.comment">{{ rating.comment }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 響應式數據
const serviceStatus = ref('available')
const hasActiveConversation = ref(true)
const satisfactionRatings = ref([])

// 狀態文字對應
const statusTexts = {
  available: '在線',
  busy: '忙碌',
  offline: '離線'
}

// 計算屬性
const statusText = computed(() => statusTexts[serviceStatus.value])

const satisfactionStats = computed(() => {
  const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  satisfactionRatings.value.forEach(rating => {
    stats[rating.score]++
  })
  return stats
})

const averageRating = computed(() => {
  if (satisfactionRatings.value.length === 0) return 0
  const sum = satisfactionRatings.value.reduce((acc, rating) => acc + rating.score, 0)
  return sum / satisfactionRatings.value.length
})

const recentRatings = computed(() => {
  return [...satisfactionRatings.value]
    .sort((a, b) => b.timestamp - a.timestamp)
})

// 方法
const setStatus = (status) => {
  serviceStatus.value = status
  // 這裡可以發送到後端更新狀態
  console.log('客服狀態更新為:', status)
}

const markAsCompleted = () => {
  // 觸發用戶端的滿意度評分視窗
  // 這裡可以通過 WebSocket 或其他方式通知前端
  console.log('標記服務為完成，觸發滿意度評分')
  
  // 模擬發送事件到用戶端
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('service-completed'))
  }
}

const getRatingText = (rating) => {
  const texts = {
    1: '非常不滿意',
    2: '不太滿意', 
    3: '普通',
    4: '滿意',
    5: '非常滿意'
  }
  return texts[rating] || ''
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-TW')
}

// 監聽滿意度評分事件
const handleSatisfactionRating = (event) => {
  const rating = {
    score: event.detail.score,
    comment: event.detail.comment || '',
    timestamp: Date.now()
  }
  
  satisfactionRatings.value.push(rating)
  console.log('收到滿意度評分:', rating)
}

// 組件掛載
onMounted(() => {
  // 監聽滿意度評分事件
  if (typeof window !== 'undefined') {
    window.addEventListener('satisfaction-rated', handleSatisfactionRating)
  }
})

// 清理事件監聽器
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('satisfaction-rated', handleSatisfactionRating)
  }
})
</script>

<style lang="scss" scoped>
.admin-panel {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;

  h2 {
    margin: 0;
    color: #1e1e1e;
    font-size: 1.5rem;
  }
}

.status-indicator {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.875rem;

  &.available {
    background: #d4edda;
    color: #155724;
  }

  &.busy {
    background: #fff3cd;
    color: #856404;
  }

  &.offline {
    background: #f8d7da;
    color: #721c24;
  }
}

.admin-content {
  display: grid;
  gap: 2rem;
}

.status-control, .completion-control, .satisfaction-stats, .recent-ratings {
  h3 {
    margin: 0 0 1rem 0;
    color: #1e1e1e;
    font-size: 1.125rem;
  }
}

.status-buttons {
  display: flex;
  gap: 0.5rem;
}

.status-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    border-color: #74bc1f;
    color: #74bc1f;
  }

  &.active {
    background: #74bc1f;
    border-color: #74bc1f;
    color: white;
  }
}

.complete-btn {
  @include btnStyle($raphael-green-400, $raphael-white);
  margin-bottom: 0.5rem;

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
}

.help-text {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.stats-grid {
  display: grid;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  color: #ffc107;
  font-size: 1.125rem;
}

.rating-text {
  font-weight: 500;
  color: #1e1e1e;
}

.count {
  font-weight: bold;
  color: #74bc1f;
}

.average-rating {
  text-align: center;
  font-weight: bold;
  color: #1e1e1e;
  margin-top: 1rem;
  padding: 1rem;
  background: #f0f8f0;
  border-radius: 8px;
}

.rating-list {
  display: grid;
  gap: 0.75rem;
}

.rating-item {
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #74bc1f;
}

.rating-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.rating-stars {
  color: #ffc107;
  font-size: 1rem;
}

.rating-time {
  font-size: 0.875rem;
  color: #666;
}

.rating-comment {
  font-size: 0.875rem;
  color: #1e1e1e;
  font-style: italic;
}

@include respond-to(md) {
  .admin-panel {
    margin: 1rem;
    padding: 1rem;
  }

  .status-buttons {
    flex-direction: column;
  }

  .rating-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
