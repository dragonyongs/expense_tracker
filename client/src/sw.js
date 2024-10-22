import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

const CACHE_NAME = "StarRich-v1";
const ASSETS_TO_CACHE = [
    "/",
    "/index.html",
    "/favicon.ico",
    "/manifest.webmanifest",
    "/pwa-192x192.png",
    "/pwa-512x512.png",
    "/src/main.jsx",
];

// 설치 이벤트: 서비스 워커가 처음 설치될 때 캐시 생성
self.addEventListener("install", (event) => {
event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
    console.log("Opened cache");
    return cache.addAll(ASSETS_TO_CACHE);
    })
);
});

// 활성화 이벤트: 캐시 정리 등 초기화 작업
self.addEventListener("activate", (event) => {
const cacheWhitelist = [CACHE_NAME];
event.waitUntil(
    caches.keys().then((cacheNames) => {
    return Promise.all(
        cacheNames.map((cacheName) => {
        if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
        }
        })
    );
    })
);
});

self.addEventListener("fetch", (event) => {
    if (event.request.url.includes("/api/")) {
        const token = localStorage.getItem('authToken'); // 로컬 스토리지에서 인증 토큰 가져오기
        const headers = new Headers(event.request.headers);

        if (token) {
            headers.append('Authorization', `Bearer ${token}`); // 헤더에 인증 토큰 추가
        }

        const modifiedRequest = new Request(event.request, {
            headers: headers,
        });

        event.respondWith(
            caches.open("api-cache").then((cache) => {
                return fetch(modifiedRequest)
                .then((response) => {
                    if (response.ok) {
                        cache.put(event.request.url, response.clone());
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                });
            })
        );
    }
});

// self.addEventListener("fetch", (event) => {
//     if (event.request.url.includes("/api/")) {
//         event.respondWith(
//         caches.open("api-cache").then((cache) => {
//             return fetch(event.request)
//             .then((response) => {
//                 cache.put(event.request.url, response.clone());
//                 return response;
//             })
//             .catch(() => {
//                 return caches.match(event.request);
//             });
//         })
//         );
//     }
// });


// fetch 이벤트: 네트워크 요청이 발생할 때 캐시에서 제공하거나, 네트워크에서 가져오는 로직
// self.addEventListener("fetch", (event) => {
// event.respondWith(
//     caches.match(event.request).then((response) => {
//     return response || fetch(event.request);
//     })
// );
// });

// self.addEventListener("fetch", (event) => {
//     // API 요청인지 확인
//     if (event.request.url.includes("/api/")) {
//       event.respondWith(
//         caches.open(CACHE_NAME).then((cache) => {
//           return fetch(event.request)
//             .then((response) => {
//               // 네트워크 응답을 캐시에 저장
//               cache.put(event.request.url, response.clone());
//               return response;
//             })
//             .catch(() => {
//               // 네트워크 요청 실패 시 캐시된 데이터를 반환
//               return caches.match(event.request);
//             });
//         })
//       );
//     } else {
//       event.respondWith(
//         caches.match(event.request).then((response) => {
//           return response || fetch(event.request);
//         })
//       );
//     }
//   });