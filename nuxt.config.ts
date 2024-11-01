export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  app: {
    baseURL: "/",
    head: {
      meta: [
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
        },
      ],
      link: [
        {
          rel: "manifest",
          href: "/manifest.webmanifest",
        },
      ],
    },
  },
  ssr: false,
  modules: [
    "@pinia/nuxt",
    "@vite-pwa/nuxt", // 使用 @vite-pwa/nuxt 模組替代 @nuxtjs/pwa
  ],
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "NeuroPlus神經調節家",
      id: "/", // 與 start_url 一致
      short_name: "NeuroPlus",
      theme_color: "#4DBA87",
      background_color: "#ffffff",
      display: "standalone",
      lang: "zh-TW",
      start_url: "/",
      scope: "/", // 確保 scope 與 start_url 一致
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
          src: "/screenshot1.png", // 螢幕截圖
          sizes: "1080x1920",
          type: "image/png",
          form_factor: "narrow", // 可選值：'narrow', 'wide'
        },
      ],
    },
    devOptions: {
      enabled: true,
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