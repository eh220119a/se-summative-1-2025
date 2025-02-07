let storedNames = [];
let pickHistory = [];
let blacklist = {};

document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("csvUpload");
    const notificationMessage = document.getElementById("notification-message");

    // Function to get today's date in YYYY-MM-DD format
    function getFormattedTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Fetch and parse the CSV file from local-server
    function fetchSchedule() {
        fetch("data.csv") // Fetch from the same folder
            .then(response => response.text())
            .then(csvText => {
                console.log("Fetched CSV:", csvText); // Debugging output

                const data = Papa.parse(csvText, { 
                    header: true, 
                    dynamicTyping: true,
                    skipEmptyLines: true
                }).data;

                displayTodaysHost(data);
            })
            .catch(error => {
                console.error("Error fetching CSV:", error);
                notificationMessage.textContent = "Error loading schedule.";
            });
    }

    // Function to read and process manually uploaded CSV file
    function loadCSV(event) {
        const file = event.target.files[0];
        if (!file) {
            notificationMessage.textContent = "No file selected.";
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const csvText = e.target.result;
            console.log("Uploaded CSV:", csvText); // Debugging output

            // Parse CSV file
            const data = Papa.parse(csvText, { 
                header: true, 
                dynamicTyping: true, 
                skipEmptyLines: true 
            }).data;

            // Display today's host from uploaded CSV
            displayTodaysHost(data);
        };

        reader.readAsText(file);
    }

    // Function to display today's stand-up host
    function displayTodaysHost(schedule) {
        const today = getFormattedTodayDate();
        console.log("Today's Date:", today);
        console.log("Schedule Data:", schedule);

        const todayEntry = schedule.find(entry => entry.date.trim() === today);

        if (todayEntry && todayEntry.host) {
            notificationMessage.textContent = `Today's stand-up host: ${todayEntry.host}`;
        } else {
            notificationMessage.textContent = "No stand-up scheduled for today.";
        }
    }

    // Listen for file uploads
    fileInput.addEventListener("change", loadCSV);

    // Fetch the CSV automatically on page load
    fetchSchedule();
});

// ---------- Existing Functions for Stand-up Selection ----------
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
