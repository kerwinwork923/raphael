import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, onMessage, getToken, type Messaging } from 'firebase/messaging'

declare module '#app' {
  interface NuxtApp {
    $messaging: Messaging
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $messaging: Messaging
  }
}

const vapidKey = "BNWMTU1y0LLsXXBP_q7atol3ya8wH4EYk74um6OVD3JwU6arjpBzU33G6pHudatw1zbFh6xbJowa4OGy4Wo_85A"; // 請將此替換為您的 Firebase 控制台中的 VAPID Key

export default defineNuxtPlugin(() => {
  // 確保只在客戶端環境執行
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      provide: {
        messaging: null,
      }
    }
  }

  try {
    const app = getApps()[0] ?? initializeApp({
      apiKey: "AIzaSyDqLTG4RULhejwmTcoWqhYHWX4rryk5Z-8",
      authDomain: "neuroplus-4338a.firebaseapp.com",
      databaseURL: "https://neuroplus-4338a-default-rtdb.firebaseio.com/",
      projectId: "neuroplus-4338a",
      storageBucket: "gs://neuroplus-4338a.appspot.com/",
      messagingSenderId: "13238098998",
      appId: "1:13238098998:ios:7d30bc142be6421b9b4c97",
      measurementId: "G-35F5RSTVMZ"
    })

    const messaging = getMessaging(app)

    // 設定 VAPID Key 並獲取 Token（只在 serviceWorker 可用時執行）
    if ("serviceWorker" in navigator && navigator.serviceWorker) {
      getToken(messaging, { vapidKey })
        .then((currentToken) => {
          if (currentToken) {
            console.log("Token retrieved:", currentToken);
          } else {
            console.log("No registration token available. Request permission to generate one.");
          }
        })
        .catch((err) => {
          console.error("An error occurred while retrieving token. ", err);
        });
    }

    // This runs whenever a message is received:
    //   - When the page is open
    //   - When the user clicked the bg notification
    onMessage(messaging, (payload) => {
      alert(JSON.stringify(payload, null, 2))
    })

    return {
      provide: {
        messaging,
      }
    }
  } catch (error) {
    console.error("Firebase messaging initialization error:", error);
    return {
      provide: {
        messaging: null,
      }
    }
  }
})
