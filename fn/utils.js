import unSmile from "@/assets/imgs/unSmile.png";
import sad from "@/assets/imgs/sad.png";
import happy from "@/assets/imgs/happy.png";
import smile from "@/assets/imgs/smile.png";

//顏色判定
export const scoreColorFn = (score, sex) => {
  if (sex == 2) {
 
    switch (true) {
      case score >= 1 && score <= 35:
        return "#74BC1F"; // 正常
      case score >= 36 && score <= 60:
        return "#1FBCB3"; // 輕度失調
      case score >= 61 && score <= 89:
        return "#65558F"; // 中度失調
      case score >= 90:
        return "#EC4F4F"; // 重度失調
      default:
        return "gray";
    }
  } else {
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
        return "gray";
    }
  }
};

export const scoreSleepColorFn = (score) => {
  switch (true) {
    case score >= 1 && score <= 6:
      return "#EC4F4F"; // 重度失調

    case score >= 7 && score <= 13:
      return "#65558F"; // 中度失調
    case score >= 14 && score <= 20:
      return "#1FBCB3"; // 輕度失調
    case score >= 21:
      return "#74BC1F"; // 正常
    default:
      return "gray";
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

export const computedSleepEmoji = (score) => {
  if (score <= 8) {
    return unSmile;
  } else if (score <= 18) {
    return happy;
  } else if (score <= 28) {
    return sad;
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

export const computedText = (score) => {
  if (score >= 1 && score <= 25) {
    return "正常";
  } else if (score >= 26 && score <= 45) {
    return "輕度失調";
  } else if (score >= 46 && score <= 71) {
    return "中度失調";
  } else if (score >= 72) {
    return "嚴重失調";
  } else {
    return "";
  }
};

export const formatTimestamp = (timestampStr) => {
  // 檢查輸入是否為有效的字符串
  if (typeof timestampStr !== "string" || timestampStr.length !== 14) {
    console.error(
      "Invalid timestamp format. Expected a 14-character string:",
      timestampStr
    );
    return "Invalid timestamp format";
  }

  // 提取年月日
  const year = timestampStr.slice(0, 4);
  const month = timestampStr.slice(4, 6);
  const day = timestampStr.slice(6, 8);

  // 將月份和日期轉換為整數去掉前導零（如有）
  const formattedMonth = parseInt(month, 10);
  const formattedDay = parseInt(day, 10);

  // 驗證日期的有效性
  const date = new Date(year, formattedMonth - 1, formattedDay);

  // 檢查日期是否有效
  if (
    date.getFullYear() !== parseInt(year, 10) ||
    date.getMonth() !== formattedMonth - 1 ||
    date.getDate() !== formattedDay
  ) {
    console.error(
      "Invalid date constructed from timestamp:",
      year,
      formattedMonth,
      formattedDay
    );
    return "Invalid date";
  }

  // 返回格式化結果
  return `${formattedMonth}/${formattedDay}`; // 返回 MM/DD 格式
};
