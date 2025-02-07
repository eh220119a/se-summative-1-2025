 
let storedNames = [];
let pickHistory = [];
let blacklist = {};

function loadCSV() {
    let fileInput = document.getElementById("csvUpload").files[0];
    let reader = new FileReader();

    reader.onload = function(event) {
        let csvText = event.target.result;
        storedNames = parseCSV(csvText);
        console.log("Loaded names:", storedNames);
    };

    reader.readAsText(fileInput);
}

function parseCSV(csvText) {
    let rows = csvText.split("\n");
    return rows.map(row => {
        let [name, days] = row.split(",");
        return { name: name.trim(), blacklist: days ? days.trim().split(" ") : [] };
    });
}

function getTodayHost() {
    let today = new Date();
    let dayName = today.toLocaleString('en-us', { weekday: 'long' });

    let selectedHost = pickHost(storedNames, pickHistory, dayName);
    document.getElementById("hostDisplay").innerText = `Today's Host: ${selectedHost}`;
}

function pickHost(names, history, currentDay) {
    let eligible = names.filter(person => !person.blacklist.includes(currentDay));
    let remaining = eligible.filter(p => !history.includes(p.name));

    if (remaining.length === 0) {
        history.length = 0;
        remaining = eligible;
    }

    let chosen = remaining[Math.floor(Math.random() * remaining.length)];
    history.push(chosen.name);
    return chosen.name;
}

function updateBlacklist() {
    let blacklistInput = document.getElementById("blacklist").value;
    let days = blacklistInput.split(",").map(day => day.trim());

    localStorage.setItem("blacklist", JSON.stringify(days));
    alert("Blacklist updated!");
}

document.addEventListener("DOMContentLoaded", function() {
    // Function to get today's date in YYYY-MM-DD format
    function getFormattedTodayDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  
    // Function to determine today's host
    function getTodaysHost() {
      const schedule = {
        "2025-02-07": "Alice",
        "2025-02-08": "Bob",
        "2025-02-09": "Charlie",
      };
  
      const today = getFormattedTodayDate();
      return schedule[today] || "No stand-up scheduled for today.";
    }
  
    const notificationMessage = document.getElementById("notification-message");
    notificationMessage.textContent = `Today's stand-up host: ${getTodaysHost()}`;
  });
  