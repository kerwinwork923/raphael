<template>
  <div :class="['titleMenu', positionType]">
    <div @click="handleClick">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="24"
        viewBox="0 0 25 24"
        fill="none"
      >
        <path
          d="M16.313 19.497L9.00497 12L16.313 4.50299C16.4438 4.36905 16.5171 4.18923 16.5171 4.00199C16.5171 3.81475 16.4438 3.63494 16.313 3.50099C16.2494 3.43614 16.1736 3.38461 16.0899 3.34944C16.0062 3.31426 15.9163 3.29614 15.8255 3.29614C15.7347 3.29614 15.6448 3.31426 15.5611 3.34944C15.4774 3.38461 15.4015 3.43614 15.338 3.50099L7.56198 11.4765C7.42545 11.6166 7.34905 11.8044 7.34905 12C7.34905 12.1956 7.42545 12.3834 7.56198 12.5235L15.3365 20.499C15.4001 20.5643 15.4761 20.6162 15.5601 20.6517C15.6441 20.6871 15.7343 20.7054 15.8255 20.7054C15.9166 20.7054 16.0069 20.6871 16.0909 20.6517C16.1748 20.6162 16.2509 20.5643 16.3145 20.499C16.4453 20.365 16.5186 20.1852 16.5186 19.998C16.5186 19.8108 16.4453 19.6309 16.3145 19.497L16.313 19.497Z"
          fill="#666666"
        />
      </svg>
    </div>

    <h2>
      {{ Text }}
    </h2>
    <div class="titleImgGroup" v-if="showImg1 || showImg2">

      <img v-if="showImg1" :src="showImg1" @click="handleImg1Click" alt="">
      <img v-if="showImg2" :src="showImg2" @click="handleImg2Click" alt="">
    </div>
  </div>
</template>

<script>
export default {
  props: {
    Text: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    scrollToBottom: {
      type: Boolean, // 决定是否返回后滚动到底部
      default: false,
    },
    positionType: {
      type: String,
      default: 'sticky',
      validator: value => ['sticky', 'fixed', 'absolute'].includes(value),
    },
    showImg1: {
      type: String,
      default: '',
    },
    showImg2: {
      type: String,
      default: '',
    },  
  },
  methods: {
    handleClick() {
      if (this.link === "back") {
        // 檢查是否有歷史紀錄
        if (window.history.length > 1) {
          this.$router.back(); // 返回上一頁
        } else {
          this.$router.push("/user"); // 跳轉到默認頁
        }
      } else {
        this.$router.push(this.link); // 導航到指定頁面
      }
    },
    handleImg1Click() {
      this.$emit('handleImg1Click');
    },
    handleImg2Click() {
      this.$emit('handleImg2Click');
    },
  },
};
</script>

<style lang="scss">
.titleMenu {
  position: sticky;
  display: flex;
  align-items: center;
  justify-content: center;
  // background: $raphael-gray-100;
  width: 100%;
  padding: 0.75rem 0;

  top: 0;
  z-index: 6;

  & > div {
    position: absolute;
    left: 0;
    cursor: pointer;
  }
  h2 {
    font-size: 1.5rem;
    letter-spacing: 0.5px;
    color: #1e1e1e;
    letter-spacing: 1px;
  }
  &.sticky {
    position: sticky;
  }

  &.fixed {
    position: fixed;
  }

  &.absolute {
    position: absolute;
    width: 95%;
    left: 2.5%;
    right: 0;
    top: 0;
    z-index: 6;
    svg{
      transform: translateY(10%);
    }
  }
  .titleImgGroup{
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    
    gap: .75rem;
    z-index: -1;
 
  }
}
</style>
