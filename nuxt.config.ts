export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  ssr: false, // 使用 SPA 模式
  devtools: { enabled: true },
  nitro: {
    preset: "vercel", // ✅ 加上這行強制對應 vercel
    prerender: {
      routes: ["/"] // 可保留，生成首頁
    }
  },
  app: {
    baseURL: "/", // 保持乾淨 URL，不用 hash
    head: {
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1.0, maximum-scale=1.0 ,user-scalable=no",
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
      start_url: "/", // ✅ iOS 正常開啟
      scope: "/",
      theme_color: "transparent",
      background_color: "#ffffff",
      display: "standalone",
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
          `,
        },
      },
    },
  },
});
