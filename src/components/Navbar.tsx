import Icon from "@/components/ui/icon";
import { NAV_LINKS } from "@/components/shared";

interface NavbarProps {
  activeNav: string;
  menuOpen: boolean;
  scrollTo: (href: string) => void;
  setMenuOpen: (open: boolean) => void;
}

export default function Navbar({ activeNav, menuOpen, scrollTo, setMenuOpen }: NavbarProps) {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b border-white/5 backdrop-blur-xl bg-[#080810]/80">
        <button onClick={() => scrollTo("#hero")} className="flex items-center">
          <img
            src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/279bdee6-7783-4862-83f9-25bd24811276.png"
            alt="Даббл"
            className="h-8 w-auto object-contain"
          />
        </button>
        <ul className="hidden md:flex gap-1">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <button
                onClick={() => scrollTo(l.href)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                  activeNav === l.href.replace("#", "")
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={() => scrollTo("#contacts")}
          className="hidden md:block px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 transition-opacity"
        >
          Связаться
        </button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white/70 hover:text-white"
        >
          <Icon name={menuOpen ? "X" : "Menu"} size={22} />
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#080810]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="font-display text-2xl text-white/80 hover:text-white transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}