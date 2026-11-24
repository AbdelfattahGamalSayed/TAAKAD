import test from 'node:test';
import assert from 'node:assert/strict';
import {browserDemoOrigin} from '../scripts/show-browser-demo.mjs';
test('browser demo targets the reachable LAN app rather than Expo Go',()=>{
 const interfaces={WiFi:[{family:'IPv4',internal:false,address:'192.168.10.20'}]};
 assert.equal(browserDemoOrigin(interfaces,''),'http://192.168.10.20:8081');
});
test('LAN discovery ignores loopback and prefers a physical interface over virtual adapters',()=>{
 const interfaces={vEthernet:[{family:'IPv4',internal:false,address:'172.20.0.1'}],Loopback:[{family:'IPv4',internal:true,address:'127.0.0.1'}],WiFi:[{family:'IPv4',internal:false,address:'10.0.0.5'}]};
 assert.equal(browserDemoOrigin(interfaces,''),'http://10.0.0.5:8081');
 assert.throws(()=>browserDemoOrigin(interfaces,'203.0.113.7'),/assigned to this computer/);
 assert.throws(()=>browserDemoOrigin({},''),/No LAN address/);
});
