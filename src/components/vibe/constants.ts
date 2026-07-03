export const LOGO_URL = "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/bucket/e4d62d23-6573-4358-9c1f-692248126380.png";

export const HERO_DECOR_URL = "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/e23bc834-7a00-46f9-8099-6a5895e63c55.jpg";

export const GALLERY_IMAGES = [
  "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/a33555f7-a1b8-4178-b107-3c1e24bc9874.jpg",
  "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/15404bb4-a17a-44b6-842b-17e1c53fbc1d.jpg",
  "https://cdn.poehali.dev/projects/91e153cd-c52b-485f-a2cb-7766288caf61/files/ab2b4d5f-fe72-4f1c-a2ee-7fe0c1337f9d.jpg",
];

export const NAV = [
  { label: "Каталог", href: "#catalog" },
  { label: "О бренде", href: "#about" },
  { label: "Доставка", href: "#delivery" },
  { label: "Контакты", href: "#contacts" },
];

export const scrollToSection = (href: string) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export type VibeProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  old_price: number | null;
  image_url: string;
  category: string;
  sizes: string[];
  sort_order: number;
  is_active?: boolean;
};

export type CartItem = {
  product_id: number;
  name: string;
  price: number;
  size: string;
  qty: number;
};

export function formatPrice(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽";
}