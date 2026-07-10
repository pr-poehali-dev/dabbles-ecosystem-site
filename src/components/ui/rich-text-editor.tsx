import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
  placeholder?: string;
  minHeight?: number;
}

type ToolAction =
  | { cmd: "bold" | "italic" | "underline" | "strikeThrough" | "insertUnorderedList" | "insertOrderedList" | "removeFormat" | "undo" | "redo" }
  | { cmd: "formatBlock"; value: string }
  | { cmd: "justifyLeft" | "justifyCenter" | "justifyRight" };

const TOOLS: { icon: string; title: string; action: ToolAction }[] = [
  { icon: "Bold", title: "Жирный", action: { cmd: "bold" } },
  { icon: "Italic", title: "Курсив", action: { cmd: "italic" } },
  { icon: "Underline", title: "Подчёркнутый", action: { cmd: "underline" } },
  { icon: "Strikethrough", title: "Зачёркнутый", action: { cmd: "strikeThrough" } },
];

const HEADINGS: { label: string; title: string; value: string }[] = [
  { label: "П", title: "Обычный текст", value: "P" },
  { label: "H2", title: "Заголовок", value: "H2" },
  { label: "H3", title: "Подзаголовок", value: "H3" },
];

const LISTS: { icon: string; title: string; action: ToolAction }[] = [
  { icon: "List", title: "Маркированный список", action: { cmd: "insertUnorderedList" } },
  { icon: "ListOrdered", title: "Нумерованный список", action: { cmd: "insertOrderedList" } },
];

const ALIGNS: { icon: string; title: string; action: ToolAction }[] = [
  { icon: "AlignLeft", title: "По левому краю", action: { cmd: "justifyLeft" } },
  { icon: "AlignCenter", title: "По центру", action: { cmd: "justifyCenter" } },
  { icon: "AlignRight", title: "По правому краю", action: { cmd: "justifyRight" } },
];

export default function RichTextEditor({ value, onChange, onUploadImage, placeholder, minHeight = 220 }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (ref.current && isFirstRender.current) {
      ref.current.innerHTML = value || "";
      isFirstRender.current = false;
    }
  }, [value]);

  const exec = (action: ToolAction) => {
    ref.current?.focus();
    if ("value" in action) {
      document.execCommand(action.cmd, false, action.value);
    } else {
      document.execCommand(action.cmd, false);
    }
    handleInput();
  };

  const handleInput = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const insertLink = () => {
    const url = window.prompt("Ссылка (https://...)");
    if (!url) return;
    ref.current?.focus();
    document.execCommand("createLink", false, url);
    handleInput();
  };

  const insertImageByUrl = () => {
    const url = window.prompt("Ссылка на изображение (https://...)");
    if (!url) return;
    ref.current?.focus();
    document.execCommand("insertImage", false, url);
    handleInput();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      ref.current?.focus();
      document.execCommand("insertImage", false, url);
      handleInput();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-black/8 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 bg-[#f5f5f7] border-b border-black/8">
        {HEADINGS.map((h) => (
          <button
            key={h.value}
            type="button"
            title={h.title}
            onClick={() => exec({ cmd: "formatBlock", value: h.value })}
            className="px-2 py-1 rounded-lg text-[11px] font-bold text-black/60 hover:bg-black/10 transition-colors"
          >
            {h.label}
          </button>
        ))}
        <div className="w-px h-5 bg-black/10 mx-0.5" />
        {TOOLS.map((t) => (
          <button
            key={t.icon}
            type="button"
            title={t.title}
            onClick={() => exec(t.action)}
            className="p-1.5 rounded-lg text-black/60 hover:bg-black/10 transition-colors"
          >
            <Icon name={t.icon} size={14} />
          </button>
        ))}
        <div className="w-px h-5 bg-black/10 mx-0.5" />
        {LISTS.map((t) => (
          <button
            key={t.icon}
            type="button"
            title={t.title}
            onClick={() => exec(t.action)}
            className="p-1.5 rounded-lg text-black/60 hover:bg-black/10 transition-colors"
          >
            <Icon name={t.icon} size={14} />
          </button>
        ))}
        <div className="w-px h-5 bg-black/10 mx-0.5" />
        {ALIGNS.map((t) => (
          <button
            key={t.icon}
            type="button"
            title={t.title}
            onClick={() => exec(t.action)}
            className="p-1.5 rounded-lg text-black/60 hover:bg-black/10 transition-colors"
          >
            <Icon name={t.icon} size={14} />
          </button>
        ))}
        <div className="w-px h-5 bg-black/10 mx-0.5" />
        <button type="button" title="Вставить ссылку" onClick={insertLink}
          className="p-1.5 rounded-lg text-black/60 hover:bg-black/10 transition-colors">
          <Icon name="Link" size={14} />
        </button>
        {onUploadImage ? (
          <button type="button" title="Загрузить изображение" disabled={uploading} onClick={() => fileRef.current?.click()}
            className="p-1.5 rounded-lg text-black/60 hover:bg-black/10 transition-colors">
            <Icon name={uploading ? "Loader" : "Image"} size={14} className={uploading ? "animate-spin" : ""} />
          </button>
        ) : (
          <button type="button" title="Вставить изображение по ссылке" onClick={insertImageByUrl}
            className="p-1.5 rounded-lg text-black/60 hover:bg-black/10 transition-colors">
            <Icon name="Image" size={14} />
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        <div className="w-px h-5 bg-black/10 mx-0.5" />
        <button type="button" title="Очистить форматирование" onClick={() => exec({ cmd: "removeFormat" })}
          className="p-1.5 rounded-lg text-black/60 hover:bg-black/10 transition-colors">
          <Icon name="Eraser" size={14} />
        </button>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className="camp-rte px-4 py-3 text-[13px] text-black/80 leading-relaxed focus:outline-none overflow-y-auto"
        style={{ minHeight }}
      />
    </div>
  );
}
