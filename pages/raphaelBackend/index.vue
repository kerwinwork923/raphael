<template>
  <div class="loginPageAlert" v-if="false">
    <div class="loginPageAlertBox">
      <h4>帳號或密碼錯誤喔~</h4>
      <div class="loginPageAlertClose">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="#B1C0D8"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  </div>
  <div class="loginPage">
    <div class="loginLeft">
      <div class="logoGroup">
        <img src="/assets/imgs/backend/Subtract.svg" alt="" />
        <h1>Neuro-Plus+</h1>
      </div>

      <div class="loginForm" v-if="false">
        <div class="inputGroup">
          <input v-model="username" type="text" placeholder="請輸入帳號" />
          <img src="/assets/imgs/backend/user.svg" class="icon user-icon" />
        </div>

        <div class="inputGroup">
          <input
            v-model="password"
            :type="passwordVisible ? 'text' : 'password'"
            placeholder="請輸入密碼"
          />
          <img
            class="icon lock-icon"
            src="/assets/imgs/backend/password-lock.svg"
          />
          <img
            class="icon eye-icon"
            @click="togglePassword"
            :src="passwordVisible ? eyeOpen : eyeClosed"
          />
        </div>

        <div class="optionGroup">
          <label>
            <input type="checkbox" v-model="rememberMe" />
            記住帳號
          </label>
          <a href="#" class="forgotLink">忘記密碼？</a>
        </div>

        <button class="loginBtn" @click="login">登入</button>
      </div>

      <div class="loginForm backendChangePassword">
        <h3>首次登入請修改密碼</h3>
        <div class="inputGroup">
          <input v-model="Cusername" type="text" placeholder="請輸入帳號" />
          <img src="/assets/imgs/backend/user.svg" class="icon user-icon" />
        </div>

        <div class="inputGroup">
          <input
            v-model="Cpassword"
            :type="passwordVisible ? 'text' : 'password'"
            placeholder="請輸入舊密碼"
          />
          <img
            class="icon lock-icon"
            src="/assets/imgs/backend/password-lock.svg"
          />
          <img
            class="icon eye-icon"
            @click="togglePassword"
            :src="passwordVisible ? eyeOpen : eyeClosed"
          />
        </div>

        <div class="inputGroup">
          <input
            v-model="Cpassword"
            :type="passwordVisible ? 'text' : 'password'"
            placeholder="請輸入新密碼"
          />
          <img
            class="icon lock-icon"
            src="/assets/imgs/backend/password-lock.svg"
          />
          <img
            class="icon eye-icon"
            @click="togglePassword"
            :src="passwordVisible ? eyeOpen : eyeClosed"
          />
        </div>
        <small class="inputHint">密碼長度不夠喔</small>

        <div class="inputGroup">
          <input
            v-model="Cpassword"
            :type="passwordVisible ? 'text' : 'password'"
            placeholder="請再次輸入新密碼"
          />
          <img
            class="icon lock-icon"
            src="/assets/imgs/backend/password-lock.svg"
          />
          <img
            class="icon eye-icon"
            @click="togglePassword"
            :src="passwordVisible ? eyeOpen : eyeClosed"
          />
        </div>
        <small class="inputHint">密碼長度不夠喔</small>
        <!-- <button class="loginBtn" @click="login">登入</button> -->
        <button class="loginBtn">送出後請使用新密碼登入</button>
      </div>

      <footer class="loginFooter">
        © 2024 智平衡健康事業股份有限公司<br />
        all rights reserved.
      </footer>
    </div>

    <div class="loginRight">
      <img src="/assets/imgs/backend/people.png" alt="" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

import eyeOpen from "@/assets/imgs/backend/eye.svg";
import eyeClosed from "@/assets/imgs/backend/eye-closed.svg";

const username = ref("");
const password = ref("");
const rememberMe = ref(false);
const passwordVisible = ref(false);

const togglePassword = () => {
  passwordVisible.value = !passwordVisible.value;
};

const login = () => {
  // 登入邏輯
  console.log("帳號：", username.value);
  console.log("密碼：", password.value);
  console.log("記住帳號：", rememberMe.value);
};
</script>

<style lang="scss" scoped>
.loginPageAlert {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  background: rgba(177, 192, 216, 0.25);
  z-index: 100;
  .loginPageAlertBox {
    position: absolute;
    top: 50%;
    left: 50%;
    min-width: 300px;
    transform: translate(-50%, -50%);
    border-radius: var(--Radius-r-20, 20px);
    border: 3px solid var(--Primary-default, #1ba39b);
    background: var(--neutral-white-opacity-30, rgba(255, 255, 255, 0.3));
    box-shadow: 0px 2px 20px 0px
      var(--primary-400-opacity-25, rgba(27, 163, 155, 0.25));
    backdrop-filter: blur(25px);
    padding: 1.25rem;
    h4 {
      padding: 2rem;
      background-color: #fff;
      color: var(--Primary-300, #6d8ab6);
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.5px;
      border-radius: 20px;
      text-align: center;
      line-height: 1.5;
    }
  }
  .loginPageAlertClose {
    text-align: center;
    margin-top: 1rem;
    svg {
      border-radius: var(--Radius-r-20, 20px);

      background: var(--neutral-white-opacity-30, rgba(255, 255, 255, 0.3));
      box-shadow: 0px 2px 20px 0px
        var(--primary-400-opacity-25, rgba(27, 163, 155, 0.25));
      backdrop-filter: blur(25px);
      width: 24px;
      height: 24px;
      padding: 0.2rem;
      cursor: pointer;
    }
  }
}
.loginPage {
  display: flex;
  height: 100vh;
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
      padding: 1rem 0 0.75rem;
      width: 100%;
      min-height: 40%;
    }
    .logoGroup {
      text-align: center;
      margin-bottom: 2rem;
      @include respond-to(xl) {
        margin-bottom: 0.75rem;
      }
    }

    .loginForm {
      max-width: 320px;
      flex-shrink: 0; // ✅ 避免壓縮變形

      border-radius: 8px;
      border: 1px solid #b1c0d8;
      background: #fff;
      backdrop-filter: blur(4px);
      padding: 1rem;
      @include respond-to(xl) {
        max-width: 90%;
      }

      .inputGroup {
        position: relative;
        margin-top: 1rem;

        input {
          width: 100%;
          padding: 12px 40px 12px 36px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 8px;
        }

        .icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
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
        .forgotLink {
          color: var(--Neutral-500, #666);

          font-size: 18px;
          font-style: normal;
          font-weight: 400;

          letter-spacing: 2.7px;
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
          cursor: pointer;
          input {
            width: 20px;
            height: 20px;
            border-radius: var(--Radius-r-8, 8px);

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
        padding: var(--Padding-p-9, 9px) var(--Padding-p-12, 12px);
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
      height: 3px;
    }

    .backendChangePassword {
      padding: 0.5rem 1rem 1rem;
      h3 {
        color: #2d3047;
        text-align: center;
        font-size: 24px;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.12px;
        margin-bottom: 1.25rem;
      }
      .loginBtn{
        margin-top: 1.25rem;
      }
    }

    .loginFooter {
      margin-top: 2rem;
      font-size: 12px;
      text-align: center;
      color: #999;
      @include respond-to(xl) {
        margin-top: 0.75rem;
      }
    }
  }

  .loginRight {
    flex: 1;
    background: #f0f7f9 url("/assets/imgs/backend/background.png") no-repeat
      center / cover;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100vh;
    @include respond-to(lg) {
      position: absolute;
      left: 0;
      top: 0;
      max-height: 100%;
      width: 100%;
    }
    img {
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
