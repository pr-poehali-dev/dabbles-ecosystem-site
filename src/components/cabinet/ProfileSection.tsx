import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";
import { request } from "@/lib/api";

export default function ProfileSection() {
  const { user } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const accessLabels = [
    { ok: user.access_tasks, label: "Задачи" },
    { ok: user.access_documents, label: "Документооборот" },
    { ok: user.access_crm, label: "CRM" },
  ];

  const change = async () => {
    setBusy(true);
    setMsg("");
    try {
      await request("dabbl-id", {
        method: "POST",
        query: { action: "change-password" },
        body: { old_password: oldPw, new_password: newPw },
      });
      setMsg("Пароль обновлён");
      setOldPw("");
      setNewPw("");
      setShowPw(false);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-black text-black mb-1">Профиль</h1>
      <p className="text-black/50 mb-8">Личная информация и доступы</p>

      <div className="bg-white rounded-3xl p-7 mb-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FD4160] to-[#0077FF] flex items-center justify-center text-white font-bold text-xl">
            {(user.full_name || user.email).substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-display text-xl font-bold text-black">{user.full_name || "—"}</div>
            <div className="text-sm text-black/50">{user.position || "Сотрудник"}</div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <Row label="Email" value={user.email} />
          <Row label="Роль" value={user.role === "admin" ? "Администратор" : "Сотрудник"} />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-7 mb-5">
        <div className="font-display text-lg font-bold text-black mb-4">Доступные разделы</div>
        <div className="grid sm:grid-cols-3 gap-3">
          {accessLabels.map((a) => (
            <div
              key={a.label}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border ${
                a.ok ? "border-green-200 bg-green-50 text-green-700" : "border-black/10 bg-black/3 text-black/40"
              }`}
            >
              <Icon name={a.ok ? "CheckCircle2" : "Circle"} size={16} />
              <span className="text-sm font-medium">{a.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-black/40 mt-4">
          {user.role === "admin"
            ? "У администратора есть доступ ко всем разделам."
            : "Изменить доступы может только администратор."}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-7">
        <button
          onClick={() => setShowPw(!showPw)}
          className="flex items-center gap-2 text-sm font-semibold text-black/70 hover:text-black"
        >
          <Icon name="KeyRound" size={16} />
          Сменить пароль
          <Icon name={showPw ? "ChevronUp" : "ChevronDown"} size={14} />
        </button>
        {showPw && (
          <div className="mt-4 space-y-3">
            <input
              type="password"
              placeholder="Текущий пароль"
              value={oldPw}
              onChange={(e) => setOldPw(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black"
            />
            <input
              type="password"
              placeholder="Новый пароль"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black"
            />
            <button
              onClick={change}
              disabled={busy || !oldPw || !newPw}
              className="px-5 py-2.5 rounded-xl bg-black hover:bg-black/80 disabled:opacity-50 text-white font-semibold text-sm"
            >
              {busy ? "..." : "Сохранить"}
            </button>
            {msg && <div className="text-sm text-black/60">{msg}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-black/5 last:border-0">
      <span className="text-black/45">{label}</span>
      <span className="text-black font-medium">{value}</span>
    </div>
  );
}