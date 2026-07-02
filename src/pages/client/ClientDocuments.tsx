import { useEffect, useState } from "react";
import { cpApi, CpDocument, formatDate } from "@/lib/client-api";
import Icon from "@/components/ui/icon";

const DOC_TYPE_LABELS: Record<string, string> = {
  contract: "Договор",
  addendum: "Дополнительное соглашение",
  act: "Акт",
  invoice: "Счёт",
  other: "Прочее",
};

const DOC_ICONS: Record<string, string> = {
  contract: "FileSignature",
  addendum: "FilePlus",
  act: "FileCheck",
  invoice: "Receipt",
  other: "File",
};

export default function ClientDocuments() {
  const [docs, setDocs] = useState<CpDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<CpDocument | null>(null);

  useEffect(() => {
    cpApi.documents().then(r => setDocs(r.documents)).finally(() => setLoading(false));
  }, []);

  const contracts = docs.filter(d => d.doc_type === "contract");
  const addendums = docs.filter(d => d.doc_type === "addendum");
  const others = docs.filter(d => !["contract", "addendum"].includes(d.doc_type));

  const DocCard = ({ doc }: { doc: CpDocument }) => (
    <div
      onClick={() => (doc.content ? setSelectedDoc(doc) : doc.file_url ? window.open(doc.file_url, "_blank") : null)}
      className="bg-white rounded-2xl p-4 hover:shadow-md cursor-pointer transition-all group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#f0f8e8] flex items-center justify-center shrink-0">
          <Icon name={DOC_ICONS[doc.doc_type] || "File"} size={18} className="text-[#5a9a2a]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-black text-[14px] leading-snug truncate">{doc.title}</div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f0f8e8] text-[#5a9a2a]">
              {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
            </span>
            <span className="text-[11px] text-black/30">{formatDate(doc.created_at)}</span>
          </div>
        </div>
        {doc.content && <Icon name="Eye" size={15} className="text-black/20 shrink-0 group-hover:text-[#5a9a2a] transition-colors" />}
        {doc.file_url && !doc.content && <Icon name="Download" size={15} className="text-black/20 shrink-0 group-hover:text-[#5a9a2a] transition-colors" />}
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#9FC96D]/30 border-t-[#5a9a2a] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pb-20 md:pb-0">
      <div className="mb-5">
        <h1 className="text-[22px] font-black text-black tracking-tight">Мои документы</h1>
        <p className="text-black/40 text-sm mt-0.5">{docs.length} документов</p>
      </div>

      {docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-black/30 bg-white rounded-2xl">
          <Icon name="FileText" size={40} className="mb-3 opacity-30" />
          <p className="text-sm">Документов пока нет</p>
        </div>
      ) : (
        <div className="space-y-5">
          {contracts.length > 0 && (
            <div>
              <h2 className="text-[12px] font-bold text-black/35 uppercase tracking-wide mb-2">Договоры</h2>
              <div className="space-y-2">{contracts.map(d => <DocCard key={d.id} doc={d} />)}</div>
            </div>
          )}
          {addendums.length > 0 && (
            <div>
              <h2 className="text-[12px] font-bold text-black/35 uppercase tracking-wide mb-2">Доп. соглашения</h2>
              <div className="space-y-2">{addendums.map(d => <DocCard key={d.id} doc={d} />)}</div>
            </div>
          )}
          {others.length > 0 && (
            <div>
              <h2 className="text-[12px] font-bold text-black/35 uppercase tracking-wide mb-2">Прочие документы</h2>
              <div className="space-y-2">{others.map(d => <DocCard key={d.id} doc={d} />)}</div>
            </div>
          )}
        </div>
      )}

      {selectedDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 sticky top-0 bg-white rounded-t-3xl">
              <div>
                <h3 className="font-black text-black text-[16px]">{selectedDoc.title}</h3>
                <span className="text-[11px] text-black/35">{DOC_TYPE_LABELS[selectedDoc.doc_type] || selectedDoc.doc_type}</span>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-black/30 hover:text-black p-1">
                <Icon name="X" size={20} />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="prose prose-sm max-w-none text-black/70 leading-relaxed whitespace-pre-wrap text-[14px]">
                {selectedDoc.content}
              </div>
            </div>
            {selectedDoc.file_url && (
              <div className="px-6 pb-5">
                <a href={selectedDoc.file_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f0f8e8] text-[#5a9a2a] text-[13px] font-semibold hover:bg-[#e0f0d0] transition-colors">
                  <Icon name="Download" size={15} /> Скачать файл
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
