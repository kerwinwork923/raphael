import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

export const messagingToken = { value: "" };

const firebaseConfig = {
  apiKey: "AIzaSyDqLTG4RULhejwmTcoWqhYHWX4rryk5Z-8",
  authDomain: "neuroplus-4338a.firebaseapp.com",
  databaseURL: "https://neuroplus-4338a-default-rtdb.firebaseio.com/",
  projectId: "neuroplus-4338a",
  storageBucket: "gs://neuroplus-4338a.appspot.com/",
  messagingSenderId: "13238098998",
  appId: "1:13238098998:ios:7d30bc142be6421b9b4c97",
  measurementId: "G-35F5RSTVMZ"
};

// 初始化 Firebase app
const firebaseApp = initializeApp(firebaseConfig);

// 初始化 Messaging
const messaging = getMessaging(firebaseApp);
// 初始化 Messaging 並使用自定義服務工作者
//const messaging = getMessaging(firebaseApp, {serviceWorkerRegistration: navigator.serviceWorker.register('/firebase-messaging-sw.js')});
  
export async function requestPermission() {
  if (!window.Notification) {
    console.warn("Notifications are not supported in this browser.");
    return;
  }

  if (window.Notification.permission === 'granted') {
    await setToken();
  } else if (window.Notification.permission === 'default') {
    const permission = await window.Notification.requestPermission();
    if (permission === 'granted') {
      await setToken();
    } else {
      showDeniedMessage(); // 顯示權限被拒絕的提示
    }
  } else {
    showDeniedMessage(); // 如果是 'denied'，顯示權限被拒絕的提示
  }
}

// 如果權限被拒絕，顯示提示消息
function showDeniedMessage() {
  alert("您已拒絕推播通知。請在瀏覽器的設置中允許通知，才能接收最新消息。");
}

// 設定 token 並更新 messagingToken.value
async function setToken() {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BNWMTU1y0LLsXXBP_q7atol3ya8wH4EYk74um6OVD3JwU6arjpBzU33G6pHudatw1zbFh6xbJowa4OGy4Wo_85A"
    });
    
    if (token) {
      messagingToken.value = token;
     // console.log("Token retrieved:", token);
      await sendTokenToServer(token);
    } else {
      console.warn("No registration token available. Request permission to generate one.");
    }
  } catch (error) {
    console.error("Failed to get token:", error);
  }
}

async function sendTokenToServer(token) {
  try {
    await fetch('/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    //console.log("Token sent to server successfully.");
  } catch (error) {
    console.error("Failed to send token to server:", error);
  }
}
