import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { campApi, clearCampToken, CampStudent } from "@/lib/camp-api";

const LOGO = "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/a4c91874-6ec5-442c-be38-6a949286b9b1.png";

const NAV = [
  { to: "/camp/app", icon: "LayoutGrid", label: "Мои программы", exact: true },
  { to: "/camp/app/certificates", icon: "Award", label: "Сертификаты" },
];

export default function CampLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [student, setStudent] = useState<CampStudent | null>(null);

  useEffect(() => {
    campApi.me().then((r) => setStudent(r.student)).catch(() => {});
  }, []);

  const logout = async () => {
    await campApi.logout().catch(() => {});
    clearCampToken();
    navigate("/camp");
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-body">
      <header className="sticky top-0 z-30 bg-white border-b border-black/6">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
          <Link to="/camp/app" className="flex items-center gap-2.5 shrink-0">
            <img src={LOGO} alt="Кэмп" className="h-8 w-8 rounded-lg" />
            <span className="font-display font-black text-lg hidden sm:block">Кэмп</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV.map((i) => (
              <Link
                key={i.to} to={i.to}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-colors ${
                  isActive(i.to, i.exact) ? "bg-black text-white" : "text-black/50 hover:bg-black/5"
                }`}
              >
                <Icon name={i.icon} size={15} /> {i.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-black"
                style={{ background: "linear-gradient(140deg, #EBD047 0%, #DAB332 100%)" }}
              >
                {(student?.full_name || student?.email || "?")[0]?.toUpperCase()}
              </div>
              <span className="text-[13px] font-semibold text-black max-w-[140px] truncate">
                {student?.full_name || student?.email}
              </span>
            </div>
            <button onClick={logout} className="p-2 rounded-lg text-black/30 hover:text-black hover:bg-black/5 transition-colors" title="Выйти">
              <Icon name="LogOut" size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Мобильный таб-бар */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/6 flex z-30">
        {NAV.map((i) => (
          <Link
            key={i.to} to={i.to}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold ${
              isActive(i.to, i.exact) ? "text-black" : "text-black/35"
            }`}
          >
            <Icon name={i.icon} size={18} />
            {i.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
