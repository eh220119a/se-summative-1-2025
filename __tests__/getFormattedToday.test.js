const { getFormattedToday } = require("../script");

describe("getFormattedToday", () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2024-02-07")); // Mocking a Wednesday
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test("returns the correct formatted day with week number", () => {
        const expectedWeek = (7 % 14 < 7) ? "1" : "2"; // Ensure correct week calculation
        expect(getFormattedToday()).toBe(`Wednesday${expectedWeek}`);
    });
});
