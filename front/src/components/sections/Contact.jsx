import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, ChevronDown, Lock, Send } from 'lucide-react';
import { useModal } from '../../context/ModalContext.jsx';
import { createLead } from '../../services/api.js';

const SOFTWARE_OPTIONS = [
  { value: 'lotiges_erp', label: 'LOTIGES ERP (Licence/SaaS - Promoteurs & Holding)' },
  { value: 'lotiges', label: 'LOTIGES CRM (Promotion Immobilière & VEFA)' },
  { value: 'suit_foncier', label: 'SUIT FONCIER (Aménagement Foncier & Lotissement)' },
  { value: 'easy_vente', label: 'EASY VENTE (Transactions Agence, Achat & Vente)' },
  { value: 'gespat', label: 'GESPAT (Gestion Locative, Syndic & Quittances)' },
  { value: 'gedaj', label: 'GEDAJ (Juridique, Dispositif LBC & Conformité)' },
  { value: 'syndycarre', label: 'SYNDYCARRE (Gestion Copropriété Augmentée)' },
  { value: 'multiple', label: 'Acquisition globale (Écosystème / Plusieurs solutions)' },
];

const EMPTY_FORM = { name: '', phone: '', email: '', software: '' };

export default function Contact() {
  const { selectedSoftware } = useModal();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [highlight, setHighlight] = useState(false);

  // Pre-selection depuis les cartes tarifs / modales.
  useEffect(() => {
    if (selectedSoftware) {
      setForm((f) => ({ ...f, software: selectedSoftware }));
      setHighlight(true);
      const t = setTimeout(() => setHighlight(false), 1200);
      return () => clearTimeout(t);
    }
  }, [selectedSoftware]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      await createLead({
        full_name: form.name,
        phone: form.phone,
        email: form.email,
        software_interest: form.software,
      });
      setStatus('success');
      setForm(EMPTY_FORM);
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  const loading = status === 'loading';

  return (
    <section id="contact" className="py-24 bg-ziv-navy relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-ziv-cyan opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-full bg-blue-600 opacity-20 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Démarrons Votre Projet d'Acquisition
          </h2>
          <p className="text-gray-300 text-lg">
            Demandez un devis personnalisé ou une démonstration gratuite pour entamer la
            digitalisation de vos processus immobiliers.
          </p>
        </div>

        <div
          className={`bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 transition-all duration-500 ${
            highlight ? 'ring-4 ring-ziv-cyan ring-opacity-50 scale-[1.02]' : ''
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-start" role="alert">
                <CheckCircle className="h-6 w-6 mr-3 text-green-600 flex-shrink-0" />
                <div>
                  <strong className="font-bold block mb-1">Demande envoyée avec succès !</strong>
                  <span className="block text-sm">
                    Notre équipe commerciale en Côte d'Ivoire vous contactera très prochainement
                    pour votre devis.
                  </span>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-start" role="alert">
                <AlertCircle className="h-6 w-6 mr-3 text-red-600 flex-shrink-0" />
                <div>
                  <strong className="font-bold block mb-1">Envoi impossible</strong>
                  <span className="block text-sm">{errorMsg}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                  Nom Complet / Société *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-ziv-cyan focus:border-ziv-cyan outline-none transition-all disabled:opacity-50"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                  Téléphone (WhatsApp préféré) *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-ziv-cyan focus:border-ziv-cyan outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                Email Professionnel *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-ziv-cyan focus:border-ziv-cyan outline-none transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="software" className="block text-sm font-bold text-gray-700 mb-2">
                Projet d'acquisition logiciel *
              </label>
              <div className="relative">
                <select
                  id="software"
                  name="software"
                  required
                  value={form.software}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-ziv-cyan focus:border-ziv-cyan outline-none transition-all appearance-none text-gray-800 font-medium disabled:opacity-50"
                >
                  <option value="">Sélectionnez le logiciel ou l'ERP souhaité...</option>
                  {SOFTWARE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <ChevronDown className="h-5 w-5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ziv-cyan hover:bg-cyan-600 text-white font-bold py-4 px-4 rounded-xl transition duration-300 shadow-lg hover:shadow-cyan-500/30 text-lg flex justify-center items-center disabled:opacity-60"
            >
              <Send className="h-5 w-5 mr-2" />
              {loading ? 'Envoi en cours...' : 'Demander un Devis & Démo B2B'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              <Lock className="h-3 w-3 inline mr-1" /> Vos informations sont chiffrées et sécurisées.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
