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
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Opened cache");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
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

// API 응답을 캐시하는 함수
async function cacheApiResponse(request, response) {
    const clonedResponse = response.clone();
    try {
        const data = await clonedResponse.json();
        const url = new URL(request.url);
        const endpoint = url.pathname;
        
        // API 엔드포인트별 데이터 저장
        if (endpoint === '/api/auth/isAuthenticated') {
            // 인증 상태 저장
            await addData('auth-status', { ...data, endpoint, timestamp: Date.now() });
        } else if (Array.isArray(data)) {
            await Promise.all(data.map(item => {
                const id = item._id || item.id;
                if (id) {
                    return addData(endpoint + '/' + id, { 
                        ...item, 
                        id: id,
                        endpoint,
                        timestamp: Date.now()
                    });
                }
            }));
        } else if (data && (data._id || data.id)) {
            await addData(endpoint + '/' + (data._id || data.id), {
                ...data,
                endpoint,
                timestamp: Date.now()
            });
        }
    } catch (error) {
        console.error('Error caching API response:', error);
    }
}

const handleAuthError = (authData) => {
    if (!authData || !authData.status_id) {
        console.error("Authentication data is missing or invalid:", authData);
        // 기본값 또는 다른 처리
        return { isAuthenticated: false };
    }
    return authData;
};

// API 요청 처리하는 함수
async function handleApiRequest(request) {
    const url = new URL(request.url);
    const endpoint = url.pathname;

    try {
        // 온라인 상태에서의 요청 처리
        const response = await fetch(request);
        if (response.ok) {
            // 성공적인 응답을 캐시에 저장
            await cacheApiResponse(request, response.clone());
            return response;
        }
        throw new Error('Network response was not ok');
    } catch (error) {
        console.log('Fetching from IndexedDB for:', endpoint);
        console.error("Fetch failed, attempting to get cached data:", error);

        // IndexedDB에서 데이터 검색
        let cachedData;
        if (endpoint === '/api/auth/isAuthenticated') {
            // 인증 상태 처리
            cachedData = await getData('auth-status');
            return new Response(JSON.stringify(cachedData || { isAuthenticated: true }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // if (endpoint.includes('/auth/isAuthenticated')) {
            //     cachedData = await getData('auth-status');
            //     console.log("Cached Data:", cachedData); // 데이터 구조 확인
            
            //     if (cachedData && cachedData.length > 0) {
            //         const authData = handleAuthError(cachedData && cachedData.length > 0 ? cachedData[0] : null);
            //         console.log("Auth Data:", authData); // authData 확인
            
            //         // authData가 유효한지 검사
            //         if (authData && authData.user) {
            //             const statusId = authData.user.status_id; // status_id에 올바르게 접근
            //             console.log("Status ID:", statusId);
            //             return new Response(JSON.stringify(authData), {
            //                 headers: { 'Content-Type': 'application/json' }
            //             });
            //         } else {
            //             console.error("Auth data is missing or invalid:", authData);
            //             return new Response(JSON.stringify({ isAuthenticated: false }), {
            //                 headers: { 'Content-Type': 'application/json' }
            //             });
            //         }
            //     } else {
            //         // 데이터가 없을 경우 처리
            //         return new Response(JSON.stringify({ isAuthenticated: false }), {
            //             headers: { 'Content-Type': 'application/json' }
            //         });
            //     }
            // }
            if (endpoint.includes('/auth/isAuthenticated')) {
                const cachedData = await getData('auth-status'); // 여기서 auth-status 키를 사용
                console.log("Cached Data:", cachedData); // 캐시된 데이터 확인
            
                if (cachedData && cachedData.user) { // user 키 확인
                    const statusId = cachedData.user.status_id; // status_id에 올바르게 접근
                    console.log("Status ID:", statusId);
                    return new Response(JSON.stringify(cachedData), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                } else {
                    console.error("Auth data is missing or invalid:", cachedData);
                    return new Response(JSON.stringify({ isAuthenticated: false }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            } else {
                // 데이터가 없을 경우 처리
                return new Response(JSON.stringify({ isAuthenticated: false }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
        }
    }
}

// Fetch 이벤트 핸들러
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    
    // chrome-extension 요청 무시
    if (url.protocol === 'chrome-extension:') {
        return;
    }

    // API 요청 처리
    if (event.request.url.includes("/api/")) {
        event.respondWith(handleApiRequest(event.request));
    } else {
        // 정적 자산 요청 처리
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
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                            return response;
                        })
                        .catch(() => {
                            return caches.match('/offline.html');
                        });
                })
        );
    }
});