import { defineConfig } from '@playwright/test'
export default defineConfig({ globalSetup: './global-setup.mjs', testDir: './tests', use: { baseURL: 'http://127.0.0.1:4174/carve-bench/' }, webServer: { command: 'python3 -m http.server 4174 --bind 127.0.0.1 --directory ../_preview', port: 4174, reuseExistingServer: false } })
