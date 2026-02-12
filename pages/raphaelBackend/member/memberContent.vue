<template>
  <div v-if="loading" class="loading-mask">
    <div class="loading-spinner"></div>
    <div>載入中，請稍候...</div>
  </div>

  <div v-else class="memberInfo">
    <Sidebar />
    <!-- ───── 彈窗 ───── -->

    <ContractUserAlert
      v-if="showContract"
      :contracts="contractList"
      :member-name="member?.Name ?? ''"
      @close="closeContract"
    />

    <AutonomicNerveAlert
      v-if="showANS"
      :record="selectedANS"
      @close="closeANS"
    />

    <LifeDetectAlert
      v-if="showLife"
      :record="selectedLife"
      @close="closeLife"
    />

    <EditBasicInfoModal
      :show="showEditBasicModal"
      :initial-data="{
        name: member?.Name ?? '',
        birthday: member?.Birthday ?? '',
        phone: member?.Mobile ?? '',
      }"
      @close="closeEditBasicModal"
      @submit="handleEditBasicSubmit"
    />

    <DeleteMemberModal
      :show="showDeleteMemberModal"
      @close="closeDeleteMemberModal"
      @confirm="handleDeleteMemberConfirm"
    />

    <!-- ───── 操作紀錄彈窗 ───── -->
    <div
      v-if="showOperationRecord"
      class="operationModalOverlay"
      @click="closeOperationRecord"
    >
      <div class="operationModal" @click.stop>
        <!-- 標題列 -->
        <div class="operationModalHeader">
          <div class="operationModalHeaderLeft">
            <img
              src="/assets/imgs/backend/Subtract.svg"
              alt="NP"
              class="npLogo"
            />
          </div>
          <div class="operationModalHeaderCenter">
            <h3>操作紀錄</h3>
          </div>
          <hr />
          <div class="operationModalHeaderRight">
            <span class="operationCount"
              >已操作 {{ operationRecordsData.length }} 筆</span
            >
            <div class="operationFilters">
              <VueDatePicker
                v-model="operationDateRange"
                range
                :enable-time-picker="false"
                format="yyyy/MM/dd"
                placeholder="操作日期查詢"
                prepend-icon="i-calendar"
                teleport="body"
                class="dateFilter"
              />
              <div class="eventFilterWrapper">
                <div class="eventFilterTrigger" @click="toggleEventFilter">
                  <img
                    src="/assets/imgs/backend/search.svg"
                    alt="filter"
                    style="width: 16px; height: 16px"
                  />
                  <span>事件篩選</span>
                  <img
                    src="/assets/imgs/backend/arrow-down.svg"
                    alt="arrow"
                    :class="{ rotated: showEventFilter }"
                  />
                </div>
                <div
                  class="eventFilterDropdown"
                  v-if="showEventFilter"
                  @click.stop
                >
                  <div
                    class="eventFilterOption"
                    v-for="event in availableEventOptions.length
                      ? availableEventOptions
                      : eventOptions"
                    :key="event"
                    @click="toggleEventOption(event)"
                  >
                    <input
                      type="checkbox"
                      :checked="selectedEvents.includes(event)"
                      @click.stop
                    />
                    <span>{{ event }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 表格內容 -->
        <div class="operationModalTable">
          <div class="operationTableHeader">
            <div class="operationTableHeaderItem">操作日期</div>
            <div class="operationTableHeaderItem">操作時間</div>
            <div class="operationTableHeaderItem">操作事件</div>
          </div>
          <div class="operationTableHR" />

          <div class="operationTableBody">
            <div
              class="operationTableRow"
              v-for="record in filteredOperationRecords"
              :key="record.id"
            >
              <div class="operationTableCell">{{ record.date }}</div>
              <div class="operationTableCell">{{ record.time }}</div>
              <div class="operationTableCell">{{ record.event }}</div>
            </div>
          </div>
        </div>

        <!-- 關閉按鈕 -->
        <div class="operationModalFooter">
          <div class="operationModalClose" @click="closeOperationRecord">
            <img src="/assets/imgs/backend/close.svg" alt="close" />
          </div>
        </div>
      </div>
    </div>

    <!-- ───── 手錶紀錄詳情彈窗 ───── -->
    <div
      v-if="showWatchDetailModal"
      class="watchDetailOverlay"
      @click="closeWatchDetail"
    >
      <div class="watchDetailModal" @click.stop>

        <div class="watchDetailHeader">
          <img src="/assets/imgs/backend/Subtract.svg" alt="NP" class="npLogo" />
          <h3 class="watchDetailDate">{{ selectedWatchRecord?.CheckTime || "—" }}</h3>
          <p class="watchDetailSub">Detection Time</p>
        </div>

        <div class="watchMetricCards">
          <div class="watchMetricCard">
            <span class="metricLabel">血壓</span>
            <span class="metricValue">{{ selectedWatchRecord?.bloodPressure || "—" }}</span>
            <span class="metricUnit">mm / hg</span>
          </div>
          <div class="watchMetricCard">
            <span class="metricLabel">心率</span>
            <span class="metricValue">{{ selectedWatchRecord?.heartRateVal ?? "—" }}</span>
            <span class="metricUnit">bpm</span>
          </div>
          <div class="watchMetricCard">
            <span class="metricLabel">血氧</span>
            <span class="metricValue">{{ selectedWatchRecord?.bloodOxygenVal ?? "—" }}</span>
            <span class="metricUnit">SpO2%</span>
          </div>
          <div class="watchMetricCard">
            <span class="metricLabel">HRV</span>
            <span class="metricValue">{{ selectedWatchRecord?.hrvVal ?? "—" }}</span>
            <span class="metricUnit">ms</span>
          </div>
          <div class="watchMetricCard">
            <span class="metricLabel">體溫</span>
            <span class="metricValue">{{ selectedWatchRecord?.tempVal ?? "—" }}</span>
            <span class="metricUnit">°C</span>
          </div>
          <div class="watchMetricCard">
            <span class="metricLabel">運動</span>
            <span class="metricValue">{{ selectedWatchRecord?.stepsVal ?? "—" }}</span>
            <span class="metricUnit">步</span>
          </div>
          <div class="watchMetricCard">
            <span class="metricLabel">壓力</span>
            <span class="metricValue">{{ selectedWatchRecord?.stressLevel || "—" }}</span>
            <span class="metricUnit">{{ selectedWatchRecord?.stressLevelEn || "" }}</span>
          </div>
        </div>


        <div class="watchSleepSection">
          <h4>睡眠時長 {{ selectedWatchRecord?.sleepDuration || "—" }}</h4>
          <div class="watchSleepGrid">
            <div class="watchSleepRow">
              <span class="sleepLabel">睡眠分數</span>
              <span class="sleepValue">{{ selectedWatchRecord?.sleepScore || "—" }}</span>
            </div>
            <div class="watchSleepRow">
              <span class="sleepLabel">清醒</span>
              <span class="sleepValue">{{ selectedWatchRecord?.sleepAwakePct || "—" }} | {{ selectedWatchRecord?.sleepAwakeDur || "—" }}</span>
            </div>
            <div class="watchSleepRow">
              <span class="sleepLabel">REM</span>
              <span class="sleepValue">{{ selectedWatchRecord?.sleepRemPct || "—" }}  | {{ selectedWatchRecord?.sleepRemDur || "—" }}</span>
            </div>
            <div class="watchSleepRow">
              <span class="sleepLabel">淺眠</span>
              <span class="sleepValue">{{ selectedWatchRecord?.sleepLightPct || "—" }} | {{ selectedWatchRecord?.sleepLightDur || "—" }}</span>
            </div>
            <div class="watchSleepRow">
              <span class="sleepLabel">深眠</span>
              <span class="sleepValue">{{ selectedWatchRecord?.sleepDeepPct || "—" }}  | {{ selectedWatchRecord?.sleepDeepDur || "—" }}</span>
            </div>
          </div>
        </div>

    
        <div class="watchBodySection">
          <h4>身體組成</h4>
          <div class="watchBodyGrid">
            <div class="watchBodyRow">
              <span class="bodyLabel">水分</span>
              <span class="bodyValue">{{ selectedWatchRecord?.bodyWater || "—" }}</span>
            </div>
            <div class="watchBodyRow">
              <span class="bodyLabel">體脂</span>
              <span class="bodyValue">{{ selectedWatchRecord?.bodyFat || "—" }}</span>
            </div>
            <div class="watchBodyRow">
              <span class="bodyLabel">肌肉</span>
              <span class="bodyValue">{{ selectedWatchRecord?.bodyMuscle || "—" }}</span>
            </div>
          </div>
        </div>


        <div class="watchDetailFooter">
          <div class="watchDetailClose" @click="closeWatchDetail">
            <img src="/assets/imgs/backend/close.svg" alt="close" />
          </div>
        </div>



      </div>
    </div>

 
    <Teleport to="body">
      <div
        v-if="showWeeklySummaryModal"
        class="weekly-summary-mask"
        @click.self="closeWeeklySummaryModal"
      >
        <div class="weekly-summary-modal">
          <div class="weekly-summary-modal-header">
            <h3>{{ selectedWeeklySummary?.DateRange ?? "—" }}</h3>
            <p class="summary-date-label">Summary date</p>
            <button
              type="button"
              class="weekly-summary-close"
              aria-label="關閉"
              @click="closeWeeklySummaryModal"
            >
              <img src="/assets/imgs/backend/close.svg" alt="關閉" />
            </button>
          </div>
          <div class="weekly-summary-modal-body">
            <div class="weekly-summary-section">
              <h4>
                彙整數量 {{ selectedWeeklySummary?.AggregateQuantity ?? "—" }}
              </h4>
            </div>
            <div class="weekly-summary-section">
              <h4>摘要內容</h4>
              <div class="weekly-summary-content">
                {{ selectedWeeklySummary?.SummaryContent ?? "—" }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ───── 主要內容 ───── -->
    <div class="memberInfoContent">
      <!-- 標題列 -->
      <div class="memberInfoTitle">
        <!-- <h3>{{ member?.Name ?? "—" }}</h3> -->
        <h3>{{ member?.Name ?? "—" }}</h3>
        <div class="optionGroup">
          <h3 class="memberNameRWD">{{ member?.Name ?? "—" }}</h3>
          <button class="goBackBtn" @click="goBack">
            <img src="/assets/imgs/backend/back.svg" alt />返回
          </button>
          <div class="rwdW100">
            <button class="btn refresh" @click="refresh">資料更新</button>
            <span class="updated-time">最後更新: {{ lastUpdated || "—" }}</span>
          </div>
        </div>
      </div>

      <!-- 卡片群 -->
      <div class="memberInfoCardWrap">
        <!-- █ 基本資料 + 合約 ------------------------------------------------ -->
        <div class="memberInfoRow">
          <div class="memberInfoCardGroup memberInfoCardGroupW50">
            <!-- 基本資料 -->
            <div class="memberInfoCard2">
              <div class="memberInfoCard2Header">
                <h3>基本資料</h3>
                <div class="memberInfoIconGroup">
                  <img
                    src="/assets/imgs/backend/editGray.svg"
                    @click="openEditBasicModal"
                    alt="edit"
                  />
                  <img
                    src="/assets/imgs/backend/deleteGray.svg"
                    @click="openDeleteMemberModal"
                    alt="delete"
                  />
                </div>
              </div>

              <h5>{{ member?.GradeName || "—" }}</h5>

              <div class="memberInfoList">
                <div class="memberInfoListTitle">
                  <img src="/assets/imgs/backend/birthday.svg" alt />生日
                </div>
                <div class="memberInfoListContent">
                  {{ member?.Birthday || "—" }}
                </div>
              </div>

              <div class="memberInfoList">
                <div class="memberInfoListTitle">
                  <img src="/assets/imgs/backend/phone.svg" alt />電話
                </div>
                <div class="memberInfoListContent">
                  {{ member?.Mobile || "—" }}
                </div>
              </div>

              <div class="memberInfoList">
                <div class="memberInfoListTitle">
                  <img src="/assets/imgs/backend/time.svg" alt />註冊時間
                </div>
                <div class="memberInfoListContent">
                  {{ member?.CheckTime || "—" }}
                </div>
              </div>

              <div class="memberInfoTagsGroup">
                <div class="memberInfoTag" v-if="member?.memType">
                  {{ member.memType }}
                </div>
              </div>

              <div
               
                class="acerBox"
                @click="goToAcerNumber"
              >
                <img src="/assets/imgs/backend/watch.svg" alt />
                <span>華碩序號({{ latestVivoWatch?.Deviceid || "無資料" }})</span>
              </div>
            </div>

            <!-- 合約 (沒有資料也要顯示空殼) -->
            <div class="memberInfoCard2">
              <template v-if="currentOrder">
                <h3>{{ currentOrder.ProductName }}</h3>
                <h5>目前合約</h5>

                <div class="memberInfoList">
                  <div class="memberInfoListTitle">
                    <img src="/assets/imgs/backend/time.svg" alt />開始時間
                  </div>
                  <div class="memberInfoListContent">
                    {{ currentOrder.RentStart }}
                  </div>
                </div>

                <div class="memberInfoList">
                  <div class="memberInfoListTitle">
                    <img src="/assets/imgs/backend/time.svg" alt />結束時間
                  </div>
                  <div class="memberInfoListContent">
                    {{ currentOrder.RentEnd }}
                  </div>
                </div>

                <div class="memberInfoWarning" v-if="isExpired">
                  合約已於
                  <h6>{{ currentOrder.RentEnd }} 到期</h6>
                  <div class="memberInfoWarning">
                    目前尚未續約，請確認是否續約以恢復服務。
                  </div>
                </div>

                <div class="memberInfoWarningTagsGroup">
                  <div class="memberInfoWarningTag used">
                    已使用 {{ currentOrder.Used || 0 }} 天
                  </div>
                  <div class="memberInfoWarningTag remain">
                    剩餘 {{ currentOrder.Still || 0 }} 天
                  </div>
                </div>
              </template>

              <template v-else>
                <h3>—</h3>
                <h5>目前合約</h5>
                <p style="text-align: center; padding: 8px 0">尚無合約資料</p>
              </template>

              <div class="memberInfoBtnGroup">
                <button class="consumptionBtn" @click="openContract">
                  <img src="/assets/imgs/backend/time2.svg" alt />消費紀錄
                </button>
                <button class="operationRecordBtn" @click="openOperationRecord">
                  <img src="/assets/imgs/backend/time2.svg" alt="operation" />
                  <span>操作紀錄</span>
                </button>
              </div>

            </div>
          </div>

          <!-- █ 產品使用紀錄 ------------------------------------------------- -->
          <div class="memberInfoCard memberInfoCardGroupW50">
            <div class="memberInfoTitleWrap">
              <h3>產品使用紀錄</h3>
              <div class="memberInfoTitleGroup">
                <small>已使用 {{ totalHome }} 次</small>
       
                <!-- 我的最愛名稱篩選 -->
                <div class="filterDropdown">
                  <div class="filterDropdownWrapper">
                    <div class="filterTrigger" @click="toggleHomeFilter">
                      <span>我的最愛名稱篩選</span>
                      <img
                        src="/assets/imgs/backend/arrow-down.svg"
                        alt="arrow"
                        :class="{ rotated: showHomeFilter }"
                      />
                    </div>
                    <div
                      class="filterDropdownPanel"
                      v-if="showHomeFilter"
                      @click.stop
                    >
                      <div class="filterCategories">
                        <div
                          class="filterCategory"
                          :class="{
                            active:
                              selectedHomeFilterCategory === 'ConsultationDate',
                          }"
                          @click="selectHomeFilterCategory('ConsultationDate')"
                        >
                          開始日期
                        </div>
                        <div
                          class="filterCategory"
                          :class="{
                            active:
                              selectedHomeFilterCategory === 'FavoriteName',
                          }"
                          @click="selectHomeFilterCategory('FavoriteName')"
                        >
                          我的最愛名稱
                        </div>
                        <div
                          class="filterCategory"
                          :class="{
                            active:
                              selectedHomeFilterCategory === 'ProductName',
                          }"
                          @click="selectHomeFilterCategory('ProductName')"
                        >
                          產品名稱
                        </div>
                      </div>
                      <div class="filterOptions">
                        <div
                          class="filterOption"
                          v-for="option in homeFilterOptions"
                          :key="option"
                          @click="toggleHomeFilterOption(option)"
                        >
                          <input
                            type="checkbox"
                            :checked="
                              selectedHomeFilterOptions.includes(option)
                            "
                            @click.stop
                          />
                          <span>{{ option }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 搜尋關鍵字 -->
                  <input
                    type="text"
                    v-model="homeKeyword"
                    placeholder="搜尋關鍵字"
                    class="searchKeywordInput"
                  />
                </div>
              </div>
            </div>

            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('home', 'ConsultationDate')"
                >
                  開始日期
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('home', 'FormattedStartTime')"
                >
                  開始時間
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('home', 'FormattedEndTime')"
                >
                  結束時間
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('home', 'TreatmentTime')"
                >
                  治療時間
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('home', 'FavoriteName')"
                >
                  我的最愛名稱
                </div>

              </div>
              <div class="memberInfoTableHR" />

              <template v-if="paginatedHome.length">
                <div
                  class="memberInfoTableRow productUsagRecords"
                  v-for="row in paginatedHome"
                  :key="row.id"
                >

                  <div class="memberInfoTableRowItem">
                    {{ row.ConsultationDate || "—" }}
                  </div>

                  <div class="memberInfoTableRowItem">
                    {{ row.FormattedStartTime || "—" }}
                  </div>
                  
                  <div class="memberInfoTableRowItem">
                    {{ row.FormattedEndTime || "—" }}
                  </div>

                  <div class="memberInfoTableRowItem">
                    {{ row.TreatmentTime || "—" }}
                  </div>
                  
                  <div class="memberInfoTableRowItem">
                    {{
                      row.AID === 0 || row.AID === "0"
                        ? "未加入"
                        : row.FavoriteName || "—"
                    }}
                  </div>

                </div>
              </template>
              <div class="memberInfoTableRow" v-else>
                <div class="memberInfoTableRowItem" style="width: 100%">
                  尚無資料
                </div>
              </div>
            </div>

            <!-- 分頁 10/頁 -->
            <nav class="pagination" v-if="totalHome">
              <button
                class="btn-page"
                :disabled="pageHome === 1"
                @click="gotoHome(1)"
              >
                &lt;&lt;
              </button>
              <button
                class="btn-page"
                :disabled="pageHome === 1"
                @click="prevHome"
              >
                &lt;
              </button>
              <button
                class="btn-page btn-page-number"
                v-for="p in pageNumberList"
                :key="p"
                :class="{ active: pageHome === p }"
                :disabled="p === '...'"
                @click="typeof p === 'number' && gotoHome(p)"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="pageHome === totalPagesHome"
                @click="nextHome"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="pageHome === totalPagesHome"
                @click="gotoHome(totalPagesHome)"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>

          <!-- 使用紀錄分析 -->
          <!-- <div class="memberInfoCard memberInfoCardGroupW100">
            <h3>使用紀錄分析</h3>
            <UsageAnalysisChart :usage-data="filteredHomeForChart" />
          </div> -->
        </div>

        <!-- █ 健康日誌 & 本周摘要 ------------------------------------------------- -->
        <div class="memberInfoRow">
          <!-- 健康日誌 -->
          <div class="memberInfoCard w-half">
            <div class="memberInfoTitleWrap">
              <h3>健康日誌</h3>
              <div class="memberInfoTitleGroup">
                <small>已使用 {{ totalHealthLog }} 次</small>
                <VueDatePicker
                  v-model="healthLogDateRange"
                  range
                  :enable-time-picker="false"
                  format="yyyy/MM/dd"
                  placeholder="選擇日期或日期區間"
                  prepend-icon="i-calendar"
                  :teleport="true"
                />
           
                  <button class="exportExcelBtn" @click="exportHealthLogExcel">
                    <img src="/assets/imgs/backend/download.svg" alt="excel" />
                    <span>匯出</span>
                  </button>
           
              </div>
            </div>

            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('healthLog', 'VerbalContent')"
                >
                  口述內容
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('healthLog', 'VerbalDate')"
                >
                  口述日期
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
              </div>
              <div class="memberInfoTableHR" />

              <template v-if="paginatedHealthLog.length">
                <div
                  class="memberInfoTableRow"
                  v-for="row in paginatedHealthLog"
                  :key="row.id"
                >
                  <div class="memberInfoTableRowItem">
                    {{ row.VerbalContent || "—" }}
                  </div>
                  <div class="memberInfoTableRowItem">
                    {{ row.VerbalDate || "—" }}
                  </div>
                </div>
              </template>
              <div class="memberInfoTableRow" v-else>
                <div class="memberInfoTableRowItem" style="width: 100%">
                  尚無資料
                </div>
              </div>
            </div>

            <!-- 分頁 -->
            <nav class="pagination" v-if="totalHealthLog">
              <button
                class="btn-page"
                :disabled="pageHealthLog === 1"
                @click="pageHealthLog = 1"
              >
                &lt;&lt;
              </button>
              <button
                class="btn-page"
                :disabled="pageHealthLog === 1"
                @click="pageHealthLog--"
              >
                &lt;
              </button>
              <button
                class="btn-page btn-page-number"
                v-for="p in pageNumberListHealthLog"
                :key="p"
                :class="{ active: pageHealthLog === p }"
                @click="pageHealthLog = p"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="pageHealthLog === totalPagesHealthLog"
                @click="pageHealthLog++"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="pageHealthLog === totalPagesHealthLog"
                @click="pageHealthLog = totalPagesHealthLog"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>

          <!-- 本週摘要 -->
          <div class="memberInfoCard w-half">
            <div class="memberInfoTitleWrap">
              <h3>本週摘要</h3>
            </div>

            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('weeklySummary', 'SummaryContent')"
                >
                  摘要內容
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('weeklySummary', 'AggregateQuantity')"
                >
                  彙整數量
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('weeklySummary', 'DateRange')"
                >
                  日期區間
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
              </div>
              <div class="memberInfoTableHR" />

              <template v-if="paginatedWeeklySummary.length">
                <div
                  class="memberInfoTableRow"
                  v-for="row in paginatedWeeklySummary"
                  :key="row.id"
                  style="cursor: pointer"
                  @click="openWeeklySummaryModal(row)"
                >
                  <div class="memberInfoTableRowItem summary-cell-one-line">
                    {{ row.SummaryContent || "—" }}
                  </div>
                  <div class="memberInfoTableRowItem">
                    {{ row.AggregateQuantity || "—" }}
                  </div>
                  <div class="memberInfoTableRowItem">
                    {{
                      (row.DateRange || "")
                        .replace(/\s*\/\s*$/, "")
                        .replace(/^\s*\/\s*/, "") || "—"
                    }}
                  </div>
                  <img
                    src="/assets/imgs/backend/goNext.svg"
                    alt="detail"
                    style="cursor: pointer; position: absolute; right: 0"
                  />
                </div>
              </template>
              <div class="memberInfoTableRow" v-else>
                <div class="memberInfoTableRowItem" style="width: 100%">
                  尚無資料
                </div>
              </div>
            </div>

            <!-- 分頁 -->
            <nav class="pagination" v-if="totalWeeklySummary">
              <button
                class="btn-page"
                :disabled="pageWeeklySummary === 1"
                @click="pageWeeklySummary = 1"
              >
                &lt;&lt;
              </button>
              <button
                class="btn-page"
                :disabled="pageWeeklySummary === 1"
                @click="pageWeeklySummary--"
              >
                &lt;
              </button>
              <button
                class="btn-page btn-page-number"
                v-for="p in pageNumberListWeeklySummary"
                :key="p"
                :class="{ active: pageWeeklySummary === p }"
                @click="pageWeeklySummary = p"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="pageWeeklySummary === totalPagesWeeklySummary"
                @click="pageWeeklySummary++"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="pageWeeklySummary === totalPagesWeeklySummary"
                @click="pageWeeklySummary = totalPagesWeeklySummary"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>
        </div>

        <!-- █ 指環紀錄 ------------------------------------------------------- -->
        <!-- █ 手錶紀錄 ------------------------------------------------- -->
        <div class="memberInfoRow">
        <div class="memberInfoCard watchRecordCard">
             <!--  <div class="memberInfoTitleWrap">
              <h3>手錶紀錄</h3>
              <div class="memberInfoTitleGroup">
                <small>已使用 {{ totalRing }} 次</small>
                <VueDatePicker
                  v-model="ringRange"
                  range
                  :enable-time-picker="false"
                  format="yyyy/MM/dd"
                  placeholder="選擇日期區間"
                  prepend-icon="i-calendar"
                  teleport="body"
                />

                <div class="watchFilterDropdownWrapper">
                  <div class="filterTrigger" @click="showWatchFilter = !showWatchFilter">
                    <img src="/assets/imgs/backend/search.svg" alt="filter" style="width:16px;height:16px" />
                    <span>{{ watchFilterCategoryLabel }}</span>
                    <img
                      src="/assets/imgs/backend/arrow-down.svg"
                      alt="arrow"
                      :class="{ rotated: showWatchFilter }"
                    />
                  </div>
                  <div class="filterDropdownPanel" v-if="showWatchFilter" @click.stop>
                    <div class="filterCategories">
                      <div
                        class="filterCategory"
                        :class="{ active: watchFilterCategory === 'CheckTime' }"
                        @click="watchFilterCategory = 'CheckTime'"
                      >使用時間</div>
                      <div
                        class="filterCategory"
                        :class="{ active: watchFilterCategory === 'heartRate' }"
                        @click="watchFilterCategory = 'heartRate'"
                      >心率</div>
                      <div
                        class="filterCategory"
                        :class="{ active: watchFilterCategory === 'bloodOxygen' }"
                        @click="watchFilterCategory = 'bloodOxygen'"
                      >血氧</div>
                      <div
                        class="filterCategory"
                        :class="{ active: watchFilterCategory === 'stress' }"
                        @click="watchFilterCategory = 'stress'"
                      >壓力</div>
                      <div
                        class="filterCategory"
                        :class="{ active: watchFilterCategory === 'temperature' }"
                        @click="watchFilterCategory = 'temperature'"
                      >溫度</div>
                    </div>
                    <div class="filterOptions">
                      <div
                        class="filterOption"
                        v-for="opt in watchFilterOptions"
                        :key="opt"
                        @click="toggleWatchFilterOption(opt)"
                      >
                        <input type="checkbox" :checked="selectedWatchFilterOptions.includes(opt)" @click.stop />
                        <span>{{ opt }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <input
                  type="text"
                  v-model="watchKeyword"
                  placeholder="搜尋關鍵字"
                  class="searchKeywordInput"
                />
              </div>
            </div> -->

            <div class="memberInfoTable watchTable">
              <div class="memberInfoTableTitle">
                <div class="memberInfoTableTitleItem" @click="handleSort('ring', 'CheckTime')">
                  使用時間
                  <img src="/assets/imgs/backend/sort.svg" alt="sort" class="sortIcon" />
                </div>
                <div class="memberInfoTableTitleItem" @click="handleSort('ring', 'heartRate')">
                  心率
                  <img src="/assets/imgs/backend/sort.svg" alt="sort" class="sortIcon" />
                </div>
                <div class="memberInfoTableTitleItem" @click="handleSort('ring', 'bloodOxygen')">
                  血氧
                  <img src="/assets/imgs/backend/sort.svg" alt="sort" class="sortIcon" />
                </div>
                <div class="memberInfoTableTitleItem" @click="handleSort('ring', 'stress')">
                  壓力
                  <img src="/assets/imgs/backend/sort.svg" alt="sort" class="sortIcon" />
                </div>
                <div class="memberInfoTableTitleItem" @click="handleSort('ring', 'sleep')">
                  睡眠
                  <img src="/assets/imgs/backend/sort.svg" alt="sort" class="sortIcon" />
                </div>
                <div class="memberInfoTableTitleItem" @click="handleSort('ring', 'temperature')">
                  溫度
                  <img src="/assets/imgs/backend/sort.svg" alt="sort" class="sortIcon" />
                </div>
                <div class="memberInfoTableTitleItem" @click="handleSort('ring', 'steps')">
                  運動
                  <img src="/assets/imgs/backend/sort.svg" alt="sort" class="sortIcon" />
                </div>
                <div class="memberInfoTableTitleItem" @click="handleSort('ring', 'hrv')">
                  HRV
                  <img src="/assets/imgs/backend/sort.svg" alt="sort" class="sortIcon" />
                </div>
                <div class="memberInfoTableTitleItem watchBodyCompCol">
                  身體組成
                </div>
              </div>
              <div class="memberInfoTableHR" />

              <template v-if="paginatedRing.length">
                <div
                  class="memberInfoTableRow watchRow"
                  v-for="r in paginatedRing"
                  :key="r.id"
                  @click="openWatchDetail(r)"
                >
                  <div class="memberInfoTableRowItem">{{ r.CheckTime }}</div>
                  <div class="memberInfoTableRowItem">{{ r.heartRate || "—" }}</div>
                  <div class="memberInfoTableRowItem">{{ r.bloodOxygen || "—" }}</div>
                  <div class="memberInfoTableRowItem">{{ r.stress || "—" }}</div>
                  <div class="memberInfoTableRowItem">{{ r.sleep || "—" }}</div>
                  <div class="memberInfoTableRowItem">{{ r.temperature || "—" }}</div>
                  <div class="memberInfoTableRowItem">{{ r.steps || "—" }}</div>
                  <div class="memberInfoTableRowItem">{{ r.hrv || "—" }}</div>
                  <div class="memberInfoTableRowItem watchBodyCompCell">
                    <span>水分 {{ r.bodyWater || "—" }}</span>
                    <span>體指 {{ r.bodyFat || "—" }}</span>
                    <span>肌肉 {{ r.bodyMuscle || "—" }}</span>
                  </div>
                  <img
                    src="/assets/imgs/backend/goNext.svg"
                    alt="detail"
                    style="cursor:pointer; position:absolute; right:0"
                  />
                </div>
              </template>
              <div class="memberInfoTableRow" v-else>
                <div class="memberInfoTableRowItem" style="width:100%">尚無資料</div>
              </div>
            </div>

            <!-- 分頁 -->
            <nav class="pagination" v-if="totalRing">
              <button class="btn-page" :disabled="pageRing === 1" @click="pageRing = 1">&lt;&lt;</button>
              <button class="btn-page" :disabled="pageRing === 1" @click="pageRing--">&lt;</button>
              <button
                class="btn-page btn-page-number"
                v-for="p in pageNumberListRing"
                :key="p"
                :class="{ active: pageRing === p }"
                :disabled="p === '...'"
                @click="typeof p === 'number' && (pageRing = p)"
              >{{ p }}</button>
              <button class="btn-page" :disabled="pageRing === totalPagesRing" @click="pageRing++">&gt;</button>
              <button class="btn-page" :disabled="pageRing === totalPagesRing" @click="pageRing = totalPagesRing">&gt;&gt;</button>
            </nav>
          </div>
        </div>

        <!-- █ 自律神經 ------------------------------------------------------- -->
        <div class="memberInfoRow">
          <div class="memberInfoCard w-half">
            <div class="memberInfoTitleWrap">
              <h3>自律神經檢測紀錄查詢</h3>
              <div class="memberInfoTitleGroup">
                <small>共 {{ totalANS }} 筆</small>
                <VueDatePicker
                  v-model="ansRange"
                  placeholder="使用日期區間"
                  range
                  :enable-time-picker="false"
                  format="yyyy/MM/dd"
                  teleport="body"
                />
              </div>
            </div>

            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('ans', 'CheckTime')"
                >
                  檢測時間
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('ans', 'TotalScore')"
                >
                  分數
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('ans', 'TotalDesc')"
                >
                  嚴重程度
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('ans', 'diffDays')"
                >
                  間隔天數
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
              </div>
              <div class="memberInfoTableHR" />

              <template v-if="paginatedANS.length">
                <div
                  class="memberInfoTableRow hrvRecord"
                  v-for="a in paginatedANS"
                  :key="a.CheckTime"
                  @click="openANS(a)"
                >
                  <div class="memberInfoTableRowItem">{{ a.CheckTime }}</div>
                  <div class="memberInfoTableRowItem">
                    {{ a.TotalScore ?? "—" }}
                  </div>
                  <div class="memberInfoTableRowItem">
                    {{ a.TotalDesc ?? "—" }}
                  </div>
                  <div class="memberInfoTableRowItem">
                    {{ a.diffDays ?? "—" }}
                  </div>
                  <img
                    src="/assets/imgs/backend/goNext.svg"
                    alt="detail"
                    style="cursor: pointer"
                  />
                </div>
              </template>
              <div class="memberInfoTableRow" v-else>
                <div class="memberInfoTableRowItem" style="width: 100%">
                  尚無資料
                </div>
              </div>
            </div>

            <nav class="pagination" v-if="totalANS">

              <button
                class="btn-page"
                :disabled="pageANS === 1"
                @click="pageANS = 1"
              >
                &lt;&lt;
              </button>

              <button
                class="btn-page"
                :disabled="pageANS === 1"
                @click="pageANS--"
              >
                &lt;
              </button>



              <button
                class="btn-page btn-page-number"
                v-for="p in pageNumberListANS"
                :key="p"
                :class="{ active: pageANS === p }"
                @click="pageANS = p"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="pageANS === totalPagesANS"
                @click="pageANS++"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="pageANS === totalPagesANS"
                @click="pageANS = totalPagesANS"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>

          <div class="memberInfoCard w-half">
            <h3>自律神經檢測紀錄分析</h3>
            <AnalysisChart
              :records="ansRecords"
              date-key="CheckTime"
              primary-key="TotalScore"
              primary-label="檢測分數"
            />
          </div>
        </div>

        <!-- █ 生活檢測 ------------------------------------------------------- -->
        <div class="memberInfoRow">
          <div class="memberInfoCard w-half">
            <div class="memberInfoTitleWrap">
              <h3>生活檢測紀錄查詢</h3>
              <div class="memberInfoTitleGroup">
                <small>共 {{ totalLife }} 筆</small>
                <VueDatePicker
                  range
                  placeholder="使用日期區間"
                  v-model="lifeRange"
                  :enable-time-picker="false"
                  format="yyyy/MM/dd"
                  teleport="body"
                />
              </div>
            </div>

            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('life', 'CheckTime')"
                >
                  檢測時間
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('life', 'Score')"
                >
                  分數
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('life', 'daytimeSleepiness')"
                >
                  睡眠品質
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('life', 'diffDays')"
                >
                  間隔天數
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
              </div>
              <div class="memberInfoTableHR" />

              <template v-if="paginatedLife.length">
                <div
                  class="memberInfoTableRow"
                  v-for="l in paginatedLife"
                  :key="l.CheckTime"
                >
                  <div class="memberInfoTableRowItem">{{ l.CheckTime }}</div>
                  <div class="memberInfoTableRowItem">{{ l.Score ?? "—" }}</div>
                  <div class="memberInfoTableRowItem">
                    {{ l.daytimeSleepiness ?? "—" }}
                  </div>
                  <div class="memberInfoTableRowItem">
                    {{ l.diffDays ?? "—" }}
                  </div>
                  <img
                    src="/assets/imgs/backend/goNext.svg"
                    alt="detail"
                    style="cursor: pointer"
                    @click="openLife(l)"
                  />
                </div>
              </template>
              <div class="memberInfoTableRow" v-else>
                <div class="memberInfoTableRowItem" style="width: 100%">
                  尚無資料
                </div>
              </div>
            </div>

            <nav class="pagination" v-if="totalLife">
              <button
                class="btn-page"
                :disabled="pageLife === 1"
                @click="pageLife = 1"
              >
                &lt;&lt;
              </button>
              <button
                class="btn-page"
                :disabled="pageLife === 1"
                @click="pageLife--"
              >
                &lt;
              </button>
              <button
                class="btn-page btn-page-number"
                v-for="p in pageNumberListLife"
                :key="p"
                :class="{ active: pageLife === p }"
                @click="pageLife = p"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="pageLife === totalPagesLife"
                @click="pageLife++"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="pageLife === totalPagesLife"
                @click="pageLife = totalPagesLife"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>

          <div class="memberInfoCard w-half">
            <h3>生活檢測紀錄分析</h3>
            <AnalysisChart
              :records="lifeRecords"
              date-key="CheckTime"
              primary-key="Score"
              primary-label="檢測分數"
            />
          </div>
        </div>

        <!-- █ APP使用紀錄 ------------------------------------------------------- -->
        <!-- <div class="memberInfoRow">
          <div class="memberInfoCard w-half">
            <div class="memberInfoTitleWrap">
              <h3>APP使用紀錄</h3>
              <div class="memberInfoTitleGroup">
                <small>已使用 {{ totalApp }} 次</small>
                <VueDatePicker
                  v-model="appDateRange"
                  range
                  :enable-time-picker="false"
                  format="yyyy/MM/dd"
                  placeholder="選擇日期區間"
                  prepend-icon="i-calendar"
                  teleport="body"
                />
                <img
                  src="/assets/imgs/backend/search.svg"
                  alt="search"
                  style="cursor: pointer; width: 20px; height: 20px"
                />
              </div>
            </div>

            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('app', 'startDate')"
                >
                  APP 使用日期
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('app', 'endDate')"
                >
                  APP 結束日期
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('app', 'diffDays')"
                >
                  間隔天數
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
              </div>
              <div class="memberInfoTableHR" />

              <template v-if="paginatedApp.length">
                <div
                  class="memberInfoTableRow"
                  v-for="app in paginatedApp"
                  :key="app.id"
                >
                  <div class="memberInfoTableRowItem">{{ app.startDate }}</div>
                  <div class="memberInfoTableRowItem">{{ app.endDate }}</div>
                  <div class="memberInfoTableRowItem">
                    {{ app.diffDays }} 天
                  </div>
                </div>
              </template>
              <div class="memberInfoTableRow" v-else>
                <div class="memberInfoTableRowItem" style="width: 100%">
                  尚無資料
                </div>
              </div>
            </div>

            <nav class="pagination" v-if="totalApp">
              <button
                class="btn-page"
                :disabled="pageApp === 1"
                @click="pageApp = 1"
              >
                &lt;&lt;
              </button>
              <button
                class="btn-page"
                :disabled="pageApp === 1"
                @click="pageApp--"
              >
                &lt;
              </button>
              <button
                class="btn-page btn-page-number"
                v-for="p in pageNumberListApp"
                :key="p"
                :class="{ active: pageApp === p }"
                @click="pageApp = p"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="pageApp === totalPagesApp"
                @click="pageApp++"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="pageApp === totalPagesApp"
                @click="pageApp = totalPagesApp"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>

          <div class="memberInfoCard w-half">
            <h3>APP使用紀錄分析</h3>
            <UsageAnalysisChart :usage-data="filteredAppForChart" />
          </div>
        </div> -->

        <!-- █ 影片觀看紀錄 ------------------------------------------------------- -->
        <!-- <div class="memberInfoRow">
          <div class="memberInfoCard memberInfoCardGroupW100">
            <div class="memberInfoTitleWrap">
              <h3>影片觀看紀錄</h3>
              <div class="memberInfoTitleGroup">
                <small>觀看 {{ totalVideo }} 次</small>
                <VueDatePicker
                  v-model="videoRange"
                  range
                  :enable-time-picker="false"
                  format="yyyy/MM/dd"
                  placeholder="選擇日期區間"
                  prepend-icon="i-calendar"
                  teleport="body"
                />
                <img
                  src="/assets/imgs/backend/search.svg"
                  alt="search"
                  style="cursor: pointer; width: 20px; height: 20px"
                />
              </div>
            </div>

            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('video', 'name')"
                >
                  影片名稱
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('video', 'watchDate')"
                >
                  觀看日期
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('video', 'completion')"
                >
                  完成度
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('video', 'liked')"
                >
                  是否按讚
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
                <div
                  class="memberInfoTableTitleItem"
                  @click="handleSort('video', 'commented')"
                >
                  是否留言
                  <img
                    src="/assets/imgs/backend/sort.svg"
                    alt="sort"
                    class="sortIcon"
                  />
                </div>
              </div>
              <div class="memberInfoTableHR" />

              <template v-if="paginatedVideo.length">
                <div
                  class="memberInfoTableRow"
                  v-for="video in paginatedVideo"
                  :key="video.id"
                >
                  <div class="memberInfoTableRowItem">{{ video.name }}</div>
                  <div class="memberInfoTableRowItem">
                    {{ video.watchDate }}
                  </div>
                  <div class="memberInfoTableRowItem">
                    {{ video.completion }}%
                  </div>
                  <div class="memberInfoTableRowItem">
                    {{
                      video.liked === true || video.liked === "是" ? "是" : "否"
                    }}
                  </div>
                  <div class="memberInfoTableRowItem">
                    {{
                      video.commented === true || video.commented === "是"
                        ? "是"
                        : "否"
                    }}
                  </div>
                  <img
                    src="/assets/imgs/backend/goNext.svg"
                    alt="detail"
                    style="cursor: pointer"
                  />
                </div>
              </template>
              <div class="memberInfoTableRow" v-else>
                <div class="memberInfoTableRowItem" style="width: 100%">
                  尚無資料
                </div>
              </div>
            </div>

            <nav class="pagination" v-if="totalVideo">
              <button
                class="btn-page"
                :disabled="pageVideo === 1"
                @click="pageVideo = 1"
              >
                &lt;&lt;
              </button>
              <button
                class="btn-page"
                :disabled="pageVideo === 1"
                @click="pageVideo--"
              >
                &lt;
              </button>
              <button
                class="btn-page btn-page-number"
                v-for="p in pageNumberListVideo"
                :key="p"
                :class="{ active: pageVideo === p }"
                @click="pageVideo = p"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="pageVideo === totalPagesVideo"
                @click="pageVideo++"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="pageVideo === totalPagesVideo"
                @click="pageVideo = totalPagesVideo"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import VueDatePicker from "@vuepic/vue-datepicker";
import { useMemberStore } from "~/stores/useMemberStore";
import { storeToRefs } from "pinia";

import * as XLSX from "xlsx";
import Sidebar from "~/components/raphaelBackend/Sidebar.vue";
import UsageAnalysisChart from "~/components/raphaelBackend/UsageAnalysisChart.vue";
import AnalysisChart from "~/components/raphaelBackend/AnalysisChart.vue";
import ContractUserAlert from "~/components/raphaelBackend/ContractUserAlert.vue";
import AutonomicNerveAlert from "~/components/raphaelBackend/AutonomicNerve.vue";
import LifeDetectAlert from "~/components/raphaelBackend/LifeDetectAlert.vue";
import EditBasicInfoModal from "~/components/raphaelBackend/EditBasicInfoModal.vue";
import DeleteMemberModal from "~/components/raphaelBackend/DeleteMemberModal.vue";
import { useSeo } from "~/composables/useSeo";
const router = useRouter();
const route = useRoute();

useSeo({
  title: "",
  description:
    "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
  url: "https://neuroplus.com.tw",
});

/* ---------- 型別 ---------- */
type ApiMember = {
  Name: string;
  Birthday: string;
  Mobile: string;
  GradeName: string;
  memType: string;
  CheckTime: string;
};
type ApiOrder = { ProductName: string; RentStart: string; RentEnd: string };

/* ---------- Utils ---------- */
function getAuth() {
  return {
    token:
      localStorage.getItem("backendToken") ??
      sessionStorage.getItem("backendToken"),
    admin: localStorage.getItem("adminID") ?? sessionStorage.getItem("adminID"),
    sel: JSON.parse(localStorage.getItem("selectedMember") ?? "{}") as {
      MID?: string;
      Mobile?: string;
    },
  };
}

const memberStore = useMemberStore();
const {
  member,
  currentOrder,
  lastUpdated,
  hrvRecords,
  ansRecords,
  lifeRecords,
  videoRecords,
  appRecords,
  healthLogRecords,
  weeklySummaryRecords,
  favoriteTPointsList,
  optDetailList,
  vivoWatchList,
  hasFetched,
} = storeToRefs(memberStore);

// 產品使用紀錄從 store 取得（透過 processedHomeOrders 處理分組）

// 健康日誌和本周摘要資料從 store 取得，不需要本地 ref

const showContract = ref(false);
const contractList = ref<any[]>([]);

// 基本資料編輯和刪除會員彈跳視窗
const showEditBasicModal = ref(false);
const showDeleteMemberModal = ref(false);

// 本週摘要詳情彈跳視窗
const showWeeklySummaryModal = ref(false);
const selectedWeeklySummary = ref<{
  SummaryContent?: string;
  AggregateQuantity?: string;
  DateRange?: string;
  AID?: string;
  MID?: string;
} | null>(null);

/* ---------- refs ---------- */

const homeChartDateRange = ref<Date[] | null>(null);

const ringRange = ref<Date[] | null>(null);

// 產品使用紀錄篩選相關
const showHomeFilter = ref(false);
const selectedHomeFilterCategory = ref<string>("ConsultationDate");
const selectedHomeFilterOptions = ref<string[]>([]);
const homeKeyword = ref("");

// 排序狀態
const sortState = ref<
  Record<string, { field: string; order: "asc" | "desc" | null }>
>({
  home: { field: "", order: null },
  ring: { field: "", order: null },
  ans: { field: "", order: null },
  life: { field: "", order: null },
  video: { field: "", order: null },
  app: { field: "", order: null },
  healthLog: { field: "", order: null },
  weeklySummary: { field: "", order: null },
});

const ansRange = ref<Date[] | null>(null);
const lifeRange = ref<Date[] | null>(null);
const videoRange = ref<Date[] | null>(null);
const appDateRange = ref<Date[] | null>(null);
const healthLogDateRange = ref<Date[] | null>(null);

/* ---------- 華碩序號相關 ---------- */
// 取得最新的華碩序號（第一筆，已按 CreateTime 降序排序）
const latestVivoWatch = computed(() => {
  if (vivoWatchList.value && vivoWatchList.value.length > 0) {
    return vivoWatchList.value[0];
  }
  return null;
});

// 是否有華碩序號
const hasVivoWatch = computed(() => {
  return vivoWatchList.value && vivoWatchList.value.length > 0;
});

// 跳轉到華碩序號管理頁面
function goToAcerNumber() {
  // 將會員資訊存到 localStorage，供 acerNumber.vue 使用
  const memberData = {
    MID: getAuth().sel?.MID || "",
    Mobile: getAuth().sel?.Mobile || "",
    Name: member.value?.Name || "",
  };
  localStorage.setItem("selectedMember", JSON.stringify(memberData));
  router.push("/raphaelBackend/member/acerNumber");
}

/* ---------- paging helpers ---------- */
const PAGE_MAIN = 10;
const PAGE_SUB = 4;

const maxButtons = ref(5);

function handleResize() {
  maxButtons.value = window.innerWidth <= 480 ? 3 : 5; // 480px 以下顯示 3 個
}

// 假資料
onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);

  // 手錶紀錄假資料
  ringRecords.value = [
    {
      id: 1,
      CheckTime: "2024/10/09 12:00",
      heartRate: "62 bpm",
      bloodOxygen: "88",
      stress: "79/100",
      sleep: "6h10m",
      temperature: "36.5°C",
      steps: "1200步",
      hrv: "37 ms",
      bodyWater: "62.50%",
      bodyFat: "18.5%",
      bodyMuscle: "39.0kg",
      // 詳情彈窗用
      bloodPressure: "110/67",
      heartRateVal: 62,
      bloodOxygenVal: 88,
      hrvVal: 37,
      tempVal: 36.5,
      stepsVal: 1200,
      stressLevel: "中等",
      stressLevelEn: "medium",
      sleepDuration: "6h10m",
      sleepScore: "79/100",
      sleepAwakePct: "10%", sleepAwakeDur: "37m",
      sleepRemPct: "8%", sleepRemDur: "30m",
      sleepLightPct: "72%", sleepLightDur: "4h26m",
      sleepDeepPct: "10%", sleepDeepDur: "37m",
    },
    {
      id: 2,
      CheckTime: "2024/10/08 12:00",
      heartRate: "55 bpm",
      bloodOxygen: "90",
      stress: "82/100",
      sleep: "5h30m",
      temperature: "36.6°C",
      steps: "1200步",
      hrv: "36 ms",
      bodyWater: "61.00%",
      bodyFat: "19.5%",
      bodyMuscle: "37.5kg",
      bloodPressure: "115/70",
      heartRateVal: 55,
      bloodOxygenVal: 90,
      hrvVal: 36,
      tempVal: 36.6,
      stepsVal: 1200,
      stressLevel: "中等",
      stressLevelEn: "medium",
      sleepDuration: "5h30m",
      sleepScore: "82/100",
      sleepAwakePct: "9%", sleepAwakeDur: "30m",
      sleepRemPct: "7%", sleepRemDur: "23m",
      sleepLightPct: "75%", sleepLightDur: "4h07m",
      sleepDeepPct: "9%", sleepDeepDur: "30m",
    },
    {
      id: 3,
      CheckTime: "2024/10/07 12:00",
      heartRate: "60 bpm",
      bloodOxygen: "85",
      stress: "84/100",
      sleep: "5h50m",
      temperature: "36.4°C",
      steps: "1200步",
      hrv: "39 ms",
      bodyWater: "59.80%",
      bodyFat: "20.0%",
      bodyMuscle: "38.0kg",
      bloodPressure: "108/65",
      heartRateVal: 60,
      bloodOxygenVal: 85,
      hrvVal: 39,
      tempVal: 36.4,
      stepsVal: 1200,
      stressLevel: "放鬆",
      stressLevelEn: "low",
      sleepDuration: "5h50m",
      sleepScore: "84/100",
      sleepAwakePct: "8%", sleepAwakeDur: "28m",
      sleepRemPct: "9%", sleepRemDur: "31m",
      sleepLightPct: "74%", sleepLightDur: "4h19m",
      sleepDeepPct: "9%", sleepDeepDur: "31m",
    },
    {
      id: 4,
      CheckTime: "2024/10/06 12:00",
      heartRate: "54 bpm",
      bloodOxygen: "82",
      stress: "80/100",
      sleep: "6h00m",
      temperature: "36.78°C",
      steps: "1200步",
      hrv: "38 ms",
      bodyWater: "60.20%",
      bodyFat: "19.0%",
      bodyMuscle: "38.8kg",
      bloodPressure: "112/68",
      heartRateVal: 54,
      bloodOxygenVal: 82,
      hrvVal: 38,
      tempVal: 36.78,
      stepsVal: 1200,
      stressLevel: "放鬆",
      stressLevelEn: "low",
      sleepDuration: "6h00m",
      sleepScore: "80/100",
      sleepAwakePct: "11%", sleepAwakeDur: "40m",
      sleepRemPct: "6%", sleepRemDur: "22m",
      sleepLightPct: "76%", sleepLightDur: "4h33m",
      sleepDeepPct: "7%", sleepDeepDur: "25m",
    },
    {
      id: 5,
      CheckTime: "2024/10/10 12:00",
      heartRate: "82 bpm",
      bloodOxygen: "98",
      stress: "77/100",
      sleep: "5h45m",
      temperature: "36.4°C",
      steps: "11000步",
      hrv: "38 ms",
      bodyWater: "60.70%",
      bodyFat: "19.30%",
      bodyMuscle: "38.8kg",
      bloodPressure: "110/67",
      heartRateVal: 82,
      bloodOxygenVal: 98,
      hrvVal: 38,
      tempVal: 36.4,
      stepsVal: 11000,
      stressLevel: "放鬆",
      stressLevelEn: "low",
      sleepDuration: "5h45m",
      sleepScore: "77/100",
      sleepAwakePct: "11%", sleepAwakeDur: "24h0m",
      sleepRemPct: "6%", sleepRemDur: "41m",
      sleepLightPct: "77%", sleepLightDur: "32m",
      sleepDeepPct: "6%", sleepDeepDur: "48m",
    },
    {
      id: 6,
      CheckTime: "2024/10/05 12:00",
      heartRate: "58 bpm",
      bloodOxygen: "91",
      stress: "75/100",
      sleep: "7h20m",
      temperature: "36.3°C",
      steps: "980步",
      hrv: "40 ms",
      bodyWater: "61.50%",
      bodyFat: "18.0%",
      bodyMuscle: "39.5kg",
      bloodPressure: "118/72",
      heartRateVal: 58,
      bloodOxygenVal: 91,
      hrvVal: 40,
      tempVal: 36.3,
      stepsVal: 980,
      stressLevel: "放鬆",
      stressLevelEn: "low",
      sleepDuration: "7h20m",
      sleepScore: "75/100",
      sleepAwakePct: "12%", sleepAwakeDur: "53m",
      sleepRemPct: "5%", sleepRemDur: "22m",
      sleepLightPct: "73%", sleepLightDur: "5h21m",
      sleepDeepPct: "10%", sleepDeepDur: "44m",
    },
    {
      id: 7,
      CheckTime: "2024/10/04 12:00",
      heartRate: "66 bpm",
      bloodOxygen: "95",
      stress: "85/100",
      sleep: "6h30m",
      temperature: "36.7°C",
      steps: "3200步",
      hrv: "35 ms",
      bodyWater: "58.90%",
      bodyFat: "20.5%",
      bodyMuscle: "37.0kg",
      bloodPressure: "120/75",
      heartRateVal: 66,
      bloodOxygenVal: 95,
      hrvVal: 35,
      tempVal: 36.7,
      stepsVal: 3200,
      stressLevel: "中等",
      stressLevelEn: "medium",
      sleepDuration: "6h30m",
      sleepScore: "85/100",
      sleepAwakePct: "7%", sleepAwakeDur: "27m",
      sleepRemPct: "10%", sleepRemDur: "39m",
      sleepLightPct: "70%", sleepLightDur: "4h33m",
      sleepDeepPct: "13%", sleepDeepDur: "51m",
    },
    {
      id: 8,
      CheckTime: "2024/10/03 12:00",
      heartRate: "70 bpm",
      bloodOxygen: "93",
      stress: "88/100",
      sleep: "5h15m",
      temperature: "36.8°C",
      steps: "5500步",
      hrv: "33 ms",
      bodyWater: "57.80%",
      bodyFat: "21.0%",
      bodyMuscle: "36.5kg",
      bloodPressure: "125/78",
      heartRateVal: 70,
      bloodOxygenVal: 93,
      hrvVal: 33,
      tempVal: 36.8,
      stepsVal: 5500,
      stressLevel: "偏高",
      stressLevelEn: "high",
      sleepDuration: "5h15m",
      sleepScore: "88/100",
      sleepAwakePct: "6%", sleepAwakeDur: "19m",
      sleepRemPct: "11%", sleepRemDur: "35m",
      sleepLightPct: "68%", sleepLightDur: "3h34m",
      sleepDeepPct: "15%", sleepDeepDur: "47m",
    },
  ];

  // 產品使用紀錄資料從 API 取得，不需要假資料

  // 影片觀看紀錄假資料
  videoRecords.value = [
    {
      id: 1,
      name: "《腦洞大開》原來「大腦」...",
      watchDate: "2025/12/09 12:12",
      completion: 100,
      liked: true,
      commented: true,
    },
    {
      id: 2,
      name: "《醫師真心話》吃藥越多,...",
      watchDate: "2025/12/09 11:12",
      completion: 50,
      liked: false,
      commented: false,
    },
    {
      id: 3,
      name: "《醫師真心話》孩子不聽話...",
      watchDate: "2025/12/08 17:12",
      completion: 0,
      liked: false,
      commented: false,
    },
    {
      id: 4,
      name: "《我的診間故事EP1》三年...",
      watchDate: "2025/10/16 12:01",
      completion: 0,
      liked: false,
      commented: false,
    },
    {
      id: 5,
      name: "《醫師真心話》孩子不聽話...",
      watchDate: "2025/10/10 15:20",
      completion: 50,
      liked: false,
      commented: false,
    },
  ];

  // APP使用紀錄假資料
  appRecords.value = [
    {
      id: 1,
      startDate: "2024/10/10 12:00",
      endDate: "2024/10/11 12:00",
      diffDays: 1,
    },
    {
      id: 2,
      startDate: "2024/10/11 12:00",
      endDate: "2024/10/12 12:00",
      diffDays: 1,
    },
    {
      id: 3,
      startDate: "2024/10/12 12:00",
      endDate: "2024/10/13 12:00",
      diffDays: 1,
    },
    {
      id: 4,
      startDate: "2024/10/13 12:00",
      endDate: "2024/10/14 12:00",
      diffDays: 1,
    },
    {
      id: 5,
      startDate: "2024/10/14 12:00",
      endDate: "2024/10/15 12:00",
      diffDays: 1,
    },
  ];

  // 健康日誌和本周摘要資料從 API 取得，不需要假資料

  // 點擊外部關閉下拉選單
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".filterDropdownWrapper")) {
      showHomeFilter.value = false;
    }
    if (!target.closest(".eventFilterWrapper")) {
      showEventFilter.value = false;
    }
    if (!target.closest(".watchFilterDropdownWrapper")) {
      showWatchFilter.value = false;
    }
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

const pageNumberList = computed(() =>
  pageButtons(totalPagesHome.value, pageHome.value, maxButtons.value)
);

// 將治療時間字串轉為分鐘數（例："1小時30分鐘" -> 90）
function parseDurationToMinutes(str: string): number {
  if (!str || str === "—") return 0;
  let minutes = 0;
  const hourMatch = str.match(/(\d+)小時/);
  if (hourMatch) minutes += parseInt(hourMatch[1], 10) * 60;
  const minMatch = str.match(/(\d+)分鐘/);
  if (minMatch) minutes += parseInt(minMatch[1], 10);
  return minutes;
}
// 將分鐘數轉為顯示字串（例：90 -> "1小時30分鐘"）
function formatMinutesToDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return "—";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}小時${minutes}分鐘`;
  return `${minutes}分鐘`;
}

// 產品使用紀錄：每一筆獨立顯示，不做合併
const processedHomeOrders = computed(() => {
  return (favoriteTPointsList.value || []).map((r: any, index: number) => ({
    ...r,
    id: r.id ?? index,
  }));
});

// 產品使用紀錄篩選選項
const homeFilterOptions = computed(() => {
  if (!processedHomeOrders.value.length) return [];

  const category = selectedHomeFilterCategory.value;
  const options = new Set<string>();

  processedHomeOrders.value.forEach((item: any) => {
    let value = "";
    switch (category) {
      case "ConsultationDate":
        value = item.ConsultationDate || "";
        break;
      case "FavoriteName":
        value = item.FavoriteName || "";
        break;
      case "ProductName":
        value = item.ProductName || "";
        break;
    }
    if (value) options.add(value);
  });

  return Array.from(options).sort();
});

const filteredHome = computed(() => {
  let data = processedHomeOrders.value;



  // 篩選選項
  if (selectedHomeFilterOptions.value.length > 0) {
    const category = selectedHomeFilterCategory.value;
    data = data.filter((r: any) => {
      let value = "";
      switch (category) {
        case "ConsultationDate":
          value = r.ConsultationDate || "";
          break;
        case "FavoriteName":
          value = r.FavoriteName || "";
          break;
        case "ProductName":
          value = r.ProductName || "";
          break;
      }
      return selectedHomeFilterOptions.value.includes(value);
    });
  }

  // 關鍵字搜尋
  if (homeKeyword.value) {
    const keyword = homeKeyword.value.toLowerCase();
    data = data.filter((r: any) => {
      return (
        (r.ConsultationDate || "").toLowerCase().includes(keyword) ||
        (r.FormattedStartTime || "").toLowerCase().includes(keyword) ||
        (r.FormattedEndTime || "").toLowerCase().includes(keyword) ||
        (r.FavoriteName || "").toLowerCase().includes(keyword) ||
        (r.ProductName || "").toLowerCase().includes(keyword) ||
        (r.TreatmentTime || "").toLowerCase().includes(keyword) ||
        (r.TMode || "").toLowerCase().includes(keyword)
      );
    });
  }

  // 排序
  if (sortState.value.home.order && sortState.value.home.field) {
    data = [...data].sort((a: any, b: any) => {
      const field = sortState.value.home.field;
      let aVal = a[field];
      let bVal = b[field];

      // 日期排序
      if (field === "ConsultationDate") {
        aVal = new Date(aVal?.replace(/\//g, "-") || "").getTime();
        bVal = new Date(bVal?.replace(/\//g, "-") || "").getTime();
      }

      // 數字排序
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortState.value.home.order === "asc" ? aVal - bVal : bVal - aVal;
      }

      // 字串排序
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortState.value.home.order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  } else {
    // 預設排序：按 StartTime 降序（最新的在最前面）
    data = [...data].sort((a: any, b: any) => {
      const aTime = a.StartTime || "";
      const bTime = b.StartTime || "";
      return bTime.localeCompare(aTime);
    });
  }

  return data;
});

const filteredHomeForChart = computed(() => {
  if (!homeChartDateRange.value || homeChartDateRange.value.length < 2)
    return processedHomeOrders.value;

  const [from, to] = homeChartDateRange.value;
  const start = from.getTime();
  const end = to.getTime();

  return processedHomeOrders.value.filter((r: any) => {
    const dateStr = r.StartDate || r.ConsultationDate || r.TDate || "";
    if (!dateStr) return false;
    const ms = Date.parse(dateStr.replace(/\//g, "-"));
    return ms >= start && ms <= end;
  });
});

/* 使用紀錄 */
const pageHome = ref(1);

const totalHome = computed(() => filteredHome.value.length);

const totalPagesHome = computed(() =>
  Math.max(1, Math.ceil(totalHome.value / PAGE_MAIN))
);
const paginatedHome = computed(() => {
  const s = (pageHome.value - 1) * PAGE_MAIN;
  return filteredHome.value.slice(s, s + PAGE_MAIN);
});

// 使用紀錄專用
function gotoHome(p: number) {
  pageHome.value = p;
}
function prevHome() {
  if (pageHome.value > 1) pageHome.value--;
}
function nextHome() {
  if (pageHome.value < totalPagesHome.value) pageHome.value++;
}

/* RING */
// ───── 手錶紀錄 ─────
const pageRing = ref(1);
const ringRecords = ref<any[]>([]);
const showWatchFilter = ref(false);
const watchFilterCategory = ref<string>("CheckTime");
const selectedWatchFilterOptions = ref<string[]>([]);
const watchKeyword = ref("");
const showWatchDetailModal = ref(false);
const selectedWatchRecord = ref<any>(null);

const watchFilterCategoryLabel = computed(() => {
  const map: Record<string, string> = {
    CheckTime: "使用時間",
    heartRate: "心率",
    bloodOxygen: "血氧",
    stress: "壓力",
    temperature: "溫度",
  };
  return map[watchFilterCategory.value] || "使用時間";
});

const watchFilterOptions = computed(() => {
  const cat = watchFilterCategory.value;
  const opts = new Set<string>();
  ringRecords.value.forEach((r: any) => {
    const val = r[cat];
    if (val) opts.add(String(val));
  });
  return Array.from(opts).sort();
});

function toggleWatchFilterOption(opt: string) {
  const idx = selectedWatchFilterOptions.value.indexOf(opt);
  if (idx > -1) selectedWatchFilterOptions.value.splice(idx, 1);
  else selectedWatchFilterOptions.value.push(opt);
}

function openWatchDetail(record: any) {
  selectedWatchRecord.value = record;
  showWatchDetailModal.value = true;
}

function closeWatchDetail() {
  showWatchDetailModal.value = false;
}

const filteredRing = computed(() => {
  let data = ringRecords.value;

  // 日期區間篩選
  if (ringRange.value && ringRange.value.length >= 2) {
    const [from, to] = ringRange.value;
    const start = from.getTime();
    const end = to.getTime() + 24 * 60 * 60 * 1000 - 1;
    data = data.filter((r: any) => {
      const ms = Date.parse(r.CheckTime?.replace(/\//g, "-") || "");
      return ms >= start && ms <= end;
    });
  }

  // 分類篩選
  if (selectedWatchFilterOptions.value.length > 0) {
    const cat = watchFilterCategory.value;
    data = data.filter((r: any) =>
      selectedWatchFilterOptions.value.includes(String(r[cat] || ""))
    );
  }

  // 關鍵字搜尋
  if (watchKeyword.value) {
    const kw = watchKeyword.value.toLowerCase();
    data = data.filter((r: any) =>
      Object.values(r).some(
        (v) => typeof v === "string" && v.toLowerCase().includes(kw)
      )
    );
  }

  // 排序
  if (sortState.value.ring.order && sortState.value.ring.field) {
    data = [...data].sort((a: any, b: any) => {
      const field = sortState.value.ring.field;
      let aVal = a[field];
      let bVal = b[field];

      // 日期排序
      if (field === "CheckTime") {
        aVal = new Date(aVal?.replace(/\//g, "-") || "").getTime();
        bVal = new Date(bVal?.replace(/\//g, "-") || "").getTime();
      }

      // 數字排序
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortState.value.ring.order === "asc" ? aVal - bVal : bVal - aVal;
      }

      // 字串排序
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortState.value.ring.order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }

  return data;
});
const PAGE_WATCH = 10;
const totalRing = computed(() => filteredRing.value.length);
const totalPagesRing = computed(() =>
  Math.max(1, Math.ceil(totalRing.value / PAGE_WATCH))
);
const paginatedRing = computed(() => {
  const s = (pageRing.value - 1) * PAGE_WATCH;
  return filteredRing.value.slice(s, s + PAGE_WATCH);
});
const pageNumberListRing = computed(() =>
  pageButtons(totalPagesRing.value, pageRing.value, maxButtons.value)
);

/* ANS */
const pageANS = ref(1);
const totalANS = computed(() => ansRecords.value.length);
const totalPagesANS = computed(() =>
  Math.max(1, Math.ceil(totalANS.value / PAGE_SUB))
);
const filteredANSWithSort = computed(() => {
  let data = filteredANS.value;

  // 排序
  if (sortState.value.ans.order && sortState.value.ans.field) {
    data = [...data].sort((a: any, b: any) => {
      const field = sortState.value.ans.field;
      let aVal = a[field];
      let bVal = b[field];

      // 日期排序
      if (field === "CheckTime") {
        aVal = new Date(aVal?.replace(/\//g, "-") || "").getTime();
        bVal = new Date(bVal?.replace(/\//g, "-") || "").getTime();
      }

      // 數字排序
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortState.value.ans.order === "asc" ? aVal - bVal : bVal - aVal;
      }

      // 字串排序
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortState.value.ans.order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }

  return data;
});

const paginatedANS = computed(() => {
  const s = (pageANS.value - 1) * PAGE_SUB;
  return filteredANSWithSort.value.slice(s, s + PAGE_SUB);
});

/* LIFE */
const pageLife = ref(1);
const totalLife = computed(() => lifeRecords.value.length);
const totalPagesLife = computed(() =>
  Math.max(1, Math.ceil(totalLife.value / PAGE_SUB))
);
const filteredLifeWithSort = computed(() => {
  let data = filteredLife.value;

  // 排序
  if (sortState.value.life.order && sortState.value.life.field) {
    data = [...data].sort((a: any, b: any) => {
      const field = sortState.value.life.field;
      let aVal = a[field];
      let bVal = b[field];

      // 日期排序
      if (field === "CheckTime") {
        aVal = new Date(aVal?.replace(/\//g, "-") || "").getTime();
        bVal = new Date(bVal?.replace(/\//g, "-") || "").getTime();
      }

      // 數字排序
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortState.value.life.order === "asc" ? aVal - bVal : bVal - aVal;
      }

      // 字串排序
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortState.value.life.order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }

  return data;
});

const paginatedLife = computed(() => {
  const s = (pageLife.value - 1) * PAGE_SUB;
  return filteredLifeWithSort.value.slice(s, s + PAGE_SUB);
});

/* VIDEO */
const pageVideo = ref(1);
const filteredVideo = computed(() => {
  if (!videoRange.value || videoRange.value.length < 2)
    return videoRecords.value;
  const [from, to] = videoRange.value;
  const start = from.getTime();
  const end = to.getTime();
  return videoRecords.value.filter((r) => {
    const ms = Date.parse(r.watchDate.replace(/\//g, "-"));
    return ms >= start && ms <= end;
  });
});
const totalVideo = computed(() => filteredVideo.value.length);
const totalPagesVideo = computed(() =>
  Math.max(1, Math.ceil(totalVideo.value / PAGE_SUB))
);
const filteredVideoWithSort = computed(() => {
  let data = filteredVideo.value;

  // 排序
  if (sortState.value.video.order && sortState.value.video.field) {
    data = [...data].sort((a: any, b: any) => {
      const field = sortState.value.video.field;
      let aVal = a[field];
      let bVal = b[field];

      // 日期排序
      if (field === "watchDate") {
        aVal = new Date(aVal?.replace(/\//g, "-") || "").getTime();
        bVal = new Date(bVal?.replace(/\//g, "-") || "").getTime();
      }

      // 數字排序
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortState.value.video.order === "asc"
          ? aVal - bVal
          : bVal - aVal;
      }

      // 字串排序
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortState.value.video.order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }

  return data;
});

const paginatedVideo = computed(() => {
  const s = (pageVideo.value - 1) * PAGE_SUB;
  return filteredVideoWithSort.value.slice(s, s + PAGE_SUB);
});
const pageNumberListVideo = computed(() =>
  pageButtons(totalPagesVideo.value, pageVideo.value, maxButtons.value)
);

/* APP */
const pageApp = ref(1);
const filteredApp = computed(() => {
  if (!appDateRange.value || appDateRange.value.length < 2)
    return appRecords.value;
  const [from, to] = appDateRange.value;
  const start = from.getTime();
  const end = to.getTime();
  return appRecords.value.filter((r) => {
    const ms = Date.parse(r.startDate.replace(/\//g, "-"));
    return ms >= start && ms <= end;
  });
});
const totalApp = computed(() => filteredApp.value.length);
const totalPagesApp = computed(() =>
  Math.max(1, Math.ceil(totalApp.value / PAGE_SUB))
);
const filteredAppWithSort = computed(() => {
  let data = filteredApp.value;

  // 排序
  if (sortState.value.app.order && sortState.value.app.field) {
    data = [...data].sort((a: any, b: any) => {
      const field = sortState.value.app.field;
      let aVal = a[field];
      let bVal = b[field];

      // 日期排序
      if (field === "startDate" || field === "endDate") {
        aVal = new Date(aVal?.replace(/\//g, "-") || "").getTime();
        bVal = new Date(bVal?.replace(/\//g, "-") || "").getTime();
      }

      // 數字排序
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortState.value.app.order === "asc" ? aVal - bVal : bVal - aVal;
      }

      // 字串排序
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortState.value.app.order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }

  return data;
});

const paginatedApp = computed(() => {
  const s = (pageApp.value - 1) * PAGE_SUB;
  return filteredAppWithSort.value.slice(s, s + PAGE_SUB);
});
const pageNumberListApp = computed(() =>
  pageButtons(totalPagesApp.value, pageApp.value, maxButtons.value)
);
const filteredAppForChart = computed(() => {
  if (!appDateRange.value || appDateRange.value.length < 2)
    return appRecords.value;
  const [from, to] = appDateRange.value;
  const start = from.getTime();
  const end = to.getTime();
  return appRecords.value.filter((r) => {
    const ms = Date.parse(r.startDate.replace(/\//g, "-"));
    return ms >= start && ms <= end;
  });
});

/* HEALTH LOG */
const pageHealthLog = ref(1);
const filteredHealthLog = computed(() => {
  let data = healthLogRecords.value || [];

  // 日期區間篩選（前端篩選，因為 API 是依月份取得）
  if (healthLogDateRange.value && healthLogDateRange.value.length >= 2) {
    const [from, to] = healthLogDateRange.value;
    const start = from.getTime();
    const end = to.getTime() + 24 * 60 * 60 * 1000 - 1; // 包含結束日期的整天
    data = data.filter((r: any) => {
      if (!r.VerbalDate) return false;
      const ms = Date.parse(r.VerbalDate.replace(/\//g, "-"));
      return ms >= start && ms <= end;
    });
  }

  // 排序
  if (sortState.value.healthLog.order && sortState.value.healthLog.field) {
    data = [...data].sort((a: any, b: any) => {
      const field = sortState.value.healthLog.field;
      let aVal = a[field];
      let bVal = b[field];

      // 日期排序
      if (field === "VerbalDate") {
        aVal = new Date(aVal?.replace(/\//g, "-") || "").getTime();
        bVal = new Date(bVal?.replace(/\//g, "-") || "").getTime();
      }

      // 字串排序
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortState.value.healthLog.order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }

  return data;
});
const totalHealthLog = computed(() => filteredHealthLog.value.length);
const totalPagesHealthLog = computed(() =>
  Math.max(1, Math.ceil(totalHealthLog.value / PAGE_SUB))
);
const paginatedHealthLog = computed(() => {
  const s = (pageHealthLog.value - 1) * PAGE_SUB;
  return filteredHealthLog.value.slice(s, s + PAGE_SUB);
});
const pageNumberListHealthLog = computed(() =>
  pageButtons(totalPagesHealthLog.value, pageHealthLog.value, maxButtons.value)
);

/* 匯出健康日誌 Excel */
const exportHealthLogExcel = () => {
  const data = filteredHealthLog.value;
  if (!data.length) {
    alert("目前沒有健康日誌資料可匯出");
    return;
  }

  // 組裝 Excel 資料
  const rows = data.map((row: any) => ({
    口述內容: row.VerbalContent || "",
    口述日期: row.VerbalDate || "",
    AI摘要: row.Note || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // 設定欄位寬度
  ws["!cols"] = [
    { wch: 60 }, // 口述內容
    { wch: 20 }, // 口述日期
    { wch: 60 }, // AI摘要
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "健康日誌");

  // 產出檔名（會員名稱 + 日期）
  const memberName = member.value?.Name || "會員";
  const today = new Date();
  const dateStr = `${today.getFullYear()}${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`;
  const fileName = `${memberName}_健康日誌_${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
};

/* WEEKLY SUMMARY */
const pageWeeklySummary = ref(1);
const filteredWeeklySummary = computed(() => {
  let data = weeklySummaryRecords.value || [];

  // 只顯示當前會員的本週摘要（依 MID 篩選）
  const currentMID = getAuth().sel?.MID;
  if (currentMID) {
    data = data.filter((r: any) => r.MID === currentMID);
  }

  // 排序
  if (
    sortState.value.weeklySummary.order &&
    sortState.value.weeklySummary.field
  ) {
    data = [...data].sort((a: any, b: any) => {
      const field = sortState.value.weeklySummary.field;
      let aVal = a[field];
      let bVal = b[field];

      // 日期區間排序（取開始日期）
      if (field === "DateRange" || field === "DatePeriod") {
        const aStart = aVal?.split(" - ")[0] || "";
        const bStart = bVal?.split(" - ")[0] || "";
        aVal = new Date(aStart?.replace(/\//g, "-") || "").getTime();
        bVal = new Date(bStart?.replace(/\//g, "-") || "").getTime();
      }

      // 彙整數量排序
      if (field === "AggregateQuantity" || field === "CNT") {
        aVal = parseInt(aVal) || 0;
        bVal = parseInt(bVal) || 0;
      }

      // 數字排序
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortState.value.weeklySummary.order === "asc"
          ? aVal - bVal
          : bVal - aVal;
      }

      // 字串排序
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortState.value.weeklySummary.order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }

  return data;
});
const totalWeeklySummary = computed(() => filteredWeeklySummary.value.length);
const totalPagesWeeklySummary = computed(() =>
  Math.max(1, Math.ceil(totalWeeklySummary.value / PAGE_SUB))
);
const paginatedWeeklySummary = computed(() => {
  const s = (pageWeeklySummary.value - 1) * PAGE_SUB;
  return filteredWeeklySummary.value.slice(s, s + PAGE_SUB);
});
const pageNumberListWeeklySummary = computed(() =>
  pageButtons(
    totalPagesWeeklySummary.value,
    pageWeeklySummary.value,
    maxButtons.value
  )
);

// 排序功能
function handleSort(type: string, field: string) {
  const current = sortState.value[type];
  if (current.field === field) {
    // 同一欄位：無序 -> 升序 -> 降序 -> 無序
    if (current.order === null) {
      current.order = "asc";
    } else if (current.order === "asc") {
      current.order = "desc";
    } else {
      current.order = null;
      current.field = "";
    }
  } else {
    // 不同欄位：直接設為升序
    current.field = field;
    current.order = "asc";
  }
}

// 產品使用紀錄篩選功能
function toggleHomeFilter() {
  showHomeFilter.value = !showHomeFilter.value;
}

function selectHomeFilterCategory(category: string) {
  selectedHomeFilterCategory.value = category;
  selectedHomeFilterOptions.value = [];
}

function toggleHomeFilterOption(option: string) {
  const index = selectedHomeFilterOptions.value.indexOf(option);
  if (index > -1) {
    selectedHomeFilterOptions.value.splice(index, 1);
  } else {
    selectedHomeFilterOptions.value.push(option);
  }
}

/* ---------- API ---------- */
async function fetchBasic() {
  const { token, admin, sel } = getAuth();
  if (!token || !admin || !sel.MID) return;
  const r = await fetch("https://23700999.com:8081/HMA/API_MemberDetail.jsp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      AdminID: admin,
      Token: token,
      MID: sel.MID,
      Mobile: sel.Mobile ?? "",
    }),
  });
  const j = await r.json();
  if (j.Result !== "OK") return;
  member.value = j.MemberDetail.Member;
  currentOrder.value = j.MemberDetail.NowOrderList?.[0] ?? null;
  lastUpdated.value = new Date().toLocaleString("zh-TW");
}

/* ---------- 共用範本 ---------- */
const makeFiltered = <T>(
  src: Ref<T[]>,
  range: Ref<Date[] | null>,
  dateKey: keyof T // 欄位名稱，如 'CheckTime'
) =>
  computed(() => {
    if (!range.value || range.value.length < 2) return src.value;
    const [from, to] = range.value;
    const start = from.getTime();
    const end = to.getTime();
    return src.value.filter((r: any) => {
      const ms = Date.parse(
        (r[dateKey] as string).split(" ")[0].replace(/\//g, "-")
      );
      return ms >= start && ms <= end;
    });
  });

/* ---------- 各列表 ---------- */
/* 列表：依 range 過濾 ------------------------------------- */
const filteredANS = makeFiltered(ansRecords, ansRange, "CheckTime");
const filteredLife = makeFiltered(lifeRecords, lifeRange, "CheckTime");

/* 圖表：只要原始陣列 (完整) ------------------------------ */
const chartHRV = computed(() => hrvRecords.value); // 全部資料
const chartANS = computed(() => ansRecords.value);
const chartLife = computed(() => lifeRecords.value);

/* ---------- watch & lifecycle ---------- */

watch(selectedHomeFilterOptions, () => {
  pageHome.value = 1;
});
watch(homeKeyword, () => {
  pageHome.value = 1;
});

watch(videoRange, () => {
  pageVideo.value = 1;
});
watch(appDateRange, () => {
  pageApp.value = 1;
});
watch(ringRange, () => {
  pageRing.value = 1;
});
watch(watchKeyword, () => {
  pageRing.value = 1;
});
watch(selectedWatchFilterOptions, () => {
  pageRing.value = 1;
});
watch(
  healthLogDateRange,
  async (newRange) => {
    pageHealthLog.value = 1;
    // 當日期範圍改變時，重新取得健康日誌
    // 如果選擇的日期範圍跨月，則取得多個月的資料
    if (newRange && newRange.length >= 2) {
      const [from, to] = newRange;
      const fromYear = from.getFullYear();
      const fromMonth = from.getMonth() + 1;
      const toYear = to.getFullYear();
      const toMonth = to.getMonth() + 1;

      // 如果跨月，取得所有相關月份的資料
      const monthsToFetch: Array<{ year: string; month: string }> = [];
      let currentYear = fromYear;
      let currentMonth = fromMonth;

      while (
        currentYear < toYear ||
        (currentYear === toYear && currentMonth <= toMonth)
      ) {
        monthsToFetch.push({
          year: currentYear.toString(),
          month: currentMonth.toString().padStart(2, "0"),
        });

        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
      }

      // 取得所有相關月份的資料（第一個月份覆蓋，後續月份合併）
      for (let i = 0; i < monthsToFetch.length; i++) {
        const { year, month } = monthsToFetch[i];
        await memberStore.fetchHealthLog(getAuth(), year, month, i > 0);
      }
    }
  },
  { deep: true }
);

function pageButtons(total: number, current: number, max = maxButtons.value) {
  const pages: number[] = [];
  if (total <= max) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    let start = Math.max(1, current - Math.floor(max / 2));
    let end = start + max - 1;
    if (end > total) {
      end = total;
      start = total - max + 1;
    }
    for (let i = start; i <= end; i++) pages.push(i);
  }
  return pages;
}

const pageNumberListANS = computed(() =>
  pageButtons(totalPagesANS.value, pageANS.value, maxButtons.value)
);
const pageNumberListLife = computed(() =>
  pageButtons(totalPagesLife.value, pageLife.value, maxButtons.value)
);

const loading = ref(false);

/* ---------- 外部轉移登入 ---------- */
async function handleTransferLogin(): Promise<boolean> {
  const adminID = route.query.AdminID as string | undefined;
  const safeKey = route.query.SafeKey as string | undefined;
  const mobile = route.query.Mobile as string | undefined;

  if (!adminID || !safeKey) return false;

  try {
    const res = await fetch(
      "https://23700999.com:8081/HMA/API_AdminTransferLogin.jsp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AdminID: adminID,
          SafeKey: safeKey,
          Mobile: mobile || "",
        }),
      }
    );
    const data = await res.json();

    if (data.Result === "OK" && data.Token) {
      // MID 為空代表無此會員
      if (!data.MID) {
        alert("無此會員");
        window.close();
        return false;
      }

      // 將 Token 與 AdminID 存入 localStorage
      localStorage.setItem("backendToken", data.Token);
      localStorage.setItem("adminID", data.AdminID || adminID);

      // 將 MID 與 Mobile 存入 selectedMember，供後續載入會員資料使用
      localStorage.setItem(
        "selectedMember",
        JSON.stringify({ MID: data.MID, Mobile: mobile || "" })
      );
      return true;
    } else {
      console.error("轉移登入失敗：", data.Result);
      return false;
    }
  } catch (err) {
    console.error("轉移登入 API 錯誤：", err);
    return false;
  }
}

watch(
  () => route.query,
  async () => {
    loading.value = true;

    // 若 URL 帶有 AdminID & SafeKey，先執行轉移登入
    const hasTransferParams = route.query.AdminID && route.query.SafeKey;
    if (hasTransferParams) {
      const loginOk = await handleTransferLogin();
      if (!loginOk) {
        loading.value = false;
        console.error("轉移登入失敗，無法載入會員資料");
        return;
      }
    }

    memberStore.clear();
    await memberStore.fetchAll(getAuth());

    // 取得產品使用紀錄
    await memberStore.fetchFavoriteTPointsList(getAuth());

    // 取得健康日誌（使用空白月份取得全部列表）
    await memberStore.fetchHealthLog(getAuth(), "", "");

    // 取得本周摘要
    await memberStore.fetchWeeklySummary(getAuth());

    // 取得華碩序號列表
    const { sel } = getAuth();
    if (sel?.MID) {
      await memberStore.fetchVivoWatchList(sel.MID);
    }

    loading.value = false;
  },
  { deep: true, immediate: true }
);

/* ---------- 分頁操作 ---------- */
function goto(refVar: Ref<number>, p: number) {
  refVar.value = p;
}
function prev(refVar: Ref<number>) {
  if (refVar.value > 1) refVar.value--;
}
function next(refVar: Ref<number>, totalPages: number) {
  if (refVar.value < totalPages) refVar.value++;
}

function openContract() {
  // 這裡示範直接用 currentOrder，也可以改呼叫 API 取得完整歷史
  contractList.value = currentOrder.value ? [currentOrder.value] : [];
  showContract.value = true;
}

function closeContract() {
  showContract.value = false;
}

/* ---------- 其他 ---------- */
async function refresh() {
  loading.value = true;
  memberStore.clear();
  await memberStore.fetchAll(getAuth());

  // 取得產品使用紀錄
  await memberStore.fetchFavoriteTPointsList(getAuth());

  // 取得健康日誌
  await memberStore.fetchHealthLog(getAuth(), "", "");

  // 取得本周摘要
  await memberStore.fetchWeeklySummary(getAuth());

  // 重新取得華碩序號列表
  const { sel } = getAuth();
  if (sel?.MID) {
    await memberStore.fetchVivoWatchList(sel.MID);
  }
  loading.value = false;
}
function goBack() {
  router.push("/raphaelBackend/member");
}

const showANS = ref(false);
const selectedANS = ref<any>(null);

async function fetchANSDetail(a: any) {
  const { token, admin, sel } = getAuth();
  if (!token || !admin || !sel.MID) return null;

  // 取得本次 AID
  const AID = a.AID;

  // 找出前一筆記錄
  let preAID = "";
  const sortedList = ansRecords.value
    .slice()
    .sort(
      (x, y) =>
        new Date(y.CheckTime).getTime() - new Date(x.CheckTime).getTime()
    );

  // 找到當前記錄的索引
  const currentIndex = sortedList.findIndex((item) => item.AID === AID);

  // 如果找到當前記錄，且不是第一筆，則取前一筆的 AID
  if (currentIndex !== -1 && currentIndex < sortedList.length - 1) {
    preAID = sortedList[currentIndex + 1].AID;
  }

  console.log("Current AID:", AID);
  console.log("Previous AID:", preAID);
  console.log(
    "All records:",
    sortedList.map((item) => ({
      AID: item.AID,
      CheckTime: item.CheckTime,
    }))
  );

  const res = await fetch(
    "https://23700999.com:8081/HMA/API_Home_ANSDetail.jsp",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        AdminID: admin,
        Token: token,
        MID: sel.MID,
        Mobile: sel.Mobile ?? "",
        AID,
        preAID,
      }),
    }
  );
  return await res.json();
}

async function openANS(ans: any) {
  const detail = await fetchANSDetail(ans);
  if (detail && detail.Result === "OK") {
    selectedANS.value = detail;
    showANS.value = true;
  } else {
    alert("取得自律神經詳細資料失敗");
  }
}
function closeANS() {
  showANS.value = false;
}

const showLife = ref(false);
const selectedLife = ref<any>(null);

function openLife(life: any) {
  selectedLife.value = life;
  showLife.value = true;
}
function closeLife() {
  showLife.value = false;
}

function openWeeklySummaryModal(row: any) {
  selectedWeeklySummary.value = row;
  showWeeklySummaryModal.value = true;
}
function closeWeeklySummaryModal() {
  showWeeklySummaryModal.value = false;
  selectedWeeklySummary.value = null;
}

// 基本資料編輯相關函數
function openEditBasicModal() {
  showEditBasicModal.value = true;
}

function closeEditBasicModal() {
  showEditBasicModal.value = false;
}

async function handleEditBasicSubmit(data: {
  name: string;
  birthday: string;
  phone: string;
}) {
  const { token, admin, sel } = getAuth();
  if (!token || !admin || !sel.MID) {
    alert("請先登入");
    return;
  }

  try {
    // TODO: 替換為實際的 API 端點
    const response = await fetch(
      "https://23700999.com:8081/HMA/API_UpdateMemberBasicInfo.jsp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AdminID: admin,
          Token: token,
          MID: sel.MID,
          Name: data.name,
          Birthday: data.birthday,
          Mobile: data.phone,
        }),
      }
    );

    const result = await response.json();
    if (result.Result === "OK") {
      alert("基本資料更新成功");
      closeEditBasicModal();
      // 重新載入會員資料
      await refresh();
    } else {
      alert(result.Message || "更新失敗，請稍後再試");
    }
  } catch (error) {
    console.error("更新基本資料失敗:", error);
    alert("更新失敗，請稍後再試");
  }
}

// 刪除會員相關函數
function openDeleteMemberModal() {
  showDeleteMemberModal.value = true;
}

function closeDeleteMemberModal() {
  showDeleteMemberModal.value = false;
}

async function handleDeleteMemberConfirm() {
  const { token, admin, sel } = getAuth();
  if (!token || !admin || !sel.MID) {
    alert("請先登入");
    return;
  }

  try {
    // TODO: 替換為實際的 API 端點
    const response = await fetch(
      "https://23700999.com:8081/HMA/API_DeleteMember.jsp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AdminID: admin,
          Token: token,
          MID: sel.MID,
          Mobile: sel.Mobile ?? "",
        }),
      }
    );

    const result = await response.json();
    if (result.Result === "OK") {
      alert("會員已刪除");
      closeDeleteMemberModal();
      // 返回會員列表
      router.push("/raphaelBackend/member");
    } else {
      alert(result.Message || "刪除失敗，請稍後再試");
    }
  } catch (error) {
    console.error("刪除會員失敗:", error);
    alert("刪除失敗，請稍後再試");
  }
}

const props = defineProps<{ record: any }>();
defineEmits(["close"]);

const mmdd = (raw: string) => {
  if (!raw || typeof raw !== "string") return "";
  if (!raw.includes("/")) return raw; // 非日期直接顯示
  const datePart = raw.split(" ")[0];
  const parts = datePart.split("/");
  if (parts.length === 3) {
    const [_, m, d] = parts;
    return `${m.padStart(2, "0")}/${d.padStart(2, "0")}`;
  }
  return raw;
};

const isAnyAlertOpen = computed(() => {
  return (
    showContract.value ||
    showANS.value ||
    showLife.value ||
    showWeeklySummaryModal.value
  );
});

const isExpired = computed(() => {
  if (!currentOrder.value?.RentEnd) return false;
  const endDate = new Date(currentOrder.value.RentEnd.replace(/\//g, "-"));
  return endDate < new Date();
});

// ───── 操作紀錄彈窗 ─────
const showOperationRecord = ref(false);
const operationDateRange = ref<Date[] | null>(null);
const showEventFilter = ref(false);
const selectedEvents = ref<string[]>([]);
const operationRecordsData = ref<any[]>([]);

const eventOptions = [
  "結束治療",
  "開始治療",
  "治療滿30分鐘",
  "蜂鳴器長嗶一分鐘",
  "低電2警示",
  "低電1警示",
  "暫停治療",
  "恢復治療",
];

async function openOperationRecord() {
  // 取得操作紀錄（全部，不篩選 AID）
  await memberStore.fetchOptDetailMIDList(getAuth(), "");
  operationRecordsData.value = optDetailList.value || [];
  showOperationRecord.value = true;
}

function closeOperationRecord() {
  showOperationRecord.value = false;
  showEventFilter.value = false;
}

function toggleEventFilter() {
  showEventFilter.value = !showEventFilter.value;
}

function toggleEventOption(event: string) {
  const index = selectedEvents.value.indexOf(event);
  if (index > -1) {
    selectedEvents.value.splice(index, 1);
  } else {
    selectedEvents.value.push(event);
  }
}

// 篩選操作紀錄
const filteredOperationRecords = computed(() => {
  let data = operationRecordsData.value;

  // 日期篩選
  if (operationDateRange.value && operationDateRange.value.length >= 2) {
    const [from, to] = operationDateRange.value;
    const start = from.getTime();
    const end = to.getTime() + 24 * 60 * 60 * 1000 - 1;
    data = data.filter((r: any) => {
      if (!r.date) return false;
      const ms = Date.parse(r.date.replace(/\//g, "-"));
      return ms >= start && ms <= end;
    });
  }

  // 事件篩選
  if (selectedEvents.value.length > 0) {
    data = data.filter((r: any) => selectedEvents.value.includes(r.event));
  }

  return data;
});

// 動態取得所有可用的事件選項
const availableEventOptions = computed(() => {
  const events = new Set<string>();
  operationRecordsData.value.forEach((r: any) => {
    if (r.event) events.add(r.event);
  });
  return Array.from(events).sort();
});

</script>

<style scoped lang="scss">
.memberInfo {
  display: flex;
  min-height: 100vh;
  background: $primary-100;
  gap: 1%;
  .w-half {
    flex: 1;
    width: 0;
    @include respond-to("xl") {
      flex: unset;
      width: 100%;
    }
  }
  .memberInfoContent {
    padding: 1rem;
    padding-left: 0;
    width: 100%;
    margin: 0 auto;

    @include respond-to("lg") {
      padding-left: 1rem;
    }

    @include respond-to("md") {
      width: 100%;
    }

    .memberInfoTitle {
      width: 100%;
      display: flex;
      justify-content: space-between;
      .memberNameRWD {
        display: none;
      }

      @include respond-to("lg") {
        padding-left: 36px;
      }

      @include respond-to("sm") {
        flex-wrap: wrap;
        h3 {
          display: none;
        }
        .memberNameRWD {
          display: block;
        }
      }

      .optionGroup {
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;

        @include respond-to("sm") {
          flex-wrap: wrap;
          justify-content: space-between;
          width: 100%;
        }


        .rwdW100 {
          display: flex;
          align-items: center;
          gap: 8px;
          @include respond-to("sm") {
            width: 100%;
            justify-content: flex-end;
            justify-content: space-between;
          }
        }

        button {
          display: flex;
          gap: 4px;
          img {
            width: 18px;
          }
          background-color: $primary-200;
          border: none;
          color: var(--Primary-100, #f5f7fa);
          font-size: 1.125rem;
          font-style: normal;
          font-weight: 400;
          padding: 0.25rem 0.5rem;
          letter-spacing: 0.25px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          &:hover {
            background-color: $primary-300;
          }
          @include respond-to("lg") {
            font-size: 1rem;
            padding: 0.25rem 0.5rem;
          }
        }
      }
      h3 {
        color: $primary-600;
        text-align: center;
        font-size: 32px;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.09px;
      }
    }

    .memberInfoCardWrap {
      .memberInfoRow {
        width: 100%;
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 1rem;
        @include respond-to("xl") {
          display: flex;
          flex-wrap: wrap;
        }
        h3 {
          color: $primary-600;
          font-size: 1.5rem;
          font-weight: 500;
          letter-spacing: 0.12px;
        }
        h5 {
          color: var(--Primary-300, #6d8ab6);
          font-size: 1.125rem;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.09px;
          margin: 1.5rem 0 1rem 0;
        }
        .memberInfoWarning {
          color: $raphael-red-300;
          font-size: 1.125rem;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.09px;
          padding: 0.25rem 0;
        }

        .memberInfoWarningTagsGroup {
          display: flex;
          gap: 8px;
          margin: 8px 0 0 0;

          .memberInfoWarningTag {
            border-radius: 50px;
            padding: 4px 12px;
            font-size: 15px;
            font-weight: 500;
            color: var(--Primary-default, #1ba39b);
            text-align: center;

            font-size: 1.125rem;
            font-style: normal;
            font-weight: 400;
            line-height: 100%; /* 18px */
            letter-spacing: 0.09px;
            border-radius: 50px;
            border: 1px solid var(--Primary-default, #1ba39b);
            background: var(--primary-400-opacity-10, rgba(27, 163, 155, 0.1));
            padding: 8px;
            &.used {
            }
            &.remain {
              background: #fff4f4;
              color: #ec4f4f;

              border: 1px solid $raphael-red-300;
              background: var(--warning-300-opacity-10, rgba(236, 79, 79, 0.1));
            }
          }
        }

        .memberInfoCard {
          display: flex;
          flex-direction: column;
          padding: 1rem;
          background-color: #fff;
          border-radius: 20px;
          position: relative;
          box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);

          @include respond-to("xl") {
            min-height: 300px;
          }
          @include respond-to("sm") {
            min-height: 400px;
          }
          .pagination {
            max-width: 100%;
            flex-wrap: wrap;
            overflow: hidden;
          }
          @include respond-to("md") {
            width: 100% !important;
          }
        }

        .memberInfoList {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: $primary-200;
          font-size: 1.125rem;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.09px;
          margin-bottom: 1rem;

          img {
            transform: translateY(3px);
            margin-right: 4px;
          }
          .memberInfoListContent {
            color: $primary-600;
          }
        }
        .memberInfoTagsGroup {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 1.5rem;

          .memberInfoTag {
            border-radius: 50px;
            border: 1px solid var(--Primary-default, #1ba39b);
            background: var(--primary-400-opacity-10, rgba(27, 163, 155, 0.1));
            color: var(--Primary-default, #1ba39b);
            text-align: center;

            font-size: 1.125rem;
            font-style: normal;
            font-weight: 400;
            line-height: 100%; /* 18px */
            letter-spacing: 0.09px;
            padding: 4px 8px;

            img {
              width: 1rem;
            }
          }
        }
        .acerBox {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border-radius: 6px;
          border: 1px solid var(--Primary-default, #1ba39b);
          background: none;
          padding: 4px 8px;
          color: var(--Primary-default, #1ba39b);
          font-size: 14px;
          font-style: normal;
          font-weight: 400;
          margin-top: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          &:hover {
            background: $chip-success;
            color: #fff;
            & > img {
              filter: brightness(10);
            }
            & > span {
              color: #fff;
            }
          }
          img {
            width: 16px;
          }
          span {
            color: var(--Primary-default, #1ba39b);
            font-size: var(--Text-font-size-18, 18px);
            font-style: normal;
            font-weight: 400;
            letter-spacing: 1px;
          }
          .acerBox-arrow {
            width: 14px;
            height: 14px;
            margin-left: 4px;
          }
        }
        .memberInfoBtnGroup{
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 0.75rem;
       
        }
        .consumptionBtn, .operationRecordBtn {
          width: 100%;
          padding: 6px 8px;
          color: var(--Primary-default, #1ba39b);
          font-size: 1.125rem;
          font-style: normal;
          font-weight: 400;
          line-height: 100%; /* 18px */
          letter-spacing: 0.09px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: transparent;
          border: none;
          border: 1px solid #1ba39b;
          border-radius: 6px;
          margin-top: 0.75rem;
          cursor: pointer;
          transition: all ese 0.2s;

          &:hover {
            background: $chip-success;
            color: #fff;
            & > img {
              filter: brightness(10);
            }
          }
        }
        .memberInfoTitleWrap {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          gap: 0.5rem;

          @include respond-to("sm") {
            flex-wrap: wrap;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 0;
          }
        }
        .memberInfoTitleGroup {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          small {
            white-space: nowrap;
          }
          :deep(.dp__input) {
            padding-top: 0; // 改 input padding
            padding-bottom: 0; // 改 input padding
            border-radius: 50px;
            background: #fff;
            box-shadow: 0px 2px 12px -2px rgba(177, 192, 216, 0.5);
            border: none;
            font-size: 14px;
            transition: all ease 0.2s;

            &:hover {
              box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
            }
          }
          .filterDropdown {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            border-radius: var(--Radius-r-50, 50px);
            background: var(--Neutral-white, #fff);
            box-shadow: 0 2px 20px 0
              var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
            .filterDropdownWrapper {
              position: relative;
              width: max-content;
              &::after {
                content: "";
                position: absolute;
                background: #ddd;
                width: 1px;
                height: 100%;
                top: 0;
                right: -7px;
              }
              .filterTrigger {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 4px;
                padding: 0.25rem 1rem;
                background: #fff;
                border-radius: 50px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;

                img {
                  width: 12px;
                  height: 12px;
                  transition: transform 0.2s;
                  &.rotated {
                    transform: rotate(180deg);
                  }
                }
                &:hover {
                  box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
                }
              }
              .filterDropdownPanel {
                position: absolute;
                top: calc(100% + 8px);
                right: 0;
                display: flex;
                background: #fff;
                border-radius: 12px;
                z-index: 100;
                min-width: 500px;
                max-height: 400px;
                box-shadow: 0 2px 20px 0
                  var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
                overflow: hidden;
                .filterCategories {
                  width: auto;
                  border-right: 1px solid #e0e0e0;
                  padding: 1rem 0;
                  .filterCategory {
                    padding: 0.75rem 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 14px;
                    color: #666;
                    &:hover {
                      background: #f5f7fa;
                    }
                    &.active {
                      background: rgba(27, 163, 155, 0.1);
                      color: #1ba39b;
                      font-weight: 500;
                    }
                  }
                }
                .filterOptions {
                  flex: 1;
                  padding: 1rem;
                  overflow-y: auto;
                  max-height: 100%;
                  .filterOption {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: background 0.2s;
                    font-size: 14px;
                    color: #1ba39b;
                    &:hover {
                      background: #f5f7fa;
                    }
                    input[type="checkbox"] {
                      width: 18px;
                      height: 18px;
                      cursor: pointer;
                      accent-color: #1ba39b;
                    }
                  }
                }
              }
            }
            .searchKeywordInput {
              padding: 0.25rem 1rem;
              background: #fff;
              border: none;
              border-radius: 50px;
              outline: none;
              font-size: 14px;
              transition: all 0.2s;
              min-width: 150px;

              

              &::placeholder {
                color: #999;
              }
              &:focus {
                box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
              }
            }
          }
        }
        .exportExcelBtn{
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          padding: 0.1rem .5em;
          border-radius: 50px;
          background: #fff;
          color: var(--Neutral-500, #666);
          font-size: 14px;
          cursor: pointer;
          border: none;
          border-radius: var(--Radius-r-50, 50px);
          background: var(--Neutral-white, #FFF);
          box-shadow: 0 2px 20px 0 var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
          width: 140px;
        }
      }
      .memberInfoCardGroup {
        display: flex;
        flex-direction: column;
        flex: 1;
        max-width: 400px;
        gap: 12px;
        justify-content: space-between;

        .memberInfoCard2 {
          padding: 1rem;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          background-color: #fff;
          box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);

          .memberInfoCard2Header {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .memberInfoIconGroup {
            display: flex;
            align-items: center;
            gap: 4px;
            img {
              cursor: pointer;
            }
          }
        }
        @include respond-to("md") {
          width: 100% !important;
        }
      }
      .memberInfoCardGroupW50 {
        flex: 1;
        @include respond-to("xl") {
        }
      }
      .memberInfoCardGroupW100 {
        flex: 1;
        @include respond-to("xl") {
          flex: unset;
          width: 100%;
        }
      }
    }
    small {
      color: $primary-200;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.5px;
    }
    .memberInfoTable {
      flex: 1;
      margin-top: 0.75rem;
      @include respond-to("xl") {
        margin-top: 1.5rem;
      }
      .memberInfoTableTitle {
        display: flex;
        white-space: nowrap;
        font-size: 1rem;
        .memberInfoTableTitleItem {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 4px;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s;
          padding: 0.5rem;
          border-radius: 4px;
          &:hover {
            background-color: rgba(27, 163, 155, 0.1);
          }
          .sortIcon {
            width: 16px;
            height: 16px;
            opacity: 0.5;
            transition: opacity 0.2s;
          }
          &:hover .sortIcon {
            opacity: 1;
          }
        }
      }
      .memberInfoTableHR {
        height: 1px;
        width: 100%;
        background-color: #b1c0d8;
        margin-top: 0.5rem;
      }
      .memberInfoTableRow {
        display: flex;
        align-items: center;
        position: relative;
        color: #666;

        &:hover {
          color: $chip-success;

          & > img {
            border-radius: 50%;
            box-shadow: inset 0px 2px 6px -1px $primary-200;
          }
        }
        img {
          position: absolute;
          right: 0;
          transition: all 0.25s ease;
        }
        .memberInfoTableRowItem {
          flex: 1;
          padding: 1rem 0.5rem;
          &.summary-cell-one-line {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }

      .productUsagRecords {
        cursor: pointer;
      }
      .hrvRecord {
        @extend .productUsagRecords;
      }
    }
  }
  .pagination {
    display: flex;
    justify-content: center;
    gap: 4px;

    bottom: 1rem;
    left: 50%;

    width: 100%;
    .btn-page {
      padding: 6px 10px;
      min-width: 32px;
      border-radius: 4px;
      background-color: transparent;
      cursor: pointer;
      border: none;
      color: #2d3047;
      &.active {
        background: $chip-success;
        color: white;
        border-color: $chip-success;
      }
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .btn-page-number {
      background: white;
    }
  }
}

/* 本週摘要詳情彈跳視窗 */
.weekly-summary-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
}
.weekly-summary-modal {
  width: 90%;
  max-width: 640px;
  max-height: 85vh;
  border-radius: 20px;
  border: 3px solid var(--Primary-default, #1ba39b);
  background: var(--neutral-white-opacity-30, rgba(255, 255, 255, 0.95));
  box-shadow: 0px 2px 20px 0px
    var(--primary-400-opacity-25, rgba(27, 163, 155, 0.25));
  backdrop-filter: blur(25px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .weekly-summary-modal-header {
    padding: 1rem 1.25rem 0.5rem;
    position: relative;
    h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #2d3047;
    }
    .summary-date-label {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: #666;
    }
    .weekly-summary-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 20px;
        height: 20px;
      }
    }
  }
  .weekly-summary-modal-body {
    padding: 1rem 1.25rem 1.25rem;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }
  .weekly-summary-section {
    margin-bottom: 1rem;
    &:last-child {
      margin-bottom: 0;
    }
    h4 {
      margin: 0 0 0.5rem;
      font-size: 1rem;
      color: #2d3047;
    }
  }
  .weekly-summary-content {
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: #444;
  }
}

.loading-mask {
  position: fixed;
  z-index: 9999;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .loading-spinner {
    border: 6px solid #eee;
    border-top: 6px solid #1ba39b;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}

// ───── 操作紀錄彈窗樣式 ─────
.operationModalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 10000;

  .operationModal {
    position: fixed;
    width: 80%;
    max-width: 1200px;
    left: 50%;
    top: 50%;
    height: 90%;
    transform: translate(-50%, -50%);
    border-radius: 20px;
    border: 3px solid var(--Primary-default, #1ba39b);
    background: var(--neutral-white-opacity-30, rgba(255, 255, 255, 0.3));
    box-shadow: 0px 2px 20px 0px
      var(--primary-400-opacity-25, rgba(27, 163, 155, 0.25));
    backdrop-filter: blur(25px);
    z-index: 100;
    padding: 1rem 2.5%;
    overflow-y: auto;
    scrollbar-gutter: stable;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    // 自訂 scrollbar 樣式（Webkit）
    &::-webkit-scrollbar {
      width: 12px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #878787;
      border-radius: 10px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    &::-webkit-scrollbar-thumb:hover {
      background-color: #848484;
    }

    .operationModalHeader {
      text-align: center;
      margin-bottom: 0.75rem;

      padding: 0;
      gap: 1rem;

      @include respond-to("md") {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .operationModalHeaderLeft {
        .npLogo {
          width: 2rem;
          height: 2rem;
          border-radius: 9.8px;
          border: 1px solid var(--Primary-default, #1ba39b);
          padding: 2px 4px;
        }
      }

      .operationModalHeaderCenter {
        flex: 1;
        margin-top: 0.25rem;
        margin-bottom: 0.15rem;
        h3 {
          color: $primary-600;
          font-size: var(--Text-font-size-24, 20px);
          font-style: normal;
          font-weight: 700;
          letter-spacing: 0.12px;
          margin: 0;
        }
      }

      .operationModalHeaderRight {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: end;

        @include respond-to("md") {
          width: 100%;
          flex-direction: column;
          align-items: flex-start;
        }

        .operationCount {
          color: var(--Primary-200, #b1c0d8);
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .operationFilters {
          display: flex;
          gap: 0.75rem;
          align-items: center;

          @include respond-to("md") {
            width: 100%;
            flex-direction: column;
          }

          .dateFilter {
            :deep(.dp__input) {
              padding: 0.5rem 1rem;
              border-radius: 50px;
              background: #fff;
              box-shadow: 0px 2px 12px -2px rgba(177, 192, 216, 0.5);
              border: none;
              font-size: 14px;
            }
          }

          .eventFilterWrapper {
            position: relative;

            .eventFilterTrigger {
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 0.5rem 1rem;
              background: #fff;
              border-radius: 50px;
              cursor: pointer;
              box-shadow: 0px 2px 12px -2px rgba(177, 192, 216, 0.5);
              font-size: 14px;
              transition: all 0.2s;
              width: 200px;
              height: 42px;
              img {
                width: 12px;
                height: 12px;

                &.rotated {
                  transform: rotate(180deg);
                }
              }

              &:hover {
                box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
              }
            }

            .eventFilterDropdown {
              position: absolute;
              top: calc(100% + 8px);
              right: 0;
              background: #fff;
              border-radius: 12px;
              box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
              z-index: 100;
              min-width: 200px;
              max-height: 300px;
              overflow-y: auto;
              padding: 0.5rem;

              .eventFilterOption {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem;
                cursor: pointer;
                border-radius: 4px;
                transition: background 0.2s;
                font-size: 14px;
                color: #1ba39b;

                &:hover {
                  background: #f5f7fa;
                }

                input[type="checkbox"] {
                  width: 18px;
                  height: 18px;
                  cursor: pointer;
                  accent-color: #1ba39b;
                }
              }
            }
          }
        }
      }
    }

    .operationModalTable {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border-radius: var(--Radius-r-20, 20px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0 2px 20px 0
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
      .operationTableHeader {
        display: flex;
        padding: 1rem 2rem;

        border-bottom: 1px solid #e0e0e0;

        .operationTableHeaderItem {
          flex: 1;
          text-align: center;
          font-weight: 600;
          color: $primary-600;
          font-size: 16px;
        }
      }

      .operationTableHR {
        background: $primary-200;
        width: 100%;
        height: 1px;
      }

      .operationTableBody {
        flex: 1;
        overflow-y: auto;
        padding: 0 2rem;
        padding-bottom: 44px;

        .operationTableRow {
          display: flex;
          padding: 1rem 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background-color: #f9f9f9;
          }

          .operationTableCell {
            flex: 1;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        }
      }
    }

    .operationModalFooter {
      text-align: center;
      margin-top: 0.5rem;
      position: absolute;
      bottom: 3.5%;
      left: 50%;
      transform: translateX(-50%);

      .operationModalClose {
        border-radius: var(--Radius-r-50, 50px);
        background: $raphael-white;
        box-shadow: 0px 2px 20px 0px
          var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
        padding: 0.25rem;
        cursor: pointer;
        display: inline-block;
        transition: all 0.2s;

        &:hover {
          box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
        }

        img {
          width: 20px;
          height: 20px;
          display: block;
        }
      }
    }
  }
}

// ───── 手錶紀錄表格樣式 ─────
.watchRecordCard {
  width: 100% !important;
}

.watchTable {
  .memberInfoTableTitle {
    gap: 0;
  }

  .memberInfoTableTitleItem {
    min-width: 0;
    font-size: 13px !important;
    white-space: nowrap;
  }

  .memberInfoTableRow.watchRow {
    cursor: pointer;
    transition: background 0.15s;



    &:hover {
      background-color: #f5fafa;
    }

    .memberInfoTableRowItem {
      font-size: 13px;
      min-width: 0;
    }
  }

  .watchBodyCompCol {
    min-width: 120px;
  }

  .watchBodyCompCell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    line-height: 1.4;
    font-size: 12px !important;

    span {
      white-space: nowrap;
    }
  }
}

.watchFilterDropdownWrapper {
  position: relative;

  .filterTrigger {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0.3rem .5rem;
    background: #fff;
    border-radius: 50px;
    cursor: pointer;
    box-shadow: 0px 2px 12px -2px rgba(177, 192, 216, 0.5);
    font-size: 14px;
    transition: all 0.2s;
 
    width: 140px;
    img {
      width: 12px;
      height: 12px;

      &.rotated {
        transform: rotate(180deg);
      }
    }

    &:hover {
      box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
    }
  }

  .filterDropdownPanel {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 200;
    min-width: 300px;
    max-height: 350px;
    overflow: hidden;
    display: flex;

    .filterCategories {
      border-right: 1px solid #eee;
      padding: 0.5rem 0;
      min-width: 90px;

      .filterCategory {
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-size: 13px;
        white-space: nowrap;
        transition: all 0.15s;

        &.active {
          color: #1ba39b;
          font-weight: 600;
          background: #f0faf9;
        }

        &:hover {
          background: #f5f7fa;
        }
      }
    }

    .filterOptions {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;

      .filterOption {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.4rem 0.5rem;
        cursor: pointer;
        border-radius: 4px;
        font-size: 13px;
        color: #333;

        &:hover {
          background: #f5f7fa;
        }

        input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #1ba39b;
        }
      }
    }
  }
}

// ───── 手錶紀錄詳情彈窗樣式 ─────
.watchDetailOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;

  .watchDetailModal {
    width: 460px;
    max-width: 92vw;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: 20px;
    border: 3px solid var(--Primary-default, #1ba39b);
    background: var(--neutral-white-opacity-30, rgba(255, 255, 255, 0.95));
    box-shadow: 0px 2px 20px 0px rgba(27, 163, 155, 0.25);
    backdrop-filter: blur(25px);
    padding: 1.5rem;
    position: relative;

    &::-webkit-scrollbar {
      width: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #c0c0c0;
      border-radius: 10px;
    }
  }
}

.watchDetailHeader {
  text-align: center;
  margin-bottom: 1.25rem;

  .npLogo {
    width: 2rem;
    height: 2rem;
    border-radius: 9.8px;
    border: 1px solid var(--Primary-default, #1ba39b);
    padding: 2px 4px;
    margin-bottom: 0.5rem;
  }

  .watchDetailDate {
    color: $primary-600;
    font-size: 18px;
    font-weight: 700;
    margin: 0;
  }

  .watchDetailSub {
    color: #1ba39b;
    font-size: 13px;
    margin: 0.15rem 0 0;
  }
}

.watchMetricCards {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1.25rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 0.75rem;

  .watchMetricCard {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 70px;
    flex: 1;
    padding: 0.4rem 0.25rem;
    border-right: 1px solid #f0f0f0;

    &:last-child {
      border-right: none;
    }

    .metricLabel {
      font-size: 11px;
      color: #999;
      margin-bottom: 0.15rem;
    }

    .metricValue {
      font-size: 18px;
      font-weight: 700;
      color: #333;
      line-height: 1.2;
    }

    .metricUnit {
      font-size: 11px;
      color: #aaa;
    }
  }
}

.watchSleepSection {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  padding: 1rem;
  margin-bottom: 1rem;

  h4 {
    font-size: 16px;
    font-weight: 700;
    color: #333;
    margin: 0 0 0.75rem;
  }

  .watchSleepGrid {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    .watchSleepRow {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.35rem 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .sleepLabel {
        color: #1ba39b;
        font-size: 14px;
      }

      .sleepValue {
        color: #333;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

.watchBodySection {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  padding: 1rem;
  margin-bottom: 1rem;

  h4 {
    font-size: 16px;
    font-weight: 700;
    color: #333;
    margin: 0 0 0.75rem;
  }

  .watchBodyGrid {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    .watchBodyRow {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.35rem 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .bodyLabel {
        color: #1ba39b;
        font-size: 14px;
      }

      .bodyValue {
        color: #333;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

.watchDetailFooter {
  text-align: center;
  margin-top: 0.5rem;

  .watchDetailClose {
    border-radius: 50px;
    background: #fff;
    box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
    padding: 0.25rem;
    cursor: pointer;
    display: inline-block;
    transition: all 0.2s;

    &:hover {
      box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
    }

    img {
      width: 20px;
      height: 20px;
      display: block;
    }
  }
}
</style>
