import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { campApi } from "@/lib/camp-api";
import AdminCampTestEditor from "./AdminCampTestEditor";
import RichTextEditor from "@/components/ui/rich-text-editor";

type Module = { id: number; title: string; sort_order: number; is_active: boolean };
type Lecture = { id: number; title: string; content: string; video_url: string; file_url: string; sort_order: number; is_active: boolean };
type Test = { id: number; module_id: number | null; title: string; is_final: boolean; passing_score: number; sort_order: number };

export default function AdminCampProgramEditor({ programId, onBack }: { programId: number; onBack: () => void }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [lecturesByModule, setLecturesByModule] = useState<Record<number, Lecture[]>>({});
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModule, setOpenModule] = useState<number | null>(null);
  const [editingLecture, setEditingLecture] = useState<{ moduleId: number; lecture: Partial<Lecture> } | null>(null);
  const [editingTestId, setEditingTestId] = useState<number | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [modRes, testRes] = await Promise.all([
        campApi.adminModules(programId),
        campApi.adminTests(programId),
      ]);
      setModules(modRes.modules.filter((m) => m.is_active));
      setTests(testRes.tests);
      const entries = await Promise.all(
        modRes.modules.filter((m) => m.is_active).map(async (m) => {
          const { lectures } = await campApi.adminLectures(m.id);
          return [m.id, lectures.filter((l) => l.is_active)] as const;
        })
      );
      setLecturesByModule(Object.fromEntries(entries));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [programId]);

  const addModule = async () => {
    if (!newModuleTitle.trim()) return;
    await campApi.adminModuleSave({ program_id: programId, title: newModuleTitle.trim(), sort_order: modules.length + 1 });
    setNewModuleTitle("");
    load();
  };

  const removeModule = async (id: number) => {
    if (!confirm("Удалить модуль вместе с лекциями?")) return;
    await campApi.adminModuleDelete(id);
    load();
  };

  const saveLecture = async () => {
    if (!editingLecture) return;
    const { moduleId, lecture } = editingLecture;
    await campApi.adminLectureSave({ ...lecture, module_id: moduleId });
    setEditingLecture(null);
    load();
  };

  const removeLecture = async (id: number) => {
    if (!confirm("Удалить лекцию?")) return;
    await campApi.adminLectureDelete(id);
    load();
  };

  const addModuleTest = async (moduleId: number) => {
    await campApi.adminTestSave({ program_id: programId, module_id: moduleId, title: "Тест по модулю", is_final: false, passing_score: 70, sort_order: 1 });
    load();
  };

  const addFinalTest = async () => {
    await campApi.adminTestSave({ program_id: programId, title: "Итоговый тест", is_final: true, passing_score: 70, sort_order: 99 });
    load();
  };

  const removeTest = async (id: number) => {
    if (!confirm("Удалить тест вместе с вопросами?")) return;
    await campApi.adminTestDelete(id);
    load();
  };

  if (editingTestId !== null) {
    return <AdminCampTestEditor testId={editingTestId} onBack={() => { setEditingTestId(null); load(); }} />;
  }

  const finalTest = tests.find((t) => t.is_final);
  const testByModule = (moduleId: number) => tests.find((t) => t.module_id === moduleId && !t.is_final);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-black/40 text-[13px] font-semibold hover:text-black mb-4">
        <Icon name="ArrowLeft" size={14} /> К списку программ
      </button>

      {loading ? (
        <Icon name="Loader" size={22} className="animate-spin text-black/30" />
      ) : (
        <div className="space-y-4">
          {modules.map((m, idx) => {
            const test = testByModule(m.id);
            return (
              <div key={m.id} className="bg-white rounded-2xl border border-black/6 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-black/[0.02] border-b border-black/6">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                  <button onClick={() => setOpenModule(openModule === m.id ? null : m.id)} className="flex-1 text-left font-black text-black text-[14px]">
                    {m.title}
                  </button>
                  <button onClick={() => removeModule(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400" title="Удалить модуль">
                    <Icon name="Trash2" size={14} />
                  </button>
                  <Icon name={openModule === m.id ? "ChevronUp" : "ChevronDown"} size={16} className="text-black/25" onClick={() => setOpenModule(openModule === m.id ? null : m.id)} />
                </div>

                {openModule === m.id && (
                  <div className="p-4 space-y-2">
                    {(lecturesByModule[m.id] || []).map((l) => (
                      <div key={l.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-black/[0.02]">
                        <Icon name="PlayCircle" size={14} className="text-black/30 shrink-0" />
                        <span className="flex-1 text-[13px] font-semibold text-black truncate">{l.title}</span>
                        <button onClick={() => setEditingLecture({ moduleId: m.id, lecture: l })} className="p-1.5 rounded-lg hover:bg-black/10 text-black/50">
                          <Icon name="Pencil" size={13} />
                        </button>
                        <button onClick={() => removeLecture(l.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                          <Icon name="Trash2" size={13} />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => setEditingLecture({ moduleId: m.id, lecture: { title: "Новая лекция", content: "", video_url: "", file_url: "", sort_order: (lecturesByModule[m.id]?.length || 0) + 1 } })}
                      className="w-full py-2 rounded-xl border-2 border-dashed border-black/10 text-black/40 text-[12px] font-semibold hover:border-[#DAB332]/50 hover:text-[#DAB332] transition-colors"
                    >
                      + Добавить лекцию
                    </button>

                    <div className="pt-2 border-t border-black/6 mt-2">
                      {test ? (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#FBF3D9]">
                          <Icon name="ListChecks" size={14} className="text-[#DAB332] shrink-0" />
                          <span className="flex-1 text-[13px] font-semibold text-black">{test.title}</span>
                          <button onClick={() => setEditingTestId(test.id)} className="px-2.5 py-1 rounded-lg bg-black text-white text-[11px] font-bold">
                            Вопросы
                          </button>
                          <button onClick={() => removeTest(test.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                            <Icon name="Trash2" size={13} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => addModuleTest(m.id)}
                          className="w-full py-2 rounded-xl border-2 border-dashed border-black/10 text-black/40 text-[12px] font-semibold hover:border-[#DAB332]/50 hover:text-[#DAB332] transition-colors">
                          + Добавить тест по модулю
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="bg-white rounded-2xl border border-black/6 p-4 flex items-center gap-2">
            <input
              value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addModule()}
              placeholder="Название нового модуля"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-sm focus:outline-none"
            />
            <button onClick={addModule} className="px-4 py-2.5 rounded-xl bg-black text-white text-sm font-bold shrink-0">
              + Модуль
            </button>
          </div>

          <div className="bg-black rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Trophy" size={20} className="text-[#EBD047]" />
              <span className="font-black text-white text-[14px]">Итоговый тест программы</span>
            </div>
            {finalTest ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingTestId(finalTest.id)} className="px-3.5 py-2 rounded-xl bg-white text-black text-[12px] font-bold">
                  Вопросы
                </button>
                <button onClick={() => removeTest(finalTest.id)} className="p-2 rounded-lg hover:bg-white/10 text-white/50">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            ) : (
              <button onClick={addFinalTest} className="px-4 py-2 rounded-xl text-black font-bold text-[12px]"
                style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}>
                + Создать
              </button>
            )}
          </div>
        </div>
      )}

      {editingLecture && (
        <LectureModal
          lecture={editingLecture.lecture}
          onChange={(l) => setEditingLecture({ ...editingLecture, lecture: l })}
          onSave={saveLecture}
          onClose={() => setEditingLecture(null)}
        />
      )}
    </div>
  );
}

function LectureModal({ lecture, onChange, onSave, onClose }: {
  lecture: Partial<Lecture>; onChange: (l: Partial<Lecture>) => void; onSave: () => void; onClose: () => void;
}) {
  const set = (k: keyof Lecture, v: unknown) => onChange({ ...lecture, [k]: v });

  const uploadImage = async (file: File) => {
    const buf = await file.arrayBuffer();
    const b64 = btoa(new Uint8Array(buf).reduce((acc, b) => acc + String.fromCharCode(b), ""));
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const res = await campApi.upload(b64, ext);
    return res.url;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-black text-black mb-5">
          {lecture.id ? "Редактирование лекции" : "Новая лекция"}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Заголовок</label>
            <input value={lecture.title || ""} onChange={(e) => set("title", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Текст лекции</label>
            <RichTextEditor
              value={lecture.content || ""}
              onChange={(html) => set("content", html)}
              onUploadImage={uploadImage}
              placeholder="Начните писать текст лекции — можно выделять жирным, добавлять заголовки, списки, ссылки и картинки..."
            />
          </div>
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Ссылка на видео (необязательно)</label>
            <input value={lecture.video_url || ""} onChange={(e) => set("video_url", e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Ссылка на файл материала (необязательно)</label>
            <input value={lecture.file_url || ""} onChange={(e) => set("file_url", e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-sm focus:outline-none" />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onSave} className="flex-1 py-3 rounded-xl text-black font-semibold"
            style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}>
            Сохранить
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl bg-black/5 text-black/60 font-semibold hover:bg-black/10">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}