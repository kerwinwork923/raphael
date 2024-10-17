import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCommon = defineStore('common', () => {
  // 全局 loading 状态
  const isLoading = ref(false);

  // 全局错误状态
  const error = ref(null);

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

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError,
  };
});
