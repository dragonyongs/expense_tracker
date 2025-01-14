import { precacheAndRoute } from 'workbox-precaching';
import { addData, getData } from './utils/db';

precacheAndRoute(self.__WB_MANIFEST);

const CACHE_NAME = "StarRich-v1-02";
const OFFLINE_PAGE = "/offline.html";

// Install 이벤트: 캐시 초기화
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Opened cache and added offline page");
            return cache.addAll([OFFLINE_PAGE]);
        })
    );
});

// Activate 이벤트: 오래된 캐시 정리
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => 
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log(`Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            )
        )
    );
});

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // chrome-extension 요청 무시
    if (url.protocol === 'chrome-extension:') return;

    if (url.pathname.startsWith("/api/")) {
        event.respondWith(
            (async () => {
                try {
                    const response = await fetch(event.request);
                    if (response.ok) {
                        return response;
                    }
                } catch (error) {
                    console.log("Using cached data due to network error");
                    const cachedResponse = await caches.match(event.request);

                    if (cachedResponse) {
                        // 캐시 사용 알림 메시지 전송
                        self.clients.matchAll().then((clients) => {
                            clients.forEach((client) =>
                                client.postMessage({
                                    type: "CACHE_USED",
                                    url: event.request.url,
                                })
                            );
                        });
                        return cachedResponse;
                    }
                }

                return caches.match('/offline.html');
            })()
        );
    }
});

// API 응답 캐싱
async function cacheApiResponse(request, response) {
    try {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        const endpoint = new URL(request.url).pathname;
        const cacheKey = Array.isArray(data) ? `${endpoint}?list` : endpoint;

        await addData(cacheKey, {
            ...data,
            endpoint,
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error(`Error caching API response for ${request.url}:`, error);
    }
}

// API 요청 처리
async function handleApiRequest(request) {
    const endpoint = new URL(request.url).pathname;

    try {
        const response = await fetch(request);
        if (response.ok) {
            await cacheApiResponse(request, response);
            return response;
        }
        throw new Error(`Network response not ok for ${endpoint}`);
    } catch (error) {
        console.error(`Failed to fetch API from network: ${endpoint}`, error);

        if (endpoint === '/api/auth/isAuthenticated') {
            return handleAuthCacheFallback();
        }

        return createErrorResponse("Failed to fetch data (offline)");
    }
}

// 인증 API 캐시 폴백 처리
async function handleAuthCacheFallback() {
    const cachedData = await getData('auth-status');

    if (cachedData?.user?.status_id) {
        return new Response(JSON.stringify(cachedData), {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return createErrorResponse({ isAuthenticated: false, reason: "offline" });
}

// 에러 응답 생성
function createErrorResponse(message, status = 200) {
    return new Response(JSON.stringify({ message }), {
        headers: { 'Content-Type': 'application/json' },
        status,
    });
}

// Fetch 이벤트 처리
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // chrome-extension 요청 무시
    if (url.protocol === 'chrome-extension:') return;

    if (url.pathname.startsWith("/api/")) {
        event.respondWith(handleApiRequest(event.request));
    } else {
        event.respondWith(handleStaticRequest(event.request));
    }
});

// 정적 파일 요청 처리
async function handleStaticRequest(request) {
    try {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        const response = await fetch(request);
        if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        }

        return response;
    } catch (error) {
        console.error(`Failed to fetch static resource: ${request.url}`, error);
        return caches.match(OFFLINE_PAGE);
    }
}