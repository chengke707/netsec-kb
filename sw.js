// 网安导论知识库 · Service Worker（离线可用 + 更新推送）
var VERSION = 'netsec-kb-v1.0';
var PRECACHE = [
  './index.html',
  './图谱.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './README.md',
  './00-首页.md',
  './图谱数据.json',
  './04-习题集/第1章-习题.md',
  './05-考试冲刺/背诵冲刺清单.md',
  './配图/图1-1-网络信息安全模型.png',
  './配图/图1-2-信息包筛选位置.png',
  './配图/图1-3-应用中继器配置.png',
  './配图/图1-4-早期网络安全系统.png',
  './配图/图1-5-中档网络安全系统.png',
  './配图/图1-6-双路由器安全系统.png',
  './配图/图1-7-高级安全系统.png',
  './配图/图1-8-ARP欺骗原理.png',
  './配图/图1-9-TCP-SYN泛洪.png',
  './配图/图1-10-TCP-SYN扫描.png',
  './配图/图1-11-TCP-FIN扫描.png',
  './配图/图1-12-TCP-LAND.png',
  './配图/图1-13-TCP中间人.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) {
      return c.addAll(PRECACHE);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== VERSION; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (resp) {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          var copy = resp.clone();
          caches.open(VERSION).then(function (c) { c.put(e.request, copy); });
        }
        return resp;
      }).catch(function () {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
