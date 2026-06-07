import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";

type Info = {
  full_name: string; position: string; description: string;
  quote: string; quote_source: string; email: string; photo_url: string;
};
type BioItem = { id: number; year_label: string; title: string; body: string; sort_order: number };
type Photo = { id: number; url: string; caption: string; sort_order: number };

const emptyBio: Omit<BioItem, "id"> = { year_label: "", title: "", body: "", sort_order: 0 };

export default function AdminDirector() {
  const [info, setInfo] = useState<Info | null>(null);
  const [bio, setBio] = useState<BioItem[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tab, setTab] = useState<"info" | "bio" | "photos">("info");
  const [saving, setSaving] = useState(false);
  const [infoForm, setInfoForm] = useState<Info>({ full_name: "", position: "", description: "", quote: "", quote_source: "", email: "", photo_url: "" });
  const [bioEdit, setBioEdit] = useState<(BioItem & { _new?: boolean }) | null>(null);
  const [bioForm, setBioForm] = useState<Omit<BioItem, "id">>(emptyBio);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const d = await request<{ info: Info; bio: BioItem[]; photos: Photo[] }>("public-data", { query: { action: "director" }, auth: false });
    setInfo(d.info);
    setInfoForm(d.info);
    setBio(d.bio);
    setPhotos(d.photos);
  };

  useEffect(() => { load(); }, []);

  const saveInfo = async () => {
    setSaving(true);
    try {
      await request("admin-users", { method: "PUT", query: { action: "director-info-update" }, body: infoForm });
      await load();
    } finally { setSaving(false); }
  };

  const saveBio = async () => {
    setSaving(true);
    try {
      if (bioEdit && !bioEdit._new) {
        await request("admin-users", { method: "PUT", query: { action: "director-bio-update" }, body: { id: bioEdit.id, ...bioForm } });
      } else {
        await request("admin-users", { method: "POST", query: { action: "director-bio-create" }, body: bioForm });
      }
      setBioEdit(null);
      await load();
    } finally { setSaving(false); }
  };

  const deleteBio = async (id: number) => {
    if (!confirm("Удалить запись?")) return;
    await request("admin-users", { method: "DELETE", query: { action: "director-bio-delete" }, body: { id } });
    await load();
  };

  const deletePhoto = async (id: number) => {
    if (!confirm("Удалить фото?")) return;
    await request("admin-users", { method: "DELETE", query: { action: "director-photo-delete" }, body: { id } });
    await load();
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const ext = file.name.split(".").pop() || "jpg";
        const res = await request<{ url: string }>("content", {
          method: "POST",
          query: { action: "upload" },
          body: { file: base64, ext, folder: "director" },
        });
        await request("admin-users", { method: "POST", query: { action: "director-photo-add" }, body: { url: res.url, caption: "", sort_order: photos.length * 10 } });
        await load();
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch { setUploading(false); }
  };

  const Field = ({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) => (
    <div>
      <label className="text-xs text-black/50 mb-1.5 block font-medium">{label}</label>
      {multiline ? (
        <textarea rows={4} value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-[#1a0a6e]/40 focus:outline-none text-sm resize-none" />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-[#1a0a6e]/40 focus:outline-none text-sm" />
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-black text-black mb-1">Страница директора</h1>
          <p className="text-black/50 text-sm">Содержимое страницы /director</p>
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex gap-1 mb-6 bg-black/5 rounded-xl p-1 w-fit">
        {(["info", "bio", "photos"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-white text-black shadow-sm" : "text-black/50 hover:text-black"}`}>
            {t === "info" ? "Основное" : t === "bio" ? "Биография" : "Фотографии"}
          </button>
        ))}
      </div>

      {/* ОСНОВНОЕ */}
      {tab === "info" && infoForm && (
        <div className="bg-white rounded-2xl p-6 border border-black/6 max-w-2xl space-y-4">
          <div className="flex gap-4 items-start">
            {infoForm.photo_url && (
              <img src={infoForm.photo_url} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            )}
            <Field label="URL фото" value={infoForm.photo_url} onChange={v => setInfoForm({ ...infoForm, photo_url: v })} />
          </div>
          <Field label="Имя" value={infoForm.full_name} onChange={v => setInfoForm({ ...infoForm, full_name: v })} />
          <Field label="Должность" value={infoForm.position} onChange={v => setInfoForm({ ...infoForm, position: v })} />
          <Field label="Описание (под именем)" value={infoForm.description} onChange={v => setInfoForm({ ...infoForm, description: v })} multiline />
          <Field label="Email" value={infoForm.email} onChange={v => setInfoForm({ ...infoForm, email: v })} />
          <Field label="Цитата" value={infoForm.quote} onChange={v => setInfoForm({ ...infoForm, quote: v })} multiline />
          <Field label="Источник цитаты" value={infoForm.quote_source} onChange={v => setInfoForm({ ...infoForm, quote_source: v })} />
          <button onClick={saveInfo} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#1a0a6e] text-white font-semibold text-sm hover:bg-[#0a0535] disabled:opacity-50 flex items-center gap-2">
            {saving && <Icon name="Loader" size={14} className="animate-spin" />}
            Сохранить
          </button>
        </div>
      )}

      {/* БИОГРАФИЯ */}
      {tab === "bio" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-black/6 overflow-hidden">
            {bio.length === 0 && <div className="px-6 py-10 text-center text-black/35 text-sm">Нет записей</div>}
            {bio.map(item => (
              <div key={item.id} className="flex items-start gap-3 px-5 py-4 border-b border-black/5 last:border-0 hover:bg-black/2">
                <div className="shrink-0 w-20 text-xs font-bold text-[#1a0a6e]/60 pt-0.5">{item.year_label}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-black text-sm">{item.title}</div>
                  <div className="text-black/50 text-xs mt-0.5 line-clamp-2">{item.body}</div>
                </div>
                <button onClick={() => { setBioEdit(item); setBioForm({ year_label: item.year_label, title: item.title, body: item.body, sort_order: item.sort_order }); }}
                  className="p-1.5 rounded-lg hover:bg-black/8 text-black/40 hover:text-black transition-colors shrink-0">
                  <Icon name="Pencil" size={14} />
                </button>
                <button onClick={() => deleteBio(item.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-black/30 hover:text-red-500 transition-colors shrink-0">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => { setBioEdit({ id: 0, ...emptyBio, _new: true }); setBioForm(emptyBio); }}
            className="px-5 py-2.5 rounded-xl bg-[#1a0a6e] text-white font-semibold text-sm flex items-center gap-2">
            <Icon name="Plus" size={16} /> Добавить этап
          </button>
        </div>
      )}

      {/* ФОТО */}
      {tab === "photos" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {photos.map(p => (
              <div key={p.id} className="relative group rounded-xl overflow-hidden aspect-square bg-black/5">
                <img src={p.url} className="w-full h-full object-cover" />
                <button onClick={() => deletePhoto(p.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ))}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="aspect-square rounded-xl border-2 border-dashed border-black/15 flex flex-col items-center justify-center gap-2 hover:border-[#1a0a6e]/40 hover:bg-[#1a0a6e]/3 transition-colors text-black/35 hover:text-[#1a0a6e]">
              {uploading ? <Icon name="Loader" size={20} className="animate-spin" /> : <Icon name="Plus" size={24} />}
              <span className="text-xs font-medium">{uploading ? "Загрузка..." : "Добавить"}</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
        </div>
      )}

      {/* Модалка биографии */}
      {bioEdit && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setBioEdit(null)}>
          <div className="bg-white rounded-3xl p-7 w-full max-w-md space-y-3" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-xl font-black text-black mb-2">{bioEdit._new ? "Новый этап" : "Редактировать"}</h2>
            <Field label="Период (например 2010–2018)" value={bioForm.year_label} onChange={v => setBioForm({ ...bioForm, year_label: v })} />
            <Field label="Заголовок" value={bioForm.title} onChange={v => setBioForm({ ...bioForm, title: v })} />
            <Field label="Текст" value={bioForm.body} onChange={v => setBioForm({ ...bioForm, body: v })} multiline />
            <Field label="Порядок сортировки" value={String(bioForm.sort_order)} onChange={v => setBioForm({ ...bioForm, sort_order: Number(v) || 0 })} />
            <div className="flex gap-2 pt-1">
              <button onClick={saveBio} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#1a0a6e] text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Icon name="Loader" size={14} className="animate-spin" />}
                Сохранить
              </button>
              <button onClick={() => setBioEdit(null)} className="px-4 py-2.5 rounded-xl bg-black/6 text-black font-semibold text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
