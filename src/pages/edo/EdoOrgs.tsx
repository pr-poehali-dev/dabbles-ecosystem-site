import { useEffect, useState } from "react";
import { edoApi, EdoOrg } from "@/lib/edo-api";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

export default function EdoOrgs() {
  const [orgs, setOrgs] = useState<EdoOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({ name: "", inn: "", kpp: "", address: "", email: "", phone: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const load = () => {
    setLoading(true);
    edoApi.orgs().then(r => setOrgs(r.orgs)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await edoApi.orgCreate(form);
      toast({ title: "Организация добавлена" });
      setShowForm(false);
      setForm({ name: "", inn: "", kpp: "", address: "", email: "", phone: "" });
      load();
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Организации</h1>
          <p className="text-black/40 text-sm">{orgs.length} организаций</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold hover:bg-[#2d1a8e] transition-colors">
          <Icon name="Plus" size={16} />
          <span className="hidden sm:inline">Добавить</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#1a0a6e]/20 border-t-[#1a0a6e] rounded-full animate-spin" />
        </div>
      ) : orgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-black/30 bg-white rounded-2xl border border-black/5">
          <Icon name="Building2" size={36} className="mb-3 opacity-40" />
          <p className="text-sm">Нет организаций</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-[#1a0a6e] text-sm font-semibold hover:underline">
            Добавить первую
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {orgs.map(org => (
            <div key={org.id} className="bg-white rounded-2xl border border-black/5 p-5 hover:border-[#1a0a6e]/20 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1a0a6e]/8 flex items-center justify-center shrink-0">
                  <Icon name="Building2" size={18} className="text-[#1a0a6e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-black text-[14px] leading-snug">{org.name}</div>
                  {org.inn && <div className="text-[11px] text-black/40 mt-0.5">ИНН: {org.inn}</div>}
                  {org.email && (
                    <div className="flex items-center gap-1 mt-2 text-[12px] text-black/50">
                      <Icon name="Mail" size={11} />
                      {org.email}
                    </div>
                  )}
                  {org.phone && (
                    <div className="flex items-center gap-1 text-[12px] text-black/50">
                      <Icon name="Phone" size={11} />
                      {org.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модалка добавления */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-black text-black text-lg mb-5">Новая организация</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { k: "name", label: "Название *", placeholder: "ООО «Пример»" },
                { k: "inn", label: "ИНН", placeholder: "1234567890" },
                { k: "kpp", label: "КПП", placeholder: "123456789" },
                { k: "address", label: "Адрес", placeholder: "г. Москва, ул. Примерная, 1" },
                { k: "email", label: "Email", placeholder: "info@example.ru" },
                { k: "phone", label: "Телефон", placeholder: "+7 (000) 000-00-00" },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-[11px] font-semibold text-black/40 mb-1 block">{f.label}</label>
                  <input value={form[f.k as keyof typeof form]} onChange={e => set(f.k, e.target.value)}
                    placeholder={f.placeholder} required={f.k === "name"}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm focus:outline-none focus:border-[#1a0a6e]/40 bg-[#f5f5f7]" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm font-semibold text-black/60">
                  Отмена
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold disabled:opacity-50">
                  {saving ? "Сохраняю..." : "Добавить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
