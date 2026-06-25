// Import the firebase app / messaging packages
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js')

// Initialize app
const app = firebase.initializeApp({
  apiKey: "AIzaSyDqLTG4RULhejwmTcoWqhYHWX4rryk5Z-8",
  authDomain: "neuroplus-4338a.firebaseapp.com",
  databaseURL: "https://neuroplus-4338a-default-rtdb.firebaseio.com/",
  projectId: "neuroplus-4338a",
  storageBucket: "gs://neuroplus-4338a.appspot.com/",
  messagingSenderId: "13238098998",
  appId: "1:13238098998:ios:7d30bc142be6421b9b4c97",
  measurementId: "G-35F5RSTVMZ"
})

// Initialize messaging
const messaging = firebase.messaging()

// Listen to bg messages
messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' // 替換為您的圖標
  };

  // Show notification when message received
  self.registration.showNotification(notificationTitle, notificationOptions);
})

