<template>
    <div class="quesionBoxCover" @click="closeModal"></div>
  <div class="quesionBox">
    <div class="topImage">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="37"
        height="36"
        viewBox="0 0 37 36"
        fill="none"
      >
        <path
          d="M17.5366 3.18971C17.0695 3.35452 16.5563 3.69732 16.2931 4.02034C16.0234 4.35654 1.94349 28.7611 1.779 29.1962C1.60136 29.651 1.60794 30.6926 1.79216 31.187C2.08165 31.9649 2.77249 32.6307 3.54228 32.8681C3.96336 32.9999 4.12126 32.9999 18.4314 32.9999C32.7416 32.9999 32.8995 32.9999 33.3206 32.8681C34.6825 32.4462 35.5378 30.897 35.1825 29.506C35.097 29.1698 34.4983 28.0821 32.3008 24.2652C30.7743 21.6217 29.4453 19.3144 29.34 19.1496C29.044 18.6552 28.5702 18.5695 28.2281 18.932C27.8926 19.288 27.8465 19.1825 30.9322 24.5289C32.4981 27.2449 33.8272 29.6049 33.8732 29.7697C34.0969 30.4883 33.7087 31.2793 32.9916 31.5826C32.6429 31.7276 4.21995 31.7276 3.87124 31.5826C3.15409 31.2793 2.76591 30.4883 2.98961 29.7697C3.10804 29.3808 17.0695 5.14761 17.3392 4.86415C17.6485 4.52794 17.9709 4.38951 18.4314 4.38951C18.892 4.38951 19.2144 4.52794 19.5236 4.86415C19.6354 4.98281 21.0237 7.33624 22.6093 10.0918C24.4055 13.2231 25.57 15.1876 25.7148 15.3261C25.9188 15.5172 25.978 15.5436 26.1885 15.5041C26.5372 15.4513 26.8136 15.1217 26.7675 14.825C26.7412 14.6932 25.4516 12.3859 23.7476 9.4194C20.4842 3.74346 20.4776 3.73687 19.6552 3.32815C19.2407 3.13038 19.1354 3.10401 18.5367 3.08424C18.0235 3.07105 17.7932 3.09742 17.5366 3.18971Z"
          fill="#EC4F4F"
        />
        <path
          d="M17.7603 12.9265C17.0827 13.177 16.5431 13.7901 16.3984 14.4757C16.3392 14.7394 16.326 15.748 16.3392 18.1014L16.3589 21.3646L16.53 21.7338C16.8919 22.505 17.5827 22.9467 18.4314 22.9467C19.2802 22.9467 19.971 22.505 20.3329 21.7338L20.5039 21.3646L20.5237 18.1014C20.5368 15.748 20.5237 14.7394 20.4645 14.4757C20.3131 13.7769 19.7736 13.1704 19.0828 12.9265C18.7472 12.8078 18.0827 12.8078 17.7603 12.9265ZM18.7933 14.2515C19.2275 14.4559 19.2275 14.4361 19.2078 17.9959L19.1881 21.1998L18.9709 21.4107C18.7867 21.5953 18.7143 21.6283 18.4314 21.6283C18.1485 21.6283 18.0761 21.5953 17.8919 21.4107L17.6748 21.1998L17.6551 17.9959C17.6353 14.4493 17.6353 14.4625 18.0564 14.2515C18.3262 14.1197 18.5235 14.1197 18.7933 14.2515Z"
          fill="#EC4F4F"
        />
        <path
          d="M27.1096 16.9082C26.7017 17.3169 26.9715 17.9696 27.5505 17.9696C28.136 17.9696 28.4124 17.3103 27.9913 16.8884C27.7478 16.6379 27.3662 16.6511 27.1096 16.9082Z"
          fill="#EC4F4F"
        />
        <path
          d="M17.7932 24.6805C17.076 24.9376 16.6221 25.4188 16.4115 26.1374C16.1418 27.0866 16.6418 28.1414 17.5695 28.5765C17.8656 28.7149 18.0366 28.7479 18.4314 28.7479C19.2801 28.7479 19.971 28.3062 20.3328 27.5349C20.6881 26.7768 20.5105 25.7946 19.9118 25.1881C19.3722 24.6541 18.4709 24.4366 17.7932 24.6805ZM18.8788 26.0517C19.0893 26.1901 19.2407 26.5724 19.1946 26.8361C19.1683 26.9482 19.063 27.1328 18.9512 27.2383C18.7867 27.3965 18.6946 27.4294 18.4314 27.4294C18.1682 27.4294 18.0761 27.3965 17.9116 27.2383C17.6485 26.9812 17.5892 26.6845 17.7471 26.3615C17.9643 25.9198 18.4643 25.7814 18.8788 26.0517Z"
          fill="#EC4F4F"
        />
      </svg>
    </div>
    <h3>還有 <span>{{ unfilledItems.length }}份</span> 資料需要填寫</h3>
    <h5>每件客製化商品都需要獨立的個人化資料</h5>
    <div class="quesionBoxHR"></div>
    <div class="quesionProducts">
      <div 
        class="quesionProductItem" 
        v-for="item in unfilledItems" 
        :key="item.AID"
      >
        <div class="quesionProductItemInfo">
          <h4>{{ item.ProductName }}</h4>
          <p>資料待填寫</p>
        </div>
        <button @click="goToPersonalize(item)">填寫</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 接收 props
const props = defineProps({
  orderData: {
    type: Object,
    required: true
  }
})

// 計算需要填寫資料的商品
const unfilledItems = computed(() => {
  if (!props.orderData?.ItemList) return []
  
  return props.orderData.ItemList.filter(item => {
    // 檢查是否已填寫個人化資料
    return !item.PdtSize || !item.Weight || !item.BodySize || !item.Height
  })
})

// 跳轉到個人化資訊頁面
const goToPersonalize = (item) => {
  const params = {
    saleId: props.orderData.SID,
    productId: item.ProductID,
    aid: item.AID,
    csAid: props.orderData.CSAID // 加入 CSAID 參數
  }
  
  // 使用 query 參數傳遞資料
  router.push({
    path: '/personalizedInfo',
    query: params
  })
}

// 關閉模態框
const closeModal = () => {
  // 發送事件給父組件
  emit('close')
}

const emit = defineEmits(['close'])
</script>

<style lang="scss" scoped>
.quesionBoxCover {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(217, 217, 217, 0.50);
  backdrop-filter: blur(2.5px);
  z-index: 999;
}
.quesionBox {
  position: fixed;
  width: 90%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background-color: #fff;
  border-radius: 10px;
  padding: 12px;
  max-width: 576px;
  .topImage {
    width: 60px;
    height: 60px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 10px;
    border-radius: var(--Radius-r-50, 50px);
    background: var(--warning-300-opacity-10, rgba(236, 79, 79, 0.1));
    display: flex;
    justify-content: center;
    align-items: center;
  }
  h3 {
    color: var(--Neutral-black, #1e1e1e);
    font-size: var(--Text-font-size-20, 20px);
    font-style: normal;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.1px;
    span {
      color: var(--Primary-default, #74bc1f);
    }
    margin-top: 0.5rem;
  }
  h5 {
    color: var(--Neutral-500, #666);
    text-align: center;
    font-size: var(--Text-font-size-16, 16px);
    font-style: normal;
    font-weight: 400;
    margin-top: 0.35rem;
    letter-spacing: 0.08px;
    margin-bottom: 1rem;
  }
  .quesionBoxHR {
    width: 100%;
    height: 1px;
    background-color: #e0e0e0;
    margin: 10px 0;
  }
  .quesionProducts {
    .quesionProductItem {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 8px;
      background: var(--Neutral-100, #f6f6f6);
      padding: 10px;
      margin-top: 12px;
      .quesionProductItemInfo {
        h4 {
          color: var(--Neutral-black, #1e1e1e);
          font-size: var(--Text-font-size-16, 16px);
          font-style: normal;
          font-weight: 700;
          letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
        }
        p {
          color: var(--Neutral-500, #666);
          font-size: var(--Text-font-size-16, 16px);
          font-style: normal;
          font-weight: 400;
          letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
          margin-top: 0.35rem;
        }
      }
      button {
        color: #fff;
        border: none;
        padding: 8px 12px;
        border-radius: 8px;
        background: var(--Primary-default, #74bc1f);
        color: var(--Neutral-white, #fff);
        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.09px;
        cursor: pointer;
      }
    }
  }
}
</style>
