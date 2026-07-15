import { Facebook, Linkedin, Mail, MapPin, Phone, Twitter, Instagram, Youtube } from 'lucide-react';
import Logo from '../ui/Logo.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { fetchSettings } from '../../services/api.js';
import { useEffect, useState } from 'react';

export default function Footer() {
  const { openExpert, openLegal } = useModal();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => { });
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1">
          <div className="mb-4">
            <Logo variant="light" className="w-48 h-75" />
          </div>
          <p className="text-sm leading-relaxed mb-4">
            Édité par la Société Alerte Foncier. Expert en digitalisation immobilière en Côte
            d'Ivoire et Afrique de l'Ouest.
          </p>
          <div className="flex space-x-4">
            {settings?.linkedin_url && settings.linkedin_url !== '#' && (
              <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {settings?.facebook_url && settings.facebook_url !== '#' && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {settings?.twitter_url && settings.twitter_url !== '#' && (
              <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {settings?.instagram_url && settings.instagram_url !== '#' && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {settings?.youtube_url && settings.youtube_url !== '#' && (
              <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Solutions</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#solutions" className="hover:text-ziv-cyan transition-colors">Promotion Immobilière (VEFA)</a></li>
            <li><a href="#solutions" className="hover:text-ziv-cyan transition-colors">Gestion Locative & Syndic</a></li>
            <li><a href="#solutions" className="hover:text-ziv-cyan transition-colors">Aménagement & Lotissement</a></li>
            <li><a href="#solutions" className="hover:text-ziv-cyan transition-colors">Conformité LBC / KYC</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">
            Ressources & Juridique
          </h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#ressources" className="hover:text-ziv-cyan transition-colors">Blog Immobilier UEMOA</a></li>
            <li>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); openExpert(); }}
                className="hover:text-ziv-cyan transition-colors"
              >
                Consulting B2B
              </a>
            </li>
            <li className="pt-2 border-t border-gray-800">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); openLegal('privacy'); }}
                className="hover:text-ziv-cyan transition-colors text-gray-300"
              >
                Politique de Confidentialité
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); openLegal('terms'); }}
                className="hover:text-ziv-cyan transition-colors text-gray-300"
              >
                Conditions Générales (CGV/CGU)
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">
            Contact Régional
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start">
              <MapPin className="h-4 w-4 mr-3 text-ziv-cyan flex-shrink-0 mt-1" />
              {settings?.contact_address || 'Abidjan, Cité SYNATRESOR en face de la Pharmacie Jules Verne'}
            </li>
            <li className="flex items-center">
              <Phone className="h-4 w-4 mr-3 text-ziv-cyan flex-shrink-0" />
              {settings?.contact_phones || '(+225) 27 22 43 51 88 / 07 08 53 11 11'}
            </li>
            <li className="flex items-center">
              <Mail className="h-4 w-4 mr-3 text-ziv-cyan flex-shrink-0" />
              {settings?.contact_email || 'info@alertefoncier.ci'}
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm flex flex-col md:flex-row items-center justify-between text-gray-500">
        <p>&copy; 2026 ZIV PROPTECH - Société Alerte Foncier. Tous droits réservés.</p>
        <p className="mt-2 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">
            Laissez-nous un avis sur Google My Business
          </a>
        </p>
      </div>
    </footer>
  );
}
