<template>
  <div class="memberTop">
    <div class="memberTopLeft">
      <img src="../assets/imgs/robot/mascotDefault.png" alt="" />
    </div>
    <div class="memberTopRight">
      <h3>{{ userDataObj?.Member.Name }} 您好</h3>
      <div class="memberTopPoint">
        目前積分 : {{ userDataObj?.NowAvaPoints }} 
        <img @click="handleRefresh" src="../assets/imgs/member/reload.svg" alt="">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Props
const props = defineProps({
  userDataObj: {
    type: Object,
    default: () => null
  }
});

// Emits
const emit = defineEmits(['refresh']);

// Methods
const handleRefresh = () => {
  emit('refresh');
};
</script>

<style lang="scss" scoped>
.memberTop {
  display: flex;
  align-items: center;
  gap: 8px;

  .memberTopLeft {
    width: 60px;
    img {
      width: 100%;
    }
  }
  
  .memberTopRight {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    
    h3 {
      color: $raphael-black;
      font-size: 24px;
    }
    
    .memberTopPoint {
      display: flex;
      align-items: center;
      gap: 4px;
      justify-content: space-between;
      @include neumorphismOuter($radius: 20px);
      color: $raphael-red-300;
      font-size: 18px;
      letter-spacing: 2.7px;
      font-weight: bold;
      
      img {
        cursor: pointer;
        width: 26px;
        height: 26px;
        border-radius: var(--Radius-r-50, 50px);
        background: var(--Secondary-100, #F5F7FA);
        box-shadow: 2px 4px 12px 0 var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.70));
        padding: 0.2rem;
      }
    }
  }
}
</style>
