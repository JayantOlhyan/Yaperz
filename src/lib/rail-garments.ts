import type { GarmentKind, RailGarment } from "@/components/ui/product-rail-gallery";
import { formatINR } from "@/lib/currency";
import type { Product } from "@/types";

export interface YaperzRailGarment extends RailGarment {
  product: Product;
  colorName: string;
}

const HANGING_CATEGORIES = new Set([
  "hoodies",
  "jackets",
  "t-shirts",
  "shirts",
  "polos",
  "coats",
  "knitwear",
]);

interface SwatchTone {
  color: string;
  trim: string;
}

const COLORWAY_TONES: Record<string, SwatchTone> = {
  brown: { color: "#54382A", trim: "#3C271C" },
  beige: { color: "#D9CDBF", trim: "#BBA994" },
  black: { color: "#1B1C20", trim: "#2E3036" },
  "vintage black": { color: "#26282C", trim: "#18191C" },
  white: { color: "#F4F2EC", trim: "#DDD8CC" },
  "off-white": { color: "#EFECE3", trim: "#D8D2C4" },
  grey: { color: "#8D9298", trim: "#6D7278" },
  "charcoal grey": { color: "#34373D", trim: "#222429" },
  "blue stripe": { color: "#8EB8D8", trim: "#EBF3F8" },
  "green stripe": { color: "#6F9B84", trim: "#EAF2EE" },
  "forest green": { color: "#1C4D3A", trim: "#123427" },
  cream: { color: "#ECE5D5", trim: "#D2C8B3" },
  "cobalt blue": { color: "#1E46B8", trim: "#143188" },
  "bright orange": { color: "#E65C00", trim: "#B84700" },
  sand: { color: "#D5C3AC", trim: "#B9A388" },
  olive: { color: "#6A734A", trim: "#4E5535" },
  "olive green": { color: "#5E6843", trim: "#444C30" },
  burgundy: { color: "#6B1E2E", trim: "#E5DBD0" },
};

/**
 * Returns true for upper-body / outerwear garments that hang naturally on a clothing rail.
 * Accessories (Caps, Cases) and bottoms (Cargos) are kept on standard product cards.
 */
export function isHangingClothingProduct(product: Product): boolean {
  return HANGING_CATEGORIES.has(product.category.toLowerCase());
}

/**
 * Maps a Yaperz catalog category to the built-in 3D garment silhouette in ClothingRailHero.
 */
export function mapCategoryToGarmentKind(category: string, tags: string[] = []): GarmentKind {
  const cat = category.toLowerCase();
  if (cat.includes("hoodie")) return "hoodie";
  if (cat.includes("coat") || tags.includes("coat")) return "coat";
  if (cat.includes("jacket")) return "jacket";
  if (cat.includes("shirt") && !cat.includes("t-shirt")) return "shirt";
  if (cat.includes("polo") || cat.includes("knit") || tags.includes("knit")) return "knit";
  return "tee";
}

function resolveTone(colorName: string, product: Product): SwatchTone {
  const normalized = colorName.trim().toLowerCase();
  const base = COLORWAY_TONES[normalized] ?? { color: "#3A3D42", trim: "#26282C" };

  // Give signature motorsport / collegiate outerwear distinctive trim contrast
  if (product.slug.includes("racing-club-leather-bomber") && normalized === "black") {
    return { color: "#18191D", trim: "#E65C00" };
  }
  if (product.slug.includes("signature-varsity-jacket") && normalized === "cobalt blue") {
    return { color: "#1E46B8", trim: "#EFEBE0" };
  }
  if (product.slug.includes("signature-varsity-jacket") && normalized === "forest green") {
    return { color: "#1B4A37", trim: "#EFEBE0" };
  }
  return base;
}

function extractDetails(product: Product, colorName: string): string[] {
  const details: string[] = [];

  const gsmMatch = product.description.match(/\b(\d{3}\s*GSM)\b/i);
  if (gsmMatch) {
    details.push(gsmMatch[1].toUpperCase());
  } else if (/nappa leather/i.test(product.description)) {
    details.push("Full-Grain Leather");
  } else if (/linen/i.test(product.description)) {
    details.push("Breathable Linen");
  } else if (/wool/i.test(product.description)) {
    details.push("Heavy Wool Blend");
  } else if (/long-staple cotton|fine-knit/i.test(product.description)) {
    details.push("Combed Knit Cotton");
  }

  details.push(colorName);

  if (product.tags.includes("oversized")) {
    details.push("Oversized Fit");
  } else if (product.category === "Jackets") {
    details.push("Structured Outerwear");
  } else {
    details.push(product.category);
  }

  if (product.inventory === 0) {
    details.push("Sold Out");
  } else if (product.inventory <= 5) {
    details.push(`Only ${product.inventory} left`);
  }

  return details.slice(0, 4);
}

export interface RailMapperOptions {
  /**
   * When a clothing section has fewer than this many distinct products, secondary colorways
   * of those real products are also hung on the rail so shoppers still get a full tactile rack.
   * Set to 0 to disable colorway expansion.
   */
  expandColorwaysBelow?: number;
  /** Maximum number of pieces to place on a single rail. */
  maxItems?: number;
}

/**
 * Converts Yaperz catalog products into RailGarment entries backed by real products,
 * prices (INR), colorways, descriptions, and product detail routes.
 */
export function productsToRailGarments(
  products: Product[],
  options: RailMapperOptions = {}
): YaperzRailGarment[] {
  const { expandColorwaysBelow = 5, maxItems = 10 } = options;
  const hangingProducts = products.filter(isHangingClothingProduct);
  if (hangingProducts.length === 0) return [];

  const shouldExpand = hangingProducts.length < expandColorwaysBelow;
  const items: YaperzRailGarment[] = [];

  for (const product of hangingProducts) {
    const kind = mapCategoryToGarmentKind(product.category, product.tags);
    const colorsToShow = shouldExpand ? product.colors.slice(0, 3) : product.colors.slice(0, 1);

    for (let colorIdx = 0; colorIdx < colorsToShow.length; colorIdx++) {
      if (items.length >= maxItems) break;
      const colorName = colorsToShow[colorIdx] ?? product.colors[0] ?? "Signature";
      const { color, trim } = resolveTone(colorName, product);
      const isSecondary = colorIdx > 0;
      const displayName = isSecondary ? `${product.title} · ${colorName}` : product.title;

      items.push({
        id: `${product.id}-${colorName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: displayName,
        description: product.description,
        kind,
        color,
        trim,
        tag: formatINR(product.price),
        details: extractDetails(product, colorName),
        href: `/products/${product.slug}`,
        product,
        colorName,
      });
    }
  }

  return items;
}
