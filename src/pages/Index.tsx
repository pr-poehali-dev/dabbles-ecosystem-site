import { useState } from "react";
import Navbar from "@/components/Navbar";
import SberHome from "@/components/SberHome";
import DabblDiscover from "@/components/DabblDiscover";

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [audience, setAudience] = useState("Для всех");

  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#edf5e0] text-black font-body overflow-x-hidden">
      <Navbar
        activeNav=""
        menuOpen={menuOpen}
        scrollTo={scrollTo}
        setMenuOpen={setMenuOpen}
        audience={audience}
        setAudience={setAudience}
      />
      <SberHome />
      <DabblDiscover />
    </div>
  );
}