"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ShoppingBag } from "lucide-react";
import ClothingRailHero, {
  type DetailActionProps,
} from "@/components/ui/product-rail-gallery";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/currency";
import {
  productsToRailGarments,
  type YaperzRailGarment,
} from "@/lib/rail-garments";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export interface ClothingRailTab {
  id: string;
  label: string;
  products: Product[];
  eyebrow?: string;
  heading?: string;
  caption?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface ClothingRailSectionProps {
  /** Direct product list when not using tabbed clothing sections. */
  products?: Product[];
  /** Optional interactive tabs to switch between clothing racks in place. */
  tabs?: ClothingRailTab[];
  defaultTabId?: string;
  eyebrow?: string;
  heading?: string;
  caption?: string;
  ctaLabel?: string;
  ctaHref?: string;
  autoplay?: boolean;
  hanger?: "wood" | "matte" | "none";
  expandColorwaysBelow?: number;
  maxItems?: number;
  className?: string;
}

function GarmentDetailActions({ item, onClose }: DetailActionProps) {
  const garment = item as YaperzRailGarment;
  const { addToCart } = useCart();
  const { product, colorName } = garment;
  const isSoldOut = product.inventory === 0;
  const [selectedSize, setSelectedSize] = React.useState<string>(
    product.sizes.includes("M") ? "M" : (product.sizes[0] ?? "One Size")
  );
  const [added, setAdded] = React.useState(false);

  const handleQuickAdd = () => {
    if (isSoldOut) return;
    addToCart(product, 1, selectedSize, colorName);
    setAdded(true);
    window.setTimeout(() => {
      onClose();
    }, 220);
  };

  return (
    <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
      <div className="flex flex-wrap items-baseline justify-center gap-2.5 md:justify-start">
        <span className="text-lg font-semibold tracking-tight text-foreground">
          {formatINR(product.price)}
        </span>
        {product.compare_at_price && product.compare_at_price > product.price && (
          <>
            <span className="text-xs text-muted-foreground line-through">
              {formatINR(product.compare_at_price)}
            </span>
            <span className="rounded-sm bg-[var(--color-accent)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              {Math.round(
                ((product.compare_at_price - product.price) /
                  product.compare_at_price) *
                  100
              )}
              % Off
            </span>
          </>
        )}
      </div>

      {!isSoldOut && product.sizes.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Select Size
          </span>
          <div
            role="radiogroup"
            aria-label="Select garment size"
            className="flex flex-wrap justify-center gap-1.5 md:justify-start"
          >
            {product.sizes.map((size) => {
              const active = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "min-h-9 min-w-10 rounded-md border px-2.5 text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:border-foreground"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
        <button
          type="button"
          disabled={isSoldOut}
          onClick={handleQuickAdd}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isSoldOut
              ? "cursor-not-allowed bg-muted text-muted-foreground"
              : "bg-foreground text-background hover:bg-[var(--color-accent)] hover:text-white"
          )}
        >
          {added ? (
            <>
              <Check className="size-3.5" aria-hidden="true" />
              Added to Bag
            </>
          ) : isSoldOut ? (
            "Sold Out"
          ) : (
            <>
              <ShoppingBag className="size-3.5" aria-hidden="true" />
              Add to Bag
            </>
          )}
        </button>

        <Link
          href={`/products/${product.slug}`}
          onClick={onClose}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          View Product
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export function ClothingRailSection({
  products = [],
  tabs,
  defaultTabId,
  eyebrow,
  heading,
  caption = "Brush along the rail, slide a hanger, or click any piece to inspect front & back.",
  ctaLabel,
  ctaHref,
  autoplay = false,
  hanger = "matte",
  expandColorwaysBelow = 5,
  maxItems = 10,
  className,
}: ClothingRailSectionProps) {
  const [activeTabId, setActiveTabId] = React.useState<string>(
    defaultTabId ?? tabs?.[0]?.id ?? ""
  );

  const activeTab = React.useMemo(
    () => tabs?.find((tab) => tab.id === activeTabId) ?? tabs?.[0],
    [tabs, activeTabId]
  );

  const sourceProducts = activeTab ? activeTab.products : products;

  const garments = React.useMemo(
    () =>
      productsToRailGarments(sourceProducts, {
        expandColorwaysBelow,
        maxItems,
      }),
    [sourceProducts, expandColorwaysBelow, maxItems]
  );

  if (garments.length === 0 && (!tabs || tabs.length === 0)) {
    return null;
  }

  const resolvedEyebrow = activeTab?.eyebrow ?? eyebrow;
  const resolvedHeading = activeTab?.heading ?? heading;
  const resolvedCaption = activeTab?.caption ?? caption;
  const resolvedCtaLabel = activeTab?.ctaLabel ?? ctaLabel;
  const resolvedCtaHref = activeTab?.ctaHref ?? ctaHref;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg border border-border bg-background",
        className
      )}
    >
      {tabs && tabs.length > 1 && (
        <div
          role="tablist"
          aria-label="Clothing sections"
          className="relative z-20 flex flex-wrap items-center justify-center gap-2 border-b border-border bg-secondary/60 px-4 py-3"
        >
          {tabs.map((tab) => {
            const isSelected = tab.id === activeTab?.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  "min-h-9 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "bg-foreground text-background shadow-xs"
                    : "border border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {garments.length > 0 && (
        <ClothingRailHero
          items={garments}
          eyebrow={resolvedEyebrow}
          heading={resolvedHeading}
          caption={resolvedCaption}
          autoplay={autoplay}
          hanger={hanger}
          DetailAction={GarmentDetailActions}
          action={
            resolvedCtaLabel && resolvedCtaHref ? (
              <Link
                href={resolvedCtaHref}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-background shadow-sm outline-none transition-[transform,box-shadow,background-color] hover:-translate-y-px hover:bg-[var(--color-accent)] hover:text-white hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
              >
                {resolvedCtaLabel}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}

export default ClothingRailSection;
