import { useState, useEffect } from 'react';
import { CheckCircle, Layers, Loader2 } from 'lucide-react';
import Icon from '../ui/Icon.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { fetchSoftwares } from '../../services/api.js';
import { softwareStylesMap } from '../../utils/softwareStyles.js';

function PlanCard({ plan, onSelect }) {
  const isImageLogo = plan.icon && (plan.icon.startsWith('http') || plan.icon.startsWith('/'));

  if (plan.featured) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,168,181,0.15)] border-2 border-ziv-cyan hover:shadow-2xl transition-all duration-300 flex flex-col h-full relative">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-ziv-cyan text-white text-xs font-bold px-4 py-1 rounded-full shadow-md whitespace-nowrap">
          Module Le Plus Populaire
        </div>
        <div className="flex items-center mb-4 mt-2">
          <div className={`w-12 h-12 ${plan.iconBg} rounded-xl flex items-center justify-center ${plan.iconText} mr-3`}>
            {isImageLogo ? (
              <img src={plan.icon} alt="Logo" className="w-8 h-8 object-contain" />
            ) : (
              <Icon name={plan.icon} className="h-6 w-6" />
            )}
          </div>
          <h4 className="text-2xl font-bold text-gray-900">{plan.title}</h4>
        </div>
        <p className="text-gray-500 text-sm mb-6">{plan.subtitle}</p>
        <div className="mb-6 pb-6 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            À partir de
          </span>
          <div className="flex items-baseline mt-1">
            <span className="text-4xl font-extrabold text-ziv-navy">
              {plan.price > 0 ? plan.price.toLocaleString('fr-FR') : 'Sur Devis'} {plan.price > 0 && <span className="text-lg">FCFA</span>}
            </span>
            {plan.price > 0 && <span className="ml-1 text-gray-500 text-sm">/ mois</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelect(plan.formValue)}
          className="mt-auto w-full text-center bg-ziv-cyan hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-300"
        >
          {plan.cta}
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl ${plan.hoverBorder} transition-all duration-300 flex flex-col h-full relative`}>
      <div className="flex items-center mb-4">
        <div className={`w-10 h-10 ${plan.iconBg} rounded-lg flex items-center justify-center ${plan.iconText} mr-3`}>
          {isImageLogo ? (
            <img src={plan.icon} alt="Logo" className="w-6 h-6 object-contain" />
          ) : (
            <Icon name={plan.icon} className="h-5 w-5" />
          )}
        </div>
        <h4 className="text-xl font-bold text-gray-900">{plan.title}</h4>
      </div>
      <p className="text-gray-500 text-sm mb-6">{plan.subtitle}</p>
      <div className="mb-6 pb-6 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          À partir de
        </span>
        <div className="flex items-baseline mt-1">
          <span className="text-3xl font-extrabold text-ziv-navy">
            {plan.price > 0 ? plan.price.toLocaleString('fr-FR') : 'Sur Devis'} {plan.price > 0 && <span className="text-lg">FCFA</span>}
          </span>
          {plan.price > 0 && <span className="ml-1 text-gray-500 text-sm">/ mois</span>}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onSelect(plan.formValue)}
        className="mt-auto w-full text-center bg-white hover:bg-ziv-navy hover:text-white text-ziv-navy font-semibold py-2.5 px-4 rounded-lg transition duration-300 border border-gray-300"
      >
        {plan.cta}
      </button>
    </div>
  );
}

export default function Pricing() {
  const { selectSoftwareAndScroll } = useModal();
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
        setError("Impossible de charger les tarifs.");
        setLoading(false);
      });
  }, []);

  const erpData = softwares.find(s => s.id === 'lotiges_erp');

  // Filtrer les autres modules (sans l'ERP qui est affiché en bas)
  const pricingPlans = softwares
    .filter(s => s.id !== 'lotiges_erp')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(s => {
      const styles = softwareStylesMap[s.id] || softwareStylesMap['default'];
      return {
        formValue: s.id,
        title: s.name,
        subtitle: s.subtitle,
        price: s.price_cfa,
        featured: s.is_popular,
        icon: s.icon_name || 'Box',
        iconBg: styles.accent.iconBg,
        iconText: styles.accent.iconText,
        hoverBorder: styles.pricing.hoverBorder,
        cta: s.price_cfa === 0 ? 'Demander un devis' : 'Sélectionner ce module'
      };
    });

  return (
    <section id="tarifs" className="py-24 bg-white border-t border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-ziv-cyan font-semibold tracking-wide uppercase text-sm mb-2">
            Acquisition Transparente
          </h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold text-ziv-navy">
            Les Tarifs par Module SaaS
          </h3>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Choisissez le module adapté à vos besoins. Nos offres incluent l'hébergement sécurisé,
            la maintenance et le support technique.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {pricingPlans.map((plan) => (
                <PlanCard key={plan.formValue} plan={plan} onSelect={selectSoftwareAndScroll} />
              ))}
            </div>

            {/* Offre ERP globale */}
            {erpData && (
              <div className="bg-ziv-navy rounded-3xl p-8 md:p-12 shadow-2xl border border-blue-900 flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden mt-8 max-w-5xl mx-auto">
                <div className="absolute -right-24 -top-24 w-64 h-64 bg-ziv-cyan rounded-full opacity-20 blur-3xl" />

                <div className="relative z-10 md:w-2/3 md:pr-10 mb-8 md:mb-0">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-4 backdrop-blur-sm border border-white/20">
                      <Layers className="h-6 w-6 text-cyan-300" />
                    </div>
                    <div>
                      <span className="text-cyan-300 text-xs font-bold uppercase tracking-wider">
                        Acquisition Globale (Licence ou SaaS)
                      </span>
                      <h4 className="text-3xl font-heading font-bold text-white">{erpData.name}</h4>
                    </div>
                  </div>
                  <p className="text-blue-100 mb-6 leading-relaxed">
                    {erpData.description}
                  </p>
                  <ul className="flex flex-wrap gap-4 text-sm text-blue-50">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-ziv-cyan mr-2" /> Licence Serveur Local
                      disponible
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-ziv-cyan mr-2" /> Sur-mesure complet
                    </li>
                  </ul>
                </div>

                <div className="relative z-10 md:w-1/3 flex flex-col items-center justify-center bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 w-full">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-extrabold text-white block">Sur Devis</span>
                    <span className="text-sm text-blue-200 mt-1">Audit métier inclus</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectSoftwareAndScroll('lotiges_erp')}
                    className="w-full text-center bg-white text-ziv-navy hover:bg-gray-100 font-bold py-3 px-4 rounded-xl shadow-lg transition duration-300"
                  >
                    Demander un Audit
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
