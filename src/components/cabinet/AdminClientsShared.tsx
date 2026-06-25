import Icon from "@/components/ui/icon";

export function Modal({ title, children, onClose, wide }: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 overflow-y-auto">
      <div className={`bg-white rounded-3xl w-full ${wide ? "max-w-xl" : "max-w-md"} p-6 my-4`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-black text-[16px]">{title}</h3>
          <button onClick={onClose} className="text-black/30 hover:text-black p-1">
            <Icon name="X" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FormField({ label, placeholder = "", value, onChange, required, type = "text" }: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-black/40 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm bg-[#f5f5f7] focus:outline-none focus:border-[#1a0a6e]/40"
      />
    </div>
  );
}

export function ModalButtons({ onClose, loading, label }: {
  onClose: () => void;
  loading?: boolean;
  label: string;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm font-semibold text-black/60 hover:bg-black/5"
      >
        Отмена
      </button>
      <button
        type="submit"
        disabled={loading}
        className="flex-1 py-2.5 rounded-xl bg-[#1a0a6e] text-white text-sm font-semibold disabled:opacity-50"
      >
        {loading ? "..." : label}
      </button>
    </div>
  );
}
