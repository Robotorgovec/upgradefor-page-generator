import { NextResponse } from "next/server";
import categories from "../../../sandbox/sportpit/data/taxonomy/usa.categories.json";
import subcategories from "../../../sandbox/sportpit/data/taxonomy/usa.subcategories.json";

export async function GET() {
  return NextResponse.json({ categories, subcategories });
}
