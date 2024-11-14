export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  app: {
    baseURL: "/",
    head: {
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
        },
      ],
      link: [
        {
          rel: "manifest",
          href: "/manifest.webmanifest", // 添加 manifest 文件的鏈接
        },
      ],
    },
  },
  ssr: false,
  modules: [
    "@pinia/nuxt",
    "@vite-pwa/nuxt",
  ],
  pwa: {
    registerType: "autoUpdate", // 完全不註冊 Service Worker
    manifest: {
      name: "NeuroPlus神經調節家",
      id: "/",
      short_name: "NeuroPlus",
      theme_color: "#4DBA87",
      background_color: "#ffffff",
      display: "standalone",
      lang: "zh-TW",
      start_url: ".", // 更改為 "." 以靈活處理路徑
      scope: ".", // 更改為 "." 以靈活處理路徑
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
      enabled: false, // 在開發環境中禁用 PWA 快取
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
          `,
        },
      },
    },
  },
});
