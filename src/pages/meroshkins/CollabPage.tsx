import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { mApi } from "@/lib/meroshkins";

interface Collaborator {
  id: number;
  invite_email: string;
  role: string;
  status: string;
  created_at: string;
  full_name: string | null;
  email: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Ожидает",
  accepted: "Принят",
  revoked: "Отозван",
};
const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  accepted: "bg-emerald-50 text-emerald-600",
  revoked: "bg-black/5 text-black/30",
};

export default function CollabPage() {
  const [list, setList] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [saving, setSaving] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const d = await mApi.collaborators();
      setList(d.collaborators);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const invite = async () => {
    if (!email.trim()) return;
    setSaving(true); setErr("");
    try {
      const d = await mApi.inviteCollaborator(email, role);
      const link = `${window.location.origin}/meroshkins/invite?token=${d.token}`;
      setInviteLink(link);
      setEmail(""); load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally { setSaving(false); }
  };

  const revoke = async (id: number) => {
    if (!confirm("Отозвать доступ?")) return;
    await mApi.revokeCollaborator(id);
    load();
  };

  const copy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-bold text-black tracking-[-0.5px] mb-0.5">Совместный доступ</h1>
          <p className="text-[13px] text-black/40">Пригласите коллег редактировать ваш календарь</p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); setInviteLink(""); setErr(""); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#7c3aed] text-white text-[13px] font-semibold hover:bg-[#6d28d9] transition-colors"
        >
          <Icon name="UserPlus" size={14} />
          Пригласить
        </button>
      </div>

      {/* ФОРМА */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-black/6 p-6 mb-4">
          <p className="text-[13px] text-black/50 mb-4 leading-relaxed">
            Введите email коллеги. Если он уже зарегистрирован в Даббл — доступ откроется сразу. Иначе получит ссылку-инвайт.
          </p>
          <div className="flex gap-2 mb-3">
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@company.ru"
              className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 text-[14px] outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/10 transition-all"
              onKeyDown={e => e.key === "Enter" && invite()}
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-black/10 text-[13px] outline-none bg-white"
            >
              <option value="editor">Редактор</option>
              <option value="viewer">Просмотр</option>
            </select>
            <button
              onClick={invite}
              disabled={saving || !email.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#7c3aed] text-white text-[13px] font-semibold disabled:opacity-40 hover:bg-[#6d28d9] transition-colors"
            >
              {saving ? <Icon name="Loader" size={14} className="animate-spin" /> : "Отправить"}
            </button>
          </div>
          {err && <p className="text-red-500 text-[12px]">{err}</p>}
          {inviteLink && (
            <div className="mt-3 p-3 bg-[#f5f3ff] rounded-xl">
              <p className="text-[11px] text-[#7c3aed] font-semibold mb-1.5">Ссылка-приглашение</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-black/50 flex-1 truncate">{inviteLink}</span>
                <button onClick={copy} className="shrink-0 px-3 py-1 rounded-lg bg-[#7c3aed] text-white text-[11px] font-semibold flex items-center gap-1">
                  <Icon name={copied ? "Check" : "Copy"} size={12} />
                  {copied ? "Скопировано" : "Копировать"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* СПИСОК */}
      {loading ? (
        <div className="flex justify-center py-16"><Icon name="Loader" size={20} className="animate-spin text-black/20" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-4">
            <Icon name="Users" size={22} className="text-black/25" />
          </div>
          <p className="text-[15px] font-medium text-black/40">Нет соавторов</p>
          <p className="text-[13px] text-black/25 mt-1">Пригласите коллег для совместной работы</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {list.map(c => (
            <div key={c.id} className="flex items-center gap-3 bg-white rounded-2xl border border-black/6 px-4 py-3.5">
              <div className="w-8 h-8 rounded-full bg-[#7c3aed]/10 flex items-center justify-center shrink-0">
                <span className="text-[#7c3aed] text-[12px] font-bold">
                  {(c.full_name || c.invite_email)[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-black truncate">
                  {c.full_name || c.invite_email}
                </div>
                <div className="text-[11px] text-black/40">{c.invite_email} · {c.role === "editor" ? "Редактор" : "Просмотр"}</div>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[c.status] || "bg-black/5 text-black/40"}`}>
                {STATUS_LABEL[c.status] || c.status}
              </span>
              {c.status !== "revoked" && (
                <button onClick={() => revoke(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-black/20 hover:text-red-400 transition-colors">
                  <Icon name="X" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 rounded-2xl bg-[#f5f5f7]">
        <p className="text-[12px] text-black/40 leading-relaxed">
          <span className="font-semibold text-black/60">Редактор</span> — может создавать, изменять и удалять мероприятия, площадки и залы.{" "}
          <span className="font-semibold text-black/60">Просмотр</span> — только смотрит ваш календарь.
        </p>
      </div>
    </div>
  );
}
