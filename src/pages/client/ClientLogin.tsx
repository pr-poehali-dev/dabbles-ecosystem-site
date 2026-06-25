import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cpApi, setCpToken } from "@/lib/client-api";
import Icon from "@/components/ui/icon";

export default function ClientLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await cpApi.login(email.trim().toLowerCase(), password);
      setCpToken(r.token);
      navigate("/client/cases");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f0f8] to-[#e8e4f8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a0a6e] mb-4">
            <Icon name="Scale" size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-black tracking-tight">Личный кабинет</h1>
          <p className="text-black/45 text-sm mt-1">Введите данные для входа</p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm border border-black/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[12px] font-semibold text-black/50 mb-1.5 block">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required autoFocus placeholder="your@email.ru"
                className="w-full px-4 py-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:border-[#1a0a6e]/50 bg-[#f7f7fa]"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-black/50 mb-1.5 block">Пароль</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  required placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-black/10 text-sm focus:outline-none focus:border-[#1a0a6e]/50 bg-[#f7f7fa]"
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60">
                  <Icon name={showPw ? "EyeOff" : "Eye"} size={16} />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
                <Icon name="AlertCircle" size={14} className="text-red-500 shrink-0" />
                <span className="text-red-600 text-[13px]">{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1a0a6e] text-white font-semibold text-sm hover:bg-[#2d1a8e] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {loading && <Icon name="Loader2" size={15} className="animate-spin" />}
              Войти
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-black/30 mt-6">
          Доступ только по приглашению. Если возникли проблемы со входом — обратитесь к вашему менеджеру.
        </p>
      </div>
    </div>
  );
}
