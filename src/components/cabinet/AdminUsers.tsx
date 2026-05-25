import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { request, User } from "@/lib/api";

const emptyUser = {
  email: "",
  full_name: "",
  position: "",
  password: "temp1234",
  access_tasks: true,
  access_documents: true,
  access_crm: true,
};

const ORIGIN = typeof window !== "undefined" ? window.location.origin : "";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...emptyUser });
  const [loading, setLoading] = useState(true);
  const [tempInfo, setTempInfo] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const { users } = await request<{ users: User[] }>("admin-users");
      setUsers(users);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.email) return;
    // Отправляем приглашение через Даббл ID — сотрудник сам задаст пароль
    const res = await request<{ invite_url: string }>("admin-users", {
      method: "POST",
      query: { action: "invite-create" },
      body: {
        email: form.email,
        full_name: form.full_name,
        position: form.position,
        access_tasks: form.access_tasks,
        access_documents: form.access_documents,
        access_crm: form.access_crm,
      },
    });
    setTempInfo(`Приглашение создано. Отправьте сотруднику ссылку: ${ORIGIN}${res.invite_url}`);
    setCreating(false);
    setForm({ ...emptyUser });
    load();
  };

  const updateUser = async (u: User, patch: Partial<User>) => {
    await request("admin-users", { method: "PUT", body: { id: u.id, ...patch } });
    load();
  };

  const resetPassword = async (u: User) => {
    const pw = prompt("Новый временный пароль для " + u.email, "temp1234");
    if (!pw) return;
    await updateUser(u, { ...({ new_password: pw } as Partial<User>) });
    alert(`Пароль сброшен. Передайте сотруднику: ${pw}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-black text-black mb-1">Сотрудники</h1>
          <p className="text-black/50">Управление доступом в кабинет</p>
        </div>
        <button
          onClick={() => { setCreating(true); setForm({ ...emptyUser }); }}
          className="px-5 py-2.5 rounded-xl bg-[#FD4160] text-white font-semibold text-sm hover:bg-[#e0324f] flex items-center gap-2"
        >
          <Icon name="UserPlus" size={16} /> Пригласить
        </button>
      </div>

      {tempInfo && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-sm text-green-800 flex items-start gap-2">
          <Icon name="CheckCircle2" size={18} className="shrink-0 mt-0.5" />
          <div>{tempInfo}</div>
          <button onClick={() => setTempInfo("")} className="ml-auto text-green-600 hover:text-green-900">
            <Icon name="X" size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <Icon name="Loader" size={22} className="animate-spin text-black/30" />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden">
          {users.map((u, i) => (
            <div key={u.id} className={`p-4 flex flex-wrap items-center gap-4 ${i > 0 ? "border-t border-black/5" : ""} ${!u.is_active ? "opacity-50" : ""}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FD4160] to-[#0077FF] flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(u.full_name || u.email).substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="font-medium text-black">{u.full_name || u.email}</div>
                <div className="text-xs text-black/45">{u.email} · {u.position || (u.role === "admin" ? "Админ" : "Сотрудник")}</div>
              </div>
              <div className="flex gap-2 text-xs">
                <Toggle on={u.access_tasks} label="Задачи" onChange={(v) => updateUser(u, { access_tasks: v })} disabled={u.role === "admin"} />
                <Toggle on={u.access_documents} label="Доки" onChange={(v) => updateUser(u, { access_documents: v })} disabled={u.role === "admin"} />
                <Toggle on={u.access_crm} label="CRM" onChange={(v) => updateUser(u, { access_crm: v })} disabled={u.role === "admin"} />
              </div>
              {u.role !== "admin" && (
                <div className="flex gap-1">
                  <button onClick={() => setEditing(u)} className="p-2 rounded-lg hover:bg-black/5 text-black/50" title="Редактировать">
                    <Icon name="Pencil" size={15} />
                  </button>
                  <button onClick={() => resetPassword(u)} className="p-2 rounded-lg hover:bg-black/5 text-black/50" title="Сброс пароля">
                    <Icon name="KeyRound" size={15} />
                  </button>
                  <button
                    onClick={() => updateUser(u, { is_active: !u.is_active })}
                    className="p-2 rounded-lg hover:bg-black/5 text-black/50"
                    title={u.is_active ? "Отключить" : "Включить"}
                  >
                    <Icon name={u.is_active ? "UserX" : "UserCheck"} size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setCreating(false); setEditing(null); }}>
          <div className="bg-white rounded-3xl p-7 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl font-black text-black mb-5">
              {creating ? "Пригласить сотрудника" : "Редактировать"}
            </h2>
            <div className="space-y-3">
              {creating && (
                <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              )}
              <Input
                label="Имя"
                value={creating ? form.full_name : (editing?.full_name || "")}
                onChange={(v) => creating ? setForm({ ...form, full_name: v }) : setEditing({ ...editing!, full_name: v })}
              />
              <Input
                label="Должность"
                value={creating ? form.position : (editing?.position || "")}
                onChange={(v) => creating ? setForm({ ...form, position: v }) : setEditing({ ...editing!, position: v })}
              />
              {creating && (
                <div className="text-xs text-black/55 bg-[#FBF6EE] rounded-xl p-3">
                  <Icon name="Info" size={13} className="inline mr-1" />
                  Сотрудник получит ссылку-приглашение и сам задаст пароль через Даббл ID.
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setCreating(false); setEditing(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-black/5 text-black/70 font-semibold"
                >
                  Отмена
                </button>
                <button
                  onClick={async () => {
                    if (creating) {
                      await create();
                    } else if (editing) {
                      await updateUser(editing, { full_name: editing.full_name, position: editing.position });
                      setEditing(null);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-black text-white font-semibold"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({ on, label, onChange, disabled }: { on: boolean; label: string; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
        on ? "bg-green-100 text-green-700" : "bg-black/5 text-black/40"
      } ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {label}
    </button>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-black/50 mb-1.5 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black"
      />
    </div>
  );
}