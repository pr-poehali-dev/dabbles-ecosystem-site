import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { request } from "@/lib/api";

type OrgNode = {
  id: number;
  parent_id: number | null;
  title: string;
  subtitle: string;
  description: string;
  sort_order: number;
};

function buildTree(nodes: OrgNode[]): (OrgNode & { children: OrgNode[] })[] {
  const map = new Map<number, OrgNode & { children: OrgNode[] }>();
  nodes.forEach((n) => map.set(n.id, { ...n, children: [] }));
  const roots: (OrgNode & { children: OrgNode[] })[] = [];
  nodes.forEach((n) => {
    if (n.parent_id === null) {
      roots.push(map.get(n.id)!);
    } else {
      map.get(n.parent_id)?.children.push(map.get(n.id)!);
    }
  });
  return roots;
}

type TreeNode = OrgNode & { children: TreeNode[] };

function OrgNodeCard({ node, level = 0 }: { node: TreeNode; level?: number }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const isRoot = level === 0;

  // Отступ на каждый уровень (меньше на мобиле, больше на десктопе)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const indent = level * (isMobile ? 14 : 32);

  return (
    <div style={{ marginLeft: indent }}>
      {/* Карточка */}
      <div className="relative mb-2">
        {/* Вертикальная линия слева (для не-рутовых) */}
        {level > 0 && (
          <div
            className="absolute left-[-20px] top-[50%] w-4 border-t border-dashed border-black/20"
            style={{ top: "50%" }}
          />
        )}

        <div
          className={`flex items-center gap-2.5 md:gap-3 rounded-2xl px-3.5 py-3 md:px-5 md:py-4 border transition-all ${
            isRoot
              ? "bg-white border-[#1a0a6e]/20 shadow-sm"
              : level === 1
              ? "bg-[#f5f5fb] border-black/8 shadow-sm"
              : "bg-[#f9f9fc] border-black/6"
          }`}
        >
          {/* Кнопка развернуть/свернуть */}
          {hasChildren ? (
            <button
              onClick={() => setOpen(o => !o)}
              className="w-6 h-6 rounded-full border-2 border-[#2ec4a0] flex items-center justify-center shrink-0 hover:bg-[#2ec4a0]/10 transition-colors"
            >
              <Icon name={open ? "Minus" : "Plus"} size={12} className="text-[#2ec4a0]" />
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <div className="w-2 h-2 rounded-full bg-black/20" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className={`font-bold leading-snug ${isRoot ? "text-[#0e1a4a] text-[15px]" : level === 1 ? "text-[#0e1a4a] text-[14px]" : "text-[#0e1a4a] text-[13px]"}`}>
              {node.title}
            </div>
            {node.subtitle && (
              <div className="text-[12px] text-black/40 mt-0.5">{node.subtitle}</div>
            )}
          </div>
        </div>
      </div>

      {/* Дочерние элементы */}
      {hasChildren && open && (
        <div className="relative ml-1.5 pl-3 md:ml-3 md:pl-5 border-l border-dashed border-black/15">
          {node.children.map(child => (
            <OrgNodeCard key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function About() {
  const [nodes, setNodes] = useState<OrgNode[]>([]);

  useEffect(() => {
    request<{ nodes: OrgNode[] }>("public-data", { query: { action: "org" }, auth: false })
      .then(({ nodes }) => setNodes(nodes))
      .catch(() => {});
  }, []);

  const tree = buildTree(nodes);

  return (
    <div className="min-h-screen bg-white text-black font-body">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[68px] bg-white border-b border-black/8 flex items-center px-6 md:px-10">
        <Link to="/" className="flex items-center gap-2 text-black/50 hover:text-black transition-colors text-sm font-medium">
          <Icon name="ArrowLeft" size={16} />
          На главную
        </Link>
        <div className="flex-1 flex justify-center">
          <Link to="/">
            <img
              src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/279bdee6-7783-4862-83f9-25bd24811276.png"
              alt="Даббл"
              className="h-7 w-auto object-contain"
              style={{ filter: "invert(1)" }}
            />
          </Link>
        </div>
        <div className="w-24" />
      </nav>

      <div className="pt-[68px]">
        {/* HERO */}
        <section className="bg-gradient-to-br from-[#0a0535] via-[#1a0a6e] to-[#2d0060] px-5 md:px-16 py-14 md:py-28">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-semibold mb-6">
              <Icon name="Building2" size={13} />
              О компании
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              Архитектор<br />будущего комфорта
            </h1>
            <p className="text-white/60 text-lg md:text-xl leading-relaxed max-w-2xl">
              «Даббл» — не просто корпорация. Мы создаём экосистему сервисов, где бизнес и повседневная жизнь сливаются в единый бесшовный поток возможностей.
            </p>
          </div>
        </section>

        {/* МИССИЯ */}
        <section className="bg-white px-5 md:px-16 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-[#1a0a6e] text-sm font-bold mb-4">
              <Icon name="Target" size={16} />
              Наша миссия
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-black text-black mb-8">
              Единая точка доступа к инструментам роста
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                {
                  icon: "Layers",
                  title: "Экосистема сервисов",
                  text: "Представьте мир, где каждое ваше действие — от решения рабочих задач до планирования отдыха — поддерживается умными, взаимосвязанными сервисами.",
                },
                {
                  icon: "Zap",
                  title: "Единый поток",
                  text: "Больше не нужно переключаться между десятками приложений: «Даббл» даёт единую точку доступа к инструментам роста и удовольствия.",
                },
                {
                  icon: "TrendingUp",
                  title: "Ваш ритм успеха",
                  text: "Мы строим не набор услуг, а среду, в которой каждый находит свой ритм успеха — легко, быстро и с удовольствием.",
                },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-[#f5f5f7] rounded-3xl">
                  <div className="w-10 h-10 rounded-xl bg-[#1a0a6e]/10 flex items-center justify-center mb-4">
                    <Icon name={item.icon} size={20} className="text-[#1a0a6e]" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-black mb-2">{item.title}</h3>
                  <p className="text-black/50 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* СЛОВО ДИРЕКТОРА */}
        <section className="bg-[#f5f5f7] px-5 md:px-16 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-[#1a0a6e] text-sm font-bold mb-8">
              <Icon name="MessageSquareQuote" size={16} />
              Слово директора
            </div>
            <div className="bg-white rounded-3xl p-6 md:p-12 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-1.5 h-full rounded-l-3xl"
                style={{ background: "linear-gradient(to bottom, #FD4160, #1a0a6e)" }}
              />
              <div className="text-5xl font-display text-[#1a0a6e]/10 leading-none mb-4 select-none">"</div>
              <p className="text-black/70 text-lg md:text-xl leading-relaxed mb-6 md:mb-8 italic">
                Когда мы основывали «Даббл», перед нами стоял один вопрос: почему современный человек вынужден тратить силы на рутину вместо того, чтобы создавать? Мы решили дать ответ делом. Сегодня наша экосистема — это не просто набор продуктов. Это философия: технологии должны служить человеку, а не наоборот. Мы строим будущее, в котором каждый инструмент понимает тебя с первого шага. И это только начало.
              </p>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a0a6e] to-[#FD4160] flex items-center justify-center shrink-0">
                    <span className="text-white font-display font-black text-lg">СС</span>
                  </div>
                  <div>
                    <div className="font-display font-black text-black">Сергей Серебренников</div>
                    <div className="text-black/40 text-sm">Генеральный директор, корпорация экосистемных проектов «Даббл»</div>
                  </div>
                </div>
                <Link
                  to="/director"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/12 text-black/50 hover:text-black hover:border-black/25 text-sm font-medium transition-colors"
                >
                  Страница директора
                  <Icon name="ArrowRight" size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ОРГ-СХЕМА */}
        <section className="bg-white px-5 md:px-16 py-12 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-[#1a0a6e] text-sm font-bold mb-4">
              <Icon name="Network" size={16} />
              Структура компании
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-black text-black mb-8 md:mb-12">
              Команда «Даббл»
            </h2>

            {nodes.length === 0 ? (
              <div className="flex items-center justify-center py-20 text-black/30">
                <Icon name="Loader" size={24} className="animate-spin" />
              </div>
            ) : (
              <div className="max-w-2xl">
                {tree.map((root) => (
                  <OrgNodeCard key={root.id} node={root as TreeNode} level={0} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#0a0535] px-5 md:px-16 py-12 md:py-16">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-black text-white mb-2">Стань участником наших проектов</h2>
              <p className="text-white/45">Исследуй экосистему сервисов «Даббл»</p>
            </div>
            <Link
              to="/#products"
              className="shrink-0 w-full md:w-auto text-center px-7 py-3.5 rounded-2xl bg-[#FD4160] text-white font-semibold hover:bg-[#e0324f] transition-colors"
            >
              Наши сервисы
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-black px-6 md:px-12 py-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <img
              src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/279bdee6-7783-4862-83f9-25bd24811276.png"
              alt="Даббл"
              className="h-6 w-auto object-contain opacity-60"
            />
            <div className="flex gap-5 text-white/30 text-sm flex-wrap justify-center">
              <Link to="/privacy" className="hover:text-white/60 transition-colors">Политика конфиденциальности</Link>
              <Link to="/legal" className="hover:text-white/60 transition-colors">Реквизиты</Link>
            </div>
            <p className="text-white/20 text-sm">© 2025 ООО «ДАББЛ РУС»</p>
          </div>
        </footer>
      </div>
    </div>
  );
}