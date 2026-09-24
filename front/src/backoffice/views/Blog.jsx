import { useEffect, useState } from 'react';
import { BarChart3, Calendar, Clock, Edit2, Eye, ExternalLink, Loader2, Plus, TrendingUp, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
const CATEGORIES = ['Réglementatigit on', 'Promotion', 'Lotissement', 'Syndic', 'Gestion Locative', 'Tech'];

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function ViewsDetailPanel({ article, onClose }) {
  if (!article) return null;

  const views = article.views_count || 0;
  const publishedDays = daysSince(article.published_at);
  const avgPerDay = publishedDays && publishedDays > 0 ? (views / publishedDays).toFixed(1) : views;
  const slug = article.slug;
  const readTime = article.read_time_minutes || 5;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-ziv-navy to-ziv-blue p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-ziv-cyan" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">Détail des Vues</h3>
              <p className="text-blue-200 text-xs">Statistiques de l'article</p>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium line-clamp-2 mt-2">{article.title}</p>
        </div>

        {/* Stats grid */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center text-blue-500 mb-2">
                <Eye className="h-4 w-4 mr-1.5" />
                <span className="text-xs font-semibold uppercase tracking-wide">Vues Totales</span>
              </div>
              <p className="text-3xl font-extrabold text-ziv-navy">{views.toLocaleString('fr-FR')}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center text-green-500 mb-2">
                <TrendingUp className="h-4 w-4 mr-1.5" />
                <span className="text-xs font-semibold uppercase tracking-wide">Vues / Jour</span>
              </div>
              <p className="text-3xl font-extrabold text-ziv-navy">{avgPerDay}</p>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" /> Date de publication
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {article.published_at
                  ? new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Non publié'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-sm text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-400" /> Temps de lecture
              </span>
              <span className="text-sm font-semibold text-gray-900">{readTime} min</span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" /> En ligne depuis
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {publishedDays !== null ? `${publishedDays} jour${publishedDays > 1 ? 's' : ''}` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-gray-500 flex items-center">
                <ExternalLink className="h-4 w-4 mr-2 text-gray-400" /> Slug (URL)
              </span>
              <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">/{slug}</span>
            </div>
          </div>

          {/* Performance bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Performance</span>
              <span className="text-xs text-gray-400">
                {views >= 100 ? '🔥 Populaire' : views >= 30 ? '📈 En croissance' : '🌱 Nouveau'}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${views >= 100 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                    views >= 30 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                      'bg-gradient-to-r from-blue-300 to-cyan-400'
                  }`}
                style={{ width: `${Math.min((views / 200) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Blog() {
  const { showToast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [editing, setEditing] = useState(null);
  const [viewsDetail, setViewsDetail] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', category: CATEGORIES[0], content_html: '', meta_description: '', status: 'draft', cover_image: '', sort_order: 0 });

  useEffect(() => {
    fetchPosts().then(setArticles).catch(() => showToast('Erreur chargement articles.')).finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(articles.length / perPage));
  const paginated = articles.slice((page - 1) * perPage, page * perPage);

  // --- KPIs ---
  const totalViews = articles.reduce((sum, a) => sum + (a.views_count || 0), 0);
  const publishedCount = articles.filter(a => a.status === 'published').length;
  const topArticle = articles.length > 0
    ? articles.reduce((best, a) => (a.views_count || 0) > (best.views_count || 0) ? a : best, articles[0])
    : null;
  const avgViews = articles.length > 0 ? Math.round(totalViews / articles.length) : 0;

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Gestion des Articles</h2>
        <button onClick={resetForm} className="bg-ziv-cyan hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center text-sm">
          <Plus className="h-4 w-4 mr-2" /> Nouvel Article
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Articles</span>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Edit2 className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{articles.length}</p>
          <p className="text-xs text-gray-400 mt-1">{publishedCount} publié{publishedCount > 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Vues Totales</span>
            <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
              <Eye className="h-4 w-4 text-ziv-cyan" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{formatNumber(totalViews)}</p>
          <p className="text-xs text-gray-400 mt-1">sur tous les articles</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Moy. / Article</span>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{formatNumber(avgViews)}</p>
          <p className="text-xs text-gray-400 mt-1">vues en moyenne</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Top Article</span>
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-orange-500" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{topArticle ? formatNumber(topArticle.views_count || 0) : '—'}</p>
          <p className="text-xs text-gray-400 mt-1 truncate max-w-[160px]" title={topArticle?.title}>{topArticle?.title || '—'}</p>
        </div>
      </div>

      {/* Table */}
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
              const views = a.views_count || 0;
              return (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{a.title}</td>
                  <td className="px-6 py-4">{a.category}</td>
                  <td className="px-6 py-4">{a.sort_order || 0}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setViewsDetail(a)}
                      className="inline-flex items-center space-x-1.5 group cursor-pointer hover:bg-blue-50 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors"
                      title="Cliquer pour voir les détails"
                    >
                      <Eye className="h-3.5 w-3.5 text-gray-400 group-hover:text-ziv-cyan transition-colors" />
                      <span className={`font-semibold ${views >= 100 ? 'text-orange-600' : views >= 30 ? 'text-green-600' : 'text-gray-700'}`}>
                        {views.toLocaleString('fr-FR')}
                      </span>
                      {views >= 100 && <span className="text-[10px]">🔥</span>}
                    </button>
                  </td>
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
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Form */}
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

      {/* Views detail modal */}
      {viewsDetail && <ViewsDetailPanel article={viewsDetail} onClose={() => setViewsDetail(null)} />}
    </div>
  );
}
