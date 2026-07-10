import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function CampProfile() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black text-black mb-1">Мой профиль</h1>
        <p className="text-black/45 text-sm">Данные профиля (ФИО, телефон, аватар) теперь общие для всех сервисов Даббл и редактируются в едином личном кабинете</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-black/6">
        <Link
          to="/id/profile"
          className="w-full py-3.5 rounded-2xl text-black font-bold text-[15px] transition-all hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(120deg, #EBD047 0%, #DAB332 100%)" }}
        >
          <Icon name="IdCard" size={17} />
          Перейти в Даббл ID
        </Link>
        <p className="text-[12px] text-black/35 mt-3 text-center">ФИО в профиле должно быть указано полностью — именно оно печатается на сертификате</p>
      </div>
    </div>
  );
}
