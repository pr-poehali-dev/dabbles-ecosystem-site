import { useEffect, useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";

type Product = {
  id?: number;
  name: string;
  description: string;
  price: number;
  old_price: number | null;
  image_url: string;
  category: string;
  sizes: string;
  sort_order: number;
  is_active?: boolean;
};

type Order = {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  comment: string;
  items: { name: string; size: string; price: number; qty: number }[];
  total: number;
  status: string;
  created_at: string;
};

const CATEGORIES = ["Футболки", "Худи", "Аксессуары"];
const STATUS_LABELS: Record<string, string> = {
  new: "Новый", processing: "В обработке", shipped: "Отправлен", done: "Выполнен", cancelled: "Отменён",
};

function newProduct(): Product {
  return { name: "Новый товар", description: "", price: 0, old_price: null, image_url: "", category: "Футболки", sizes: "S,M,L,XL", sort_order: 99, is_active: true };
}

export default function AdminVibeShop() {
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [items, setItems] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === "products") {
        const { products } = await request<{ products: Product[] }>("vibe-shop", { query: { action: "admin-products" } });
        setItems(products);
      } else {
        const { orders } = await request<{ orders: Order[] }>("vibe-shop", { query: { action: "admin-orders" } });
        setOrders(orders);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);

  const save = async () => {
    if (!editing) return;
    await request("vibe-shop", { method: "POST", query: { action: "admin-product-save" }, body: editing });
    setEditing(null);
    load();
  };

  const remove = async (p: Product) => {
    if (!p.id || !confirm("Удалить товар без возможности восстановления?")) return;
    await request("vibe-shop", { method: "POST", query: { action: "admin-product-delete" }, body: { id: p.id } });
    load();
  };

  const setOrderStatus = async (id: number, status: string) => {
    await request("vibe-shop", { method: "POST", query: { action: "admin-order-status" }, body: { id, status } });
    load();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-black text-black mb-1">ВАЙБ Мерч</h1>
        <p className="text-black/50">Товары интернет-магазина и заказы</p>
      </div>

      <div className="flex bg-black/5 rounded-2xl p-1 mb-6 max-w-sm">
        <button onClick={() => setTab("products")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${tab === "products" ? "bg-white text-black shadow-sm" : "text-black/40"}`}>
          <Icon name="Shirt" size={14} /> Товары
        </button>
        <button onClick={() => setTab("orders")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${tab === "orders" ? "bg-white text-black shadow-sm" : "text-black/40"}`}>
          <Icon name="Package" size={14} /> Заказы
        </button>
      </div>

      {loading ? (
        <Icon name="Loader" size={22} className="animate-spin text-black/30" />
      ) : tab === "products" ? (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setEditing(newProduct())}
              className="px-4 py-2 rounded-xl text-black font-semibold text-sm flex items-center gap-1.5"
              style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}>
              <Icon name="Plus" size={15} /> Добавить товар
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-black/6">
                <div className="h-32 relative bg-[#f0f0f5]">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}>
                      <Icon name="Shirt" size={26} className="text-black/50" />
                    </div>
                  )}
                </div>
                <div className="p-3.5">
                  <span className="text-[10px] font-bold uppercase text-black/35">{p.category}</span>
                  <h3 className="font-medium text-black text-sm mb-1.5 line-clamp-1">{p.name}</h3>
                  <div className="text-black/60 text-sm font-bold mb-2.5">{p.price.toLocaleString("ru-RU")} ₽</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditing(p)}
                      className="flex-1 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-black/70 text-xs font-semibold">
                      Редактировать
                    </button>
                    <button onClick={() => remove(p)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Удалить">
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                  {p.is_active === false && <div className="mt-2 text-[11px] text-black/40">⊘ Скрыто</div>}
                </div>
              </div>
            ))}
            {items.length === 0 && <div className="text-black/30 text-sm py-2">Нет товаров</div>}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/6 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/6 text-left text-black/40 text-[11px] uppercase">
                <th className="px-4 py-3 font-semibold">Клиент</th>
                <th className="px-4 py-3 font-semibold">Телефон</th>
                <th className="px-4 py-3 font-semibold">Товары</th>
                <th className="px-4 py-3 font-semibold">Сумма</th>
                <th className="px-4 py-3 font-semibold">Статус</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-black/4 last:border-0">
                  <td className="px-4 py-3 font-semibold text-black">{o.customer_name}</td>
                  <td className="px-4 py-3 text-black/60">{o.phone}</td>
                  <td className="px-4 py-3 text-black/50 text-[12px] max-w-[220px]">
                    {o.items.map((it, i) => <div key={i}>{it.name} ({it.size}) × {it.qty}</div>)}
                  </td>
                  <td className="px-4 py-3 font-bold text-black">{o.total.toLocaleString("ru-RU")} ₽</td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#f5f5f7] border border-black/8 text-[12px] font-semibold focus:outline-none">
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-black/30">Заказов пока нет</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing && <ProductModal item={editing} onChange={setEditing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ProductModal({ item, onChange, onSave, onClose }: {
  item: Product; onChange: (p: Product) => void; onSave: () => void; onClose: () => void;
}) {
  const set = (k: keyof Product, v: unknown) => onChange({ ...item, [k]: v });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const buf = await file.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const res = await request<{ url: string }>("vibe-shop", { method: "POST", query: { action: "upload" }, body: { file: b64, ext } });
      set("image_url", res.url);
    } finally { setUploading(false); e.target.value = ""; }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 md:p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-black text-black mb-5">{item.id ? "Редактирование" : "Создание"} товара</h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Название</label>
            <input value={item.name} onChange={(e) => set("name", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Описание</label>
            <textarea value={item.description} onChange={(e) => set("description", e.target.value)} rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-black/40 font-semibold block mb-1.5">Цена, ₽</label>
              <input type="number" value={item.price} onChange={(e) => set("price", Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-black/40 font-semibold block mb-1.5">Старая цена (со скидкой)</label>
              <input type="number" value={item.old_price ?? ""} onChange={(e) => set("old_price", e.target.value ? Number(e.target.value) : null)}
                placeholder="Необязательно"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-black/40 font-semibold block mb-1.5">Категория</label>
              <select value={item.category} onChange={(e) => set("category", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-black/40 font-semibold block mb-1.5">Размеры (через запятую)</label>
              <input value={item.sizes} onChange={(e) => set("sizes", e.target.value)}
                placeholder="S,M,L,XL"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Фото товара</label>
            {item.image_url && (
              <div className="h-32 rounded-xl overflow-hidden mb-2 bg-[#f0f0f5]">
                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full border-2 border-dashed border-black/12 rounded-xl py-3 flex items-center justify-center gap-2 text-black/50 hover:border-[#DAB332]/50 hover:text-[#DAB332] transition-colors text-sm font-semibold">
              {uploading ? <Icon name="Loader" size={16} className="animate-spin" /> : <Icon name="Upload" size={16} />}
              {uploading ? "Загрузка..." : item.image_url ? "Заменить фото" : "Загрузить фото"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} />
          </div>
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Порядок (меньше = выше)</label>
            <input type="number" value={item.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))}
              className="w-24 px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none" />
          </div>
          <label className="flex items-center gap-2 text-sm text-black/70 cursor-pointer">
            <input type="checkbox" checked={item.is_active !== false} onChange={(e) => set("is_active", e.target.checked)} />
            Показывать в магазине
          </label>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onSave} className="flex-1 py-3 rounded-xl text-black font-semibold"
            style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}>
            Сохранить
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl bg-black/5 text-black/60 font-semibold hover:bg-black/10">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
