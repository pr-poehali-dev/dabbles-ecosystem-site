import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";

type Info = { full_name: string; position: string; description: string; quote: string; quote_source: string; email: string; photo_url: string };
type BioItem = { id: number; year_label: string; title: string; body: string; sort_order: number };
type Photo = { id: number; url: string; caption: string; sort_order: number };
type NewsItem = { id: number; title: string; category: string; date_label: string; image_url: string; link_url: string; sort_order: number };
type Social = { id: number; platform: string; label: string; url: string; sort_order: number };

type Tab = "activity" | "bio" | "photos";

const PLATFORM_ICONS: Record<string, string> = {
  telegram: "Send", vk: "Users", ok: "Circle", youtube: "Play", link: "ExternalLink",
};

export default function Director() {
  const [info, setInfo] = useState<Info | null>(null);
  const [bio, setBio] = useState<BioItem[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [socials, setSocials] = useState<Social[]>([]);
  const [tab, setTab] = useState<Tab>("activity");
  const [bioIdx, setBioIdx] = useState(0);
  const bioScroll = useRef<HTMLDivElement>(null);

  useEffect(() => {
    request<{ info: Info; bio: BioItem[]; photos: Photo[]; news: NewsItem[]; socials: Social[] }>(
      "public-data", { query: { action: "director" }, auth: false }
    ).then(d => {
      setInfo(d.info); setBio(d.bio || []); setPhotos(d.photos || []);
      setNews(d.news || []); setSocials(d.socials || []);
    }).catch(() => {});
  }, []);

  const scrollBio = (dir: 1 | -1) => {
    const next = Math.max(0, Math.min(bio.length - 1, bioIdx + dir));
    setBioIdx(next);
    const el = bioScroll.current?.children[next] as HTMLElement;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "activity", label: "Деятельность" },
    { key: "bio", label: "Биография" },
    { key: "photos", label: "Фотографии" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-black font-body">
      <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-white border-b border-black/8 flex items-center px-6 md:px-10">
        <Link to="/about" className="flex items-center gap-2 text-black/50 hover:text-black transition-colors text-sm font-medium">
          <Icon name="ArrowLeft" size={16} />
          О компании
        </Link>
        <div className="flex-1 flex justify-center">
          <Link to="/">
            <img
              src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/279bdee6-7783-4862-83f9-25bd24811276.png"
              alt="Даббл" className="h-6 w-auto object-contain" style={{ filter: "invert(1)" }}
            />
          </Link>
        </div>
        <div className="w-24" />
      </nav>

      <div className="pt-[60px]">
        {/* ШАПКА */}
        <div className="bg-white border-b border-black/8">
          <div className="max-w-5xl mx-auto px-6 md:px-10 py-5">
            {info ? (
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                <div className="shrink-0">
                  {info.photo_url
                    ? <img src={info.photo_url} alt={info.full_name} className="w-[80px] h-[80px] rounded-2xl object-cover object-top shadow-sm" />
                    : <div className="w-[80px] h-[80px] rounded-2xl bg-[#1a0a6e]/10 flex items-center justify-center"><Icon name="User" size={32} className="text-[#1a0a6e]/40" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-display text-2xl md:text-3xl font-black text-black leading-tight mb-1">{info.full_name}</h1>
                  <div className="text-black/45 text-sm">{info.position}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        tab === t.key ? "border-[#1a0a6e] text-[#1a0a6e] bg-[#1a0a6e]/5" : "border-black/12 text-black/55 hover:border-black/25 hover:text-black"
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[80px] flex items-center"><Icon name="Loader" size={22} className="animate-spin text-black/30" /></div>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 md:px-10 py-6 space-y-5">

          {/* === ДЕЯТЕЛЬНОСТЬ === */}
          {tab === "activity" && (
            <>
              {/* Новости */}
              <div className="bg-white rounded-2xl p-7">
                <h2 className="font-display text-xl font-black text-black mb-6">Новости</h2>
                {news.length === 0 ? (
                  <p className="text-black/35 text-sm">Новости не добавлены</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-5">
                    {news.map(item => (
                      <a key={item.id} href={item.link_url || "#"} target={item.link_url ? "_blank" : undefined} rel="noreferrer"
                        className="group block rounded-xl overflow-hidden border border-black/6 hover:shadow-md transition-all">
                        {item.image_url && (
                          <div className="aspect-[16/9] overflow-hidden bg-black/5">
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        )}
                        <div className="p-4">
                          {item.category && <div className="text-[#1a0a6e] text-xs font-bold uppercase tracking-wide mb-2">{item.category}</div>}
                          <h3 className="font-bold text-black text-[15px] leading-snug mb-2 group-hover:text-[#1a0a6e] transition-colors">{item.title}</h3>
                          <div className="text-black/40 text-xs">{item.date_label}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Соцсети */}
              <div className="bg-white rounded-2xl p-7">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-black text-black">Социальные сети</h2>
                  {socials.filter(s => s.url).length > 0 && (
                    <div className="text-black/40 text-xs font-medium">Официальные аккаунты</div>
                  )}
                </div>
                {socials.filter(s => s.url).length === 0 ? (
                  <p className="text-black/35 text-sm">Соцсети не добавлены</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {socials.filter(s => s.url).map(s => (
                      <a key={s.id} href={s.url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#f5f5f7] hover:bg-[#1a0a6e] hover:text-white text-black text-sm font-semibold transition-all group">
                        <Icon name={PLATFORM_ICONS[s.platform] || "ExternalLink"} size={16} className="text-[#1a0a6e] group-hover:text-white transition-colors" />
                        {s.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Цитата */}
              {info?.quote && (
                <div className="bg-white rounded-2xl p-7 md:p-10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#1a0a6e] rounded-l-2xl" />
                  <div className="text-5xl font-display text-[#1a0a6e]/8 leading-none mb-3 select-none">"</div>
                  <p className="text-black/75 text-lg md:text-xl leading-relaxed italic font-display font-medium mb-6">{info.quote}</p>
                  {info.quote_source && (
                    <div className="flex items-center gap-2 text-sm text-black/35 font-medium">
                      <div className="w-6 h-px bg-black/20" />
                      {info.quote_source}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* === БИОГРАФИЯ === */}
          {tab === "bio" && (
            <div className="bg-white rounded-2xl p-7 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-2xl font-black text-black">Биография</h2>
                <div className="flex gap-2">
                  <button onClick={() => scrollBio(-1)} disabled={bioIdx === 0}
                    className="w-9 h-9 rounded-xl border border-black/12 flex items-center justify-center text-black/50 hover:text-black hover:border-black/30 disabled:opacity-30 transition-all">
                    <Icon name="ArrowLeft" size={16} />
                  </button>
                  <button onClick={() => scrollBio(1)} disabled={bioIdx >= bio.length - 1}
                    className="w-9 h-9 rounded-xl border border-black/12 flex items-center justify-center text-black/50 hover:text-black hover:border-black/30 disabled:opacity-30 transition-all">
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
              </div>
              {bio.length === 0 ? (
                <p className="text-black/35 text-sm">Биография не заполнена</p>
              ) : (
                <div className="overflow-hidden">
                  <div ref={bioScroll} className="flex gap-10 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
                    {bio.map(item => (
                      <div key={item.id} className="min-w-[240px] max-w-[280px] shrink-0 snap-start">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="font-display text-2xl font-black text-black">{item.year_label}</span>
                          <div className="flex-1 h-px bg-black/10" />
                        </div>
                        <div className="font-bold text-black mb-2">{item.title}</div>
                        <p className="text-black/55 text-sm leading-relaxed">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === ФОТОГРАФИИ === */}
          {tab === "photos" && (
            <div className="bg-white rounded-2xl p-7 md:p-10">
              <h2 className="font-display text-2xl font-black text-black mb-6">Фотографии</h2>
              {photos.length === 0 ? (
                <p className="text-black/35 text-sm">Фотографии не добавлены</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {photos.map(p => (
                    <div key={p.id} className="rounded-xl overflow-hidden aspect-square bg-black/5">
                      <img src={p.url} alt={p.caption} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
