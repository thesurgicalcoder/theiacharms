import Icon from '../common/Icons';
const ITEMS = [['diamond', 'Trendy', 'Designs'], ['award', 'Premium', 'Quality'], ['rupee', 'Budget', 'Friendly'], ['gift', 'Perfect', 'for Gifting'], ['heart', 'Handpicked', 'Collections']];
export default function TrustStrip() {
  return (
    <section className="border-y border-brand-gold/25 bg-brand-softpink/60">
      <div className="section grid grid-cols-2 gap-y-4 py-5 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-brand-gold/30">
        {ITEMS.map(([icon, a, b]) => (
          <div key={a} className="flex items-center justify-center gap-3 px-2 text-brand-burgundy">
            <Icon name={icon} className="h-8 w-8 shrink-0" />
            <p className="text-left text-sm leading-tight">{a}<br />{b}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
