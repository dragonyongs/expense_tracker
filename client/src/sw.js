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
// let accessToken = null;
// self.addEventListener('message', (event) => {
//     if (event.data.action === 'setToken') {
//         accessToken = event.data.token; // 메인 스크립트에서 받은 액세스 토큰 저장
//     }
// });

// Fetch 이벤트
// self.addEventListener("fetch", (event) => {
//     if (event.request.url.includes("/api/")) {
//         const cookies = event.request.headers.get('Cookie');
//         const token = getCookie('accessToken', cookies); // 쿠키에서 액세스 토큰 가져오기

//         const headers = new Headers(event.request.headers);
        
//         if (token) {
//             headers.append('Authorization', `Bearer ${token}`); // 토큰 추가
//         }

//         const modifiedRequest = new Request(event.request, {
//             headers: headers,
//         });

//         event.respondWith(
//             fetch(modifiedRequest)
//             .then((response) => {
//                 if (response.ok) {
//                     return response.clone().json().then(data => {
//                         if (data && data.id) { // 데이터 객체에 id가 있는지 확인
//                             return addData(data.id, data).then(() => response); // 데이터 추가 후 원본 응답 반환
//                         } else {
//                             console.error("Data does not contain an 'id' field:", data);
//                             return response; // 'id'가 없으면 응답 반환
//                         }
//                     });
//                 }
//                 return response; // 원본 응답 반환
//             })
//             .catch(() => {
//                 // 네트워크 오류 발생 시 IndexedDB에서 데이터 가져오기
//                 return getData('api_data').then(data => {
//                     if (data) {
//                         return new Response(JSON.stringify(data), {
//                             headers: { 'Content-Type': 'application/json' }
//                         });
//                     }
//                     return new Response('No data available', { status: 404 });
//                 });
//             })
//         );
//     }
// });

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
                        console.log("API data received:", data); // API 응답 로그
                        if (data && data.id) { // 데이터 객체에 id가 있는지 확인
                            return addData(data.id, data).then(() => response); // 데이터 추가 후 원본 응답 반환
                        } else {
                            console.error("Data does not contain an 'id' field:", data);
                            return response; // 'id'가 없으면 응답 반환
                        }
                    });
                }
                return response; // 원본 응답 반환
            })
            .catch(() => {
                // 네트워크 오류 발생 시 IndexedDB에서 데이터 가져오기
                console.warn("Network error, trying to fetch data from IndexedDB");
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

        event.respondWith(
            fetch(modifiedRequest)
            .then((response) => {
                if (response.ok) {
                    return response.clone().json().then(data => {
                        console.log("API data received:", data); // API 응답 로그
        
                        // 데이터가 배열인 경우 처리
                        if (Array.isArray(data)) {
                            console.log("Received array data");

                            return Promise.all(data.map(item => {
                                const id = item._id || item.id; // 적절한 ID 필드 사용
                                if (id) {
                                    console.log("Storing item with id:", id); // 저장할 ID 로그
                                    return addData(id, { ...item, id: id }); // id 필드를 추가하여 데이터 저장
                                } else {
                                    console.error("No ID available for item:", item);
                                    return Promise.resolve(); // ID가 없는 경우, 계속 진행
                                }
                            })).then(() => response); // 모든 데이터 저장 후 원본 응답 반환
                        }
        
                        // 단일 객체 처리
                        const id = data._id || data.id; // 적절한 ID 필드 사용
                        if (id) {
                            console.log("Storing single item with id:", id); // 저장할 ID 로그
                            return addData(id, { ...data, id: id }).then(() => response); // id 필드를 추가하여 데이터 저장
                        } else {
                            console.error("Data does not contain an 'id' field:", data);
                            return response; // 'id'가 없으면 원본 응답 반환
                        }
                    });
                }
                return response; // 원본 응답 반환
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

// self.addEventListener("fetch", (event) => {
//     if (event.request.url.includes("/api/")) {
//         const headers = new Headers(event.request.headers);
        
//         if (accessToken) {
//             headers.append('Authorization', `Bearer ${accessToken}`); // 헤더에 인증 토큰 추가
//         }

//         const modifiedRequest = new Request(event.request, {
//             headers: headers,
//         });

//         event.respondWith(
//             fetch(modifiedRequest)
//             .then((response) => {
//                 if (response.ok) {
//                     // 성공적으로 응답받으면 IndexedDB에 저장
//                     return response.clone().json().then(data => {
//                         addData('api_data', data); // 'api_data'라는 스토리지에 데이터 추가
//                         return response;
//                     });
//                 }
//                 return response;
//             })
//             .catch(() => {
//                 // 네트워크 오류가 발생한 경우 IndexedDB에서 데이터 가져오기
//                 return getData('api_data').then(data => {
//                     if (data) {
//                         return new Response(JSON.stringify(data), {
//                             headers: { 'Content-Type': 'application/json' }
//                         });
//                     }
//                     return new Response('No data available', { status: 404 });
//                 });
//             })
//         );
//     }
// });