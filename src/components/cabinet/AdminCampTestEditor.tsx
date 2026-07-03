import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { campApi } from "@/lib/camp-api";

type Answer = { id?: number; answer_text: string; is_correct: boolean };
type Question = { id: number; question: string; sort_order: number; answers: (Answer & { id: number })[] };

export default function AdminCampTestEditor({ testId, onBack }: { testId: number; onBack: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ id?: number; question: string; answers: Answer[] } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { questions } = await campApi.adminQuestions(testId);
      setQuestions(questions);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [testId]);

  const save = async () => {
    if (!editing) return;
    if (!editing.question.trim() || editing.answers.length < 2 || !editing.answers.some((a) => a.is_correct)) {
      alert("Заполните вопрос, минимум 2 варианта ответа и отметьте правильный");
      return;
    }
    await campApi.adminQuestionSave({ ...editing, test_id: testId, sort_order: questions.length + 1 });
    setEditing(null);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить вопрос?")) return;
    await campApi.adminQuestionDelete(id);
    load();
  };

  const startNew = () => setEditing({ question: "", answers: [{ answer_text: "", is_correct: true }, { answer_text: "", is_correct: false }] });
  const startEdit = (q: Question) => setEditing({ id: q.id, question: q.question, answers: q.answers.map((a) => ({ id: a.id, answer_text: a.answer_text, is_correct: a.is_correct })) });

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-black/40 text-[13px] font-semibold hover:text-black mb-4">
        <Icon name="ArrowLeft" size={14} /> Назад к программе
      </button>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-black text-lg">Вопросы теста</h2>
        <button onClick={startNew} className="px-4 py-2 rounded-xl text-black font-semibold text-sm flex items-center gap-1.5"
          style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}>
          <Icon name="Plus" size={15} /> Добавить вопрос
        </button>
      </div>

      {loading ? (
        <Icon name="Loader" size={22} className="animate-spin text-black/30" />
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-2xl p-4 border border-black/6">
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="font-bold text-black text-[14px]">{i + 1}. {q.question}</div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(q)} className="p-1.5 rounded-lg hover:bg-black/5 text-black/50">
                    <Icon name="Pencil" size={13} />
                  </button>
                  <button onClick={() => remove(q.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                {q.answers.map((a) => (
                  <div key={a.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] ${a.is_correct ? "bg-green-50 text-green-700" : "bg-black/[0.02] text-black/50"}`}>
                    <Icon name={a.is_correct ? "CheckCircle2" : "Circle"} size={13} />
                    {a.answer_text}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {questions.length === 0 && <div className="text-black/30 text-sm py-2">Нет вопросов</div>}
        </div>
      )}

      {editing && (
        <QuestionModal
          data={editing}
          onChange={setEditing}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function QuestionModal({ data, onChange, onSave, onClose }: {
  data: { id?: number; question: string; answers: Answer[] };
  onChange: (d: { id?: number; question: string; answers: Answer[] }) => void;
  onSave: () => void; onClose: () => void;
}) {
  const setAnswer = (idx: number, patch: Partial<Answer>) => {
    const answers = data.answers.map((a, i) => i === idx ? { ...a, ...patch } : a);
    onChange({ ...data, answers });
  };
  const setCorrect = (idx: number) => {
    onChange({ ...data, answers: data.answers.map((a, i) => ({ ...a, is_correct: i === idx })) });
  };
  const addAnswer = () => onChange({ ...data, answers: [...data.answers, { answer_text: "", is_correct: false }] });
  const removeAnswer = (idx: number) => onChange({ ...data, answers: data.answers.filter((_, i) => i !== idx) });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-black text-black mb-5">{data.id ? "Редактирование вопроса" : "Новый вопрос"}</h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-black/40 font-semibold block mb-1.5">Текст вопроса</label>
            <textarea value={data.question} onChange={(e) => onChange({ ...data, question: e.target.value })} rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] border border-black/8 text-sm focus:outline-none resize-none" />
          </div>

          <div>
            <label className="text-xs text-black/40 font-semibold block mb-2">Варианты ответа (отметьте правильный)</label>
            <div className="space-y-2">
              {data.answers.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button onClick={() => setCorrect(i)} className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${a.is_correct ? "bg-green-500 text-white" : "bg-black/10 text-transparent"}`}>
                    <Icon name="Check" size={13} />
                  </button>
                  <input value={a.answer_text} onChange={(e) => setAnswer(i, { answer_text: e.target.value })}
                    placeholder={`Вариант ${i + 1}`}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#f5f5f7] border border-black/8 text-sm focus:outline-none" />
                  {data.answers.length > 2 && (
                    <button onClick={() => removeAnswer(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 shrink-0">
                      <Icon name="X" size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addAnswer} className="mt-2 text-[12px] font-semibold text-black/40 hover:text-black">
              + Добавить вариант
            </button>
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
