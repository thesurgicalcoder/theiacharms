import { Link } from 'react-router-dom';
import Icon from '../common/Icons';
import { SectionTitle } from './CategoryGrid';
import { siteImage } from '../../utils/images';

const ITEMS = [['diamond', 'Trendy Designs'], ['award', 'Premium Quality'], ['leaf', 'Skin-Friendly & Durable'], ['rupee', 'Affordable Prices'], ['gift', 'Perfect for Gifting']];

export default function WhyChoose() {
  const left = siteImage('floral-left'); const right = siteImage('floral-right'); const story = siteImage('our-story');
  return (
    <section id="why" className="section relative mt-16">
      {left && <img src={left} alt="" className="pointer-events-none absolute -left-2 top-0 hidden h-44 object-contain lg:block xl:h-56" />}
      {right && <img src={right} alt="" className="pointer-events-none absolute -right-2 top-0 hidden h-44 object-contain lg:block xl:h-56" />}
      <SectionTitle>Why Choose THEIA CHARMS?</SectionTitle>
      <div className="relative mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-brand-gold/30">
        {ITEMS.map(([icon, t]) => (
          <div key={t} className="flex flex-col items-center gap-2 px-3 text-center text-brand-burgundy"><Icon name={icon} className="h-9 w-9" /><p className="text-sm text-brand-dark/85">{t}</p></div>
        ))}
      </div>

      <div className="relative mt-10 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-blush to-brand-softpink ring-1 ring-brand-gold/40">
        {story && <img src={story} alt="" loading="lazy" className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover object-right md:block" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, #000 40%)', maskImage: 'linear-gradient(to right, transparent, #000 40%)' }} />}
        <div className="relative grid items-center gap-4 px-6 py-8 sm:px-10 md:grid-cols-[auto_1fr] md:gap-8 md:py-10">
          <h2 className="font-script text-5xl text-brand-burgundy">Our Story</h2>
          <div className="max-w-md">
            <p className="text-sm leading-relaxed text-brand-dark/80">THEIA CHARMS is a homegrown brand that brings together trendy, elegant and affordable accessories for every occasion.</p>
            <Link to="/about" className="btn-primary mt-4 !px-5 !py-2">Know More →</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
