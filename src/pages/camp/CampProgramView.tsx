import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { campApi, CampLearnData, CampLecture } from "@/lib/camp-api";
import Icon from "@/components/ui/icon";

function LectureRow({ lecture, onComplete }: { lecture: CampLecture; onComplete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/6 last:border-0">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-black/[0.02] transition-colors">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${lecture.done ? "bg-green-100 text-green-600" : "bg-black/5 text-black/30"}`}>
          <Icon name={lecture.done ? "Check" : "PlayCircle"} size={13} />
        </div>
        <span className="flex-1 text-[14px] font-semibold text-black">{lecture.title}</span>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={16} className="text-black/25" />
      </button>
      {open && (
        <div className="px-4 pb-4">
          {lecture.video_url && (
            <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-black">
              <video src={lecture.video_url} controls className="w-full h-full" />
            </div>
          )}
          <p className="text-black/60 text-[13px] leading-relaxed whitespace-pre-line mb-3">{lecture.content}</p>
          {lecture.file_url && (
            <a href={lecture.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-black/60 hover:text-black mb-3">
              <Icon name="Paperclip" size={13} /> Скачать материал
            </a>
          )}
          {!lecture.done && (
            <button onClick={onComplete} className="px-4 py-2 rounded-xl text-black font-bold text-[12px]"
              style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}>
              Отметить как изученное
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CampProgramView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<CampLearnData | null>(null);

  const load = () => {
    if (!id) return;
    campApi.learn(Number(id)).then(setData).catch(() => {});
  };

  useEffect(load, [id]);

  const completeLecture = async (lectureId: number) => {
    await campApi.lectureComplete(lectureId);
    load();
  };

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#DAB332]/30 border-t-[#DAB332] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link to="/camp/app" className="inline-flex items-center gap-1.5 text-black/40 text-[13px] font-semibold hover:text-black">
        <Icon name="ArrowLeft" size={14} /> К моим программам
      </Link>

      <div>
        <h1 className="font-display text-2xl font-black text-black mb-1">{data.program.title}</h1>
        <p className="text-black/45 text-[14px]">{data.program.description}</p>
      </div>

      {data.certificate && (
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}>
          <Icon name="Award" size={28} className="text-black shrink-0" />
          <div className="flex-1">
            <div className="font-black text-black text-[15px]">Программа завершена!</div>
            <div className="text-black/60 text-[12px]">Сертификат № {data.certificate.cert_number}</div>
          </div>
          <a href={data.certificate.pdf_url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-black text-white font-bold text-[12px] shrink-0">
            Скачать PDF
          </a>
        </div>
      )}

      {data.modules.map((m, idx) => (
        <div key={m.id} className="bg-white rounded-2xl border border-black/6 overflow-hidden">
          <div className="px-4 py-3 bg-black/[0.02] border-b border-black/6 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">{idx + 1}</span>
            <h2 className="font-black text-black text-[14px]">{m.title}</h2>
          </div>
          {m.lectures.map((l) => (
            <LectureRow key={l.id} lecture={l} onComplete={() => completeLecture(l.id)} />
          ))}
          {m.test && (
            <div className="px-4 py-3.5 border-t border-black/6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="ListChecks" size={15} className={m.test.passed ? "text-green-600" : "text-black/35"} />
                <span className="text-[13px] font-semibold text-black">{m.test.title}</span>
                {m.test.passed && <span className="text-[11px] text-green-600 font-bold">Пройден · {m.test.score}%</span>}
              </div>
              <button onClick={() => navigate(`/camp/app/test/${m.test!.id}`)}
                className="px-3.5 py-1.5 rounded-lg bg-black text-white text-[12px] font-bold">
                {m.test.passed ? "Пройти снова" : "Пройти тест"}
              </button>
            </div>
          )}
        </div>
      ))}

      {data.final_test && (
        <div className="bg-black rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Trophy" size={22} className="text-[#EBD047]" />
            <div>
              <div className="font-black text-white text-[15px]">{data.final_test.title}</div>
              <div className="text-white/45 text-[12px]">Итоговый тест для получения сертификата</div>
            </div>
          </div>
          <button onClick={() => navigate(`/camp/app/test/${data.final_test!.id}`)}
            className="px-4 py-2.5 rounded-xl text-black font-bold text-[13px] shrink-0"
            style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}>
            {data.final_test.passed ? "Пройден ✓" : "Пройти"}
          </button>
        </div>
      )}
    </div>
  );
}
