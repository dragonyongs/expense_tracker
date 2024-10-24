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
const addData = async (key, data) => {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    // 데이터 객체에 key를 추가
    const dataWithKey = { ...data, id: key }; // key를 id로 설정

    // console.log("Storing data in IndexedDB:", dataWithKey); // 데이터 저장 전 로그

    // keyPath에 해당하는 id 값이 없는 경우를 처리
    if (!dataWithKey.id) {
        // console.error("No ID provided for data:", dataWithKey); // ID 없는 경우 에러 로그
        throw new Error("ID is required to store data in IndexedDB.");
    }

    store.put(dataWithKey); // 데이터 추가 또는 업데이트

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
            // console.log("Data successfully stored with id:", dataWithKey.id); // 저장 완료 로그
            resolve(dataWithKey.id); // 추가된 데이터의 ID 반환
        };
        transaction.onerror = (event) => {
            // console.error("Failed to store data in IndexedDB:", event.target.error); // 에러 로그
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
            resolve(id); // 삭제된 데이터의 ID 반환
        };
        transaction.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

export { addData, getData, deleteData };