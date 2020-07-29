let db;
//New database store called budget
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
   //Create object
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  //Check app online status
  if (navigator.onLine) {
    checkDatabase();
  }
};

//Console log error code
request.onerror = function(event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  //Create transaction in pending
  const transaction = db.transaction(["pending"], "readwrite");

  //Access pending
  const store = transaction.objectStore("pending");

  //Add record to pending
  store.add(record);
}

function checkDatabase() {
  //Create transaction in pending
  const transaction = db.transaction(["pending"], "readwrite");
  //Access pending
  const store = transaction.objectStore("pending");
  //Set all records to in store to a variable called getAll
  const getAll = store.getAll();

  //Run function if getAll store retrieval is successful
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        //If successful, open a transaction in pending
        const transaction = db.transaction(["pending"], "readwrite");

        //Access transaction object store
        const store = transaction.objectStore("pending");

        //Clear items stored in store variable
        store.clear();
      });
    }
  };
}

//Event listener to see if the database is online
window.addEventListener("online", checkDatabase);