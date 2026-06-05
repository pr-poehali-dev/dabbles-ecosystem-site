import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const STORAGE_KEY = "dabbl_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[999] flex justify-center pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-xl bg-white rounded-2xl shadow-2xl shadow-black/10 border border-black/8 px-5 py-4 flex items-start gap-4"
        style={{ backdropFilter: "blur(12px)" }}
      >
        <div className="w-8 h-8 rounded-xl bg-[#7c3aed]/8 flex items-center justify-center shrink-0 mt-0.5">
          <Icon name="Cookie" size={16} className="text-[#7c3aed]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-black/70 leading-relaxed">
            Мы используем файлы cookie для корректной работы сервиса и аналитики. Продолжая использование, вы соглашаетесь с{" "}
            <Link to="/privacy" className="text-[#7c3aed] hover:underline" onClick={accept}>
              политикой конфиденциальности
            </Link>
            .
          </p>
        </div>
        <button
          onClick={accept}
          className="shrink-0 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-[12px] font-semibold hover:bg-[#6d28d9] transition-colors whitespace-nowrap"
        >
          Принять
        </button>
      </div>
    </div>
  );
}
