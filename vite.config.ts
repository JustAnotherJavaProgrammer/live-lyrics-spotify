import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import {VitePWA} from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), VitePWA({
    includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
    registerType: 'autoUpdate',
    strategies: "generateSW",
    manifest: {
      name: "Live Lyrics for Spotify",
      short_name: "Live Lyrics",
      description: "A custom implementation of Live Lyrics for Spotify, inspired by Apple Music.",
      display: "standalone",
      theme_color: "#DB2763",
      background_color: "#DB2763",
      orientation: "portrait-primary",
      lang: "en-US",
      start_url: "https://live-lyrics-for-spotify.glitch.me/",
      icons: [
        {
          src: 'android-chrome-36x36.png',
          sizes: '36x36',
          type: 'image/png',
        },{
          src: 'android-chrome-48x48.png',
          sizes: '48x48',
          type: 'image/png',
        },{
          src: 'android-chrome-72x72.png',
          sizes: '72x72',
          type: 'image/png',
        },{
          src: 'android-chrome-96x96.png',
          sizes: '96x96',
          type: 'image/png',
        },{
          src: 'android-chrome-144x144.png',
          sizes: '144x144',
          type: 'image/png',
        },
        {
          src: 'android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'apple-touch-icon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'apple-touch-icon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        }
      ]
    }
  })]
})
