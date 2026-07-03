import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { FadeIn } from "@/components/shared";
import { request } from "@/lib/api";
import { VibeProduct, formatPrice } from "./constants";

interface VibeCatalogProps {
  onAddToCart: (product: VibeProduct, size: string) => void;
}

function ProductCard({ p, onAdd }: { p: VibeProduct; onAdd: (size: string) => void }) {
  const [size, setSize] = useState(p.sizes[0] || "");
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-black/6 flex flex-col hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-[#f5f5f5] relative">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}>
            <Icon name="Shirt" size={40} className="text-black/40" />
          </div>
        )}
        {p.old_price && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-500 text-white text-[11px] font-bold">
            -{Math.round((1 - p.price / p.old_price) * 100)}%
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-black/35 mb-1">{p.category}</span>
        <h3 className="font-black text-black text-[15px] mb-1.5 leading-snug">{p.name}</h3>
        <p className="text-black/45 text-[12px] leading-relaxed mb-3 line-clamp-2 flex-1">{p.description}</p>

        {p.sizes.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {p.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                  size === s ? "bg-black text-white border-black" : "border-black/15 text-black/50 hover:border-black/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-black text-[17px]">{formatPrice(p.price)}</span>
            {p.old_price && <span className="text-black/30 text-[12px] line-through">{formatPrice(p.old_price)}</span>}
          </div>
          <button
            onClick={() => onAdd(size)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-black shrink-0 transition-transform hover:scale-105"
            style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}
          >
            <Icon name="Plus" size={16} />
          </button>
        </div>
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
    <section id="catalog" className="px-5 md:px-8 py-16 md:py-24 bg-[#FAFAF8]">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-xs uppercase tracking-[0.25em] text-black/40 font-semibold mb-3">Каталог</div>
          <h2 className="font-display text-3xl md:text-5xl font-black mb-8 leading-tight">Вся коллекция ВАЙБ</h2>
        </FadeIn>

        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-full text-[13px] font-bold transition-colors ${
                  activeCategory === c ? "bg-black text-white" : "bg-white text-black/50 border border-black/10 hover:border-black/30"
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p, i) => (
              <FadeIn key={p.id} delay={i * 60}>
                <ProductCard p={p} onAdd={(size) => onAddToCart(p, size)} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
