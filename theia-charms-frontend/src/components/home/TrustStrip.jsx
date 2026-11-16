const ITEMS = [['✨', 'Trendy Designs'], ['💎', 'Premium Quality'], ['💰', 'Budget Friendly'], ['🎁', 'Perfect for Gifting'], ['🌸', 'Handpicked Collections']];
export default function TrustStrip() {
  return (
    <section className="border-y border-brand-gold/30 bg-white">
      <div className="section grid grid-cols-2 gap-4 py-6 sm:grid-cols-3 lg:grid-cols-5">
        {ITEMS.map(([icon, text]) => <div key={text} className="flex items-center justify-center gap-2 text-center text-sm text-brand-burgundy"><span className="text-xl">{icon}</span>{text}</div>)}
      </div>
    </section>
  );
}
