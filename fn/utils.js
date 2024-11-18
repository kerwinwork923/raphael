import unSmile from "@/assets/imgs/unSmile.png";
import sad from "@/assets/imgs/sad.png";
import happy from "@/assets/imgs/happy.png";
import smile from "@/assets/imgs/smile.png";

//顏色判定
export const scoreColorFn = (score, sex) => {
  if (sex == 2) {
    switch (true) {
      case score >= 0 && score <= 35:
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
      case score >= 0 && score <= 25:
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
    case score >= 0 && score <= 6:
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

export const computedText = (score, sex) => {
  if (score >= 0 && score <= 25) {
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
  // Check if the input is a valid string and has the expected length of 14
  if (typeof timestampStr !== "string" || timestampStr.length !== 14) {
    console.error(
      "Invalid timestamp format. Expected a 14-character string:",
      timestampStr
    );
    return "Invalid timestamp format"; // Return a friendly message or handle it accordingly
  }

  // Attempt to extract components from the timestamp string
  const year = timestampStr.slice(0, 4);
  const month = timestampStr.slice(4, 6);
  const day = timestampStr.slice(6, 8);
  const hour = timestampStr.slice(8, 10);
  const minute = timestampStr.slice(10, 12);
  const second = timestampStr.slice(12, 14);

  // Validate the date using the Date constructor
  const formattedMonth = parseInt(month, 10);
  const formattedDay = parseInt(day, 10);
  const date = new Date(year, formattedMonth - 1, formattedDay);

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
    return "Invalid date"; // Handle invalid date case
  }

  // Return the formatted timestamp string
  return `${year}/${formattedMonth}/${formattedDay}`;
};

// 月份/天
export const formatTimestamp2 = (timestampStr) => {
  if (typeof timestampStr !== "string" || timestampStr.length !== 14) {
    console.error(
      "Invalid timestamp format. Expected a 14-character string:",
      timestampStr
    );
    return "Invalid timestamp format";
  }

  // 擷取年份、月份、日期、時間
  const year = timestampStr.slice(0, 4);
  const month = timestampStr.slice(4, 6);
  const day = timestampStr.slice(6, 8);
  const hour = timestampStr.slice(8, 10);
  const minute = timestampStr.slice(10, 12);
  const second = timestampStr.slice(12, 14);

  // 格式化月份和日期
  const formattedMonth = parseInt(month, 10);
  const formattedDay = parseInt(day, 10);

  // 建立日期物件以驗證日期
  const date = new Date(year, formattedMonth - 1, formattedDay);

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

  return `${formattedMonth}/${formattedDay}`;
};
// 月份/時間 小時
export const formatTimestamp3 = (timestampStr) => {
  if (typeof timestampStr !== "string" || timestampStr.length !== 14) {
    console.error(
      "Invalid timestamp format. Expected a 14-character string:",
      timestampStr
    );
    return "Invalid timestamp format";
  }

  // 擷取年份、月份、日期、時間
  const year = timestampStr.slice(0, 4);
  const month = timestampStr.slice(4, 6);
  const day = timestampStr.slice(6, 8);
  const hour = timestampStr.slice(8, 10);
  const minute = timestampStr.slice(10, 12);
  const second = timestampStr.slice(12, 14);

  // 格式化月份和日期
  const formattedMonth = parseInt(month, 10);
  const formattedDay = parseInt(day, 10);

  // 建立日期物件以驗證日期
  const date = new Date(year, formattedMonth - 1, formattedDay);

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

  return `${formattedMonth}/${formattedDay} ${hour}:${minute}`;
};

export const formatTimestampMDH = (timestampStr) => {
  if (
    typeof timestampStr !== "string" ||
    !/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/.test(timestampStr)
  ) {
    console.error(
      "Invalid timestamp format. Expected format YYYY/MM/DD HH:mm:",
      timestampStr
    );
    return "Invalid timestamp format";
  }

  // 擷取年月日和時間
  const [datePart, timePart] = timestampStr.split(" ");
  const [year, month, day] = datePart.split("/").map(Number);
  const [hour, minute] = timePart.split(":");

  // 回傳格式化後的字串，為 MM/DD HH:mm
  return `${month}/${day} ${hour}:${minute}`;
};
