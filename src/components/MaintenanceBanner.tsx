import Icon from "@/components/ui/icon";

export default function MaintenanceBanner() {
  return (
    <div className="sticky top-0 z-[100] bg-[#1a0a6e] text-white">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2.5 text-center sm:text-left justify-center">
        <Icon name="Construction" size={16} className="shrink-0 text-[#C1F089]" />
        <p className="text-[12px] sm:text-[13px] font-medium leading-snug">
          В связи с созданием единой информационной платформы Даббл ID сейчас все сервисы и функции сайта временно отключены. Скоро вернёмся с обновлениями!
        </p>
      </div>
    </div>
  );
}
