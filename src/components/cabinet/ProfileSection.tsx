import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";

export default function ProfileSection() {
  const { user } = useAuth();
  if (!user) return null;

  const accessLabels = [
    { ok: user.access_tasks, label: "Задачи" },
    { ok: user.access_documents, label: "Документооборот" },
    { ok: user.access_crm, label: "CRM" },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-black text-black mb-1">Профиль</h1>
      <p className="text-black/50 mb-8">Личная информация теперь общая для всех сервисов Даббл</p>

      <div className="bg-white rounded-3xl p-7 mb-5">
        <div className="flex items-center gap-4 mb-6">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FD4160] to-[#0077FF] flex items-center justify-center text-white font-bold text-xl">
              {(user.full_name || user.email).substring(0, 2).toUpperCase()}
            </div>
          )}
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
        <Link
          to="/id/profile"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1a0a6e] hover:bg-[#0a0535] text-white font-semibold text-sm transition-colors"
        >
          <Icon name="IdCard" size={16} />
          Редактировать имя, фото, пароль и 2FA в Даббл ID
        </Link>
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
