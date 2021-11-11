let db;
// let budgetVersion;

//create a new db request for a 'budgetDatabase'
const request = window.indexedDB.open("budgetDatabase", 1);
request.onupgradeneeded = ({ target }) => {
  const db = target.result;
  db.createObjectStore("budgetDatabase", { autoIncrement: true });
};
request.onerror = function (event) {
  console.log(`Opp! ${event.target.errorCode}`);
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

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

const saveRecord = (record) => {
  const transaction = db.transaction(["budgetDatabase"], "readwrite");
  const store = transaction.objectStore("budgetDatabase");
  store.add(record);
};

// Listen for app coming back online
window.addEventListener("online", checkDatabase);
