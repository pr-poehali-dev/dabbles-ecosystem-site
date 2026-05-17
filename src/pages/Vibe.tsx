import { useState, FormEvent } from "react";
import VibeHero from "@/components/vibe/VibeHero";
import VibeConceptMenu from "@/components/vibe/VibeConceptMenu";
import VibePartnersContacts from "@/components/vibe/VibePartnersContacts";
import { scrollToSection } from "@/components/vibe/constants";

export default function Vibe() {
  const [openCat, setOpenCat] = useState(0);
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", contact: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#FBF6EE] text-[#1a1410] font-body">
      <VibeHero scrollTo={scrollToSection} />
      <VibeConceptMenu openCat={openCat} setOpenCat={setOpenCat} />
      <VibePartnersContacts
        scrollTo={scrollToSection}
        form={form}
        setForm={setForm}
        sent={sent}
        submit={submit}
      />
    </div>
  );
}
