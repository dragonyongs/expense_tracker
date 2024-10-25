const dbName = "StarRich";
const storeName = "StarRichStore";

// IndexedDB 열기
const openDatabase = () => {
    return new Promise((resolve, reject) => {
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
            console.log("Database opened successfully.");
            resolve(event.target.result);
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
        const db = await openDatabase();
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        // 데이터 객체에 key를 추가 (keyPath가 id로 설정되었을 경우)
        const dataWithKey = { ...data, id: key || data.id || data._id };

        // keyPath에 해당하는 id 값이 없는 경우 처리
        if (!dataWithKey.id) {
            throw new Error("ID is required to store data in IndexedDB.");
        }

        // 데이터 추가 또는 업데이트
        const request = store.put(dataWithKey);

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