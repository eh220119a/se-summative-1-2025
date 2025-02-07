const { processSchedule } = require("../script");

global.Papa = {
    parse: jest.fn(() => ({
        data: [
            { day: "Monday1", host: "Alice" },
            { day: "Tuesday1", host: "Bob" }
        ]
    }))
};

describe("processSchedule", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="notification-message"></div>
            <table>
                <tbody>
                    <tr id="week1-hosts"></tr>
                    <tr id="week2-hosts"></tr>
                </tbody>
            </table>
        `;
    });

    test("correctly processes and updates the schedule", () => {
        const csvText = "day,host\nMonday1,Alice\nTuesday1,Bob";
        processSchedule(csvText);

        expect(document.getElementById("week1-hosts").innerHTML).not.toBe("");
        expect(document.getElementById("notification-message").textContent)
            .not.toBe("No schedule found.");
    });
});
