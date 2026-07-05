import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { campApi, CampCertTemplate, CampAdminCertificate, formatCampDate } from "@/lib/camp-api";

type FieldKey = "name" | "date" | "number";

const FIELD_LABELS: Record<FieldKey, string> = {
  name: "ФИО",
  date: "Дата",
  number: "Номер сертификата",
};

const FIELD_DEMO: Record<FieldKey, string> = {
  name: "Иван Иванов",
  date: "05.07.2026",
  number: "CAMP-2026-000000",
};

function defaultTemplate(): CampCertTemplate {
  return {
    template_url: "", preview_url: "", page_width: 841.89, page_height: 595.28,
    name_x: 0.5, name_y: 0.45, name_size: 28, name_color: "#141414", name_align: "center",
    date_x: 0.25, date_y: 0.85, date_size: 12, date_color: "#6e6e6e", date_align: "left",
    number_x: 0.75, number_y: 0.85, number_size: 12, number_color: "#6e6e6e", number_align: "right",
  };
}

export default function AdminCampCertificates() {
  const [tab, setTab] = useState<"template" | "issued">("template");
  const [tpl, setTpl] = useState<CampCertTemplate>(defaultTemplate());
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeField, setActiveField] = useState<FieldKey | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragField = useRef<FieldKey | null>(null);

  const [certs, setCerts] = useState<CampAdminCertificate[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { template } = await campApi.adminCertTemplate();
      if (template) setTpl(template);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (tab === "issued" && certs.length === 0) {
      setCertsLoading(true);
      campApi.adminCertificates().then((r) => setCerts(r.certificates)).finally(() => setCertsLoading(false));
    }
  }, [tab]);

  const uploadTemplate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const buf = await file.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const res = await campApi.adminCertTemplateUpload(b64);
      setTpl((t) => ({ ...t, template_url: res.template_url, preview_url: res.preview_url, page_width: res.page_width, page_height: res.page_height }));
    } finally { setUploading(false); e.target.value = ""; }
  };

  const save = async () => {
    setSaving(true);
    try {
      await campApi.adminCertTemplateSave(tpl as unknown as Record<string, unknown>);
    } finally { setSaving(false); }
  };

  const testGenerate = async () => {
    setTesting(true);
    try {
      const { url } = await campApi.adminCertTemplateTest();
      window.open(url, "_blank");
    } finally { setTesting(false); }
  };

  const set = (k: keyof CampCertTemplate, v: unknown) => setTpl((t) => ({ ...t, [k]: v }));

  const onPointerDown = (field: FieldKey) => (e: React.PointerEvent) => {
    e.stopPropagation();
    dragField.current = field;
    setActiveField(field);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragField.current || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    const f = dragField.current;
    set(`${f}_x` as keyof CampCertTemplate, Number(x.toFixed(4)));
    set(`${f}_y` as keyof CampCertTemplate, Number(y.toFixed(4)));
  };

  const onPointerUp = () => { dragField.current = null; };

  return (
    <div>
      <div className="mb-5 flex bg-black/5 rounded-2xl p-1 max-w-sm">
        <button onClick={() => setTab("template")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${tab === "template" ? "bg-white text-black shadow-sm" : "text-black/40"}`}>
          <Icon name="FileSignature" size={14} /> Шаблон
        </button>
        <button onClick={() => setTab("issued")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${tab === "issued" ? "bg-white text-black shadow-sm" : "text-black/40"}`}>
          <Icon name="Award" size={14} /> Выданные
        </button>
      </div>

      {tab === "template" && (
        loading ? (
          <Icon name="Loader" size={22} className="animate-spin text-black/30" />
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-5">
            <div>
              {!tpl.preview_url ? (
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-full border-2 border-dashed border-black/12 rounded-2xl py-16 flex flex-col items-center justify-center gap-2 text-black/50 hover:border-[#DAB332]/50 hover:text-[#DAB332] transition-colors text-sm font-semibold">
                  {uploading ? <Icon name="Loader" size={22} className="animate-spin" /> : <Icon name="Upload" size={22} />}
                  {uploading ? "Загрузка и обработка шаблона..." : "Загрузить PDF-шаблон сертификата"}
                </button>
              ) : (
                <div>
                  <div
                    ref={previewRef}
                    className="relative w-full rounded-2xl overflow-hidden border border-black/10 select-none touch-none"
                    style={{ aspectRatio: `${tpl.page_width} / ${tpl.page_height}` }}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                  >
                    <img src={tpl.preview_url} alt="Шаблон сертификата" className="absolute inset-0 w-full h-full object-contain bg-white pointer-events-none" />
                    {(["name", "date", "number"] as FieldKey[]).map((f) => (
                      <div
                        key={f}
                        onPointerDown={onPointerDown(f)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-move whitespace-nowrap shadow-md border-2 ${
                          activeField === f ? "border-black bg-white text-black z-20" : "border-white/70 bg-black/70 text-white z-10"
                        }`}
                        style={{ left: `${tpl[`${f}_x`] * 100}%`, top: `${tpl[`${f}_y`] * 100}%` }}
                      >
                        {FIELD_DEMO[f]}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="px-4 py-2.5 rounded-xl bg-black/5 text-black/60 text-sm font-semibold hover:bg-black/10 flex items-center gap-1.5">
                      <Icon name="Upload" size={14} /> Заменить шаблон
                    </button>
                    <button onClick={testGenerate} disabled={testing}
                      className="px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 flex items-center gap-1.5">
                      {testing ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Eye" size={14} />}
                      Тестовая генерация
                    </button>
                  </div>
                  <p className="text-[12px] text-black/35 mt-2">Перетаскивайте подписанные поля прямо на превью, чтобы точно попасть в разметку шаблона.</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={uploadTemplate} />
            </div>

            {tpl.preview_url && (
              <div className="space-y-4">
                {(["name", "date", "number"] as FieldKey[]).map((f) => (
                  <div key={f} className={`bg-white rounded-2xl p-4 border transition-colors ${activeField === f ? "border-[#DAB332]" : "border-black/6"}`}
                    onMouseEnter={() => setActiveField(f)}>
                    <h3 className="font-bold text-black text-sm mb-3 flex items-center gap-1.5">
                      <Icon name="Move" size={13} className="text-black/30" /> {FIELD_LABELS[f]}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="text-[10px] text-black/40 font-semibold block mb-1">Размер шрифта</label>
                        <input type="number" value={tpl[`${f}_size`]} onChange={(e) => set(`${f}_size` as keyof CampCertTemplate, Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#f5f5f7] border border-black/8 text-black text-xs focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] text-black/40 font-semibold block mb-1">Цвет</label>
                        <input type="color" value={tpl[`${f}_color`]} onChange={(e) => set(`${f}_color` as keyof CampCertTemplate, e.target.value)}
                          className="w-full h-[30px] rounded-lg border border-black/8 cursor-pointer" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-black/40 font-semibold block mb-1">Выравнивание</label>
                      <div className="flex gap-1">
                        {["left", "center", "right"].map((a) => (
                          <button key={a} onClick={() => set(`${f}_align` as keyof CampCertTemplate, a)}
                            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${tpl[`${f}_align`] === a ? "bg-black text-white" : "bg-black/5 text-black/50 hover:bg-black/10"}`}>
                            {a === "left" ? "Слева" : a === "center" ? "По центру" : "Справа"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <button onClick={save} disabled={saving}
                  className="w-full py-3 rounded-xl text-black font-semibold flex items-center justify-center gap-1.5"
                  style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}>
                  {saving ? <Icon name="Loader" size={15} className="animate-spin" /> : <Icon name="Check" size={15} />}
                  Сохранить расположение
                </button>
              </div>
            )}
          </div>
        )
      )}

      {tab === "issued" && (
        certsLoading ? (
          <Icon name="Loader" size={22} className="animate-spin text-black/30" />
        ) : (
          <div className="bg-white rounded-2xl border border-black/6 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/6 text-left text-black/40 text-[11px] uppercase">
                  <th className="px-4 py-3 font-semibold">Студент</th>
                  <th className="px-4 py-3 font-semibold">Программа</th>
                  <th className="px-4 py-3 font-semibold">Номер</th>
                  <th className="px-4 py-3 font-semibold">Дата выдачи</th>
                  <th className="px-4 py-3 font-semibold text-right">PDF</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((c) => (
                  <tr key={c.id} className="border-b border-black/4 last:border-0 hover:bg-black/[0.015]">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-black">{c.student_name || "—"}</div>
                      <div className="text-[12px] text-black/35">{c.student_email}</div>
                    </td>
                    <td className="px-4 py-3 text-black/60">{c.program_title}</td>
                    <td className="px-4 py-3 text-black/60 font-mono text-[12px]">{c.cert_number}</td>
                    <td className="px-4 py-3 text-black/40 text-[12px]">{formatCampDate(c.issued_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <a href={c.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#DAB332] hover:text-[#c19c1f] font-semibold text-[12px]">
                        Открыть <Icon name="ExternalLink" size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
                {certs.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-black/30">Сертификаты ещё не выданы</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}