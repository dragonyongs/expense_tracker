import { precacheAndRoute } from 'workbox-precaching';
import { addData, getData } from './utils/db'; // db.js에서 관련 함수 import

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
        const cookies = event.request.headers.get('Cookie');
        const token = getCookie('accessToken', cookies); // 쿠키에서 액세스 토큰 가져오기

        const headers = new Headers(event.request.headers);
        
        if (token) {
            headers.append('Authorization', `Bearer ${token}`); // 토큰 추가
        }

        const modifiedRequest = new Request(event.request, {
            headers: headers,
        });

        event.respondWith(
            fetch(modifiedRequest)
            .then((response) => {
                if (response.ok) {
                    return response.clone().json().then(data => {
                        // 데이터가 배열인 경우 처리
                        if (Array.isArray(data)) {
                            return Promise.all(data.map(item => {
                                const id = item._id || item.id; // 적절한 ID 필드 사용
                                if (id) {
                                    return addData(id, { ...item, id: id }); // id 필드를 추가하여 데이터 저장
                                } else {
                                    return Promise.resolve(); // ID가 없는 경우, 계속 진행
                                }
                            })).then(() => response); // 모든 데이터 저장 후 원본 응답 반환
                        }
        
                        // 단일 객체 처리
                        const id = data._id || data.id; // 적절한 ID 필드 사용
                        if (id) {
                            return addData(id, { ...data, id: id }).then(() => response); // id 필드를 추가하여 데이터 저장
                        } else {
                            return response; // 'id'가 없으면 원본 응답 반환
                        }
                    });
                }
                return response; // 원본 응답 반환
            })
        );
        
    } else {
        // API 요청이 아닌 경우 캐시에서 응답
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse; // 캐시가 있으면 캐시 반환
                    }
                    return fetch(event.request).catch(() => {
                        // 네트워크 요청이 실패했을 때 오프라인 페이지 제공
                        return caches.match('/offline.html'); // 오프라인 페이지 제공
                    });
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