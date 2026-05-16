import { useState, useEffect } from "react";
import { NAV_LINKS, FormType } from "@/components/shared";
import Navbar from "@/components/Navbar";
import HeroSections from "@/components/HeroSections";
import BlogContactsFooter from "@/components/BlogContactsFooter";

export default function Index() {
  const [activeNav, setActiveNav] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<FormType>("request");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const sections = NAV_LINKS.map((l) => l.href.replace("#", ""));
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveNav(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
    setFormData({ name: "", email: "", phone: "", company: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white text-black font-body overflow-x-hidden">
      <Navbar
        activeNav={activeNav}
        menuOpen={menuOpen}
        scrollTo={scrollTo}
        setMenuOpen={setMenuOpen}
      />
      <HeroSections
        scrollTo={scrollTo}
        setActiveForm={setActiveForm}
        hoveredProduct={hoveredProduct}
        setHoveredProduct={setHoveredProduct}
      />
      <BlogContactsFooter
        activeForm={activeForm}
        setActiveForm={setActiveForm}
        formData={formData}
        setFormData={setFormData}
        submitted={submitted}
        handleSubmit={handleSubmit}
        scrollTo={scrollTo}
      />
    </div>
  );
}