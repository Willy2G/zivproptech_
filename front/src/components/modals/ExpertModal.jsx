import { useEffect } from 'react';
import { Calendar, CheckCircle, Loader2 } from 'lucide-react';
import Modal from './Modal.jsx';
import { useModal } from '../../context/ModalContext.jsx';

// URL Calendly : remplacez "alertefoncier" par votre vrai identifiant de compte.
const CALENDLY_URL =
  'https://calendly.com/alertefoncier?hide_gdpr_banner=1&background_color=ffffff&text_color=0a1e4a&primary_color=00a8b5';

export default function ExpertModal() {
  const { expertModal, closeExpert } = useModal();

  // Charge le script Calendly une seule fois, a la premiere ouverture.
  useEffect(() => {
    if (!expertModal) return;
    const src = 'https://assets.calendly.com/assets/external/widget.js';
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
  }, [expertModal]);

  return (
    <Modal
      open={expertModal}
      onClose={closeExpert}
      maxWidth="sm:max-w-4xl"
      backdrop="bg-ziv-navy/90"
      closeButtonClass="bg-gray-200/50 text-gray-800 hover:bg-gray-300"
      contentClass="flex flex-col md:flex-row"
    >
      <div className="bg-ziv-navy p-8 md:p-12 md:w-2/5 text-white flex-col justify-center relative overflow-hidden hidden md:flex">
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-ziv-cyan rounded-full opacity-20 blur-3xl" />
        <div className="relative z-10">
          <Calendar className="h-12 w-12 text-ziv-cyan mb-6" />
          <h3 className="text-2xl md:text-3xl font-bold font-heading mb-4 leading-tight">
            Planifiez votre audit gratuit
          </h3>
          <p className="text-blue-100 text-sm mb-8 leading-relaxed">
            Choisissez directement un créneau dans notre agenda. Un consultant expert ZIV Proptech
            vous rappellera à l'heure convenue pour auditer vos besoins.
          </p>
          <ul className="space-y-4 text-sm text-blue-50">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-ziv-cyan mr-3 flex-shrink-0" /> Démonstration
              logicielle en direct
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-ziv-cyan mr-3 flex-shrink-0" /> Analyse de votre
              flux de travail
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full md:w-3/5 bg-white relative min-h-[550px] md:min-h-[600px] rounded-b-3xl md:rounded-bl-none md:rounded-r-3xl overflow-hidden">
        {/* Etat de chargement (sous le widget) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-0">
          <Loader2 className="h-10 w-10 text-ziv-cyan mb-4 animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Chargement de l'agenda...</p>
          <p className="text-[10px] text-gray-400 mt-2">Intégration Calendly sécurisée</p>
        </div>

        {/* Widget Calendly (rendu par widget.js via data-url) */}
        <div
          className="calendly-inline-widget absolute inset-0 z-10 w-full h-full"
          data-url={CALENDLY_URL}
          style={{ minWidth: '320px', height: '100%' }}
        />
      </div>
    </Modal>
  );
}
