import { useState } from "react";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";
import { CartItem, formatPrice } from "./constants";

interface VibeCartProps {
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (index: number, qty: number) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
}

export default function VibeCart({ items, onClose, onUpdateQty, onRemove, onClear }: VibeCartProps) {
  const [step, setStep] = useState<"cart" | "form" | "done">("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  const submit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Заполните имя и телефон");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await request("vibe-shop", {
        method: "POST", query: { action: "order" }, auth: false,
        body: {
          customer_name: name.trim(), phone: phone.trim(), address: address.trim(), comment: comment.trim(),
          items: items.map((it) => ({ name: it.name, size: it.size, price: it.price, qty: it.qty })),
          total,
        },
      });
      setStep("done");
      onClear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки заказа");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full overflow-y-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/6 shrink-0">
          <h2 className="font-display text-xl font-black text-black">
            {step === "cart" ? "Корзина" : step === "form" ? "Оформление заказа" : "Заказ принят"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 text-black/50">
            <Icon name="X" size={18} />
          </button>
        </div>

        {step === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <Icon name="ShoppingBag" size={32} className="mx-auto mb-3 text-black/15" />
                  <p className="text-black/40 text-sm">Корзина пуста</p>
                </div>
              ) : (
                items.map((it, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-[#f9f9f8]">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-black text-[14px] truncate">{it.name}</div>
                      <div className="text-black/40 text-[12px]">Размер: {it.size}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => onUpdateQty(i, it.qty - 1)} className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center text-black/50">
                        <Icon name="Minus" size={12} />
                      </button>
                      <span className="w-5 text-center text-[13px] font-bold">{it.qty}</span>
                      <button onClick={() => onUpdateQty(i, it.qty + 1)} className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center text-black/50">
                        <Icon name="Plus" size={12} />
                      </button>
                    </div>
                    <div className="w-16 text-right font-bold text-black text-[13px] shrink-0">{formatPrice(it.price * it.qty)}</div>
                    <button onClick={() => onRemove(i)} className="p-1 text-red-400 shrink-0">
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            {items.length > 0 && (
              <div className="p-5 border-t border-black/6 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-black/50 text-sm">Итого</span>
                  <span className="font-black text-black text-xl">{formatPrice(total)}</span>
                </div>
                <button
                  onClick={() => setStep("form")}
                  className="w-full py-3.5 rounded-2xl text-black font-bold text-[15px]"
                  style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}
                >
                  Оформить заказ
                </button>
              </div>
            )}
          </>
        )}

        {step === "form" && (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col">
            <div className="space-y-3 flex-1">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя"
                className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] border border-black/8 text-[14px] focus:outline-none" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон"
                className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] border border-black/8 text-[14px] focus:outline-none" />
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Адрес доставки (или самовывоз)"
                className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] border border-black/8 text-[14px] focus:outline-none" />
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Комментарий к заказу" rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] border border-black/8 text-[14px] focus:outline-none resize-none" />
              {error && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 text-red-600 text-[13px]">
                  <Icon name="AlertCircle" size={14} /> {error}
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-black/6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-black/50 text-sm">К оплате</span>
                <span className="font-black text-black text-xl">{formatPrice(total)}</span>
              </div>
              <button
                onClick={submit} disabled={submitting}
                className="w-full py-3.5 rounded-2xl text-black font-bold text-[15px] disabled:opacity-50"
                style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}
              >
                {submitting ? "Отправляем..." : "Подтвердить заказ"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}>
              <Icon name="Check" size={28} className="text-black" />
            </div>
            <h3 className="font-black text-black text-xl mb-2">Заказ принят!</h3>
            <p className="text-black/50 text-sm mb-6">Мы свяжемся с вами в ближайшее время для подтверждения</p>
            <button onClick={onClose} className="px-6 py-3 rounded-xl bg-black text-white font-bold text-sm">
              Продолжить покупки
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
