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
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
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

  modules: [
    "@pinia/nuxt",
    "@vite-pwa/nuxt",
  ],

  pwa: {
    registerType: "autoUpdate",
    workbox: {
      cleanupOutdatedCaches: true,
    },
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
