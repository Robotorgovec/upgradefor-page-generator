import { NextRequest, NextResponse } from "next/server";

type Product = {
  id: number;
  name: string;
  origin: string;
  cat: string;
  sub: string;
  brand: string;
  rating: number;
  price: number;
  isNew?: boolean;
  popular?: number;
};

const products: Product[] = [
  { id: 1, name: "Gold Standard Whey", origin: "USA", cat: "protein", sub: "whey", brand: "optimum-nutrition", rating: 4.9, price: 18500, popular: 98 },
  { id: 2, name: "ISO100 Hydrolyzed", origin: "USA", cat: "protein", sub: "isolate", brand: "dymatize", rating: 4.8, price: 23900, popular: 96 },
  { id: 3, name: "Combat Protein", origin: "USA", cat: "protein", sub: "blend", brand: "muscletech", rating: 4.5, price: 16500, popular: 84 },
  { id: 4, name: "C4 Original", origin: "USA", cat: "pre-workout", sub: "stim", brand: "cellucor", rating: 4.7, price: 14900, popular: 91 },
  { id: 5, name: "Ghost Legend", origin: "USA", cat: "pre-workout", sub: "focus", brand: "ghost", rating: 4.8, price: 17900, popular: 89, isNew: true },
  { id: 6, name: "Ryse Godzilla", origin: "USA", cat: "pre-workout", sub: "pump", brand: "ryse", rating: 4.6, price: 19900, popular: 88 },
  { id: 7, name: "Amino X", origin: "USA", cat: "amino-acids", sub: "bcaa", brand: "bsn", rating: 4.6, price: 12500, popular: 81 },
  { id: 8, name: "EAA Energy", origin: "USA", cat: "amino-acids", sub: "eaa", brand: "evlution", rating: 4.5, price: 9900, popular: 79 },
  { id: 9, name: "Micronized Creatine", origin: "USA", cat: "creatine", sub: "monohydrate", brand: "optimum-nutrition", rating: 4.8, price: 8900, popular: 95 },
  { id: 10, name: "Platinum Creatine", origin: "USA", cat: "creatine", sub: "creapure", brand: "muscletech", rating: 4.4, price: 9500, popular: 74 },
  { id: 11, name: "Serious Mass", origin: "USA", cat: "gainers-meal", sub: "mass", brand: "optimum-nutrition", rating: 4.7, price: 21900, popular: 92 },
  { id: 12, name: "Mass Tech Extreme", origin: "USA", cat: "gainers-meal", sub: "high-cal", brand: "muscletech", rating: 4.3, price: 20900, popular: 73 },
  { id: 13, name: "SuperHD Thermo", origin: "USA", cat: "fat-burners", sub: "thermo", brand: "cellucor", rating: 4.2, price: 11300, popular: 69 },
  { id: 14, name: "L-Carnitine 3000", origin: "USA", cat: "fat-burners", sub: "carnitine", brand: "evlution", rating: 4.1, price: 8700, popular: 66 },
  { id: 15, name: "Opti-Men", origin: "USA", cat: "vitamins-minerals", sub: "multi", brand: "optimum-nutrition", rating: 4.9, price: 13900, popular: 90 },
  { id: 16, name: "Fish Oil Omega-3", origin: "USA", cat: "vitamins-minerals", sub: "omega3", brand: "rule1", rating: 4.6, price: 9900, popular: 83 },
  { id: 17, name: "Hydra Charge", origin: "USA", cat: "drinks-hydration", sub: "electrolytes", brand: "ghost", rating: 4.3, price: 7600, popular: 65 },
  { id: 18, name: "Intra Fuel", origin: "USA", cat: "drinks-hydration", sub: "intra", brand: "ghost", rating: 4.5, price: 11800, popular: 77 }
];

export async function GET(request: NextRequest) {
  const qp = request.nextUrl.searchParams;
  const origin = qp.get("origin") || "";
  const cat = qp.get("cat") || "";
  const sub = qp.get("sub") || "";
  const brand = qp.get("brand") || "";
  const sort = qp.get("sort") || "popular";
  const page = Number(qp.get("page") || "1");
  const pageSize = Number(qp.get("pageSize") || "8");

  let items = products.filter((item) => (origin ? item.origin === origin : true));
  if (cat) items = items.filter((item) => item.cat === cat);
  if (sub) items = items.filter((item) => item.sub === sub);
  if (brand) items = items.filter((item) => item.brand === brand);

  if (sort === "price-asc") items = [...items].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") items = [...items].sort((a, b) => b.price - a.price);
  if (sort === "new") items = [...items].sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
  if (sort === "popular") items = [...items].sort((a, b) => (b.popular || 0) - (a.popular || 0));

  const total = items.length;
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  return NextResponse.json({ items: paged, total, page, pageSize });
}
