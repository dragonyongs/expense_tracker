const dbName = "StarRich";
const storeName = "StarRichStore";

// IndexedDB 열기
let dbInstance = null; // 데이터베이스 인스턴스를 전역 변수로 저장

const openDatabase = () => {
    return new Promise((resolve, reject) => {
        // 이미 데이터베이스가 열려있으면 그 인스턴스를 사용
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            console.log("Upgrading database...");
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "id" });
                console.log(`Object store ${storeName} created.`);
            }
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result; // 연결된 데이터베이스 객체 저장
            console.log("Database opened successfully.");
            resolve(dbInstance);
        };

        request.onerror = (event) => {
            console.error("Error opening database:", event.target.error);
            reject(event.target.error);
        };
    });
};


// 데이터 추가 함수
const addData = async (key, data) => {
    try {
        if (typeof data !== 'object' || data === null) {
            throw new Error("Data should be an object.");
        }

        const db = await openDatabase().catch((error) => {
            console.error("Failed to open database:", error);
            throw new Error("Database connection failed");
        });

        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        // key와 data.id가 모두 없을 경우 오류를 던짐
        const dataWithKey = { ...data, id: key || data.id || data._id };

        if (!dataWithKey.id) {
            throw new Error("ID is required to store data in IndexedDB.");
        }

        // 데이터가 이미 존재하는지 확인
        const existingData = await store.get(dataWithKey.id);
        let request;

        if (existingData) {
            console.log("Data with the same key already exists, updating it.");
            request = store.put(dataWithKey); // 기존 데이터 업데이트
        } else {
            console.log("Adding new data.");
            request = store.add(dataWithKey); // 새로운 데이터 추가
        }

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve(dataWithKey.id);
            };
            request.onerror = (event) => {
                console.error("Error adding/updating data:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Failed to add data to IndexedDB:", error);
        throw error;
    }
};

// 데이터 가져오기 함수
const getData = async (key) => {
    try {
        const db = await openDatabase();
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        
        // key가 없으면 전체 데이터를 가져옴
        if (!key) {
            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = (event) => {
                    const data = event.target.result;
                    console.log("All data:", data); // 데이터 구조 로그
                    resolve(data || []); // 데이터가 없으면 빈 배열 반환
                };
                request.onerror = (event) => {
                    console.error("Error fetching all data:", event.target.error);
                    reject(event.target.error);
                };
            });
        }

        // 특정 키에 대한 데이터 가져오기
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = (event) => {
                const data = event.target.result;
                console.log(`Fetched data for key ${key}:`, data);
                resolve(data ? [data] : []); // 단일 데이터도 배열로 래핑하여 반환
            };
            request.onerror = (event) => {
                console.error("Error fetching data:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Failed to get data from IndexedDB:", error);
        throw error;
    }
};

// 데이터 삭제 함수
const deleteData = async (id) => {
    try {
        const db = await openDatabase();
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve(id);
            };
            request.onerror = (event) => {
                console.error("Error deleting data:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("Failed to delete data from IndexedDB:", error);
        throw error;
    }
};

export { addData, getData, deleteData };