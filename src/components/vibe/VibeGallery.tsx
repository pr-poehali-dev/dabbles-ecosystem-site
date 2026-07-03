import { FadeIn } from "@/components/shared";
import { GALLERY_IMAGES } from "./constants";

export default function VibeGallery() {
  return (
    <section className="px-5 md:px-8 pb-2 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-2 md:gap-3">
        {GALLERY_IMAGES.map((src, i) => (
          <FadeIn key={src} delay={i * 80}>
            <div className="aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden bg-[#f5f5f5]">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
