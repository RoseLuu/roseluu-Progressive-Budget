let db;

//create a new db request for a 'budgetDatabase'
const request = indexedDB.open("BudgetDatabase", 1);

request.onupgradeneeded = ({ target }) => {
  const db = target.result;
  db.createObjectStore("BudgetStore", { autoIncrement: true });
};

function checkDatabase() {
  // Open a transaction on your BudgetStore db
  let transaction = db.transaction(["BudgetStore"], "readwrite");
  // access your BudgetStore object
  const store = transaction.objectStore("BudgetStore");
  // Get all records from store and set to a variable
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
        .then((res) => {
          console.log(res);
          // If returned response is not empty
          if (res.length !== 0) {
            //open another transaction to BudgetStore with ability to read and write
            transaction = db.transaction(["BudgetStore"], "readwrite");
            //assign current store to a variable
            const currentStore = transaction.objectStore("BudgetStore");
            console.log(currentStore);
            //this will delete everything in the database
            currentStore.clear();
            console.log("Clearing store");
          }
        });
    }
  };
}

request.onsuccess = function (event) {
  db = event.target.result;
  //check if app is online before reading from db
  if (navigator.onLine) {
    console.log("Back to Online");
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log(`Opp! ${event.target.errorCode}`);
};

const saveRecord = (record) => {
  //open another transaction to BudgetStore with ability to read and write
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  //Access BudgetStore object store
  const store = transaction.objectStore("BudgetStore");
  //Add record to store with add method
  store.add(record);
};

// Listen for app coming back online
window.addEventListener("online", checkDatabase);
