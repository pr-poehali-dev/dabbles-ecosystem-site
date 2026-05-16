import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";

type Doc = {
  id: number;
  title: string;
  file_url: string;
  status: string;
  notes: string;
  created_at?: string;
};

const STATUSES = [
  { key: "draft", label: "Черновик", color: "bg-black/10 text-black/60" },
  { key: "review", label: "На согласовании", color: "bg-yellow-100 text-yellow-700" },
  { key: "approved", label: "Согласован", color: "bg-green-100 text-green-700" },
  { key: "signed", label: "Подписан", color: "bg-blue-100 text-blue-700" },
];

export default function DocumentsSection() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await request<{ items: Doc[] }>("workspace", { query: { kind: "documents" } });
      setDocs(items);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!title.trim()) return;
    await request("workspace", {
      method: "POST",
      query: { kind: "documents" },
      body: { title, file_url: url, status: "draft" },
    });
    setTitle(""); setUrl("");
    load();
  };

  const changeStatus = async (d: Doc, status: string) => {
    await request("workspace", { method: "PUT", query: { kind: "documents" }, body: { id: d.id, status } });
    load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-black text-black mb-1">Документооборот</h1>
      <p className="text-black/50 mb-6">Документы и их статусы</p>

      <div className="bg-white rounded-2xl p-4 mb-5 flex flex-col md:flex-row gap-2 max-w-3xl">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название документа"
          className="flex-1 px-4 py-2.5 rounded-xl bg-black/3 border border-black/10 outline-none text-black"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Ссылка на файл (опционально)"
          className="flex-1 px-4 py-2.5 rounded-xl bg-black/3 border border-black/10 outline-none text-black"
        />
        <button onClick={add} className="px-5 py-2.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-black/85">
          Добавить
        </button>
      </div>

      {loading ? (
        <Icon name="Loader" size={22} className="animate-spin text-black/30" />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden">
          {docs.length === 0 && (
            <div className="p-10 text-center text-black/40 text-sm">Документов пока нет</div>
          )}
          {docs.map((d, i) => {
            const st = STATUSES.find((s) => s.key === d.status) || STATUSES[0];
            return (
              <div key={d.id} className={`p-4 flex items-center gap-4 ${i > 0 ? "border-t border-black/5" : ""}`}>
                <Icon name="FileText" size={20} className="text-black/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-black truncate">{d.title}</div>
                  {d.file_url && (
                    <a href={d.file_url} target="_blank" rel="noreferrer" className="text-xs text-[#0077FF] hover:underline">
                      Открыть файл
                    </a>
                  )}
                </div>
                <select
                  value={d.status}
                  onChange={(e) => changeStatus(d, e.target.value)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border-none outline-none cursor-pointer ${st.color}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
