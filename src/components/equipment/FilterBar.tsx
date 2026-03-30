"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";

const PRICE_RANGES = [
  { label: "Any", value: "" },
  { label: "Under ₹500", value: "0-500" },
  { label: "₹500–1000", value: "500-1000" },
  { label: "₹1000–2000", value: "1000-2000" },
  { label: "₹2000+", value: "2000+" },
];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "";
  const activePrice = searchParams.get("price") || "";

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-3">
      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        <button
          onClick={() => setParam("category", "")}
          className={cn(
            "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 border",
            activeCategory === ""
              ? "bg-sage-500 text-white border-sage-500"
              : "bg-white text-earth-600 border-earth-200 hover:border-sage-300"
          )}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setParam("category", activeCategory === cat ? "" : cat)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 border",
              activeCategory === cat
                ? "bg-sage-500 text-white border-sage-500"
                : "bg-white text-earth-600 border-earth-200 hover:border-sage-300"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Price filter */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={14} className="text-earth-400 shrink-0" />
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {PRICE_RANGES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setParam("price", value)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border",
                activePrice === value
                  ? "bg-clay-500 text-white border-clay-500"
                  : "bg-white text-earth-600 border-earth-200"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
