<template>
  <div class="personalized-info">
    <TitleMenu Text="個人化設定" positionType="absolute" :link="'/orderQuery'" />
    <!-- 步驟條 -->
    <div class="step-bar">
      <!-- 動態進度線 -->
      <div
        class="progress"
        :style="{ width: (currentStep / (steps.length - 1)) * 100 + '%' }"
      ></div>

      <!-- 節點 & 標籤 -->
      <div
        v-for="(step, index) in steps"
        :key="step"
        class="step"
        :class="{
          active: index === currentStep,
          completed: index < currentStep,
        }"
      >
        <div class="circle"></div>
        <span class="label">{{ step }}</span>
      </div>
    </div>

    <!-- 步驟一：選擇性別與尺寸 -->
    <div v-if="currentStep === 0" class="step-content">
      <div class="gender-select">
        <button
          v-for="gender in genders"
          :key="gender.value"
          :class="['size-btn', { selected: selectedGender === gender.value }]"
          @click="selectedGender = gender.value"
        >
          {{ gender.label }}
        </button>
      </div>
      <h2>請選擇最適合您的服裝尺寸</h2>
      <div class="size-select">
        <button
          v-for="size in sizes"
          :key="size"
          :class="['size-btn', { selected: selectedSize === size }]"
          @click="selectedSize = size"
        >
          {{ size }}
        </button>
      </div>
      <Transition name="fade" mode="out-in">
        <div v-if="selectedSize" class="selected-size-info" key="selected-size">
          <div class="selected-size-title">{{ selectedSize }} 尺寸</div>
          <div class="selected-size-divider"></div>
          <div class="selected-size-detail">
            <div class="size-col">
              <div class="label">肩寬</div>
              <div class="value">{{ selectedSizeObj.shoulder }}</div>
            </div>
            <div class="vertical-divider"></div>
            <div class="size-col">
              <div class="label">胸寬</div>
              <div class="value">{{ selectedSizeObj.chest }}</div>
            </div>
            <div class="vertical-divider"></div>
            <div class="size-col">
              <div class="label">衣長</div>
              <div class="value">{{ selectedSizeObj.length }}</div>
            </div>
          </div>
        </div>
      </Transition>
      <div class="size-table-wrap">
        <div class="table-title">完整尺寸對照表</div>
        <div class="table-desc">胸寬為英吋，其餘為公分</div>
        <table class="size-table">
          <thead>
            <tr>
              <th>尺寸</th>
              <th>肩寬</th>
              <th>胸寬</th>
              <th>衣長</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in sizeTable" :key="row.size">
              <td>{{ row.size }}</td>
              <td>{{ row.shoulder }}</td>
              <td>{{ row.chest }}</td>
              <td>{{ row.length }}</td>
            </tr>
          </tbody>
        </table>
        <div class="measure-title">量測方式</div>
        <div class="measure-desc">請拿捲尺測量「肩寬、胸寬、衣長」</div>
        <div class="img-container">
          <RaphaelLoading v-if="!imageLoaded.measure1" />
          <img 
            src="/assets/imgs/measure1.png" 
            class="measure-img" 
            :class="{ 'loaded': imageLoaded.measure1 }"
            @load="imageLoaded.measure1 = true"
            @error="handleImageError('measure1')"
          />
        </div>
      </div>
      <div class="btn-group">
        <button
          class="next-btn"
          @click="nextStep"
          :disabled="!selectedGender || !selectedSize"
        >
          下一步
        </button>
      </div>
    </div>

    <!-- 步驟二：身高體重 -->
    <div v-else-if="currentStep === 1" class="step-content">
      <h2>輸入您的身高體重，幫助我們提供更精確的建議</h2>
      <div class="formWrap">
        <div class="form-group">
          <label>身高(公分)<span class="required">*</span></label>
          <div class="inputWrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M16.6868 1.79297L18.7903 3.89647C18.8814 3.99077 18.9318 4.11707 18.9306 4.24817C18.9295 4.37927 18.8769 4.50467 18.7842 4.59738C18.6915 4.69008 18.5661 4.74267 18.435 4.74381C18.3039 4.74494 18.1776 4.69455 18.0833 4.60347L17.1868 3.70697V22H16.1868V3.70697L15.2903 4.60347C15.2442 4.65122 15.189 4.68932 15.128 4.71552C15.067 4.74172 15.0014 4.75552 14.935 4.75609C14.8686 4.75667 14.8027 4.74402 14.7413 4.71888C14.6799 4.69374 14.624 4.65661 14.5771 4.60967C14.5301 4.56272 14.493 4.50689 14.4679 4.44545C14.4427 4.384 14.4301 4.31816 14.4307 4.25177C14.4312 4.18538 14.445 4.11977 14.4712 4.05877C14.4974 3.99776 14.5355 3.94259 14.5833 3.89647L16.6868 1.79297Z"
                fill="#74BC1F"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12.9368 4.49997C12.9368 5.16301 12.6734 5.79889 12.2045 6.26774C11.7357 6.73658 11.0998 6.99997 10.4368 6.99997C9.77374 6.99997 9.13785 6.73658 8.66901 6.26774C8.20017 5.79889 7.93678 5.16301 7.93678 4.49997C7.93678 3.83693 8.20017 3.20104 8.66901 2.7322C9.13785 2.26336 9.77374 1.99997 10.4368 1.99997C11.0998 1.99997 11.7357 2.26336 12.2045 2.7322C12.6734 3.20104 12.9368 3.83693 12.9368 4.49997ZM11.9368 4.49997C11.9368 4.89779 11.7787 5.27932 11.4974 5.56063C11.2161 5.84193 10.8346 5.99997 10.4368 5.99997C10.039 5.99997 9.65742 5.84193 9.37612 5.56063C9.09481 5.27932 8.93678 4.89779 8.93678 4.49997C8.93678 4.10214 9.09481 3.72061 9.37612 3.43931C9.65742 3.158 10.039 2.99997 10.4368 2.99997C10.8346 2.99997 11.2161 3.158 11.4974 3.43931C11.7787 3.72061 11.9368 4.10214 11.9368 4.49997ZM12.3933 22C12.0189 22 11.658 21.86 11.3816 21.6075C11.1051 21.3551 10.9331 21.0083 10.8993 20.6355L10.5233 16.5H10.3498L9.97378 20.6355C9.96578 20.7252 9.94972 20.8141 9.92578 20.901C9.83808 21.2171 9.64918 21.4957 9.38802 21.6942C9.12685 21.8927 8.80781 22.0001 8.47978 22H8.43678C8.03895 22 7.65742 21.8419 7.37612 21.5606C7.09481 21.2793 6.93678 20.8978 6.93678 20.5V16.1035C6.69455 15.9229 6.49637 15.6898 6.35712 15.4217C6.21787 15.1536 6.14117 14.8575 6.13278 14.5555L6.00078 9.79697C5.99281 9.51111 6.04624 9.22687 6.15745 8.96342C6.26867 8.69996 6.43509 8.46342 6.64549 8.26975C6.85589 8.07607 7.10538 7.92977 7.37713 7.84071C7.64887 7.75165 7.93656 7.7219 8.22078 7.75347L10.2158 7.97547C10.3631 7.99147 10.5104 7.99147 10.6578 7.97547L12.5878 7.76047C12.8767 7.72833 13.1691 7.75956 13.4447 7.85197C13.7203 7.94439 13.9725 8.09576 14.1836 8.29556C14.3947 8.49537 14.5597 8.73879 14.6672 9.00888C14.7747 9.27897 14.8219 9.56924 14.8058 9.85947L14.5418 14.611C14.5138 15.113 14.2978 15.5861 13.9368 15.936V20.5C13.9368 20.8978 13.7787 21.2793 13.4974 21.5606C13.2161 21.8419 12.8346 22 12.4368 22H12.3933ZM7.93678 16.1035C7.93678 15.9478 7.90044 15.7943 7.83064 15.6551C7.76085 15.516 7.65954 15.3951 7.53478 15.302C7.4135 15.2117 7.31428 15.0951 7.24456 14.961C7.17485 14.8268 7.13646 14.6786 7.13228 14.5275L7.00028 9.76947C6.99626 9.62652 7.02294 9.48437 7.07854 9.35261C7.13413 9.22085 7.21733 9.10255 7.32254 9.00569C7.42774 8.90883 7.5525 8.83565 7.68839 8.79111C7.82428 8.74656 7.96814 8.73168 8.11028 8.74747L10.1053 8.96947C10.3253 8.99397 10.5478 8.99397 10.7683 8.96947L12.6983 8.75447C12.8428 8.73839 12.989 8.75402 13.1269 8.80025C13.2647 8.84649 13.3908 8.92222 13.4964 9.02218C13.602 9.12213 13.6845 9.24391 13.7382 9.37901C13.7918 9.51412 13.8154 9.65931 13.8073 9.80447L13.5433 14.5555C13.5293 14.8065 13.4213 15.043 13.2408 15.218C13.1446 15.3112 13.0681 15.4228 13.0159 15.5461C12.9637 15.6695 12.9368 15.802 12.9368 15.936V20.5C12.9368 20.6326 12.8841 20.7598 12.7903 20.8535C12.6966 20.9473 12.5694 21 12.4368 21H12.3933C12.2685 21 12.1481 20.9533 12.056 20.8691C11.9638 20.7849 11.9065 20.6693 11.8953 20.545L11.5193 16.4095C11.4968 16.1608 11.3822 15.9296 11.1979 15.7612C11.0135 15.5928 10.7729 15.4995 10.5233 15.4995H10.3498C10.1001 15.4995 9.85951 15.5928 9.6752 15.7612C9.4909 15.9296 9.37624 16.1608 9.35378 16.4095L8.97778 20.545C8.96655 20.6692 8.90929 20.7847 8.81725 20.8689C8.7252 20.9531 8.60501 20.9999 8.48028 21H8.43678C8.30417 21 8.17699 20.9473 8.08322 20.8535C7.98945 20.7598 7.93678 20.6326 7.93678 20.5V16.1035Z"
                fill="#74BC1F"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12.9368 4.49997C12.9368 5.16301 12.6734 5.79889 12.2045 6.26774C11.7357 6.73658 11.0998 6.99997 10.4368 6.99997C9.77374 6.99997 9.13785 6.73658 8.66901 6.26774C8.20017 5.79889 7.93678 5.16301 7.93678 4.49997C7.93678 3.83693 8.20017 3.20104 8.66901 2.7322C9.13785 2.26336 9.77374 1.99997 10.4368 1.99997C11.0998 1.99997 11.7357 2.26336 12.2045 2.7322C12.6734 3.20104 12.9368 3.83693 12.9368 4.49997ZM11.9368 4.49997C11.9368 4.89779 11.7787 5.27932 11.4974 5.56063C11.2161 5.84193 10.8346 5.99997 10.4368 5.99997C10.039 5.99997 9.65742 5.84193 9.37612 5.56063C9.09481 5.27932 8.93678 4.89779 8.93678 4.49997C8.93678 4.10214 9.09481 3.72061 9.37612 3.43931C9.65742 3.158 10.039 2.99997 10.4368 2.99997C10.8346 2.99997 11.2161 3.158 11.4974 3.43931C11.7787 3.72061 11.9368 4.10214 11.9368 4.49997ZM12.3933 22C12.0189 22 11.658 21.86 11.3816 21.6075C11.1051 21.3551 10.9331 21.0083 10.8993 20.6355L10.5233 16.5H10.3498L9.97378 20.6355C9.96578 20.7252 9.94972 20.8141 9.92578 20.901C9.83808 21.2171 9.64918 21.4957 9.38802 21.6942C9.12685 21.8927 8.80781 22.0001 8.47978 22H8.43678C8.03895 22 7.65742 21.8419 7.37612 21.5606C7.09481 21.2793 6.93678 20.8978 6.93678 20.5V16.1035C6.69455 15.9229 6.49637 15.6898 6.35712 15.4217C6.21787 15.1536 6.14117 14.8575 6.13278 14.5555L6.00078 9.79697C5.99281 9.51111 6.04624 9.22687 6.15745 8.96342C6.26867 8.69996 6.43509 8.46342 6.64549 8.26975C6.85589 8.07607 7.10538 7.92977 7.37713 7.84071C7.64887 7.75165 7.93656 7.7219 8.22078 7.75347L10.2158 7.97547C10.3631 7.99147 10.5104 7.99147 10.6578 7.97547L12.5878 7.76047C12.8767 7.72833 13.1691 7.75956 13.4447 7.85197C13.7203 7.94439 13.9725 8.09576 14.1836 8.29556C14.3947 8.49537 14.5597 8.73879 14.6672 9.00888C14.7747 9.27897 14.8219 9.56924 14.8058 9.85947L14.5418 14.611C14.5138 15.113 14.2978 15.5861 13.9368 15.936V20.5C13.9368 20.8978 13.7787 21.2793 13.4974 21.5606C13.2161 21.8419 12.8346 22 12.4368 22H12.3933ZM7.93678 16.1035C7.93678 15.9478 7.90044 15.7943 7.83064 15.6551C7.76085 15.516 7.65954 15.3951 7.53478 15.302C7.4135 15.2117 7.31428 15.0951 7.24456 14.961C7.17485 14.8268 7.13646 14.6786 7.13228 14.5275L7.00028 9.76947C6.99626 9.62652 7.02294 9.48437 7.07854 9.35261C7.13413 9.22085 7.21733 9.10255 7.32254 9.00569C7.42774 8.90883 7.5525 8.83565 7.68839 8.79111C7.82428 8.74656 7.96814 8.73168 8.11028 8.74747L10.1053 8.96947C10.3253 8.99397 10.5478 8.99397 10.7683 8.96947L12.6983 8.75447C12.8428 8.73839 12.989 8.75402 13.1269 8.80025C13.2647 8.84649 13.3908 8.92222 13.4964 9.02218C13.602 9.12213 13.6845 9.24391 13.7382 9.37901C13.7918 9.51412 13.8154 9.65931 13.8073 9.80447L13.5433 14.5555C13.5293 14.8065 13.4213 15.043 13.2408 15.218C13.1446 15.3112 13.0681 15.4228 13.0159 15.5461C12.9637 15.6695 12.9368 15.802 12.9368 15.936V20.5C12.9368 20.6326 12.8841 20.7598 12.7903 20.8535C12.6966 20.9473 12.5694 21 12.4368 21H12.3933C12.2685 21 12.1481 20.9533 12.056 20.8691C11.9638 20.7849 11.9065 20.6693 11.8953 20.545L11.5193 16.4095C11.4968 16.1608 11.3822 15.9296 11.1979 15.7612C11.0135 15.5928 10.7729 15.4995 10.5233 15.4995H10.3498C10.1001 15.4995 9.85951 15.5928 9.6752 15.7612C9.4909 15.9296 9.37624 16.1608 9.35378 16.4095L8.97778 20.545C8.96655 20.6692 8.90929 20.7847 8.81725 20.8689C8.7252 20.9531 8.60501 20.9999 8.48028 21H8.43678C8.30417 21 8.17699 20.9473 8.08322 20.8535C7.98945 20.7598 7.93678 20.6326 7.93678 20.5V16.1035Z"
                fill="#74BC1F"
              />
            </svg>
            <input v-model="height" type="number" placeholder="例如：170" />
          </div>
        </div>
        <div class="form-group">
          <label>體重(公斤)<span class="required">*</span></label>
          <div class="inputWrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12 3C11.6021 3 11.2206 3.15804 10.9393 3.43934C10.658 3.72064 10.5 4.10218 10.5 4.5C10.5 4.89782 10.658 5.27936 10.9393 5.56066C11.2206 5.84196 11.6021 6 12 6C12.3978 6 12.7793 5.84196 13.0606 5.56066C13.3419 5.27936 13.5 4.89782 13.5 4.5C13.5 4.10218 13.3419 3.72064 13.0606 3.43934C12.7793 3.15804 12.3978 3 12 3ZM9.49997 4.5C9.49997 3.83696 9.76336 3.20107 10.2322 2.73223C10.701 2.26339 11.3369 2 12 2C12.663 2 13.2989 2.26339 13.7677 2.73223C14.2366 3.20107 14.5 3.83696 14.5 4.5C14.5 5.16304 14.2366 5.79893 13.7677 6.26777C13.2989 6.73661 12.663 7 12 7C11.3369 7 10.701 6.73661 10.2322 6.26777C9.76336 5.79893 9.49997 5.16304 9.49997 4.5ZM11.993 7.5C14.017 7.491 15.998 7.854 18.4195 8.56C18.611 8.61297 18.7901 8.70346 18.9463 8.82622C19.1026 8.94897 19.2329 9.10156 19.3297 9.2751C19.4265 9.44864 19.4878 9.63968 19.5101 9.83713C19.5325 10.0346 19.5154 10.2345 19.4598 10.4253C19.4042 10.616 19.3113 10.7939 19.1864 10.9484C19.0615 11.103 18.9072 11.2312 18.7323 11.3256C18.5575 11.42 18.3656 11.4788 18.1679 11.4984C17.9701 11.518 17.7705 11.4982 17.5805 11.44C17.229 11.3374 16.8759 11.24 16.5215 11.148C16.7615 11.9405 16.968 12.766 16.9965 13.5745C17.0345 14.66 16.754 15.7285 15.853 16.6825L15.494 20.636C15.4595 21.0208 15.2778 21.3775 14.9868 21.6317C14.6958 21.8859 14.3179 22.018 13.9319 22.0004C13.5459 21.9829 13.1816 21.8171 12.9148 21.5376C12.6481 21.2581 12.4995 20.8864 12.5 20.5V17.9975C12.3363 17.9995 12.1726 18.0003 12.009 18H11.991C11.8273 18.0003 11.6636 17.9995 11.5 17.9975V20.5C11.5005 20.8864 11.3519 21.2581 11.0851 21.5376C10.8184 21.8171 10.454 21.9829 10.068 22.0004C9.68205 22.018 9.30419 21.8859 9.01319 21.6317C8.72218 21.3775 8.54049 21.0208 8.50597 20.636L8.14647 16.6825C7.24897 15.7315 6.96647 14.667 7.00297 13.5845C7.02997 12.777 7.23497 11.953 7.47447 11.161C7.13114 11.247 6.7733 11.3418 6.40097 11.4455C6.0176 11.5519 5.60768 11.5016 5.2614 11.3057C4.91511 11.1098 4.66082 10.7844 4.55447 10.401C4.44812 10.0176 4.49842 9.60771 4.6943 9.26143C4.89018 8.91514 5.2156 8.66085 5.59897 8.5545C7.99997 7.888 9.97397 7.51 11.993 7.5ZM18.14 9.52C15.77 8.8295 13.891 8.4915 11.9975 8.5C10.106 8.5085 8.22897 8.8625 5.86597 9.518C5.73814 9.55347 5.62963 9.63827 5.56432 9.75375C5.49901 9.86923 5.48225 10.0059 5.51772 10.1337C5.55319 10.2616 5.638 10.3701 5.75347 10.4354C5.86895 10.5007 6.00564 10.5175 6.13347 10.482C6.78735 10.2987 7.44591 10.1324 8.10847 9.9835L8.96047 9.7945L8.69247 10.625C8.34747 11.6925 8.03347 12.685 8.00247 13.618C7.97247 14.517 8.20747 15.345 8.97897 16.103L9.10997 16.2315L9.50197 20.545C9.51348 20.6733 9.57402 20.7921 9.67098 20.8768C9.76795 20.9616 9.89386 21.0056 10.0225 20.9998C10.1511 20.994 10.2726 20.9388 10.3615 20.8457C10.4505 20.7526 10.5001 20.6288 10.5 20.5V16.9435L11.0335 16.9795C11.3335 16.9995 11.648 17 12 17C12.352 17 12.6665 17 12.9665 16.98L13.5 16.943V20.5C13.4999 20.6288 13.5495 20.7526 13.6384 20.8457C13.7274 20.9388 13.8488 20.994 13.9774 20.9998C14.1061 21.0056 14.232 20.9616 14.329 20.8768C14.4259 20.7921 14.4865 20.6733 14.498 20.545L14.89 16.2315L15.021 16.103C15.795 15.343 16.029 14.5125 15.997 13.6095C15.9645 12.673 15.647 11.677 15.3015 10.606L15.032 9.772L15.887 9.965C16.505 10.104 17.1575 10.275 17.86 10.48C17.9873 10.5171 18.1241 10.5022 18.2404 10.4384C18.3567 10.3746 18.4428 10.2673 18.48 10.14C18.5171 10.0127 18.5021 9.87586 18.4384 9.75958C18.3746 9.64331 18.2673 9.55713 18.14 9.52Z"
                fill="#74BC1F"
              />
            </svg>
            <input v-model="weight" type="number" placeholder="例如：55" />
          </div>
        </div>
      </div>

      <div class="measureWrap">
        <div class="measure-title">量測方式</div>
        <div class="measure-desc">從頭頂到腳底的距離以及體重計</div>
        <div class="img-container">
          <RaphaelLoading v-if="!imageLoaded.measure2" />
          <img 
            src="/assets/imgs/measure2.png" 
            class="measure-img" 
            :class="{ 'loaded': imageLoaded.measure2 }"
            @load="imageLoaded.measure2 = true"
            @error="handleImageError('measure2')"
          />
        </div>
      </div>

      <div class="btn-group">
        <button class="prev-btn" @click="prevStep">上一步</button>
        <button
          class="next-btn"
          @click="nextStep"
          :disabled="!height || !weight"
        >
          快完成了！
        </button>
      </div>
    </div>

    <!-- 步驟三：身材比例 -->
    <div v-else-if="currentStep === 2" class="step-content">
      <h2>領口到肚臍距離</h2>
      <div class="formWrap">
        <div class="form-group">
          <label
            >領口到肚臍距離(公分)<span class="required"
              >*</span
            ></label
          >
          <div class="inputWrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4.56497 2.82659C4.36669 2.93003 4.371 2.90848 4.371 4.96449C4.371 6.23602 4.38825 6.94722 4.41411 7.00325C4.52186 7.19722 5.61237 7.64117 6.41839 7.81359C7.27183 7.99893 8.7675 8.05927 9.10801 7.92134C9.30628 7.84376 9.3968 7.67566 9.33214 7.51187C9.25887 7.3179 9.16835 7.27911 8.80629 7.28773L8.4744 7.29635L8.45716 6.86532C8.44422 6.46878 8.4356 6.42136 8.34078 6.34809C8.21147 6.24033 8.03044 6.24464 7.8882 6.35671C7.78044 6.44292 7.77613 6.46016 7.77613 6.87394C7.77613 7.1067 7.7632 7.30066 7.74596 7.30066C7.62527 7.30066 6.89683 7.20584 6.71149 7.16704L6.48304 7.12394V5.80499C6.48304 4.56794 6.48735 4.49036 6.56063 4.52484C6.78045 4.61966 7.43562 4.75759 7.8063 4.78346C8.34078 4.81794 8.96146 4.75328 9.90972 4.55932C10.9485 4.34812 12.2804 4.12398 12.8795 4.06364C13.1898 4.03347 13.7157 4.02485 14.2372 4.03778C15.2329 4.06364 15.595 4.13691 16.2157 4.43863C16.7846 4.71449 17.1338 5.06362 17.401 5.61965C17.6381 6.11964 17.707 6.3955 17.7027 6.84808C17.6941 7.27911 17.5777 7.66704 17.3407 8.03341C17.1941 8.26186 17.1596 8.29634 17.1079 8.24462C17.0777 8.21013 16.9441 8.05927 16.8105 7.9041L16.5691 7.62393V7.03773C16.5691 6.48171 16.5648 6.44723 16.47 6.36102C16.3622 6.26188 16.1855 6.24033 16.0519 6.3093C15.9484 6.36533 15.8795 6.57653 15.8795 6.85239C15.8795 6.9817 15.8708 7.08515 15.8622 7.08515C15.8536 7.08515 15.7286 7.02911 15.5821 6.96015C15.4398 6.8955 15.164 6.79205 14.9743 6.73601L14.6295 6.63688V6.11964C14.6252 5.55931 14.6036 5.48603 14.401 5.40845C14.2459 5.3481 14.0519 5.42138 13.9873 5.55931C13.9614 5.61965 13.9398 5.86534 13.9398 6.11102V6.55498L13.4355 6.58515C13.1554 6.6024 12.8364 6.62395 12.7243 6.64119L12.5174 6.66705V6.43429C12.5131 6.17568 12.4614 6.07654 12.289 6.01189C12.0175 5.90844 11.8278 6.11102 11.8278 6.50757V6.7705L11.289 6.86532C10.9916 6.92136 10.7114 6.97308 10.664 6.98601C10.5821 7.00756 10.5778 6.98601 10.5778 6.32223C10.5778 5.69724 10.5692 5.61965 10.4916 5.52051C10.4442 5.46448 10.358 5.39983 10.2976 5.3869C10.1726 5.35672 9.95713 5.45155 9.91403 5.555C9.87093 5.67137 9.88386 7.51618 9.93127 7.59807C10.0304 7.79204 10.1511 7.78772 11.2244 7.58514C12.7028 7.30497 12.858 7.28342 13.6166 7.27911C14.151 7.27911 14.3795 7.29635 14.6295 7.36101C15.0562 7.46445 15.595 7.72307 15.8967 7.97307C16.151 8.17565 16.6122 8.70582 16.6122 8.78771C16.6122 8.80926 16.4915 8.91271 16.345 9.01185C15.5821 9.51615 14.595 9.84804 13.4571 9.96873C12.8838 10.0334 12.483 10.0291 11.9011 9.95149C11.2761 9.86959 10.7847 9.72735 10.1856 9.45581C8.72008 8.7834 7.15545 8.58513 5.53909 8.85668C3.79343 9.14978 2.53482 10.0377 2.11673 11.2661C2.02621 11.5377 2.0219 11.6109 2.00897 13.7876C1.99173 16.2747 2.00035 16.3652 2.25034 16.8479C2.44431 17.2229 3.02188 17.8134 3.42274 18.0462C4.58652 18.7186 5.83219 18.8177 8.8106 18.4772C9.91834 18.3479 11.1123 18.3264 11.8925 18.4169C14.3105 18.6927 17.3234 19.5289 20.707 20.8608C21.6768 21.2444 21.7501 21.2574 21.9139 21.085C21.9958 20.9944 22.0001 20.9427 22.0001 18.9729V16.9514L21.8966 16.8523C21.7975 16.7531 21.2673 16.5592 20.082 16.2014C19.1596 15.9212 18.0174 15.6195 17.8794 15.6195C17.6079 15.6195 17.4527 15.9859 17.6424 16.1755C17.6898 16.223 17.8105 16.2833 17.9139 16.3092C18.0174 16.335 18.4915 16.4643 18.9699 16.6023L19.8449 16.8436V18.3005C19.8449 19.1022 19.832 19.7574 19.8148 19.7574C19.7975 19.7574 19.4355 19.6367 19.0174 19.4945L18.2501 19.2272V18.2919C18.2501 17.4212 18.2458 17.3479 18.1639 17.2445C18.1165 17.1885 18.0303 17.1238 17.97 17.1109C17.845 17.0807 17.6294 17.1755 17.5863 17.279C17.5734 17.3178 17.5605 17.7186 17.5605 18.1669C17.5605 18.6496 17.5432 18.9815 17.5217 18.9815C17.4958 18.9815 17.3277 18.9341 17.1424 18.8781C16.957 18.8177 16.6682 18.7315 16.4958 18.6841L16.1898 18.5936L16.1726 18.0548C16.1596 17.5678 16.151 17.5074 16.0648 17.4212C15.9312 17.2876 15.6812 17.2919 15.5734 17.4255C15.5045 17.5074 15.4915 17.5979 15.4915 17.9514C15.4915 18.3307 15.4829 18.3781 15.4183 18.3781C15.3752 18.3738 15.0907 18.3134 14.7803 18.2359L14.22 18.0979L14.2071 17.2488L14.1985 16.3997L14.0821 16.3135C13.9355 16.1928 13.7976 16.2014 13.651 16.3264L13.5304 16.4298L13.5174 17.1885C13.5088 17.7402 13.4873 17.9471 13.4528 17.9471C13.4226 17.9428 13.1209 17.8997 12.7761 17.8436L12.1511 17.7488L12.1295 17.3695C12.1123 17.0376 12.095 16.9816 12.0045 16.9083C11.8623 16.7919 11.7114 16.8048 11.5649 16.9514C11.4485 17.0678 11.4399 17.1023 11.4399 17.391V17.7014L11.108 17.6712C10.9269 17.6583 10.6468 17.6453 10.483 17.6453H10.1899V16.8954C10.1899 16.2057 10.1813 16.1411 10.0994 16.0333C9.983 15.8824 9.72869 15.8781 9.59507 16.0204C9.50455 16.1152 9.50024 16.1583 9.50024 16.9169V17.7186L8.84508 17.7876C8.48302 17.8264 8.13388 17.8609 8.06923 17.8609H7.94854V17.4945C7.94854 17.1583 7.93992 17.1152 7.84078 17.0204C7.72872 16.904 7.62096 16.8867 7.46148 16.96C7.30631 17.029 7.2589 17.1755 7.2589 17.5764V17.9341L6.927 17.9643C6.74597 17.9772 6.4658 17.9902 6.30201 17.9902H6.00891V17.2574C6.00891 16.4816 5.98305 16.3523 5.80633 16.2704C5.65547 16.2014 5.56064 16.21 5.44427 16.3048C5.34513 16.3867 5.34082 16.4126 5.31927 17.1583L5.29772 17.9255L5.14686 17.9126C4.87531 17.8824 4.36238 17.7316 4.06066 17.5936L3.76756 17.46V16.9988C3.76756 16.5979 3.75463 16.5204 3.67705 16.4212C3.60808 16.335 3.55205 16.3092 3.42705 16.3092C3.22016 16.3092 3.1124 16.4212 3.08223 16.6669L3.05637 16.8479L2.91844 16.6281C2.70723 16.2876 2.68999 16.1583 2.68999 15.0635V14.0592L2.92706 14.2747C3.58222 14.8781 4.496 15.2445 5.78047 15.4299C6.46149 15.529 8.07354 15.529 8.93991 15.4299C10.1252 15.2919 10.6425 15.2661 11.4399 15.2919C12.8149 15.3307 14.151 15.4988 15.8708 15.8436C16.6984 16.0074 16.7501 16.0117 16.8536 15.9471C17.0648 15.8049 17.0777 15.473 16.8751 15.3652C16.7803 15.3135 15.401 15.0376 14.6122 14.9083C12.5562 14.5807 10.7588 14.5075 9.32352 14.6885C6.93562 14.9945 4.88824 14.7747 3.84515 14.1066L3.63826 13.973L3.70291 13.8264C4.17273 12.6971 6.30632 12.3566 9.32783 12.9299C9.84076 13.0247 10.7157 13.2359 11.7416 13.5118C12.6295 13.7488 13.8536 13.8092 14.6941 13.6626C15.5562 13.5075 16.4312 13.1497 16.9872 12.7187C17.3579 12.4342 18.0389 11.7058 18.1725 11.4558C18.4053 11.0247 18.4225 10.861 18.4225 9.26184C18.4182 7.40842 18.3665 6.40412 18.2501 5.92137C17.8277 4.18864 16.4183 3.3352 13.9959 3.3352C12.9614 3.3352 11.7718 3.48606 9.71576 3.8783C8.54336 4.09812 8.40974 4.11536 7.99164 4.09812C7.72441 4.08519 7.39682 4.03778 7.19424 3.98174C6.49598 3.79209 5.61237 3.36537 5.06065 2.95158C4.81927 2.77055 4.71583 2.74469 4.56497 2.82659ZM5.46151 4.01622L5.7934 4.20588V5.55931C5.7934 6.30499 5.78047 6.91274 5.76323 6.91274C5.74168 6.91274 5.57788 6.85239 5.39685 6.77481L5.06065 6.63688V5.21879C5.06065 4.43863 5.07358 3.80933 5.09513 3.81795C5.11237 3.82226 5.27616 3.91709 5.46151 4.01622ZM17.6898 10.8265C17.6682 10.917 17.5907 11.0808 17.5131 11.1972L17.3794 11.4084L17.3019 11.236C17.1898 10.986 16.9441 10.9256 16.7545 11.1023C16.6639 11.1885 16.6553 11.2316 16.6553 11.6541V12.1109L16.3751 12.2963C16.0993 12.4773 15.4959 12.7747 15.4096 12.7747C15.3795 12.7747 15.3622 12.5506 15.3622 12.1066C15.3622 11.4515 15.3579 11.4342 15.2545 11.3308C15.1209 11.1929 14.97 11.1929 14.8148 11.3265L14.6941 11.4299L14.6683 12.9816L14.4657 13.0032C14.026 13.0592 13.5088 13.0851 13.4054 13.0592C13.2976 13.0333 13.2933 13.0204 13.2933 12.7058C13.2933 12.4213 13.2804 12.3696 13.1855 12.279C13.0519 12.1411 12.8235 12.1325 12.7071 12.2618C12.6468 12.3265 12.6209 12.4385 12.6037 12.667L12.5821 12.9773L12.1942 12.8954C11.983 12.8523 11.7071 12.7877 11.5821 12.7532L11.358 12.6885L11.345 12.0592C11.3321 11.4299 11.3321 11.4299 11.2114 11.3265C11.0563 11.1929 10.9054 11.1929 10.7718 11.3308C10.6683 11.4299 10.664 11.4601 10.664 11.9472C10.664 12.2273 10.6554 12.4687 10.6425 12.4816C10.6295 12.4946 10.4226 12.4601 10.177 12.404C9.93558 12.348 9.62524 12.2834 9.49162 12.2575L9.24163 12.2101V11.8265C9.24163 11.3954 9.18559 11.2834 8.95284 11.2403C8.83646 11.2187 8.79336 11.236 8.68129 11.3437C8.5606 11.4644 8.55198 11.4989 8.55198 11.7834V12.0937L8.28474 12.0635C8.13388 12.0463 7.85803 12.0161 7.66837 12.0032L7.32355 11.9773L7.302 11.2187C7.28476 10.5463 7.27183 10.4472 7.19855 10.3653C7.08648 10.2446 6.84511 10.2446 6.71149 10.3696C6.61666 10.4601 6.61235 10.486 6.61235 11.2015V11.9428L6.0434 11.9946C5.72874 12.0247 5.40547 12.0592 5.3322 12.0721L5.18996 12.0937V11.7877C5.18996 11.4342 5.11237 11.3092 4.88393 11.3092C4.59514 11.3092 4.50031 11.4816 4.50031 12.0032V12.2877L4.16842 12.4515C3.84084 12.6152 3.32361 13.0635 3.1555 13.3351L3.09085 13.4385L2.93568 13.1195C2.54344 12.3049 2.64258 11.4472 3.20292 10.7144C3.46153 10.3782 4.17704 9.94718 4.83221 9.73166C6.27615 9.26184 8.37095 9.37391 9.71145 9.9989C10.5476 10.3911 11.1856 10.5765 11.9657 10.6627C14.0347 10.8825 16.2803 10.1929 17.4743 8.96443L17.7113 8.71875L17.7243 9.69287C17.7286 10.2446 17.7156 10.736 17.6898 10.8265ZM20.9527 17.2014L21.3104 17.3178V20.3608L21.1078 20.2789C20.9915 20.2358 20.8191 20.1626 20.7199 20.1238L20.5346 20.0505V18.5677C20.5346 17.7531 20.5475 17.085 20.5647 17.085C20.582 17.085 20.7544 17.1367 20.9527 17.2014Z"
                fill="#74BC1F"
              />
            </svg>
            <input class="inputStep3" v-model="neckToNavel" type="number" placeholder="" />
          </div>

          <div v-if="isOutOfRange" class="error-msg">
            超出合理範圍(23-52cm)，請確認是否正確
          </div>
        </div>
      </div>
      <div class="measureWrap">
        <div class="measure-title">量測方法</div>
        <div class="measure-desc">系統已根據您的身高、體重、性別和尺寸自動計算，您也可以手動調整</div>
        <div class="img-container">
          <RaphaelLoading v-if="!imageLoaded.measure3" />
          <img 
            src="/assets/imgs/measure3.png" 
            class="measure-img" 
            :class="{ 'loaded': imageLoaded.measure3 }"
            @load="imageLoaded.measure3 = true"
            @error="handleImageError('measure3')"
          />
        </div>
        <div class="btn-group">
          <button class="prev-btn" @click="prevStep">上一步</button>
          <button class="next-btn" @click="submit" :disabled="!neckToNavel || isOutOfRange || isSubmitting">
            {{ isSubmitting ? '提交中...' : '提交' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import RaphaelLoading from "~/components/RaphaelLoading.vue";

const route = useRoute();
const router = useRouter();

// 從路由參數獲取資料
const saleId = ref("");
const productId = ref("");
const aid = ref("");
const csAid = ref("");

// 新增載入狀態
const isSubmitting = ref(false);

// 圖片載入狀態
const imageLoaded = ref({
  measure1: false,
  measure2: false,
  measure3: false
});

const steps = ["選擇性別尺寸", "身高體重", "身材比例"];
const currentStep = ref(0);

const genders = [
  { label: "男生", value: "male" },
  { label: "女生", value: "female" },
];
const selectedGender = ref("");

const sizes = ["XS", "S", "M", "L", "XL", "2L"];
const selectedSize = ref("");

const sizeTable = [
  { size: "XS", shoulder: 41, chest: 38, length: 65 },
  { size: "S", shoulder: 43.5, chest: 40, length: 67 },
  { size: "M", shoulder: 46, chest: 42, length: 69 },
  { size: "L", shoulder: 48.5, chest: 44, length: 71 },
  { size: "XL", shoulder: 51, chest: 46, length: 73 },
  { size: "2L", shoulder: 53.5, chest: 48, length: 75 },
];

const selectedSizeObj = computed(
  () => sizeTable.find((row) => row.size === selectedSize.value) || {}
);

const height = ref("");
const weight = ref("");
const neckToNavel = ref(36);

// 智平衡衣長對照表
const zphShirtLengths = {
  "XS": 65,
  "S": 67,
  "M": 69,
  "L": 71,
  "XL": 73,
  "2L": 75
};

// 計算領口到肚臍距離
function calculateNeckToNavel() {
  if (!selectedGender.value || !height.value || !weight.value || !selectedSize.value) {
    return;
  }

  const heightNum = parseFloat(height.value);
  const weightNum = parseFloat(weight.value);

  if (isNaN(heightNum) || isNaN(weightNum)) {
    return;
  }

  // 基礎上半身長度估算
  let shoulderToHip = 0;
  if (selectedGender.value === 'male') {
    shoulderToHip = heightNum * 0.275 + weightNum * 0.10;
  } else {
    shoulderToHip = heightNum * 0.265 + weightNum * 0.12;
  }

  // 智平衡衣長微調上半身長度（以M為基準69cm）
  const targetShirtLength = zphShirtLengths[selectedSize.value] || 69;
  const adjustment = (targetShirtLength - 69) * 0.15;
  const adjustedShoulderToHip = shoulderToHip + adjustment;

  // 肚臍到領口距離 = 上半身長度 × 0.75
  const calculatedNeckToNavel = adjustedShoulderToHip * 0.75;
  
  // 限制在合理範圍內 (23-52公分)
  neckToNavel.value = Math.max(23, Math.min(52, Math.round(calculatedNeckToNavel * 10) / 10));
}

// 檢查是否超出合理範圍
const isOutOfRange = computed(() => {
  return neckToNavel.value < 23 || neckToNavel.value > 52;
});

// 儲存個人化資料到 localStorage
function savePersonalizedData() {
  const personalizedData = {
    saleId: saleId.value,
    gender: selectedGender.value,
    size: selectedSize.value,
    height: height.value,
    weight: weight.value,
    neckToNavel: neckToNavel.value,
    timestamp: new Date().toISOString()
  };

  // 只儲存到當前 saleId 的 localStorage，保持資料獨立
  localStorage.setItem(`personalized_${saleId.value}`, JSON.stringify(personalizedData));
}

// 載入已儲存的個人化資料
function loadPersonalizedData() {
  // 只載入當前 saleId 的資料，不載入其他 saleId 的資料
  const savedData = localStorage.getItem(`personalized_${saleId.value}`);
  if (savedData) {
    const data = JSON.parse(savedData);
    selectedGender.value = data.gender || "";
    selectedSize.value = data.size || "";
    height.value = data.height || "";
    weight.value = data.weight || "";
    neckToNavel.value = data.neckToNavel || 36;
  } else {
    // 如果沒有當前 saleId 的資料，清空所有欄位
    selectedGender.value = "";
    selectedSize.value = "";
    height.value = "";
    weight.value = "";
    neckToNavel.value = 36;
  }
}

// 監聽身高體重變化，自動計算領口到肚臍距離
watch([height, weight, selectedGender, selectedSize], () => {
  if (currentStep.value === 2) {
    calculateNeckToNavel();
  }
});

function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
    // 進入第三步時自動計算
    if (currentStep.value === 2) {
      calculateNeckToNavel();
    }
  }
}
function prevStep() {
  if (currentStep.value > 0) currentStep.value--;
}

// 串接後端API儲存個人化資料
async function submit() {
  if (isSubmitting.value) return;

  // 驗證必填
  if (!selectedGender.value || !selectedSize.value || !height.value || !weight.value || !neckToNavel.value) {
    alert("請填寫所有必填欄位");
    return;
  }
  // 驗證數值
  const heightNum = parseFloat(height.value);
  const weightNum = parseFloat(weight.value);
  const neckToNavelNum = parseFloat(neckToNavel.value);
  if (isNaN(heightNum) || isNaN(weightNum) || isNaN(neckToNavelNum)) {
    alert("請輸入有效的數值");
    return;
  }
  if (isOutOfRange.value) {
    alert("請確認身材比例數值在合理範圍內");
    return;
  }

  isSubmitting.value = true;
  try {
    // 取得登入資訊
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (!userData.MID || !userData.Token || !userData.MAID || !userData.Mobile) {
      alert("請先登入");
      router.push("/");
      return;
    }

    // 組API資料
    const requestData = {
      MID: userData.MID,
      Token: userData.Token,
      MAID: userData.MAID,
      Mobile: userData.Mobile,
      Lang: "zhtw",
      CSAID: csAid.value,
      SALEID: saleId.value,
      ProductID: productId.value,
      PdtSize: selectedSize.value,
      Height: height.value.toString(),
      Weight: weight.value.toString(),
      BodySize: neckToNavel.value.toString()
    };

    // 呼叫API
    const response = await axios.post(
      "https://23700999.com:8081/HMA/api/fr/maSetProductInfo",
      requestData,
      { timeout: 10000, headers: { "Content-Type": "application/json" } }
    );

    if (response.data && response.data.Result === "OK") {
      savePersonalizedData();
      router.push("/orderQuery");
    } else {
      const errorMessage = response.data?.Message || "儲存失敗，請稍後再試";
      alert(errorMessage);
    }
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      alert("請求超時，請檢查網路連線後再試");
    } else if (error.response) {
      if (error.response.status === 401) {
        alert("登入已過期，請重新登入");
        router.push("/");
      } else {
        alert("伺服器錯誤，請稍後再試");
      }
    } else {
      alert("網路連線錯誤，請檢查網路後再試");
    }
  } finally {
    isSubmitting.value = false;
  }
}

// 處理圖片載入錯誤
function handleImageError(imageName) {
  console.error(`圖片載入失敗: ${imageName}`);
  imageLoaded.value[imageName] = true;
}

onMounted(() => {
  // 從路由 query 參數獲取資料
  saleId.value = route.query.saleId || "";
  productId.value = route.query.productId || "";
  aid.value = route.query.aid || "";
  csAid.value = route.query.csAid || "";
  console.log("個人化資訊頁面參數:", {
    saleId: saleId.value,
    productId: productId.value,
    aid: aid.value,
    csAid: csAid.value
  });

  // 檢查必要參數
  if (!saleId.value || !productId.value) {
    console.error("缺少必要參數:", { saleId: saleId.value, productId: productId.value });
    alert("缺少必要參數，請重新進入頁面");
    router.push("/orderQuery");
    return;
  }

  // 載入已儲存的個人化資料
  loadPersonalizedData();
});
</script>

<style lang="scss" scoped>
.personalized-info {
  background-color: #f6f6f6;
  min-height: 100vh;
  width: 100%;
  place-items: center;
  padding: 42px 5% 72px;
  position: relative;

  .step-bar {
    position: relative;
    display: flex;
    justify-content: space-between; /* 左右節點貼邊，中間自動等距 */
    align-items: center;
    width: 80%;
  
    margin: 32px auto;

    /* 底線 */
    &::before {
      content: "";
      position: absolute;
      top: 8px;
      left: 0;
      right: 0;
      height: 2px;
      background: #00b3a4;
      opacity: 0.3;
    }

    /* 進度線 */
    .progress {
      position: absolute;
      top: 8px;
      left: 0;
      height: 2px;
      background: #00b3a4;
      transition: width 0.3s ease;
    }

    /* 節點 */
    .step {
      position: relative;
      flex: 0 0 auto; /* 只佔自身寬度，避免把圓點推離 0% / 100% */
      display: flex;
      justify-content: center; /* 圓點水平置中 */
      z-index: 1;

      .circle {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid #00b3a4;
        transition: background 0.3s ease;
      }

      /* ─── 標籤在圓點正上方 ─── */
      .label {
        position: absolute;
        top: -26px; /* 視覺調整：圓點上方 26px */
        left: 50%;
        transform: translateX(-50%);
        font-size: 14px;
        white-space: nowrap;
        color: #9e9e9e;
      }

      /* 狀態顏色 */
      &.completed .circle,
      &.active .circle {
        background: #00b3a4;
      }
      &.completed .label,
      &.active .label {
        color: #00b3a4;
      }
    }
  }

  .step-content {
    width: 100%;
    margin-top: 0.75rem;
    h2 {
      color: var(--Neutral-black, #1e1e1e);

      font-size: 20px;
      font-style: normal;
      font-weight: 600;
      letter-spacing: 0.15px;
      margin-bottom: 12px;
    }
    .gender-select {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;

      .size-btn {
        width: 48%;
        height: 54px;

        border-radius: 12px;
        background: #fff;
        font-size: 18px;
        color: #333;
        transition: border 0.2s, color 0.2s;
        border-radius: 8px;
        border: 1px solid var(--Neutral-300, #ccc);
        background: var(--Neutral-white, #fff);
        box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        margin-bottom: 0.75rem;
        &.selected,
        &:hover {
          border: 1px solid var(--Primary-default, #74bc1f);
          background: var(--Primary-100, #fcfff7);

          color: var(--Primary-default, #74bc1f);
        }
      }
    }
    .size-select {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      margin-bottom: 16px;

      .size-btn {
        width: 31%;
        height: 54px;

        border-radius: 12px;
        background: #fff;
        font-size: 18px;
        color: #333;
        transition: border 0.2s, color 0.2s;
        border-radius: 8px;
        border: 1px solid var(--Neutral-300, #ccc);
        background: var(--Neutral-white, #fff);
        box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        margin-bottom: 0.75rem;
        &.selected,
        &:hover {
          border: 1px solid var(--Primary-default, #74bc1f);
          background: var(--Primary-100, #fcfff7);

          color: var(--Primary-default, #74bc1f);
        }
      }
    }
    .size-table-wrap {
      border-radius: var(--Radius-r-8, 8px);
      background: var(--Primary-100, #fcfff7);

      padding: 16px;
      margin-bottom: 16px;
      .table-title {
        color: var(--Primary-default, #74bc1f);
        text-align: center;

        font-size: 20px;
        font-style: normal;
        font-weight: 700;

        letter-spacing: 0.1px;
      }
      .table-desc {
        color: var(--Neutral-500, #666);
        text-align: center;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.07px;
        margin-top: 0.35rem;
      }
      .size-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 8px;
        margin-top: 0.5rem;
        th,
        td {
          padding: 4px 8px;
          text-align: center;
          color: var(--Neutral-500, #666);
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.08px;
          padding: 0.35rem 0;
        }
        td {
          border-top: 1px solid #e0e0e0;
        }
      }
      .measure-title {
        color: #74bc1f;
        font-weight: bold;
        font-size: 15px;
        margin: 8px 0 2px 0;
        text-align: center;
      }
      .measure-desc {
        color: #666;
        font-size: 13px;
        text-align: center;
        margin-bottom: 8px;
      }
      .measure-img {
        display: block;
        margin: 0 auto;

        max-width: 100%;
      }
    }
    .formWrap {
      background-color: #fff;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .inputWrap {
      position: relative;
      svg {
        position: absolute;
        left: 4px;
        top: 50%;
        transform: translateY(-50%);
      }
      .inputStep3{
        color: var(--Primary-default, #74BC1F);
        padding-left: 32px;
      }
    }
    .form-group {
      margin-bottom: 16px;
      label {
        font-size: 15px;
        color: #333;
        margin-bottom: 4px;
        display: block;
      }
      .required {
        color: #f44336;
        margin-left: 2px;
      }
      label {
        color: var(--Neutral-500, #666);
        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.09px;
      }
      input {
        width: 100%;

        padding: 12px;
        font-size: 18px;
        margin-top: 4px;
        outline: none;
        border-radius: var(--Radius-r-8, 8px);
        border: 1px solid var(--Primary-default, #74bc1f);
        padding-left: 28px;
        &:focus {
          border-color: #74bc1f;
        }
        &::placeholder {
          color: var(--Neutral-300, #ccc);
        }
      }
      .error-msg {
        color: #f44336;
        font-size: 13px;
        margin-top: 4px;
        border-radius: var(--Radius-r-8, 8px);
        background: var(--warning-300-opacity-10, rgba(236, 79, 79, 0.1));
        padding: 8px 12px;
        margin-top: 4px;
        margin-top: 0.5rem;
      }
    }
    .measureWrap {
      background: var(--Primary-100, #fcfff7);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      width: 100%;
      .measure-img {
        max-width: 100%;
      }
    }
    .measure-title {
      color: var(--Primary-default, #74bc1f);
      text-align: center;
      font-size: 20px !important;
      font-style: normal;
      font-weight: 700;

      letter-spacing: 0.1px;
    }
    .measure-desc {
      color: var(--Neutral-500, #666);
      text-align: center;

      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      margin-top: 0.35rem;
      letter-spacing: 0.07px;
    }
    .img-container {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 120px;
      margin-bottom: 12px;
      
      // 調整 RaphaelLoading 在容器中的樣式
      :deep(.raphaelLoading) {
        position: absolute;
        width: 100%;
        height: 100%;
        min-height: 120px;
        background: rgba(217, 217, 217, 0.3);
        backdrop-filter: blur(2px);
        border-radius: 8px;
      }
    }



    .measure-img {
      display: block;
      margin: 0 auto;
      max-width: 160px;
      opacity: 0;
      transition: opacity 0.3s ease;
      
      &.loaded {
        opacity: 1;
      }
    }
    .btn-group {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
      width: 100%;
      max-width: 768px;
      padding: 1rem 1rem 3.125rem 1rem;
      background-color: $raphael-gray-100;
      z-index: 99;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      .prev-btn,
      .next-btn {
        flex: 1;
        margin: 0 4px;
        height: 44px;
        border-radius: 8px;
        font-size: 16px;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
      }
      .prev-btn {
        background: #f5f5f5;
        color: #666;
        &:hover {
          background: #e0e0e0;
        }
      }
      .next-btn {
        background: #74bc1f;
        color: #fff;
        transition: all 0.3s ease;
        &:disabled {
          background: #c8e6c9;
          color: #fff;
          cursor: not-allowed;
          transform: none;
        }
        &:not(:disabled):hover {
          background: #5a9a16;
          transform: translateY(-1px);
        }
        &:not(:disabled):active {
          transform: translateY(0);
        }
      }
    }
  }
  .selected-size-info {
    border-radius: 8px;
    background: #e6f4f1; // 或你想要的淡色
    padding: 12px 0 8px 0;
    margin-bottom: 12px;
    text-align: center;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    animation: slideInUp 0.3s ease-out;
    .selected-size-title {
      color: #74bc1f;
      font-weight: bold;
      font-size: 20px;
      margin-bottom: 4px;
      letter-spacing: 1px;
    }
    .selected-size-divider {
      height: 1px;
      background: #ccc;
      margin: 0 12px 8px 12px;
    }
    .selected-size-detail {
      display: flex;
      justify-content: space-between;
      align-items: stretch;
      margin: 0 12px;
      .size-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        color: var(--Neutral-500, #666);
        text-align: center;

        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 18px */
        letter-spacing: 0.09px;

        .label {
          margin-bottom: 0.25rem;
        }
      }
      .vertical-divider {
        width: 1px;
        background: #ccc;
        margin: 0 8px;
      }
    }
  }
}

// 動畫定義
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}



// Fade 過渡動畫
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
