import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

const LOGO = "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/a4c91874-6ec5-442c-be38-6a949286b9b1.png";

const REQUISITES = [
  { label: "ИП", value: "Серебренникова Галина Сергеевна" },
  { label: "ОГРНИП", value: "325890000028798" },
  { label: "ИНН", value: "890500558522" },
];

const LINKS = [
  { label: "Политика конфиденциальности", to: "/privacy" },
  { label: "Публичная оферта", to: "/offer" },
  { label: "Реквизиты", to: "/legal" },
];

interface Props {
  className?: string;
}

export default function CampFooter({ className = "" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <footer
        className={`mx-3 mb-3 md:mx-6 md:mb-6 rounded-3xl bg-white border border-black/8 shadow-sm px-5 py-5 md:px-7 md:py-6 ${className}`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Кэмп" className="h-7 w-7 rounded-lg object-contain" />
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f5f5f7] text-black/70 text-[12px] font-semibold hover:bg-black/10 transition-colors shrink-0"
            >
              <Icon name="Info" size={13} /> О компании
            </button>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LINKS.map(l => (
              <Link key={l.to} to={l.to} className="text-[12px] text-black/45 hover:text-black transition-colors">
                {l.label}
              </Link>
            ))}
            <a href="mailto:info@dabbl.ru" className="text-[12px] text-black/45 hover:text-black transition-colors">
              info@dabbl.ru
            </a>
          </nav>
        </div>

        <div className="mt-4 pt-4 border-t border-black/6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-black/30 text-center sm:text-left">
            © 2026 ИП Серебренникова Г.С. · ОГРНИП 325890000028798
          </p>
          <p className="text-[11px] text-black/25">
            Кэмп — образовательная программа экосистемы «Даббл»
          </p>
        </div>
      </footer>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <div className="flex justify-center mb-1">
              <img src={LOGO} alt="Кэмп" className="h-9 w-9 rounded-xl object-contain" />
            </div>
            <DialogTitle className="text-center">О компании</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            {REQUISITES.map(r => (
              <div key={r.label} className="bg-[#f5f5f7] rounded-xl px-3 py-2.5">
                <div className="text-[10px] text-black/40 font-semibold mb-0.5">{r.label}</div>
                <div className="text-[13px] text-black font-medium">{r.value}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 pt-2 border-t border-black/6 mt-1">
            <Link to="/privacy" className="text-[12px] text-black/45 hover:text-black underline" onClick={() => setOpen(false)}>
              Политика конфиденциальности
            </Link>
            <Link to="/offer" className="text-[12px] text-black/45 hover:text-black underline" onClick={() => setOpen(false)}>
              Публичная оферта
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
