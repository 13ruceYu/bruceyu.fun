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

  modules: ['@unocss/nuxt', '@nuxt/content', 'nuxt-icon'],

  content: {
    highlight: {
      theme: 'one-dark-pro',
    },
  },
})
