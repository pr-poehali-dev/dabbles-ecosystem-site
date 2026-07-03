import { useState } from "react";
import VibeHero from "@/components/vibe/VibeHero";
import VibeGallery from "@/components/vibe/VibeGallery";
import VibeCatalog from "@/components/vibe/VibeCatalog";
import VibeAboutContacts from "@/components/vibe/VibeAboutContacts";
import VibeCart from "@/components/vibe/VibeCart";
import { scrollToSection, CartItem, VibeProduct } from "@/components/vibe/constants";

export default function Vibe() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (product: VibeProduct, size: string) => {
    setCart((prev) => {
      const idx = prev.findIndex((it) => it.product_id === product.id && it.size === size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, size, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (index: number, qty: number) => {
    if (qty < 1) return;
    setCart((prev) => prev.map((it, i) => (i === index ? { ...it, qty } : it)));
  };

  const removeItem = (index: number) => setCart((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="min-h-screen bg-white text-black font-body">
      <VibeHero scrollTo={scrollToSection} cartCount={cart.reduce((s, it) => s + it.qty, 0)} onCartClick={() => setCartOpen(true)} />
      <VibeGallery />
      <VibeCatalog onAddToCart={addToCart} />
      <VibeAboutContacts />

      {cartOpen && (
        <VibeCart
          items={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onClear={() => setCart([])}
        />
      )}
    </div>
  );
}