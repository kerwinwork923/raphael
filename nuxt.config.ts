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
  
  // 添加實驗性功能來解決模組解析問題
  experimental: {
    payloadExtraction: false,
  },

  app: {
    baseURL: "/", 
    head: {
      title: 'NeuroPlus神經調節家 - 專業自律神經檢測',
      meta: [
        {
          name: "viewport",
          // ✅ 允許縮放（放寬 maximum-scale；不要 user-scalable）
          content: "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=10, user-scalable=yes"
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
          rel: "canonical",
          href: "https://neuroplus.com.tw",
        },
      ],
    },
  },

  modules: [
    "@pinia/nuxt",
  ],

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
    // 添加 Vite 配置來解決模組解析問題
    optimizeDeps: {
      include: ['vue', 'vue-router']
    },
    resolve: {
      alias: {
        '#internal': 'nuxt/dist/runtime'
      }
    }
  },
});
