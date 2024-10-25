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
                resolve(dataWithKey.id); // 추가된 데이터의 ID 반환
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
        
        if (!key) {
            console.error('No key specified');
            return null;  // 키가 없을 경우 null 반환
        }

        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = (event) => {
                const data = event.target.result;
                if (data) {
                    resolve(data);  // 데이터를 성공적으로 가져옴
                } else {
                    console.warn('No data found for key:', key);
                    resolve(null);  // 키에 해당하는 데이터가 없을 경우 null 반환
                }
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
                resolve(id); // 삭제된 데이터의 ID 반환
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