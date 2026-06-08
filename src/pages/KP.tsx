import { useState } from "react";
import { request } from "@/lib/api";
import Icon from "@/components/ui/icon";

type Item = {
  id: number;
  name: string;
  unit: string;
  qty: string;
  price: string;
};

const UNITS = ["шт.", "услуга", "час", "день", "мес.", "км", "л", "кг", "м²", "м³"];

let nextId = 1;
const makeItem = (): Item => ({ id: nextId++, name: "", unit: "услуга", qty: "1", price: "" });

export default function KP() {
  const [org, setOrg] = useState("");
  const [director, setDirector] = useState("");
  const [items, setItems] = useState<Item[]>([makeItem()]);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const updateItem = (id: number, field: keyof Item, value: string) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  const addItem = () => setItems(prev => [...prev, makeItem()]);
  const removeItem = (id: number) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(it => it.id !== id));
  };

  const getTotal = (it: Item) => {
    const q = parseFloat(it.qty) || 0;
    const p = parseFloat(it.price) || 0;
    return q * p;
  };

  const grandTotal = items.reduce((s, it) => s + getTotal(it), 0);

  const fmt = (n: number) =>
    n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDownloadUrl(null);

    const valid = items.every(it => it.name.trim() && it.price.trim());
    if (!valid) {
      setError("Заполните наименование и цену для каждой позиции");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        organization: org,
        director_name: director,
        items: items.map(it => ({
          name: it.name,
          unit: it.unit,
          qty: parseFloat(it.qty) || 1,
          price: parseFloat(it.price) || 0,
          total: getTotal(it),
        })),
      };
      const res = await request<{ ok: boolean; download_url: string }>(
        "generate-kp",
        { method: "POST", query: { action: "generate" }, body: payload, auth: false }
      );
      setDownloadUrl(res.download_url);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ошибка генерации";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f5] py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Шапка */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a0a6e] mb-4">
            <Icon name="FileText" size={26} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-black text-black mb-2">
            Коммерческое предложение
          </h1>
          <p className="text-black/45 text-base">
            Заполните форму — документ будет готов за несколько секунд
          </p>
        </div>

        {downloadUrl ? (
          /* Успех */
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <Icon name="CheckCircle" size={32} className="text-green-600" />
            </div>
            <h2 className="font-display text-2xl font-black text-black mb-2">КП готово!</h2>
            <p className="text-black/45 mb-8">Документ сформирован на основе вашего шаблона</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={downloadUrl}
                download
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#1a0a6e] text-white font-semibold text-base hover:bg-[#0a0535] transition-colors"
              >
                <Icon name="Download" size={18} />
                Скачать КП (.docx)
              </a>
              <button
                onClick={() => { setDownloadUrl(null); setOrg(""); setDirector(""); setItems([makeItem()]); }}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-black/6 text-black font-semibold text-base hover:bg-black/10 transition-colors"
              >
                <Icon name="RotateCcw" size={16} />
                Новое КП
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Реквизиты */}
            <div className="bg-white rounded-3xl p-7 shadow-sm space-y-5">
              <h2 className="font-display text-lg font-black text-black">Реквизиты получателя</h2>
              <div>
                <label className="text-sm text-black/50 font-medium block mb-1.5">Организация *</label>
                <input
                  required
                  value={org}
                  onChange={e => setOrg(e.target.value)}
                  placeholder="ООО «Название компании»"
                  className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-black/8 text-black placeholder-black/25 focus:outline-none focus:ring-2 focus:ring-[#1a0a6e]/20 transition-all"
                />
              </div>
              <div>
                <label className="text-sm text-black/50 font-medium block mb-1.5">ФИО руководителя *</label>
                <input
                  required
                  value={director}
                  onChange={e => setDirector(e.target.value)}
                  placeholder="Иванов Иван Иванович"
                  className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-black/8 text-black placeholder-black/25 focus:outline-none focus:ring-2 focus:ring-[#1a0a6e]/20 transition-all"
                />
              </div>
            </div>

            {/* Позиции */}
            <div className="bg-white rounded-3xl p-7 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-black text-black">Услуги и позиции</h2>
                <span className="text-black/35 text-sm">{items.length} поз.</span>
              </div>

              {/* Заголовки колонок */}
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 mb-2 px-1">
                {["Наименование", "Ед. изм.", "Кол-во", "Цена, руб."].map(h => (
                  <div key={h} className="text-xs text-black/40 font-semibold">{h}</div>
                ))}
                <div />
              </div>

              <div className="space-y-3">
                {items.map((it, idx) => (
                  <div key={it.id} className="grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-center p-3 md:p-0 bg-[#f8f8fb] md:bg-transparent rounded-xl md:rounded-none">
                    {/* Номер на мобиле */}
                    <div className="md:hidden text-xs text-black/35 font-semibold mb-1">Позиция {idx + 1}</div>

                    <input
                      required
                      value={it.name}
                      onChange={e => updateItem(it.id, "name", e.target.value)}
                      placeholder="Наименование услуги"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm placeholder-black/25 focus:outline-none focus:ring-2 focus:ring-[#1a0a6e]/15"
                    />
                    <select
                      value={it.unit}
                      onChange={e => updateItem(it.id, "unit", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#1a0a6e]/15"
                    >
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <input
                      required
                      type="number"
                      min="0.001"
                      step="any"
                      value={it.qty}
                      onChange={e => updateItem(it.id, "qty", e.target.value)}
                      placeholder="1"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm placeholder-black/25 focus:outline-none focus:ring-2 focus:ring-[#1a0a6e]/15"
                    />
                    <div className="relative">
                      <input
                        required
                        type="number"
                        min="0"
                        step="any"
                        value={it.price}
                        onChange={e => updateItem(it.id, "price", e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm placeholder-black/25 focus:outline-none focus:ring-2 focus:ring-[#1a0a6e]/15"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      disabled={items.length === 1}
                      className="p-2 rounded-xl text-black/25 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <Icon name="Trash2" size={15} />
                    </button>

                    {/* Сумма строки */}
                    <div className="md:hidden col-span-full text-right text-sm font-semibold text-black/60">
                      Сумма: {fmt(getTotal(it))} руб.
                    </div>
                  </div>
                ))}
              </div>

              {/* Итог */}
              <div className="mt-5 pt-4 border-t border-black/6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a0a6e]/6 text-[#1a0a6e] text-sm font-semibold hover:bg-[#1a0a6e]/12 transition-colors"
                >
                  <Icon name="Plus" size={15} />
                  Добавить позицию
                </button>
                <div className="text-right">
                  <div className="text-xs text-black/40 mb-0.5">Итого без НДС</div>
                  <div className="font-display text-2xl font-black text-black">{fmt(grandTotal)} <span className="text-base font-semibold text-black/50">руб.</span></div>
                </div>
              </div>
            </div>

            {/* Ошибка */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-2xl px-5 py-4 text-sm">
                <Icon name="AlertCircle" size={16} />
                {error}
              </div>
            )}

            {/* Кнопка */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#1a0a6e] text-white font-semibold text-base hover:bg-[#0a0535] disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {loading
                ? <><Icon name="Loader" size={18} className="animate-spin" /> Формируем документ...</>
                : <><Icon name="FileDown" size={18} /> Сформировать КП</>
              }
            </button>

            <p className="text-center text-black/30 text-xs pb-4">
              Документ будет сформирован на основе вашего корпоративного шаблона
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
