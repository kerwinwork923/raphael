<template>
  <div class="register">
    <RaphaelLoading v-if="loading" />
    <!-- <Navbar/> -->
    <div class="registerGroup">
      <div class="raphaelIconImgGroup">
        <img class="raphaelIcon" src="../assets/imgs/raphael.svg" alt="" />
      </div>
      <h1>{{ verificationTitle }}</h1>

      <div class="registerWrap" v-if="currentStep === 'register'">
        <div class="registerBox">
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
          <div class="passwordHintText" v-if="passwordError">
            {{ passwordError }}
          </div>
          <div class="passwordAgainGroup">
            <input
              :type="passwordAgainVisible ? 'text' : 'password'"
              v-model="passwordAgain"
              placeholder="再次輸入您的密碼"
              @input="validatePasswordAgain"
            />
            <img class="icon1" src="../assets/imgs/passwordGreen.svg" alt="" />
            <img
              class="icon2"
              :src="passwordAgainVisible ? eyesOpenGreen : eyesCloseGreen"
              @click="togglePasswordAgainVisibility"
              alt=""
            />
          </div>
          <div class="passwordAgainHintText" v-if="passwordAgainError">
            {{ passwordAgainError }}
          </div>
        </div>
        <div class="privacyGroup">
          <input type="checkbox" v-model="isPrivacy" id="privacyInput" />
          <router-link to="/privacy">
            <label >我已詳細閱讀隱私權政策</label>
          </router-link>
        
        </div>

        <button class="vertificationBtn" :disabled="!isPrivacy" @click="getVerificationCode">
          取得驗證碼
        </button>

        <div class="bottomHintGroup">
          <router-link to=/login>
            <img class="icon" src="../assets/imgs/change.svg" alt="" />
            <h5>已有會員</h5>
          </router-link>
        
        </div>
      </div>

      <div class="verfifyWrap" v-if="currentStep === 'verify'">
        <div class="verificationCodeGroup">
          <input
            v-for="(code, index) in verificationCodes"
            :key="index"
            ref="verificationInput"
            type="number"
            maxlength="1"
            class="vertifyCode"
            v-model="verificationCodes[index]"
            @input="handleInput(index)"
            @keypress="allowOnlyNumbers"
            min="0"
            max="9"
        oninput="this.value = Math.max(0, Math.min(9, this.value))"
          />
        </div>
        <div class="verificationCodeHintText">
        <template v-if="typeof countdownTime === 'number'">
          驗證碼已傳送至您的裝置，請輸入驗證碼
          <br />
          ({{ countdownTime }}秒後失效)
        </template>
        <template v-else>
          {{ countdownTime }}
        </template>
      </div>

        <div class="reSendTextGroup">
          <button class="reSendText" :disabled="!isReSend" @click="reSend">重新發送</button>
        </div>
       
    
      </div>
      <div class="infoWrap"  v-if="currentStep === 'info'"   >
        <div class="infoBox">
          <div class="nameGroup">
            <img class="icon1" src="../assets/imgs/user.svg" alt="" />
            <input type="text" placeholder="請輸入您的姓名(暱稱)" v-model="name" />
          </div>
          <div class="heightGroup">
            <img class="icon1" src="../assets/imgs/height.svg" alt="" />
            <input type="text" placeholder="請輸入您的身高" v-model="height" />
          </div>
          <div class="weightGroup">
            <img class="icon1" src="../assets/imgs/weight.svg" alt="" />
            <input type="text" placeholder="請輸入您的體重" v-model="weight" />
          </div>
          <div class="groupGroup">
           
            <img class="icon1" src="../assets/imgs/group.svg" alt="" />
            <select ref="sexSelect" v-model="sex" name="" id="">
              <option class="placeholder" value="" disabled selected hidden>請選擇您的性別</option>
              <option value="1">男生</option>
              <option value="2">女生</option>
             
            </select>
            <img class="icon2" src="../assets/imgs/arrowDown.svg" alt="">
            <!-- <input type="text" disabled placeholder="請輸入您的性別"  v-model="sex"/> -->
           
          </div>
        </div>
        <button class="infoSendBtn" @click="addUser">送出</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.register {
  background: url("../assets/imgs/gradient-bg.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  min-height: 100vh;
  width: 100%;
  padding-bottom: 2rem;
  .registerGroup {
    padding-top: 100px;
    width: 90%;
    margin: 0 auto;
    max-width: 576px;

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

    .registerBox {
      background-color: #fff;
      border-radius: 12px;
      padding: 1rem;
      margin-top: 2.25rem;

   
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

      .passwordAgainHintText,
      .passwordHintText {
        color: #f00;
      }
    }
   


    .verfifyWrap {
      padding: 1rem;

      .verificationCodeGroup {
        display: flex;
        justify-content: space-between;
        align-items: center;
      
        padding: 1rem;
        border-radius: 12px;
        background-color: #fff;
        width: 100%;
            gap: 3.5%;
        .vertifyCode {
          background-color: #eee;
       
          height: 3rem;
        
          padding-left: 7%;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
      
          
        }
      }
      .verificationCodeHintText {
        font-size: 14px;
        color: #f00;
        text-align: center;
        font-weight: 400;
        letter-spacing: 0.1px;
        margin-top: 12px;
        line-height: 22.652px;
      }

      .reSendTextGroup{
        text-align: center;
        .reSendText {
          outline: none;
          background-color: transparent;
          border: none;
          margin-top: 44px;
          color: #222;
          font-weight: bold;
          text-decoration: underline;
          transition: .15s all ease;
          &:disabled{
            color: $raphael-gray-500;
            text-decoration:none;
          }
        }
      }
      
    }

    .infoWrap {
      background-color: #fff;
      border-radius: 1rem;
      padding: 1rem;
      margin-top: 1.5rem;
      .nameGroup,
      .heightGroup,
      .weightGroup {
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
        }

      
      }

      .groupGroup{
        display: flex;
        position: relative;
        width: 100%;
        select {
          outline: none;
          border: none;
          padding-left: 36px;
          padding-bottom: 16px;
          padding-top: 16px;
          font-size: 1.2rem; 
          width: 100%; 
          border-bottom: 1px solid $raphael-gray-400; 

          appearance: none; 
          color: $raphael-gray-400;
            font-family: Inter;
            font-size: 1.2rem;
            font-weight: 400;
          
          &::selection{
            color: #f00;
          }
        

          &::placeholder {
            color: $raphael-gray-400;
            font-family: Inter;
            font-size: 1.2rem;
            font-weight: 400;
          }


          &::-ms-expand {
            display: none; 
          }
          
        }
        .icon1{
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
          }
          .icon2 {
            position: absolute;
            top: 50%;
            right: 10px; 
            transform: translateY(-50%);
            pointer-events: none; 
          }
      }
    }

    input[type="text"],
    input[type="password"],
    input[type="number"] {
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

    .vertificationBtn,
    .infoSendBtn {
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
        margin-top: 90px;
        text-align: center;
        text-decoration: none;
        color: #666;
      }
    }
   
  }
}
</style>

<script>
import { ref, onMounted, nextTick, watch } from "vue";
import RaphaelLoading from "../components/RaphaelLoading";
import eyesCloseGreen from "../assets/imgs/eyesCloseGreen.svg";
import eyesOpenGreen from "../assets/imgs/eyesOpenGreen.svg";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useRouter } from 'vue-router';
export default {
  components: { Navbar },
  setup() {
    const router = useRouter();
    const passwordVisible = ref(false);
    const passwordAgainVisible = ref(false);
    const loading = ref(false);

    const mobile = ref("");
    const password = ref("");
    const passwordAgain = ref("");
    const passwordError = ref("");
    const passwordAgainError = ref("");
    const isPrivacy = ref(false)
    const isReSend = ref(false)
    const sexSelect = ref(null)

    const name = ref("");
    const height = ref("");
    const weight = ref("");
    const sex  = ref("")

    const currentStep = ref("register");
    const verificationCodes = ref(["", "", "", "", ""]);
    const verificationInput = ref([]);
    const verificationTitle = ref("註冊會員");

    const countdownTime = ref(60);
    const countdownInterval = ref(null);

    const togglePasswordVisibility = () => {
      passwordVisible.value = !passwordVisible.value;
    };

    const togglePasswordAgainVisibility = () => {
      passwordAgainVisible.value = !passwordAgainVisible.value;
    };

    watch(verificationCodes, (newCodes) => {
      if (newCodes.every((code) => code !== "")) {
        currentStep.value = "info";
      }
    });

    const getVerificationCode = async () => {
      if(password.value.length<6) {alert("密碼小於6位數") ; return}
      if(password.value !== passwordAgain.value){ alert("密碼不一致"); return}
      loading.value = true;
      // await new Promise((resolve) => setTimeout(resolve, 750));
      // loading.value = false;
      // currentStep.value = "verify";
      // verificationTitle.value = "輸入驗證碼";
      // startCountdown();
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_AA3.jsp",
          {
            Mobile: mobile.value,
            Password: password.value,
          }
        );

        if (response.status === 200) {
          const data = response.data;
          if (data.Token.trim()!==""||data.MID.trim()!=="") {
            currentStep.value = "verify";
            verificationTitle.value = "輸入驗證碼";
            startCountdown();
            
            localStorage.setItem('userData', JSON.stringify({
              Token: data.Token,
              MAID: data.MAID,
              MID: data.MID,
              A5Digit: data.A5Digit,
              Mobile: data.Mobile,
              startTime: data.startTime
            }));
          }
          else {
          alert(`註冊失敗 : ${data.Result}`);
        }
        } 
      } catch (err) {
        alert("註冊失敗");
      } finally {
        loading.value = false;
      }
    };

    const validatePassword = () => {
      if (password.value.length < 6) {
        passwordError.value = "密碼長度必須至少 6 位";
      } else {
        passwordError.value = "";
      }
    };

    const validatePasswordAgain = () => {
      if (passwordAgain.value !== password.value) {
        passwordAgainError.value = "兩次輸入的密碼不一致";
      } else {
        passwordAgainError.value = "";
      }
    };

    const verifyCode = async () => {
      loading.value = true;

    const enteredCode = verificationCodes.value.join("");
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile, A5Digit } = localData ? JSON.parse(localData) : {};

    if (enteredCode == A5Digit) {
      alert("驗證成功");
      currentStep.value = "info";
      verificationCodes.value = ["", "", "", "", ""];
    } else {
      verificationCodes.value = ["", "", "", "", ""];
      nextTick(() => {
      verificationInput.value[0]?.focus(); 
    });
      alert("驗證碼錯誤");
    }

    loading.value = false;
  // try {
  //   const response = await axios.post("https://23700999.com:8081/HMA/TTEAA4_1.jsp", {
  //       D1: enteredCode[0],
  //       D2: enteredCode[1],
  //       D3: enteredCode[2],
  //       D4: enteredCode[3],
  //       D5: enteredCode[4],
  //       MID: MID,
  //     }, {
  //       withCredentials: true 
  //     });

  //   if (response.status === 200) {
  //     const data = response.data;

  //     if (data.Result === true) {
  //       alert("驗證成功");
  //       const localData = localStorage.getItem("userData");
  //       const updatedData = {
  //         ...JSON.parse(localData),
  //         // Include any additional data returned from your API
  //       };
  //       localStorage.setItem('userData', JSON.stringify(updatedData));
        
  //       // Clear the verification codes
  //       verificationCodes.value = ["", "", "", "", ""]; // Reset to empty

  //       // Proceed to the next step
  //       currentStep.value = "info"; 
  //     } else {
  //       verificationCodes.value = ["", "", "", "", ""];
  //       verificationInputs.value[0].focus();
  //       alert("驗證碼錯誤，請再試一次");
  //     }
  //   }
  // } catch (error) {
  //   alert("驗證失敗，請稍後再試");
  // } finally {
  //   loading.value = false;
  // }
};


const handleInput = (index) => {
  // 如果當前輸入的數字不在範圍內，則清空該輸入框
  if (verificationCodes.value[index] < 0 || verificationCodes.value[index] > 9) {
    verificationCodes.value[index] = '';
  }

  // 將焦點移到下一個輸入框
  if (verificationCodes.value[index] && index < verificationCodes.value.length - 1) {
    verificationInput.value[index + 1]?.focus();
  }

  // 當5個數字都填寫完成時，進行驗證
  if (verificationCodes.value.every(code => code !== '')) {
    verifyCode(); // 調用驗證方法
  }
};

    const allowOnlyNumbers = (event) => {
      const char = String.fromCharCode(event.which);
      if (!/[0-9]/.test(char)) {
        event.preventDefault();
      }
    };

    const startCountdown = () => {
    countdownTime.value = 60;
    isReSend.value = false;  
    countdownInterval.value = setInterval(() => {
      if (countdownTime.value > 0) {
        countdownTime.value--;
      } else {
        clearInterval(countdownInterval.value);
        countdownTime.value = "驗證碼已失效，請重新發送";  
        isReSend.value = true;  
      }
    }, 1000);
  };

    onMounted(() => {
      nextTick(() => {
        verificationInput.value = verificationInput.value.slice(
          0,
          verificationCodes.value.length
        );
      });

    });

    const reSend = async () => {
      try {
        const localData = localStorage.getItem("userData");
        const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_AA4.jsp",
          {
            MID:MID,
            Token:Token,
            MAID:MAID,
            Mobile:Mobile
          }
        );

        if (response.status === 200) {
          const { startTime, A5Digit, Result } = response.data;
         
          localStorage.setItem(
            "userData", 
            JSON.stringify({
              ...JSON.parse(localData), 
              startTime, 
              A5Digit,   
              Result,    
            })
          );
          alert("簡訊已重新發送")
          startCountdown()
        } else {
          alert("重新發送失敗");
        }
      } catch (err) {
        alert("重新發送失敗");
      } finally {
        loading.value = false;
      }
    }

    const addUser = async () => {
  try {
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

    // Ensure that required values are available
    if (!MID || !Token || !MAID || !Mobile || !name.value || !height.value || !sex.value) {
      throw new Error("資料不完整");
    }

    const response = await axios.post("https://23700999.com:8081/HMA/API_AA5.jsp", {
      MID: MID,
      Token: Token,
      MAID: MAID,
      Mobile: Mobile,
      Name: name.value,
      Height: height.value, // Use height.value if height is a ref
      Weight: weight.value, // Ensure you have the weight variable defined
      Sex: sex.value
    });

    if (response.status === 200) {
      router.push('/user');
      console.log(response.data);
    }

  } catch (err) {
    alert(err.message || "資料不完整"); // Log the specific error message
    console.error(err); // Log the error for debugging
  } finally {
    // Optional cleanup code can go here
  }
};


    return {
      passwordVisible,
      passwordAgainVisible,
      mobile,
      password,
      passwordAgain,
      passwordError,
      passwordAgainError,
      togglePasswordVisibility,
      togglePasswordAgainVisibility,
      validatePassword,
      validatePasswordAgain,
      eyesCloseGreen,
      eyesOpenGreen,
      loading,
      getVerificationCode,
      currentStep,
      verificationCodes,
      handleInput,
      allowOnlyNumbers,
      verificationInput,
      verificationTitle,
      startCountdown,
      countdownTime,
      isPrivacy,
      isReSend,
      reSend,
      addUser,
      name,
      height,
      weight,
      sex,
      sexSelect
    };
  },
};
</script>
