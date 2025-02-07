
const { processSchedule } = require("../script");

describe("processSchedule", () => {
    test("correctly processes and updates the schedule", () => {
        document.body.innerHTML = `<div id="week1-hosts"></div><div id="week2-hosts"></div>`;
        const csvText = "day,host\nMonday1,Alice\nTuesday1,Bob";
        processSchedule(csvText);
        expect(document.getElementById("week1-hosts").textContent).toContain("Alice");
        expect(document.getElementById("week1-hosts").textContent).toContain("Bob");
    });
});
