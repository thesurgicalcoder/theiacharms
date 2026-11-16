import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CatalogProvider } from './context/CatalogContext';
import { WishlistProvider } from './context/WishlistContext';
import { UIProvider } from './context/UIContext';
import AnnouncementBar from './components/layout/AnnouncementBar';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingButtons from './components/layout/FloatingButtons';
import ProductModal from './components/product/ProductModal';
import WishlistDrawer from './components/product/WishlistDrawer';
import Toast from './components/common/Toast';
import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

function ScrollTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0); }, [pathname]); return null; }
const NotFound = () => <div className="section py-24 text-center"><h1 className="text-4xl text-brand-burgundy">Page not found</h1><Link to="/" className="btn-primary mt-6">Back to Home</Link></div>;

export default function App() {
  return (
    <CatalogProvider><WishlistProvider><UIProvider>
      <BrowserRouter>
        <ScrollTop /><AnnouncementBar /><Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} /><Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/about" element={<AboutPage />} /><Route path="/contact" element={<ContactPage />} /><Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer /><FloatingButtons /><ProductModal /><WishlistDrawer /><Toast />
      </BrowserRouter>
    </UIProvider></WishlistProvider></CatalogProvider>
  );
}
