import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { campApi, CampMyProgram, CampProgram } from "@/lib/camp-api";
import Icon from "@/components/ui/icon";

function MyProgramCard({ p, onOpen }: { p: CampMyProgram; onOpen: () => void }) {
  const pct = p.total_lectures > 0 ? Math.round((p.done_lectures / p.total_lectures) * 100) : 0;
  const isDone = p.status === "completed";
  return (
    <button onClick={onOpen} className="text-left bg-white rounded-3xl p-5 border border-black/6 hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-black/50">{p.level}</span>
        {isDone && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
            <Icon name="CheckCircle2" size={11} /> Завершено
          </span>
        )}
      </div>
      <h3 className="font-black text-black text-[16px] mb-3">{p.title}</h3>
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-black/40">
        <span>{p.done_lectures} / {p.total_lectures} лекций</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-black/6 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #EBD047, #DAB332)" }} />
      </div>
    </button>
  );
}

function CatalogCard({ p, onEnroll }: { p: CampProgram; onEnroll: () => void }) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-black/6">
      <div
        className="h-28 flex items-center justify-center"
        style={{ background: p.image_url ? undefined : "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}
      >
        {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <Icon name="BookOpen" size={30} className="text-black/70" />}
      </div>
      <div className="p-4">
        <h3 className="font-black text-black text-[14px] mb-1.5">{p.title}</h3>
        <p className="text-black/45 text-[12px] leading-relaxed mb-3 line-clamp-2">{p.description}</p>
        <button onClick={onEnroll} className="w-full py-2.5 rounded-xl text-black font-bold text-[13px] transition-all hover:opacity-90"
          style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}>
          Начать
        </button>
      </div>
    </div>
  );
}

export default function CampDashboard() {
  const navigate = useNavigate();
  const [myPrograms, setMyPrograms] = useState<CampMyProgram[]>([]);
  const [catalog, setCatalog] = useState<CampProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([campApi.myPrograms(), campApi.programs()]).then(([mine, all]) => {
      setMyPrograms(mine.programs);
      const myIds = new Set(mine.programs.map((p) => p.id));
      setCatalog(all.programs.filter((p) => !myIds.has(p.id)));
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const enroll = async (id: number) => {
    await campApi.enroll(id);
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#DAB332]/30 border-t-[#DAB332] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-black text-black mb-4">Мои программы</h1>
        {myPrograms.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-black/6">
            <Icon name="BookOpen" size={32} className="mx-auto mb-3 text-black/20" />
            <p className="text-black/40 text-sm">Вы ещё не начали ни одной программы</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myPrograms.map((p) => (
              <MyProgramCard key={p.id} p={p} onOpen={() => navigate(`/camp/app/program/${p.id}`)} />
            ))}
          </div>
        )}
      </div>

      {catalog.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-black text-black mb-4">Доступные программы</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {catalog.map((p) => (
              <CatalogCard key={p.id} p={p} onEnroll={() => enroll(p.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
