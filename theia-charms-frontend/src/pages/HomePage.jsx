import Hero from '../components/home/Hero';
import TrustStrip from '../components/home/TrustStrip';
import CategoryGrid from '../components/home/CategoryGrid';
import FestiveBanner from '../components/home/FestiveBanner';
import NewArrivals from '../components/home/NewArrivals';
import CollectionsRow from '../components/home/CollectionsRow';
import StorySection from '../components/home/StorySection';

export default function HomePage() {
  return (<><Hero /><TrustStrip /><CategoryGrid /><FestiveBanner /><NewArrivals /><CollectionsRow /><StorySection /></>);
}
