import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, onMessage, type Messaging } from 'firebase/messaging'

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


export default defineNuxtPlugin(() => {
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


  // This runs whenever a message is received:
  //   - When the page is open
  //   - When the user clicked the bg notification
  onMessage(messaging, (payload) => {
    console.log("Message received. ", payload);
    alert(JSON.stringify(payload, null, 2))
  })

  return {
    provide: {
      messaging,
    }
  }
})
