import { useState, useEffect } from 'react';
import { Briefcase, HardHat, HelpCircle, Play, Star, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import ModuleCard from './ModuleCard.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { fetchSoftwares } from '../../services/api.js';
import { softwareStylesMap } from '../../utils/softwareStyles.js';

// Carte "heros" de l'ERP integral, en tete de la section.
function ErpHeroCard({ onClick, erpData }) {
  if (!erpData) return null; // ou un skeleton loader

  return (
    <div className="mb-16">
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left bg-gradient-to-r from-ziv-navy via-blue-900 to-ziv-blue rounded-3xl p-8 md:p-12 shadow-2xl text-white cursor-pointer group transform hover:-translate-y-2 transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row items-center justify-between border border-blue-800"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay group-hover:opacity-20 transition-opacity duration-700" />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-ziv-cyan/20 to-transparent" />

        <div className="relative z-10 md:w-2/3 md:pr-8 mb-8 md:mb-0">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-ziv-cyan/20 border border-ziv-cyan/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Star className="h-3 w-3 mr-2 fill-current" /> La Solution Intégrale (ERP)
          </div>
          <h4 className="text-3xl md:text-5xl font-heading font-bold mb-4 text-white group-hover:text-cyan-100 transition-colors">
            {erpData.name}
          </h4>
          <p className="text-blue-100 text-lg mb-6 leading-relaxed">
            {erpData.description}
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-cyan-50">
            <span className="flex items-center bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <Briefcase className="h-4 w-4 mr-2" /> Pilotage Projet
            </span>
            <span className="flex items-center bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <TrendingUp className="h-4 w-4 mr-2" /> Vente & CRM
            </span>
            <span className="flex items-center bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <HardHat className="h-4 w-4 mr-2" /> Chantier et Stock
            </span>
          </div>
        </div>

        <div className="relative z-10 md:w-1/3 flex justify-end w-full">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-center w-full max-w-sm group-hover:bg-white/20 transition-colors">
            <div className="w-16 h-16 bg-ziv-cyan rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,168,181,0.5)] play-button-pulse">
              <Play className="h-6 w-6 text-white ml-1" />
            </div>
            <span className="text-white font-bold text-lg block mb-1">Explorer l'ERP</span>
            <span className="text-cyan-200 text-sm">Voir la démonstration vidéo</span>
          </div>
        </div>
      </button>
    </div>
  );
}

export default function Solutions() {
  const { openSoftware, openExpert } = useModal();
  const [softwares, setSoftwares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSoftwares()
      .then((data) => {
        setSoftwares(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les logiciels.");
        setLoading(false);
      });
  }, []);

  const erpData = softwares.find(s => s.id === 'lotiges_erp');

  // Prepare other modules
  const modules = softwares
    .filter(s => s.id !== 'lotiges_erp')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(s => {
      const styles = softwareStylesMap[s.id] || softwareStylesMap['default'];
      return {
        modalId: s.id,
        tag: s.is_popular ? '' : styles.tag,
        icon: s.icon_name || 'Box',
        title: s.name,
        description: s.description,
        features: (s.features || []).slice(0, 2), // Take first 2 for the card
        accent: styles.accent,
        videoComingSoon: !s.youtube_id
      };
    });

  return (
    <section id="solutions" className="py-24 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-ziv-cyan font-semibold tracking-wide uppercase text-sm mb-2">
            L'Écosystème ZIV PROPTECH
          </h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold text-ziv-navy">
            Une Suite, Tous Vos Besoins
          </h3>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Découvrez notre ERP global pour piloter toute votre entreprise, ou choisissez nos
            modules logiciels spécialisés selon votre cœur de métier.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center my-20">
            <Loader2 className="animate-spin text-ziv-cyan h-12 w-12" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 my-20">{error}</div>
        )}

        {!loading && !error && (
          <>
            {erpData && <ErpHeroCard onClick={() => openSoftware('lotiges_erp')} erpData={erpData} />}

            <div className="flex items-center justify-between mb-8">
              <h4 className="text-2xl font-heading font-bold text-ziv-navy">
                Modules Logiciels Spécialisés
              </h4>
              <div className="h-px bg-gray-200 flex-grow ml-6" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {modules.map((module) => (
                <ModuleCard key={module.modalId} module={module} />
              ))}

              <div className="md:col-span-2 lg:col-span-3 mt-4">
                <div className="bg-gradient-to-r from-gray-100 to-white rounded-2xl p-8 border border-gray-200 flex flex-col md:flex-row items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-6 md:mb-0 md:mr-6 text-center md:text-left">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-0 md:mr-6 mb-4 md:mb-0 mx-auto shadow-sm text-ziv-cyan flex-shrink-0">
                      <HelpCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-1">
                        Besoin de conseils pour votre structure ?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Nos experts vous aident à définir l'architecture logicielle (SaaS ou
                        On-Premise) idéale.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openExpert}
                    className="w-full md:w-auto bg-ziv-navy text-white hover:bg-ziv-blue font-semibold py-3 px-8 rounded-xl transition-colors shadow-lg flex-shrink-0 flex items-center justify-center whitespace-nowrap"
                  >
                    <Calendar className="h-4 w-4 mr-2" /> Prendre RDV B2B
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
