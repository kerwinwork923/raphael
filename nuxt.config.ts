// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  ssr: false,                                // SPA
  devtools: { enabled: true },

  nitro: {
    preset: 'vercel-static',
    prerender: { routes: ['/'] },
  },

  // ✅ 一行就開 Hash 模式；Nuxt 3.8+ 官方做法
  router: {
    options: {
      hashMode: true        // <—
    }
  },

  app: {
    baseURL: '/',                           // 保持根路徑，切勿用 '#'
    head: {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
        },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
    },
  },

  modules: [
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
  ],

  pwa: {
    registerType: 'autoUpdate',
    workbox: { cleanupOutdatedCaches: true },
    manifest: {
      name: 'NeuroPlus神經調節家',
      short_name: 'NeuroPlus',
      id: '/',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      theme_color: 'transparent',
      background_color: '#ffffff',
      lang: 'zh-TW',
      icons: [
        { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      screenshots: [
        { src: '/screenshot1.png', sizes: '1080x1920', type: 'image/png', form_factor: 'narrow' },
      ],
    },
    devOptions: { enabled: false },
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
})
