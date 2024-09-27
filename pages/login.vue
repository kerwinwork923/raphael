<template>
  <div class="login">
    <RaphaelLoading v-if="loading" />
    <div class="loginGroup">
      <div class="raphaelIconImgGroup">
        <img class="raphaelIcon" src="../assets/imgs/raphael.svg" alt="" />
        <h1>{{ verificationTitle }}</h1>
      </div>
      <div class="loginWrap">
        <div class="loginBox">
          <div class="phoneGroup">
            <input
              type="text"
              v-model="mobile"
              placeholder="請輸入您的手機號碼"
            />
            <img class="icon1" src="../assets/imgs/phoneGreen.svg" alt="" />
          </div>
          <div class="passwordGroup">
            <input
              :type="passwordVisible ? 'text' : 'password'"
              v-model="password"
              placeholder="請輸入密碼"
              @input="validatePassword"
            />
            <img class="icon1" src="../assets/imgs/passwordGreen.svg" alt="" />
            <img
              class="icon2"
              :src="passwordVisible ? eyesOpenGreen : eyesCloseGreen"
              @click="togglePasswordVisibility"
              alt=""
            />
          </div>
        </div>
        <div class="privacyGroup">
          <input type="checkbox" v-model="isPrivacy" id="privacyInput" />
          <router-link to="#">
            <label >我已詳細閱讀隱私權政策</label>
          </router-link>
        
        </div>

        <div class="forgetPasswordGroup">
          <router-link to="#">忘記密碼?</router-link>
        </div>
        <button class="loginBtn" :disabled="!isPrivacy" @click="login">登入</button>

        <div class="bottomHintGroup">
          <router-link to="/register">
            <img class="icon" src="../assets/imgs/register.svg" alt="" />
            <h5>註冊會員</h5>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  background: url("../assets/imgs/gradient-bg.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  min-height: 100vh;
  padding-bottom: 2rem;
  width: 100%;

  .raphaelIconImgGroup {
    text-align: center;
    .raphaelIcon {
      width: 50px;
      height: 50px;
    }
  }

  h1 {
    font-family: "Noto Sans";
    font-size: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.5px;
    margin-top: 8px;
    text-align: center;
    color: $raphael-purple-200;
  }

  .loginGroup {
    padding-top: 100px;
    width: 90%;
    margin: 0 auto;
    max-width: 576px;
  }
  .loginWrap {
    .loginBox {
      background-color: #fff;
      border-radius: 12px;
      padding: 1rem;
      margin-top: 2.25rem;
    }
    .phoneGroup,
    .passwordGroup,
    .passwordAgainGroup {
      position: relative;
      margin-bottom: 1rem;
      .icon1 {
        position: absolute;
        top: 50%;
        left: 2px;
        transform: translateY(-50%);
      }
      .icon2 {
        position: absolute;
        top: 50%;
        right: 2px;
        transform: translateY(-50%);
        cursor: pointer;
      }
    }

    input[type="text"],
    input[type="password"] {
      outline: none;
      border: none;
      border-bottom: 1px solid $raphael-gray-400;
      font-size: 1.2rem;
      width: 100%;
      padding-left: 36px;
      padding-bottom: 16px;
      padding-top: 16px;
      &::placeholder {
        color: $raphael-gray-500;
        font-family: Inter;
        font-size: 1.2rem;
        font-weight: 400;
        color: $raphael-gray-400;
      }
    }
    .privacyGroup {
      display: flex;
      align-items: center;
      gap: 3px;
      margin-top: 1rem;
      
      input {
        appearance: none;
        width: 1.5rem;
        height: 1.5rem;
        border: 1px solid #b3b3b3;
        border-radius: 4px;
        cursor: pointer;
        position: relative;
        &:checked {
          background-color: $raphael-green-400;
          border: none;
        }

        &:checked::before {
          content: "✓";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -55%);
          color: #fff;
          font-size: 0.75rem;
          font-weight: bold;
          font-family: "Arial", sans-serif;
        }
      }

      a{
        text-decoration: none;
        color: #666;
        font-size: 1.25rem;
        letter-spacing: 0.09px;
        font-weight: 400;
        transform: translateY(10%);
       label{
        cursor: pointer;
       }
      }
    
    }
    .forgetPasswordGroup {
      text-align: center;
      margin-top: 1.25rem;
      a {
        color: #666;
        font-family: Roboto;
        font-size: 1rem;
        font-weight: 400;
        letter-spacing: 0.5px;
        text-decoration: none;
      }
    }
    .loginBtn {
      background-color: $raphael-green-400;
      color: #fff;
      padding: 12px;
      width: 100%;
      border-radius: 8px;
      border: none;
      font-size: 1rem;
      font-weight: 400;
      letter-spacing: 0.5px;
      transition: 0.25s ease;
      margin-top: 1.5rem;
      cursor: pointer;
      &:hover {
        background-color: $raphael-green-500;
      }
      &:disabled {
        background-color: $raphael-gray-400; 
        cursor: not-allowed; 
        opacity: 0.6;
      }
    }

    .bottomHintGroup {
      a {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4px;
        margin: 0 auto;
        width: 100%;
        margin-top: 120px;
        text-align: center;
        text-decoration: none;
        color: #666;
      }
    }
  }
}
</style>

<script>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import RaphaelLoading from "../components/RaphaelLoading";
import eyesCloseGreen from "../assets/imgs/eyesCloseGreen.svg";
import eyesOpenGreen from "../assets/imgs/eyesOpenGreen.svg";
export default {
  setup() {
    const verificationTitle = ref("會員登入");
    const loading = ref(false);
    const mobile = ref("");
    const password = ref("");
    const passwordVisible = ref(false);
    const router = useRouter();
    const isPrivacy = ref(false)
    const togglePasswordVisibility = () => {
      passwordVisible.value = !passwordVisible.value;
    };

    const login = async () => {
      loading.value = true;
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_AA1.jsp",
          {
            Mobile: mobile.value,
            Password: password.value,
          }
        );

        if (response.status === 200) {
          if (
            response.data.Token.trim() !== "" &&
            response.data.MAID.trim() !== ""
          ) {
            console.log("登入成功:", response.data);
            loading.value = false;
            if (response.data) {
              localStorage.setItem(
                "userData",
                JSON.stringify({
                  Token: response.data.Token,
                  MAID: response.data.MAID,
                  MID: response.data.MID,
                  A5Digit: response.data.A5Digit,
                  Mobile: response.data.Mobile,
                  startTime: response.data.startTime,
                })
              );
            }

            router.push({ name: "user" });
          } else {
            alert(`登入失敗 : ${response.data.Result}`);
            loading.value = false;
          }
        }
      } catch (err) {
        alert("登入失敗，請檢查手機號碼和密碼。");
      } finally {
        loading.value = false;
      }
    };

    return {
      verificationTitle,
      passwordVisible,
      togglePasswordVisibility,
      eyesCloseGreen,
      eyesOpenGreen,
      loading,
      mobile,
      password,
      login,
      isPrivacy
    };
  },
};
</script>
