// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' },
      ],
    },
  },

  css: ['@unocss/reset/tailwind.css', '~/assets/css/prose.css'],

  modules: ['@unocss/nuxt', '@nuxt/content', 'nuxt-icon', '@nuxtjs/color-mode'],

  content: {
    highlight: {
      theme: 'one-dark-pro',
    },
  },
  colorMode: {
    preference: 'dark', // default value of $colorMode.preference
    fallback: 'light', // fallback value if not system preference found
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '-mode',
    storageKey: 'nuxt-color-mode',
  },
})
