import { useEffect, useState, useRef } from 'react';
import { BarChart2, Bell, Calendar, Contact, Loader2, Mail, Palette, Phone, Plus, Save, Search, Upload, ImageIcon, X } from 'lucide-react';
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

function TagField({ label, icon, tags, onAdd, onRemove, placeholder, type, tagColor }) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const handleAdd = () => {
    if (inputValue.trim()) {
      const added = onAdd(inputValue);
      if (added !== false) setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onRemove(tags.length - 1);
    }
  };

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
        <span className="text-ziv-cyan mr-2">{icon}</span> {label}
      </label>
      <div
        className="min-h-[48px] p-2 bg-gray-50 border border-gray-300 rounded-lg flex flex-wrap items-center gap-2 cursor-text transition-all focus-within:ring-2 focus-within:ring-ziv-cyan/30 focus-within:border-ziv-cyan"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${tagColor} transition-all hover:shadow-sm group`}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
              className="ml-1.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <div className="flex items-center flex-1 min-w-[140px]">
          <input
            ref={inputRef}
            type={type || 'text'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : 'Ajouter...'}
            className="flex-1 bg-transparent border-none outline-none text-sm py-1 min-w-[100px]"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="p-1.5 text-gray-400 hover:text-ziv-cyan hover:bg-ziv-cyan/10 rounded-lg transition-colors"
            title="Ajouter"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 mt-1">Appuyez sur Entrée ou virgule pour ajouter</p>
    </div>
  );
}

export default function Seo() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingGuide, setUploadingGuide] = useState(false);
  const [form, setForm] = useState({
    seo_title: '', seo_meta_desc: '', seo_keywords: '', google_analytics_id: '', facebook_pixel_id: '',
    primary_color: '#00A8B5', secondary_color: '#0A1E4A', logo_url: '', favicon_url: '',
    contact_phones: '', contact_email: '', contact_address: '',
    facebook_url: '', linkedin_url: '', youtube_url: '', twitter_url: '', instagram_url: '',
    calendly_url: '', demo_video_url: '', guide_document_url: '', guide_email_subject: '', guide_email_content: '',
    email_from_name: '', email_from_address: '', smtp_host: '', smtp_port: '', smtp_user: '', smtp_pass: '',
    notification_cc_emails: '', notification_cc_phones: '',
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

  // --- Tag Input helpers ---
  const parseTagString = (str) => (str || '').split(',').map(s => s.trim()).filter(Boolean);
  const tagsToString = (arr) => arr.join(', ');

  const addTag = (fieldKey, value) => {
    const current = parseTagString(form[fieldKey]);
    const trimmed = value.trim();
    if (!trimmed || current.includes(trimmed)) return false;
    setForm(f => ({ ...f, [fieldKey]: tagsToString([...current, trimmed]) }));
    return true;
  };

  const removeTag = (fieldKey, index) => {
    const current = parseTagString(form[fieldKey]);
    current.splice(index, 1);
    setForm(f => ({ ...f, [fieldKey]: tagsToString(current) }));
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
          <form onSubmit={save('Identité Visuelle', ['primary_color', 'secondary_color', 'logo_url', 'favicon_url', 'contact_phones', 'contact_email', 'contact_address', 'facebook_url', 'linkedin_url', 'youtube_url', 'twitter_url', 'instagram_url', 'calendly_url', 'demo_video_url'])} className="space-y-6">
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

            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2 mt-8">
              <Calendar className="h-5 w-5 mr-2 text-ziv-cyan" /> Intégration Calendly (Prise de RDV)
            </h3>
            <Field label="URL Calendly">
              <TextInput value={form.calendly_url || ''} onChange={set('calendly_url')} placeholder="https://calendly.com/votre-compte" />
            </Field>
            <p className="text-xs text-gray-400 -mt-4">L'URL de votre page Calendly pour la prise de rendez-vous. Ex : https://calendly.com/votre-entreprise</p>
            
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2 mt-8">
              <Calendar className="h-5 w-5 mr-2 text-ziv-cyan" /> Démonstration Vidéo
            </h3>
            <Field label="Lien de la Vidéo (L'Écosystème ZIV PROPTECH)">
              <TextInput value={form.demo_video_url || ''} onChange={set('demo_video_url')} placeholder="https://www.youtube.com/watch?v=..." />
            </Field>

            <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm mt-6 flex items-center justify-center">
              <Save className="h-4 w-4 mr-2" /> Sauvegarder l'identité
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 mt-8">
        <form onSubmit={save('Configuration SMS/Email', ['sms_sender_id', 'sms_api_token', 'sms_api_url', 'guide_document_url', 'guide_email_subject', 'guide_email_content', 'email_from_name', 'email_from_address', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'notification_cc_emails', 'notification_cc_phones'])} className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
            Configuration SMS (API)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Expéditeur (Sender)"><TextInput value={form.sms_sender_id || ''} onChange={set('sms_sender_id')} placeholder="Ex: ZIV TECH" /></Field>
            <Field label="Endpoint (URL de l'API)"><TextInput value={form.sms_api_url || ''} onChange={set('sms_api_url')} placeholder="https://apis.letexto.com" /></Field>
            <Field label="Token (Bearer)"><TextInput value={form.sms_api_token || ''} onChange={set('sms_api_token')} placeholder="Votre token d'authentification" /></Field>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2 mt-8">
            Configuration Email (SMTP)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Nom de l'Expéditeur"><TextInput value={form.email_from_name || ''} onChange={set('email_from_name')} placeholder="ZIV PROPTECH" /></Field>
            <Field label="Email de l'Expéditeur">
              <TextInput value={form.email_from_address || ''} onChange={set('email_from_address')} placeholder="Identique à l'Utilisateur SMTP" />
              <p className="text-xs text-amber-600 mt-1">⚠️ Doit correspondre à l'Utilisateur SMTP ci-dessous, sinon les emails seront rejetés par Gmail, Yahoo, etc.</p>
            </Field>
            <Field label="Serveur SMTP (Host)"><TextInput value={form.smtp_host || ''} onChange={set('smtp_host')} placeholder="smtp.votredomaine.com" /></Field>
            <Field label="Port SMTP"><TextInput type="number" value={form.smtp_port || ''} onChange={set('smtp_port')} placeholder="587 ou 465" /></Field>
            <Field label="Utilisateur SMTP"><TextInput value={form.smtp_user || ''} onChange={set('smtp_user')} placeholder="contact@votredomaine.com" /></Field>
            <Field label="Mot de passe SMTP"><TextInput type="password" value={form.smtp_pass || ''} onChange={set('smtp_pass')} placeholder="••••••••" /></Field>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2 mt-8">
            <Bell className="h-5 w-5 mr-2 text-ziv-cyan" /> Destinataires des Notifications (Leads)
          </h3>
          <p className="text-sm text-gray-500 -mt-2 mb-4">
            Lorsqu'un prospect s'inscrit via le site public, une notification sera envoyée automatiquement par <strong>Email</strong> et <strong>SMS</strong> aux destinataires ci-dessous.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TagField
              label="Emails en copie (CC)"
              icon={<Mail className="h-4 w-4" />}
              tags={parseTagString(form.notification_cc_emails)}
              onAdd={(val) => addTag('notification_cc_emails', val)}
              onRemove={(idx) => removeTag('notification_cc_emails', idx)}
              placeholder="ex: commercial@ziv.ci"
              type="email"
              tagColor="bg-blue-50 text-blue-700 border-blue-200"
            />
            <TagField
              label="Téléphones de notification (SMS)"
              icon={<Phone className="h-4 w-4" />}
              tags={parseTagString(form.notification_cc_phones)}
              onAdd={(val) => addTag('notification_cc_phones', val)}
              onRemove={(idx) => removeTag('notification_cc_phones', idx)}
              placeholder="ex: +225 07 08 53 11 11"
              type="tel"
              tagColor="bg-green-50 text-green-700 border-green-200"
            />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2 mt-8">
            Envoi du Guide (Centre de Connaissances)
          </h3>
          <div className="space-y-4">
            <Field label="Lien du Document Guide (PDF)">
              <div className="flex space-x-2">
                <TextInput value={form.guide_document_url || ''} onChange={set('guide_document_url')} placeholder="https://votresite.com/guide.pdf" />
                <label className="flex items-center justify-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap">
                  {uploadingGuide ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  <span className="text-sm font-medium text-gray-700">{uploadingGuide ? 'Upload...' : 'Uploader'}</span>
                  <input type="file" accept="application/pdf" className="hidden" onChange={e => handleFileUpload(e, 'guide_document_url', setUploadingGuide)} disabled={uploadingGuide} />
                </label>
              </div>
            </Field>
            <Field label="Sujet de l'Email">
              <TextInput value={form.guide_email_subject || ''} onChange={set('guide_email_subject')} placeholder="Voici votre guide gratuit" />
            </Field>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Contenu de l'Email</label>
              <TextArea rows={4} value={form.guide_email_content || ''} onChange={set('guide_email_content')} placeholder="Bonjour, merci pour votre téléchargement..." />
            </div>
          </div>
          
          <button type="submit" className="w-full md:w-auto bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl transition-colors text-sm flex justify-center items-center mt-6">
            <Save className="h-4 w-4 mr-2" /> Sauvegarder la configuration
          </button>
        </form>
      </div>
    </div>
  );
}
