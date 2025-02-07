const { getFormattedToday } = require("../script");

describe("getFormattedToday", () => {
    test("returns the correct formatted day with week number", () => {
        jest.spyOn(global, "Date").mockImplementation(() => new Date("2024-02-07"));
        expect(getFormattedToday()).toBe("Wednesday1");
        jest.restoreAllMocks();
    });
});
