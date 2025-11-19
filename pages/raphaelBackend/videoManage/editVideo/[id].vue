<template>
  <div class="dashboard">
    <Sidebar />

    <!-- ─────────────── Main Content ─────────────── -->
    <main class="content">
      <!-- page header -->
      <div class="page-header">
        <h1 class="page-title">編輯影音</h1>
        <div class="page-buttons">
          <button class="btn-back" @click="handleBack">
            <img src="/assets/imgs/backend/back.svg" alt="返回" />
            <span>返回</span>
          </button>
          <button class="btn-save" @click="handleSave">
            <img src="/assets/imgs/backend/save.svg" alt="儲存並上架" />
            <span>儲存並上架</span>
          </button>
        </div>
      </div>

      <!-- form section -->
      <div class="form-container" v-if="!loading">
        <!-- 上傳封面照片 -->
        <div class="form-section">
          <label class="form-label">上傳封面照片</label>
          <div
            class="upload-area"
            :class="{ 'drag-over': isDragOver, 'has-file': coverImage || existingCoverImage }"
            @drop="handleDrop"
            @dragover.prevent="isDragOver = true"
            @dragleave="isDragOver = false"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              style="display: none"
            />
            <div v-if="!coverImage && !existingCoverImage" class="upload-placeholder">
              <div class="upload-icon">
                <img src="/assets/imgs/backend/cloud.svg" alt="上傳封面照片" />
              </div>
              <p class="upload-text">
                Drag your file(s) or <span class="browse-link">browse</span>
              </p>
              <p class="upload-hint">Max 10 MB files are allowed</p>
            </div>
            <div v-else class="upload-preview">
              <img
                :src="coverImagePreview || existingCoverImage"
                alt="封面預覽"
                class="preview-image"
              />
              <button class="remove-image" @click.stop="removeCoverImage">
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- 標題 -->
        <div class="form-section">
          <label class="form-label">標題</label>
          <div class="input-wrapper">
            <span class="input-icon"><img src="/assets/imgs/backend/tag.svg" alt="標題" /></span>
            <input
              v-model="formData.title"
              type="text"
              class="form-input"
              placeholder="請輸入影片標題"
            />
          </div>
        </div>

        <!-- 影片連結 -->
        <div class="form-section">
          <label class="form-label">影片連結</label>
          <div class="input-wrapper">
            <span class="input-icon"><img src="/assets/imgs/backend/link.svg" alt="影片連結" /></span>
            <input
              v-model="formData.videoLink"
              type="text"
              class="form-input"
              placeholder="請貼上連結"
            />
          </div>
        </div>

        <!-- 標示為推薦 -->
        <div class="form-section">
          <label class="form-label">標示為推薦</label>
          <div class="input-wrapper">
            <span class="input-icon">
              <img src="/assets/imgs/backend/fire.svg" alt="標示為推薦" />
            </span>
            <select
              v-model="formData.isRecommended"
              class="form-input select-input"
            >
              <option :value="true">是</option>
              <option :value="false">否</option>
            </select>
          </div>
        </div>

        <!-- 大標籤 -->
        <div class="form-section">
          <label class="form-label">影片類別</label>
          <div class="input-wrapper">
            <span class="input-icon">
              <img src="/assets/imgs/backend/tag.svg" alt="影片類別" />
            </span>
            <select
              v-model="formData.bigType"
              class="form-input select-input"
            >
              <option value="">影片類別</option>
              <option
                v-for="bigType in videoBigTypeList"
                :key="bigType.Type"
                :value="bigType.Type"
              >
                {{ bigType.Name }}
              </option>
            </select>
          </div>
        </div>

        <!-- 標籤 -->
        <div class="form-section">
          <label class="form-label">標籤</label>
          <div class="input-wrapper tag-input-wrapper">
            <button
              type="button"
              class="tag-button"
              @click="openTagDialog"
            >
              <span class="tag-button-text">
                {{ selectedTagsDisplay || "選擇標籤" }}
              </span>
            </button>
          </div>
        </div>

        <!-- 說明 -->
        <div class="form-section">
          <label class="form-label">說明</label>
          <textarea
            v-model="formData.description"
            class="form-textarea"
            placeholder="請使用文字編輯器"
            rows="6"
          ></textarea>
        </div>

        <!-- 操作按鈕 -->
        <div class="form-actions">
          <button class="btn-cancel" @click="handleBack">取消</button>
          <button class="btn-submit" @click="handleSubmit">儲存</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <p>載入中...</p>
      </div>
    </main>

    <!-- 標籤設定彈窗 -->
    <TagSetting
      v-model="showTagDialog"
      :selected-tags="selectedTagsList"
      :available-tags="availableTagsList"
      @save="handleTagSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import Sidebar from "/components/raphaelBackend/Sidebar.vue";
import TagSetting from "/components/raphaelBackend/tasSetting.vue";
import { useVideoTypeStore } from "~/stores/useVideoTypeStore";

const router = useRouter();
const route = useRoute();
const videoTypeStore = useVideoTypeStore();

// 取得影片 ID
const videoId = route.params.id as string;

// 表單資料
const formData = reactive({
  title: "",
  videoLink: "",
  isRecommended: true,
  tags: "",
  description: "",
  bigType: "" as string,
  videoTypes: [] as string[],
});

// 影片大標籤列表
interface VideoBigType {
  Type: string;
  Name: string;
}

const videoBigTypeList = ref<VideoBigType[]>([]);
const loadingBigType = ref(false);
const loading = ref(true);

// 標籤相關
const showTagDialog = ref(false);
const selectedTagsList = ref<string[]>([]);

// 可用的標籤列表（從 store 取得）
const availableTagsList = computed(() => {
  return videoTypeStore.videoTypeList.map((item: { Type: string; Name: string }) => item.Name);
});

// 將選中的標籤轉換為字串顯示
const selectedTagsDisplay = computed(() => {
  if (selectedTagsList.value.length === 0) {
    return "";
  }
  return selectedTagsList.value.join(", ");
});

// 檔案上傳相關
const fileInput = ref<HTMLInputElement | null>(null);
const coverImage = ref<File | null>(null);
const coverImagePreview = ref<string>("");
const existingCoverImage = ref<string>("");
const isDragOver = ref(false);

// 觸發檔案選擇
function triggerFileInput() {
  fileInput.value?.click();
}

// 處理檔案選擇
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processFile(file);
  }
}

// 處理拖放
function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) {
    processFile(file);
  }
}

// 處理檔案
function processFile(file: File) {
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("檔案大小不能超過 10 MB");
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("請選擇圖片檔案");
    return;
  }

  coverImage.value = file;
  existingCoverImage.value = "";

  const reader = new FileReader();
  reader.onload = (e) => {
    coverImagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

// 移除封面圖片
function removeCoverImage() {
  coverImage.value = null;
  coverImagePreview.value = "";
  existingCoverImage.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

// 開啟標籤設定彈窗
function openTagDialog() {
  showTagDialog.value = true;
}

// 處理標籤儲存
function handleTagSave(tags: string[]) {
  selectedTagsList.value = tags;
  formData.tags = tags.join(", ");
  
  formData.videoTypes = tags
    .map((tagName: string) => {
      const typeItem = videoTypeStore.videoTypeList.find(
        (item: { Type: string; Name: string }) => item.Name === tagName
      );
      return typeItem?.Type || "";
    })
    .filter((type: string) => type !== "");
}

// 取得影片大標籤列表
async function fetchVideoBigTypeList() {
  loadingBigType.value = true;
  try {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("backendToken") || sessionStorage.getItem("backendToken")
      : "";
    const adminID = typeof window !== "undefined"
      ? localStorage.getItem("adminID") || sessionStorage.getItem("adminID")
      : "";

    if (!token || !adminID) {
      throw new Error("缺少 token 或 adminID");
    }

    const response = await axios.post(
      "https://23700999.com:8081/HMA/api/bk/getVideoBigTypeList",
      {
        AdminID: adminID,
        Token: token,
      }
    );

    if (response.data && response.data.Result === "OK" && response.data.VideoBigTypeList) {
      videoBigTypeList.value = response.data.VideoBigTypeList;
    } else {
      console.error("API 返回錯誤:", response.data);
      videoBigTypeList.value = [];
    }
  } catch (error) {
    console.error("取得影片大標籤列表失敗:", error);
    videoBigTypeList.value = [];
  } finally {
    loadingBigType.value = false;
  }
}

// 取得影片資料
async function fetchVideoData() {
  loading.value = true;
  try {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("backendToken") || sessionStorage.getItem("backendToken")
      : "";
    const adminID = typeof window !== "undefined"
      ? localStorage.getItem("adminID") || sessionStorage.getItem("adminID")
      : "";

    if (!token || !adminID) {
      throw new Error("缺少 token 或 adminID");
    }

    const response = await axios.post(
      "https://23700999.com:8081/HMA/api/bk/getVideoList",
      {
        AdminID: adminID,
        Token: token,
      }
    );

    if (response.data && response.data.Result === "OK" && response.data.VideoList) {
      const video = response.data.VideoList.find((v: any) => v.AID === videoId);
      
      if (video) {
        // 填入表單資料
        formData.title = video.Name || "";
        formData.videoLink = video.VideoURL || "";
        formData.description = video.Desc || "";
        
        // 設定大標籤（取第一個）
        if (video.VideoBigTypeList && video.VideoBigTypeList.length > 0) {
          formData.bigType = video.VideoBigTypeList[0].VideoBigType || "";
        }
        
        // 設定標籤
        if (video.VideoTypeList && video.VideoTypeList.length > 0) {
          const tagNames = video.VideoTypeList.map((t: any) => t.Name);
          selectedTagsList.value = tagNames;
          formData.tags = tagNames.join(", ");
          formData.videoTypes = video.VideoTypeList.map((t: any) => t.VideoType);
        }
        
        // 設定推薦狀態（如果 API 有提供）
        // formData.isRecommended = video.IsRecommended || false;
      } else {
        alert("找不到該影片");
        handleBack();
      }
    } else {
      alert("取得影片資料失敗");
      handleBack();
    }
  } catch (error) {
    console.error("取得影片資料失敗:", error);
    alert("取得影片資料失敗");
    handleBack();
  } finally {
    loading.value = false;
  }
}

// 初始化資料
onMounted(async () => {
  await videoTypeStore.fetchVideoTypeList();
  await fetchVideoBigTypeList();
  await fetchVideoData();
});

// 返回
function handleBack() {
  router.push("/raphaelBackend/videoManage");
}

// 提交表單
async function handleSubmit() {
  if (!formData.title.trim()) {
    alert("請輸入影片標題");
    return;
  }

  if (!formData.videoLink.trim()) {
    alert("請輸入影片連結");
    return;
  }

  if (formData.videoTypes.length === 0) {
    alert("請至少選擇一個標籤");
    return;
  }

  if (!formData.bigType) {
    alert("請選擇影片類別");
    return;
  }

  if (!formData.description.trim()) {
    alert("請輸入說明");
    return;
  }

  try {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("backendToken") || sessionStorage.getItem("backendToken")
      : "";
    const adminID = typeof window !== "undefined"
      ? localStorage.getItem("adminID") || sessionStorage.getItem("adminID")
      : "";

    if (!token || !adminID) {
      alert("請先登入");
      return;
    }

    const requestData = {
      AdminID: adminID,
      Token: token,
      AID: videoId, // 編輯時需要傳遞 AID
      Type: formData.videoTypes,
      BigType: [formData.bigType],
      VideoURL: formData.videoLink,
      Name: formData.title.trim(),
      Desc: formData.description.trim(),
    };

    console.log("提交資料:", requestData);

    // 串接更新 API
    const response = await axios.post(
      "https://23700999.com:8081/HMA/api/bk/UpdateVideo",
      requestData
    );

    if (response.data && response.data.Result === "OK") {
      alert("更新成功！");
      handleBack();
    } else {
      alert("更新失敗：" + (response.data?.Message || "未知錯誤"));
    }
  } catch (error: any) {
    console.error("更新影片失敗:", error);
    alert("更新失敗：" + (error.response?.data?.Message || error.message || "未知錯誤"));
  }
}

// 儲存並上架
async function handleSave() {
  await handleSubmit();
}
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  height: 100vh;
  background: $primary-100;
}

.content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1rem;
  overflow-y: auto;

  @include respond-to("xl") {
    padding: 16px 16px;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 18px;
  color: $raphael-gray-500;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .page-title {
    display: flex;
    align-items: center;
    white-space: nowrap;
    gap: 8px;
    color: #2d3047;
    text-align: center;
    font-size: 36px;
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.09px;
  }

  .page-buttons {
    display: flex;
    gap: 16px;
  }
  
  .btn-back, .btn-save {
    border-radius: 6px;
    background: #b1c0d8;
    color: #ffffff;
    border: none;
    padding: 8px 16px;
    font-size: 1rem;
    font-weight: 400;
    letter-spacing: 2.7px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover {
      background-color: $primary-300;
    }

    img {
      width: 20px;
      height: 20px;
    }
  }
}

.form-container {
  background: $raphael-white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0px 2px 20px 0px
    var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
}

.form-section {
  margin-bottom: 32px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: $primary-600;
  margin-bottom: 12px;
}

.upload-area {
  border: 2px dashed $border;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    border-color: $primary-200;
    background: #f5f5f5;
  }

  &.drag-over {
    border-color: $primary-200;
    background: #e3f2fd;
  }

  &.has-file {
    padding: 0;
    min-height: auto;
  }
}

.upload-placeholder {
  .upload-icon {
    margin-bottom: 16px;
    opacity: 0.6;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      width: 64px;
      height: 64px;
    }
  }

  .upload-text {
    font-size: 16px;
    color: $raphael-gray-500;
    margin: 0 0 8px 0;

    .browse-link {
      color: $primary-200;
      text-decoration: underline;
      cursor: pointer;
    }
  }

  .upload-hint {
    font-size: 14px;
    color: $raphael-gray-400;
    margin: 0;
  }
}

.upload-preview {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;

  .preview-image {
    width: 100%;
    height: auto;
    max-height: 400px;
    object-fit: contain;
    display: block;
  }

  .remove-image {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
    }
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  .input-icon {
    position: absolute;
    left: 16px;
    font-size: 18px;
    z-index: 1;
    display: flex;
    align-items: center;
  }

  .form-input {
    width: 100%;
    padding: 12px 16px 12px 48px;
    border: 1px solid $border;
    border-radius: 8px;
    font-size: 16px;
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

  .select-input {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    padding-right: 40px;
    background-image: url("/assets/imgs/backend/arrow-down.svg");
    background-repeat: no-repeat;
    background-position: right 16px center;
    background-size: 16px 16px;
  }
}

.tag-input-wrapper {
  .tag-button {
    width: 100%;
    padding: 12px 16px 12px 48px;
    border: 1px solid $border;
    border-radius: 8px;
    font-size: 16px;
    color: $primary-600;
    background: $raphael-white;
    transition: all 0.2s ease;
    text-align: left;
    cursor: pointer;
    &:hover {
      border-color: $primary-200;
      box-shadow: 0 0 0 3px rgba($primary-200, 0.1);
    }

    .tag-button-text {
      color: $raphael-gray-400;

      &:not(:empty) {
        color: $primary-600;
      }
    }
  }
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid $border;
  border-radius: 8px;
  font-size: 16px;
  color: $primary-600;
  background: $raphael-white;
  font-family: inherit;
  resize: vertical;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid $border;
}

.btn-cancel,
.btn-submit {
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-cancel {
  background: $raphael-white;
  color: $raphael-gray-500;
  border: 1px solid $border;

  &:hover {
    background: #f5f5f5;
  }
}

.btn-submit {
  background: $primary-200;
  color: $raphael-white;

  &:hover {
    background: $primary-300;
  }
}

@include respond-to("md") {
  .form-container {
    padding: 24px 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;

    .btn-back {
      width: 100%;
      justify-content: center;
    }
  }

  .form-actions {
    flex-direction: column;

    .btn-cancel,
    .btn-submit {
      width: 100%;
    }
  }
}
</style>

