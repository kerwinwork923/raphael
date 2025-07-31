<template>
  <section class="toolbar">
    <!-- 搜尋欄位 -->
    <div v-if="showSearch" class="search-wrapper">
      <input
        :value="searchValue"
        class="search"
        type="text"
        :placeholder="searchPlaceholder"
        @input="handleSearchInput"
      />
      <img src="/assets/imgs/backend/search.svg" alt="" />
    </div>

    <!-- 日期選擇器 -->
    <div v-if="showDatePicker" class="toolbarTime-wrapper">
      <VueDatePicker
        :model-value="dateValue"
        range
        :enable-time-picker="false"
        :format="'yyyy/MM/dd'"
        :min-date="minDate"
        :placeholder="datePlaceholder"
        prepend-icon="i-calendar"
        @update:model-value="handleDateChange"
      />
    </div>

    <!-- 產品篩選 -->
    <div v-if="showProductFilter" class="selectWrapper">
      <img
        class="selectWrapperIcon1"
        src="/assets/imgs/backend/filter.svg"
        alt=""
      />
      <select :value="productValue" @change="handleProductChange">
        <option value="">{{ productPlaceholder }}</option>
        <option
          v-for="product in productOptions"
          :key="product.value"
          :value="product.value"
        >
          {{ product.label }}
        </option>
      </select>
      <img
        class="selectWrapperIcon2"
        src="/assets/imgs/backend/dropdown.svg"
        alt=""
      />
    </div>

    <!-- 狀態篩選 -->
    <div v-if="showStatusFilter" class="selectWrapper">
      <img
        class="selectWrapperIcon1"
        src="/assets/imgs/backend/filter.svg"
        alt=""
      />
      <select :value="statusValue" @change="handleStatusChange">
        <option value="">{{ statusPlaceholder }}</option>
        <option
          v-for="status in statusOptions"
          :key="status.value"
          :value="status.value"
        >
          {{ status.label }}
        </option>
      </select>
      <img
        class="selectWrapperIcon2"
        src="/assets/imgs/backend/dropdown.svg"
        alt=""
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

interface FilterOption {
  label: string;
  value: string;
}

interface Props {
  // 顯示控制
  showSearch?: boolean;
  showDatePicker?: boolean;
  showProductFilter?: boolean;
  showStatusFilter?: boolean;

  // 搜尋相關
  searchValue?: string;
  searchPlaceholder?: string;

  // 日期相關
  dateValue?: any;
  datePlaceholder?: string;
  minDate?: Date;

  // 產品篩選相關
  productValue?: string;
  productPlaceholder?: string;
  productOptions?: FilterOption[];

  // 狀態篩選相關
  statusValue?: string;
  statusPlaceholder?: string;
  statusOptions?: FilterOption[];
}

interface Emits {
  (e: "update:searchValue", value: string): void;
  (e: "update:dateValue", value: any): void;
  (e: "update:productValue", value: string): void;
  (e: "update:statusValue", value: string): void;
  (e: "search", value: string): void;
  (e: "dateChange", value: any): void;
  (e: "productChange", value: string): void;
  (e: "statusChange", value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  showSearch: true,
  showDatePicker: true,
  showProductFilter: true,
  showStatusFilter: true,
  searchValue: "",
  searchPlaceholder: "請輸入關鍵字",
  dateValue: null,
  datePlaceholder: "日期查詢",
  minDate: () => new Date(2024, 0, 1),
  productValue: "",
  productPlaceholder: "商品篩選",
  productOptions: () => [],
  statusValue: "",
  statusPlaceholder: "狀態篩選",
  statusOptions: () => [],
});

const emit = defineEmits<Emits>();

// 處理搜尋輸入
const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    emit("update:searchValue", target.value);
    emit("search", target.value);
  }
};

// 處理日期變更
const handleDateChange = (value: any) => {
  emit("update:dateValue", value);
  emit("dateChange", value);
};

// 處理產品篩選變更
const handleProductChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  if (target) {
    emit("update:productValue", target.value);
    emit("productChange", target.value);
  }
};

// 處理狀態篩選變更
const handleStatusChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  if (target) {
    emit("update:statusValue", target.value);
    emit("statusChange", target.value);
  }
};
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  width: 100%;

  @include respond-to("md") {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .search-wrapper {
    position: relative;
    min-width: 10dvw;

    @include respond-to("md") {
      width: 100%;
      min-width: auto;
    }

    img {
      width: 1.25rem;
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      width: 19px;
    }
  }

  .search {
    padding: 8px 12px;
    padding-left: 36px;
    border: none;
    width: 100%;
    border-radius: var(--Radius-r-50, 50px);
    background: $raphael-white;
    box-shadow: 0px 2px 20px 0px
      var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    transition: all ease 0.2s;

    &:hover {
      box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
    }
  }

  .toolbarTime-wrapper {
    position: relative;
    min-width: 10dvw;

    @include respond-to("md") {
      width: 100%;
      min-width: auto;
    }

    /* 重點: 用 :deep() 才能選到 VueDatePicker 的內部元素 */
    :deep(.dp__pointer) {
      padding: 0;
    }

    :deep(.dp__input_icon) {
      color: $chip-success;
      right: auto;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
    }

    :deep(.dp__input) {
      padding: 3.5px 12px;
      padding-left: 36px;
      border-radius: 50px;
      background: #fff;
      box-shadow: 0px 2px 20px rgba(177, 192, 216, 0.25);
      border: none;
      font-size: 14px;
      transition: all ease 0.2s;

      &:hover {
        box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
      }
    }

    img {
      position: absolute;
      right: 10%;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  select {
    padding: 0.5rem 2rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    background-color: #fff;
    background-size: 12px;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: none;
    color: $raphael-gray-500;
    cursor: pointer;
    width: 100%;
    border: none;
    border-radius: var(--Radius-r-50, 50px);
    background: $raphael-white;
    box-shadow: 0px 2px 20px 0px
      var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    transition: all ease 0.2s;

    &:hover {
      box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
    }
  }

  .selectWrapper {
    position: relative;
    min-width: 10dvw;

    @include respond-to("md") {
      width: 100%;
      min-width: auto;
    }

    img {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
    }

    .selectWrapperIcon1 {
      left: 8px;
    }

    .selectWrapperIcon2 {
      right: 8px;
    }
  }
}
</style>
