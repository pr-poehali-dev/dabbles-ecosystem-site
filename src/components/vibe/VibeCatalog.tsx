import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { FadeIn } from "@/components/shared";
import { request } from "@/lib/api";
import { VibeProduct, formatPrice } from "./constants";

interface VibeCatalogProps {
  onAddToCart: (product: VibeProduct, size: string) => void;
}

function ProductCard({ p, onAdd, isNew }: { p: VibeProduct; onAdd: (size: string) => void; isNew: boolean }) {
  const [size, setSize] = useState(p.sizes[0] || "");
  return (
    <div className="group">
      <div className="aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-[#f5f5f5] relative mb-3">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}>
            <Icon name="Shirt" size={36} className="text-black/35" />
          </div>
        )}
        {isNew && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#EBD047] text-black text-[10px] font-bold">
            Новое
          </span>
        )}
        {p.old_price && (
          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
            -{Math.round((1 - p.price / p.old_price) * 100)}%
          </span>
        )}
        <button
          onClick={() => onAdd(size)}
          className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center text-black shadow-lg transition-transform hover:scale-110"
          style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}
        >
          <Icon name="Plus" size={16} />
        </button>
      </div>

      <span className="text-[10px] font-bold uppercase tracking-wider text-black/35">{p.category}</span>
      <h3 className="font-bold text-black text-[14px] mb-1 leading-snug">{p.name}</h3>

      {p.sizes.length > 1 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {p.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                size === s ? "bg-black text-white border-black" : "border-black/12 text-black/40 hover:border-black/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-baseline gap-1.5">
        <span className="font-black text-black text-[15px]">{formatPrice(p.price)}</span>
        {p.old_price && <span className="text-black/30 text-[12px] line-through">{formatPrice(p.old_price)}</span>}
      </div>
    </div>
  );
}

export default function VibeCatalog({ onAddToCart }: VibeCatalogProps) {
  const [products, setProducts] = useState<VibeProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState("Все");

  useEffect(() => {
    request<{ products: VibeProduct[] }>("vibe-shop", { query: { action: "products" }, auth: false })
      .then((r) => setProducts(r.products))
      .catch(() => {});
  }, []);

  const categories = useMemo(() => ["Все", ...Array.from(new Set(products.map((p) => p.category)))], [products]);
  const filtered = activeCategory === "Все" ? products : products.filter((p) => p.category === activeCategory);

  return (
    <section id="catalog" className="px-5 md:px-8 py-14 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-3xl md:text-5xl font-black text-black">Каталог</h2>
              <Icon name="Sparkle" size={22} className="text-[#DAB332] -mt-4" />
            </div>
            {activeCategory !== "Все" ? (
              <button
                onClick={() => setActiveCategory("Все")}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-[13px] font-bold"
              >
                Все товары
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon name="X" size={11} />
                </span>
              </button>
            ) : (
              <button
                onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold text-black"
                style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}
              >
                Смотреть всё
                <span className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                  <Icon name="ArrowRight" size={11} className="text-white" />
                </span>
              </button>
            )}
          </div>
        </FadeIn>

        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-full text-[13px] font-bold transition-colors ${
                  activeCategory === c ? "bg-black text-white" : "bg-[#f5f5f5] text-black/50 hover:bg-black/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="text-black/40 text-center py-10">Товары скоро появятся</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {filtered.map((p, i) => (
              <FadeIn key={p.id} delay={i * 60}>
                <ProductCard p={p} onAdd={(size) => onAddToCart(p, size)} isNew={i < 2} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
