<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="tag-setting-backdrop"
      @click.self="handleClose"
    >
      <div class="tag-setting-modal">
        <h2 class="modal-title">標籤設定</h2>

        <div class="modal-content">
          <!-- 左邊：目前標籤 -->
          <div class="tag-section">
            <div class="section-header">
              <h3 class="section-title">
                目前標籤({{ localSelectedTags.length }})
              </h3>
            </div>
            <div class="tag-list">
              <div
                v-for="tag in localSelectedTags"
                :key="tag"
                class="tag-chip tag-chip-selected"
              >
                <span class="tag-name">{{ tag }}</span>
                <button
                  class="tag-remove"
                  @click="removeTag(tag)"
                  type="button"
                  :aria-label="`移除 ${tag}`"
                >
            <img src="/assets/imgs/backend/delete.svg" alt="刪除" class="delete-icon">
            </button>
              </div>
              <div v-if="localSelectedTags.length === 0" class="empty-state">
                尚未選擇標籤
              </div>
            </div>
          </div>

          <!-- 右邊：現有標籤 -->
          <div class="tag-section">
            <div class="section-header">
              <h3 class="section-title">
                現有標籤({{ filteredAvailableTags.length }})
              </h3>
              <div class="search-wrapper">
                <img
                  src="/assets/imgs/backend/search.svg"
                  alt="搜尋"
                  class="search-icon"
                />
                <input
                  v-model="searchKeyword"
                  type="text"
                  class="search-input"
                  placeholder="請輸入關鍵字"
                />
              </div>
            </div>
            <div class="tag-list">
              <button
                v-for="tag in filteredAvailableTags"
                :key="tag"
                class="tag-chip tag-chip-available"
                @click="addTag(tag)"
                type="button"
              >
                <span class="tag-add-icon">+</span>
                <span class="tag-name">{{ tag }}</span>
              </button>
              <div
                v-if="filteredAvailableTags.length === 0"
                class="empty-state"
              >
                沒有符合的標籤
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div class="modal-actions">
          <button class="btn-close" @click="handleClose" type="button">
            關閉
          </button>
          <button class="btn-save" @click="handleSave" type="button">
            儲存
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface Props {
  modelValue: boolean;
  selectedTags?: string[];
  availableTags?: string[];
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "save", tags: string[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  selectedTags: () => [],
  availableTags: () => [],
});

const emit = defineEmits<Emits>();

// 內部狀態
const localSelectedTags = ref<string[]>([...props.selectedTags]);
const searchKeyword = ref("");

// 監聽外部 selectedTags 變化
watch(
  () => props.selectedTags,
  (newTags: string[]) => {
    localSelectedTags.value = [...newTags];
  },
  { immediate: true }
);

// 過濾可用的標籤（排除已選中的）
const availableTagsFiltered = computed(() => {
  return props.availableTags.filter(
    (tag: string) => !localSelectedTags.value.includes(tag)
  );
});

// 根據搜尋關鍵字過濾標籤
const filteredAvailableTags = computed(() => {
  if (!searchKeyword.value.trim()) {
    return availableTagsFiltered.value;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return availableTagsFiltered.value.filter((tag: string) =>
    tag.toLowerCase().includes(keyword)
  );
});

// 添加標籤
function addTag(tag: string) {
  if (!localSelectedTags.value.includes(tag)) {
    localSelectedTags.value.push(tag);
  }
}

// 移除標籤
function removeTag(tag: string) {
  const index = localSelectedTags.value.indexOf(tag);
  if (index > -1) {
    localSelectedTags.value.splice(index, 1);
  }
}

// 關閉彈窗
function handleClose() {
  // 重置為原始值
  localSelectedTags.value = [...props.selectedTags];
  searchKeyword.value = "";
  emit("update:modelValue", false);
}

// 儲存
function handleSave() {
  emit("save", [...localSelectedTags.value]);
  searchKeyword.value = "";
  emit("update:modelValue", false);
}
</script>

<style scoped lang="scss">
.tag-setting-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.tag-setting-modal {
  background: $raphael-white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: $primary-600;
  padding: 24px 24px 0;
  margin: 0 0 24px;
}

.modal-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 0 24px;
  overflow-y: auto;
  flex: 1;

  @include respond-to("md") {
    grid-template-columns: 1fr;
  }
}

.tag-section {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: $primary-600;
  margin: 0 0 12px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  .search-icon {
    position: absolute;
    left: 12px;
    width: 18px;
    height: 18px;
    z-index: 1;
  }

  .search-input {
    width: 100%;
    padding: 10px 12px 10px 38px;
    border: 1px solid $border;
    border-radius: 8px;
    font-size: 14px;
    color: $primary-600;
    background: $raphael-white;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: $primary-200;
      box-shadow: 0 0 0 3px rgba($primary-200, 0.1);
    }

    &::placeholder {
      color: $raphael-gray-400;
    }
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  overflow-y: auto;


  padding: 4px;
  @include scrollbarStyle();
}

.tag-chip {
  display: flex;
  width: 167px;
  height: 44px;
  padding: var(--Padding-p-9, 9px) var(--Padding-p-12, 12px);

  align-items: center;
  gap: var(--Margin-m-8, 8px);
  border-radius: var(--Radius-r-50, 50px);
  border: none;
  background-color: #fff;
  color: var(--Primary-600, #2d3047);
  font-size: var(--Text-font-size-18, 18px);
  font-style: normal;
  font-weight: 400;

  letter-spacing: 2.7px;
cursor: pointer;
  .tag-name {
    color: $raphael-gray-500;
  }
}

.tag-chip-selected {
  display: flex;
  width: 167px;
  height: 44px;
  padding: var(--Padding-p-9, 9px) var(--Padding-p-12, 12px);
  justify-content: center;
  align-items: center;
  gap: var(--Margin-m-8, 8px);
  border-radius: var(--Radius-r-50, 50px);
  background: $primary-200;
  .tag-name {
    color: $raphael-white;
  }

  .tag-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    border: none;
    background: transparent;
    color: $primary-200;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 50%;

    &:hover {
      background: rgba($primary-200, 0.2);
      transform: scale(1.1);
    }

    svg {
      width: 12px;
      height: 12px;
    }
  }
}

.tag-chip-available {
  &:hover {
    border-color: $primary-200;
    background: rgba($primary-200, 0.05);
  }

  .tag-add-icon {
    color: $primary-200;
    font-size: 18px;
    font-weight: 600;
    line-height: 1;
  }
}

.empty-state {
  width: 100%;
  padding: 40px 20px;
  text-align: center;
  color: $raphael-gray-400;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid $border;
  margin-top: 24px;
}

.btn-close,
.btn-save {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-close {
  background: $raphael-white;
  color: $raphael-gray-500;
  border: 1px solid $border;

  &:hover {
    background: #f5f5f5;
  }
}

.btn-save {
  background: $chip-success;
  color: $raphael-white;

  &:hover {
    background: darken($chip-success, 10%);
  }
}

@include respond-to("md") {
  .tag-setting-modal {
    max-height: 95vh;
  }

  .modal-content {
    max-height: 60vh;
  }
}
</style>
