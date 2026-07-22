import { useState } from 'react';
import { Calendar, CheckCircle, Loader2 } from 'lucide-react';
import Modal from './Modal.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { createLead } from '../../services/api.js';

export default function ExpertModal() {
  const { expertModal, closeExpert } = useModal();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date: '',
    notes: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      software_interest: 'Rendez-vous',
      message: `Date souhaitée : ${formData.date}\nNotes : ${formData.notes}`,
    };

    try {
      await createLead(payload);
      setSuccess(true);
      setFormData({ full_name: '', email: '', phone: '', date: '', notes: '' });
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={expertModal}
      onClose={() => {
        closeExpert();
        setTimeout(() => {
          setSuccess(false);
          setError(null);
        }, 300);
      }}
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
            Remplissez ce formulaire pour planifier un rendez-vous. Un consultant expert ZIV Proptech
            vous contactera rapidement pour confirmer la date.
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

      <div className="w-full md:w-3/5 bg-white relative p-8 overflow-y-auto">
        <h4 className="text-2xl font-bold text-gray-900 mb-6">Prendre Rendez-vous</h4>
        
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h5 className="text-xl font-bold mb-2">Demande envoyée !</h5>
            <p>Notre équipe a bien reçu votre demande de rendez-vous et vous recontactera très prochainement.</p>
            <button
              type="button"
              onClick={closeExpert}
              className="mt-6 bg-ziv-cyan text-white px-6 py-2 rounded-lg font-semibold hover:bg-cyan-600 transition"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet *</label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ziv-cyan focus:border-ziv-cyan"
                placeholder="Votre nom"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ziv-cyan focus:border-ziv-cyan"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ziv-cyan focus:border-ziv-cyan"
                  placeholder="+225 00 00 00 00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure souhaitées *</label>
              <input
                type="datetime-local"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ziv-cyan focus:border-ziv-cyan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Détails de votre besoin</label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ziv-cyan focus:border-ziv-cyan resize-none"
                placeholder="Précisez votre demande..."
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ziv-navy text-white font-bold py-3 px-4 rounded-xl hover:bg-ziv-blue transition-colors flex justify-center items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Envoi en cours...
                </>
              ) : (
                'Confirmer le Rendez-vous'
              )}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}
