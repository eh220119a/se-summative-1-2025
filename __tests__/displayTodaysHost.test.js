
const { displayTodaysHost } = require("../script");

describe("displayTodaysHost", () => {
    beforeEach(() => {
        document.body.innerHTML = `<div id="notification-message"></div>`;
    });

    test("updates notification with today's host", () => {
        const schedule = [
            { day: "Monday1", host: "Alice" },
            { day: "Tuesday1", host: "Bob" },
        ];

        jest.spyOn(global, "Date").mockImplementation(() => new Date("2024-02-05"));
        displayTodaysHost(schedule);

        expect(document.getElementById("notification-message").textContent).toBe("Today's stand-up host: Alice");
        jest.restoreAllMocks();
    });
});
