import { findIndexOr } from "./util";

describe("findIndexOr", () => {
  it("returns default value if not in array", () => {
    const array = [1, 2, 3];
    const toFind = 5;

    const expected = Symbol("DEFAULT_VALUE");

    expect(findIndexOr(array, i => i === toFind, expected)).toBe(expected);
  });

  it("returns the correct value when found", () => {
    const array = [1, 2, 3];
    const toFind = 2;

    const expected = 1;

    expect(findIndexOr(array, i => i === toFind, -1)).toBe(expected);
  });
});
