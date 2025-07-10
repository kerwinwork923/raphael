export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  ssr: false, // 使用 SPA 模式
  devtools: { enabled: true },
  routeRules: {},
  nitro: {
    preset: 'vercel-static', // ✅ 這一行最關鍵
    prerender: {
      routes: ["/"], // 可保留首頁
    },
  },

  app: {
    baseURL: "/", 
    head: {
      title: 'NeuroPlus神經調節家 - 專業自律神經檢測',
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
        },
        {
          name: "description",
          content: "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
        },
        {
          name: "keywords",
          content: "NeuroPlus, 神經調節家, 自律神經檢測, HRV檢測, 人臉辨識, 健康檢測, 生理年齡",
        },
        {
          name: "author",
          content: "智平衡健康集團",
        },
        {
          property: "og:title",
          content: "NeuroPlus神經調節家 - 專業自律神經檢測",
        },
        {
          property: "og:description",
          content: "運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:image",
          content: "/screenshot1.png",
        },
        {
          name: "robots",
          content: "index, follow",
        },
      ],
      link: [
        {
          rel: "manifest",
          href: "/manifest.webmanifest",
        },
        {
          rel: "canonical",
          href: "https://neuroplus.com.tw",
        },
      ],
    },
  },

  modules: [
    "@pinia/nuxt",
    "@vite-pwa/nuxt",
  ],

  pwa: {
    registerType: "autoUpdate",
    workbox: {
      cleanupOutdatedCaches: true,
    },
    // 禁用自動生成的 Service Worker，使用自定義的
    strategies: 'injectManifest',
    srcDir: 'public',
    filename: 'sw-custom.js',
    manifest: {
      name: "NeuroPlus神經調節家",
      short_name: "NeuroPlus",
      id: "/",
      start_url: "/", // ✅ 避免 iOS PWA 開啟錯誤
      scope: "/",
      display: "standalone",
      theme_color: "transparent",
      background_color: "#ffffff",
      lang: "zh-TW",
      icons: [
        {
          src: "/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      screenshots: [
        {
          src: "/screenshot1.png",
          sizes: "1080x1920",
          type: "image/png",
          form_factor: "narrow",
        },
      ],
    },
    devOptions: {
      enabled: false,
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/assets/styles/variables.scss";
            @import "@/assets/styles/mixins.scss";
            @import "@/assets/styles/animations";
             @import "@/assets/styles/backend";
          `,
        },
      },
    },
  },
});
