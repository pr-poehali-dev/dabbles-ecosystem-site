import { useEffect, useState } from "react";
import { campApi, CampCertificate, formatCampDate } from "@/lib/camp-api";
import Icon from "@/components/ui/icon";

export default function CampCertificates() {
  const [certs, setCerts] = useState<CampCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campApi.myCertificates().then((r) => setCerts(r.certificates)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#DAB332]/30 border-t-[#DAB332] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-black text-black">Мои сертификаты</h1>

      {certs.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-black/6">
          <Icon name="Award" size={32} className="mx-auto mb-3 text-black/20" />
          <p className="text-black/40 text-sm">Пройдите программу до конца, чтобы получить сертификат</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {certs.map((c) => (
            <div key={c.id} className="rounded-3xl overflow-hidden border border-black/6 bg-white">
              <div className="p-6 flex items-center justify-center" style={{ background: "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}>
                <Icon name="Award" size={40} className="text-black" />
              </div>
              <div className="p-5">
                <h3 className="font-black text-black text-[15px] mb-1">{c.program_title}</h3>
                <p className="text-black/40 text-[12px] mb-4">№ {c.cert_number} · {formatCampDate(c.issued_at)}</p>
                <a href={c.pdf_url} target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white font-bold text-[13px]">
                  <Icon name="Download" size={14} /> Скачать PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
