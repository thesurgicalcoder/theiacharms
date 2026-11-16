import Hero from '../components/home/Hero';
import TrustStrip from '../components/home/TrustStrip';
import CategoryGrid from '../components/home/CategoryGrid';
import FestiveBanner from '../components/home/FestiveBanner';
import NewArrivals from '../components/home/NewArrivals';
import CollectionsBand from '../components/home/CollectionsBand';
import WhyChoose from '../components/home/WhyChoose';

export default function HomePage() {
  return (<><Hero /><TrustStrip /><CategoryGrid /><FestiveBanner /><NewArrivals /><CollectionsBand /><WhyChoose /></>);
}
