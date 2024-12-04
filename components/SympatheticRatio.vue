<template>
  <div class="boxGroup">
    <!-- <div class="titleGroup">
      <h3>交感/副交感比例</h3>
    </div> -->
    <div class="boxText">
      <div class="text-container-PLF">
        <h4>交感神經</h4>
        <div class="value">{{ sympathetic }}%</div>
      </div>
      <div class="text-container-PHF">
        <h4>副交感神經</h4>
        <div class="value">{{ parasympathetic }}%</div>
      </div>
    </div>
    <div class="box">
      <div
        class="circle-PLF"
        :style="{ width: `${PLFBoxSize}px`, height: `${PLFBoxSize}px` }"
      ></div>
      <div
        class="circle-PHF"
        :style="{ width: `${PHFBoxSize}px`, height: `${PHFBoxSize}px` }"
      ></div>
    </div>
  </div>
  <svg style="display: none">
    <defs>
      <filter id="blob">
        <feGaussianBlur
          in="SourceGraphic"
          stdDeviation="10"
          result="blur"
        ></feGaussianBlur>
        <feColorMatrix
          in="blur"
          mode="matrix"
          values="
                     1 0 0 0 0
                     0 1 0 0 0
                     0 0 1 0 0
                     0 0 0 20 -10"
        ></feColorMatrix>
      </filter>
    </defs>
  </svg>
</template>

<script>
export default {
  name: "SympatheticRatio",
  props: {
    sympathetic: {
      type: Number,
      required: true,
      validator: (value) => value >= 0 && value <= 100,
    },
    parasympathetic: {
      type: Number,
      required: true,
      validator: (value) => value >= 0 && value <= 100,
    },
  },
  computed: {
    boxSize() {
      return 100; // 基础大小
    },
    PLFBoxSize() {
      return this.boxSize + Math.round(this.sympathetic);
    },
    PHFBoxSize() {
      return this.boxSize + Math.round(this.parasympathetic);
    },
  },
};
</script>

<style scoped lang="scss">
.boxGroup {
  display: grid;
  place-items: center;
  gap: 0.75rem;
//   background-color: #fff;
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
}

.boxGroup h3 {
  color: #1e1e1e;
}

.box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  grid-column: 1/2;
  grid-row: 2;
  filter: url(#blob);
  width: 100%;
  height: 200px;
}

.circle-PHF,
.circle-PLF {
  position: relative;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  filter: drop-shadow(0px 3px 5px #fff) brightness(1.06);
}

.boxGroup {
  position: relative;
  height: 100%;
}

.boxText {
  display: flex;
  align-items: center;
  justify-content: center;
  grid-column: 1/2;
  grid-row: 2;
  width: 100%;
  height: 200px;
  z-index: 2;
  position: relative;
  gap: 70px;
}

.text-container-PLF {
  text-align: center;
  color: #fff;
  animation: 1.5s moveRight forwards ease-out;
  display: block;
}

.text-container-PHF {
  text-align: center;
  color: #fff;
  animation: 1.75s moveLeft forwards ease-out;
//   transform: translateX(30px);
}

.boxText h4 {
  margin: 0;
}

.circle-PLF {
  background-color: rgba(236, 79, 79, 0.75);
  animation: 1.5s moveRight forwards ease-out;
}

.circle-PHF {
  background-color: rgba(31, 188, 179, 0.75);
  animation: 1.75s moveLeft forwards ease-out;
}

.text-container-PLF .value,
.text-container-PHF .value {
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  letter-spacing: 0.12px;
}

@keyframes moveLeft {
  0% {
    left: -50px;
  }

  50% {
    left: -25px;
  }

  70% {
    left: -36px;
  }

  100% {
    left: 0;
  }
}

@keyframes moveRight {
  0% {
    left: 50px;
  }

  50% {
    left: 25px;
  }

  70% {
    left: 36px;
  }

  100% {
    left: 0;
  }
}
</style>
