import { useEffect, useState } from 'react';
import { BarChart2, Contact, Loader2, Palette, Save, Search, Upload, ImageIcon } from 'lucide-react';
import { Field, TextInput, TextArea } from '../components/ui/FormControls.jsx';
import { fetchSettings, updateSettings, uploadImage } from '../../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <div className="flex items-center space-x-3">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="h-10 w-10 rounded border border-gray-300 cursor-pointer" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono uppercase outline-none" />
      </div>
    </div>
  );
}

export default function Seo() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [form, setForm] = useState({
    seo_title: '', seo_meta_desc: '', seo_keywords: '', google_analytics_id: '', facebook_pixel_id: '',
    primary_color: '#00A8B5', secondary_color: '#0A1E4A', logo_url: '', favicon_url: '',
    contact_phones: '', contact_email: '', contact_address: '',
    facebook_url: '', linkedin_url: '', youtube_url: '', twitter_url: '', instagram_url: '',
  });

  useEffect(() => {
    fetchSettings()
      .then(data => setForm(prev => ({ ...prev, ...data })))
      .catch(() => showToast('Erreur chargement configuration.'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const save = (section, keys) => async (e) => {
    e.preventDefault();
    const payload = {};
    keys.forEach(k => { payload[k] = form[k]; });
    try { await updateSettings(payload); showToast(`${section} sauvegardé.`); }
    catch { showToast('Erreur de sauvegarde.'); }
  };

  const handleFileUpload = async (e, key, setUploading) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      setForm(f => ({ ...f, [key]: res.url }));
      showToast('Fichier uploadé avec succès.');
    } catch (err) {
      showToast('Erreur lors de l\'upload.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Chargement...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-ziv-navy to-ziv-blue rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold font-heading mb-2">Configuration Globale du Site</h2>
        <p className="text-blue-200 text-sm">Identité visuelle, SEO, Analytics et coordonnées.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <form onSubmit={save('SEO et Tracking', ['seo_title', 'seo_meta_desc', 'seo_keywords', 'google_analytics_id', 'facebook_pixel_id'])} className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
              <Search className="h-5 w-5 mr-2 text-ziv-cyan" /> Référencement (SEO)
            </h3>
            <Field label="Balise Title"><TextInput value={form.seo_title} onChange={set('seo_title')} /></Field>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Méta Description</label>
              <TextArea rows={3} value={form.seo_meta_desc || ''} onChange={set('seo_meta_desc')} />
              <div className="flex justify-between items-center mt-1">
                <div className="w-2/3 bg-gray-200 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${(form.seo_meta_desc || '').length > 160 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(((form.seo_meta_desc || '').length / 160) * 100, 100)}%` }} />
                </div>
                <p className="text-[10px] text-gray-400">{(form.seo_meta_desc || '').length} / 160</p>
              </div>
            </div>
            <Field label="Mots-clés"><TextInput value={form.seo_keywords || ''} onChange={set('seo_keywords')} /></Field>

            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2 mt-8">
              <BarChart2 className="h-5 w-5 mr-2 text-ziv-cyan" /> Tracking & Analytics
            </h3>
            <Field label="ID Google Analytics"><TextInput value={form.google_analytics_id || ''} onChange={set('google_analytics_id')} placeholder="G-XXXXXXXXXX" className="font-mono" /></Field>
            <Field label="ID Pixel Facebook"><TextInput value={form.facebook_pixel_id || ''} onChange={set('facebook_pixel_id')} placeholder="123456789012345" className="font-mono" /></Field>

            <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm flex justify-center items-center mt-6">
              <Save className="h-4 w-4 mr-2" /> Sauvegarder SEO & Tracking
            </button>
          </form>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <form onSubmit={save('Identité Visuelle', ['primary_color', 'secondary_color', 'logo_url', 'favicon_url', 'contact_phones', 'contact_email', 'contact_address', 'facebook_url', 'linkedin_url', 'youtube_url', 'twitter_url', 'instagram_url'])} className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
              <Palette className="h-5 w-5 mr-2 text-ziv-cyan" /> Charte Graphique
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <ColorField label="Couleur Principale" value={form.primary_color} onChange={v => setForm(f => ({ ...f, primary_color: v }))} />
              <ColorField label="Couleur Secondaire" value={form.secondary_color} onChange={v => setForm(f => ({ ...f, secondary_color: v }))} />
            </div>

            <div className="space-y-4">
              <Field label="Logo Principal">
                <div className="flex items-center space-x-4">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="Logo" className="h-10 object-contain border rounded bg-gray-50" />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center border rounded bg-gray-100 text-gray-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="flex items-center justify-center w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      <span className="text-sm font-medium text-gray-700">{uploadingLogo ? 'Upload...' : 'Uploader le logo'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'logo_url', setUploadingLogo)} disabled={uploadingLogo} />
                    </label>
                  </div>
                </div>
              </Field>

              <Field label="Favicon (Icône d'onglet)">
                <div className="flex items-center space-x-4">
                  {form.favicon_url ? (
                    <img src={form.favicon_url} alt="Favicon" className="w-8 h-8 object-contain border rounded bg-gray-50" />
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center border rounded bg-gray-100 text-gray-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="flex items-center justify-center w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      {uploadingFavicon ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      <span className="text-sm font-medium text-gray-700">{uploadingFavicon ? 'Upload...' : 'Uploader le favicon'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'favicon_url', setUploadingFavicon)} disabled={uploadingFavicon} />
                    </label>
                  </div>
                </div>
              </Field>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2 mt-8">
              <Contact className="h-5 w-5 mr-2 text-ziv-cyan" /> Coordonnées & Réseaux Sociaux
            </h3>
            <Field label="Téléphones"><TextInput value={form.contact_phones || ''} onChange={set('contact_phones')} /></Field>
            <Field label="Email"><TextInput type="email" value={form.contact_email || ''} onChange={set('contact_email')} /></Field>
            <Field label="Adresse"><TextInput value={form.contact_address || ''} onChange={set('contact_address')} /></Field>
            <Field label="Facebook"><TextInput value={form.facebook_url || ''} onChange={set('facebook_url')} placeholder="https://facebook.com/..." /></Field>
            <Field label="LinkedIn"><TextInput value={form.linkedin_url || ''} onChange={set('linkedin_url')} placeholder="https://linkedin.com/..." /></Field>
            <Field label="YouTube"><TextInput value={form.youtube_url || ''} onChange={set('youtube_url')} placeholder="https://youtube.com/..." /></Field>
            <Field label="Instagram"><TextInput value={form.instagram_url || ''} onChange={set('instagram_url')} placeholder="https://instagram.com/..." /></Field>
            <Field label="Twitter"><TextInput value={form.twitter_url || ''} onChange={set('twitter_url')} placeholder="https://twitter.com/..." /></Field>
            <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm mt-6 flex items-center justify-center">
              <Save className="h-4 w-4 mr-2" /> Sauvegarder l'identité
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 mt-8">
        <form onSubmit={save('Configuration SMS/Email', ['sms_api_key', 'sms_sender_id', 'sms_api_token', 'sms_api_url'])} className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
            Configuration de l'API SMS / Email
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="URL de l'API SMS (Endpoint)"><TextInput value={form.sms_api_url || ''} onChange={set('sms_api_url')} placeholder="https://api.sms-provider.com/v1/send" /></Field>
            <Field label="Clé API (API Key)"><TextInput value={form.sms_api_key || ''} onChange={set('sms_api_key')} placeholder="Votre clé API" /></Field>
            <Field label="Token (Auth Token)"><TextInput value={form.sms_api_token || ''} onChange={set('sms_api_token')} placeholder="Token d'authentification" /></Field>
            <Field label="ID Expéditeur (Sender ID)"><TextInput value={form.sms_sender_id || ''} onChange={set('sms_sender_id')} placeholder="Ex: ZIV TECH" /></Field>
          </div>
          
          <button type="submit" className="w-full md:w-auto bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl transition-colors text-sm flex justify-center items-center mt-6">
            <Save className="h-4 w-4 mr-2" /> Sauvegarder la configuration SMS
          </button>
        </form>
      </div>
    </div>
  );
}
