import { useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { fetchFaqs } from '../../services/api.js';

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 transition-all duration-300">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-6 py-5 focus:outline-none flex justify-between items-center bg-white"
      >
        <span className="font-bold text-gray-900 pr-4">{item.question}</span>
        <ChevronDown
          className={`h-5 w-5 text-ziv-cyan flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div
          className="px-6 py-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100"
          dangerouslySetInnerHTML={{ __html: item.answer }}
        />
      )}
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFaqs()
      .then((data) => {
        // Optionnel : on pourrait filtrer par status === 'online'
        setFaqs(data.filter(f => f.status === 'online') || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les questions fréquentes.");
        setLoading(false);
      });
  }, []);

  return (
    <section id="faq" className="py-24 bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-ziv-cyan font-semibold tracking-wide uppercase text-sm mb-2">
            Foire Aux Questions
          </h2>
          <h3 className="text-3xl font-heading font-bold text-ziv-navy">
            Tout savoir sur l'écosystème ZIV
          </h3>
        </div>

        {loading && (
          <div className="flex justify-center my-12">
            <Loader2 className="animate-spin text-ziv-cyan h-8 w-8" />
          </div>
        )}
        
        {error && (
          <div className="text-center text-red-500 my-12">{error}</div>
        )}
        
        {!loading && !error && faqs.length === 0 && (
          <div className="text-center text-gray-500 my-12">Aucune question trouvée.</div>
        )}

        {!loading && !error && faqs.length > 0 && (
          <div className="space-y-4">
            {faqs.map((item, index) => (
              <FaqItem
                key={item.id}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
