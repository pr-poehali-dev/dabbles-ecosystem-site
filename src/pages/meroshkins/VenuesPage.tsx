import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { MVenue, MRoom, mApi } from "@/lib/meroshkins";

const SF: React.CSSProperties = { fontFamily: "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif" };

export default function VenuesPage() {
  const [venues,  setVenues]  = useState<MVenue[]>([]);
  const [rooms,   setRooms]   = useState<MRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const [vModal, setVModal] = useState(false);
  const [vForm,  setVForm]  = useState({ name: "", address: "", description: "" });
  const [vEdit,  setVEdit]  = useState<MVenue | null>(null);

  const [rModal, setRModal] = useState(false);
  const [rForm,  setRForm]  = useState({ name: "", venue_id: "", capacity: "", features: "" });
  const [rEdit,  setREdit]  = useState<MRoom | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [v, r] = await Promise.all([mApi.venues(), mApi.rooms()]);
      setVenues(v.venues);
      setRooms(r.rooms);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const saveVenue = async () => {
    if (!vForm.name.trim()) return;
    if (vEdit) await mApi.updateVenue({ ...vForm, id: vEdit.id });
    else await mApi.createVenue(vForm);
    setVModal(false); setVEdit(null); setVForm({ name: "", address: "", description: "" });
    load();
  };

  const saveRoom = async () => {
    if (!rForm.name.trim() || !rForm.venue_id) return;
    const data = { ...rForm, venue_id: Number(rForm.venue_id), capacity: Number(rForm.capacity) || 0 };
    if (rEdit) await mApi.updateRoom({ ...data, id: rEdit.id });
    else await mApi.createRoom(data);
    setRModal(false); setREdit(null); setRForm({ name: "", venue_id: "", capacity: "", features: "" });
    load();
  };

  const openVEdit = (v: MVenue) => {
    setVEdit(v);
    setVForm({ name: v.name, address: v.address, description: v.description });
    setVModal(true);
  };

  const openREdit = (r: MRoom) => {
    setREdit(r);
    setRForm({ name: r.name, venue_id: String(r.venue_id), capacity: String(r.capacity), features: r.features });
    setRModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto" style={SF}>
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-black tracking-[-0.5px] mb-0.5">Площадки и залы</h1>
        <p className="text-[13px] text-black/40">Управляйте пространствами для проведения мероприятий</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 border-2 border-[#7c3aed]/25 border-t-[#7c3aed] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">

          {/* ── VENUES ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-black">Площадки</h2>
              <button
                onClick={() => { setVEdit(null); setVForm({ name: "", address: "", description: "" }); setVModal(true); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#7c3aed] text-white text-[12px] font-semibold hover:bg-[#6d28d9] transition-colors"
              >
                <Icon name="Plus" size={12} /> Добавить
              </button>
            </div>

            {venues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 rounded-2xl border-2 border-dashed border-black/10">
                <Icon name="MapPin" size={20} className="text-black/20 mb-2" />
                <p className="text-[13px] text-black/30">Нет площадок</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {venues.map(v => (
                  <div key={v.id} className="flex items-center gap-3 bg-white rounded-2xl border border-black/6 shadow-sm px-4 py-3.5">
                    <div className="w-8 h-8 rounded-xl bg-[#7c3aed]/8 flex items-center justify-center shrink-0">
                      <Icon name="Building2" size={15} className="text-[#7c3aed]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-black truncate">{v.name}</div>
                      {v.address && <div className="text-[11px] text-black/35 truncate">{v.address}</div>}
                    </div>
                    <button onClick={() => openVEdit(v)}
                      className="p-1.5 rounded-lg hover:bg-black/5 text-black/20 hover:text-black/50 transition-colors shrink-0">
                      <Icon name="Pencil" size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── ROOMS ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-black">Залы</h2>
              <button
                onClick={() => {
                  setREdit(null);
                  setRForm({ name: "", venue_id: venues[0] ? String(venues[0].id) : "", capacity: "", features: "" });
                  setRModal(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#7c3aed] text-white text-[12px] font-semibold hover:bg-[#6d28d9] transition-colors"
              >
                <Icon name="Plus" size={12} /> Добавить
              </button>
            </div>

            {rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 rounded-2xl border-2 border-dashed border-black/10">
                <Icon name="DoorOpen" size={20} className="text-black/20 mb-2" />
                <p className="text-[13px] text-black/30">Нет залов</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {rooms.map(r => (
                  <div key={r.id} className="flex items-center gap-3 bg-white rounded-2xl border border-black/6 shadow-sm px-4 py-3.5">
                    <div className="w-8 h-8 rounded-xl bg-[#7c3aed]/8 flex items-center justify-center shrink-0">
                      <Icon name="LayoutGrid" size={14} className="text-[#7c3aed]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-black truncate">{r.name}</div>
                      <div className="text-[11px] text-black/35">
                        {r.venue_name}{r.capacity ? ` · ${r.capacity} чел.` : ""}
                        {r.features ? ` · ${r.features}` : ""}
                      </div>
                    </div>
                    <button onClick={() => openREdit(r)}
                      className="p-1.5 rounded-lg hover:bg-black/5 text-black/20 hover:text-black/50 transition-colors shrink-0">
                      <Icon name="Pencil" size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VENUE MODAL ── */}
      {vModal && (
        <SheetModal
          title={vEdit ? "Редактировать площадку" : "Новая площадка"}
          onClose={() => setVModal(false)}
          onSave={saveVenue}
        >
          <MField label="Название *">
            <input value={vForm.name} onChange={e => setVForm(f => ({ ...f, name: e.target.value }))} className="minput" placeholder="Название площадки" />
          </MField>
          <MField label="Адрес">
            <input value={vForm.address} onChange={e => setVForm(f => ({ ...f, address: e.target.value }))} className="minput" placeholder="г. Москва, ул. …" />
          </MField>
          <MField label="Описание">
            <textarea rows={2} value={vForm.description} onChange={e => setVForm(f => ({ ...f, description: e.target.value }))} className="minput resize-none" placeholder="Особенности, заметки" />
          </MField>
        </SheetModal>
      )}

      {/* ── ROOM MODAL ── */}
      {rModal && (
        <SheetModal
          title={rEdit ? "Редактировать зал" : "Новый зал"}
          onClose={() => setRModal(false)}
          onSave={saveRoom}
        >
          <MField label="Площадка *">
            <select value={rForm.venue_id} onChange={e => setRForm(f => ({ ...f, venue_id: e.target.value }))} className="minput">
              <option value="">— Выберите площадку —</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </MField>
          <MField label="Название зала *">
            <input value={rForm.name} onChange={e => setRForm(f => ({ ...f, name: e.target.value }))} className="minput" placeholder="Большой зал" />
          </MField>
          <MField label="Вместимость (чел.)">
            <input type="number" min="0" value={rForm.capacity} onChange={e => setRForm(f => ({ ...f, capacity: e.target.value }))} className="minput" />
          </MField>
          <MField label="Особенности">
            <input value={rForm.features} onChange={e => setRForm(f => ({ ...f, features: e.target.value }))} placeholder="Проектор, Wi-Fi, сцена…" className="minput" />
          </MField>
        </SheetModal>
      )}

      <style>{`.minput{width:100%;padding:10px 14px;border-radius:12px;border:1px solid rgba(0,0,0,.1);font-size:14px;outline:none;transition:border-color .15s,box-shadow .15s;background:#fff;font-family:-apple-system,'SF Pro Display','Helvetica Neue',sans-serif}.minput:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.08)}`}</style>
    </div>
  );
}

function SheetModal({ title, onClose, onSave, children }: { title: string; onClose: () => void; onSave: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-3xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
        style={{ fontFamily: "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif" }}
      >
        <h3 className="text-[17px] font-bold text-black tracking-[-0.3px] mb-5">{title}</h3>
        <div className="space-y-3">{children}</div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-black/5 text-black/55 text-[14px] font-semibold">Отмена</button>
          <button onClick={onSave} className="flex-1 py-3 rounded-2xl bg-[#7c3aed] text-white text-[14px] font-semibold hover:bg-[#6d28d9] transition-colors">Сохранить</button>
        </div>
      </div>
    </div>
  );
}

function MField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[12px] text-black/45 font-medium mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
