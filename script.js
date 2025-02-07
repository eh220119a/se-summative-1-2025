let storedNames = [];
let pickHistory = [];
let globalBlacklist = JSON.parse(localStorage.getItem("globalBlacklist")) || []; // Use localStorage fallback

document.addEventListener("DOMContentLoaded", function () {
    const notificationMessage = document.getElementById("notification-message");
    const weekHostsRow = document.getElementById("week-hosts");

    function getFormattedDate(daysAhead = 0) {
        const date = new Date();
        date.setDate(date.getDate() + daysAhead);
        return date.toISOString().split("T")[0]; // Format YYYY-MM-DD
    }

    function getDayOfWeek(daysAhead = 0) {
        const date = new Date();
        date.setDate(date.getDate() + daysAhead);
        return date.toLocaleString("en-us", { weekday: "long" });
    }

    function displayTodaysHost(schedule) {
        const today = getFormattedDate();
        const todayEntry = schedule.find(entry => entry.date && entry.date.trim() === today);
    
        console.log("Today's Date:", today);
        console.log("Today’s Entry:", todayEntry);
    
        if (todayEntry && todayEntry.host) {
            notificationMessage.textContent = `Today's stand-up host: ${todayEntry.host}`;
        } else {
            notificationMessage.textContent = "No stand-up scheduled for today.";
        }
    }
    

    function fetchBlacklist() {
        notificationMessage.textContent = "Loading blacklist..."; // Show loading message
    
        fetch("blacklist.csv")
            .then(response => {
                if (!response.ok) {
                    console.warn("Blacklist file not found. Using localStorage.");
                    return Promise.reject("Blacklist file missing.");
                }
                return response.text();
            })
            .then(csvText => {
                const data = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;
                globalBlacklist = data.map(entry => entry.day.trim());
                localStorage.setItem("globalBlacklist", JSON.stringify(globalBlacklist)); // Save to localStorage
                console.log("Global Blacklist:", globalBlacklist);
                notificationMessage.textContent = "Blacklist Loaded Successfully!";
                fetchSchedule();
            })
            .catch(error => {
                console.error("Error loading blacklist:", error);
                notificationMessage.textContent = "Error loading blacklist.";
                fetchSchedule(); // Proceed with fetching schedule even if blacklist is missing
            });
    }
    function fetchSchedule() {
        notificationMessage.textContent = "Loading..."; 
    
        fetch("data.csv")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to load data.csv");
                }
                return response.text();
            })
            .then(csvText => {
                const data = Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                }).data;
    
                if (typeof displayTodaysHost === "function") {
                    displayTodaysHost(data);
                } else {
                    console.error("displayTodaysHost function is missing.");
                }
    
                displayWeekSchedule(data);
            })
            .catch(error => {
                console.error("Error fetching CSV:", error);
                notificationMessage.textContent = "Error loading schedule.";
            });
    }

    function displayWeekSchedule(schedule) {
        weekHostsRow.innerHTML = "";

        for (let i = 0; i < 7; i++) {
            const date = getFormattedDate(i);
            const weekday = getDayOfWeek(i);

            if (globalBlacklist.includes(weekday)) {
                const cell = document.createElement("td");
                cell.innerHTML = `<span style="color: red;">Blacklisted</span>`;
                weekHostsRow.appendChild(cell);
                continue;
            }

            const entry = schedule.find(row => row.date.trim() === date);
            const host = entry ? entry.host : "No host assigned";

            const cell = document.createElement("td");
            cell.textContent = host;
            weekHostsRow.appendChild(cell);
        }
    }

    function updateBlacklist() {
        const blacklistInput = document.getElementById("blacklistInput").value.trim();
        if (!blacklistInput) return;

        if (!globalBlacklist.includes(blacklistInput)) {
            globalBlacklist.push(blacklistInput);
            localStorage.setItem("globalBlacklist", JSON.stringify(globalBlacklist));
            saveBlacklistToFile();
            displayBlacklist();
        } else {
            alert("This day is already blacklisted.");
        }
    }

    function saveBlacklistToFile() {
        let csvContent = "day\n" + globalBlacklist.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "blacklist.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function displayBlacklist() {
        const blacklistList = document.getElementById("blacklistDays");
        blacklistList.innerHTML = "";
        
        globalBlacklist.forEach(day => {
            const li = document.createElement("li");
            li.textContent = day;
            blacklistList.appendChild(li);
        });
    }

    fetchBlacklist();
});
