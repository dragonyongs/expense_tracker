import { precacheAndRoute } from 'workbox-precaching';
import { addData, getData } from './utils/db'; // db.js에서 관련 함수 import

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
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME]; // 유지할 캐시 이름을 정의
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) { // 화이트리스트에 없는 캐시 삭제
                        console.log(`Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.url.includes("/api/")) {
        // API 요청을 위한 Stale-While-Revalidate 전략
        const cookies = event.request.headers.get('Cookie');
        const token = getCookie('accessToken', cookies);

        const headers = new Headers(event.request.headers);
        if (token) {
            headers.append('Authorization', `Bearer ${token}`);
        }

        const modifiedRequest = new Request(event.request, {
            headers: headers,
        });

        event.respondWith(
            caches.match(modifiedRequest)
                .then((cachedResponse) => {
                    const fetchPromise = fetch(modifiedRequest)
                        .then((response) => {
                            if (response.ok) {
                                const clonedResponse = response.clone();
                                clonedResponse.json().then(data => {
                                    if (Array.isArray(data)) {
                                        // 배열 데이터 저장
                                        Promise.all(data.map(item => {
                                            const id = item._id || item.id;
                                            if (id) {
                                                return addData(id, { ...item, id: id });
                                            } else {
                                                return Promise.resolve();
                                            }
                                        }));
                                    } else {
                                        // 단일 객체 데이터 저장
                                        const id = data._id || data.id;
                                        if (id) {
                                            addData(id, { ...data, id: id });
                                        }
                                    }
                                });
                                return response;
                            }
                            return response;
                        })
                        .catch(async () => {
                            // 네트워크 요청이 실패했을 때 IndexedDB에서 데이터 가져오기
                            const cachedData = await getData();
                            if (cachedData.length > 0) {
                                // IndexedDB 데이터가 있으면 이를 반환
                                return new Response(JSON.stringify(cachedData), {
                                    headers: { "Content-Type": "application/json" }
                                });
                            } else {
                                // IndexedDB 데이터가 없으면 오프라인 페이지 반환
                                return caches.match('/offline.html');
                            }
                        });

                    // 캐시된 데이터 먼저 반환하고, 백그라운드에서 새 데이터를 가져옴
                    return cachedResponse || fetchPromise;
                })
        );

    } else {
        // 일반 요청에 대한 Stale-While-Revalidate 전략
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    const fetchPromise = fetch(event.request)
                        .then((response) => {
                            // 최신 응답을 캐시에 저장
                            const clonedResponse = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, clonedResponse);
                            });
                            return response;
                        })
                        .catch(async () => {
                            // 네트워크 요청이 실패했을 때 IndexedDB에서 데이터 가져오기 시도
                            const cachedData = await getData();
                            if (cachedData.length > 0) {
                                // IndexedDB 데이터가 있으면 이를 반환
                                return new Response(JSON.stringify(cachedData), {
                                    headers: { "Content-Type": "application/json" }
                                });
                            } else {
                                // IndexedDB 데이터가 없으면 오프라인 페이지 반환
                                return caches.match('/offline.html');
                            }
                        });

                    // 캐시된 데이터 먼저 반환하고, 백그라운드에서 새 데이터를 가져옴
                    return cachedResponse || fetchPromise;
                })
        );
    }
});

// 쿠키에서 특정 이름의 값을 가져오는 함수
function getCookie(name, cookies) {
    const value = `; ${cookies}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}