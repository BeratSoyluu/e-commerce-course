import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  //? Production'da React, API'nin wwwroot/app klasöründen sunuluyor; asset adresleri de /app/... olmalı.
  //? Geliştirmede (vite dev) uygulama kökten (/) çalışmaya devam eder.
  base: command === "build" ? "/app/" : "/",
  server:{
    port: 3000
  },
  build: {
    //! Doğrudan wwwroot'a değil alt klasöre: emptyOutDir her build'de klasörü boşaltıyor, wwwroot/images'taki
    //! ürün görselleri silinmesin. Proje dışı bir klasör olduğu için emptyOutDir açıkça true verilmeli.
    outDir: "../API/wwwroot/app",
    emptyOutDir: true,
  },
  plugins: [react()],
}))
