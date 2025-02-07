const { displayTodaysHost } = require("../script");

describe("displayTodaysHost", () => {
    let notificationMessage;

    beforeAll(() => {
        document.body.innerHTML = `<div id="notification-message"></div>`;
        notificationMessage = document.getElementById("notification-message");

        jest.useFakeTimers();
        jest.setSystemTime(new Date("2024-02-05")); // Mocking a Monday
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test("updates notification with today's host", () => {
        const schedule = [
            { day: "Monday1", host: "Alice" },
            { day: "Tuesday1", host: "Bob" }
        ];

        displayTodaysHost(schedule);
        expect(notificationMessage.textContent).toBe("Today's stand-up host: Alice");
    });
});
