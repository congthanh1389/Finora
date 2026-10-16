import { describe, expect, it } from "vitest";
import { resolveCategoryIconName } from "../category-icon-resolver";

describe("resolveCategoryIconName", () => {
  it("keeps a selected category icon", () => {
    expect(resolveCategoryIconName("home-outline")).toBe("home-outline");
    expect(resolveCategoryIconName("briefcase-outline")).toBe("briefcase-outline");
  });

  it("falls back safely for missing or unknown icons", () => {
    expect(resolveCategoryIconName()).toBe("other");
    expect(resolveCategoryIconName(null)).toBe("other");
    expect(resolveCategoryIconName("unknown-icon")).toBe("other");
  });
});
