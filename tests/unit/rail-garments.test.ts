import { describe, expect, it } from "vitest";
import productsData from "@/data/products.json";
import {
  isHangingClothingProduct,
  mapCategoryToGarmentKind,
  productsToRailGarments,
} from "@/lib/rail-garments";
import type { Product } from "@/types";

const products = productsData as Product[];

describe("rail-garments mapper", () => {
  it("filters hanging clothing categories and excludes caps, cases, and cargos", () => {
    const hanging = products.filter(isHangingClothingProduct);
    expect(hanging.length).toBeGreaterThan(0);
    expect(hanging.every((p) => !["Caps", "Cases", "Cargos"].includes(p.category))).toBe(true);
    expect(hanging.some((p) => p.category === "Hoodies")).toBe(true);
    expect(hanging.some((p) => p.category === "Jackets")).toBe(true);
    expect(hanging.some((p) => p.category === "T-shirts")).toBe(true);
    expect(hanging.some((p) => p.category === "Shirts")).toBe(true);
    expect(hanging.some((p) => p.category === "Polos")).toBe(true);
  });

  it("maps each clothing category to the right 3D garment silhouette", () => {
    expect(mapCategoryToGarmentKind("Hoodies")).toBe("hoodie");
    expect(mapCategoryToGarmentKind("Jackets")).toBe("jacket");
    expect(mapCategoryToGarmentKind("T-shirts")).toBe("tee");
    expect(mapCategoryToGarmentKind("Shirts")).toBe("shirt");
    expect(mapCategoryToGarmentKind("Polos")).toBe("knit");
    expect(mapCategoryToGarmentKind("Coats")).toBe("coat");
  });

  it("formats INR hang-tags, links to product pages, and expands colorways on small category racks", () => {
    const hoodies = products.filter((p) => p.category === "Hoodies");
    const railItems = productsToRailGarments(hoodies, { expandColorwaysBelow: 5 });

    expect(railItems.length).toBeGreaterThanOrEqual(hoodies.length);
    for (const item of railItems) {
      expect(item.kind).toBe("hoodie");
      expect(item.tag).toMatch(/^₹/);
      expect(item.href).toBe(`/products/${item.product.slug}`);
      expect(item.color).toMatch(/^#/);
      expect(item.details?.length).toBeGreaterThan(0);
    }
  });

  it("returns an empty list for non-clothing accessory collections", () => {
    const accessories = products.filter((p) => p.category === "Caps" || p.category === "Cases");
    expect(productsToRailGarments(accessories)).toEqual([]);
  });
});
