import { useState } from "react";
import Navbar from "@/components/Navbar";
import SberHome from "@/components/SberHome";
import BlogContactsFooter from "@/components/BlogContactsFooter";
import { FormType } from "@/components/shared";

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [audience, setAudience] = useState("Для всех");
  const [activeForm, setActiveForm] = useState<FormType>("request");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f5] text-black font-body overflow-x-hidden">
      <Navbar
        activeNav=""
        menuOpen={menuOpen}
        scrollTo={scrollTo}
        setMenuOpen={setMenuOpen}
        audience={audience}
        setAudience={setAudience}
      />
      <SberHome />
      <BlogContactsFooter
        activeForm={activeForm}
        setActiveForm={setActiveForm}
        formData={formData}
        setFormData={setFormData}
        submitted={false}
        handleSubmit={() => {}}
        scrollTo={scrollTo}
      />
    </div>
  );
}
