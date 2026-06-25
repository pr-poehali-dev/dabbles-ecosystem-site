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
      className="bg-white rounded-2xl border border-black/5 p-5 hover:border-[#1a0a6e]/20 cursor-pointer transition-all hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1a0a6e]/8 flex items-center justify-center shrink-0">
          <Icon name={DOC_ICONS[doc.doc_type] || "File"} size={18} className="text-[#1a0a6e]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-black text-[14px] leading-snug">{doc.title}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1a0a6e]/8 text-[#1a0a6e]">
              {DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}
            </span>
            <span className="text-[11px] text-black/35">{formatDate(doc.created_at)}</span>
          </div>
        </div>
        {doc.content && <Icon name="Eye" size={15} className="text-black/20 shrink-0 mt-1" />}
        {doc.file_url && !doc.content && <Icon name="Download" size={15} className="text-black/20 shrink-0 mt-1" />}
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#1a0a6e]/20 border-t-[#1a0a6e] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-black tracking-tight">Мои документы</h1>
        <p className="text-black/40 text-sm mt-0.5">{docs.length} документов</p>
      </div>

      {docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-black/30 bg-white rounded-3xl border border-black/5">
          <Icon name="FileText" size={40} className="mb-3 opacity-30" />
          <p className="text-sm">Документов пока нет</p>
        </div>
      ) : (
        <div className="space-y-6">
          {contracts.length > 0 && (
            <div>
              <h2 className="text-[12px] font-bold text-black/40 uppercase tracking-wide mb-3">Договоры</h2>
              <div className="space-y-3">{contracts.map(d => <DocCard key={d.id} doc={d} />)}</div>
            </div>
          )}
          {addendums.length > 0 && (
            <div>
              <h2 className="text-[12px] font-bold text-black/40 uppercase tracking-wide mb-3">Дополнительные соглашения</h2>
              <div className="space-y-3">{addendums.map(d => <DocCard key={d.id} doc={d} />)}</div>
            </div>
          )}
          {others.length > 0 && (
            <div>
              <h2 className="text-[12px] font-bold text-black/40 uppercase tracking-wide mb-3">Прочие документы</h2>
              <div className="space-y-3">{others.map(d => <DocCard key={d.id} doc={d} />)}</div>
            </div>
          )}
        </div>
      )}

      {/* Просмотр онлайн-документа */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 sticky top-0 bg-white rounded-t-3xl">
              <div>
                <h3 className="font-black text-black text-[16px]">{selectedDoc.title}</h3>
                <span className="text-[11px] text-black/40">{DOC_TYPE_LABELS[selectedDoc.doc_type] || selectedDoc.doc_type}</span>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-black/30 hover:text-black p-1">
                <Icon name="X" size={20} />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="prose prose-sm max-w-none text-black/75 leading-relaxed whitespace-pre-wrap text-[14px]">
                {selectedDoc.content}
              </div>
            </div>
            {selectedDoc.file_url && (
              <div className="px-6 pb-5">
                <a href={selectedDoc.file_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a0a6e]/8 text-[#1a0a6e] text-[13px] font-semibold hover:bg-[#1a0a6e]/15 transition-colors">
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
