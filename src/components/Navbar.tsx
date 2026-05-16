import { useState } from "react";
import Icon from "@/components/ui/icon";
import { NAV_LINKS } from "@/components/shared";

interface NavbarProps {
  activeNav: string;
  menuOpen: boolean;
  scrollTo: (href: string) => void;
  setMenuOpen: (open: boolean) => void;
}

export default function Navbar({ activeNav, menuOpen, scrollTo, setMenuOpen }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-[72px] bg-white border-b border-black/6">
        <button onClick={() => scrollTo("#hero")} className="flex items-center shrink-0">
          <img
            src="https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/279bdee6-7783-4862-83f9-25bd24811276.png"
            alt="Даббл"
            className="h-8 w-auto object-contain"
            style={{ filter: "invert(1)" }}
          />
        </button>

        <ul className="hidden md:flex gap-0 mx-6">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <button
                onClick={() => scrollTo(l.href)}
                className={`px-4 py-2 text-[15px] font-medium rounded-xl transition-all duration-150 ${
                  activeNav === l.href.replace("#", "")
                    ? "text-black"
                    : "text-black/50 hover:text-black"
                }`}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <div className="flex items-center gap-2 border border-black/15 rounded-xl px-3 py-2 bg-black/3">
              <Icon name="Search" size={16} className="text-black/40" />
              <input
                autoFocus
                placeholder="Поиск..."
                className="text-sm outline-none bg-transparent w-40 text-black placeholder-black/30"
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl hover:bg-black/5 transition-colors text-black/50 hover:text-black"
            >
              <Icon name="Search" size={20} />
            </button>
          )}
          <button
            onClick={() => scrollTo("#contacts")}
            className="hidden md:block px-5 py-2 text-sm font-semibold rounded-xl bg-[#FD4160] text-white hover:bg-[#e0324f] transition-colors"
          >
            Связаться
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-black/5 text-black/60"
          >
            <Icon name={menuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-5">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="font-display text-2xl text-black/70 hover:text-black transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
