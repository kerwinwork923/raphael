<template>
  <div>
    <form @submit.prevent="login">
      <div class="inputGroup">
        <label for="mobile">手機號碼 : </label>
        <input 
          type="text" 
          id="mobile" 
          v-model="mobile" 
          required 
          placeholder="請輸入手機號碼"
        />
      </div>

      <div class="password">
        <label for="password">密碼 : </label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          required 
          placeholder="請輸入密碼"
        />
      </div>

      <button type="submit" :disabled="isLoading">登入</button>

      <div v-if="error" class="error-message">
        登入失敗: {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const mobile = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref('');

const login = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    const response = await axios.post('http://23700999.com:8081/HMA/API_AA1.jsp', {
      Mobile: mobile.value,
      Password: password.value
    });
    console.log('登入成功:', response.data);
  } catch (err) {
    console.error('登入失敗:', err);
    error.value = '登入失敗，請檢查手機號碼和密碼。';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.inputGroup, .password {
  margin-bottom: 16px;
}

label {
  margin-right: 8px;
}

button {
  margin-top: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-top: 16px;
}
</style>
