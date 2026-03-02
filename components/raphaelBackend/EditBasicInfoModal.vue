<template>
  <transition name="fade">
    <div class="editBasicInfoModal" v-if="show" @click.self="handleClose">
      <div class="editBasicInfoModalBox">
        <!-- 標題區域 -->
        <div class="editBasicInfoModalHeader">
          <img src="/assets/imgs/backend/Subtract.svg" alt="" />
          <div class="editBasicInfoModalTitleGroup">
            <h3>基本資料編輯</h3>
            <h4>info edit</h4>
          </div>
        </div>

        <div class="editBasicInfoHR"></div>
        <!-- 表單區域 -->
         
        <div class="editBasicInfoModalForm">
          <div class="editBasicInfoModalField">
            <label>姓名</label>
            <input
              type="text"
              v-model="formData.name"
              placeholder="請輸入姓名"
            />
          </div>

          <div class="editBasicInfoModalField">
            <label>常用信箱</label>
            <input
              type="text"
              v-model="formData.mail"
              placeholder="請輸入常用信箱"
            />
          </div>

          <div class="editBasicInfoModalField">
            <label>華碩註冊信箱</label>
            <input
              type="text"
              v-model="formData.asusMail"
              placeholder="請輸入華碩註冊信箱"
            />
          </div>

          <div class="editBasicInfoModalField">
            <label>宏碁註冊信箱</label>
            <input
              type="text"
              v-model="formData.acerMail"
              placeholder="請輸入宏碁註冊信箱"
            />
          </div>

          <div class="editBasicInfoModalField">
            <label>Garmin註冊信箱</label>
            <input
              type="text"
              v-model="formData.garminMail"
              placeholder="請輸入Garmin註冊信箱"
            />
          </div>

          <div class="editBasicInfoModalField">
            <label>身高</label>
            <input
              type="text"
              v-model="formData.height"
              placeholder="請輸入身高"
            />
          </div>

          <div class="editBasicInfoModalField">
            <label>體重</label>
            <input
              type="text"
              v-model="formData.weight"
              placeholder="請輸入體重"
            />
          </div>

          <div class="editBasicInfoModalField">
            <label>生日</label>
            <input
              type="text"
              v-model="formData.birthday"
              placeholder="請輸入生日"
            />
          </div>



    

          <div class="editBasicInfoModalField">
            <label>城市</label>
            <div class="selectWrap">
              <select
                v-model="formData.city"
                :class="{ selected: !!formData.city }"
                @change="updateAreasByCity"
              >
                <option value="" disabled>縣市</option>
                <option
                  v-for="city in citiesData"
                  :key="city.CityName"
                  :value="city.CityName"
                >
                  {{ city.CityName }}
                </option>
              </select>
            </div>
          </div>

          <div class="editBasicInfoModalField">
            <label>行政區</label>
            <div class="selectWrap">
              <select v-model="formData.zone" :class="{ selected: !!formData.zone }">
                <option value="" disabled>鄉鎮地區</option>
                <option
                  v-for="area in filteredAreas"
                  :key="area.AreaName"
                  :value="area.AreaName"
                >
                  {{ area.AreaName }}
                </option>
              </select>
            </div>
          </div>

          <div class="editBasicInfoModalField">
            <label>電話</label>
            <input
              type="text"
              v-model="formData.phone"
              placeholder="請輸入電話"
            />
          </div>
        </div>

        <!-- 按鈕區域 -->
        <div class="editBasicInfoModalActions">
          <button class="btn-close" @click="handleClose">關閉</button>
          <button class="btn-submit" @click="handleSubmit">提交</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

type AreaItem = {
  AreaName: string;
};

type CityItem = {
  CityName: string;
  AreaList: AreaItem[];
};

type EditBasicFormData = {
  name: string;
  mail: string;
  asusMail: string;
  acerMail: string;
  garminMail: string;
  height: string;
  weight: string;
  birthday: string;
  dspr: string;
  hrvCalTime: string;
  city: string;
  zone: string;
  phone: string;
};

const props = defineProps<{
  show: boolean;
  initialData?: Partial<EditBasicFormData>;
}>();

const emit = defineEmits<{
  close: [];
  submit: [data: EditBasicFormData];
}>();

function buildFormData(newData?: Partial<EditBasicFormData>): EditBasicFormData {
  return {
    name: newData?.name || "",
    mail: newData?.mail || "",
    asusMail: newData?.asusMail || "",
    acerMail: newData?.acerMail || "",
    garminMail: newData?.garminMail || "",
    height: newData?.height || "",
    weight: newData?.weight || "",
    birthday: newData?.birthday || "",
    dspr: newData?.dspr || "",
    hrvCalTime: newData?.hrvCalTime || "",
    city: newData?.city || "",
    zone: newData?.zone || "",
    phone: newData?.phone || "",
  };
}

const formData = ref<EditBasicFormData>({
  name: "",
  mail: "",
  asusMail: "",
  acerMail: "",
  garminMail: "",
  height: "",
  weight: "",
  birthday: "",
  dspr: "",
  hrvCalTime: "",
  city: "",
  zone: "",
  phone: "",
});

const citiesData = ref<CityItem[]>([]);
const filteredAreas = ref<AreaItem[]>([]);

function updateAreasByCity() {
  const city = citiesData.value.find(
    (item: CityItem) => item.CityName === formData.value.city
  );
  filteredAreas.value = city?.AreaList ?? [];
  if (
    !filteredAreas.value.some(
      (area: AreaItem) => area.AreaName === formData.value.zone
    )
  ) {
    formData.value.zone = "";
  }
}

// 當 initialData 改變時，更新表單資料
watch(
  () => props.initialData,
  (newData: Partial<EditBasicFormData> | undefined) => {
    if (newData) {
      formData.value = buildFormData(newData);
      updateAreasByCity();
    }
  },
  { immediate: true, deep: true }
);

// 當 show 變為 true 時，重置表單
watch(
  () => props.show,
  (isShow: boolean) => {
    if (isShow && props.initialData) {
      formData.value = buildFormData(props.initialData);
      updateAreasByCity();
    }
  }
);

onMounted(async () => {
  try {
    const response = await fetch("/AllData.json");
    if (!response.ok) return;
    citiesData.value = (await response.json()) as CityItem[];
    updateAreasByCity();
  } catch (error) {
    console.error("載入地址資料失敗:", error);
  }
});

function handleClose() {
  emit("close");
}

function handleSubmit() {
  emit("submit", { ...formData.value });
}
</script>

<style scoped lang="scss">


.editBasicInfoModal {
  position: fixed;
  inset: 0;

  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.editBasicInfoModalBox {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 70%;
  overflow-y: auto;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
  padding: 2rem;
  animation: slideUp 0.3s ease;

  border-radius: var(--Radius-r-20, 20px);
border: 3px solid var(--Primary-default, #1BA39B);
background: var(--neutral-white-opacity-30, rgba(255, 255, 255, 0.30));
box-shadow: 0 2px 20px 0 var(--primary-400-opacity-25, rgba(27, 163, 155, 0.25));
backdrop-filter: blur(25px);

  @keyframes slideUp {
    from {
      transform: translateY(20px);
  
    }
    to {
      transform: translateY(0);
      
    }
  }
}

.editBasicInfoModalHeader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
  margin-bottom: .5rem;
  

  img {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 9.8px;
      border: 1px solid var(--Primary-default, #1ba39b);
      padding: 2px 4px;
    }
}

.editBasicInfoHR{
    width: 100%;
    height: 1px;
    background: var(--Primary-200, #B1C0D8);
  }

.editBasicInfoModalTitleGroup {
  text-align: center;


  h3 {
    color: #2d3047;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.5px;
    margin: 0 0 0.25rem 0;
  }

  h4 {
    color: var(--Primary-default, #1BA39B);
font-size: var(--Text-font-size-18, 18px);
font-style: normal;
font-weight: 400;
letter-spacing: 0.09px;
  }
}

.editBasicInfoModalForm {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  margin-top: .65rem;
}

.editBasicInfoModalField {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    color: var(--Primary-600, #2D3047);

font-size: var(--Text-font-size-24, 24px);
font-style: normal;
font-weight: 400;

letter-spacing: 3.6px;
  }

  input,
  select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #e5e9f2;
    border-radius: 8px;
    font-size: 16px;
    color: #2d3047;
    background: #fff;
    transition: all 0.2s ease;
    overflow: hidden;
color: var(--Primary-default, #1BA39B);
text-overflow: ellipsis;

font-size: var(--Text-font-size-18, 18px);
font-style: normal;
font-weight: 400;
line-height: var(--lineHeight-line-height-18, 29.1px); /* 161.667% */
letter-spacing: 2.7px;
    &:focus {
      outline: none;
      border-color: var(--Primary-default, #1ba39b);
      box-shadow: 0 0 0 3px rgba(27, 163, 155, 0.1);
    }

    &::placeholder {
      color: #b1c0d8;
    }
  }
}

.selectWrap {
  position: relative;

  select {
    appearance: none;
    background-color: #fff;
    cursor: pointer;
  }

  &::after {
    content: "";
    position: absolute;
    right: 0.9rem;
    top: 50%;
    width: 8px;
    height: 8px;
    border-right: 2px solid #1ba39b;
    border-bottom: 2px solid #1ba39b;
    transform: translateY(-60%) rotate(45deg);
    pointer-events: none;
  }
}

.editBasicInfoModalActions {
  display: flex;
  gap: 1rem;
  justify-content: center;

  button {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.5px;

  }

  .btn-close {
    background-color: transparent;
 

  }

  .btn-submit {
    border-radius: 6px;
    background: var(--Primary-default, #1BA39B);
    color: #fff;

    &:hover {
      background: #15968f;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(27, 163, 155, 0.3);
    }
  }
}

@media (max-width: 768px) {
  .editBasicInfoModalBox {
    padding: 1.5rem;
    margin: 1rem;
  }

  .editBasicInfoModalActions {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
}
</style>
