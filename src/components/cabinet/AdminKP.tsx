import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";

type Template = { id: number; name: string; file_url: string; uploaded_at: string };
type Stopword = { id: number; word: string; created_at: string };

export default function AdminKP() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loadingTpl, setLoadingTpl] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [stopwords, setStopwords] = useState<Stopword[]>([]);
  const [loadingSW, setLoadingSW] = useState(true);
  const [newWord, setNewWord] = useState("");
  const [addingWord, setAddingWord] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadTemplate = async () => {
    setLoadingTpl(true);
    try {
      const res = await request<Template>("generate-kp", { query: { action: "get-template" }, auth: true });
      setTemplate(res);
    } catch {
      setTemplate(null);
    } finally { setLoadingTpl(false); }
  };

  const loadStopwords = async () => {
    setLoadingSW(true);
    try {
      const res = await request<{ words: Stopword[] }>("generate-kp", { query: { action: "stopwords" }, auth: true });
      setStopwords(res.words || []);
    } finally { setLoadingSW(false); }
  };

  useEffect(() => { loadTemplate(); loadStopwords(); }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.docx')) { alert('Загрузите файл .docx'); return; }
    setUploading(true);
    try {
      const buf = await file.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      await request("generate-kp", { method: "POST", query: { action: "upload-template" }, body: { file_base64: b64, file_name: file.name }, auth: true });
      await loadTemplate();
    } finally { setUploading(false); e.target.value = ''; }
  };

  const addWord = async () => {
    const w = newWord.trim();
    if (!w) return;
    setAddingWord(true);
    try {
      await request("generate-kp", { method: "POST", query: { action: "stopwords" }, body: { word: w }, auth: true });
      setNewWord("");
      await loadStopwords();
    } finally { setAddingWord(false); }
  };

  const deleteWord = async (id: number) => {
    if (!confirm("Удалить слово?")) return;
    await request("generate-kp", { method: "DELETE", query: { action: "stopwords" }, body: { id }, auth: true });
    await loadStopwords();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-black mb-1">КП — Управление</h1>
        <p className="text-black/50">Шаблон документа и список запрещённых слов</p>
      </div>

      {/* === ШАБЛОН === */}
      <div className="bg-white rounded-2xl border border-black/6 p-6">
        <h2 className="font-semibold text-black mb-4 flex items-center gap-2">
          <Icon name="FileText" size={16} className="text-[#1a0a6e]" />
          Шаблон Word (.docx)
        </h2>

        {/* Метки */}
        <div className="bg-[#1a0a6e]/5 rounded-xl p-4 mb-5">
          <div className="text-xs font-semibold text-[#1a0a6e] mb-3">Доступные метки для шаблона:</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              ["{ОРГАНИЗАЦИЯ}", "Название организации"],
              ["{ФИО_руководителя}", "ФИО руководителя"],
              ["{ДАТА}", "Дата формирования"],
              ["{ИТОГО}", "Итоговая сумма без НДС"],
              ["{НОМЕР_ДОКУМЕНТА}", "Номер КП (89-101/2026-100)"],
              ["{ТАБЛИЦА_ПОЗИЦИЙ}", "Вставить таблицу услуг"],
            ].map(([tag, desc]) => (
              <div key={tag} className="flex items-center gap-2">
                <code className="shrink-0 text-xs bg-white border border-[#1a0a6e]/20 text-[#1a0a6e] px-2 py-0.5 rounded-lg font-mono">{tag}</code>
                <span className="text-black/45 text-xs">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Текущий шаблон */}
        <div className="flex items-center gap-3 p-4 bg-[#f8f8fb] rounded-xl mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Icon name="FileText" size={18} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-black text-sm truncate">
              {loadingTpl ? "Загрузка..." : template ? template.name : "Шаблон не загружен"}
            </div>
            {template && (
              <div className="text-black/40 text-xs mt-0.5">
                {new Date(template.uploaded_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
              </div>
            )}
            {!loadingTpl && !template && (
              <div className="text-amber-600 text-xs mt-0.5 flex items-center gap-1">
                <Icon name="AlertTriangle" size={11} /> Без шаблона генерация КП недоступна
              </div>
            )}
          </div>
          {template && (
            <a href={template.file_url} download
              className="p-2 rounded-lg hover:bg-black/5 text-black/35 hover:text-black transition-colors" title="Скачать">
              <Icon name="Download" size={15} />
            </a>
          )}
        </div>

        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-full border-2 border-dashed border-black/12 rounded-xl p-5 flex items-center justify-center gap-3 hover:border-[#1a0a6e]/30 hover:bg-[#1a0a6e]/2 transition-colors disabled:opacity-50 text-black/50 hover:text-[#1a0a6e]">
          {uploading ? <Icon name="Loader" size={18} className="animate-spin" /> : <Icon name="Upload" size={18} />}
          <span className="text-sm font-semibold">{uploading ? "Загружаем..." : template ? "Заменить шаблон" : "Загрузить шаблон .docx"}</span>
        </button>
        <input ref={fileRef} type="file" accept=".docx" className="hidden" onChange={handleFile} />
      </div>

      {/* === СТОП-СЛОВА === */}
      <div className="bg-white rounded-2xl border border-black/6 p-6">
        <h2 className="font-semibold text-black mb-1 flex items-center gap-2">
          <Icon name="ShieldOff" size={16} className="text-red-500" />
          Стоп-слова
        </h2>
        <p className="text-black/40 text-xs mb-5">
          Если в заявке найдено любое из этих слов — пользователь получит отказ.
          Проверяются: организация, ФИО, наименования услуг.
        </p>

        <div className="flex gap-2 mb-5">
          <input
            value={newWord}
            onChange={e => setNewWord(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addWord())}
            placeholder="Введите слово или фразу..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-black text-sm placeholder-black/25 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
          <button onClick={addWord} disabled={addingWord || !newWord.trim()}
            className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-colors flex items-center gap-1.5">
            {addingWord ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Plus" size={14} />}
            Добавить
          </button>
        </div>

        {loadingSW ? (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader" size={20} className="animate-spin text-black/30" />
          </div>
        ) : stopwords.length === 0 ? (
          <div className="text-center py-8 text-black/30 text-sm">
            <Icon name="ShieldCheck" size={28} className="mx-auto mb-2 opacity-40" />
            Стоп-слова не добавлены
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {stopwords.map(sw => (
              <div key={sw.id}
                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                <span className="font-medium">{sw.word}</span>
                <button onClick={() => deleteWord(sw.id)}
                  className="w-5 h-5 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors">
                  <Icon name="X" size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ссылка на публичную страницу */}
      <div className="p-4 bg-black/3 rounded-2xl flex items-center justify-between">
        <div className="text-sm text-black/50">Публичная страница для клиентов</div>
        <a href="/kp" target="_blank"
          className="inline-flex items-center gap-1.5 text-[#1a0a6e] text-sm font-semibold hover:underline">
          /kp <Icon name="ExternalLink" size={13} />
        </a>
      </div>
    </div>
  );
}
