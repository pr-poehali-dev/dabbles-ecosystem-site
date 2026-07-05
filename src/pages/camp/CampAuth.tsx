import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { campApi, setCampToken } from "@/lib/camp-api";
import Icon from "@/components/ui/icon";

const LOGO = "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/a4c91874-6ec5-442c-be38-6a949286b9b1.png";

export default function CampAuth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(params.get("mode") === "register" ? "register" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "register" && fullName.trim().split(/\s+/).filter(Boolean).length < 2) {
      setError("Укажите полное ФИО (фамилия и имя) — оно попадёт на сертификат");
      return;
    }
    setLoading(true);
    try {
      const r = mode === "login"
        ? await campApi.login(email.trim().toLowerCase(), password)
        : await campApi.register(email.trim().toLowerCase(), password, fullName.trim());
      setCampToken(r.token);
      navigate("/camp/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 font-body">
      <div className="w-full max-w-sm">
        <Link to="/camp" className="flex items-center justify-center gap-2.5 mb-8">
          <img src={LOGO} alt="Кэмп" className="h-10 w-10 rounded-xl" />
          <span className="font-display font-black text-2xl tracking-tight">Кэмп</span>
        </Link>

        <div className="flex bg-black/5 rounded-2xl p-1 mb-6">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
              mode === "login" ? "bg-white text-black shadow-sm" : "text-black/40"
            }`}
          >
            Вход
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
              mode === "register" ? "bg-white text-black shadow-sm" : "text-black/40"
            }`}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <div>
              <input
                type="text" required placeholder="Фамилия Имя Отчество"
                value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#f5f5f7] border border-black/8 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#DAB332]/40"
              />
              <p className="text-[11px] text-black/35 mt-1.5 px-1">Укажите полностью — это имя будет напечатано на сертификате</p>
            </div>
          )}
          <input
            type="email" required placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-[#f5f5f7] border border-black/8 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#DAB332]/40"
          />
          <input
            type="password" required placeholder="Пароль" minLength={6}
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-[#f5f5f7] border border-black/8 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#DAB332]/40"
          />

          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 text-red-600 text-[13px]">
              <Icon name="AlertCircle" size={14} />
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl text-black font-bold text-[15px] transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}
          >
            {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>

        <Link to="/camp" className="block text-center mt-6 text-black/35 text-[13px] hover:text-black transition-colors">
          ← Вернуться на главную Кэмпа
        </Link>
      </div>
    </div>
  );
}