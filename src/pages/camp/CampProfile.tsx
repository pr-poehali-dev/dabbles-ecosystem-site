import { useEffect, useState } from "react";
import { campApi, CampStudent } from "@/lib/camp-api";
import Icon from "@/components/ui/icon";

export default function CampProfile() {
  const [student, setStudent] = useState<CampStudent | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    campApi.me().then((r) => {
      setStudent(r.student);
      setFullName(r.student.full_name || "");
      setPhone(r.student.phone || "");
    }).finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    if (fullName.trim().split(/\s+/).filter(Boolean).length < 2) {
      setError("Укажите полное ФИО (фамилия и имя) — оно попадёт на сертификат");
      return;
    }
    setSaving(true);
    try {
      const r = await campApi.profileUpdate(fullName.trim(), phone.trim());
      setStudent(r.student);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#DAB332]/30 border-t-[#DAB332] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-black mb-1">Мой профиль</h1>
        <p className="text-black/45 text-sm">ФИО должно быть указано полностью — именно оно будет напечатано на сертификате</p>
      </div>

      <form onSubmit={save} className="bg-white rounded-3xl p-6 border border-black/6 space-y-4">
        <div>
          <label className="text-xs text-black/40 font-semibold block mb-1.5">Email</label>
          <input value={student?.email || ""} disabled
            className="w-full px-4 py-3 rounded-2xl bg-black/5 border border-black/8 text-black/40 text-[15px]" />
        </div>
        <div>
          <label className="text-xs text-black/40 font-semibold block mb-1.5">ФИО (для сертификата)</label>
          <input
            value={fullName} onChange={(e) => setFullName(e.target.value)}
            placeholder="Фамилия Имя Отчество"
            className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] border border-black/8 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#DAB332]/40"
          />
        </div>
        <div>
          <label className="text-xs text-black/40 font-semibold block mb-1.5">Телефон</label>
          <input
            value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 900 000-00-00"
            className="w-full px-4 py-3 rounded-2xl bg-[#f5f5f7] border border-black/8 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#DAB332]/40"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 text-red-600 text-[13px]">
            <Icon name="AlertCircle" size={14} />
            {error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-green-50 text-green-700 text-[13px]">
            <Icon name="CheckCircle2" size={14} />
            Данные сохранены
          </div>
        )}

        <button
          type="submit" disabled={saving}
          className="w-full py-3.5 rounded-2xl text-black font-bold text-[15px] transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}
        >
          {saving ? <Icon name="Loader" size={16} className="animate-spin" /> : <Icon name="Check" size={16} />}
          Сохранить
        </button>
      </form>
    </div>
  );
}
