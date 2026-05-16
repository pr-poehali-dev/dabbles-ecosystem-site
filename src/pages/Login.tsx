import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      nav("/cabinet");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f0f5] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10">
        <Link to="/" className="flex items-center gap-2 mb-7 text-black/40 hover:text-black text-sm">
          <Icon name="ArrowLeft" size={16} /> На сайт
        </Link>
        <h1 className="font-display text-3xl font-black text-black mb-2">Вход в кабинет</h1>
        <p className="text-black/50 text-sm mb-8">Доступ выдаётся администратором</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-black/50 font-medium mb-1.5 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-black/30 outline-none transition-colors text-black"
              placeholder="name@company.ru"
            />
          </div>
          <div>
            <label className="text-xs text-black/50 font-medium mb-1.5 block">Пароль</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-black/30 outline-none transition-colors text-black"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-[#FD4160] hover:bg-[#e0324f] disabled:opacity-60 text-white font-semibold transition-colors"
          >
            {busy ? "Входим..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
