import { useEffect, useState } from 'react';
import { BookOpen, Calendar, Menu } from 'lucide-react';
import Logo from '../ui/Logo.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { fetchSettings } from '../../services/api.js';

const NAV_LINKS = [
  { href: '/#solutions', label: 'Notre Écosystème' },
  { href: '/#about', label: 'Expertise' },
  { href: '/#tarifs', label: 'Tarifs' },
  { href: '/#temoignages', label: 'Témoignages' },
];

export default function Navbar() {
  const { openExpert } = useModal();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [calendlyUrl, setCalendlyUrl] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    
    fetchSettings()
      .then(settings => {
        // removed calendly url setup here
      })
      .catch(() => {});
      
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleRdv = (e) => {
    e.preventDefault();
    setMobileOpen(false);
    openExpert();
  };

  return (
    <nav
      className={`fixed w-full z-40 border-b border-gray-200 transition-all duration-300 ${
        scrolled ? 'shadow-md bg-white/95' : 'glass-nav'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <button
            type="button"
            className="flex-shrink-0 flex items-center cursor-pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            <Logo />
          </button>

          <div className="hidden lg:flex space-x-6 items-center">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-ziv-blue font-medium transition text-sm"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/#ressources"
              className="text-gray-600 hover:text-ziv-blue font-medium transition text-sm flex items-center"
            >
              <BookOpen className="h-4 w-4 mr-1" /> Ressources
            </a>
            <a
              href="#"
              onClick={handleRdv}
              className="bg-ziv-navy hover:bg-ziv-blue text-white px-5 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-sm flex items-center"
            >
              <Calendar className="h-4 w-4 mr-2" /> Prendre RDV
            </a>
          </div>

          <div className="lg:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="text-gray-600 hover:text-ziv-navy focus:outline-none"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t absolute w-full shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-gray-700 font-medium hover:bg-gray-50"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/#ressources"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-gray-700 font-medium hover:bg-gray-50"
            >
              Ressources & Blog
            </a>
            <a
              href="#"
              onClick={handleRdv}
              className="block px-3 py-2 mt-4 text-center bg-ziv-cyan text-white rounded-md font-medium"
            >
              Prendre RDV
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
