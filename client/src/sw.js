import { precacheAndRoute } from 'workbox-precaching';
import { addData, getData, deleteData } from './utils/db'; // db.js에서 관련 함수 import

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

// 메시지 리스너: 메인 스크립트에서 액세스 토큰 수신
let accessToken = null;
self.addEventListener('message', (event) => {
    if (event.data.action === 'setToken') {
        accessToken = event.data.token; // 메인 스크립트에서 받은 액세스 토큰 저장
    }
});

// Fetch 이벤트
self.addEventListener("fetch", (event) => {
    if (event.request.url.includes("/api/")) {
        const headers = new Headers(event.request.headers);
        
        if (accessToken) {
            headers.append('Authorization', `Bearer ${accessToken}`); // 헤더에 인증 토큰 추가
        }

        const modifiedRequest = new Request(event.request, {
            headers: headers,
        });

        event.respondWith(
            fetch(modifiedRequest)
            .then((response) => {
                if (response.ok) {
                    // 성공적으로 응답받으면 IndexedDB에 저장
                    return response.clone().json().then(data => {
                        addData('api_data', data); // 'api_data'라는 스토리지에 데이터 추가
                        return response;
                    });
                }
                return response;
            })
            .catch(() => {
                // 네트워크 오류가 발생한 경우 IndexedDB에서 데이터 가져오기
                return getData('api_data').then(data => {
                    if (data) {
                        return new Response(JSON.stringify(data), {
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    return new Response('No data available', { status: 404 });
                });
            })
        );
    }
});