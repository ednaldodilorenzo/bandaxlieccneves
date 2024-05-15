function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("musicdb", 1);

    request.onerror = function (event) {
      reject("Database error: " + event.target.errorCode);
    };

    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    // Ensure the object store exists during onupgradeneeded event
    request.onupgradeneeded = function (event) {
      let db = event.target.result;
      if (!db.objectStoreNames.contains("mp3Files")) {
        db.createObjectStore("mp3Files", { keyPath: "id" });
      }
    };
  });
}

export function downloadMP3WithProgress(url, onProgress) {
  // Fetch the MP3 file
  return fetch(url).then((response) => {
    const contentLength = response.headers.get("Content-Length");
    if (!response.body || !contentLength) {
      throw new Error("Response does not support streaming");
    }

    const total = parseInt(contentLength, 10);
    let loaded = 0;

    // Create a reader
    const reader = response.body.getReader();
    const stream = new ReadableStream({
      start(controller) {
        // The following function handles each chunk of data
        function push() {
          // "done" is a boolean and "value" is a chunk of data
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                // When no more data needs to be consumed, close the stream
                controller.close();
                return;
              }
              // Enqueue the next chunk in the stream
              loaded += value.byteLength;
              onProgress(loaded, total);
              controller.enqueue(value);
              push();
            })
            .catch((error) => {
              console.error("Error reading the stream", error);
              controller.error(error);
            });
        }

        push();
      },
    });

    return new Response(stream, { headers: response.headers });
  });
}

export function saveMP3ToDB(blob, id) {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      let transaction = db.transaction("mp3Files", "readwrite");
      let store = transaction.objectStore("mp3Files");
      let mp3File = {
        id: id,
        file: blob,
      };

      let request = store.add(mp3File);
      request.onsuccess = function () {
        resolve();
      };
      request.onerror = function (event) {
        reject("Error trying to sabe mp3 to db");
      };
    });
  });
}

export function getDownloadedIds() {
    return openDatabase().then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['mp3Files'], 'readonly');
            const store = transaction.objectStore('mp3Files');
            const request = store.openCursor();
            const ids = [];

            request.onsuccess = function(event) {
                let cursor = event.target.result;
                if (cursor) {
                    ids.push(cursor.key);  // Add the key to the array
                    cursor.continue();  // Move to the next object in the store
                } else {
                    // No more entries
                    resolve(ids);
                }
            };

            request.onerror = function(event) {
                reject('Error in fetching IDs: ' + event.target.errorCode);
            };
        });
    });
}

export function getMP3FromDB(id) {
    return openDatabase().then(db => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['mp3Files'], 'readonly');
            const store = transaction.objectStore('mp3Files');
            const request = store.get(id);

            request.onsuccess = function() {
                if (request.result) {
                    resolve(request.result.file);
                } else {
                    reject('No file found with ID: ' + id);
                }
            };

            request.onerror = function(event) {
                reject('Error fetching file: ' + event.target.errorCode);
            };
        });
    });
}

export function deleteRecord(id) {
  return openDatabase().then(db => {
      return new Promise((resolve, reject) => {
          const transaction = db.transaction(['mp3Files'], 'readwrite');
          const store = transaction.objectStore('mp3Files');
          const request = store.delete(id);

          request.onsuccess = function() {
              console.log(`Record with ID ${id} has been deleted successfully.`);
              resolve();
          };

          request.onerror = function(event) {
              console.error('Error deleting record:', event.target.errorCode);
              reject(event.target.errorCode);
          };
      });
  });
}