import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";

type Info = {
  full_name: string; position: string; description: string;
  quote: string; quote_source: string; email: string; photo_url: string;
};
type BioItem = { id: number; year_label: string; title: string; body: string; sort_order: number };
type Photo = { id: number; url: string; caption: string; sort_order: number };
type NewsItem = { id: number; title: string; category: string; date_label: string; image_url: string; link_url: string; body: string; sort_order: number };
type Social = { id: number; platform: string; label: string; url: string; sort_order: number };

type Tab = "info" | "bio" | "photos" | "news" | "socials";

// Вынесен наружу — фикс потери фокуса
function Field({ label, value, onChange, multiline, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-black/50 mb-1.5 block font-medium">{label}</label>
      {multiline ? (
        <textarea rows={4} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-[#1a0a6e]/40 focus:outline-none text-sm resize-none bg-white" />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:border-[#1a0a6e]/40 focus:outline-none text-sm bg-white" />
      )}
    </div>
  );
}

const emptyBio = { year_label: "", title: "", body: "", sort_order: 0 };
const emptyNews = { title: "", category: "", date_label: "", image_url: "", link_url: "", body: "", sort_order: 0 };

export default function AdminDirector() {
  const [infoForm, setInfoForm] = useState<Info>({ full_name: "", position: "", description: "", quote: "", quote_source: "", email: "", photo_url: "" });
  const [bio, setBio] = useState<BioItem[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [socials, setSocials] = useState<Social[]>([]);
  const [tab, setTab] = useState<Tab>("info");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const [bioModal, setBioModal] = useState<(Partial<BioItem> & { _new?: boolean }) | null>(null);
  const [bioForm, setBioForm] = useState({ ...emptyBio });
  const [newsModal, setNewsModal] = useState<(Partial<NewsItem> & { _new?: boolean }) | null>(null);
  const [newsForm, setNewsForm] = useState({ ...emptyNews });

  const photoRef = useRef<HTMLInputElement>(null);
  const newsImgRef = useRef<HTMLInputElement>(null);
  const mainPhotoRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const d = await request<{ info: Info; bio: BioItem[]; photos: Photo[]; news: NewsItem[]; socials: Social[] }>(
      "public-data", { query: { action: "director" }, auth: false }
    );
    setInfoForm(d.info || { full_name: "", position: "", description: "", quote: "", quote_source: "", email: "", photo_url: "" });
    setBio(d.bio || []);
    setPhotos(d.photos || []);
    setNews(d.news || []);
    setSocials(d.socials || []);
  };

  useEffect(() => { load(); }, []);

  // Загрузка файла в S3
  const uploadFile = (file: File, folder: string): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(",")[1];
        const ext = file.name.split(".").pop() || "jpg";
        const res = await request<{ url: string }>("content", {
          method: "POST", query: { action: "upload" }, body: { file: base64, ext, folder },
        });
        resolve(res.url);
      } catch (e) { reject(e); }
    };
    reader.readAsDataURL(file);
  });

  // Основное фото
  const handleMainPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading("main");
    try {
      const url = await uploadFile(file, "director");
      setInfoForm(f => ({ ...f, photo_url: url }));
    } finally { setUploading(null); e.target.value = ""; }
  };

  const saveInfo = async () => {
    setSaving(true);
    try {
      await request("admin-users", { method: "PUT", query: { action: "director-info-update" }, body: infoForm });
      await load();
    } finally { setSaving(false); }
  };

  // БИО
  const saveBio = async () => {
    setSaving(true);
    try {
      if (bioModal && !bioModal._new && bioModal.id) {
        await request("admin-users", { method: "PUT", query: { action: "director-bio-update" }, body: { id: bioModal.id, ...bioForm } });
      } else {
        await request("admin-users", { method: "POST", query: { action: "director-bio-create" }, body: bioForm });
      }
      setBioModal(null);
      await load();
    } finally { setSaving(false); }
  };
  const deleteBio = async (id: number) => {
    if (!confirm("Удалить?")) return;
    await request("admin-users", { method: "DELETE", query: { action: "director-bio-delete" }, body: { id } });
    await load();
  };

  // ФОТО
  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading("photo");
    try {
      const url = await uploadFile(file, "director-gallery");
      await request("admin-users", { method: "POST", query: { action: "director-photo-add" }, body: { url, caption: "", sort_order: photos.length * 10 } });
      await load();
    } finally { setUploading(null); e.target.value = ""; }
  };
  const deletePhoto = async (id: number) => {
    if (!confirm("Удалить?")) return;
    await request("admin-users", { method: "DELETE", query: { action: "director-photo-delete" }, body: { id } });
    await load();
  };

  // НОВОСТИ
  const handleNewsImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading("newsimg");
    try {
      const url = await uploadFile(file, "director-news");
      setNewsForm(f => ({ ...f, image_url: url }));
    } finally { setUploading(null); e.target.value = ""; }
  };
  const saveNews = async () => {
    setSaving(true);
    try {
      if (newsModal && !newsModal._new && newsModal.id) {
        await request("admin-users", { method: "PUT", query: { action: "director-news-update" }, body: { id: newsModal.id, ...newsForm } });
      } else {
        await request("admin-users", { method: "POST", query: { action: "director-news-create" }, body: newsForm });
      }
      setNewsModal(null);
      await load();
    } finally { setSaving(false); }
  };
  const deleteNews = async (id: number) => {
    if (!confirm("Удалить?")) return;
    await request("admin-users", { method: "DELETE", query: { action: "director-news-delete" }, body: { id } });
    await load();
  };

  // СОЦСЕТИ
  const saveSocial = async (s: Social) => {
    await request("admin-users", { method: "PUT", query: { action: "director-social-update" }, body: s });
    await load();
  };
  const addSocial = async () => {
    await request("admin-users", { method: "POST", query: { action: "director-social-create" }, body: { platform: "link", label: "Новая сеть", url: "", sort_order: socials.length * 10 } });
    await load();
  };
  const deleteSocial = async (id: number) => {
    if (!confirm("Удалить?")) return;
    await request("admin-users", { method: "DELETE", query: { action: "director-social-delete" }, body: { id } });
    await load();
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "info", label: "Основное" },
    { key: "bio", label: "Биография" },
    { key: "photos", label: "Фотографии" },
    { key: "news", label: "Новости" },
    { key: "socials", label: "Соцсети" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-black text-black mb-1">Страница директора</h1>
        <p className="text-black/50 text-sm">Содержимое страницы /director</p>
      </div>

      <div className="flex gap-1 mb-6 bg-black/5 rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-white text-black shadow-sm" : "text-black/50 hover:text-black"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ОСНОВНОЕ */}
      {tab === "info" && (
        <div className="bg-white rounded-2xl p-6 border border-black/6 max-w-2xl space-y-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              {infoForm.photo_url
                ? <img src={infoForm.photo_url} className="w-20 h-20 rounded-xl object-cover" />
                : <div className="w-20 h-20 rounded-xl bg-black/6 flex items-center justify-center"><Icon name="User" size={28} className="text-black/30" /></div>
              }
              <button onClick={() => mainPhotoRef.current?.click()}
                className="mt-2 w-20 text-center text-xs text-[#1a0a6e] font-medium hover:underline block">
                {uploading === "main" ? "Загрузка..." : "Сменить фото"}
              </button>
              <input ref={mainPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleMainPhoto} />
            </div>
            <div className="flex-1">
              <Field label="Имя и фамилия" value={infoForm.full_name} onChange={v => setInfoForm(f => ({ ...f, full_name: v }))} />
            </div>
          </div>
          <Field label="Должность" value={infoForm.position} onChange={v => setInfoForm(f => ({ ...f, position: v }))} />
          <Field label="Описание (под именем на странице)" value={infoForm.description} onChange={v => setInfoForm(f => ({ ...f, description: v }))} multiline />
          <Field label="Email" value={infoForm.email} onChange={v => setInfoForm(f => ({ ...f, email: v }))} placeholder="ceo@example.ru" />
          <Field label="Цитата" value={infoForm.quote} onChange={v => setInfoForm(f => ({ ...f, quote: v }))} multiline />
          <Field label="Источник цитаты" value={infoForm.quote_source} onChange={v => setInfoForm(f => ({ ...f, quote_source: v }))} placeholder="Из интервью, январь 2026" />
          <button onClick={saveInfo} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#1a0a6e] text-white font-semibold text-sm hover:bg-[#0a0535] disabled:opacity-50 flex items-center gap-2">
            {saving && <Icon name="Loader" size={14} className="animate-spin" />}
            Сохранить
          </button>
        </div>
      )}

      {/* БИО */}
      {tab === "bio" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-black/6 overflow-hidden">
            {bio.length === 0 && <div className="px-6 py-10 text-center text-black/35 text-sm">Нет записей. Добавьте первый этап биографии.</div>}
            {bio.map(item => (
              <div key={item.id} className="flex items-start gap-3 px-5 py-4 border-b border-black/5 last:border-0 hover:bg-black/2">
                <div className="shrink-0 w-24 text-xs font-bold text-[#1a0a6e]/60 pt-0.5">{item.year_label}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-black text-sm">{item.title}</div>
                  <div className="text-black/50 text-xs mt-0.5 line-clamp-2">{item.body}</div>
                </div>
                <button onClick={() => { setBioModal(item); setBioForm({ year_label: item.year_label, title: item.title, body: item.body, sort_order: item.sort_order }); }}
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
          <button onClick={() => { setBioModal({ _new: true }); setBioForm({ ...emptyBio }); }}
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
            <button onClick={() => photoRef.current?.click()} disabled={uploading === "photo"}
              className="aspect-square rounded-xl border-2 border-dashed border-black/15 flex flex-col items-center justify-center gap-2 hover:border-[#1a0a6e]/40 hover:bg-[#1a0a6e]/3 transition-colors text-black/35 hover:text-[#1a0a6e]">
              {uploading === "photo" ? <Icon name="Loader" size={20} className="animate-spin" /> : <Icon name="Plus" size={24} />}
              <span className="text-xs font-medium">{uploading === "photo" ? "Загрузка..." : "Загрузить"}</span>
            </button>
          </div>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
      )}

      {/* НОВОСТИ */}
      {tab === "news" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-black/6 overflow-hidden">
            {news.length === 0 && <div className="px-6 py-10 text-center text-black/35 text-sm">Нет новостей. Добавьте первую.</div>}
            {news.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-4 border-b border-black/5 last:border-0 hover:bg-black/2">
                {item.image_url && <img src={item.image_url} className="w-12 h-12 rounded-lg object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-black text-sm line-clamp-1">{item.title}</div>
                  <div className="text-black/40 text-xs mt-0.5">{item.category} · {item.date_label}</div>
                </div>
                <button onClick={() => { setNewsModal(item); setNewsForm({ title: item.title, category: item.category, date_label: item.date_label, image_url: item.image_url, link_url: item.link_url, body: item.body || "", sort_order: item.sort_order }); }}
                  className="p-1.5 rounded-lg hover:bg-black/8 text-black/40 hover:text-black transition-colors shrink-0">
                  <Icon name="Pencil" size={14} />
                </button>
                <button onClick={() => deleteNews(item.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-black/30 hover:text-red-500 transition-colors shrink-0">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => { setNewsModal({ _new: true }); setNewsForm({ ...emptyNews }); }}
            className="px-5 py-2.5 rounded-xl bg-[#1a0a6e] text-white font-semibold text-sm flex items-center gap-2">
            <Icon name="Plus" size={16} /> Добавить новость
          </button>
        </div>
      )}

      {/* СОЦСЕТИ */}
      {tab === "socials" && (
        <div className="space-y-3 max-w-xl">
          <p className="text-black/45 text-sm mb-4">Ссылки на официальные аккаунты в соцсетях директора</p>
          {socials.map(s => (
            <SocialRow key={s.id} social={s} onSave={saveSocial} onDelete={deleteSocial} />
          ))}
          <button onClick={addSocial}
            className="px-5 py-2.5 rounded-xl bg-[#1a0a6e] text-white font-semibold text-sm flex items-center gap-2">
            <Icon name="Plus" size={16} /> Добавить соцсеть
          </button>
        </div>
      )}

      {/* Модалка биографии */}
      {bioModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setBioModal(null)}>
          <div className="bg-white rounded-3xl p-7 w-full max-w-md space-y-3" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-xl font-black mb-2">{bioModal._new ? "Новый этап" : "Редактировать"}</h2>
            <Field label="Период (например 2010–2018)" value={bioForm.year_label} onChange={v => setBioForm(f => ({ ...f, year_label: v }))} />
            <Field label="Заголовок" value={bioForm.title} onChange={v => setBioForm(f => ({ ...f, title: v }))} />
            <Field label="Текст" value={bioForm.body} onChange={v => setBioForm(f => ({ ...f, body: v }))} multiline />
            <Field label="Порядок сортировки" value={String(bioForm.sort_order)} onChange={v => setBioForm(f => ({ ...f, sort_order: Number(v) || 0 }))} />
            <div className="flex gap-2 pt-1">
              <button onClick={saveBio} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#1a0a6e] text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Icon name="Loader" size={14} className="animate-spin" />} Сохранить
              </button>
              <button onClick={() => setBioModal(null)} className="px-4 py-2.5 rounded-xl bg-black/6 text-black font-semibold text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка новости */}
      {newsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setNewsModal(null)}>
          <div className="bg-white rounded-3xl p-7 w-full max-w-md space-y-3" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-xl font-black mb-2">{newsModal._new ? "Новая новость" : "Редактировать"}</h2>
            <Field label="Заголовок" value={newsForm.title} onChange={v => setNewsForm(f => ({ ...f, title: v }))} />
            <Field label="Категория" value={newsForm.category} onChange={v => setNewsForm(f => ({ ...f, category: v }))} placeholder="Например: Технологии" />
            <Field label="Дата" value={newsForm.date_label} onChange={v => setNewsForm(f => ({ ...f, date_label: v }))} placeholder="7 июня" />
            <div>
              <label className="text-xs text-black/50 mb-1.5 block font-medium">Обложка новости</label>
              <div className="flex items-center gap-3">
                {newsForm.image_url && <img src={newsForm.image_url} className="w-14 h-14 rounded-lg object-cover shrink-0" />}
                <button onClick={() => newsImgRef.current?.click()} disabled={uploading === "newsimg"}
                  className="px-3 py-2 rounded-lg border border-black/10 text-sm text-black/60 hover:text-black hover:border-black/25 transition-colors flex items-center gap-2">
                  {uploading === "newsimg" ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Upload" size={14} />}
                  {uploading === "newsimg" ? "Загрузка..." : "Загрузить"}
                </button>
                <input ref={newsImgRef} type="file" accept="image/*" className="hidden" onChange={handleNewsImg} />
              </div>
            </div>
            <Field label="Описание (краткий текст новости)" value={newsForm.body} onChange={v => setNewsForm(f => ({ ...f, body: v }))} multiline />
            <Field label="Ссылка на новость (URL)" value={newsForm.link_url} onChange={v => setNewsForm(f => ({ ...f, link_url: v }))} placeholder="https://..." />
            <Field label="Порядок" value={String(newsForm.sort_order)} onChange={v => setNewsForm(f => ({ ...f, sort_order: Number(v) || 0 }))} />
            <div className="flex gap-2 pt-1">
              <button onClick={saveNews} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#1a0a6e] text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Icon name="Loader" size={14} className="animate-spin" />} Сохранить
              </button>
              <button onClick={() => setNewsModal(null)} className="px-4 py-2.5 rounded-xl bg-black/6 text-black font-semibold text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Строка редактирования соцсети
function SocialRow({ social, onSave, onDelete }: { social: Social; onSave: (s: Social) => void; onDelete: (id: number) => void }) {
  const [form, setForm] = useState(social);
  const [dirty, setDirty] = useState(false);

  const update = (patch: Partial<Social>) => { setForm(f => ({ ...f, ...patch })); setDirty(true); };

  const PLATFORMS = [
    { value: "telegram", label: "Telegram" },
    { value: "vk", label: "ВКонтакте" },
    { value: "ok", label: "Одноклассники" },
    { value: "youtube", label: "YouTube" },
    { value: "link", label: "Другое" },
  ];

  return (
    <div className="bg-white rounded-xl border border-black/6 p-4 space-y-2">
      <div className="flex gap-2">
        <select value={form.platform} onChange={e => update({ platform: e.target.value })}
          className="px-3 py-2 rounded-lg border border-black/10 text-sm bg-white focus:outline-none focus:border-[#1a0a6e]/40 shrink-0">
          {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <input type="text" value={form.label} onChange={e => update({ label: e.target.value })} placeholder="Название"
          className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm bg-white focus:outline-none focus:border-[#1a0a6e]/40" />
        <button onClick={() => onDelete(social.id)} className="p-2 rounded-lg hover:bg-red-50 text-black/30 hover:text-red-500 transition-colors">
          <Icon name="Trash2" size={14} />
        </button>
      </div>
      <input type="url" value={form.url} onChange={e => update({ url: e.target.value })} placeholder="https://..."
        className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm bg-white focus:outline-none focus:border-[#1a0a6e]/40" />
      {dirty && (
        <button onClick={() => { onSave(form); setDirty(false); }}
          className="px-4 py-1.5 rounded-lg bg-[#1a0a6e] text-white text-xs font-semibold">
          Сохранить
        </button>
      )}
    </div>
  );
}