import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests',timeout:45000,expect:{timeout:10000},workers:1,
 outputDir:'.local/browser-results',reporter:[['list'],['json',{outputFile:'.local/browser-results.json'}]],
 use:{baseURL:'http://127.0.0.1:8081',channel:'chrome',viewport:{width:390,height:844},colorScheme:'light',trace:'off',screenshot:'only-on-failure'},
 webServer:{command:'node scripts/dev.mjs',url:'http://127.0.0.1:8081',reuseExistingServer:true,timeout:120000},
});
