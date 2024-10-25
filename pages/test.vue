<template>
  <div class="">
    <Alert
      :showRedirectButton="true"
      :redirectTarget="handleRedirect"
      @close="handleClose"
    >
      <span>自定義的內容</span>
      
    </Alert>
  </div>
</template>

<script>
import Alert from "../components/Alert.vue";
export default {
  components: {
    Alert,
  },
  methods: {
    handleClose() {
      console.log("關閉按鈕被點擊");
    },
    handleRedirect() {
      window.location.href = "https://example.com"; 
    },
  },
};
</script>
