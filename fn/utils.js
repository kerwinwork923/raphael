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
    // 確保輸入是字符串且長度符合標準格式 "YYYYMMDDHHMMSS"
    if (typeof timestampStr !== 'string' || timestampStr.length !== 14) {
      console.error("Invalid timestamp format:", timestampStr); // 紀錄錯誤
      return "Invalid timestamp format"; // 如果長度不對，返回錯誤提示
    }
  
    
    // 提取年月日
    const year = timestampStr.slice(0, 4); // 提取年份
    const month = timestampStr.slice(4, 6); // 提取月份
    const day = timestampStr.slice(6, 8); // 提取日期
  
    // 將月份和日期轉換為整數去掉前導零（如有）
    const formattedMonth = parseInt(month, 10); // 將字串轉為數字，去掉前導零
    const formattedDay = parseInt(day, 10);
  
    // 驗證日期的有效性
    const date = new Date(year, formattedMonth - 1, formattedDay); // JavaScript中月份從0開始計算
  
    if (
      date.getFullYear() !== parseInt(year) || 
      date.getMonth() !== formattedMonth - 1 || 
      date.getDate() !== formattedDay
    ) {
      console.error("Invalid date:", year, formattedMonth, formattedDay); // 紀錄錯誤
      return "Invalid date"; // 如果日期無效，返回錯誤提示
    }
  
    // 返回格式化結果
    return `${formattedMonth}/${formattedDay}`; // 返回 MM/DD 格式
  };
  