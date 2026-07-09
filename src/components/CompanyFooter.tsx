import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

const LOGO_URL = "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/3bb7bd0c-31d8-44c0-85ef-0bd65a2a3961.png";

const REQUISITES = [
  { label: "ИП", value: "Серебренникова Галина Сергеевна" },
  { label: "ОГРНИП", value: "325890000028798" },
  { label: "ИНН", value: "890500558522" },
];

interface Props {
  className?: string;
}

export default function CompanyFooter({ className = "" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <footer
        className={`mx-3 mb-3 md:mx-6 md:mb-6 rounded-3xl bg-white border border-black/8 shadow-sm px-5 py-4 flex items-center justify-between gap-3 ${className}`}
      >
        <img src={LOGO_URL} alt="Даббл" className="h-6 w-auto object-contain" />
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f5f5f7] text-black/70 text-[13px] font-semibold hover:bg-black/10 transition-colors shrink-0"
        >
          <Icon name="Info" size={14} /> О компании
        </button>
      </footer>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <div className="flex justify-center mb-1">
              <img src={LOGO_URL} alt="Даббл" className="h-8 w-auto object-contain" />
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