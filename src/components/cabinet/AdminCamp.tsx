import { useState } from "react";
import Icon from "@/components/ui/icon";
import AdminCampPrograms from "./AdminCampPrograms";
import AdminCampProgramEditor from "./AdminCampProgramEditor";
import AdminCampStudents from "./AdminCampStudents";

type Tab = "programs" | "students";

export default function AdminCamp() {
  const [tab, setTab] = useState<Tab>("programs");
  const [editingProgramId, setEditingProgramId] = useState<number | null>(null);

  if (editingProgramId !== null) {
    return <AdminCampProgramEditor programId={editingProgramId} onBack={() => setEditingProgramId(null)} />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-black text-black mb-1">Кэмп</h1>
        <p className="text-black/50">Образовательная платформа — программы, лекции, тесты, студенты</p>
      </div>

      <div className="flex bg-black/5 rounded-2xl p-1 mb-6 max-w-sm">
        <button
          onClick={() => setTab("programs")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
            tab === "programs" ? "bg-white text-black shadow-sm" : "text-black/40"
          }`}
        >
          <Icon name="BookOpen" size={14} /> Программы
        </button>
        <button
          onClick={() => setTab("students")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
            tab === "students" ? "bg-white text-black shadow-sm" : "text-black/40"
          }`}
        >
          <Icon name="Users" size={14} /> Студенты
        </button>
      </div>

      {tab === "programs" && <AdminCampPrograms onEdit={setEditingProgramId} />}
      {tab === "students" && <AdminCampStudents />}
    </div>
  );
}
