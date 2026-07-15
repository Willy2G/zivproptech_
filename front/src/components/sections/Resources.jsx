import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownToLine, ArrowRight, Calendar, Download, Loader2 } from 'lucide-react';
import { useModal } from '../../context/ModalContext.jsx';
import { fetchPosts, createLead } from '../../services/api.js';

// Carte "aimant a leads" : telechargement du guide gratuit.
function GuideCard() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createLead({
        full_name: 'Lead Guide Gratuit',
        email: email,
        phone: 'Non renseigné',
        software_interest: 'Guide Digitalisation',
        message: 'Téléchargement du guide gratuit'
      });
      setSent(true);
      setEmail('');
      setTimeout(() => setSent(false), 4000);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:col-span-1 bg-gradient-to-br from-ziv-navy to-ziv-blue rounded-2xl p-8 text-white relative overflow-hidden shadow-xl h-full flex flex-col">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl" />
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-wider mb-6 border border-yellow-400/30 w-max">
        <Download className="h-3 w-3 mr-2" /> Ressource Gratuite
      </div>
      <h4 className="text-2xl font-bold font-heading mb-4 leading-tight">
        Le Guide de la Digitalisation Immobilière en Côte d'Ivoire
      </h4>
      <p className="text-blue-100 text-sm mb-8 leading-relaxed flex-grow">
        Découvrez les 5 étapes clés pour automatiser votre agence ou votre société de promotion, et
        éviter les pièges juridiques (ACD, LBC).
      </p>

      <form className="space-y-3 mt-auto" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse email professionnelle"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:bg-white/20 focus:ring-2 focus:ring-ziv-cyan outline-none transition-all text-white placeholder-blue-200 text-sm"
          disabled={loading || sent}
        />
        <button
          type="submit"
          disabled={loading || sent}
          className="w-full bg-ziv-cyan hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition duration-300 text-sm flex justify-center items-center"
        >
          {loading ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : sent ? (
            'Lien envoyé ✓'
          ) : (
            <>Recevoir le Guide <ArrowDownToLine className="ml-2 h-4 w-4" /></>
          )}
        </button>
      </form>
      <p className="text-[10px] text-blue-200/60 mt-4 text-center">
        Déjà téléchargé par +1200 professionnels.
      </p>
    </div>
  );
}

function BlogCard({ post, onOpen }) {
  const dateStr = post.published_at || post.created_at;
  const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  
  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-ziv-cyan/50 transition-all duration-300 group flex flex-col"
    >
      <div className="h-40 overflow-hidden relative">
        <img
          src={post.cover_image || 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7'}
          alt={post.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-ziv-navy text-xs font-bold px-2.5 py-1 rounded-lg">
          {post.category}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h4 className="font-bold text-gray-900 mb-2 group-hover:text-ziv-blue transition-colors line-clamp-2">
          {post.title}
        </h4>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{post.meta_description}</p>
        <div className="flex items-center text-xs text-gray-400 mt-auto">
          <Calendar className="h-3 w-3 mr-1" /> {formattedDate}
        </div>
      </div>
    </button>
  );
}

export default function Resources() {
  const { openBlog } = useModal();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts()
      .then((data) => {
        setPosts(data.filter(p => p.status === 'published') || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les articles.");
        setLoading(false);
      });
  }, []);

  return (
    <section id="ressources" className="py-24 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="max-w-2xl">
            <h2 className="text-ziv-cyan font-semibold tracking-wide uppercase text-sm mb-2">
              Centre de Connaissances
            </h2>
            <h3 className="text-3xl md:text-4xl font-heading font-bold text-ziv-navy mb-4">
              Ressources & Expertises PropTech
            </h3>
            <p className="text-gray-600">
              Restez à jour sur la réglementation foncière, les innovations technologiques et les
              meilleures pratiques de l'immobilier en UEMOA.
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <Link
              to="/blog"
              className="text-ziv-blue font-semibold hover:text-blue-800 flex items-center transition-colors"
            >
              Voir tout le blog <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GuideCard />

          <div className="lg:col-span-2">
            {loading && (
              <div className="flex justify-center h-full items-center">
                <Loader2 className="animate-spin text-ziv-cyan h-8 w-8" />
              </div>
            )}
            
            {error && (
              <div className="text-center text-red-500 h-full flex items-center justify-center">{error}</div>
            )}
            
            {!loading && !error && posts.length === 0 && (
              <div className="text-center text-gray-500 h-full flex items-center justify-center">Aucun article publié.</div>
            )}

            {!loading && !error && posts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {posts.slice(0, 2).map((post) => (
                  <BlogCard key={post.id} post={post} onOpen={() => openBlog(post.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
