import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";

type Template = { id: number; name: string; file_url: string; uploaded_at: string };

export default function AdminKP() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await request<Template>("generate-kp", { query: { action: "get-template" }, auth: true });
      setTemplate(res);
    } catch {
      setTemplate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.docx')) {
      alert('Загрузите файл .docx');
      return;
    }
    setUploading(true);
    try {
      const buf = await file.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      await request("generate-kp", {
        method: "POST",
        query: { action: "upload-template" },
        body: { file_base64: b64, file_name: file.name },
        auth: true,
      });
      await load();
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-black text-black mb-1">КП — Шаблон</h1>
        <p className="text-black/50">Загрузите шаблон Word (.docx) с метками для подстановки данных</p>
      </div>

      {/* Инструкция */}
      <div className="bg-[#1a0a6e]/5 rounded-2xl p-5 mb-6 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-[#1a0a6e] text-sm">
          <Icon name="Info" size={16} />
          Как использовать метки в шаблоне
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ["{ОРГАНИЗАЦИЯ}", "Название организации получателя"],
            ["{ФИО_руководителя}", "ФИО руководителя"],
            ["{ДАТА}", "Дата формирования (дд.мм.гггг)"],
            ["{ИТОГО}", "Итоговая сумма без НДС"],
            ["{ТАБЛИЦА_ПОЗИЦИЙ}", "Сюда вставится таблица с позициями услуг"],
          ].map(([tag, desc]) => (
            <div key={tag} className="flex items-start gap-2">
              <code className="shrink-0 text-xs bg-white border border-[#1a0a6e]/20 text-[#1a0a6e] px-2 py-0.5 rounded-lg font-mono">{tag}</code>
              <span className="text-black/55 text-xs leading-relaxed">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Текущий шаблон */}
      <div className="bg-white rounded-2xl border border-black/6 p-6 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Icon name="FileText" size={22} className="text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-black text-sm">
                {loading ? "Загрузка..." : template ? template.name : "Шаблон не загружен"}
              </div>
              {template && (
                <div className="text-black/40 text-xs mt-0.5">
                  Загружен: {new Date(template.uploaded_at).toLocaleDateString("ru-RU")}
                </div>
              )}
              {!loading && !template && (
                <div className="text-amber-600 text-xs mt-0.5 flex items-center gap-1">
                  <Icon name="AlertTriangle" size={11} />
                  Без шаблона генерация КП недоступна
                </div>
              )}
            </div>
          </div>
          {template && (
            <a
              href={template.file_url}
              download
              className="p-2 rounded-xl hover:bg-black/5 text-black/40 hover:text-black transition-colors"
              title="Скачать текущий шаблон"
            >
              <Icon name="Download" size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Загрузка нового */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full border-2 border-dashed border-black/15 rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-[#1a0a6e]/40 hover:bg-[#1a0a6e]/2 transition-colors disabled:opacity-50"
      >
        {uploading
          ? <Icon name="Loader" size={28} className="text-black/30 animate-spin" />
          : <Icon name="Upload" size={28} className="text-black/30" />
        }
        <div className="text-center">
          <div className="font-semibold text-black/60 text-sm">
            {uploading ? "Загружаем шаблон..." : template ? "Заменить шаблон" : "Загрузить шаблон"}
          </div>
          <div className="text-black/35 text-xs mt-1">Файл Word (.docx)</div>
        </div>
      </button>
      <input ref={fileRef} type="file" accept=".docx" className="hidden" onChange={handleFile} />

      {/* Ссылка на страницу КП */}
      <div className="mt-6 p-4 bg-black/3 rounded-2xl flex items-center justify-between">
        <div className="text-sm text-black/50">Публичная страница для клиентов</div>
        <a
          href="/kp"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-[#1a0a6e] text-sm font-semibold hover:underline"
        >
          /kp <Icon name="ExternalLink" size={13} />
        </a>
      </div>
    </div>
  );
}
