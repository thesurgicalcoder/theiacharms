import { useCatalog } from '../../context/CatalogContext';
export default function AnnouncementBar() {
  const { settings } = useCatalog();
  return <div className="bg-brand-burgundy px-4 py-2 text-center text-[11px] tracking-wide text-brand-goldlight sm:text-xs">{settings?.announcement}</div>;
}
