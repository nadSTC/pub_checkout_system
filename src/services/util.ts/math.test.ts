import { roundToXdp } from "./math";

describe("roundToXdp", () => {
  test("basic cases", () => {
    expect(roundToXdp(1.23456, 2)).toBe(1.23);
    expect(roundToXdp(1.23999, 2)).toBe(1.24);
  });

  test("edge cases", () => {
    expect(roundToXdp(1, 2)).toBe(1);
    expect(roundToXdp(1.11111, 0)).toBe(1);
  });
});
