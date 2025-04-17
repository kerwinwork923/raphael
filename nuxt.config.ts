export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  ssr: false, // 使用 SPA 模式
  devtools: { enabled: true },

  nitro: {
    preset: "vercel-static", // ✅ 靜態輸出
    prerender: {
      routes: ["/"], // 保留首頁
    },
  },

  app: {
    baseURL: "", // 使用乾淨路徑，不用 hash 模式
    head: {
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
        },
      ],
      // ❌ 拿掉 manifest（非必要，避免多餘資源）
      link: [],
    },
  },

  modules: [
    "@pinia/nuxt",
    // ❌ 拿掉 "@vite-pwa/nuxt"
  ],

  // ❌ 完全移除 pwa 設定

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
