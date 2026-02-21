"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "../SportpitPreview.module.css";
import CategoryGrid from "./CategoryGrid";
import SubcategoryPills from "./SubcategoryPills";
import BrandRow from "./BrandRow";

type Category = { slug: string; name_ru: string; name_en: string; hint: string; sort: number };
type Subcategory = { slug: string; name_ru: string; name_en: string; category: string; sort: number };
type Brand = { slug: string; name: string; country: string; featured: boolean; logo_url: string | null; sort: number };
type Product = { id: number; name: string; price: number; rating: number; cat: string; sub: string; brand: string; isNew?: boolean };

export default function UsaLandingClient() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [total, setTotal] = useState(0);

  const cat = params.get("cat") || "";
  const sub = params.get("sub") || "";
  const brand = params.get("brand") || "";
  const sort = params.get("sort") || "popular";
  const page = Number(params.get("page") || "1");

  useEffect(() => {
    fetch("/api/usa/taxonomy")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setSubcategories(data.subcategories || []);
      });
  }, []);

  useEffect(() => {
    fetch(`/api/usa/brands?cat=${cat}&sub=${sub}`)
      .then((res) => res.json())
      .then((data) => setBrands(data.brands || []));
  }, [cat, sub]);

  useEffect(() => {
    const query = new URLSearchParams({ origin: "USA", sort, page: String(page), pageSize: "8" });
    if (cat) query.set("cat", cat);
    if (sub) query.set("sub", sub);
    if (brand) query.set("brand", brand);

    fetch(`/api/products?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.items || []);
        setTotal(data.total || 0);
      });
  }, [cat, sub, brand, sort, page]);

  const updateParams = (next: Record<string, string>) => {
    const query = new URLSearchParams(params.toString());
    query.set("origin", "USA");
    Object.entries(next).forEach(([key, value]) => {
      if (!value) query.delete(key);
      else query.set(key, value);
    });
    if (!("page" in next)) query.set("page", "1");
    router.replace(`${pathname}?${query.toString()}`, { scroll: false });
  };

  const selectedSubcategories = useMemo(() => subcategories.filter((item) => item.category === cat), [subcategories, cat]);

  return (
    <section className={styles.section}>
      <h1 className={styles.usaTitle}>Американское спортивное питание</h1>
      <p className={styles.usaSubtitle}>Выберите категорию и бренд — сузьте выбор за 2 клика</p>

      <CategoryGrid categories={categories} selected={cat} onToggle={(slug) => updateParams({ cat: cat === slug ? "" : slug, sub: "", brand: "" })} />

      {cat && (
        <div className={styles.usaBlock}>
          <div className={styles.usaBlockHead}><h3>Подкатегории</h3></div>
          <SubcategoryPills items={selectedSubcategories} selected={sub} onToggle={(slug) => updateParams({ sub: sub === slug ? "" : slug, brand: "" })} />
        </div>
      )}

      <div className={styles.usaBlock}>
        <div className={styles.usaBlockHead}>
          <h3>Бренды</h3>
          <button type="button" className={styles.secondaryBtn} aria-label="Сбросить фильтры" onClick={() => updateParams({ cat: "", sub: "", brand: "", page: "1" })}>Сбросить</button>
        </div>
        <BrandRow brands={brands} selected={brand} showAll={showAllBrands} onToggle={(slug) => updateParams({ brand: brand === slug ? "" : slug })} onToggleAll={() => setShowAllBrands((prev) => !prev)} />
      </div>

      <div className={styles.usaBlock}>
        <div className={styles.usaProductsHead}>
          <h3>Товары USA ({total})</h3>
          <select value={sort} onChange={(e) => updateParams({ sort: e.target.value })} className={styles.usaSelect}>
            <option value="popular">Popular</option>
            <option value="price-asc">Price asc</option>
            <option value="price-desc">Price desc</option>
            <option value="new">New</option>
          </select>
        </div>

        {products.length === 0 ? (
          <div className={styles.usaEmpty}>
            <p>Ничего не найдено под выбранную комбинацию фильтров.</p>
            <div className={styles.heroButtons}>
              <button type="button" className={styles.secondaryBtn} onClick={() => updateParams({ brand: "" })}>Сбросить бренд</button>
              <button type="button" className={styles.secondaryBtn} onClick={() => updateParams({ sub: "", brand: "" })}>Сбросить подкатегорию</button>
              <button type="button" className={styles.primaryBtn} onClick={() => updateParams({ cat: "", sub: "", brand: "" })}>Показать все товары USA</button>
            </div>
          </div>
        ) : (
          <div className={styles.products}>
            {products.map((product) => (
              <article key={product.id} className={styles.productCard}>
                <h3>{product.name}</h3>
                <p>★ {product.rating}</p>
                <strong>{product.price.toLocaleString("ru-RU")} ₸</strong>
                <button type="button" className={styles.secondaryBtn}>В корзину</button>
              </article>
            ))}
          </div>
        )}

        <div className={styles.usaPager}>
          <button type="button" className={styles.secondaryBtn} disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}>Назад</button>
          <span>Страница {page}</span>
          <button type="button" className={styles.secondaryBtn} disabled={products.length < 8} onClick={() => updateParams({ page: String(page + 1) })}>Показать ещё</button>
        </div>
      </div>
    </section>
  );
}
