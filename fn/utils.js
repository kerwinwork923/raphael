import unSmile from "@/assets/imgs/unSmile.png";
import sad from "@/assets/imgs/sad.png";
import happy from "@/assets/imgs/happy.png";
import smile from "@/assets/imgs/smile.png";

//顏色判定
export const scoreColorFn = (score) => {
  switch (true) {
    case score >= 1 && score <= 25:
      return "#74BC1F"; // 正常
    case score >= 26 && score <= 45:
      return "#1FBCB3"; // 輕度失調
    case score >= 46 && score <= 71:
      return "#65558F"; // 中度失調
    case score >= 72:
      return "#EC4F4F"; // 重度失調
    default:
      return "gray"; // 默认颜色
  }
};

//表情判定
export const computedEmoji = (score) => {
  if (score <= 8) {
    return unSmile;
  } else if (score <= 18) {
    return sad;
  } else if (score <= 28) {
    return happy;
  } else if (score >= 36) {
    return smile;
  } else {
    return unSmile;
  }
};

//表情判定2
export const computedEmoji2 = (score) => {
  if (score <= 25) {
    return smile;
  } else if (score <= 45) {
    return happy;
  } else if (score <= 71) {
    return sad;
  } else if (score > 72) {
    return unSmile;
  } else {
    return unSmile;
  }
};
