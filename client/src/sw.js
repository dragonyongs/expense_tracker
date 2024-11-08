// service-worker.js
import { precacheAndRoute } from 'workbox-precaching';
import { addData, getData } from './utils/db';

precacheAndRoute(self.__WB_MANIFEST);

const CACHE_NAME = "StarRich-v1-01";
const ASSETS_TO_CACHE = [
    "/",
    "/index.html",
    "/favicon.ico",
    "/icon-wallet.png",
    "/pending.png",
    "/pig-piggy-bank.svg",
    "/credit-card.svg",
    "/taxi-transport.svg",
    "/cloud-offline.svg",
    "/manifest.webmanifest",
    "/pwa-192x192.png",
    "/pwa-256x256.png",
    "/pwa-512x512.png",
    "/src/main.jsx",
    "/offline.html",
];

// 설치 이벤트
// self.addEventListener("install", (event) => {
//     event.waitUntil(
//         caches.open(CACHE_NAME).then((cache) => {
//             console.log("Opened cache");
//             return cache.addAll(ASSETS_TO_CACHE);
//         })
//     );
// });

// 설치 이벤트: 정적 자산 캐싱
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Opened cache");
            return cache.addAll([
                "/offline.html"
            ]);
        })
    );
});

// 활성화 이벤트: 오래된 캐시 정리
self.addEventListener("activate", (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log(`Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// API 응답을 캐시하는 함수
// async function cacheApiResponse(request, response) {
//     const clonedResponse = response.clone();
//     try {
//         const data = await clonedResponse.json();
//         const url = new URL(request.url);
//         const endpoint = url.pathname;
        
//         // API 엔드포인트별 데이터 저장
//         if (endpoint === '/api/auth/isAuthenticated') {
//             // 인증 상태 저장
//             await addData('auth-status', { ...data, endpoint, timestamp: Date.now() });
//         } else if (Array.isArray(data)) {
//             await Promise.all(data.map(item => {
//                 const id = item._id || item.id;
//                 if (id) {
//                     return addData(endpoint + '/' + id, { 
//                         ...item, 
//                         id: id,
//                         endpoint,
//                         timestamp: Date.now()
//                     });
//                 }
//             }));
//         } else if (data && (data._id || data.id)) {
//             await addData(endpoint + '/' + (data._id || data.id), {
//                 ...data,
//                 endpoint,
//                 timestamp: Date.now()
//             });
//         }
//     } catch (error) {
//         console.error('Error caching API response:', error);
//     }
// }


// API 응답을 캐시하는 함수
async function cacheApiResponse(request, response) {
    const clonedResponse = response.clone();
    try {
        const data = await clonedResponse.json();
        const url = new URL(request.url);
        const endpoint = url.pathname;

        const cacheKey = Array.isArray(data)
            ? `${endpoint}?list`
            : endpoint;

        await addData(cacheKey, {
            ...data,
            endpoint,
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error(`Error caching API response for ${request.url}:`, error);
    }
}


// API 요청 처리하는 함수
// async function handleApiRequest(request) {
//     const url = new URL(request.url);
//     const endpoint = url.pathname;

//     try {
//         // 온라인 상태에서의 요청 처리
//         const response = await fetch(request);
//         if (response.ok) {
//             // 성공적인 응답을 캐시에 저장
//             await cacheApiResponse(request, response.clone());
//             return response;
//         }
//         throw new Error('Network response was not ok');
//     } catch (error) {
//         console.log('Fetching from IndexedDB for:', endpoint);
//         console.error("Fetch failed, attempting to get cached data:", error);

//         // IndexedDB에서 데이터 검색
//         let cachedData;
//         if (endpoint === '/api/auth/isAuthenticated') {
//             // 인증 상태 처리
//             cachedData = await getData('auth-status');
//             console.log('cachedData', cachedData);
//             return new Response(JSON.stringify(cachedData || { isAuthenticated: true }), {
//                 headers: { 'Content-Type': 'application/json' }
//             });
//         } else {
//             if (endpoint.includes('/auth/isAuthenticated')) {
//                 const cachedData = await getData('auth-status'); // 여기서 auth-status 키를 사용
//                 console.log("Cached Data.user:", cachedData.user); // 캐시된 데이터 확인
//                 console.log("Cached Data.user:", cachedData.user.status_id, cachedData.user.status_id?.id ); // 캐시된 데이터 확인
            
//                 if (cachedData && cachedData.user) { // user 키 확인
//                     const statusId = cachedData.user.status_id; // status_id에 올바르게 접근
//                     console.log("Status ID:", statusId);
//                     return new Response(JSON.stringify(cachedData), {
//                         headers: { 'Content-Type': 'application/json' }
//                     });
//                 } else {
//                     console.error("Auth data is missing or invalid:", cachedData);
//                     return new Response(JSON.stringify({ isAuthenticated: false }), {
//                         headers: { 'Content-Type': 'application/json' }
//                     });
//                 }
//             } else {
//                 // 데이터가 없을 경우 처리
//                 return new Response(JSON.stringify({ isAuthenticated: false }), {
//                     headers: { 'Content-Type': 'application/json' }
//                 });
//             }
            
//         }
//     }
// }

// API 요청을 처리하는 함수
async function handleApiRequest(request) {
    const url = new URL(request.url);
    const endpoint = url.pathname;

    try {
        const response = await fetch(request);
        if (response.ok) {
            await cacheApiResponse(request, response.clone());
            return response;
        }
        throw new Error('Network response was not ok');
    } catch (error) {
        console.error(`Fetching from cache for ${endpoint}:`, error);

        // 인증 API의 경우 캐시된 데이터 반환
        if (endpoint === '/api/auth/isAuthenticated') {
            const cachedData = await getData('auth-status');

            if (cachedData && cachedData.user) {
                const { user } = cachedData;
                const { status_id } = user;

                if (status_id) {
                    return new Response(JSON.stringify(cachedData), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                } else {
                    console.error("Missing status_id in cached data:", cachedData);
                    return new Response(JSON.stringify({ error: "Missing status_id" }), {
                        headers: { 'Content-Type': 'application/json' },
                        status: 400
                    });
                }
            }

            console.error("Invalid cached data structure:", cachedData);
            return new Response(JSON.stringify({ isAuthenticated: false }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400
            });
        }

        // 기타 API의 경우 기본 응답 반환
        return new Response(JSON.stringify({ message: 'Failed to fetch data' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Fetch 이벤트 핸들러
// self.addEventListener("fetch", (event) => {
//     const url = new URL(event.request.url);
    
//     // chrome-extension 요청 무시
//     if (url.protocol === 'chrome-extension:') {
//         return;
//     }

//     // API 요청 처리
//     if (event.request.url.includes("/api/")) {
//         event.respondWith(handleApiRequest(event.request));
//     } else {
//         // 정적 자산 요청 처리
//         event.respondWith(
//             caches.match(event.request)
//                 .then((cachedResponse) => {
//                     if (cachedResponse) {
//                         return cachedResponse;
//                     }
//                     return fetch(event.request)
//                         .then((response) => {
//                             if (!response || response.status !== 200 || response.type !== 'basic') {
//                                 return response;
//                             }
//                             const responseToCache = response.clone();
//                             caches.open(CACHE_NAME)
//                                 .then((cache) => {
//                                     cache.put(event.request, responseToCache);
//                                 });
//                             return response;
//                         })
//                         .catch(() => {
//                             return caches.match('/offline.html');
//                         });
//                 })
//         );
//     }
// });

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // chrome-extension 요청 무시
    if (url.protocol === 'chrome-extension:') return;

    if (url.pathname.startsWith("/api/")) {
        // API 요청은 캐싱된 데이터 우선
        event.respondWith(handleApiRequest(event.request));
    } else {
        // 정적 자산은 캐시 우선, 네트워크 실패 시 오프라인 페이지 제공
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(event.request)
                        .then((response) => {
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                            return response;
                        })
                        .catch(() => caches.match('/offline.html'));
                })
        );
    }
});