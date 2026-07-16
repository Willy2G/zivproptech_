import { useEffect, useState } from 'react';
import { Save, Loader2, Upload, ImageIcon } from 'lucide-react';
import { Field, TextInput, TextArea, Select, SaveButton } from '../components/ui/FormControls.jsx';
import { fetchSoftwares, updateSoftware, createSoftware, deleteSoftware, uploadImage } from '../../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Logiciels() {
  const { showToast } = useToast();
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchSoftwares()
      .then(data => {
        setCatalog(data);
        if (data.length) { setSelectedId(data[0].id); setForm(toForm(data[0])); }
      })
      .catch(() => showToast('Impossible de charger les logiciels.'))
      .finally(() => setLoading(false));
  }, []);

  function toForm(sw) {
    return {
      name: sw.name || '', subtitle: sw.subtitle || '', description: sw.description || '',
      price_cfa: sw.price_cfa || 0, youtube_id: sw.youtube_id || '', cover_image: sw.cover_image || '',
      icon_name: sw.icon_name || '', is_popular: sw.is_popular || false, sort_order: sw.sort_order || 0,
      features: Array.isArray(sw.features) ? sw.features.join('\n') : '',
      benefits: Array.isArray(sw.benefits) ? sw.benefits.join('\n') : '',
    };
  }

  const handleSelect = (e) => {
    const id = e.target.value;
    if (id === 'new') {
      setIsCreating(true);
      setSelectedId('');
      setForm(toForm({}));
    } else {
      setIsCreating(false);
      setSelectedId(id);
      setForm(toForm(catalog.find(s => s.id === id) || {}));
    }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await uploadImage(file);
      setForm(f => ({ ...f, icon_name: res.url }));
      showToast('Logo uploadé avec succès.');
    } catch (err) {
      showToast('Erreur lors de l\'upload du logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      features: form.features.split('\n').map(s => s.replace(/^-\s*/, '').trim()).filter(Boolean),
      benefits: form.benefits.split('\n').map(s => s.replace(/^-\s*/, '').trim()).filter(Boolean),
    };
    
    try {
      if (isCreating) {
        if (!form.id) { showToast('ID requis pour un nouveau logiciel'); return; }
        await createSoftware({ id: form.id, ...payload });
        showToast(`Logiciel créé.`);
        const data = await fetchSoftwares();
        setCatalog(data);
        setIsCreating(false);
        setSelectedId(form.id);
      } else {
        await updateSoftware(selectedId, payload);
        showToast(`« ${form.name} » sauvegardé.`);
        setCatalog(prev => prev.map(s => s.id === selectedId ? { ...s, ...payload } : s));
      }
    } catch { showToast('Erreur de sauvegarde.'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce logiciel ?')) return;
    try {
      await deleteSoftware(selectedId);
      showToast('Logiciel supprimé.');
      const data = await fetchSoftwares();
      setCatalog(data);
      if (data.length) { setSelectedId(data[0].id); setForm(toForm(data[0])); }
      else { setSelectedId(''); setForm(toForm({})); }
    } catch { showToast('Erreur lors de la suppression.'); }
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <p className="text-sm text-gray-600">Sélectionnez le logiciel à modifier.</p>
        <Select value={isCreating ? 'new' : selectedId} onChange={handleSelect} className="w-full md:w-64 font-bold">
          {catalog.map(sw => <option key={sw.id} value={sw.id}>{sw.name}</option>)}
          <option value="new" className="text-ziv-cyan font-bold">+ Ajouter un Logiciel</option>
        </Select>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 border-b pb-2">Informations Générales</h4>
              {isCreating && (
                <Field label="ID du Logiciel (Unique, ex: mon_logiciel)">
                  <TextInput value={form.id || ''} onChange={set('id')} />
                </Field>
              )}
              <Field label="Nom du Logiciel"><TextInput value={form.name} onChange={set('name')} /></Field>
              <Field label="Sous-titre / Accroche"><TextInput value={form.subtitle} onChange={set('subtitle')} /></Field>
              <Field label="Description courte"><TextArea rows={3} value={form.description} onChange={set('description')} /></Field>
              <Field label="Mise en avant">
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="is_popular"
                    checked={form.is_popular || false}
                    onChange={(e) => setForm(f => ({ ...f, is_popular: e.target.checked }))}
                    className="w-4 h-4 text-ziv-cyan border-gray-300 rounded focus:ring-ziv-cyan"
                  />
                  <label htmlFor="is_popular" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Marquer ce logiciel comme "Populaire" (affiche un badge)
                  </label>
                </div>
              </Field>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 border-b pb-2">Tarification & Médias</h4>
              <Field label="Prix (FCFA / mois)" hint="0 = « Sur devis »">
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md font-bold">FCFA</span>
                  <TextInput type="number" value={form.price_cfa} onChange={set('price_cfa')} className="rounded-l-none" />
                </div>
              </Field>
              
              <Field label="Logo du logiciel">
                <div className="flex items-center space-x-4">
                  {form.icon_name && (form.icon_name.startsWith('http') || form.icon_name.startsWith('/')) ? (
                    <img src={form.icon_name} alt="Logo" className="w-12 h-12 object-contain border rounded bg-gray-50" />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center border rounded bg-gray-100 text-gray-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="flex items-center justify-center w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      {uploadingLogo ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {uploadingLogo ? 'Upload en cours...' : 'Uploader une image'}
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                    </label>
                    <p className="text-[10px] text-gray-400 mt-1">Ou saisissez un nom d'icône (ex: Box)</p>
                    <TextInput value={form.icon_name} onChange={set('icon_name')} className="mt-1" />
                  </div>
                </div>
              </Field>

              <Field label="ID Vidéo YouTube"><TextInput value={form.youtube_id} onChange={set('youtube_id')} placeholder="M7lc1UVf-VE" /></Field>
              <Field label="Image de couverture (URL)"><TextInput value={form.cover_image} onChange={set('cover_image')} /></Field>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">Fonctionnalités (une par ligne)</h4>
            <TextArea rows={5} value={form.features} onChange={set('features')} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">Bénéfices (un par ligne)</h4>
            <TextArea rows={5} value={form.benefits} onChange={set('benefits')} />
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            {!isCreating && selectedId ? (
              <button type="button" onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm font-semibold">
                Supprimer ce logiciel
              </button>
            ) : <div></div>}
            <SaveButton><Save className="h-4 w-4 mr-2" /> Enregistrer</SaveButton>
          </div>
        </form>
      </div>
    </div>
  );
}
