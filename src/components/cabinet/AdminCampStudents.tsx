import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { campApi, formatCampDate } from "@/lib/camp-api";

type Student = {
  id: number; email: string; full_name: string; phone: string;
  is_active: boolean; created_at: string; enrollments: number; certificates: number;
};

export default function AdminCampStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (q?: string) => {
    setLoading(true);
    try {
      const { students } = await campApi.adminStudents(q);
      setStudents(students);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(search)}
            placeholder="Поиск по имени или email"
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-sm focus:outline-none"
          />
        </div>
        <button onClick={() => load(search)} className="px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold">
          Найти
        </button>
      </div>

      {loading ? (
        <Icon name="Loader" size={22} className="animate-spin text-black/30" />
      ) : (
        <div className="bg-white rounded-2xl border border-black/6 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/6 text-left text-black/40 text-[11px] uppercase">
                <th className="px-4 py-3 font-semibold">Студент</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold text-center">Программ</th>
                <th className="px-4 py-3 font-semibold text-center">Сертификатов</th>
                <th className="px-4 py-3 font-semibold">Регистрация</th>
                <th className="px-4 py-3 font-semibold">Статус</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-black/4 last:border-0 hover:bg-black/[0.015]">
                  <td className="px-4 py-3 font-semibold text-black">{s.full_name || "—"}</td>
                  <td className="px-4 py-3 text-black/60">{s.email}</td>
                  <td className="px-4 py-3 text-center text-black/60">{s.enrollments}</td>
                  <td className="px-4 py-3 text-center text-black/60">{s.certificates}</td>
                  <td className="px-4 py-3 text-black/40 text-[12px]">{formatCampDate(s.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {s.is_active ? "Активен" : "Заблокирован"}
                    </span>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-black/30">Студентов не найдено</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
