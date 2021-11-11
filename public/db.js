let db;
// let budgetVersion;

//create a new db request for a 'budgetDatabase'
const request = window.indexedDB.open("budgetDatabase", 1);
request.onupgradeneeded = function (event) {
  //   const { oldVersion } = event;
  //   const newVersion = event.newVersion || db.version;

  //   console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);
  //   if (db.objectStoreNames.length === 0) {
  db = event.target.result;
  db.createObjectStore("budgetDatabase", { autoIncrement: true });
};
request.onerror = function (event) {
  console.log(`Opp! ${event.target.errorCode}`);
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

function checkDatabase() {
  const transaction = db.transaction(["budgetDatabase"], "readwrite");
  const store = transaction.objectStore("budgetDatabase");
  const getAll = store.getAll();
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          transaction = db.transaction(["budgetDatabase"], "readwrite");
          const currentStore = transaction.objectStore("budgetDatabase");
          currentStore.clear();
        });
    }
  };
}
const saveRecord = (record) => {
  const transaction = db.transaction(["budgetDatabase"], "readwrite");
  const store = transaction.objectStore("budgetDatabase");
  store.add(record);
};

// Listen for app coming back online
window.addEventListener("online", checkDatabase);
