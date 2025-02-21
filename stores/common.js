import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCommon = defineStore('common', () => {
  // 全局 loading 状态
  const isLoading = ref(false);

  // 全局错误状态
  const error = ref(null);
  const showDSPRSelect = ref(false);
  const showHRVAlert = ref(false);
  const showHRVForUseAlert = ref(false);
  const detectUID = ref("");
  const detectFlag = ref("")
  const detectForm  = ref("")

  const HRVAlertTitle = ref("HRV量測")
  // 设置 loading 状态
  const setLoading = (status) => {
    isLoading.value = status;
  };

  const startLoading = () => {
    setLoading(true);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  // 设置错误信息
  const setError = (err) => {
    error.value = err;
  };

  const closeHRVAlert = () => {
    alert(showHRVAlert.value)
    showHRVAlert.value = false;
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError,
    showDSPRSelect,
    showHRVAlert,
    closeHRVAlert,
    detectUID,
    detectFlag,
    detectForm,
    HRVAlertTitle,
    showHRVForUseAlert
  };
});
