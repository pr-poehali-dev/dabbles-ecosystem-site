import { Link } from "react-router-dom";

export default function MeroshkinsFooter() {
  return (
    <footer className="border-t border-black/6 mt-8 py-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
        <Link to="/">
          <img
            src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/8489822e-aa5c-49c6-a97a-5134c5f5b338.png"
            alt="Даббл Крауд"
            className="h-7 w-auto opacity-40 hover:opacity-70 transition-opacity"
          />
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link to="/privacy?from=meroshkins" className="text-[12px] text-black/35 hover:text-black/60 transition-colors">
            Политика конфиденциальности
          </Link>
          <span className="text-black/15 text-[12px]">·</span>
          <Link to="/offer?from=meroshkins" className="text-[12px] text-black/35 hover:text-black/60 transition-colors">
            Публичная оферта
          </Link>
          <span className="text-black/15 text-[12px]">·</span>
          <Link to="/meroshkins/promo" className="text-[12px] text-black/35 hover:text-black/60 transition-colors">
            О сервисе
          </Link>
        </div>
        <p className="text-[11px] text-black/20 text-center">
          Проект входит в экосистему корпорации «Даббл» — 2026
        </p>
      </div>
    </footer>
  );
}