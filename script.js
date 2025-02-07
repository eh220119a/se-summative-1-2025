let storedNames = [];
let pickHistory = JSON.parse(localStorage.getItem("pickHistory")) || [];

if (typeof localStorage !== "undefined") {
    pickHistory = JSON.parse(localStorage.getItem("pickHistory")) || [];
}

if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
        loadExistingData();
        fetchSchedule();
    });
}

function addPerson(name = "", availableDays = []) {
    const nameList = document.getElementById("nameList");

    if (storedNames.some(p => p.name === name)) {
        console.warn(`Duplicate entry detected: ${name}`);
        return;
    }

    const div = document.createElement("div");
    div.classList.add("person-entry");

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Enter name";
    nameInput.value = name;

    div.appendChild(nameInput);

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    days.forEach(day => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = day;
        checkbox.checked = availableDays.length > 0 ? availableDays.includes(day) : !["Saturday", "Sunday"].includes(day);
        div.appendChild(checkbox);
        div.appendChild(document.createTextNode(day + " "));
    });

    nameList.appendChild(div);
}

function loadExistingData() {
    fetch("data.csv")
        .then(response => response.text())
        .then(csvText => {
            const data = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;

            if (!data || data.length === 0) {
                console.warn("Parsed CSV is empty.");
                return;
            }

            storedNames = data
                .filter(entry => entry.name && entry.name.trim() !== "")
                .map(entry => ({
                    name: entry.name.trim(),
                    availableDays: entry.availableDays ? entry.availableDays.split(" ") : []
                }));

            const nameList = document.getElementById("nameList");
            nameList.innerHTML = "";
            storedNames.forEach(person => addPerson(person.name, person.availableDays));

            alert("Names successfully loaded from CSV!");
        })
        .catch(error => console.warn("No existing data.csv found", error));
}

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

function generateBalancedSchedule(storedNames) {
    const days = [
        "Monday1", "Tuesday1", "Wednesday1", "Thursday1", "Friday1",
        "Monday2", "Tuesday2", "Wednesday2", "Thursday2", "Friday2"
    ];
    
    let schedule = [];
    let assigned = {};
    storedNames.forEach(person => (assigned[person.name] = 0));

    days.forEach(day => {
        let available = storedNames.filter(p => 
            p.availableDays.includes(day.replace(/\d/, "")) && assigned[p.name] < 2 && !pickHistory.includes(p.name)
        );

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

    localStorage.setItem("pickHistory", JSON.stringify(pickHistory));
    return schedule;
}

function fetchSchedule() {
    const csvText = localStorage.getItem("csvData");

    if (!csvText) {
        fetch("data.csv")
            .then(response => response.text())
            .then(csvText => {
                localStorage.setItem("csvData", csvText);
                processSchedule(csvText);
            })
            .catch(error => {
                console.warn("⚠ No CSV data found in localStorage.");
            });
    } else {
        processSchedule(csvText);
    }
}

function processSchedule(csvText) {
    const data = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;

    if (!data || data.length === 0) {
        document.getElementById("notification-message").textContent = "❌ No schedule found.";
        return;
    }

    displayTwoWeekSchedule(data);
    displayTodaysHost(data);
}

function getFormattedToday() {
    const today = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weekday = dayNames[today.getDay()];
    const isWeek1 = today.getDate() % 14 < 7;
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
        localStorage.setItem("csvData", e.target.result);
        alert("✅ Names uploaded! (Stored temporarily in browser)");
        fetchSchedule();
    };
    reader.readAsText(file);
});

function displayTodaysHost(schedule) {
    const notificationMessage = document.getElementById("notification-message");
    if (!notificationMessage) return;

    const today = getFormattedToday();
    const todayEntry = schedule.find(entry => entry.day && entry.day.trim() === today);

    notificationMessage.textContent = todayEntry && todayEntry.host ? `Today's stand-up host: ${todayEntry.host}` : "No stand-up scheduled today.";
}

function displayTwoWeekSchedule(schedule) {
    const week1Row = document.getElementById("week1-hosts");
    const week2Row = document.getElementById("week2-hosts");

    week1Row.innerHTML = "";
    week2Row.innerHTML = "";

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

module.exports = {
    getFormattedToday,
    displayTodaysHost,
    processSchedule,
    fetchSchedule
};
