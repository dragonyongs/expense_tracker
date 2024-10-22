const dbName = "StarRich";
const storeName = "StarRichStore";

// IndexedDB 열기
const openDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "id" }); // id를 키로 사용하는 객체 저장소 생성
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

// 데이터 추가 함수
const addData = async (data) => {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.add(data); // 데이터 추가

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
            resolve("Data added successfully");
        };
        transaction.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

// 데이터 가져오기 함수
const getData = async (id) => {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

// 데이터 삭제 함수
const deleteData = async (id) => {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.delete(id);

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
            resolve("Data deleted successfully");
        };
        transaction.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

export { addData, getData, deleteData };