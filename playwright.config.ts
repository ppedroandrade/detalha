import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'tests/e2e',workers:1,timeout:60000,use:{baseURL:'http://localhost:3100',headless:true},webServer:{command:'npm run start -- -p 3100',url:'http://localhost:3100',reuseExistingServer:false,timeout:60000,env:{DETALHA_MODE:'local',APP_URL:'http://localhost:3100',LOCAL_DATA_DIR:`.detalha/e2e-${Date.now()}`}}});
