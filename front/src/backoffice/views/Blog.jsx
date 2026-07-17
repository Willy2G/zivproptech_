import { useEffect, useState } from 'react';
import { Edit2, Loader2, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Field, TextInput, TextArea, Select } from '../components/ui/FormControls.jsx';
import { fetchPosts, createPost, updatePost, deletePost, uploadImage } from '../../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const STATUS_BADGE = {
  published: { label: 'Publié', className: 'bg-green-100 text-green-800' },
  draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700' },
  archived: { label: 'Archivé', className: 'bg-red-100 text-red-700' },
};
const CATEGORIES = ['Réglementation', 'Promotion', 'Lotissement', 'Syndic', 'Gestion Locative', 'Tech'];

export default function Blog() {
  const { showToast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', category: CATEGORIES[0], content_html: '', meta_description: '', status: 'draft', cover_image: '', sort_order: 0 });

  useEffect(() => {
    fetchPosts().then(setArticles).catch(() => showToast('Erreur chargement articles.')).finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(articles.length / perPage));
  const paginated = articles.slice((page - 1) * perPage, page * perPage);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const resetForm = () => { setEditing(null); setForm({ title: '', slug: '', category: CATEGORIES[0], content_html: '', meta_description: '', status: 'draft', cover_image: '', sort_order: 0 }); };

  const handleEdit = (a) => { setEditing(a.id); setForm({ title: a.title, slug: a.slug, category: a.category, content_html: a.content_html, meta_description: a.meta_description || '', status: a.status, cover_image: a.cover_image || '', sort_order: a.sort_order || 0 }); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      setForm(f => ({ ...f, cover_image: res.url }));
      showToast('Image uploadée.');
    } catch (err) {
      showToast('Erreur upload : ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet article ?')) return;
    try { await deletePost(id); setArticles(prev => prev.filter(a => a.id !== id)); showToast('Article supprimé.'); }
    catch { showToast('Erreur suppression.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updatePost(editing, form);
        setArticles(prev => prev.map(a => a.id === editing ? { ...a, ...form } : a));
        showToast('Article mis à jour.');
      } else {
        const res = await createPost(form);
        setArticles(prev => [{ id: res.id, ...form, created_at: new Date().toISOString(), views_count: 0 }, ...prev]);
        showToast('Article créé.');
      }
      resetForm();
    } catch (err) { showToast(err.message); }
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Chargement...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Gestion des Articles</h2>
        <button onClick={resetForm} className="bg-ziv-cyan hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center text-sm">
          <Plus className="h-4 w-4 mr-2" /> Nouvel Article
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b"><tr>
            <th className="px-6 py-4">Titre</th><th className="px-6 py-4">Catégorie</th>
            <th className="px-6 py-4">Ordre</th>
            <th className="px-6 py-4">Vues</th><th className="px-6 py-4">Statut</th><th className="px-6 py-4 text-right">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map(a => {
              const badge = STATUS_BADGE[a.status] || STATUS_BADGE.draft;
              return (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{a.title}</td>
                  <td className="px-6 py-4">{a.category}</td>
                  <td className="px-6 py-4">{a.sort_order || 0}</td>
                  <td className="px-6 py-4">{a.views_count || 0}</td>
                  <td className="px-6 py-4"><span className={`${badge.className} px-2 py-1 rounded text-xs font-bold`}>{badge.label}</span></td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(a)} className="text-gray-400 hover:text-ziv-cyan mr-3"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(a.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 text-sm">
          <span className="text-gray-500">Page {page} / {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">{editing ? 'Modifier l\'Article' : 'Nouvel Article'}</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Titre (H1 SEO)"><TextInput value={form.title} onChange={set('title')} required placeholder="Ex: Comment obtenir son ACD en 2026..." /></Field>
          <Field label="Slug (URL)"><TextInput value={form.slug} onChange={set('slug')} required placeholder="ex: obtenir-acd-2026" /></Field>
          <Field label="Image de couverture (URL ou Upload)">
            <div className="flex gap-2">
              <TextInput value={form.cover_image} onChange={set('cover_image')} placeholder="https://... ou /uploads/..." />
              <label className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg cursor-pointer text-sm font-medium flex items-center shrink-0">
                Uploader
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Catégorie">
              <Select value={form.category} onChange={set('category')}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</Select>
            </Field>
            <Field label="Statut">
              <Select value={form.status} onChange={set('status')}>
                <option value="draft">Brouillon</option><option value="published">Publié</option><option value="archived">Archivé</option>
              </Select>
            </Field>
            <Field label="Ordre d'affichage">
              <TextInput type="number" value={form.sort_order} onChange={set('sort_order')} placeholder="0" />
            </Field>
          </div>
          <Field label="Méta Description"><TextArea rows={2} value={form.meta_description} onChange={set('meta_description')} /></Field>
          <Field label="Contenu (Éditeur Riche)">
            <div className="bg-white">
              <ReactQuill 
                theme="snow" 
                value={form.content_html} 
                onChange={(content) => setForm(f => ({ ...f, content_html: content }))}
                className="h-64 mb-12"
              />
            </div>
          </Field>
          <div className="flex justify-end pt-4">
            {editing && <button type="button" onClick={resetForm} className="mr-4 text-gray-500 hover:text-gray-700 text-sm">Annuler</button>}
            <button type="submit" className="bg-ziv-cyan hover:bg-cyan-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-colors">
              {editing ? 'Mettre à jour' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
