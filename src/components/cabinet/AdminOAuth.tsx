import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";

type OAuthApp = {
  id: number;
  client_id: string;
  client_secret: string;
  name: string;
  description: string;
  logo_url: string;
  redirect_uris: string;
  is_internal: boolean;
  is_active: boolean;
  created_at?: string;
};

const ORIGIN = typeof window !== "undefined" ? window.location.origin : "";

const emptyForm = {
  name: "",
  client_id: "",
  description: "",
  logo_url: "",
  redirect_uris: "",
};

export default function AdminOAuth() {
  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<OAuthApp | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [createdInfo, setCreatedInfo] = useState<{ client_id: string; client_secret: string } | null>(null);
  const [revealId, setRevealId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { apps } = await request<{ apps: OAuthApp[] }>("admin-users", { query: { action: "oauth-list" } });
      setApps(apps);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name) return;
    const res = await request<{ client_id: string; client_secret: string }>("admin-users", {
      method: "POST",
      query: { action: "oauth-create" },
      body: form,
    });
    setCreatedInfo(res);
    setCreating(false);
    setForm({ ...emptyForm });
    load();
  };

  const saveEdit = async () => {
    if (!editing) return;
    await request("admin-users", {
      method: "PUT",
      query: { action: "oauth-update" },
      body: {
        id: editing.id,
        name: editing.name,
        description: editing.description,
        logo_url: editing.logo_url,
        redirect_uris: editing.redirect_uris,
      },
    });
    setEditing(null);
    load();
  };

  const toggle = async (app: OAuthApp) => {
    await request("admin-users", {
      method: "PUT",
      query: { action: "oauth-update" },
      body: { id: app.id, is_active: !app.is_active },
    });
    load();
  };

  const rotateSecret = async (app: OAuthApp) => {
    if (!confirm(`Сбросить секрет для «${app.name}»? Старый перестанет работать.`)) return;
    const r = await request<{ client_secret: string }>("admin-users", {
      method: "POST",
      query: { action: "oauth-rotate-secret" },
      body: { id: app.id },
    });
    alert("Новый client_secret:\n\n" + r.client_secret + "\n\nСохраните его — больше он не покажется в открытом виде.");
    load();
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-black text-black mb-1">OAuth-приложения</h1>
          <p className="text-black/50">Сервисы, использующие Даббл ID для входа</p>
        </div>
        <button
          onClick={() => { setCreating(true); setForm({ ...emptyForm }); }}
          className="px-5 py-2.5 rounded-xl bg-[#1a0a6e] hover:bg-[#0a0535] text-white font-semibold text-sm flex items-center gap-2"
        >
          <Icon name="Plus" size={16} /> Зарегистрировать
        </button>
      </div>

      {/* CREATED INFO */}
      {createdInfo && (
        <div className="mb-5 p-5 bg-[#C1F089]/30 border border-[#7fa55c] rounded-2xl">
          <div className="flex items-start gap-3 mb-3">
            <Icon name="CheckCircle2" size={20} className="text-green-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-black mb-1">Приложение создано</div>
              <div className="text-sm text-black/70">Сохраните секрет — больше он не появится в открытом виде.</div>
            </div>
            <button onClick={() => setCreatedInfo(null)} className="text-black/40 hover:text-black">
              <Icon name="X" size={16} />
            </button>
          </div>
          <CodeRow label="client_id" value={createdInfo.client_id} onCopy={copy} />
          <CodeRow label="client_secret" value={createdInfo.client_secret} onCopy={copy} />
        </div>
      )}

      {loading ? (
        <Icon name="Loader" size={22} className="animate-spin text-black/30" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {apps.map((app) => (
            <div key={app.id} className={`bg-white rounded-2xl p-5 ${!app.is_active ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-3 mb-4">
                {app.logo_url ? (
                  <img src={app.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a0a6e] to-[#2d0060] flex items-center justify-center">
                    <Icon name="LayoutGrid" size={20} className="text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <div className="font-display text-lg font-bold text-black truncate">{app.name}</div>
                    {app.is_internal && (
                      <span className="text-[10px] uppercase tracking-wider bg-[#1a0a6e] text-white px-2 py-0.5 rounded-full font-bold">
                        Внутреннее
                      </span>
                    )}
                    {!app.is_active && (
                      <span className="text-[10px] uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                        Откл.
                      </span>
                    )}
                  </div>
                  {app.description && (
                    <div className="text-xs text-black/50 line-clamp-2">{app.description}</div>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <CodeRow label="client_id" value={app.client_id} onCopy={copy} />
                <CodeRow
                  label="client_secret"
                  value={revealId === app.id ? app.client_secret : "•".repeat(24)}
                  onCopy={copy}
                  rightSlot={
                    <button
                      onClick={() => setRevealId(revealId === app.id ? null : app.id)}
                      className="p-1 hover:bg-black/5 rounded text-black/50"
                      title={revealId === app.id ? "Скрыть" : "Показать"}
                    >
                      <Icon name={revealId === app.id ? "EyeOff" : "Eye"} size={13} />
                    </button>
                  }
                />
                <div className="text-[11px] text-black/40">
                  <Icon name="Link" size={11} className="inline mr-1" />
                  Redirect: <span className="text-black/65">{app.redirect_uris || "не задано"}</span>
                </div>
                <div className="text-[11px] text-black/40">
                  <Icon name="ExternalLink" size={11} className="inline mr-1" />
                  Кнопка входа:{" "}
                  <a
                    href={`/id/auth?client_id=${app.client_id}&redirect_uri=${encodeURIComponent(app.redirect_uris || "/")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0077FF] hover:underline break-all"
                  >
                    {ORIGIN}/id/auth?client_id={app.client_id}
                  </a>
                </div>
              </div>

              <div className="flex gap-1.5">
                {!app.is_internal && (
                  <button
                    onClick={() => setEditing(app)}
                    className="flex-1 py-2 rounded-lg bg-black/5 hover:bg-black/10 text-black/70 text-xs font-semibold"
                  >
                    Редактировать
                  </button>
                )}
                {!app.is_internal && (
                  <button
                    onClick={() => rotateSecret(app)}
                    className="p-2 rounded-lg bg-black/5 hover:bg-black/10 text-black/60"
                    title="Сбросить секрет"
                  >
                    <Icon name="RefreshCw" size={14} />
                  </button>
                )}
                {!app.is_internal && (
                  <button
                    onClick={() => toggle(app)}
                    className="p-2 rounded-lg bg-black/5 hover:bg-black/10 text-black/60"
                    title={app.is_active ? "Отключить" : "Включить"}
                  >
                    <Icon name={app.is_active ? "PowerOff" : "Power"} size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {(creating || editing) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setCreating(false); setEditing(null); }}>
          <div className="bg-white rounded-3xl p-7 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl font-black text-black mb-5">
              {creating ? "Новое OAuth-приложение" : "Редактировать"}
            </h2>
            <div className="space-y-3">
              <Field
                label="Название"
                value={creating ? form.name : (editing?.name || "")}
                onChange={(v) => creating ? setForm({ ...form, name: v }) : setEditing({ ...editing!, name: v })}
                placeholder="Например, Мобильное приложение Даббл"
              />
              {creating && (
                <Field
                  label="client_id (необязательно)"
                  value={form.client_id}
                  onChange={(v) => setForm({ ...form, client_id: v })}
                  placeholder="auto-generate"
                  hint="Латиница, без пробелов. Если пусто — сгенерируем."
                />
              )}
              <Field
                label="Описание"
                value={creating ? form.description : (editing?.description || "")}
                onChange={(v) => creating ? setForm({ ...form, description: v }) : setEditing({ ...editing!, description: v })}
                multiline
              />
              <Field
                label="Логотип (URL)"
                value={creating ? form.logo_url : (editing?.logo_url || "")}
                onChange={(v) => creating ? setForm({ ...form, logo_url: v }) : setEditing({ ...editing!, logo_url: v })}
                placeholder="https://..."
              />
              <Field
                label="Разрешённые redirect_uri"
                value={creating ? form.redirect_uris : (editing?.redirect_uris || "")}
                onChange={(v) => creating ? setForm({ ...form, redirect_uris: v }) : setEditing({ ...editing!, redirect_uris: v })}
                placeholder="https://app.example.com/callback"
                hint="Несколько — через запятую. Сервер проверит, что redirect_uri начинается с одного из них."
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setCreating(false); setEditing(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-black/5 text-black/70 font-semibold"
                >
                  Отмена
                </button>
                <button
                  onClick={creating ? create : saveEdit}
                  className="flex-1 py-2.5 rounded-xl bg-[#1a0a6e] text-white font-semibold"
                >
                  {creating ? "Создать" : "Сохранить"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CodeRow({
  label, value, onCopy, rightSlot,
}: { label: string; value: string; onCopy: (v: string) => void; rightSlot?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 bg-black/5 rounded-lg px-2.5 py-1.5">
      <span className="text-[10px] uppercase tracking-wider text-black/45 font-bold w-20 shrink-0">{label}</span>
      <code className="text-xs text-black/85 font-mono flex-1 truncate">{value}</code>
      <button
        onClick={() => onCopy(value)}
        className="p-1 hover:bg-black/10 rounded text-black/50"
        title="Скопировать"
      >
        <Icon name="Copy" size={13} />
      </button>
      {rightSlot}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, hint, multiline,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; multiline?: boolean }) {
  return (
    <div>
      <label className="text-xs text-black/50 mb-1.5 block font-medium">{label}</label>
      {multiline ? (
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-black/30 outline-none text-black"
        />
      )}
      {hint && <div className="text-[11px] text-black/40 mt-1">{hint}</div>}
    </div>
  );
}
