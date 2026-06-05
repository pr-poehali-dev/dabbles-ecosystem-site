import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { exchangeYandexCode } from "@/lib/yandexAuth";
import { useAuth } from "@/lib/auth";

export default function YandexCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = params.get("code");
    const err  = params.get("error");

    if (err) {
      setError(err === "access_denied" ? "Вы отменили вход через Яндекс" : `Ошибка Яндекса: ${err}`);
      return;
    }

    if (!code) {
      setError("Не получен код авторизации от Яндекса");
      return;
    }

    exchangeYandexCode(code)
      .then(({ user }) => {
        setUser(user);
        navigate("/meroshkins", { replace: true });
      })
      .catch(e => {
        setError(e.message || "Ошибка входа через Яндекс");
      });
  }, []);

  return (
    <div
      className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6"
      style={{ fontFamily: "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif" }}
    >
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#7c3aed]/25">
          <Icon name="CalendarDays" size={28} className="text-white" />
        </div>

        {error ? (
          <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-8">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Icon name="X" size={22} className="text-red-400" />
            </div>
            <h2 className="text-[17px] font-bold text-black mb-2">Не удалось войти</h2>
            <p className="text-[13px] text-black/45 mb-6">{error}</p>
            <button
              onClick={() => navigate("/meroshkins/promo")}
              className="w-full py-3 rounded-2xl bg-[#7c3aed] text-white text-[14px] font-semibold hover:bg-[#6d28d9] transition-colors"
            >
              Вернуться назад
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-8">
            <div className="w-10 h-10 border-2 border-[#7c3aed]/20 border-t-[#7c3aed] rounded-full animate-spin mx-auto mb-5" />
            <p className="text-[15px] font-semibold text-black mb-1">Входим через Яндекс</p>
            <p className="text-[13px] text-black/35">Секунду…</p>
          </div>
        )}
      </div>
    </div>
  );
}
