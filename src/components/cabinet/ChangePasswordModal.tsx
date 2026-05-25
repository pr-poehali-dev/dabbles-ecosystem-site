import { useState, FormEvent } from "react";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { refresh } = useAuth();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await request("dabbl-id", {
        method: "POST",
        query: { action: "change-password" },
        body: { old_password: oldPw, new_password: newPw },
      });
      await refresh();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#FD4160]/10 flex items-center justify-center">
            <Icon name="KeyRound" size={20} className="text-[#FD4160]" />
          </div>
          <h2 className="font-display text-xl font-black text-black">Смените пароль</h2>
        </div>
        <p className="text-sm text-black/55 mb-5">
          Это первый вход. Для безопасности задайте новый пароль.
        </p>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            required
            placeholder="Текущий пароль"
            value={oldPw}
            onChange={(e) => setOldPw(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Новый пароль (минимум 6 символов)"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black"
          />
          {err && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm">{err}</div>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-[#FD4160] hover:bg-[#e0324f] disabled:opacity-60 text-white font-semibold"
          >
            {busy ? "Сохраняем..." : "Сохранить"}
          </button>
        </form>
      </div>
    </div>
  );
}