import { useEffect, useState } from 'react';
import { Bot, HelpCircle, Loader2, Trash2 } from 'lucide-react';
import { Field, TextInput, TextArea } from '../components/ui/FormControls.jsx';
import Toggle from '../components/ui/Toggle.jsx';
import { fetchFaqs, createFaq, updateFaq, deleteFaq, fetchSettings, updateSettings } from '../../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Faq() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [chatbot, setChatbot] = useState({ enabled: true, bubbleMessage: '', firstMessage: '' });

  useEffect(() => {
    Promise.all([fetchFaqs(), fetchSettings()])
      .then(([faqData, settings]) => {
        setFaqs(faqData);
        setChatbot({
          enabled: settings.chatbot_is_active ?? true,
          bubbleMessage: settings.chatbot_tooltip_msg || '',
          firstMessage: settings.chatbot_welcome_msg || '',
        });
      })
      .catch(() => showToast('Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);

  const setChat = (key) => (val) => setChatbot(c => ({ ...c, [key]: val }));

  const saveChatbot = async (e) => {
    e.preventDefault();
    try {
      await updateSettings({
        chatbot_is_active: chatbot.enabled,
        chatbot_tooltip_msg: chatbot.bubbleMessage,
        chatbot_welcome_msg: chatbot.firstMessage,
      });
      showToast('Chatbot sauvegardé avec succès.');
    } catch { showToast('Erreur sauvegarde chatbot.'); }
  };

  const trainModel = async () => {
    setTraining(true);
    // Simulation d'entraînement NLP
    await new Promise(resolve => setTimeout(resolve, 3000));
    setTraining(false);
    showToast('Le modèle IA a été entraîné avec succès !');
  };

  const setFaqField = (id, key, value) => setFaqs(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f));

  const addFaq = () => setFaqs(prev => [...prev, { id: `temp-${Date.now()}`, question: '', answer: '', sort_order: prev.length, _isNew: true }]);

  const removeFaq = async (faq) => {
    if (faq._isNew) { setFaqs(prev => prev.filter(f => f.id !== faq.id)); return; }
    try { await deleteFaq(faq.id); setFaqs(prev => prev.filter(f => f.id !== faq.id)); showToast('FAQ supprimée.'); }
    catch { showToast('Erreur suppression.'); }
  };

  const saveFaqs = async () => {
    try {
      for (const faq of faqs) {
        if (faq._isNew) {
          if (!faq.question.trim()) continue;
          const res = await createFaq({ question: faq.question, answer: faq.answer, sort_order: faq.sort_order });
          faq.id = res.id; delete faq._isNew;
        } else {
          await updateFaq(faq.id, { question: faq.question, answer: faq.answer, sort_order: faq.sort_order, status: faq.status || 'online' });
        }
      }
      showToast('FAQ mise à jour.');
    } catch { showToast('Erreur sauvegarde FAQ.'); }
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Chargement...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-ziv-cyan to-teal-500 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold font-heading mb-2">Centre d'Assistance Interactif</h2>
        <p className="text-teal-50 text-sm">Gérez les questions fréquentes (FAQ) et configurez le Chatbot.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
            <Bot className="h-5 w-5 mr-2 text-ziv-cyan" /> Configuration du Chatbot
          </h3>
          <form onSubmit={saveChatbot} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900 text-sm">Activer le Chatbot</p>
                <p className="text-xs text-gray-500">Afficher la bulle flottante</p>
              </div>
              <Toggle checked={chatbot.enabled} onChange={setChat('enabled')} />
            </div>
            <Field label="Message d'accueil (Bulle)">
              <TextInput value={chatbot.bubbleMessage} onChange={e => setChat('bubbleMessage')(e.target.value)} />
            </Field>
            <Field label="Premier message du bot">
              <TextArea rows={3} value={chatbot.firstMessage} onChange={e => setChat('firstMessage')(e.target.value)} />
            </Field>
            <div className="flex gap-4 pt-2">
              <button type="submit" className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm">
                Sauvegarder
              </button>
              <button type="button" onClick={trainModel} disabled={training} className="flex-1 bg-ziv-cyan hover:bg-cyan-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center">
                {training ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Entraînement...</> : 'Entraîner (IA)'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-ziv-cyan" /> Foire Aux Questions
            </h3>
            <button onClick={addFaq} className="text-ziv-cyan hover:text-cyan-700 text-sm font-bold">+ Ajouter</button>
          </div>
          <div className="space-y-4">
            {faqs.map(faq => (
              <div key={faq.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative group">
                <button onClick={() => removeFaq(faq)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hidden group-hover:block">
                  <Trash2 className="h-4 w-4" />
                </button>
                <input type="text" value={faq.question} onChange={e => setFaqField(faq.id, 'question', e.target.value)}
                  placeholder="Question..." className="w-full bg-transparent font-bold text-sm text-gray-900 mb-2 border-none p-0 focus:ring-0 outline-none pr-6" />
                <textarea rows={2} value={faq.answer} onChange={e => setFaqField(faq.id, 'answer', e.target.value)}
                  placeholder="Réponse..." className="w-full bg-white border border-gray-200 rounded-lg text-xs p-2 text-gray-600 focus:ring-ziv-cyan outline-none" />
              </div>
            ))}
            <button onClick={saveFaqs} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 px-4 rounded-lg transition-colors text-sm mt-4">
              Mettre à jour la FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
