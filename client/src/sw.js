// service-worker.js
import { precacheAndRoute } from 'workbox-precaching';
import { addData, getData } from './utils/db';

precacheAndRoute(self.__WB_MANIFEST);

const CACHE_NAME = "StarRich-v1-01";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Opened cache");
            return cache.addAll(["/offline.html"]);
        })
    );
});

// Activate 이벤트: 오래된 캐시 정리
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

// API 응답 캐싱 함수
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

async function handleApiRequest(request) {
    const url = new URL(request.url);
    const endpoint = url.pathname;

    try {
        const response = await fetch(request);
        if (response.ok) {
            await cacheApiResponse(request, response.clone());
            return response;
        }
        throw new Error("Network response was not ok");
    } catch (error) {
        console.error(`Fetching from cache for ${endpoint}:`, error);

        // 인증 API의 경우 캐시된 데이터 반환
        if (endpoint === '/api/auth/isAuthenticated') {
            const cachedData = await getData('auth-status');
            if (cachedData && cachedData.user && cachedData.user.status_id) {
                return new Response(JSON.stringify(cachedData), {
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            
            // 캐시 데이터 유효하지 않은 경우 기본 데이터 반환
            return new Response(
                JSON.stringify({ isAuthenticated: false, reason: "offline" }),
                { headers: { 'Content-Type': 'application/json' }, status: 200 }
            );
        }

        // 기타 API 기본 응답
        return new Response(
            JSON.stringify({ message: 'Failed to fetch data (offline)' }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    }
}

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
