// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE,
    },
    turso: {
      databaseUrl: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    },
  },
  vite: {
    server: {
      allowedHosts: [
        '2dfb205e-8fcc-4add-8d81-98fc97953b87-00-3l0myr7bahyxs.worf.replit.dev'
      ]
    }
  }
})
