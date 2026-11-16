const P = {
  diamond: <><path d="M6 3h12l4 6-10 12L2 9z" /><path d="M2 9h20M9 3 7 9l5 12M15 3l2 6-5 12" /></>,
  award: <><circle cx="12" cy="9" r="6" /><path d="M8.5 14 7 22l5-3 5 3-1.5-8" /></>,
  rupee: <path d="M6 3h12M6 8h12M9 3c5 0 6 2.5 6 5s-1 5-6 5H6l9 8" />,
  gift: <><rect x="3" y="8" width="18" height="4" /><path d="M12 8v13M5 12v9h14v-9M12 8C10 4 6 4 6 7s4 1 6 1Zm0 0c2-4 6-4 6-1s-4 1-6 1Z" /></>,
  heart: <path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z" />,
  leaf: <path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19c3-5 6-8 10-10" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></>,
  pin: <><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="10" r="2.5" /></>,
};
export default function Icon({ name, className = 'h-6 w-6' }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{P[name]}</svg>;
}
