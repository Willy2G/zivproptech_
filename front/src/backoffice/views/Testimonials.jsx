import { useEffect, useState } from 'react';
import { Edit2, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Field, TextInput, TextArea } from '../components/ui/FormControls.jsx';
import { fetchTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

const emptyForm = { client_name: '', company_role: '', client_initials: '', company_name: '', quote: '', rating: 5, status: 'online', sort_order: 0 };

export default function Testimonials() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchTestimonials().then(setItems).catch(() => showToast('Erreur chargement témoignages.')).finally(() => setLoading(false));
  }, []);

  const setField = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleEdit = (t) => {
    setEditingId(t.id);
    setForm({ client_name: t.client_name, company_role: t.company_role, client_initials: t.client_initials, company_name: t.company_name || '', quote: t.quote, rating: t.rating, status: t.status, sort_order: t.sort_order });
  };

  const handleNew = () => { setEditingId('new'); setForm(emptyForm); };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce témoignage ?')) return;
    try { await deleteTestimonial(id); setItems(prev => prev.filter(t => t.id !== id)); showToast('Supprimé.'); }
    catch { showToast('Erreur.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId === 'new') {
        const res = await createTestimonial(form);
        setItems(prev => [...prev, { id: res.id, ...form }]);
        showToast('Témoignage créé.');
      } else {
        await updateTestimonial(editingId, form);
        setItems(prev => prev.map(t => t.id === editingId ? { ...t, ...form } : t));
        showToast('Témoignage mis à jour.');
      }
      setEditingId(null); setForm(emptyForm);
    } catch { showToast('Erreur sauvegarde.'); }
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Gestion des Témoignages Clients</h2>
        <button onClick={handleNew} className="bg-ziv-cyan hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center text-sm">
          <Plus className="h-4 w-4 mr-2" /> Ajouter un avis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b"><tr>
              <th className="px-6 py-4">Client / Entreprise</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(t => (
                <tr key={t.id} className={`hover:bg-gray-50 ${editingId === t.id ? 'bg-cyan-50/40' : ''}`}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{t.client_name}</p>
                    <p className="text-xs">{t.company_name} — {t.company_role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {t.status === 'online' ? 'En ligne' : 'Masqué'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(t)} className="text-gray-400 hover:text-ziv-cyan mr-3"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingId && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 h-fit">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">{editingId === 'new' ? 'Nouveau témoignage' : 'Éditer'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Nom du client"><TextInput value={form.client_name} onChange={setField('client_name')} required /></Field>
              <Field label="Initiales"><TextInput value={form.client_initials} onChange={setField('client_initials')} required maxLength={5} /></Field>
              <Field label="Entreprise"><TextInput value={form.company_name} onChange={setField('company_name')} /></Field>
              <Field label="Poste / Rôle"><TextInput value={form.company_role} onChange={setField('company_role')} required /></Field>
              <Field label="Citation"><TextArea rows={4} value={form.quote} onChange={setField('quote')} required /></Field>
              <button type="submit" className="w-full bg-ziv-navy hover:bg-ziv-blue text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm flex justify-center items-center">
                <Save className="h-4 w-4 mr-2" /> {editingId === 'new' ? 'Créer' : 'Mettre à jour'}
              </button>
              <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="w-full text-gray-500 hover:text-gray-700 text-sm mt-2">Annuler</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
