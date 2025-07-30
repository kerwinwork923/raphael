<template>
  <div class="order-detail-wrap">
    <TitleMenu Text="訂單明細" positionType="absolute" link="/orderQuery" />

    <div v-if="loading" class="loading-wrap">
      <div class="loading-spinner"></div>
      <p>載入中...</p>
    </div>

    <div v-else-if="!orderData" class="error-wrap">
      <p>無法載入訂單資料</p>
    </div>

    <template v-else>
      <!-- 狀態條 -->
      <div class="order-step-bar">
        <!-- 預計送達時間 -->
        <div class="delivery-estimate" v-if="shouldShowDeliveryEstimate">
          {{ deliveryEstimateText }}
        </div>

        <div class="order-status-alert" v-if="currentStep >= 3">
          狀態如果為「製作中」即無法修改個人化資訊
        </div>
        <div class="step-bar">
          <!-- 進度線 -->
          <div
            class="progress"
            :style="{ width: getProgressWidth() + '%' }"
          ></div>
          <!-- 節點與標籤 -->
          <div
            v-for="(step, idx) in steps"
            :key="step"
            class="step"
            :class="{
              active: idx === currentStep,
              completed: isStepCompleted(idx),
            }"
          >
            <div class="circle"></div>
            <span class="label">{{ step }}</span>
            <!-- 顯示每個步驟的時間 -->
            <div class="order-date">
              <template v-if="orderDates[idx] && orderDates[idx].date">
                <div class="date">{{ orderDates[idx].date }}</div>
                <div class="time">{{ orderDates[idx].time }}</div>
              </template>
              <template v-else>
                <div class="date">&nbsp;</div>
                <div class="time">&nbsp;</div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="section" v-if="orderData && orderData.ItemList">
        <div class="section-title">個人化資訊</div>
        <div
          v-for="item in orderData.ItemList"
          :key="item.AID"
          class="personal-info-card"
        >
          <div class="info-title">{{ item.ProductName }}</div>
          <div class="info-content-wrap">
            <div class="infoContentInner">
              <div
                class="info-content"
                v-if="item.PdtSize && item.Height && item.Weight"
              >
                {{ item.PdtSize }}．{{ item.Height }}cm．{{ item.Weight }}kg
              </div>
              <div class="info-content" v-if="item.BodySize">
                身材比例 {{ item.BodySize }}cm
              </div>
              <div
                class="info-content"
                v-if="!item.PdtSize || !item.Height || !item.Weight"
              >
                尚未填寫個人化資訊
              </div>
            </div>
            <button
              class="edit-btn"
              v-if="currentStep < 3"
              @click="editPersonalInfo(item)"
            >
              修改
            </button>
          </div>
        </div>
      </div>

      <div class="section" v-if="orderData">
        <div class="section-title">寄送方式</div>
        <div class="section-content">
          {{ orderData.DeliverTypeName || "宅配" }}
        </div>
      </div>

      <div class="section" v-if="orderData">
        <div class="section-title">收件資訊</div>
        <div class="section-content">
          {{ orderData.RName }}．{{ orderData.RMobile }}<br />
          {{ orderData.Address }}
        </div>
      </div>

      <div class="section" v-if="orderData && orderData.ItemList">
        <div class="section-title">商品資訊</div>
        <div
          v-for="item in orderData.ItemList"
          :key="item.AID"
          class="product-card"
        >
          <img :src="item.DPicture" :alt="item.ProductName" />
          <div class="product-info">
            <div class="product-name">{{ item.ProductName }}</div>
            <div class="product-price">NT${{ item.Price }}</div>
          </div>
          <div class="product-info2">
            <div class="product-qty">x{{ item.Qty }}</div>
          </div>
        </div>
        <div class="order-total">
          <h4>運費 NT${{ orderData.freight || 0 }}</h4>
          <span>訂單金額 NT${{ orderData.TotalAmount }}</span>
        </div>
      </div>

      <div class="section" v-if="orderData">
        <div class="section-title-group">
          <div class="section-title">訂單編號</div>
          <div class="section-content">
            {{ orderData.SID }}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <mask id="path-1-inside-1_16072_164103" fill="white">
                <path
                  d="M6.33392 1.35777C6.07883 1.40825 5.88486 1.5544 5.77592 1.7776C5.70417 1.92374 5.70151 1.945 5.69354 2.39938L5.68291 2.87235L3.71395 2.87767L1.74233 2.88564L1.63073 2.94676C1.47661 3.02647 1.33578 3.17527 1.26669 3.32142C1.21355 3.43568 1.21089 3.49148 1.20292 4.28331C1.19495 5.10172 1.19495 5.12298 1.25075 5.19207C1.32781 5.29038 1.46332 5.29038 1.54038 5.19472C1.59353 5.12564 1.59618 5.09375 1.59618 4.33646C1.59618 3.59776 1.59884 3.54462 1.64933 3.46225C1.67856 3.41442 1.73967 3.3533 1.7875 3.32407C1.87253 3.27093 1.92833 3.27093 4.71305 3.27093L7.54825 3.27093V4.14248C7.54825 5.11235 7.55622 5.17081 7.71831 5.36212C7.76879 5.41792 7.87242 5.5003 7.94948 5.54281L8.09297 5.62253L9.91313 5.63847L9.91313 9.78632C9.91313 13.8677 9.91313 13.9368 9.85999 14.0458C9.83076 14.1042 9.76964 14.176 9.72182 14.2052C9.63679 14.2583 9.57301 14.2583 5.75466 14.2583C1.92301 14.2583 1.87519 14.2583 1.78484 14.2052C1.73701 14.176 1.67324 14.1095 1.64667 14.059C1.59884 13.9714 1.59618 13.8172 1.59618 9.96169C1.59618 7.76155 1.58821 5.93873 1.58024 5.91482C1.56961 5.89356 1.5271 5.8537 1.48458 5.83244C1.41815 5.7979 1.39158 5.7979 1.32781 5.82447C1.28264 5.84042 1.23746 5.87762 1.22418 5.90419C1.18698 5.97062 1.18964 13.9607 1.22418 14.0909C1.30389 14.3699 1.55633 14.5931 1.85393 14.641C1.98413 14.6649 3.10546 14.6702 5.86094 14.6649C10.1868 14.6569 9.82013 14.6755 10.0619 14.4417C10.2692 14.2397 10.2958 14.1467 10.3064 13.5994L10.317 13.129H10.7262C11.1009 13.129 11.1407 13.1237 11.1886 13.0759C11.2683 12.9962 11.2603 12.8553 11.1726 12.7863C11.1089 12.7358 11.0663 12.7305 10.7076 12.7305H10.3117V10.0999H11.7971C13.2585 10.0999 13.2824 10.0999 13.3515 10.0441C13.4472 9.96966 13.4472 9.83149 13.3515 9.75709C13.2824 9.70129 13.2585 9.70129 11.7971 9.70129H10.3117L10.3117 8.5587H11.813C13.2798 8.5587 13.3143 8.5587 13.3675 8.50556C13.4259 8.4471 13.4365 8.34613 13.394 8.26641C13.3409 8.16544 13.2452 8.16013 11.7572 8.16013H10.3117V7.04411H11.7971C13.2585 7.04411 13.2824 7.04411 13.3515 6.98831C13.4419 6.91657 13.4472 6.78371 13.3595 6.704L13.2984 6.64554L10.3117 6.64554V5.50295H11.813C13.2798 5.50295 13.3143 5.50295 13.3675 5.44981C13.4339 5.38338 13.4365 5.26115 13.3701 5.18144L13.3196 5.11766L10.0593 5.10172L7.82459 2.87235H6.0868V2.46846C6.0868 2.01143 6.12135 1.89186 6.27812 1.7962C6.36315 1.74306 6.42426 1.74306 9.1957 1.74306L12.0256 1.74306L12.0389 2.65978C12.0522 3.53665 12.0548 3.58182 12.1106 3.68279C12.1824 3.81831 12.3365 3.96445 12.4906 4.04417C12.6075 4.10794 12.6234 4.10794 13.5083 4.11591L14.4038 4.12388V8.28236C14.4038 12.7995 14.4144 12.5046 14.2576 12.6507L14.1859 12.7172L13.0486 12.7305C11.999 12.7437 11.9087 12.7464 11.8582 12.7916C11.829 12.8181 11.7997 12.8607 11.7918 12.8872C11.7732 12.9643 11.8422 13.0998 11.9113 13.1158C11.9459 13.1237 12.4879 13.129 13.115 13.1237C14.2417 13.1158 14.2603 13.1158 14.3692 13.0546C14.5233 12.9749 14.6642 12.8261 14.7332 12.68L14.789 12.5577L14.8023 3.84488L13.5535 2.59335L12.3046 1.34448L9.37638 1.34182C7.76348 1.33917 6.39504 1.34714 6.33392 1.35777ZM13.4312 3.71734C12.666 3.72531 12.6155 3.71468 12.4986 3.5393C12.4401 3.45162 12.4374 3.43302 12.4374 2.74215V2.03535L14.1115 3.70936L13.4312 3.71734ZM8.92732 5.23192C7.89368 5.24255 7.94682 5.29304 7.94682 4.26737V3.54993L9.62084 5.22395L8.92732 5.23192Z"
                />
                <path
                  d="M2.6378 6.70665C2.55543 6.79433 2.56074 6.91922 2.64843 6.98831C2.72017 7.04411 2.72283 7.04411 5.75998 7.04411H8.79978L8.86356 6.97768C8.90076 6.94314 8.92998 6.88202 8.92998 6.84482C8.92998 6.80762 8.90076 6.74651 8.86356 6.71196L8.79978 6.64553L2.6936 6.64553L2.6378 6.70665Z"
                />
                <path
                  d="M2.72017 8.17872C2.58731 8.20529 2.53417 8.40724 2.63249 8.50555C2.68563 8.5587 2.72017 8.5587 5.75466 8.5587H8.82104L8.87684 8.50024C8.97516 8.39395 8.9353 8.23984 8.79447 8.18935C8.73335 8.16809 7.84851 8.16012 5.74403 8.16278C4.11253 8.16543 2.75206 8.17341 2.72017 8.17872Z"
                />
                <path
                  d="M2.64842 9.75708C2.55276 9.83148 2.55276 9.96966 2.64842 10.0441C2.72016 10.0999 2.72282 10.0999 5.75997 10.0999L8.79978 10.0999L8.86355 10.0334C8.90075 9.99888 8.92998 9.93777 8.92998 9.90057C8.92998 9.86337 8.90075 9.80225 8.86355 9.76771L8.79978 9.70128L5.75997 9.70128C2.72282 9.70128 2.72016 9.70128 2.64842 9.75708Z"
                />
                <path
                  d="M2.69626 11.2531C2.56872 11.3089 2.53683 11.4656 2.63249 11.5613C2.68563 11.6144 2.72017 11.6144 5.75466 11.6144L8.82104 11.6144L8.87684 11.556C8.97516 11.4497 8.9353 11.2956 8.79447 11.2451C8.65895 11.1973 2.8052 11.2052 2.69626 11.2531Z"
                />
              </mask>
              <path
                d="M6.33392 1.35777C6.07883 1.40825 5.88486 1.5544 5.77592 1.7776C5.70417 1.92374 5.70151 1.945 5.69354 2.39938L5.68291 2.87235L3.71395 2.87767L1.74233 2.88564L1.63073 2.94676C1.47661 3.02647 1.33578 3.17527 1.26669 3.32142C1.21355 3.43568 1.21089 3.49148 1.20292 4.28331C1.19495 5.10172 1.19495 5.12298 1.25075 5.19207C1.32781 5.29038 1.46332 5.29038 1.54038 5.19472C1.59353 5.12564 1.59618 5.09375 1.59618 4.33646C1.59618 3.59776 1.59884 3.54462 1.64933 3.46225C1.67856 3.41442 1.73967 3.3533 1.7875 3.32407C1.87253 3.27093 1.92833 3.27093 4.71305 3.27093L7.54825 3.27093V4.14248C7.54825 5.11235 7.55622 5.17081 7.71831 5.36212C7.76879 5.41792 7.87242 5.5003 7.94948 5.54281L8.09297 5.62253L9.91313 5.63847L9.91313 9.78632C9.91313 13.8677 9.91313 13.9368 9.85999 14.0458C9.83076 14.1042 9.76964 14.176 9.72182 14.2052C9.63679 14.2583 9.57301 14.2583 5.75466 14.2583C1.92301 14.2583 1.87519 14.2583 1.78484 14.2052C1.73701 14.176 1.67324 14.1095 1.64667 14.059C1.59884 13.9714 1.59618 13.8172 1.59618 9.96169C1.59618 7.76155 1.58821 5.93873 1.58024 5.91482C1.56961 5.89356 1.5271 5.8537 1.48458 5.83244C1.41815 5.7979 1.39158 5.7979 1.32781 5.82447C1.28264 5.84042 1.23746 5.87762 1.22418 5.90419C1.18698 5.97062 1.18964 13.9607 1.22418 14.0909C1.30389 14.3699 1.55633 14.5931 1.85393 14.641C1.98413 14.6649 3.10546 14.6702 5.86094 14.6649C10.1868 14.6569 9.82013 14.6755 10.0619 14.4417C10.2692 14.2397 10.2958 14.1467 10.3064 13.5994L10.317 13.129H10.7262C11.1009 13.129 11.1407 13.1237 11.1886 13.0759C11.2683 12.9962 11.2603 12.8553 11.1726 12.7863C11.1089 12.7358 11.0663 12.7305 10.7076 12.7305H10.3117V10.0999H11.7971C13.2585 10.0999 13.2824 10.0999 13.3515 10.0441C13.4472 9.96966 13.4472 9.83149 13.3515 9.75709C13.2824 9.70129 13.2585 9.70129 11.7971 9.70129H10.3117L10.3117 8.5587H11.813C13.2798 8.5587 13.3143 8.5587 13.3675 8.50556C13.4259 8.4471 13.4365 8.34613 13.394 8.26641C13.3409 8.16544 13.2452 8.16013 11.7572 8.16013H10.3117V7.04411H11.7971C13.2585 7.04411 13.2824 7.04411 13.3515 6.98831C13.4419 6.91657 13.4472 6.78371 13.3595 6.704L13.2984 6.64554L10.3117 6.64554V5.50295H11.813C13.2798 5.50295 13.3143 5.50295 13.3675 5.44981C13.4339 5.38338 13.4365 5.26115 13.3701 5.18144L13.3196 5.11766L10.0593 5.10172L7.82459 2.87235H6.0868V2.46846C6.0868 2.01143 6.12135 1.89186 6.27812 1.7962C6.36315 1.74306 6.42426 1.74306 9.1957 1.74306L12.0256 1.74306L12.0389 2.65978C12.0522 3.53665 12.0548 3.58182 12.1106 3.68279C12.1824 3.81831 12.3365 3.96445 12.4906 4.04417C12.6075 4.10794 12.6234 4.10794 13.5083 4.11591L14.4038 4.12388V8.28236C14.4038 12.7995 14.4144 12.5046 14.2576 12.6507L14.1859 12.7172L13.0486 12.7305C11.999 12.7437 11.9087 12.7464 11.8582 12.7916C11.829 12.8181 11.7997 12.8607 11.7918 12.8872C11.7732 12.9643 11.8422 13.0998 11.9113 13.1158C11.9459 13.1237 12.4879 13.129 13.115 13.1237C14.2417 13.1158 14.2603 13.1158 14.3692 13.0546C14.5233 12.9749 14.6642 12.8261 14.7332 12.68L14.789 12.5577L14.8023 3.84488L13.5535 2.59335L12.3046 1.34448L9.37638 1.34182C7.76348 1.33917 6.39504 1.34714 6.33392 1.35777ZM13.4312 3.71734C12.666 3.72531 12.6155 3.71468 12.4986 3.5393C12.4401 3.45162 12.4374 3.43302 12.4374 2.74215V2.03535L14.1115 3.70936L13.4312 3.71734ZM8.92732 5.23192C7.89368 5.24255 7.94682 5.29304 7.94682 4.26737V3.54993L9.62084 5.22395L8.92732 5.23192Z"
                fill="#666666"
              />
              <path
                d="M2.6378 6.70665C2.55543 6.79433 2.56074 6.91922 2.64843 6.98831C2.72017 7.04411 2.72283 7.04411 5.75998 7.04411H8.79978L8.86356 6.97768C8.90076 6.94314 8.92998 6.88202 8.92998 6.84482C8.92998 6.80762 8.90076 6.74651 8.86356 6.71196L8.79978 6.64553L2.6936 6.64553L2.6378 6.70665Z"
                fill="#666666"
              />
              <path
                d="M2.72017 8.17872C2.58731 8.20529 2.53417 8.40724 2.63249 8.50555C2.68563 8.5587 2.72017 8.5587 5.75466 8.5587H8.82104L8.87684 8.50024C8.97516 8.39395 8.9353 8.23984 8.79447 8.18935C8.73335 8.16809 7.84851 8.16012 5.74403 8.16278C4.11253 8.16543 2.75206 8.17341 2.72017 8.17872Z"
                fill="#666666"
              />
              <path
                d="M2.64842 9.75708C2.55276 9.83148 2.55276 9.96966 2.64842 10.0441C2.72016 10.0999 2.72282 10.0999 5.75997 10.0999L8.79978 10.0999L8.86355 10.0334C8.90075 9.99888 8.92998 9.93777 8.92998 9.90057C8.92998 9.86337 8.90075 9.80225 8.86355 9.76771L8.79978 9.70128L5.75997 9.70128C2.72282 9.70128 2.72016 9.70128 2.64842 9.75708Z"
                fill="#666666"
              />
              <path
                d="M2.69626 11.2531C2.56872 11.3089 2.53683 11.4656 2.63249 11.5613C2.68563 11.6144 2.72017 11.6144 5.75466 11.6144L8.82104 11.6144L8.87684 11.556C8.97516 11.4497 8.9353 11.2956 8.79447 11.2451C8.65895 11.1973 2.8052 11.2052 2.69626 11.2531Z"
                fill="#666666"
              />
              <path
                d="M6.33392 1.35777C6.07883 1.40825 5.88486 1.5544 5.77592 1.7776C5.70417 1.92374 5.70151 1.945 5.69354 2.39938L5.68291 2.87235L3.71395 2.87767L1.74233 2.88564L1.63073 2.94676C1.47661 3.02647 1.33578 3.17527 1.26669 3.32142C1.21355 3.43568 1.21089 3.49148 1.20292 4.28331C1.19495 5.10172 1.19495 5.12298 1.25075 5.19207C1.32781 5.29038 1.46332 5.29038 1.54038 5.19472C1.59353 5.12564 1.59618 5.09375 1.59618 4.33646C1.59618 3.59776 1.59884 3.54462 1.64933 3.46225C1.67856 3.41442 1.73967 3.3533 1.7875 3.32407C1.87253 3.27093 1.92833 3.27093 4.71305 3.27093L7.54825 3.27093V4.14248C7.54825 5.11235 7.55622 5.17081 7.71831 5.36212C7.76879 5.41792 7.87242 5.5003 7.94948 5.54281L8.09297 5.62253L9.91313 5.63847L9.91313 9.78632C9.91313 13.8677 9.91313 13.9368 9.85999 14.0458C9.83076 14.1042 9.76964 14.176 9.72182 14.2052C9.63679 14.2583 9.57301 14.2583 5.75466 14.2583C1.92301 14.2583 1.87519 14.2583 1.78484 14.2052C1.73701 14.176 1.67324 14.1095 1.64667 14.059C1.59884 13.9714 1.59618 13.8172 1.59618 9.96169C1.59618 7.76155 1.58821 5.93873 1.58024 5.91482C1.56961 5.89356 1.5271 5.8537 1.48458 5.83244C1.41815 5.7979 1.39158 5.7979 1.32781 5.82447C1.28264 5.84042 1.23746 5.87762 1.22418 5.90419C1.18698 5.97062 1.18964 13.9607 1.22418 14.0909C1.30389 14.3699 1.55633 14.5931 1.85393 14.641C1.98413 14.6649 3.10546 14.6702 5.86094 14.6649C10.1868 14.6569 9.82013 14.6755 10.0619 14.4417C10.2692 14.2397 10.2958 14.1467 10.3064 13.5994L10.317 13.129H10.7262C11.1009 13.129 11.1407 13.1237 11.1886 13.0759C11.2683 12.9962 11.2603 12.8553 11.1726 12.7863C11.1089 12.7358 11.0663 12.7305 10.7076 12.7305H10.3117V10.0999H11.7971C13.2585 10.0999 13.2824 10.0999 13.3515 10.0441C13.4472 9.96966 13.4472 9.83149 13.3515 9.75709C13.2824 9.70129 13.2585 9.70129 11.7971 9.70129H10.3117L10.3117 8.5587H11.813C13.2798 8.5587 13.3143 8.5587 13.3675 8.50556C13.4259 8.4471 13.4365 8.34613 13.394 8.26641C13.3409 8.16544 13.2452 8.16013 11.7572 8.16013H10.3117V7.04411H11.7971C13.2585 7.04411 13.2824 7.04411 13.3515 6.98831C13.4419 6.91657 13.4472 6.78371 13.3595 6.704L13.2984 6.64554L10.3117 6.64554V5.50295H11.813C13.2798 5.50295 13.3143 5.50295 13.3675 5.44981C13.4339 5.38338 13.4365 5.26115 13.3701 5.18144L13.3196 5.11766L10.0593 5.10172L7.82459 2.87235H6.0868V2.46846C6.0868 2.01143 6.12135 1.89186 6.27812 1.7962C6.36315 1.74306 6.42426 1.74306 9.1957 1.74306L12.0256 1.74306L12.0389 2.65978C12.0522 3.53665 12.0548 3.58182 12.1106 3.68279C12.1824 3.81831 12.3365 3.96445 12.4906 4.04417C12.6075 4.10794 12.6234 4.10794 13.5083 4.11591L14.4038 4.12388V8.28236C14.4038 12.7995 14.4144 12.5046 14.2576 12.6507L14.1859 12.7172L13.0486 12.7305C11.999 12.7437 11.9087 12.7464 11.8582 12.7916C11.829 12.8181 11.7997 12.8607 11.7918 12.8872C11.7732 12.9643 11.8422 13.0998 11.9113 13.1158C11.9459 13.1237 12.4879 13.129 13.115 13.1237C14.2417 13.1158 14.2603 13.1158 14.3692 13.0546C14.5233 12.9749 14.6642 12.8261 14.7332 12.68L14.789 12.5577L14.8023 3.84488L13.5535 2.59335L12.3046 1.34448L9.37638 1.34182C7.76348 1.33917 6.39504 1.34714 6.33392 1.35777ZM13.4312 3.71734C12.666 3.72531 12.6155 3.71468 12.4986 3.5393C12.4401 3.45162 12.4374 3.43302 12.4374 2.74215V2.03535L14.1115 3.70936L13.4312 3.71734ZM8.92732 5.23192C7.89368 5.24255 7.94682 5.29304 7.94682 4.26737V3.54993L9.62084 5.22395L8.92732 5.23192Z"
                stroke="#666666"
                stroke-width="0.266667"
                mask="url(#path-1-inside-1_16072_164103)"
              />
              <path
                d="M2.6378 6.70665C2.55543 6.79433 2.56074 6.91922 2.64843 6.98831C2.72017 7.04411 2.72283 7.04411 5.75998 7.04411H8.79978L8.86356 6.97768C8.90076 6.94314 8.92998 6.88202 8.92998 6.84482C8.92998 6.80762 8.90076 6.74651 8.86356 6.71196L8.79978 6.64553L2.6936 6.64553L2.6378 6.70665Z"
                stroke="#666666"
                stroke-width="0.266667"
                mask="url(#path-1-inside-1_16072_164103)"
              />
              <path
                d="M2.72017 8.17872C2.58731 8.20529 2.53417 8.40724 2.63249 8.50555C2.68563 8.5587 2.72017 8.5587 5.75466 8.5587H8.82104L8.87684 8.50024C8.97516 8.39395 8.9353 8.23984 8.79447 8.18935C8.73335 8.16809 7.84851 8.16012 5.74403 8.16278C4.11253 8.16543 2.75206 8.17341 2.72017 8.17872Z"
                stroke="#666666"
                stroke-width="0.266667"
                mask="url(#path-1-inside-1_16072_164103)"
              />
              <path
                d="M2.64842 9.75708C2.55276 9.83148 2.55276 9.96966 2.64842 10.0441C2.72016 10.0999 2.72282 10.0999 5.75997 10.0999L8.79978 10.0999L8.86355 10.0334C8.90075 9.99888 8.92998 9.93777 8.92998 9.90057C8.92998 9.86337 8.90075 9.80225 8.86355 9.76771L8.79978 9.70128L5.75997 9.70128C2.72282 9.70128 2.72016 9.70128 2.64842 9.75708Z"
                stroke="#666666"
                stroke-width="0.266667"
                mask="url(#path-1-inside-1_16072_164103)"
              />
              <path
                d="M2.69626 11.2531C2.56872 11.3089 2.53683 11.4656 2.63249 11.5613C2.68563 11.6144 2.72017 11.6144 5.75466 11.6144L8.82104 11.6144L8.87684 11.556C8.97516 11.4497 8.9353 11.2956 8.79447 11.2451C8.65895 11.1973 2.8052 11.2052 2.69626 11.2531Z"
                stroke="#666666"
                stroke-width="0.266667"
                mask="url(#path-1-inside-1_16072_164103)"
              />
            </svg>
          </div>
        </div>

        <div class="section-content">
          <div class="section-content-between">
            <span>付款方式</span>
            <span>{{ orderData.PayTypeName || "線上付款" }}</span>
          </div>
          <div class="section-content-between">
            <span>訂單成立時間</span>
            <span>{{ orderData.CheckTime }}</span>
          </div>
          <div class="section-content-between">
            <span>發票類型</span>
            <span>{{ orderData.InvoiceIDName || "電子發票" }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">退換貨政策</div>
        <div class="section-content">
          <ul class="section-content-list">
            <li>本商品適用7天鑑賞期</li>
            <li>商品需保持全新狀態（未經使用、無污損、包裝完整含所有配件）</li>
          </ul>
        </div>
        <div class="section-error-return">已超過7天鑑賞期</div>
        <div class="sctionHR"></div>
        <div class="returnGoodsGroup" @click="router.push('/returnGoods')">
          退貨申請
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <mask id="path-1-inside-1_16072_164123" fill="white">
              <path
                d="M5.32602 3.00217L10.198 8.00017L5.32602 12.9982C5.2388 13.0875 5.18996 13.2073 5.18996 13.3322C5.18996 13.457 5.2388 13.5769 5.32602 13.6662C5.36838 13.7094 5.41895 13.7438 5.47475 13.7672C5.53056 13.7907 5.59048 13.8027 5.65102 13.8027C5.71155 13.8027 5.77147 13.7907 5.82728 13.7672C5.88309 13.7438 5.93365 13.7094 5.97602 13.6662L11.16 8.34917C11.251 8.25579 11.302 8.13056 11.302 8.00017C11.302 7.86977 11.251 7.74454 11.16 7.65117L5.97702 2.33417C5.93462 2.29062 5.88393 2.25601 5.82794 2.23238C5.77195 2.20875 5.71179 2.19658 5.65102 2.19658C5.59024 2.19658 5.53009 2.20875 5.47409 2.23238C5.4181 2.25601 5.36741 2.29062 5.32502 2.33417C5.2378 2.42346 5.18896 2.54334 5.18896 2.66817C5.18896 2.79299 5.2378 2.91287 5.32502 3.00217H5.32602Z"
              />
            </mask>
            <path
              d="M5.32602 3.00217L10.198 8.00017L5.32602 12.9982C5.2388 13.0875 5.18996 13.2073 5.18996 13.3322C5.18996 13.457 5.2388 13.5769 5.32602 13.6662C5.36838 13.7094 5.41895 13.7438 5.47475 13.7672C5.53056 13.7907 5.59048 13.8027 5.65102 13.8027C5.71155 13.8027 5.77147 13.7907 5.82728 13.7672C5.88309 13.7438 5.93365 13.7094 5.97602 13.6662L11.16 8.34917C11.251 8.25579 11.302 8.13056 11.302 8.00017C11.302 7.86977 11.251 7.74454 11.16 7.65117L5.97702 2.33417C5.93462 2.29062 5.88393 2.25601 5.82794 2.23238C5.77195 2.20875 5.71179 2.19658 5.65102 2.19658C5.59024 2.19658 5.53009 2.20875 5.47409 2.23238C5.4181 2.25601 5.36741 2.29062 5.32502 2.33417C5.2378 2.42346 5.18896 2.54334 5.18896 2.66817C5.18896 2.79299 5.2378 2.91287 5.32502 3.00217H5.32602Z"
              fill="#EC4F4F"
            />
            <path
              d="M5.32602 3.00217L6.04209 2.30414L5.74773 2.00217H5.32602V3.00217ZM10.198 8.00017L10.9141 8.69819L11.5945 8.00017L10.9141 7.30214L10.198 8.00017ZM5.32602 12.9982L6.04139 13.6969L6.04209 13.6962L5.32602 12.9982ZM5.18996 13.3322H4.18996H5.18996ZM5.32602 13.6662L4.61065 14.3649L4.61173 14.366L5.32602 13.6662ZM5.65102 13.8027V12.8027V13.8027ZM5.97602 13.6662L6.69031 14.366L6.69202 14.3643L5.97602 13.6662ZM11.16 8.34917L11.876 9.04726L11.8761 9.04717L11.16 8.34917ZM11.16 7.65117L11.8761 6.95317L11.8761 6.95314L11.16 7.65117ZM5.97702 2.33417L5.26053 3.03177L5.26095 3.03219L5.97702 2.33417ZM5.32502 2.33417L6.04039 3.03291L6.0415 3.03177L5.32502 2.33417ZM5.18896 2.66817H6.18896H5.18896ZM5.32502 3.00217L4.60965 3.70091L4.9039 4.00217H5.32502L5.32502 3.00217ZM5.32602 3.00217L4.60994 3.70019L9.48194 8.69819L10.198 8.00017L10.9141 7.30214L6.04209 2.30414L5.32602 3.00217ZM10.198 8.00017L9.48194 7.30214L4.60994 12.3001L5.32602 12.9982L6.04209 13.6962L10.9141 8.69819L10.198 8.00017ZM5.32602 12.9982L4.61065 12.2994C4.34095 12.5755 4.18996 12.9462 4.18996 13.3322H5.18996H6.18996C6.18996 13.4685 6.13664 13.5994 6.04139 13.6969L5.32602 12.9982ZM5.18996 13.3322H4.18996C4.18996 13.7181 4.34095 14.0888 4.61065 14.3649L5.32602 13.6662L6.04139 12.9674C6.13664 13.0649 6.18996 13.1958 6.18996 13.3322H5.18996ZM5.32602 13.6662L4.61173 14.366C4.7472 14.5043 4.9089 14.6141 5.08736 14.6891L5.47475 13.7672L5.86215 12.8453C5.92899 12.8734 5.98956 12.9145 6.0403 12.9663L5.32602 13.6662ZM5.47475 13.7672L5.08736 14.6891C5.26582 14.7641 5.45745 14.8027 5.65102 14.8027V13.8027V12.8027C5.72352 12.8027 5.7953 12.8172 5.86215 12.8453L5.47475 13.7672ZM5.65102 13.8027V14.8027C5.84459 14.8027 6.03622 14.7641 6.21467 14.6891L5.82728 13.7672L5.43989 12.8453C5.50673 12.8172 5.57851 12.8027 5.65102 12.8027V13.8027ZM5.82728 13.7672L6.21467 14.6891C6.39313 14.6141 6.55483 14.5043 6.6903 14.366L5.97602 13.6662L5.26173 12.9663C5.31247 12.9145 5.37304 12.8734 5.43989 12.8453L5.82728 13.7672ZM5.97602 13.6662L6.69202 14.3643L11.876 9.04726L11.16 8.34917L10.444 7.65107L5.26001 12.9681L5.97602 13.6662ZM11.16 8.34917L11.8761 9.04717C12.1492 8.76705 12.302 8.39135 12.302 8.00017H11.302H10.302C10.302 7.86977 10.3529 7.74454 10.4439 7.65117L11.16 8.34917ZM11.302 8.00017H12.302C12.302 7.60899 12.1492 7.23329 11.8761 6.95317L11.16 7.65117L10.4439 8.34917C10.3529 8.2558 10.302 8.13056 10.302 8.00017H11.302ZM11.16 7.65117L11.8761 6.95314L6.69309 1.63614L5.97702 2.33417L5.26095 3.03219L10.4439 8.34919L11.16 7.65117ZM5.97702 2.33417L6.6935 1.63656C6.55793 1.49732 6.39583 1.38665 6.21678 1.31108L5.82794 2.23238L5.4391 3.15369C5.37203 3.12538 5.31132 3.08393 5.26053 3.03177L5.97702 2.33417ZM5.82794 2.23238L6.21678 1.31108C6.03773 1.23551 5.84535 1.19658 5.65102 1.19658V2.19658L5.65102 3.19658C5.57823 3.19658 5.50617 3.182 5.4391 3.15369L5.82794 2.23238ZM5.65102 2.19658V1.19658C5.45668 1.19658 5.26431 1.23551 5.08525 1.31108L5.47409 2.23238L5.86294 3.15369C5.79586 3.182 5.7238 3.19658 5.65102 3.19658L5.65102 2.19658ZM5.47409 2.23238L5.08525 1.31108C4.9062 1.38665 4.74411 1.49732 4.60853 1.63656L5.32502 2.33417L6.0415 3.03177C5.99072 3.08393 5.93 3.12538 5.86294 3.15369L5.47409 2.23238ZM5.32502 2.33417L4.60965 1.63542C4.33995 1.91154 4.18896 2.2822 4.18896 2.66817H5.18896H6.18896C6.18896 2.80448 6.13564 2.93539 6.04039 3.03291L5.32502 2.33417ZM5.18896 2.66817H4.18896C4.18896 3.05414 4.33995 3.4248 4.60965 3.70091L5.32502 3.00217L6.04039 2.30342C6.13564 2.40094 6.18896 2.53185 6.18896 2.66817H5.18896ZM5.32502 3.00217L5.32502 4.00217H5.32602L5.32602 3.00217V2.00217H5.32502V3.00217Z"
              fill="#EC4F4F"
              mask="url(#path-1-inside-1_16072_164123)"
            />
          </svg>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import TitleMenu from "@/components/TitleMenu.vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const orderData = ref(null);
const loading = ref(true);

const steps = [
  "收到訂單",
  "個人化資訊",
  "待製作",
  "製作中",
  "待出貨",
  "已出貨",
];

// 根據訂單狀態決定 currentStep
const currentStep = ref(1);

// 根據後端提供的實際時間計算日期
const orderDates = computed(() => {
  if (!orderData.value) {
    return [
      { date: "", time: "" }, // 收到訂單
      { date: "", time: "" }, // 個人化資訊
      { date: "", time: "" }, // 待製作
      { date: "", time: "" }, // 製作中
      { date: "", time: "" }, // 待出貨
      { date: "", time: "" }, // 已出貨
    ];
  }

  // 格式化時間的輔助函數
  const formatTime = (timeStr) => {
    if (!timeStr) return { date: "", time: "" };
    // 將 "2025/07/16 10:34" 格式轉換為分開的日期和時間
    const date = new Date(timeStr.replace(/\//g, "-"));
    const dateStr = date.toLocaleDateString("zh-TW", {
      month: "2-digit",
      day: "2-digit",
    });
    const timeStrFormatted = date.toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 使用24小時制
    });
    return { date: dateStr, time: timeStrFormatted };
  };

  // 使用後端提供的實際時間
  const dates = [
    formatTime(orderData.value.CheckTime), // 收到訂單 (A0State 或 CheckTime)
    formatTime(orderData.value.A1State), // 個人化資訊
    formatTime(orderData.value.A3State), // 待製作
    formatTime(orderData.value.A4State), // 製作中
    formatTime(orderData.value.A5State), // 待出貨
    formatTime(orderData.value.A6State), // 已出貨
  ];

  return dates;
});

// 獲取訂單詳細資料
const fetchOrderDetail = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const SID = route.query.SID;

    if (!SID) {
      console.error("缺少訂單編號");
      return;
    }

    const { data } = await useFetch(
      "https://23700999.com:8081/HMA/api/fr/maSaleSingle",
      {
        method: "POST",
        body: {
          MID: userData.MID,
          Token: userData.Token,
          MAID: userData.MAID,
          Mobile: userData.Mobile,
          Lang: "zhtw",
          SALEID: SID,
        },
      }
    );

    if (data.value?.Result === "OK") {
      orderData.value = data.value.Sale || null;
      console.log("訂單詳細資料:", orderData.value);

      // 根據訂單狀態設定進度條
      updateOrderProgress();
    } else {
      console.error("獲取訂單詳細資料失敗");
    }
  } catch (error) {
    console.error("獲取訂單詳細資料失敗：", error);
  } finally {
    loading.value = false;
  }
};

// 更新訂單進度
const updateOrderProgress = () => {
  if (!orderData.value) return;

  // 檢查是否已付款
  const isPaid =
    orderData.value.RtnCode === "1" &&
    (orderData.value.RtnMsg === "paid" ||
      orderData.value.RtnMsg === "交易成功" ||
      orderData.value.RtnMsg === "SUCCESS");

  if (!isPaid) {
    currentStep.value = 0; // 收到訂單
    return;
  }

  // 根據後端提供的狀態來決定進度
  const state = orderData.value.State;

  switch (state) {
    case "0": // 未付款
      currentStep.value = 0;
      break;
    case "1": // 個人化資訊
      currentStep.value = 1;
      break;
    case "3": // 待製作
      currentStep.value = 2;
      break;
    case "4": // 製作中
      currentStep.value = 3;
      break;
    case "5": // 待出貨
      currentStep.value = 4;
      break;
    case "6": // 已出貨
      currentStep.value = 5;
      break;
    default:
      // 如果沒有明確狀態，檢查個人化資料是否完整
      const hasUnfilledItems =
        orderData.value.ItemList &&
        orderData.value.ItemList.some((item) => {
          return (
            !item.PdtSize || !item.Weight || !item.BodySize || !item.Height
          );
        });

      if (hasUnfilledItems) {
        currentStep.value = 1; // 個人化資訊
      } else {
        currentStep.value = 2; // 待製作
      }
      break;
  }
};

// 判斷步驟是否已完成
const isStepCompleted = (stepIndex) => {
  if (!orderData.value) return false;

  // 如果有時間記錄，表示該步驟已完成
  if (orderDates.value[stepIndex] && orderDates.value[stepIndex].date) {
    return true;
  }

  // 如果當前步驟大於該步驟，也表示已完成
  return stepIndex < currentStep.value;
};

// 計算進度條寬度
const getProgressWidth = () => {
  if (!orderData.value) return 0;

  // 計算已完成步驟的數量
  let completedSteps = 0;
  const totalSteps = steps.length;

  // 檢查每個步驟是否有時間記錄
  for (let i = 0; i < totalSteps; i++) {
    if (orderDates.value[i] && orderDates.value[i].date) {
      completedSteps = i + 1;
    }
  }

  // 如果當前步驟大於已完成步驟，使用當前步驟
  if (currentStep.value > completedSteps) {
    completedSteps = currentStep.value + 1;
  }

  // 計算百分比，確保不超過100%
  const percentage = Math.min((completedSteps / (totalSteps - 1)) * 100, 100);
  return percentage;
};

// 計算工作日的函數
const addWorkDays = (date, workDays) => {
  const result = new Date(date);
  let addedDays = 0;

  while (addedDays < workDays) {
    result.setDate(result.getDate() + 1);
    // 跳過週末（週六=6, 週日=0）
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }

  return result;
};

// 格式化日期為 "月日" 格式
const formatDate = (date) => {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 判斷是否應該顯示預計送達時間
const shouldShowDeliveryEstimate = computed(() => {
  if (!orderData.value) return false;

  // 檢查是否已付款
  const isPaid =
    orderData.value.RtnCode === "1" &&
    (orderData.value.RtnMsg === "paid" ||
      orderData.value.RtnMsg === "交易成功" ||
      orderData.value.RtnMsg === "SUCCESS");

  if (!isPaid) return false;

  // 檢查是否所有商品都已填寫個人化資料
  const allItemsFilled =
    orderData.value.ItemList &&
    orderData.value.ItemList.every((item) => {
      return item.PdtSize && item.Weight && item.BodySize && item.Height;
    });

  return allItemsFilled;
});

// 計算預計送達時間文字
const deliveryEstimateText = computed(() => {
  if (!orderData.value || !shouldShowDeliveryEstimate.value) return "";

  // 使用 A1State 作為個人化資訊完成時間
  let personalInfoTime = new Date(0);

  if (orderData.value.A1State) {
    // 解析 A1State 格式：2025/07/16 17:25 -> 2025/07/16 17:25
    personalInfoTime = new Date(orderData.value.A1State.replace(/\//g, "-"));
  } else {
    // 如果沒有 A1State，則使用最晚填寫個人化資料的時間作為備用
    personalInfoTime = orderData.value.ItemList.reduce((latest, item) => {
      if (item.PdtSize && item.Weight && item.BodySize && item.Height) {
        // 解析 CheckTime 格式：20250714155739 -> 2025/07/14 15:57:39
        const year = item.CheckTime.substring(0, 4);
        const month = item.CheckTime.substring(4, 6);
        const day = item.CheckTime.substring(6, 8);
        const hour = item.CheckTime.substring(8, 10);
        const minute = item.CheckTime.substring(10, 12);
        const second = item.CheckTime.substring(12, 14);

        const itemCheckTime = new Date(
          `${year}/${month}/${day} ${hour}:${minute}:${second}`
        );
        return itemCheckTime > latest ? itemCheckTime : latest;
      }
      return latest;
    }, new Date(0));
  }

  // 計算預計送達日（個人化資訊完成時間+7個工作天）
  const estimateEndDate = addWorkDays(personalInfoTime, 7);

  // 計算開始日期（通常為完成後的下一個工作日）
  const estimateStartDate = addWorkDays(personalInfoTime, 1);

  const startDateStr = formatDate(estimateStartDate);
  const endDateStr = formatDate(estimateEndDate);

  return `預計送達時間 ${startDateStr}~${endDateStr}，實際依物流為主`;
});

// 編輯個人化資訊
const editPersonalInfo = (item) => {
  // 跳轉到個人化資訊頁面
  router.push({
    path: "/personalizedInfo",
    query: {
      saleId: orderData.value.SID,
      productId: item.ProductID,
      aid: item.AID,
      csAid: orderData.value.CSAID || "",
    },
  });
};

onMounted(() => {
  fetchOrderDetail();
});
</script>

<style lang="scss" scoped>
.order-detail-wrap {
  background: #f6f6f6;
  min-height: 100vh;
  padding: 42px 2.5% 72px;

  .loading-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #74bc1f;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    p {
      color: #666;
      font-size: 16px;
    }
  }

  .error-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;

    p {
      color: #ec4f4f;
      font-size: 16px;
      font-weight: 700;
    }
  }

  .delivery-estimate {
    background-color: #ddeacf;
    color: #65a31b;
    border-radius: 8px;
    padding: 12px;
    width: 95%;
    margin: 0 auto 32px;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.15px;

    svg {
      cursor: pointer;
    }
  }

  .order-status-alert {
    background: #ffeaea;
    color: #ec4f4f;
    border-radius: 8px;
    padding: 12px;
    margin: 16px 0 8px 0;
    text-align: center;
    font-weight: 700;
    font-size: 16px;
  }
  .order-step-bar {
    background: #fff;
    border-radius: 8px;

    margin-bottom: 12px;
    width: 100%;
    padding: 16px 0 40px;

    .step-bar {
      width: 90%;
      @include respond-to("md") {
        width: 85%;
      }

      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      position: relative;
      margin-bottom: 8px;

      // 底線
      &::before {
        content: "";
        position: absolute;
        top: 8px;
        left: 0;
        right: 0;
        height: 2px;
        background: #00b3a4;
        opacity: 0.3;
        z-index: 0;
      }

      // 進度線
      .progress {
        position: absolute;
        top: 8px;
        left: 0;
        height: 2px;
        background: #00b3a4;
        z-index: 1;
        transition: width 0.3s;
      }

      .step {
        position: relative;
        flex: 0 0 auto; // 只佔自身最小寬度
        width: 0; // 把 min-content 壓到 0
        padding: 0 2px; // 視覺喘息
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 2;
        min-width: 0;

        .circle {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #00b3a4;
          transition: background 0.3s;
        }

        /* ─── 標籤：圓點正上方 ─── */
        .label {
          position: absolute;
          top: -24px; // 圓點直徑 16 + 間距 8
          left: 50%;
          transform: translateX(-50%);
          font-size: 14px;
          @include respond-to("md") {
            font-size: 12px;
          }
          white-space: nowrap;
          color: #bdbdbd;
          pointer-events: none;
        }

        /* ─── 日期：圓點正下方 ─── */
        .order-date {
          position: absolute;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          color: #888;
          pointer-events: none;
          text-align: center;
          line-height: 1.2;
          @include respond-to("md") {
            font-size: 10px;
          }
          .date {
            font-size: 12px;
            color: #888;
            margin-bottom: 2px;
          }

          .time {
            font-size: 12px;
            color: #888;
          }
        }

        &.completed .circle,
        &.active .circle {
          background: #00b3a4;
        }
        &.completed .label,
        &.active .label {
          color: #00b3a4;
          font-weight: 700;
        }
      }
    }
  }
  .section {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    width: 100%;
    .section-title {
      color: var(--Neutral-black, #1e1e1e);
      font-size: 1rem;
      font-style: normal;
      font-weight: 700;
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      margin-bottom: 6px;
    }
    .section-title-group {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .section-content {
        color: $raphael-gray-500;
        text-align: center;

        font-size: 1rem;
        font-style: normal;
        font-weight: 400;

        letter-spacing: 0.08px;
        display: flex;
        align-items: center;
        gap: 4px;
        svg {
          cursor: pointer;
        }
      }
    }

    .section-content {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
      .section-content-between {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .section-content-between-title {
          color: $raphael-gray-500;
        }
      }
    }
    .personal-info-card {
      background: #f6f6f6;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
      position: relative;
      .info-title {
        color: var(--Neutral-black, #1e1e1e);

        font-size: 1rem;
        font-style: normal;
        font-weight: 700;

        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
      .info-content-wrap {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-top: 0.5rem;
        .infoContentInner {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
      }
      .info-content {
        color: #666;
        color: $raphael-gray-500;

        font-size: 1rem;
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
      .edit-btn {
        background: none;
        color: #74bc1f;
        border: none;
        font-size: 18px;
        cursor: pointer;
      }
    }
    .product-card {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      .product-info2 {
        margin-left: auto;
      }
      img {
        width: 80px;
        height: 80px;
        border-radius: 8px;
        object-fit: cover;
        margin-right: 12px;
      }
      .product-info {
        .product-name {
          color: var(--Neutral-black, #1e1e1e);

          font-size: var(--Text-font-size-20, 20px);
          font-style: normal;
          font-weight: 700;

          letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
        }
        .product-price {
          color: var(--Primary-default, #74bc1f);

          font-size: 1rem;
          font-style: normal;
          font-weight: 700;
          margin-top: 0.15rem;
          letter-spacing: 0.08px;
        }
        .product-qty {
          color: #888;
        }
      }
    }
    .order-total {
      color: $raphael-gray-500;

      font-size: 1rem;
      font-style: normal;
      font-weight: 400;

      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
      gap: 4px;
      span {
        color: #ec4f4f;
        font-weight: bold;
      }
    }
    .section-error-return {
      color: var(--Warning-default, #ec4f4f);
      font-size: 1rem;
      font-style: normal;
      font-weight: 400;
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      margin-top: 2px;
    }
  }
  .section-content-list {
    list-style: disc;
    padding-left: 20px;
  }
  .sctionHR {
    height: 1px;
    background: #eee;
    margin: 12px 0;
  }
  .returnGoodsGroup {
    text-align: center;
    color: var(--Warning-default, #ec4f4f);
    font-size: 1rem;
    font-style: normal;
    font-weight: 400;

    letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
    cursor: pointer;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
