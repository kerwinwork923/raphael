<template>
  <div class="resultWrap">
    <div class="resultTopGroup">
      <div class="resultInfo">
        <div class="resultHintText">
          {{
            store.diffDays >= 1 ? diffDays + "天" : store.diffDays
          }}後再進行檢測
        </div>
        <h5 class="subText">
          (本次){{ formatTimestamp(store.theLatestHistory.CheckTime) }}
        </h5>

        <div class="severity">
          <div class="imgGroup">
            <img :src="computedEmoji2(store.theLatestData.TotalScore)" alt="" />

            <div class="scoreText">
              <div
                class="score"
                :style="{
                  color: scoreColorFn(store.theLatestData.TotalScore, sex),
                }"
              >
                {{ store.theLatestData.TotalScore }}
              </div>
              <h5>分</h5>
            </div>
          </div>

          <ProgressBar
            :score="store.theLatestData.TotalScore"
            :colorProp="scoreColorFn(store.theLatestData.TotalScore, sex)"
          />

          <h6 class="severityText">
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(store.theLatestData.TotalScore, sex),
              }"
            >
              {{ store.theLatestData.TotalRatio }}({{
                store.theLatestData.TotalDesc
              }})</span
            >
          </h6>
        </div>
        <h5 class="subText nextSunText">
          (前次){{ formatTimestamp(store.theLatestHistoryPre.CheckTime) }}
        </h5>
        <div class="severity" v-if="store.theLatestDataPreData.TotalScore">
          <div class="imgGroup">
            <img
              :src="computedEmoji2(store.theLatestDataPreData.TotalScore)"
              alt=""
            />
            <div class="scoreText">
              <div
                class="score"
                :style="{
                  color: scoreColorFn(
                    store.theLatestDataPreData.TotalScore,
                    sex
                  ),
                }"
              >
                {{ store.theLatestDataPreData?.TotalScore }}
              </div>
              <h5>分</h5>
            </div>
          </div>
          <ProgressBar
            :score="store.theLatestDataPreData.TotalScore"
            :colorProp="
              scoreColorFn(store.theLatestDataPreData.TotalScore, sex)
            "
          />
          <h6 class="severityText">
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(store.theLatestDataPreData.TotalScore, sex),
              }"
            >
              {{ store.theLatestDataPreData.TotalRatio }}({{
                store.theLatestDataPreData.TotalDesc
              }})</span
            >
          </h6>
        </div>
      </div>
      <img class="doctorImg" src="../assets/imgs/doctor.png" alt="" />
    </div>

    <h4 class="textResultText">以下為分類系統的自律神經分析結果</h4>
    <div class="resultListGroup">
      <div class="resultList">
        <div class="titleGroup">
          <h3>{{ store.diffenenceObj.C1Symptom }}</h3>

          <div class="pGroup" v-if="store.diffenenceObj.preCheckTime != ''">
            <p
              v-if="
                Number(store.diffenenceObj.C1Difference?.replace('%', '')) > 0
              "
              class="upIcon"
            >
              ▲
            </p>
            <p
              v-if="
                Number(store.diffenenceObj.C1Difference?.replace('%', '')) < 0
              "
              class="downIcon"
            >
              ▼
            </p>
            <div
              class="titleScoreUp"
              v-if="
                Number(store.diffenenceObj.C1Difference?.replace('%', '')) > 0
              "
            >
              {{ store.diffenenceObj.C1Difference }}
            </div>
            <div
              class="titleScoreDown"
              v-if="
                Number(store.diffenenceObj.C1Difference?.replace('%', '')) < 0
              "
            >
              {{ store.diffenenceObj.C1Difference }}
            </div>
          </div>
        </div>
        <div class="resultTagGroup">
          <div
            class="resultTag"
            v-for="item in store.diffenenceObj.C1Solve"
            :key="item"
          >
            {{ item }}
          </div>
        </div>

        <h5>(本次){{ formatTimestamp(store.theLatestHistory.CheckTime) }}</h5>
        <ProgressBar2
          :score="computedScore(store.theLatestData.C1Ratio)"
          :emojiSrc="computedEmoji2(computedScore(store.theLatestData.C1Ratio))"
        />
        <h4>
          嚴重程度 :
          <span
            :style="{
              color: scoreColorFn(
                computedScore(store.theLatestData.C1Ratio),
                sex
              ),
            }"
            >{{ store.theLatestData.C1Ratio }}({{
              store.theLatestData.C1Desc
            }})</span
          >
        </h4>
        <div class="nextGroup" v-if="store.theLatestHistoryPre.CheckTime">
          <h5>
            (前次){{ formatTimestamp(store.theLatestHistoryPre.CheckTime) }}
          </h5>
          <ProgressBar2
            :score="computedScore(store.theLatestDataPreData.C1Ratio)"
            :emojiSrc="
              computedEmoji2(computedScore(store.theLatestDataPreData.C1Ratio))
            "
          />
          <h4>
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(
                  computedScore(store.theLatestDataPreData.C1Ratio),
                  sex
                ),
              }"
              >{{ store.theLatestDataPreData.C1Ratio }}({{
                store.theLatestDataPreData.C1Desc
              }})</span
            >
          </h4>
        </div>
      </div>

      <div class="resultList">
        <div class="titleGroup">
          <h3>{{ store.diffenenceObj.C2Symptom }}</h3>

          <div class="pGroup" v-if="store.diffenenceObj.preCheckTime != ''">
            <p
              v-if="
                Number(store.diffenenceObj.C2Difference?.replace('%', '')) > 0
              "
              class="upIcon"
            >
              ▲
            </p>
            <p
              v-if="
                Number(store.diffenenceObj.C2Difference?.replace('%', '')) < 0
              "
              class="downIcon"
            >
              ▼
            </p>
            <div
              class="titleScoreUp"
              v-if="
                Number(store.diffenenceObj.C2Difference?.replace('%', '')) > 0
              "
            >
              {{ store.diffenenceObj.C2Difference }}
            </div>
            <div
              class="titleScoreDown"
              v-if="
                Number(store.diffenenceObj.C2Difference?.replace('%', '')) < 0
              "
            >
              {{ store.diffenenceObj.C2Difference }}
            </div>
          </div>
        </div>
        <div class="resultTagGroup">
          <div
            class="resultTag"
            v-for="item in store.diffenenceObj.C2Solve"
            :key="item"
          >
            {{ item }}
          </div>
        </div>
        <h5>(本次){{ formatTimestamp(store.theLatestHistory.CheckTime) }}</h5>
        <ProgressBar2
          :score="computedScore(store.theLatestData.C2Ratio)"
          :emojiSrc="computedEmoji2(computedScore(store.theLatestData.C2Ratio))"
        />
        <h4>
          嚴重程度 :
          <span
            :style="{
              color: scoreColorFn(
                computedScore(store.theLatestData.C2Ratio),
                sex
              ),
            }"
            >{{ store.theLatestData.C2Ratio }}({{
              store.theLatestData.C2Desc
            }})</span
          >
        </h4>
        <div class="nextGroup" v-if="store.theLatestHistoryPre.CheckTime">
          <h5>
            (前次){{ formatTimestamp(store.theLatestHistoryPre.CheckTime) }}
          </h5>
          <ProgressBar2
            :score="computedScore(store.theLatestDataPreData.C2Ratio)"
            :emojiSrc="
              computedEmoji2(computedScore(store.theLatestDataPreData.C2Ratio))
            "
          />
          <h4>
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(
                  computedScore(store.theLatestDataPreData.C2Ratio),
                  sex
                ),
              }"
              >{{ store.theLatestDataPreData.C2Ratio }}({{
                store.theLatestDataPreData.C2Desc
              }})</span
            >
          </h4>
        </div>
      </div>

      <div class="resultList">
        <div class="titleGroup">
          <h3>{{ store.diffenenceObj.C3Symptom }}</h3>

          <div class="pGroup" v-if="store.diffenenceObj.preCheckTime != ''">
            <p
              v-if="
                Number(store.diffenenceObj.C3Difference?.replace('%', '')) > 0
              "
              class="upIcon"
            >
              ▲
            </p>
            <p
              v-if="
                Number(store.diffenenceObj.C3Difference?.replace('%', '')) < 0
              "
              class="downIcon"
            >
              ▼
            </p>
            <div
              class="titleScoreUp"
              v-if="
                Number(store.diffenenceObj.C3Difference?.replace('%', '')) > 0
              "
            >
              {{ store.diffenenceObj.C3Difference }}
            </div>
            <div
              class="titleScoreDown"
              v-if="
                Number(store.diffenenceObj.C3Difference?.replace('%', '')) < 0
              "
            >
              {{ store.diffenenceObj.C3Difference }}
            </div>
          </div>
        </div>
        <div class="resultTagGroup">
          <div
            class="resultTag"
            v-for="item in store.diffenenceObj.C3Solve"
            :key="item"
          >
            {{ item }}
          </div>
        </div>
        <h5>(本次){{ formatTimestamp(store.theLatestHistory.CheckTime) }}</h5>
        <ProgressBar2
          :score="computedScore(store.theLatestData.C3Ratio)"
          :emojiSrc="computedEmoji2(computedScore(store.theLatestData.C3Ratio))"
        />
        <h4>
          嚴重程度 :
          <span
            :style="{
              color: scoreColorFn(
                computedScore(store.theLatestData.C3Ratio),
                sex
              ),
            }"
            >{{ store.theLatestData.C3Ratio }}({{
              store.theLatestData.C3Desc
            }})</span
          >
        </h4>
        <div class="nextGroup" v-if="store.theLatestHistoryPre.CheckTime">
          <h5>
            (前次){{ formatTimestamp(store.theLatestHistoryPre.CheckTime) }}
          </h5>
          <ProgressBar2
            :score="computedScore(store.theLatestDataPreData.C3Ratio)"
            :emojiSrc="
              computedEmoji2(computedScore(store.theLatestDataPreData.C3Ratio))
            "
          />
          <h4>
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(
                  computedScore(store.theLatestDataPreData.C3Ratio),
                  sex
                ),
              }"
              >{{ store.theLatestDataPreData.C3Ratio }}({{
                store.theLatestDataPreData.C3Desc
              }})</span
            >
          </h4>
        </div>
      </div>

      <div class="resultList">
        <div class="titleGroup">
          <h3>{{ store.diffenenceObj.C4Symptom }}</h3>

          <div class="pGroup" v-if="store.diffenenceObj.preCheckTime != ''">
            <p
              v-if="
                Number(store.diffenenceObj.C4Difference?.replace('%', '')) > 0
              "
              class="upIcon"
            >
              ▲
            </p>
            <p
              v-if="
                Number(store.diffenenceObj.C4Difference?.replace('%', '')) < 0
              "
              class="downIcon"
            >
              ▼
            </p>
            <div
              class="titleScoreUp"
              v-if="
                Number(store.diffenenceObj.C4Difference?.replace('%', '')) > 0
              "
            >
              {{ store.diffenenceObj.C4Difference }}
            </div>
            <div
              class="titleScoreDown"
              v-if="
                Number(store.diffenenceObj.C4Difference?.replace('%', '')) < 0
              "
            >
              {{ store.diffenenceObj.C4Difference }}
            </div>
          </div>
        </div>
        <div class="resultTagGroup">
          <div
            class="resultTag"
            v-for="item in store.diffenenceObj.C4Solve"
            :key="item"
          >
            {{ item }}
          </div>
        </div>
        <h5>(本次){{ formatTimestamp(store.theLatestHistory.CheckTime) }}</h5>
        <ProgressBar2
          :score="computedScore(store.theLatestData.C4Ratio)"
          :emojiSrc="computedEmoji2(computedScore(store.theLatestData.C4Ratio))"
        />
        <h4>
          嚴重程度 :
          <span
            :style="{
              color: scoreColorFn(
                computedScore(store.theLatestData.C4Ratio),
                sex
              ),
            }"
            >{{ store.theLatestData.C4Ratio
            }}{{ store.theLatestData.C4Desc }}</span
          >
        </h4>
        <div class="nextGroup" v-if="store.theLatestHistoryPre.CheckTime">
          <h5>
            (前次){{ formatTimestamp(store.theLatestHistoryPre.CheckTime) }}
          </h5>
          <ProgressBar2
            :score="computedScore(store.theLatestDataPreData.C4Ratio)"
            :emojiSrc="
              computedEmoji2(computedScore(store.theLatestDataPreData.C4Ratio))
            "
          />
          <h4>
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(
                  computedScore(store.theLatestDataPreData.C4Ratio),
                  sex
                ),
              }"
              >{{ store.theLatestDataPreData.C4Ratio }}({{
                store.theLatestDataPreData.C4Desc
              }})</span
            >
          </h4>
        </div>
      </div>

      <div class="resultList">
        <div class="titleGroup">
          <h3>{{ store.diffenenceObj.C5Symptom }}</h3>

          <div class="pGroup" v-if="store.diffenenceObj.preCheckTime != ''">
            <p
              v-if="
                Number(store.diffenenceObj.C5Difference?.replace('%', '')) > 0
              "
              class="upIcon"
            >
              ▲
            </p>
            <p
              v-if="
                Number(store.diffenenceObj.C5Difference?.replace('%', '')) < 0
              "
              class="downIcon"
            >
              ▼
            </p>
            <div
              class="titleScoreUp"
              v-if="
                Number(store.diffenenceObj.C5Difference?.replace('%', '')) > 0
              "
            >
              {{ store.diffenenceObj.C5Difference }}
            </div>
            <div
              class="titleScoreDown"
              v-if="
                Number(store.diffenenceObj.C5Difference?.replace('%', '')) < 0
              "
            >
              {{ store.diffenenceObj.C5Difference }}
            </div>
          </div>
        </div>
        <div class="resultTagGroup">
          <div
            class="resultTag"
            v-for="item in store.diffenenceObj.C5Solve"
            :key="item"
          >
            {{ item }}
          </div>
        </div>
        <h5>(本次){{ formatTimestamp(store.theLatestHistory.CheckTime) }}</h5>
        <ProgressBar2
          :score="computedScore(store.theLatestData.C5Ratio)"
          :emojiSrc="computedEmoji2(computedScore(store.theLatestData.C5Ratio))"
        />
        <h4>
          嚴重程度 :
          <span
            :style="{
              color: scoreColorFn(
                computedScore(store.theLatestData.C5Ratio),
                sex
              ),
            }"
            >{{ store.theLatestData.C5Ratio }}({{
              store.theLatestData.C5Desc
            }})</span
          >
        </h4>
        <div class="nextGroup" v-if="store.theLatestHistoryPre.CheckTime">
          <h5>
            (前次){{ formatTimestamp(store.theLatestHistoryPre.CheckTime) }}
          </h5>
          <ProgressBar2
            :score="computedScore(store.theLatestDataPreData.C5Ratio)"
            :emojiSrc="
              computedEmoji2(computedScore(store.theLatestDataPreData.C5Ratio))
            "
          />
          <h4>
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(
                  computedScore(store.theLatestDataPreData.C5Ratio),
                  sex
                ),
              }"
              >{{ store.theLatestDataPreData.C5Ratio }}({{
                store.theLatestDataPreData.C5Desc
              }})</span
            >
          </h4>
        </div>
      </div>

      <div class="resultList">
        <div class="titleGroup">
          <h3>{{ store.diffenenceObj.C6Symptom }}</h3>

          <div class="pGroup" v-if="store.diffenenceObj.preCheckTime != ''">
            <p
              v-if="
                Number(store.diffenenceObj.C6Difference?.replace('%', '')) > 0
              "
              class="upIcon"
            >
              ▲
            </p>
            <p
              v-if="
                Number(store.diffenenceObj.C6Difference?.replace('%', '')) < 0
              "
              class="downIcon"
            >
              ▼
            </p>
            <div
              class="titleScoreUp"
              v-if="
                Number(store.diffenenceObj.C6Difference?.replace('%', '')) > 0
              "
            >
              {{ store.diffenenceObj.C6Difference }}
            </div>
            <div
              class="titleScoreDown"
              v-if="
                Number(store.diffenenceObj.C6Difference?.replace('%', '')) < 0
              "
            >
              {{ store.diffenenceObj.C6Difference }}
            </div>
          </div>
        </div>
        <div class="resultTagGroup">
          <div
            class="resultTag"
            v-for="item in store.diffenenceObj.C6Solve"
            :key="item"
          >
            {{ item }}
          </div>
        </div>
        <h5>(本次){{ formatTimestamp(store.theLatestHistory.CheckTime) }}</h5>
        <ProgressBar2
          :score="computedScore(store.theLatestData.C6Ratio)"
          :emojiSrc="computedEmoji2(computedScore(store.theLatestData.C6Ratio))"
        />
        <h4>
          嚴重程度 :
          <span
            :style="{
              color: scoreColorFn(
                computedScore(store.theLatestData.C6Ratio),
                sex
              ),
            }"
            >{{ store.theLatestData.C6Ratio }}({{
              store.theLatestData.C6Desc
            }})</span
          >
        </h4>
        <div class="nextGroup" v-if="store.theLatestHistoryPre.CheckTime">
          <h5>
            (前次){{ formatTimestamp(store.theLatestHistoryPre.CheckTime) }}
          </h5>
          <ProgressBar2
            :score="computedScore(store.theLatestDataPreData.C6Ratio)"
            :emojiSrc="
              computedEmoji2(computedScore(store.theLatestDataPreData.C6Ratio))
            "
          />
          <h4>
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(
                  computedScore(store.theLatestDataPreData.C6Ratio),
                  sex
                ),
              }"
              >{{ store.theLatestDataPreData.C6Ratio }}({{
                store.theLatestDataPreData.C6Desc
              }})</span
            >
          </h4>
        </div>
      </div>

      <div class="resultList">
        <div class="titleGroup">
          <h3>{{ store.diffenenceObj.C7Symptom }}</h3>

          <div class="pGroup" v-if="store.diffenenceObj.preCheckTime != ''">
            <p
              v-if="
                Number(store.diffenenceObj.C7Difference?.replace('%', '')) > 0
              "
              class="upIcon"
            >
              ▲
            </p>
            <p
              v-if="
                Number(store.diffenenceObj.C7Difference?.replace('%', '')) < 0
              "
              class="downIcon"
            >
              ▼
            </p>
            <div
              class="titleScoreUp"
              v-if="
                Number(store.diffenenceObj.C7Difference?.replace('%', '')) > 0
              "
            >
              {{ store.diffenenceObj.C7Difference }}
            </div>
            <div
              class="titleScoreDown"
              v-if="
                Number(store.diffenenceObj.C7Difference?.replace('%', '')) < 0
              "
            >
              {{ store.diffenenceObj.C7Difference }}
            </div>
          </div>
        </div>
        <div class="resultTagGroup">
          <div
            class="resultTag"
            v-for="item in store.diffenenceObj.C7Solve"
            :key="item"
          >
            {{ item }}
          </div>
        </div>
        <h5>(本次){{ formatTimestamp(store.theLatestHistory.CheckTime) }}</h5>
        <ProgressBar2
          :score="computedScore(store.theLatestData.C7Ratio)"
          :emojiSrc="computedEmoji2(computedScore(store.theLatestData.C7Ratio))"
        />
        <h4>
          嚴重程度 :
          <span
            :style="{
              color: scoreColorFn(
                computedScore(store.theLatestData.C7Ratio),
                sex
              ),
            }"
            >{{ store.theLatestData.C7Ratio }}({{
              store.theLatestData.C7Desc
            }})</span
          >
        </h4>
        <div class="nextGroup" v-if="store.theLatestHistoryPre.CheckTime">
          <h5>
            (前次){{ formatTimestamp(store.theLatestHistoryPre.CheckTime) }}
          </h5>
          <ProgressBar2
            :score="computedScore(store.theLatestDataPreData.C7Ratio)"
            :emojiSrc="
              computedEmoji2(computedScore(store.theLatestDataPreData.C7Ratio))
            "
          />
          <h4>
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(
                  computedScore(store.theLatestDataPreData.C7Ratio),
                  sex
                ),
              }"
              >{{ store.theLatestDataPreData.C7Ratio }}({{
                store.theLatestDataPreData.C7Desc
              }})</span
            >
          </h4>
        </div>
      </div>

      <div class="resultList">
        <div class="titleGroup">
          <h3>{{ store.diffenenceObj.C8Symptom }}</h3>

          <div class="pGroup" v-if="store.diffenenceObj.preCheckTime != ''">
            <p
              v-if="
                Number(store.diffenenceObj.C8Difference?.replace('%', '')) > 0
              "
              class="upIcon"
            >
              ▲
            </p>
            <p
              v-if="
                Number(store.diffenenceObj.C8Difference?.replace('%', '')) < 0
              "
              class="downIcon"
            >
              ▼
            </p>
            <div
              class="titleScoreUp"
              v-if="
                Number(store.diffenenceObj.C8Difference?.replace('%', '')) > 0
              "
            >
              {{ store.diffenenceObj.C8Difference }}
            </div>
            <div
              class="titleScoreDown"
              v-if="
                Number(store.diffenenceObj.C8Difference?.replace('%', '')) < 0
              "
            >
              {{ store.diffenenceObj.C8Difference }}
            </div>
          </div>
        </div>
        <div class="resultTagGroup">
          <div
            class="resultTag"
            v-for="item in store.diffenenceObj.C8Solve"
            :key="item"
          >
            {{ item }}
          </div>
        </div>
        <h5>(本次){{ formatTimestamp(store.theLatestHistory.CheckTime) }}</h5>
        <ProgressBar2
          :score="computedScore(store.theLatestData.C8Ratio)"
          :emojiSrc="computedEmoji2(computedScore(store.theLatestData.C8Ratio))"
        />
        <h4>
          嚴重程度 :
          <span
            :style="{
              color: scoreColorFn(
                computedScore(store.theLatestData.C8Ratio),
                sex
              ),
            }"
            >{{ store.theLatestData.C8Ratio }}({{
              store.theLatestData.C8Desc
            }})</span
          >
        </h4>
        <div class="nextGroup" v-if="store.theLatestHistoryPre.CheckTime">
          <h5>
            (前次){{ formatTimestamp(store.theLatestHistoryPre.CheckTime) }}
          </h5>
          <ProgressBar2
            :score="computedScore(store.theLatestDataPreData.C8Ratio)"
            :emojiSrc="
              computedEmoji2(computedScore(store.theLatestDataPreData.C8Ratio))
            "
          />
          <h4>
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(
                  computedScore(store.theLatestDataPreData.C8Ratio),
                  sex
                ),
              }"
              >{{ store.theLatestDataPreData.C8Ratio }}({{
                store.theLatestDataPreData.C8Desc
              }})</span
            >
          </h4>
        </div>
      </div>

      <div class="resultList">
        <div class="titleGroup">
          <h3>{{ store.diffenenceObj.C9Symptom }}</h3>
          <div class="pGroup" v-if="store.diffenenceObj.preCheckTime != ''">
            <p
              v-if="
                Number(store.diffenenceObj.C9Difference?.replace('%', '')) > 0
              "
              class="upIcon"
            >
              ▲
            </p>
            <p
              v-if="
                Number(store.diffenenceObj.C9Difference?.replace('%', '')) < 0
              "
              class="downIcon"
            >
              ▼
            </p>
            <div
              class="titleScoreUp"
              v-if="
                Number(store.diffenenceObj.C9Difference?.replace('%', '')) > 0
              "
            >
              {{ store.diffenenceObj.C9Difference }}
            </div>
            <div
              class="titleScoreDown"
              v-if="
                Number(store.diffenenceObj.C9Difference?.replace('%', '')) < 0
              "
            >
              {{ store.diffenenceObj.C9Difference }}
            </div>
          </div>
        </div>
        <div class="resultTagGroup">
          <div
            class="resultTag"
            v-for="item in store.diffenenceObj.C9Solve"
            :key="item"
          >
            {{ item }}
          </div>
        </div>
        <h5>(本次){{ formatTimestamp(store.theLatestHistory.CheckTime) }}</h5>
        <ProgressBar2
          :score="computedScore(store.theLatestData.C9Ratio)"
          :emojiSrc="computedEmoji2(computedScore(store.theLatestData.C9Ratio))"
        />
        <h4>
          嚴重程度 :
          <span
            :style="{
              color: scoreColorFn(
                computedScore(store.theLatestData.C9Ratio),
                sex
              ),
            }"
            >{{ store.theLatestData.C9Ratio }}({{
              store.theLatestData.C9Desc
            }})</span
          >
        </h4>
        <div class="nextGroup" v-if="store.theLatestHistoryPre.CheckTime">
          <h5>
            (前次){{ formatTimestamp(store.theLatestHistoryPre.CheckTime) }}
          </h5>
          <ProgressBar2
            :score="computedScore(store.theLatestDataPreData.C9Ratio)"
            :emojiSrc="
              computedEmoji2(computedScore(store.theLatestDataPreData.C9Ratio))
            "
          />
          <h4>
            嚴重程度 :
            <span
              :style="{
                color: scoreColorFn(
                  computedScore(store.theLatestDataPreData.C9Ratio),
                  sex
                ),
              }"
              >{{ store.theLatestDataPreData.C9Ratio }}({{
                store.theLatestDataPreData.C9Desc
              }})</span
            >
          </h4>
        </div>
      </div>
    </div>
    <h4 class="textResultText">您最近常出現的症狀依困擾程度排序</h4>

    <div class="symptomWrap">
      <div class="symptomGroup">
        <div class="symptomButtonGroup">
          <button
            class="symptomBtn"
            :class="{ symptomBtnActive: selectedType === 'Serious' }"
            @click="changeSymptomLavel('Serious')"
          >
            嚴重
          </button>
          <button
            class="symptomBtn"
            :class="{ symptomBtnActive: selectedType === 'Middle' }"
            @click="changeSymptomLavel('Middle')"
          >
            中等
          </button>
          <button
            class="symptomBtn"
            :class="{ symptomBtnActive: selectedType === 'Light' }"
            @click="changeSymptomLavel('Light')"
          >
            輕微
          </button>
        </div>
        <div
          class="symptomMenuList symptomSeriousList"
          v-if="selectedType == 'Serious'"
        >
          <div
            class="symptomList"
            v-for="(item, index) in store.theLatestData.Serious"
            :key="index"
          >
            {{ item }}
          </div>
        </div>

        <div
          class="symptomMenuList symptomMeddleList"
          v-if="selectedType == 'Middle'"
        >
          <div
            class="symptomList"
            v-for="(item, index) in store.theLatestData.Middle"
            :key="index"
          >
            {{ item }}
          </div>
        </div>

        <div
          class="symptomMenuList symptomLightList"
          v-if="selectedType == 'Light'"
        >
          <div
            class="symptomList"
            v-for="(item, index) in store.theLatestData.Light"
            :key="index"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>

    <h4 class="textResultText">檢測紀錄</h4>
    <div class="detectionWrap">
      <div
        class="detection"
        v-for="(history, index) in store.History"
        :key="index"
      >
        <div class="cGroup">
          <img class="img" src="../assets/imgs/calendar.png" alt="" />
        </div>
        <h3 class="detectionDate">
          {{ formatTimestamp2(history?.CheckTime) }}
        </h3>
        <div class="detectionGroup">
          <div class="scroeTotal">
            <h5>總分</h5>
            <div
              :style="{
                color: scoreColorFn(computedScore(history?.Score), sex),
              }"
              class="totalScore"
            >
              {{ history?.Score }}
            </div>
          </div>
          <div class="seriousDegreeGroup">
            <h5>嚴重程度</h5>
            <div
              :style="{
                color: scoreColorFn(computedScore(history?.Score), sex),
              }"
              class="seriousScore"
            >
              {{ history.Ratio }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="backToUserBtnGroupWeekly">
      <button class="backToUserBtnWeekly" @click="backToUser()">
        返回會員中心
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import ProgressBar from "./ProgressBar.vue";
import ProgressBar2 from "./ProgressBar2.vue";
import {
  scoreColorFn,
  computedEmoji2,
  formatTimestamp,
  formatTimestamp2,
  computedText,
} from "../fn/utils";
import { useWeeklyRecord } from "../stores/weeklyQA";

import { useRouter } from "vue-router";
import axios from "axios";

export default {
  components: {
    ProgressBar,
    ProgressBar2,
  },
  setup() {
    const store = useWeeklyRecord();
    const router = useRouter();
    const backToUser = () => {
      router.push({ name: "user" });
    };

    const localData = localStorage.getItem("userData");
    const parsedData = localData ? JSON.parse(localData) : null;
    const sex = ref(parsedData?.Sex || null);

    const selectedType = ref("Serious");

    const changeSymptomLavel = (lavel) => {
      selectedType.value = lavel;
    };

    const computedScore = (scoreStr) => {
      const numericScore = parseFloat(scoreStr.replace("%", ""));
      return isNaN(numericScore) ? 0 : numericScore;
    };

    return {
      scoreColorFn,
      computedEmoji2,
      store,
      formatTimestamp,
      backToUser,
      computedScore,
      selectedType,
      changeSymptomLavel,
      computedText,
      sex,
      formatTimestamp2,
    };
  },
};
</script>

<style lang="scss">
.resultWrap {
  .resultTopGroup {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: calc(100% - 120px) max-content;
    margin-top: 0.5rem;
    overflow: hidden;

    .resultInfo {
      background-color: #fff;
      padding: 12px;
      border-radius: 12px;
      box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.25) inset;

      .subText {
        margin-bottom: 0.75rem;
      }

      .nextSunText{
        margin-top:.75rem;
      }

      .resultHintText {
        color: $raphael-green-400;
        font-weight: 400;
        font-size: 16px;
        letter-spacing: 0.048px;
        margin-bottom: 0.75rem;
      }

      .severityText {
        color:$raphael-gray-500;
        letter-spacing: 0.048px;
        span {
          color: #ec4f4f;
        }
      }
      .dashDiv {
        margin-top: 0.5rem;
      }
    }
    .pGroup {
      display: flex;
      align-items: center;
    }

    .imgGroup {
      display: flex;
      align-items: center;
      gap: 4px;

      img {
        width: 2.25rem;
        height: 2.25rem;
      }

      .scoreText {
        color: $raphael-red-300;
        font-weight: bold;
        letter-spacing: 0.09px;
        display: flex;
        align-items: center;
        gap: 4px;

        .score {
          font-size: 2.25rem;
        }

        h5 {
          color: #ccc;
          font-size: 14px;
        }
      }
    }
  }
  .textResultText {
    color: #666;
    margin-top: 1rem;
  }
  .resultListGroup {
    .resultList {
      background-color: #fff;
      padding: 12px;
      border-radius: 12px;
      margin-top: 0.75rem;
      .nextGroup {
        margin-top: 0.75rem;
      }
      .titleGroup {
        display: flex;
        align-items: center;
        gap: 2px;
        .pGroup {
          display: flex;
          align-items: center;
        }
        .upIcon {
          color: #ec4f4f;
          font-size: 10px;
        }
        .downIcon {
          color: $raphael-green-400;
          font-size: 10px;
        }
        .titleScoreDown {
          color: $raphael-green-400;
          font-size: 12px;
        }
        .titleScoreUp {
          color: #ec4f4f;
          font-size: 12px;
        }
      }
      h3 {
        color: #1e1e1e;
        font-size: 20px;
        letter-spacing: 0.15px;
        margin-bottom: 0.5rem;
      }
      .resultTagGroup {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .resultTag {
          background: #fef1e2;
          padding: 4px 8px;
          border-radius: 12px;
          color: #666;
          font-size: 0.875rem;
        }
      }

      h5 {
        color: #1e1e1e;
        letter-spacing: 0.1px;
        margin-top: 0.75rem;
      }
      h4 {
        color: #666;
        span {
          color: #ec4f4f;
        }
      }
    }
  }

  .symptomGroup {
    background-color: #fff;
    border-radius: 12px;
    margin-top: 0.75rem;
    padding: 12px 16px;
    .symptomButtonGroup {
      display: flex;
      justify-content: space-between;
      gap: 3.5%;

      button {
        background-color: #f6f6f6;
        color: #666;
        font-size: 1rem;
        width: 32.5%;
        border: none;
        transition: 0.5s all ease;
        border-radius: 12px;
        padding: 6px 12px;

        &:hover {
          background-color: $raphael-green-400;
          color: #fff;
        }
      }
      .symptomBtnActive {
        background-color: $raphael-green-400;
        color: #fff;
      }
    }
    .symptomMenuList {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-gap: 0.5rem;
      margin-top: 0.25rem;
      @include fade-in;
      &:nth-child(1) {
        animation-delay: 0.1s;
      }
      .symptomList {
        display: flex;
        align-items: center;

        margin-top: 0.5rem;
      }
    }

    .symptomSeriousList {
      .symptomList {
        &::before {
          content: "";
          width: 4px;
          height: 100%;
          margin-right: 4px;
          display: inline-block;
          background: #bc581f;
          border-radius: 4px;
        }
      }
    }

    .symptomMeddleList {
      .symptomList {
        &::before {
          content: "";
          width: 4px;
          height: 100%;
          margin-right: 4px;
          display: inline-block;
          background: #65558f;
          border-radius: 4px;
        }
      }
    }

    .symptomLightList {
      .symptomList {
        &::before {
          content: "";
          width: 4px;
          height: 100%;
          margin-right: 4px;
          display: inline-block;
          background: #1fbcb3;
          border-radius: 4px;
        }
      }
    }
  }
  .detectionWrap {
    background-color: #fff;
    border-radius: 12px;
    padding: 0 16px;
    margin-top: 0.85rem;
    max-height: 400px;
    overflow-y: auto; /* 超出高度時顯示滾動條 */
    .detection {
      display: flex;
      align-items: center;
      gap: 4px;

      height: 80px;
      .cGroup {
        border: 2px solid $raphael-green-400;
        padding: 0.25rem;
        border-radius: 7px;
        img {
          width: 1rem;
          height: 1rem;
        }
      }

      .detectionGroup {
        margin-left: auto;
        display: flex;
        justify-content: center;
        align-items: center;

        gap: 14px;

        .scroeTotal,
        .seriousDegreeGroup {
          display: flex;
          flex-direction: column;
          align-items: baseline;
          justify-content: center;
          gap: 8px;
          h5 {
            color: #666;
            font-size: 16px;
            letter-spacing: 0.1px;
            font-weight: 400;
          }
          .totalScore,
          .seriousScore {
            color: #1e1e1e;
            font-size: 24px;
            font-weight: bold;
          }
        }
      }
    }
    .detectionDate {
      font-size: 20px;
      color: #1e1e1e;
      letter-spacing: 0.15px;
    }
  }
}

.doctorImg {
  width: 100%;
}

.backToUserBtnGroupWeekly {
  margin-top: 1.25rem;
  width: 100%;
}
.backToUserBtnWeekly {
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
}
</style>
