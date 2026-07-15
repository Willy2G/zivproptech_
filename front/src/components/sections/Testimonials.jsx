import { useState, useEffect } from 'react';
import { MousePointerClick, Quote, Loader2 } from 'lucide-react';
import { fetchTestimonials } from '../../services/api.js';

function TestimonialCard({ t }) {
  // Optionnellement, on peut générer t.dark, t.avatarBg, t.avatarText si ce n'est pas dans l'API
  // Dans le mock, il y avait ça. L'API retourne : id, client_name, company_role, client_initials, company_name, quote, rating, status
  const isDark = t.sort_order % 2 !== 0; // Simple logique pour alterner dark/light
  const avatarBg = 'bg-gray-200'; // Fallback
  const avatarText = 'text-gray-700';

  if (isDark) {
    return (
      <div className="bg-ziv-navy rounded-2xl p-8 shadow-xl w-[350px] md:w-[400px] flex-shrink-0 flex flex-col h-full relative transform md:-translate-y-2">
        <Quote className="absolute top-6 right-6 h-8 w-8 text-white opacity-10" />
        <div className="bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block w-max backdrop-blur-sm">
          {t.company_name}
        </div>
        <p className="text-gray-200 italic mb-6 flex-grow text-sm md:text-base">{t.quote}</p>
        <div className="flex items-center mt-auto border-t border-white/10 pt-4">
          <div className={`h-10 w-10 rounded-full ${avatarBg} flex items-center justify-center ${avatarText} font-bold mr-3 flex-shrink-0`}>
            {t.client_initials}
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">{t.client_name}</h4>
            <p className="text-xs text-gray-400">{t.company_role}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-ziv-cyan transition-colors w-[350px] md:w-[400px] flex-shrink-0 flex flex-col h-full relative">
      <Quote className="absolute top-6 right-6 h-8 w-8 text-ziv-cyan opacity-20" />
      <div className="bg-white border border-gray-100 text-ziv-navy text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block w-max shadow-sm">
        {t.company_name}
      </div>
      <p className="text-gray-700 italic mb-6 flex-grow text-sm md:text-base">{t.quote}</p>
      <div className="flex items-center mt-auto border-t border-gray-200 pt-4">
        <div className={`h-10 w-10 rounded-full ${avatarBg} flex items-center justify-center ${avatarText} font-bold mr-3 flex-shrink-0`}>
          {t.client_initials}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{t.client_name}</h4>
          <p className="text-xs text-gray-500">{t.company_role}</p>
        </div>
      </div>
    </div>
  );
}

// Piste dupliquee pour un defilement infini fluide (animation CSS `scroll`).
function Track({ data, ariaHidden = false }) {
  return (
    <div className="flex animate-scroll gap-6 pr-6 w-max flex-shrink-0" aria-hidden={ariaHidden}>
      {data.map((t, i) => (
        <TestimonialCard key={`${t.id || i}-${ariaHidden ? 'hidden' : 'visible'}`} t={t} />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTestimonials()
      .then((res) => {
        setData(res.filter(t => t.status === 'online') || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les témoignages.");
        setLoading(false);
      });
  }, []);

  return (
    <section id="temoignages" className="py-24 bg-white border-t border-gray-200 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center">
          <h2 className="text-ziv-cyan font-semibold tracking-wide uppercase text-sm mb-2">
            Ils ont choisi l'excellence
          </h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold text-ziv-navy">
            La parole à nos partenaires B2B
          </h3>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center my-12">
          <Loader2 className="animate-spin text-ziv-cyan h-8 w-8" />
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 my-12">{error}</div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="text-center text-gray-500 my-12">Aucun témoignage disponible.</div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="w-full relative carousel-container mask-edges py-4 overflow-hidden">
          <div className="flex w-full">
            <Track data={data} />
            <Track data={data} ariaHidden />
          </div>

          <p className="text-center text-sm text-gray-400 mt-8 mb-4">
            <MousePointerClick className="h-4 w-4 inline mr-1" /> Survolez pour mettre en pause
          </p>
        </div>
      )}
    </section>
  );
}
