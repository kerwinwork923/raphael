<template>
  <transition name="fv-fade">
    <div
      v-if="show"
      class="firstVisitModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="firstVisitModalTitle"
      @click.self="handleCloseRequest"
    >
      <div class="firstVisitModal__box" @click.stop>
        <header class="firstVisitModal__header">
          <img
            src="/assets/imgs/backend/Subtract.svg"
            alt=""
            class="firstVisitModal__logo"
          />
          <h2 id="firstVisitModalTitle" class="firstVisitModal__title">
            {{ wizardStep === 1 ? "基本資料表" : "初診健康史問卷" }}
          </h2>

          <div class="firstVisitModal__stepper" aria-label="填寫進度">
            <div
              class="firstVisitModal__step"
              :class="{
                'firstVisitModal__step--active': wizardStep === 1,
                'firstVisitModal__step--done': wizardStep === 2,
              }"
            >
              <span class="firstVisitModal__stepCircle">
                <template v-if="wizardStep === 2">
                  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                    <path
                      d="M3 8.5L6.5 12L13 4"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </template>
                <template v-else>1</template>
              </span>
              <span class="firstVisitModal__stepLabel">基本資料</span>
            </div>
            <div
              class="firstVisitModal__stepLine"
              :class="{ 'firstVisitModal__stepLine--muted': wizardStep === 1 }"
              aria-hidden="true"
            />
            <div
              class="firstVisitModal__step"
              :class="{ 'firstVisitModal__step--active': wizardStep === 2 }"
            >
              <span class="firstVisitModal__stepCircle">2</span>
              <span class="firstVisitModal__stepLabel">初診健康史問卷</span>
            </div>
          </div>
        </header>

        <!-- 步驟一：基本資料表（Insert_Individual） -->
        <div v-show="wizardStep === 1" class="firstVisitModal__basicWrap">
          <h3 class="firstVisitModal__sectionTitle firstVisitModal__sectionTitle--basic">
            <span class="firstVisitModal__sectionBar" aria-hidden="true" />
            基本資料
          </h3>

          <div class="firstVisitModal__basicGrid">
            <label class="firstVisitModal__field">
              <span class="firstVisitModal__fieldLabel">姓名</span>
              <input
                v-model="basicForm.name"
                type="text"
                class="firstVisitModal__input"
                placeholder="輸入"
                autocomplete="name"
              />
            </label>
            <label class="firstVisitModal__field">
              <span class="firstVisitModal__fieldLabel">電話</span>
              <input
                v-model="basicForm.mobile"
                type="tel"
                class="firstVisitModal__input"
                placeholder="輸入"
                autocomplete="tel"
              />
            </label>
            <label class="firstVisitModal__field">
              <span class="firstVisitModal__fieldLabel">出生年月日</span>
              <input
                v-model="basicForm.birthdayInput"
                type="date"
                class="firstVisitModal__input firstVisitModal__input--date"
              />
            </label>
            <div class="firstVisitModal__field firstVisitModal__field--full">
              <span class="firstVisitModal__fieldLabel">來源</span>
              <div class="firstVisitModal__sourceReadonly">{{ sourceDisplayLine }}</div>
            </div>
            <label class="firstVisitModal__field">
              <span class="firstVisitModal__fieldLabel">身高 / cm</span>
              <input
                v-model="basicForm.height"
                type="text"
                inputmode="decimal"
                class="firstVisitModal__input"
                placeholder="輸入"
              />
            </label>
            <label class="firstVisitModal__field">
              <span class="firstVisitModal__fieldLabel">體重 / kg</span>
              <input
                v-model="basicForm.weight"
                type="text"
                inputmode="decimal"
                class="firstVisitModal__input"
                placeholder="輸入"
              />
            </label>
          </div>

          <div class="firstVisitModal__teeBlock">
            <div class="firstVisitModal__teeHead">
              <span>平常 T 恤尺寸</span>
              <span class="firstVisitModal__teeHeadSub">成人／兒童</span>
              <span class="firstVisitModal__teeHeadSub">尺寸</span>
            </div>
            <div class="firstVisitModal__teeRow firstVisitModal__teeRow--label">成人</div>
            <div class="firstVisitModal__teeSubRow">
              <span class="firstVisitModal__teeGender">男</span>
              <div class="firstVisitModal__teeRadios">
                <label v-for="sz in teeSizes" :key="'m-' + sz" class="firstVisitModal__teeRadio">
                  <input
                    v-model="basicForm.teeMaleSize"
                    type="radio"
                    name="tee-male"
                    :value="sz"
                    @change="onPickMaleTee(sz)"
                  />
                  {{ sz }}
                </label>
              </div>
            </div>
            <div class="firstVisitModal__teeSubRow">
              <span class="firstVisitModal__teeGender">女</span>
              <div class="firstVisitModal__teeRadios">
                <label v-for="sz in teeSizes" :key="'f-' + sz" class="firstVisitModal__teeRadio">
                  <input
                    v-model="basicForm.teeFemaleSize"
                    type="radio"
                    name="tee-female"
                    :value="sz"
                    @change="onPickFemaleTee(sz)"
                  />
                  {{ sz }}
                </label>
              </div>
            </div>
            <div class="firstVisitModal__teeRow firstVisitModal__teeRow--label">兒童</div>
            <div class="firstVisitModal__teeChildRow">
              <input
                v-model="basicForm.teeChildCustom"
                type="text"
                class="firstVisitModal__input"
                placeholder="自行輸入"
                @input="onChildTeeInput"
              />
            </div>
          </div>

          <p class="firstVisitModal__filedAt">建檔日期：{{ profileCreatedAtDisplay }}</p>
        </div>

        <div v-show="wizardStep === 2" class="firstVisitModal__step2">
          <div class="firstVisitModal__patientBar">
            <div class="firstVisitModal__patientItem firstVisitModal__patientItem--highlight">
              病歷號碼：{{ patientForStep2.chartNo || "-" }}
            </div>
            <div class="firstVisitModal__patientItem">
              姓名：{{ patientForStep2.name || "-" }}
              <template v-if="patientForStep2.nameExtra">{{ patientForStep2.nameExtra }}</template>
            </div>
            <div class="firstVisitModal__patientItem">
              性別：{{ patientForStep2.gender || "-" }}
            </div>
            <div class="firstVisitModal__patientItem">
              年齡：{{ patientForStep2.age || "-" }}
            </div>
            <div class="firstVisitModal__patientItem">
              初診日期：{{ patientForStep2.firstVisitDate || "-" }}
            </div>
          </div>

          <nav class="firstVisitModal__tabs" aria-label="問卷分頁">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="firstVisitModal__tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </nav>

        <div class="firstVisitModal__body">
          <!-- 一、生活史 -->
          <section v-show="activeTab === 'life'" class="firstVisitModal__section">
            <h3 class="firstVisitModal__sectionTitle">
              <span class="firstVisitModal__sectionBar" aria-hidden="true" />
              一、生活史
            </h3>

            <div
              v-for="habit in habitFields"
              :key="habit.key"
              class="firstVisitModal__habitRow"
            >
              <span class="firstVisitModal__habitLabel">{{ habit.label }}</span>
              <div class="firstVisitModal__habitControls">
                <div class="firstVisitModal__radioGroup">
                  <label
                    v-for="opt in habitOptions"
                    :key="opt.value"
                    class="firstVisitModal__radio"
                  >
                    <input
                      v-model="form.life[habit.key].option"
                      type="radio"
                      :name="`habit-${habit.key}`"
                      :value="opt.value"
                    />
                    {{ opt.label }}
                  </label>
                </div>
                <div v-if="habit.showAmount" class="firstVisitModal__inlineInputs">
                  <input
                    v-model="form.life[habit.key].amount"
                    type="text"
                    class="firstVisitModal__input firstVisitModal__input--xs"
                    :disabled="!isHabitActive(form.life[habit.key].option)"
                  />
                  <span class="firstVisitModal__unit">{{ habit.unit }}</span>
                </div>
                <div class="firstVisitModal__remarkRow">
                  <span class="firstVisitModal__remarkLabel">{{ habit.remarkLabel }}</span>
                  <input
                    v-model="form.life[habit.key].remark"
                    type="text"
                    class="firstVisitModal__input"
                  />
                </div>
              </div>
            </div>

            <div class="firstVisitModal__habitRow">
              <span class="firstVisitModal__habitLabel">運動習慣</span>
              <div class="firstVisitModal__habitControls">
                <div class="firstVisitModal__radioGroup">
                  <label class="firstVisitModal__radio">
                    <input v-model="form.life.exercise.option" type="radio" value="none" />
                    無
                  </label>
                  <label class="firstVisitModal__radio">
                    <input v-model="form.life.exercise.option" type="radio" value="yes" />
                    有
                  </label>
                </div>
                <div class="firstVisitModal__inlineInputs">
                  <input
                    v-model="form.life.exercise.timesPerWeek"
                    type="text"
                    class="firstVisitModal__input firstVisitModal__input--xs"
                    :disabled="form.life.exercise.option !== 'yes'"
                  />
                  <span class="firstVisitModal__unit">次/週</span>
                  <input
                    v-model="form.life.exercise.minutesPerTime"
                    type="text"
                    class="firstVisitModal__input firstVisitModal__input--xs"
                    :disabled="form.life.exercise.option !== 'yes'"
                  />
                  <span class="firstVisitModal__unit">分鐘/每次</span>
                </div>
                <div class="firstVisitModal__remarkRow">
                  <span class="firstVisitModal__remarkLabel">運動備註</span>
                  <input v-model="form.life.exercise.remark" type="text" class="firstVisitModal__input" />
                </div>
              </div>
            </div>

            <div class="firstVisitModal__habitRow">
              <span class="firstVisitModal__habitLabel">工作狀態</span>
              <div class="firstVisitModal__habitControls">
                <div class="firstVisitModal__radioGroup">
                  <label
                    v-for="opt in workStatusOptions"
                    :key="opt.value"
                    class="firstVisitModal__radio"
                  >
                    <input v-model="form.life.workStatus" type="radio" :value="opt.value" />
                    {{ opt.label }}
                  </label>
                </div>
                <div class="firstVisitModal__remarkRow">
                  <span class="firstVisitModal__remarkLabel">工作備註</span>
                  <input v-model="form.life.workRemark" type="text" class="firstVisitModal__input" />
                </div>
              </div>
            </div>

            <div class="firstVisitModal__habitRow">
              <span class="firstVisitModal__habitLabel">睡眠習慣</span>
              <div class="firstVisitModal__habitControls">
                <div class="firstVisitModal__radioGroup">
                  <label
                    v-for="opt in sleepMedOptions"
                    :key="opt.value"
                    class="firstVisitModal__radio"
                  >
                    <input v-model="form.life.sleepMed" type="radio" :value="opt.value" />
                    {{ opt.label }}
                  </label>
                </div>
              </div>
            </div>

            <div class="firstVisitModal__habitRow">
              <span class="firstVisitModal__habitLabel">睡眠時間</span>
              <div class="firstVisitModal__habitControls">
                <div class="firstVisitModal__inlineInputs firstVisitModal__inlineInputs--wrap">
                  <span>PM</span>
                  <input v-model="form.life.sleepFrom" type="text" class="firstVisitModal__input firstVisitModal__input--xs" placeholder="時間" />
                  <span>— AM</span>
                  <input v-model="form.life.sleepTo" type="text" class="firstVisitModal__input firstVisitModal__input--xs" placeholder="時間" />
                  <input v-model="form.life.sleepFallHours" type="text" class="firstVisitModal__input firstVisitModal__input--xs" />
                  <span class="firstVisitModal__unit">小時/入睡需花</span>
                  <input v-model="form.life.sleepWakeCount" type="text" class="firstVisitModal__input firstVisitModal__input--xs" />
                  <span class="firstVisitModal__unit">次/半夜醒來</span>
                </div>
                <div class="firstVisitModal__remarkRow">
                  <span class="firstVisitModal__remarkLabel">睡眠備註</span>
                  <input v-model="form.life.sleepRemark" type="text" class="firstVisitModal__input" />
                </div>
              </div>
            </div>

            <div class="firstVisitModal__habitRow">
              <span class="firstVisitModal__habitLabel">血壓數值</span>
              <div class="firstVisitModal__habitControls">
                <div class="firstVisitModal__radioGroup">
                  <label
                    v-for="opt in bpLevelOptions"
                    :key="opt.value"
                    class="firstVisitModal__radio"
                  >
                    <input v-model="form.life.bpLevel" type="radio" :value="opt.value" />
                    {{ opt.label }}
                  </label>
                  <label class="firstVisitModal__radio firstVisitModal__radio--other">
                    <input v-model="form.life.bpLevel" type="radio" value="other" />
                    其他
                    <input
                      v-model="form.life.bpOther"
                      type="text"
                      class="firstVisitModal__input firstVisitModal__input--sm"
                      :disabled="form.life.bpLevel !== 'other'"
                    />
                  </label>
                </div>
                <div class="firstVisitModal__inlineInputs">
                  <input v-model="form.life.bpSystolic" type="text" class="firstVisitModal__input firstVisitModal__input--xs" />
                  <span>/</span>
                  <input v-model="form.life.bpDiastolic" type="text" class="firstVisitModal__input firstVisitModal__input--xs" />
                  <span class="firstVisitModal__unit">mmHg</span>
                  <input v-model="form.life.pulse" type="text" class="firstVisitModal__input firstVisitModal__input--xs" />
                  <span class="firstVisitModal__unit">脈搏 次/分</span>
                </div>
              </div>
            </div>

            <div class="firstVisitModal__fieldBlock">
              <span class="firstVisitModal__habitLabel">壓力源</span>
              <textarea v-model="form.life.stressSource" class="firstVisitModal__textarea" rows="3" />
            </div>

            <div class="firstVisitModal__habitRow">
              <span class="firstVisitModal__habitLabel">皮膚過敏</span>
              <div class="firstVisitModal__habitControls">
                <div class="firstVisitModal__radioGroup">
                  <label class="firstVisitModal__radio">
                    <input v-model="form.life.skinAllergy" type="radio" value="none" />
                    無
                  </label>
                  <label class="firstVisitModal__radio">
                    <input v-model="form.life.skinAllergy" type="radio" value="yes" />
                    有
                  </label>
                </div>
                <div class="firstVisitModal__remarkRow">
                  <span class="firstVisitModal__remarkLabel">過敏源</span>
                  <input
                    v-model="form.life.allergen"
                    type="text"
                    class="firstVisitModal__input"
                    :disabled="form.life.skinAllergy !== 'yes'"
                  />
                </div>
              </div>
            </div>

            <div class="firstVisitModal__fieldBlock">
              <span class="firstVisitModal__habitLabel">舒壓習慣</span>
              <div class="firstVisitModal__checkboxGroup">
                <label
                  v-for="opt in relaxOptions"
                  :key="opt.value"
                  class="firstVisitModal__checkbox"
                >
                  <input
                    v-model="form.life.relaxHabits"
                    type="checkbox"
                    :value="opt.value"
                  />
                  {{ opt.label }}
                </label>
                <label class="firstVisitModal__checkbox firstVisitModal__checkbox--other">
                  <input v-model="form.life.relaxHabits" type="checkbox" value="other" />
                  其他
                  <input v-model="form.life.relaxOther" type="text" class="firstVisitModal__input firstVisitModal__input--sm" />
                </label>
              </div>
            </div>

            <div class="firstVisitModal__fieldBlock">
              <span class="firstVisitModal__habitLabel">其他</span>
              <textarea v-model="form.life.other" class="firstVisitModal__textarea" rows="3" />
            </div>
          </section>

          <!-- 二、過去病史 -->
          <!-- <section v-show="activeTab === 'past'" class="firstVisitModal__section">
            <div class="firstVisitModal__sectionHead">
              <h3 class="firstVisitModal__sectionTitle">
                <span class="firstVisitModal__sectionBar" aria-hidden="true" />
                二、過去病史
              </h3>
              <span class="firstVisitModal__hint">(至多8項)</span>
            </div>

            <div class="firstVisitModal__pastTable">
              <div class="firstVisitModal__pastHead" role="row">
                <span>疾病</span>
                <span>時間</span>
                <span>處理方式 / 備註</span>
              </div>

              <div
                v-for="(row, index) in form.pastHistory"
                :key="row.id"
                class="firstVisitModal__pastRow"
              >
                <div class="firstVisitModal__pastCol">
                  <input
                    v-model="row.disease"
                    type="text"
                    class="firstVisitModal__input"
                    placeholder="輸入"
                  />
                  <button
                    type="button"
                    class="firstVisitModal__deleteBtn"
                    :disabled="form.pastHistory.length <= 1"
                    @click="removePastRow(index)"
                  >
                    <span aria-hidden="true">🗑</span> 刪除欄位
                  </button>
                </div>
                <div class="firstVisitModal__pastCol">
                  <input
                    v-model="row.time"
                    type="text"
                    class="firstVisitModal__input"
                    placeholder="輸入"
                  />
                </div>
                <div class="firstVisitModal__pastCol firstVisitModal__pastCol--wide">
                  <div class="firstVisitModal__checkboxGroup firstVisitModal__checkboxGroup--compact">
                    <label
                      v-for="t in treatmentOptions"
                      :key="t.value"
                      class="firstVisitModal__checkbox"
                    >
                      <input v-model="row.treatments" type="checkbox" :value="t.value" />
                      {{ t.label }}
                    </label>
                  </div>
                  <textarea
                    v-model="row.remark"
                    class="firstVisitModal__textarea"
                    rows="2"
                    placeholder="備註"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              class="firstVisitModal__addBtn"
              :disabled="form.pastHistory.length >= 8"
              @click="addPastRow"
            >
              + 增加欄位
            </button>
          </section> -->

          <!-- 三、家族史 -->
          <!-- <section v-show="activeTab === 'family'" class="firstVisitModal__section">
            <h3 class="firstVisitModal__sectionTitle">
              <span class="firstVisitModal__sectionBar" aria-hidden="true" />
              三、家族史
            </h3>

            <div class="firstVisitModal__familyTable">
              <div class="firstVisitModal__familyHead" role="row">
                <span>關係</span>
                <span>疾病 (可複選)</span>
                <span>備註</span>
              </div>

              <div
                v-for="row in form.familyHistory"
                :key="row.relation"
                class="firstVisitModal__familyRow"
              >
                <span class="firstVisitModal__familyRelation">{{ row.relation }}</span>
                <div class="firstVisitModal__familyDiseases">
                  <label
                    v-for="d in familyDiseaseOptions"
                    :key="d.value"
                    class="firstVisitModal__checkbox"
                  >
                    <input v-model="row.diseases" type="checkbox" :value="d.value" />
                    {{ d.label }}
                  </label>
                  <label class="firstVisitModal__checkbox firstVisitModal__checkbox--other">
                    <input v-model="row.diseases" type="checkbox" value="other" />
                    其它
                    <input
                      v-model="row.otherDisease"
                      type="text"
                      class="firstVisitModal__input firstVisitModal__input--sm"
                      :disabled="!row.diseases.includes('other')"
                    />
                  </label>
                </div>
                <textarea
                  v-model="row.remark"
                  class="firstVisitModal__textarea"
                  rows="3"
                />
              </div>
            </div>
          </section> -->

          <!-- 四、目前使用藥物 -->
          <!-- <section v-show="activeTab === 'medication'" class="firstVisitModal__section">
            <div class="firstVisitModal__sectionHead">
              <h3 class="firstVisitModal__sectionTitle">
                <span class="firstVisitModal__sectionBar" aria-hidden="true" />
                四、目前使用藥物
              </h3>
              <span class="firstVisitModal__hint">格式：藥名 - 數量 - 使用方式</span>
            </div>

            <div class="firstVisitModal__medSplit">
              <textarea
                v-model="form.medications.text"
                class="firstVisitModal__textarea firstVisitModal__textarea--med"
                placeholder="輸入藥物..."
                @input="filterMedications"
              />
              <ul class="firstVisitModal__medList">
                <li v-if="filteredMedicationSuggestions.length === 0" class="firstVisitModal__medEmpty">
                  無符合項目
                </li>
                <li
                  v-for="item in filteredMedicationSuggestions"
                  :key="item"
                  class="firstVisitModal__medItem"
                >
                  <button type="button" @click="appendMedication(item)">
                    {{ item }}
                  </button>
                </li>
              </ul>
            </div>
          </section> -->

          <!-- 五、現在病史 -->
          <!-- <section v-show="activeTab === 'present'" class="firstVisitModal__section">
            <h3 class="firstVisitModal__sectionTitle">
              <span class="firstVisitModal__sectionBar" aria-hidden="true" />
              五、現在病史
            </h3>

            <div class="firstVisitModal__presentTable">
              <div class="firstVisitModal__presentHead" role="row">
                <span>嚴重順序</span>
                <span>疾病類</span>
                <span>症狀</span>
                <span>發病多久 (ex. 8M)</span>
                <span>備註</span>
              </div>

              <div
                v-for="(row, index) in form.presentHistory"
                :key="row.id"
                class="firstVisitModal__presentRow"
              >
                <span class="firstVisitModal__presentOrder">
                  {{ String(index + 1).padStart(2, "0") }}
                </span>
                <select v-model="row.category" class="firstVisitModal__select">
                  <option value="">請選擇疾病類</option>
                  <option
                    v-for="cat in diseaseCategories"
                    :key="cat"
                    :value="cat"
                  >
                    {{ cat }}
                  </option>
                </select>
                <textarea
                  v-model="row.symptoms"
                  class="firstVisitModal__textarea firstVisitModal__textarea--cell"
                  placeholder="症狀"
                  rows="2"
                />
                <textarea
                  v-model="row.duration"
                  class="firstVisitModal__textarea firstVisitModal__textarea--cell"
                  placeholder="發病多久"
                  rows="2"
                />
                <textarea
                  v-model="row.remark"
                  class="firstVisitModal__textarea firstVisitModal__textarea--cell"
                  placeholder="備註"
                  rows="2"
                />
              </div>
            </div>
          </section> -->
        </div>
        </div>

        <footer class="firstVisitModal__footer">
          <template v-if="wizardStep === 1">
            <button
              type="button"
              class="firstVisitModal__btn firstVisitModal__btn--outline"
              @click="handleCloseRequest"
            >
              取消
            </button>
            <div class="firstVisitModal__footerRight">
              <!-- <button
                type="button"
                class="firstVisitModal__btn firstVisitModal__btn--outline"
                :disabled="insertingBasic"
                @click="handleBasicNext"
              >
                {{ insertingBasic ? "處理中..." : "下一步：初診健康史問卷" }}
              </button> -->
              <button
                type="button"
                class="firstVisitModal__btn firstVisitModal__btn--primary"
                :disabled="insertingBasic"
                @click="handleBasicSaveOnly"
              >
                {{ insertingBasic ? "儲存中..." : "儲存" }}
              </button>
            </div>
          </template>
          <template v-else>
            <button
              type="button"
              class="firstVisitModal__btn firstVisitModal__btn--outline"
              @click="handleCloseRequest"
            >
              取消
            </button>
            <button
              type="button"
              class="firstVisitModal__btn firstVisitModal__btn--primary"
              :disabled="saving"
              @click="handleSave"
            >
              {{ saving ? "儲存中..." : "儲存" }}
            </button>
          </template>
        </footer>
      </div>

      <!-- 取消確認（有填寫內容時） -->
      <transition name="fv-fade">
        <div
          v-if="cancelConfirmVisible"
          class="firstVisitModal__confirmMask"
          role="presentation"
          @click.self="cancelConfirmVisible = false"
        >
          <div class="firstVisitModal__confirmBox" role="dialog" aria-modal="true" aria-labelledby="fvCancelTitle">
            <button
              type="button"
              class="firstVisitModal__confirmClose"
              aria-label="關閉"
              @click="cancelConfirmVisible = false"
            >
              ×
            </button>
            <div class="firstVisitModal__confirmHead">
              <span class="firstVisitModal__confirmIcon" aria-hidden="true">!</span>
              <h3 id="fvCancelTitle" class="firstVisitModal__confirmTitle">確定要取消嗎</h3>
            </div>
            <p class="firstVisitModal__confirmMsg">你填寫的東西都不會儲存喔～</p>
            <div class="firstVisitModal__confirmActions">
              <button type="button" class="firstVisitModal__confirmLink" @click="cancelConfirmVisible = false">
                返回編輯
              </button>
              <button type="button" class="firstVisitModal__btn firstVisitModal__btn--primary" @click="confirmAbortWizard">
                確定取消
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from "vue";
import {
  buildInsertReportPayload,
  submitInsertReport,
} from "@/utils/firstVisitInsertReport";
import {
  submitInsertIndividual,
  type InsertIndividualPayload,
} from "@/utils/firstVisitInsertIndividual";

export type FirstVisitPatient = {
  /** Individual.PID，Insert_Report 必填 */
  pid?: string;
  chartNo?: string;
  name?: string;
  /** 手機（講座報名帶入） */
  mobile?: string;
  nameExtra?: string;
  gender?: string;
  age?: string;
  firstVisitDate?: string;
};

type HabitOption = "none" | "occasionally" | "yes" | "quit";

type HabitFieldKey = "coffee" | "tea" | "smoking" | "alcohol";

type HabitRow = {
  option: HabitOption | "";
  amount: string;
  remark: string;
};

type PastHistoryRow = {
  id: string;
  disease: string;
  time: string;
  treatments: string[];
  remark: string;
};

type FamilyHistoryRow = {
  relation: string;
  diseases: string[];
  otherDisease: string;
  remark: string;
};

type PresentHistoryRow = {
  id: string;
  category: string;
  symptoms: string;
  duration: string;
  remark: string;
};

export type FirstVisitFormData = {
  life: {
    coffee: HabitRow;
    tea: HabitRow;
    smoking: HabitRow;
    alcohol: HabitRow;
    exercise: {
      option: "none" | "yes" | "";
      timesPerWeek: string;
      minutesPerTime: string;
      remark: string;
    };
    workStatus: string;
    workRemark: string;
    sleepMed: string;
    sleepFrom: string;
    sleepTo: string;
    sleepFallHours: string;
    sleepWakeCount: string;
    sleepRemark: string;
    bpLevel: string;
    bpOther: string;
    bpSystolic: string;
    bpDiastolic: string;
    pulse: string;
    stressSource: string;
    skinAllergy: "none" | "yes" | "";
    allergen: string;
    relaxHabits: string[];
    relaxOther: string;
    other: string;
  };
  pastHistory: PastHistoryRow[];
  familyHistory: FamilyHistoryRow[];
  medications: { text: string };
  presentHistory: PresentHistoryRow[];
};

const props = withDefaults(
  defineProps<{
    show: boolean;
    patient?: FirstVisitPatient;
    /** 對應 Insert_Individual.Source */
    seminarSourceLabel?: string;
    /** 對應 Insert_Individual.SourceDate，格式 yyyyMMdd */
    seminarSourceDateYYYYMMDD?: string;
  }>(),
  {
    patient: () => ({}),
    seminarSourceLabel: "講座活動",
    seminarSourceDateYYYYMMDD: "",
  }
);

const emit = defineEmits<{
  close: [];
  save: [data: FirstVisitFormData];
}>();

const tabs = [
  { key: "life", label: "生活史" },
  { key: "past", label: "過去病史" },
  { key: "family", label: "家族史" },
  { key: "medication", label: "目前使用藥物" },
  { key: "present", label: "現在病史" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const activeTab = ref<TabKey>("life");

const habitOptions = [
  { value: "none", label: "無" },
  { value: "occasionally", label: "偶爾有" },
  { value: "yes", label: "有" },
  { value: "quit", label: "已戒" },
] as const;

const habitFields: {
  key: HabitFieldKey;
  label: string;
  unit: string;
  remarkLabel: string;
  showAmount: boolean;
}[] = [
  { key: "coffee", label: "每天喝咖啡", unit: "杯/天", remarkLabel: "咖啡備註", showAmount: true },
  { key: "tea", label: "每天喝茶", unit: "杯/天", remarkLabel: "喝茶備註", showAmount: true },
  { key: "smoking", label: "每天抽菸", unit: "支/天", remarkLabel: "抽菸備註", showAmount: true },
  { key: "alcohol", label: "每天喝酒", unit: "杯/天", remarkLabel: "喝酒備註", showAmount: true },
];

const workStatusOptions = [
  { value: "none", label: "無" },
  { value: "yes", label: "有" },
  { value: "self", label: "自營" },
  { value: "retired", label: "退休" },
  { value: "student", label: "學生" },
];

const sleepMedOptions = [
  { value: "none", label: "無吃藥" },
  { value: "occasionally", label: "偶爾吃藥" },
  { value: "daily", label: "每天吃藥" },
];

const bpLevelOptions = [
  { value: "normal", label: "正常" },
  { value: "high", label: "偏高" },
  { value: "low", label: "偏低" },
];

const relaxOptions = [
  { value: "none", label: "無" },
  { value: "massage", label: "按摩" },
  { value: "gym", label: "上健身房" },
  { value: "spa", label: "SPA" },
  { value: "yoga", label: "瑜珈" },
];

const treatmentOptions = [
  { value: "medication", label: "藥物" },
  { value: "surgery", label: "手術" },
  { value: "radiation", label: "放射化療" },
  { value: "other", label: "其它" },
];

const familyDiseaseOptions = [
  { value: "heart", label: "心臟病" },
  { value: "hypertension", label: "高血壓" },
  { value: "diabetes", label: "糖尿病" },
];

const diseaseCategories = [
  "神經系統",
  "心血管系統",
  "呼吸系統",
  "消化系統",
  "內分泌",
  "肌肉骨骼",
  "皮膚",
  "精神心理",
  "婦科",
  "其他",
];

const medicationSuggestions = [
  "Stilnox (10)-0.5-HS",
  "Stilnox (10)-1-HS",
  "Stogame (300)-1-BID",
  "Stogame (300)-2-BID",
  "Synthroid (50)-1-QD",
  "Synthroid (100)-1-QD",
  "Sertraline (50)-1-QD",
  "Simvastatin (20)-1-HS",
];

function createEmptyHabitRow(): HabitRow {
  return { option: "", amount: "", remark: "" };
}

function createPastRow(): PastHistoryRow {
  return {
    id: crypto.randomUUID(),
    disease: "",
    time: "",
    treatments: [],
    remark: "",
  };
}

function createPresentRow(): PresentHistoryRow {
  return {
    id: crypto.randomUUID(),
    category: "",
    symptoms: "",
    duration: "",
    remark: "",
  };
}

function buildInitialForm(): FirstVisitFormData {
  return {
    life: {
      coffee: createEmptyHabitRow(),
      tea: createEmptyHabitRow(),
      smoking: createEmptyHabitRow(),
      alcohol: createEmptyHabitRow(),
      exercise: {
        option: "",
        timesPerWeek: "",
        minutesPerTime: "",
        remark: "",
      },
      workStatus: "",
      workRemark: "",
      sleepMed: "",
      sleepFrom: "",
      sleepTo: "",
      sleepFallHours: "",
      sleepWakeCount: "",
      sleepRemark: "",
      bpLevel: "",
      bpOther: "",
      bpSystolic: "",
      bpDiastolic: "",
      pulse: "",
      stressSource: "",
      skinAllergy: "",
      allergen: "",
      relaxHabits: [],
      relaxOther: "",
      other: "",
    },
    pastHistory: [createPastRow()],
    familyHistory: [
      { relation: "父", diseases: [], otherDisease: "", remark: "" },
      { relation: "母", diseases: [], otherDisease: "", remark: "" },
      { relation: "配偶", diseases: [], otherDisease: "", remark: "" },
      { relation: "手足子女", diseases: [], otherDisease: "", remark: "" },
      { relation: "其它", diseases: [], otherDisease: "", remark: "" },
    ],
    medications: { text: "" },
    presentHistory: Array.from({ length: 10 }, () => createPresentRow()),
  };
}

const form = reactive<FirstVisitFormData>(buildInitialForm());
const medFilter = ref("");
const saving = ref(false);

const teeSizes = ["XS", "S", "M", "L", "XL", "2L", "3L", "4L"] as const;

const wizardStep = ref<1 | 2>(1);
const insertedPid = ref("");
const insertingBasic = ref(false);
const cancelConfirmVisible = ref(false);
const profileOpenedAt = ref<Date | null>(null);

const basicForm = reactive({
  name: "",
  mobile: "",
  birthdayInput: "",
  height: "",
  weight: "",
  teeMaleSize: "",
  teeFemaleSize: "",
  teeChildCustom: "",
});

const basicDirtyBaseline = ref("");
const questionnaireBaseline = ref("");

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function padDateCompact(d: Date) {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}${mo}${da}`;
}

const resolvedSourceDate = computed(() => {
  const raw = props.seminarSourceDateYYYYMMDD?.trim();
  if (/^\d{8}$/.test(raw)) return raw;
  return padDateCompact(new Date());
});

const resolvedSourceLabel = computed(
  () => props.seminarSourceLabel?.trim() || "講座活動"
);

function formatYYYYMMDDToSlash(yyyymmdd: string) {
  if (!/^\d{8}$/.test(yyyymmdd)) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}/${yyyymmdd.slice(4, 6)}/${yyyymmdd.slice(6, 8)}`;
}

function weekdayZh(yyyymmdd: string) {
  if (!/^\d{8}$/.test(yyyymmdd)) return "";
  const y = parseInt(yyyymmdd.slice(0, 4), 10);
  const m = parseInt(yyyymmdd.slice(4, 6), 10) - 1;
  const d = parseInt(yyyymmdd.slice(6, 8), 10);
  const dt = new Date(y, m, d);
  return ["日", "一", "二", "三", "四", "五", "六"][dt.getDay()] ?? "";
}

const sourceDisplayLine = computed(() => {
  const d = resolvedSourceDate.value;
  const w = weekdayZh(d);
  return `${resolvedSourceLabel.value} - ${formatYYYYMMDDToSlash(d)}${w ? ` (${w})` : ""}`;
});

const profileCreatedAtDisplay = computed(() => {
  const d = profileOpenedAt.value ?? new Date();
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
});

function serializeBasicForm() {
  return {
    name: basicForm.name,
    mobile: basicForm.mobile,
    birthdayInput: basicForm.birthdayInput,
    height: basicForm.height,
    weight: basicForm.weight,
    teeMaleSize: basicForm.teeMaleSize,
    teeFemaleSize: basicForm.teeFemaleSize,
    teeChildCustom: basicForm.teeChildCustom,
  };
}

function resetBasicFormFields() {
  basicForm.name = "";
  basicForm.mobile = "";
  basicForm.birthdayInput = "";
  basicForm.height = "";
  basicForm.weight = "";
  basicForm.teeMaleSize = "";
  basicForm.teeFemaleSize = "";
  basicForm.teeChildCustom = "";
}

function initBasicFormFromProps() {
  resetBasicFormFields();
  const n = props.patient?.name?.trim();
  basicForm.name = n && n !== "-" ? n : "";
  const m = props.patient?.mobile?.trim();
  basicForm.mobile = m && m !== "-" ? m : "";
}

function birthdayToApi(yyyyMmDd: string): string {
  if (!yyyyMmDd) return "";
  const s = yyyyMmDd.replace(/-/g, "");
  return /^\d{8}$/.test(s) ? s : "";
}

function buildTeePayload(): { TT_Type: string; TT_Size: string } | null {
  const child = basicForm.teeChildCustom.trim();
  if (child) {
    return { TT_Type: "兒童", TT_Size: child };
  }
  if (basicForm.teeMaleSize) {
    return { TT_Type: "成人", TT_Size: `男${basicForm.teeMaleSize}` };
  }
  if (basicForm.teeFemaleSize) {
    return { TT_Type: "成人", TT_Size: `女${basicForm.teeFemaleSize}` };
  }
  return null;
}

function onPickMaleTee(sz: string) {
  basicForm.teeFemaleSize = "";
  basicForm.teeChildCustom = "";
  basicForm.teeMaleSize = sz;
}

function onPickFemaleTee(sz: string) {
  basicForm.teeMaleSize = "";
  basicForm.teeChildCustom = "";
  basicForm.teeFemaleSize = sz;
}

function onChildTeeInput() {
  if (basicForm.teeChildCustom.trim()) {
    basicForm.teeMaleSize = "";
    basicForm.teeFemaleSize = "";
  }
}

const effectivePid = computed(
  () => (insertedPid.value || props.patient?.pid || "").trim()
);

const patientForStep2 = computed<FirstVisitPatient>(() => {
  const pid = effectivePid.value;
  return {
    ...props.patient,
    pid,
    chartNo: pid || props.patient?.chartNo || "-",
    name: basicForm.name.trim() || props.patient?.name || "-",
  };
});

const isBasicFormDirty = computed(
  () => JSON.stringify(serializeBasicForm()) !== basicDirtyBaseline.value
);

const isQuestionnaireDirty = computed(
  () => JSON.stringify(form) !== questionnaireBaseline.value
);

async function runInsertIndividual(): Promise<{ ok: boolean; message?: string }> {
  const { adminID, token } = getBackendAuth();
  if (!adminID || !token) {
    return { ok: false, message: "請先登入後台" };
  }

  const name = basicForm.name.trim();
  const mobile = basicForm.mobile.trim();
  if (!name || !mobile) {
    return { ok: false, message: "請填寫姓名與電話" };
  }

  const birthday = birthdayToApi(basicForm.birthdayInput);
  if (!birthday) {
    return { ok: false, message: "請選擇出生年月日" };
  }

  const tee = buildTeePayload();
  if (!tee) {
    return { ok: false, message: "請選擇或填寫 T 恤尺寸" };
  }

  const payload: InsertIndividualPayload = {
    AdminID: adminID,
    Token: token,
    Name: name,
    Mobile: mobile,
    Birthday: birthday,
    Source: resolvedSourceLabel.value,
    SourceDate: resolvedSourceDate.value,
    Height: basicForm.height.trim(),
    Weight: basicForm.weight.trim(),
    TT_Type: tee.TT_Type,
    TT_Size: tee.TT_Size,
  };

  try {
    const data = await submitInsertIndividual(payload);
    if (data.Result === "OK" && data.PID) {
      insertedPid.value = String(data.PID).trim();
      return { ok: true };
    }
    return {
      ok: false,
      message: data.Message || data.Result || "建檔失敗",
    };
  } catch (error: unknown) {
    console.error("Insert_Individual 失敗:", error);
    const err = error as {
      response?: { data?: { Message?: string } };
      message?: string;
    };
    return {
      ok: false,
      message: err.response?.data?.Message || err.message || "建檔失敗",
    };
  }
}

async function handleBasicSaveOnly() {
  insertingBasic.value = true;
  try {
    const r = await runInsertIndividual();
    if (r.ok) {
      alert("基本資料儲存成功");
    } else {
      alert(r.message || "建檔失敗");
    }
  } finally {
    insertingBasic.value = false;
  }
}

async function handleBasicNext() {
  insertingBasic.value = true;
  try {
    const r = await runInsertIndividual();
    if (!r.ok) {
      alert(r.message || "建檔失敗");
      return;
    }
    wizardStep.value = 2;
  } finally {
    insertingBasic.value = false;
  }
}

function handleCloseRequest() {
  if (wizardStep.value === 1 && isBasicFormDirty.value) {
    cancelConfirmVisible.value = true;
    return;
  }
  if (wizardStep.value === 2 && isQuestionnaireDirty.value) {
    cancelConfirmVisible.value = true;
    return;
  }
  emit("close");
}

function confirmAbortWizard() {
  cancelConfirmVisible.value = false;
  emit("close");
}

function getBackendAuth() {
  const adminID =
    localStorage.getItem("adminID") || sessionStorage.getItem("adminID") || "";
  const token =
    localStorage.getItem("backendToken") ||
    sessionStorage.getItem("backendToken") ||
    "";
  return { adminID, token };
}

const filteredMedicationSuggestions = computed(() => {
  const keyword = medFilter.value.trim().toLowerCase();
  if (!keyword) return medicationSuggestions;
  return medicationSuggestions.filter((item) =>
    item.toLowerCase().includes(keyword)
  );
});

function isHabitActive(option: HabitOption | "") {
  return option === "yes" || option === "occasionally";
}

function filterMedications() {
  medFilter.value = form.medications.text;
}

function appendMedication(item: string) {
  const lines = form.medications.text
    .split("\n")
    .map((line: string) => line.trim())
    .filter(Boolean);
  if (!lines.includes(item)) {
    lines.push(item);
  }
  form.medications.text = lines.join("\n");
  medFilter.value = form.medications.text;
}

function addPastRow() {
  if (form.pastHistory.length >= 8) return;
  form.pastHistory.push(createPastRow());
}

function removePastRow(index: number) {
  if (form.pastHistory.length <= 1) return;
  form.pastHistory.splice(index, 1);
}

function resetForm() {
  Object.assign(form, buildInitialForm());
  activeTab.value = "life";
  medFilter.value = "";
}

async function handleSave() {
  const pid = effectivePid.value;
  if (!pid) {
    alert("缺少病患病歷 PID，無法儲存生活史");
    return;
  }

  const { adminID, token } = getBackendAuth();
  if (!adminID || !token) {
    alert("請先登入後台");
    return;
  }

  const formSnapshot = JSON.parse(
    JSON.stringify(form)
  ) as FirstVisitFormData;

  saving.value = true;
  try {
    const payload = buildInsertReportPayload(adminID, token, pid, {
      ...formSnapshot.life,
    });
    const result = await submitInsertReport(payload);

    if (result.Result === "OK") {
      emit("save", formSnapshot);
      alert("生活史儲存成功");
      emit("close");
      return;
    }

    alert(`儲存失敗：${result.Message || result.Result || "未知錯誤"}`);
  } catch (error: unknown) {
    console.error("Insert_Report 失敗:", error);
    const err = error as { response?: { data?: { Message?: string } }; message?: string };
    alert(
      `儲存失敗：${err.response?.data?.Message || err.message || "請稍後再試"}`
    );
  } finally {
    saving.value = false;
  }
}

watch(
  () => props.show,
  (visible: boolean) => {
    if (visible) {
      profileOpenedAt.value = new Date();
      wizardStep.value = 1;
      insertedPid.value = "";
      cancelConfirmVisible.value = false;
      resetForm();
      initBasicFormFromProps();
      nextTick(() => {
        basicDirtyBaseline.value = JSON.stringify(serializeBasicForm());
        questionnaireBaseline.value = JSON.stringify(form);
      });
    }
  }
);
</script>

<style scoped lang="scss">
$teal: #1ba39b;
$gray-bg: #f5f7fa;
$border: #d8e2ef;
$text: #2d3047;
$text-muted: #6b7a90;

.firstVisitModal {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(18, 31, 45, 0.45);
}

.firstVisitModal__box {
  display: flex;
  flex-direction: column;
  width: min(1100px, 100%);
  max-height: min(92vh, 900px);
  background: #fff;
  border: 3px solid $teal;
  border-radius: 20px;
  box-shadow: 0 2px 20px rgba(27, 163, 155, 0.25);
  overflow: hidden;
}

.firstVisitModal__header {
  flex-shrink: 0;
  padding: 1.25rem 1.5rem 0.75rem;
  text-align: center;
}

.firstVisitModal__logo {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 10px;
  border: 1px solid $teal;
  padding: 2px 4px;
}

.firstVisitModal__title {
  margin: 0.5rem 0 0.75rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: $text;
}

.firstVisitModal__stepper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  max-width: 420px;
  margin: 0 auto;
}

.firstVisitModal__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  min-width: 120px;
}

.firstVisitModal__stepCircle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
  border: 2px solid $border;
  color: $text-muted;
  background: #fff;
}

.firstVisitModal__step--done .firstVisitModal__stepCircle {
  border-color: $teal;
  background: $teal;
  color: #fff;
}

.firstVisitModal__step--active .firstVisitModal__stepCircle {
  border-color: $teal;
  background: $teal;
  color: #fff;
}

.firstVisitModal__stepLabel {
  font-size: 12px;
  color: $text-muted;
  text-align: center;
  line-height: 1.3;
}

.firstVisitModal__step--active .firstVisitModal__stepLabel,
.firstVisitModal__step--done .firstVisitModal__stepLabel {
  color: $teal;
  font-weight: 600;
}

.firstVisitModal__stepLine {
  flex: 1;
  height: 2px;
  margin-top: 14px;
  min-width: 48px;
  background: $teal;

  &--muted {
    background: $border;
  }
}

.firstVisitModal__step2 {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.firstVisitModal__basicWrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 1.25rem 1.25rem;
  background: #fafbfc;
}

.firstVisitModal__sectionTitle--basic {
  margin-top: 0.15rem;
}

.firstVisitModal__basicGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem 1rem;
  margin-bottom: 1rem;
}

.firstVisitModal__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;

  &--full {
    grid-column: 1 / -1;
  }
}

.firstVisitModal__fieldLabel {
  font-size: 13px;
  font-weight: 600;
  color: $text;
}

.firstVisitModal__sourceReadonly {
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: 1px solid $border;
  background: $gray-bg;
  font-size: 13px;
  color: $text-muted;
}

.firstVisitModal__input--date {
  min-height: 40px;
}

.firstVisitModal__teeBlock {
  border: 1px solid rgba($teal, 0.35);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  background: #fff;
}

.firstVisitModal__teeHead {
  display: grid;
  grid-template-columns: 1fr 100px 1fr;
  gap: 0.5rem;
  padding: 0.45rem 0.65rem;
  background: rgba($teal, 0.12);
  font-size: 12px;
  font-weight: 700;
  color: $teal;
}

.firstVisitModal__teeHeadSub {
  text-align: center;
}

.firstVisitModal__teeRow--label {
  padding: 0.35rem 0.65rem;
  font-size: 12px;
  font-weight: 700;
  color: $text;
  background: rgba($teal, 0.06);
}

.firstVisitModal__teeSubRow {
  display: grid;
  grid-template-columns: 44px 1fr;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.5rem 0.5rem;
  border-top: 1px solid $border;
}

.firstVisitModal__teeGender {
  font-size: 12px;
  font-weight: 600;
  color: $text-muted;
  text-align: center;
}

.firstVisitModal__teeRadios {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem;
}

.firstVisitModal__teeRadio {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 12px;
  color: $text;
  cursor: pointer;

  input {
    accent-color: $teal;
  }
}

.firstVisitModal__teeChildRow {
  padding: 0.5rem 0.65rem 0.65rem;
  border-top: 1px solid $border;
}

.firstVisitModal__filedAt {
  margin: 0;
  font-size: 12px;
  color: $text-muted;
}

.firstVisitModal__patientBar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0 1.25rem 0.75rem;
}

.firstVisitModal__patientItem {
  flex: 1 1 auto;
  min-width: 120px;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  background: $gray-bg;
  font-size: 13px;
  color: $text;

  &--highlight {
    background: rgba($teal, 0.12);
    color: $teal;
    font-weight: 700;
    border: 1px solid rgba($teal, 0.35);
  }
}

.firstVisitModal__tabs {
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  padding: 0 1rem;
  background: $gray-bg;
  border-top: 1px solid $border;
  border-bottom: 1px solid $border;
}

.firstVisitModal__tab {
  flex: 1;
  padding: 0.65rem 0.5rem;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: $text-muted;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: color 0.15s, background 0.15s, border-color 0.15s;

  &.active {
    background: #fff;
    color: $teal;
    border-bottom-color: $teal;
  }

  &:hover:not(.active) {
    color: $text;
  }
}

.firstVisitModal__body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem 1.25rem;
  background: #fafbfc;
}

.firstVisitModal__sectionTitle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 700;
  color: $text;
}

.firstVisitModal__sectionBar {
  display: inline-block;
  width: 4px;
  height: 1.1em;
  border-radius: 2px;
  background: $teal;
}

.firstVisitModal__sectionHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  .firstVisitModal__sectionTitle {
    margin-bottom: 0;
  }
}

.firstVisitModal__hint {
  font-size: 12px;
  color: $text-muted;
  white-space: nowrap;
}

.firstVisitModal__habitRow {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 0.75rem 1rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid rgba($border, 0.6);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.firstVisitModal__habitLabel {
  font-size: 14px;
  font-weight: 600;
  color: $text;
  padding-top: 0.25rem;
}

.firstVisitModal__habitControls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.firstVisitModal__radioGroup {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
}

.firstVisitModal__radio {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 13px;
  color: $text;
  cursor: pointer;
  white-space: nowrap;

  input {
    accent-color: $teal;
  }

  &--other {
    flex-wrap: wrap;
    gap: 0.35rem;
  }
}

.firstVisitModal__checkboxGroup {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;

  &--compact {
    margin-bottom: 0.5rem;
  }
}

.firstVisitModal__checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 13px;
  cursor: pointer;

  input {
    accent-color: $teal;
  }

  &--other {
    flex-wrap: wrap;
  }
}

.firstVisitModal__inlineInputs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.5rem;
  font-size: 13px;
  color: $text-muted;

  &--wrap {
    row-gap: 0.5rem;
  }
}

.firstVisitModal__unit {
  font-size: 12px;
  color: $text-muted;
  white-space: nowrap;
}

.firstVisitModal__remarkRow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.firstVisitModal__remarkLabel {
  flex-shrink: 0;
  font-size: 12px;
  color: $text-muted;
  min-width: 4.5rem;
}

.firstVisitModal__input {
  flex: 1;
  min-width: 0;
  padding: 0.4rem 0.65rem;
  border: 1px solid $border;
  border-radius: 8px;
  font-size: 13px;
  background: #fff;

  &:focus {
    outline: none;
    border-color: $teal;
    box-shadow: 0 0 0 2px rgba($teal, 0.15);
  }

  &:disabled {
    background: #f0f2f5;
    color: $text-muted;
  }

  &--xs {
    flex: 0 0 56px;
    width: 56px;
  }

  &--sm {
    flex: 0 0 100px;
    width: 100px;
  }
}

.firstVisitModal__textarea {
  width: 100%;
  padding: 0.5rem 0.65rem;
  border: 1px solid $border;
  border-radius: 8px;
  font-size: 13px;
  resize: vertical;
  background: #fff;

  &:focus {
    outline: none;
    border-color: $teal;
  }

  &--med {
    min-height: 220px;
  }

  &--cell {
    min-height: 52px;
  }
}

.firstVisitModal__fieldBlock {
  margin-top: 0.75rem;

  .firstVisitModal__habitLabel {
    display: block;
    margin-bottom: 0.5rem;
  }
}

.firstVisitModal__pastTable {
  border: 1px solid $border;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.firstVisitModal__pastHead {
  display: grid;
  grid-template-columns: 1fr 0.7fr 1.4fr;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: rgba($teal, 0.12);
  font-size: 13px;
  font-weight: 700;
  color: $teal;
}

.firstVisitModal__pastRow {
  display: grid;
  grid-template-columns: 1fr 0.7fr 1.4fr;
  gap: 0.75rem;
  padding: 0.75rem;
  border-top: 1px solid $border;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.firstVisitModal__pastCol--wide {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.firstVisitModal__deleteBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.35rem;
  padding: 0;
  border: none;
  background: none;
  color: $teal;
  font-size: 12px;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.firstVisitModal__addBtn {
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.65rem;
  border: 1px dashed $teal;
  border-radius: 10px;
  background: #fff;
  color: $teal;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: rgba($teal, 0.06);
  }
}

.firstVisitModal__familyTable {
  border: 1px solid $border;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.firstVisitModal__familyHead {
  display: grid;
  grid-template-columns: 90px 1fr 1.2fr;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: rgba($teal, 0.12);
  font-size: 13px;
  font-weight: 700;
  color: $teal;

  @media (max-width: 768px) {
    display: none;
  }
}

.firstVisitModal__familyRow {
  display: grid;
  grid-template-columns: 90px 1fr 1.2fr;
  gap: 0.75rem;
  padding: 0.75rem;
  border-top: 1px solid $border;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.firstVisitModal__familyRelation {
  font-weight: 700;
  font-size: 14px;
  color: $text;
  padding-top: 0.35rem;
}

.firstVisitModal__familyDiseases {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
}

.firstVisitModal__medSplit {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  min-height: 240px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.firstVisitModal__medList {
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
  max-height: 280px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.firstVisitModal__medItem button {
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.65rem;
  border: 1px solid $border;
  border-radius: 8px;
  background: $gray-bg;
  font-size: 12px;
  color: $text;
  cursor: pointer;

  &:hover {
    border-color: $teal;
    background: rgba($teal, 0.08);
  }
}

.firstVisitModal__medEmpty {
  padding: 1rem;
  text-align: center;
  color: $text-muted;
  font-size: 13px;
}

.firstVisitModal__presentTable {
  border: 1px solid $border;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.firstVisitModal__presentHead {
  display: grid;
  grid-template-columns: 72px 1fr 1fr 1fr 1fr;
  gap: 0.35rem;
  padding: 0.6rem 0.5rem;
  background: rgba($teal, 0.12);
  font-size: 12px;
  font-weight: 700;
  color: $teal;

  @media (max-width: 900px) {
    display: none;
  }
}

.firstVisitModal__presentRow {
  display: grid;
  grid-template-columns: 72px 1fr 1fr 1fr 1fr;
  gap: 0.35rem;
  padding: 0.5rem;
  border-top: 1px solid $border;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 0.75rem;
  }
}

.firstVisitModal__presentOrder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  color: $text-muted;
  padding-top: 0.5rem;
}

.firstVisitModal__select {
  width: 100%;
  padding: 0.4rem 0.5rem;
  border: 1px solid $border;
  border-radius: 8px;
  font-size: 13px;
  background: #fff;

  &:focus {
    outline: none;
    border-color: $teal;
  }
}

.firstVisitModal__footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid $border;
  background: #fff;
}

.firstVisitModal__footerRight {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-left: auto;
}

.firstVisitModal__confirmMask {
  position: fixed;
  inset: 0;
  z-index: 1110;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(18, 31, 45, 0.55);
}

.firstVisitModal__confirmBox {
  position: relative;
  width: min(400px, 100%);
  padding: 1.35rem 1.25rem 1.15rem;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.firstVisitModal__confirmClose {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: $text-muted;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;

  &:hover {
    color: $text;
    background: $gray-bg;
  }
}

.firstVisitModal__confirmHead {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  margin-bottom: 0.5rem;
  padding-right: 1.5rem;
}

.firstVisitModal__confirmIcon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ffc107;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 800;
}

.firstVisitModal__confirmTitle {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: $text;
}

.firstVisitModal__confirmMsg {
  margin: 0 0 1.25rem;
  padding-left: calc(36px + 0.65rem);
  font-size: 14px;
  color: $text-muted;
  line-height: 1.5;
}

.firstVisitModal__confirmActions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.firstVisitModal__confirmLink {
  border: none;
  background: none;
  padding: 0.35rem 0.5rem;
  font-size: 14px;
  font-weight: 700;
  color: $teal;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.firstVisitModal__btn {
  min-width: 88px;
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;

  &--outline {
    border: 1px solid $teal;
    background: #fff;
    color: $teal;
  }

  &--primary {
    border: none;
    background: $teal;
    color: #fff;
  }

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.fv-fade-enter-active,
.fv-fade-leave-active {
  transition: opacity 0.2s ease;
}

.fv-fade-enter-from,
.fv-fade-leave-to {
  opacity: 0;
}
</style>
