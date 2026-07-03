import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { campApi, CampTest } from "@/lib/camp-api";
import Icon from "@/components/ui/icon";

export default function CampTestView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<CampTest | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean; certificate: { cert_number: string; pdf_url: string } | null } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    campApi.test(Number(id)).then((r) => setTest(r.test)).catch(() => {});
  }, [id]);

  const submit = async () => {
    if (!test) return;
    setSubmitting(true);
    try {
      const r = await campApi.testSubmit(test.id, answers);
      setResult(r);
    } finally {
      setSubmitting(false);
    }
  };

  if (!test) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#DAB332]/30 border-t-[#DAB332] rounded-full animate-spin" />
    </div>
  );

  if (result) {
    return (
      <div className="max-w-lg mx-auto text-center py-10">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: result.passed ? "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" : "#fee2e2" }}
        >
          <Icon name={result.passed ? "Trophy" : "XCircle"} size={34} className={result.passed ? "text-black" : "text-red-500"} />
        </div>
        <h1 className="font-display text-2xl font-black text-black mb-2">
          {result.passed ? "Тест пройден!" : "Тест не пройден"}
        </h1>
        <p className="text-black/50 text-[15px] mb-6">Ваш результат: {result.score}%</p>

        {result.certificate && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}>
            <Icon name="Award" size={28} className="text-black mx-auto mb-2" />
            <div className="font-black text-black text-[15px] mb-3">Вы получили сертификат!</div>
            <a href={result.certificate.pdf_url} target="_blank" rel="noreferrer"
              className="inline-block px-5 py-2.5 rounded-xl bg-black text-white font-bold text-[13px]">
              Скачать PDF
            </a>
          </div>
        )}

        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl bg-black/5 text-black font-bold text-[14px] hover:bg-black/10">
          Вернуться к программе
        </button>
      </div>
    );
  }

  const allAnswered = test.questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl font-black text-black mb-1">{test.title}</h1>
        <p className="text-black/40 text-[13px]">Проходной балл: {test.passing_score}%</p>
      </div>

      {test.questions.map((q, qi) => (
        <div key={q.id} className="bg-white rounded-2xl p-5 border border-black/6">
          <div className="font-bold text-black text-[15px] mb-3.5">{qi + 1}. {q.question}</div>
          <div className="space-y-2">
            {q.answers.map((a) => (
              <button
                key={a.id}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: a.id }))}
                className={`w-full text-left px-4 py-3 rounded-xl border text-[14px] font-medium transition-all ${
                  answers[q.id] === a.id
                    ? "border-[#DAB332] bg-[#FBF3D9]"
                    : "border-black/8 hover:border-black/20"
                }`}
              >
                {a.answer_text}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={submit} disabled={!allAnswered || submitting}
        className="w-full py-3.5 rounded-2xl text-black font-bold text-[15px] transition-all hover:opacity-90 disabled:opacity-40"
        style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}
      >
        {submitting ? "Проверяем..." : "Завершить тест"}
      </button>
    </div>
  );
}
