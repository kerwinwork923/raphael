<template>
  <!-- 共用 Alert ---------------------------------------------------- -->
  <BaseAlert :show="showAlert" :message="alertMsg" @close="showAlert = false" />

  <div class="loginPage">
    <div class="loginLeft">
      <!-- LOGO -------------------------------------------------------- -->
      <div class="logoGroup">
        <img src="/assets/imgs/backend/Subtract.svg" alt="" />
        <h1>Neuro-Plus+</h1>
      </div>

      <!-- ① 一般登入 -------------------------------------------------- -->
      <div class="loginForm" v-if="step === 'login'">
        <!-- 帳號 -->
        <div class="inputGroup">
          <input v-model="username" type="text" placeholder="請輸入帳號" />
          <img src="/assets/imgs/backend/user.svg" class="icon user-icon" />
        </div>
        <!-- 密碼 -->
        <div class="inputGroup">
          <input
            :type="passwordVisible ? 'text' : 'password'"
            v-model="password"
            placeholder="請輸入密碼"
          />
          <img
            src="/assets/imgs/backend/password-lock.svg"
            class="icon lock-icon"
          />
          <img
            class="icon eye-icon"
            :src="passwordVisible ? eyeOpen : eyeClosed"
            @click="passwordVisible = !passwordVisible"
          />
        </div>

        <div class="optionGroup">
          <label><input type="checkbox" v-model="rememberMe" /> 記住帳號</label>
          <a class="forgotLink" @click="step = 'reset'">忘記密碼？</a>
        </div>

        <button class="loginBtn" @click="login">登入</button>
      </div>

      <!-- ② 首次登入改密碼 ------------------------------------------- -->
      <div class="loginForm backendChangePassword" v-if="step === 'first'">
        <h3>首次登入請修改密碼</h3>

        <!-- 帳號 (disabled) -->
        <div class="inputGroup">
          <input :value="username" disabled />
          <img src="/assets/imgs/backend/user.svg" class="icon user-icon" />
        </div>

        <!-- 舊 / 新 / 再次輸入新密碼 -->
        <div class="inputGroup">
          <input
            :type="eye.firstOld ? 'text' : 'password'"
            v-model="oldPwd"
            placeholder="舊密碼"
          />
          <img
            src="/assets/imgs/backend/password-lock.svg"
            class="icon lock-icon"
          />
          <img
            class="icon eye-icon"
            :src="eye.firstOld ? eyeOpen : eyeClosed"
            @click="toggleEye('firstOld')"
          />
        </div>

        <div class="inputGroup">
          <input
            :type="eye.firstNew ? 'text' : 'password'"
            v-model="newPwd"
            placeholder="新密碼"
          />
          <img
            src="/assets/imgs/backend/password-lock.svg"
            class="icon lock-icon"
          />
          <img
            class="icon eye-icon"
            :src="eye.firstNew ? eyeOpen : eyeClosed"
            @click="toggleEye('firstNew')"
          />
        </div>

        <div class="inputGroup">
          <input
            :type="eye.firstNew2 ? 'text' : 'password'"
            v-model="newPwd2"
            placeholder="再次輸入新密碼"
          />
          <img
            src="/assets/imgs/backend/password-lock.svg"
            class="icon lock-icon"
          />
          <img
            class="icon eye-icon"
            :src="eye.firstNew2 ? eyeOpen : eyeClosed"
            @click="toggleEye('firstNew2')"
          />
        </div>

        <button class="loginBtn" @click="firstChange">
          送出後請使用新密碼登入
        </button>
      </div>

      <!-- ③ 重設密碼 -------------------------------------------------- -->
      <div class="loginForm backendChangePassword" v-if="step === 'reset'">
        <h3>重設密碼</h3>

        <div class="inputGroup">
          <input v-model="resetAcc" placeholder="請輸入帳號" />
          <img src="/assets/imgs/backend/user.svg" class="icon user-icon" />
        </div>
        <!-- 
        <div class="inputGroup">
          <input
            :type="eye.resetOld ? 'text' : 'password'"
            v-model="resetOld"
            placeholder="舊密碼"
          />
          <img
            src="/assets/imgs/backend/password-lock.svg"
            class="icon lock-icon"
          />
          <img
            class="icon eye-icon"
            :src="eye.resetOld ? eyeOpen : eyeClosed"
            @click="toggleEye('resetOld')"
          />
        </div> -->

        <div class="inputGroup">
          <input
            :type="eye.resetNew ? 'text' : 'password'"
            v-model="resetNew"
            placeholder="新密碼"
          />
          <img
            src="/assets/imgs/backend/password-lock.svg"
            class="icon lock-icon"
          />
          <img
            class="icon eye-icon"
            :src="eye.resetNew ? eyeOpen : eyeClosed"
            @click="toggleEye('resetNew')"
          />
        </div>

        <div class="inputGroup">
          <input
            :type="eye.resetNew2 ? 'text' : 'password'"
            v-model="resetNew2"
            placeholder="再次輸入新密碼"
          />
          <img
            src="/assets/imgs/backend/password-lock.svg"
            class="icon lock-icon"
          />
          <img
            class="icon eye-icon"
            :src="eye.resetNew2 ? eyeOpen : eyeClosed"
            @click="toggleEye('resetNew2')"
          />
        </div>

        <button class="loginBtn" @click="resetPwd">
          送出後請使用新密碼登入
        </button>
      </div>

      <footer class="loginFooter">
        © 2024 智平衡健康事業股份有限公司 all rights reserved.
      </footer>
    </div>

    <!-- 右側形象圖 -->
    <div class="loginRight">
      <img src="/assets/imgs/backend/people.png" alt="" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import BaseAlert from "@/components/raphaelBackend/BaseAlert.vue";
import eyeOpen from "@/assets/imgs/backend/eye.svg";
import eyeClosed from "@/assets/imgs/backend/eye-closed.svg";

/* ================= 基本 reactive =================== */
const router = useRouter();
const step = ref("login"); // login | first | reset

const username = ref(localStorage.getItem("rememberID") || "");
const password = ref("");
const rememberMe = ref(!!username.value);
const passwordVisible = ref(false);

const eye = ref({});
const toggleEye = (k) => (eye.value[k] = !eye.value[k]);

/* ================ Alert 共用 ======================== */
const showAlert = ref(false);
const alertMsg = ref("");
const fireAlert = (msg) => {
  alertMsg.value = msg;
  showAlert.value = true;
};

/* ================ 其他表單欄位 ====================== */
const oldPwd = ref(""); // 首次登入－舊密碼
const newPwd = ref("");
const newPwd2 = ref("");

const resetAcc = ref(""); // 重設密碼
const resetOld = ref("");
const resetNew = ref("");
const resetNew2 = ref("");

/* ================ 工具函式 ========================== */
const isEmpty = (...v) => v.some((s) => !s || !s.trim());
const tooShort = (v, n = 6) => v.length < n;

/* ================ 「記住帳號」欄位監聽 ============== */
watch(rememberMe, (val) => {
  if (val) localStorage.setItem("rememberID", username.value);
  else localStorage.removeItem("rememberID");
});
watch(username, (val) => {
  if (rememberMe.value) localStorage.setItem("rememberID", val);
});

/* ================ 登入 ============================= */
const login = async () => {
  if (isEmpty(username.value, password.value)) {
    fireAlert("請輸入帳號與密碼");
    return;
  }
  if (tooShort(password.value)) {
    fireAlert("密碼需至少 6 碼");
    return;
  }

  try {
    const res = await fetch(
      "https://23700999.com:8081/HMA/API_AdminLogin.jsp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AdminID: username.value,
          Password: password.value,
        }),
      }
    );
    const r = await res.json();

    if (r.Result === "OK") {
      /* -------- ✅ 把 Token 記住 -------- */
      if (rememberMe.value) {
        localStorage.setItem("backendToken", r.Token); // 永久記住
        localStorage.setItem("adminID", username.value);
        localStorage.setItem("rememberID", username.value);
      } else {
        sessionStorage.setItem("backendToken", r.Token);
        sessionStorage.setItem("adminID", username.value);
      }
      router.push("/raphaelBackend/member");
    } else if (r.Result === "First") {
      step.value = "first";
      oldPwd.value = password.value;
    } else {
      fireAlert("帳號或密碼錯誤喔~");
    }
  } catch {
    fireAlert("伺服器錯誤，請稍後再試");
  }
};

/* ================ 首次登入改密碼 ==================== */
const firstChange = async () => {
  if (isEmpty(oldPwd.value, newPwd.value, newPwd2.value)) {
    fireAlert("所有欄位皆為必填");
    return;
  }
  if (tooShort(newPwd.value)) {
    fireAlert("新密碼需至少 6 碼");
    return;
  }
  if (newPwd.value !== newPwd2.value) {
    fireAlert("兩次輸入的新密碼不一致");
    return;
  }

  try {
    const res = await fetch(
      "https://23700999.com:8081/HMA/API_FirstAdminLogin.jsp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AdminID: username.value,
          Password: oldPwd.value,
          NewPassword: newPwd.value,
        }),
      }
    );
    const r = await res.json();
    if (r.Result === "OK") {
      if (rememberMe.value) {
        localStorage.setItem("backendToken", r.Token);
        localStorage.setItem("rememberID", username.value);
        localStorage.setItem("adminID", username.value); // ✅ 儲存 AdminID
      } else {
        sessionStorage.setItem("backendToken", r.Token);
        sessionStorage.setItem("adminID", username.value); // ✅ 儲存 AdminID
      }
      router.push("/raphaelBackend/member");
    }
  } catch {
    fireAlert("伺服器錯誤");
  }
};

/* ================ 重設密碼 ========================== */
const resetPwd = async () => {
  if (isEmpty(resetAcc.value, resetNew.value, resetNew2.value)) {
    fireAlert("所有欄位皆為必填");
    return;
  }
  if (tooShort(resetNew.value)) {
    fireAlert("新密碼需至少 6 碼");
    return;
  }
  if (resetNew.value !== resetNew2.value) {
    fireAlert("兩次輸入的新密碼不一致");
    return;
  }

  try {
    const res = await fetch(
      "https://23700999.com:8081/HMA/API_AdminModifyPassword.jsp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AdminID: resetAcc.value,
          NewPassword: resetNew.value,
        }),
      }
    );
    const r = await res.json();
    if (r.Result === "OK") {
      fireAlert("重設成功，請使用新密碼登入");
      step.value = "login";
    } else {
      fireAlert("重設失敗：" + r.Result);
    }
  } catch {
    fireAlert("伺服器錯誤");
  }
};

onMounted(() => {
  const token =
    localStorage.getItem("backendToken") ||
    sessionStorage.getItem("backendToken");
  if (token) {
    router.push("/raphaelBackend/member");
  }
});
</script>

<style lang="scss" scoped>
.loginPage {
  display: flex;
  height: 100dvh;
  .logoGroup {
    img {
      @include respond-to(xl) {
        width: 50px;
      }
    }
  }
  h1 {
    color: #2d3047;
    text-align: center;
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.12px;
    margin-top: 0.25rem;
    @include respond-to(xl) {
      font-size: 1.5rem;
    }
  }
  .loginLeft {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    overflow: hidden; // ✅ 避免內容撐出
    z-index: 99;
    @include respond-to(lg) {
      border-radius: 50px 50px 0px 0px;
      background: rgba(255, 255, 255, 0.2);
      box-shadow: 0px -2px 20px 0px rgba(177, 192, 216, 0.25);
      backdrop-filter: blur(50px);
      height: auto;
      position: absolute;
      bottom: 0;
      padding: 1rem 0;
      width: 100%;
      min-height: 40%;
      gap: 1.25rem;
    }
    @include respond-to(phone-landscape) {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.25rem;
      padding: 0.5rem;
    }

    .logoGroup {
      text-align: center;
    }

    .loginForm {
      width: 100%;
      max-width: 361px;
      flex-shrink: 0; // ✅ 避免壓縮變形
      border-radius: 8px;
      border: 1px solid #b1c0d8;
      background: #fff;
      backdrop-filter: blur(4px);
      padding: 1rem;

      @include respond-to(sm) {
        max-width: 90%;
      }

      @include respond-to(phone-landscape) {
        padding: 0.75rem;
      }

      .inputGroup {
        position: relative;
        margin-top: 1rem;

        @include respond-to(phone-landscape) {
          margin-top: 6px;
        }

        input {
          width: 100%;
          padding: 12px 40px 12px 36px;
          font-size: 16px;
          border: 1px solid $primary-200;
          border-radius: 8px;
          transition: all 0.2s ease;
          &:focus,
          &:active {
            border: unset;
            box-shadow: 0px 2px 20px rgba(177, 192, 216, 0.5);
          }
          @include respond-to(phone-landscape) {
            padding: 8px 36px;
          }
        }

        .icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          @include respond-to(phone-landscape) {
            height: 20px;
          }
        }

        .user-icon {
          left: 10px;
        }

        .lock-icon {
          left: 10px;
        }

        .eye-icon {
          right: 10px;
          cursor: pointer;
        }
      }

      .optionGroup {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        margin-bottom: 1.5rem;
        align-items: center;
        margin-top: 0.75rem;
        .forgotLink {
          color: var(--Neutral-500, #666);
          cursor: pointer;
          font-size: 18px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 2.7px;
          transition: all .2s ease;
          &:hover{
            color: #1cb0a8;
          }
          @include respond-to(phone-landscape) {
            font-size: 1rem;
          }
        }

        label {
          color: var(--Neutral-500, #666);
          font-family: "Noto Sans";
          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 400;
          letter-spacing: 2.7px;
          display: flex;
          align-items: center;
          gap: 4px;
          @include respond-to(phone-landscape) {
            font-size: 1rem;
            gap: 2px;
          }
          cursor: pointer;
          input {
            width: 20px;
            height: 20px;
            border-radius: 0.5rem;

            border: 1px solid #b1c0d8;
            cursor: pointer;
          }
        }
      }

      .loginBtn {
        width: 100%;
        background-color: #1cb0a8;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        height: 40px;
        padding: 0.5rem 0.75rem;
        letter-spacing: 2.7px;
        transition: all 0.2s ease;
        &:hover {
          background-color: #00877F;
        }
      }
    }

    .inputHint {
      display: block;
      padding: 0;
      margin: 0;
      color: var(--Warning-default, #ec4f4f);
      font-size: 12px;
      letter-spacing: 0.048px;
      margin-top: 0.25rem;
      height: auto;
      line-height: normal;
    }

    .backendChangePassword {
      h3 {
        color: #2d3047;
        text-align: center;
        font-size: 24px;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.12px;
        margin-bottom: 1.5rem;
        @include respond-to(phone-landscape) {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }
      }
      .loginBtn {
        margin-top: 1.5rem;
        @include respond-to(phone-landscape) {
          margin-top: 0.75rem;
          height: auto;
          padding: 0.25rem 0.75rem;
        }
      }
    }

    .loginFooter {
      font-size: 12px;
      text-align: center;
      color: #999;
      margin: 0 1rem;
      @include respond-to(phone-landscape) {
        margin: 0;
        grid-column: 1/3;
      }
    }
  }

  .loginRight {
    flex: 1;
    background: #f0f7f9 url("/assets/imgs/backend/background.png") no-repeat
      center / cover;
    position: relative;
    display: grid;
    place-items: center;
    height: 100dvh;

    @include respond-to(lg) {
      place-items: baseline;
      justify-content: center;
    }

    img {
      min-height: 320px;
      max-height: 100%;
    }

    .slogan {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      color: #9dc0c8;
      font-size: 20px;
      margin-top: 2rem;
    }

    .branding {
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      color: #6b6d8b;

      small {
        font-size: 14px;
        font-style: italic;
        color: #9dbec6;
      }
    }
  }
}
</style>
