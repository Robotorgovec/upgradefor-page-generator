import { NextRequest, NextResponse } from "next/server";
import brands from "../../../sandbox/sportpit/data/taxonomy/usa.brands.json";

const brandContext: Record<string, string[]> = {
  protein: ["optimum-nutrition", "dymatize", "rule1", "bsn"],
  "pre-workout": ["cellucor", "ghost", "ryse", "redcon1"],
  "amino-acids": ["bsn", "evlution", "vmi", "nutraone"],
  creatine: ["optimum-nutrition", "muscletech", "dymatize", "rule1"],
  "gainers-meal": ["optimum-nutrition", "muscletech", "dymatize", "bsn"],
  "fat-burners": ["cellucor", "evlution", "ghost", "redcon1"],
  "vitamins-minerals": ["optimum-nutrition", "nutraone", "evlution", "vmi"],
  "drinks-hydration": ["ghost", "ryse", "cellucor", "bsn"],
};

export async function GET(request: NextRequest) {
  const cat = request.nextUrl.searchParams.get("cat") || "";
  const ranked = [...brands].sort((a, b) => a.sort - b.sort);

  if (!cat || !brandContext[cat]) {
    const featured = ranked.filter((item) => item.featured);
    const rest = ranked.filter((item) => !item.featured);
    return NextResponse.json({ brands: [...featured, ...rest] });
  }

  const allowed = new Set(brandContext[cat]);
  const filtered = ranked.filter((item) => allowed.has(item.slug));
  return NextResponse.json({ brands: filtered });
}
