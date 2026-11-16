import { Link } from 'react-router-dom';
export default function StorySection() {
  return (
    <section className="section mt-16">
      <div className="grid items-center gap-6 rounded-3xl bg-brand-blush p-8 ring-1 ring-brand-gold/40 sm:p-12 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-3xl text-brand-burgundy">Our Story</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-dark/80">THEIA CHARMS began in Bayana with a simple idea: beautiful, trendy accessories should be within everyone's reach. Every piece is handpicked to add a little sparkle to your everyday — and a big smile to your face.</p>
          <Link to="/about" className="btn-outline mt-5">Know More →</Link>
        </div>
        <div className="hidden text-7xl md:block">📿</div>
      </div>
    </section>
  );
}
