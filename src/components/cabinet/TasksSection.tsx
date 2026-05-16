import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";

type Task = {
  id: number;
  title: string;
  description: string;
  status: "new" | "in_progress" | "done";
  priority: string;
};

const COLUMNS: { key: Task["status"]; label: string; color: string }[] = [
  { key: "new", label: "Новые", color: "#0077FF" },
  { key: "in_progress", label: "В работе", color: "#FD4160" },
  { key: "done", label: "Готово", color: "#22c55e" },
];

export default function TasksSection() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await request<{ items: Task[] }>("workspace", { query: { kind: "tasks" } });
      setTasks(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!newTitle.trim()) return;
    await request("workspace", {
      method: "POST",
      query: { kind: "tasks" },
      body: { title: newTitle, status: "new", priority: "medium" },
    });
    setNewTitle("");
    load();
  };

  const move = async (t: Task, status: Task["status"]) => {
    await request("workspace", { method: "PUT", query: { kind: "tasks" }, body: { id: t.id, status } });
    load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-black text-black mb-1">Задачи</h1>
      <p className="text-black/50 mb-6">Канбан-доска по статусам</p>

      <div className="flex gap-2 mb-6 max-w-xl">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Новая задача..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-black/10 focus:border-black/30 outline-none text-black"
        />
        <button onClick={add} className="px-5 py-2.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-black/85">
          Добавить
        </button>
      </div>

      {loading ? (
        <Icon name="Loader" size={22} className="animate-spin text-black/30" />
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const col_tasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="bg-white rounded-2xl p-4 min-h-[300px]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <h3 className="font-semibold text-black">{col.label}</h3>
                  <span className="text-xs text-black/40 ml-auto">{col_tasks.length}</span>
                </div>
                <div className="space-y-2">
                  {col_tasks.map((t) => (
                    <div key={t.id} className="p-3 bg-black/3 rounded-xl">
                      <div className="text-sm font-medium text-black mb-2">{t.title}</div>
                      <div className="flex gap-1">
                        {COLUMNS.filter((c) => c.key !== t.status).map((c) => (
                          <button
                            key={c.key}
                            onClick={() => move(t, c.key)}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-white hover:bg-black hover:text-white text-black/60 transition-colors"
                          >
                            → {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {col_tasks.length === 0 && (
                    <div className="text-xs text-black/30 text-center py-8">Пусто</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
