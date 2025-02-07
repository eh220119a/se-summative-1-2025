let storedNames = []; // Stores names & availability
let pickHistory = JSON.parse(localStorage.getItem("pickHistory")) || []; // Track recent picks

document.addEventListener("DOMContentLoaded", function () {
    loadExistingData(); // Load previous names if available
    fetchSchedule(); // Load the schedule and display in a 2-week table
});


// Function to add a new row for a person (Defaults: Mon-Fri checked, Sat-Sun unchecked)
function addPerson(name = "", availableDays = []) {
    const nameList = document.getElementById("nameList");

    // Prevent duplicate input rows
    if (storedNames.some(p => p.name === name)) {
        console.warn(`Duplicate entry detected: ${name}`);
        return;
    }

    const div = document.createElement("div");
    div.classList.add("person-entry");

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Enter name";
    nameInput.value = name; // Use existing data if available

    div.appendChild(nameInput);

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    days.forEach(day => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = day;

        // Default: Mon-Fri checked, Sat-Sun unchecked
        checkbox.checked = availableDays.length > 0 ? availableDays.includes(day) : !["Saturday", "Sunday"].includes(day);

        div.appendChild(checkbox);
        div.appendChild(document.createTextNode(day + " "));
    });

    nameList.appendChild(div);
}

// Load existing names from `data.csv`
function loadExistingData() {
    fetch("data.csv")
        .then(response => response.text())
        .then(csvText => {
            console.log("Raw CSV Data (Names Load):", csvText); 

            const data = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;

            console.log("Parsed CSV Data (Names):", data); 
            if (!data || data.length === 0) {
                console.warn("Parsed CSV is empty.");
                return;
            }

            // Ensure we only process name entries, not the schedule
            storedNames = data
                .filter(entry => entry.name && entry.name.trim() !== "") // Exclude empty rows
                .map(entry => ({
                    name: entry.name.trim(),
                    availableDays: entry.availableDays ? entry.availableDays.split(" ") : []
                }));

            console.log("Stored Names:", storedNames); // 

            // Clear only the input fields and re-populate
            const nameList = document.getElementById("nameList");
            nameList.innerHTML = ""; // Clear previous input fields

            storedNames.forEach(person => addPerson(person.name, person.availableDays));

            alert("Names successfully loaded from CSV!");
        })
        .catch(error => console.warn("No existing data.csv found", error));
}


// Function to randomise schedule fairly, prioritizing people who haven't been picked
function randomiseSchedule() {
    const entries = document.querySelectorAll(".person-entry");
    storedNames = [];

    entries.forEach(entry => {
        const name = entry.querySelector("input[type='text']").value.trim();
        const checkboxes = entry.querySelectorAll("input[type='checkbox']:checked");

        const availableDays = Array.from(checkboxes).map(cb => cb.value);
        if (name && availableDays.length > 0) {
            storedNames.push({ name, availableDays });
        }
    });

    let schedule = generateBalancedSchedule(storedNames);
    saveToCSV(schedule);
}

// Generate a balanced 2-week schedule (Monday1-Friday2, ensuring fairness)
function generateBalancedSchedule(storedNames) {
    const days = [
        "Monday1", "Tuesday1", "Wednesday1", "Thursday1", "Friday1",
        "Monday2", "Tuesday2", "Wednesday2", "Thursday2", "Friday2"
    ];
    
    let schedule = [];
    let assigned = {}; // Track how many times a person is assigned
    storedNames.forEach(person => (assigned[person.name] = 0));

    days.forEach(day => {
        let available = storedNames.filter(p => 
            p.availableDays.includes(day.replace(/\d/, "")) && assigned[p.name] < 2 && !pickHistory.includes(p.name)
        );

        // If all names have been used, reset history
        if (available.length === 0) {
            pickHistory = [];
            localStorage.setItem("pickHistory", JSON.stringify(pickHistory));
            available = storedNames.filter(p => p.availableDays.includes(day.replace(/\d/, "")));
        }

        if (available.length > 0) {
            let chosen = available[Math.floor(Math.random() * available.length)];
            assigned[chosen.name]++;
            pickHistory.push(chosen.name);
            schedule.push({ day: day, host: chosen.name });
        } else {
            schedule.push({ day: day, host: "No host assigned" });
        }
    });

    localStorage.setItem("pickHistory", JSON.stringify(pickHistory)); // Save updated history
    return schedule;
}


function fetchSchedule() {
    fetch("data.csv")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load data.csv: ${response.status}`);
            }
            return response.text();
        })
        .then(csvText => {
            console.log("✅ Raw CSV Data (Schedule Load):", csvText);

            const data = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;

            console.log("✅ Parsed CSV Data:", data);

            if (!data || data.length === 0) {
                console.error("❌ Parsed CSV is empty.");
                document.getElementById("notification-message").textContent = "❌ Schedule file is empty.";
                return;
            }

            displayTwoWeekSchedule(data);
            displayTodaysHost(data);
        })
        .catch(error => {
            console.error("❌ Error fetching CSV:", error);
            document.getElementById("notification-message").textContent = "❌ Failed to load schedule.";
        });
}
function getFormattedToday() {
    const today = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const weekday = dayNames[today.getDay()]; // Get full weekday name (e.g., "Monday")
    
    // Determine Week 1 or Week 2 based on the current date range
    const isWeek1 = today.getDate() % 14 < 7; // Ensures proper alternation between weeks

    return `${weekday}${isWeek1 ? "1" : "2"}`;
}
document.getElementById("csvUpload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) {
        alert("No file selected.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvText = e.target.result;
        localStorage.setItem("csvData", csvText); // 
        alert("✅ Names uploaded! (Stored temporarily in browser)");
        fetchSchedule(); // 
    };
    reader.readAsText(file);
});

function fetchSchedule() {
    const csvText = localStorage.getItem("csvData"); 

    if (!csvText) {
        console.warn("⚠ No CSV data found in localStorage.");
        return;
    }

    const data = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;

    if (!data || data.length === 0) {
        console.error("❌ Parsed CSV is empty.");
        document.getElementById("notification-message").textContent = "❌ No schedule found.";
        return;
    }

    
    displayTwoWeekSchedule(data);

    
    displayTodaysHost(data);
}
function displayTodaysHost(schedule) {
    const notificationMessage = document.getElementById("notification-message");
    if (!notificationMessage) return;

    const today = getFormattedToday();
    console.log(`Checking schedule for: ${today}`);

   
    const todayEntry = schedule.find(entry => entry.day && entry.day.trim() === today);

    if (todayEntry && todayEntry.host) {
        notificationMessage.textContent = `Today's stand-up host: ${todayEntry.host}`;
    } else {
        notificationMessage.textContent = "No stand-up scheduled today.";
    }
}
// Display a 2-week schedule in table format
function displayTwoWeekSchedule(schedule) {
    const week1Row = document.getElementById("week1-hosts");
    const week2Row = document.getElementById("week2-hosts");

    week1Row.innerHTML = ""; // Clear Week 1 row
    week2Row.innerHTML = ""; // Clear Week 2 row

    const week1Days = ["Monday1", "Tuesday1", "Wednesday1", "Thursday1", "Friday1", "Saturday1", "Sunday1"];
    const week2Days = ["Monday2", "Tuesday2", "Wednesday2", "Thursday2", "Friday2", "Saturday2", "Sunday2"];

    week1Days.forEach(day => {
        const td = document.createElement("td");
        const entry = schedule.find(row => row.day && row.day.trim() === day);
        td.textContent = entry ? entry.host : "No host assigned";
        week1Row.appendChild(td);
    });

    week2Days.forEach(day => {
        const td = document.createElement("td");
        const entry = schedule.find(row => row.day && row.day.trim() === day);
        td.textContent = entry ? entry.host : "No host assigned";
        week2Row.appendChild(td);
    });

    console.log("Upcoming Stand-Up Schedule Updated ✅");
}


function saveToCSV(schedule) {
    let csvContent = "day,host\n" + schedule.map(row => `${row.day},${row.host}`).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    fetchSchedule(); 
}
