import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { MVenue, MRoom, mApi } from "@/lib/meroshkins";

export default function VenuesPage() {
  const [venues, setVenues] = useState<MVenue[]>([]);
  const [rooms, setRooms] = useState<MRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const [vModal, setVModal] = useState(false);
  const [vForm, setVForm] = useState({ name: "", address: "", description: "" });
  const [vEdit, setVEdit] = useState<MVenue | null>(null);

  const [rModal, setRModal] = useState(false);
  const [rForm, setRForm] = useState({ name: "", venue_id: "", capacity: "", features: "" });
  const [rEdit, setREdit] = useState<MRoom | null>(null);

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
    setVEdit(v); setVForm({ name: v.name, address: v.address, description: v.description });
    setVModal(true);
  };

  const openREdit = (r: MRoom) => {
    setREdit(r);
    setRForm({ name: r.name, venue_id: String(r.venue_id), capacity: String(r.capacity), features: r.features });
    setRModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-black text-black mb-1">Площадки и залы</h1>
          <p className="text-black/45 text-sm">Управляйте списком площадок и залов для мероприятий</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Icon name="Loader" size={24} className="animate-spin text-black/30" /></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* VENUES */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-black text-lg text-black">Площадки</h2>
              <button onClick={() => { setVEdit(null); setVForm({ name: "", address: "", description: "" }); setVModal(true); }}
                className="px-3 py-1.5 rounded-xl bg-[#7c3aed] text-white text-xs font-semibold flex items-center gap-1 hover:bg-[#6d28d9]">
                <Icon name="Plus" size={13} /> Добавить
              </button>
            </div>
            <div className="space-y-2">
              {venues.length === 0 && <div className="text-black/30 text-sm text-center py-8 bg-[#f5f5f7] rounded-2xl">Нет площадок</div>}
              {venues.map(v => (
                <div key={v.id} className="bg-white border border-black/6 rounded-2xl px-4 py-3.5 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-black text-sm">{v.name}</div>
                    {v.address && <div className="text-black/40 text-xs mt-0.5">{v.address}</div>}
                  </div>
                  <button onClick={() => openVEdit(v)} className="p-1.5 rounded-lg hover:bg-black/5 text-black/30 hover:text-black">
                    <Icon name="Pencil" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ROOMS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-black text-lg text-black">Залы</h2>
              <button onClick={() => { setREdit(null); setRForm({ name: "", venue_id: venues[0] ? String(venues[0].id) : "", capacity: "", features: "" }); setRModal(true); }}
                className="px-3 py-1.5 rounded-xl bg-[#7c3aed] text-white text-xs font-semibold flex items-center gap-1 hover:bg-[#6d28d9]">
                <Icon name="Plus" size={13} /> Добавить
              </button>
            </div>
            <div className="space-y-2">
              {rooms.length === 0 && <div className="text-black/30 text-sm text-center py-8 bg-[#f5f5f7] rounded-2xl">Нет залов</div>}
              {rooms.map(r => (
                <div key={r.id} className="bg-white border border-black/6 rounded-2xl px-4 py-3.5 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-black text-sm">{r.name}</div>
                    <div className="text-black/40 text-xs mt-0.5">
                      {r.venue_name}{r.capacity ? ` · ${r.capacity} чел.` : ""}
                    </div>
                    {r.features && <div className="text-black/30 text-xs mt-0.5">{r.features}</div>}
                  </div>
                  <button onClick={() => openREdit(r)} className="p-1.5 rounded-lg hover:bg-black/5 text-black/30 hover:text-black">
                    <Icon name="Pencil" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VENUE MODAL */}
      {vModal && (
        <Modal title={vEdit ? "Редактировать площадку" : "Новая площадка"} onClose={() => setVModal(false)} onSave={saveVenue}>
          <MField label="Название *"><input value={vForm.name} onChange={e => setVForm(f => ({ ...f, name: e.target.value }))} className="minput" /></MField>
          <MField label="Адрес"><input value={vForm.address} onChange={e => setVForm(f => ({ ...f, address: e.target.value }))} className="minput" /></MField>
          <MField label="Описание"><textarea rows={2} value={vForm.description} onChange={e => setVForm(f => ({ ...f, description: e.target.value }))} className="minput resize-none" /></MField>
        </Modal>
      )}

      {/* ROOM MODAL */}
      {rModal && (
        <Modal title={rEdit ? "Редактировать зал" : "Новый зал"} onClose={() => setRModal(false)} onSave={saveRoom}>
          <MField label="Площадка *">
            <select value={rForm.venue_id} onChange={e => setRForm(f => ({ ...f, venue_id: e.target.value }))} className="minput">
              <option value="">— Выберите —</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </MField>
          <MField label="Название зала *"><input value={rForm.name} onChange={e => setRForm(f => ({ ...f, name: e.target.value }))} className="minput" /></MField>
          <MField label="Вместимость (чел.)"><input type="number" min="0" value={rForm.capacity} onChange={e => setRForm(f => ({ ...f, capacity: e.target.value }))} className="minput" /></MField>
          <MField label="Особенности"><input value={rForm.features} onChange={e => setRForm(f => ({ ...f, features: e.target.value }))} placeholder="Проектор, Wi-Fi..." className="minput" /></MField>
        </Modal>
      )}

      <style>{`.minput{width:100%;padding:9px 13px;border-radius:10px;border:1px solid rgba(0,0,0,.1);font-size:14px;outline:none;transition:border-color .2s}.minput:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.08)}`}</style>
    </div>
  );
}

function Modal({ title, onClose, onSave, children }: { title: string; onClose: () => void; onSave: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-display font-black text-lg text-black mb-5">{title}</h3>
        <div className="space-y-3">{children}</div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-black/5 text-black/60 font-semibold text-sm">Отмена</button>
          <button onClick={onSave} className="flex-1 py-2.5 rounded-xl bg-[#7c3aed] text-white font-semibold text-sm hover:bg-[#6d28d9]">Сохранить</button>
        </div>
      </div>
    </div>
  );
}

function MField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs text-black/50 font-medium mb-1.5 block">{label}</label>{children}</div>;
}
