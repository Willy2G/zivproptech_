import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Loader2, ArrowLeft, Share2, Link2, Check } from 'lucide-react';
import { fetchPostBySlug } from '../services/api.js';

function ShareButton({ title, url, compact = false }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url
        });
      } catch (err) {
        console.error("Erreur de partage:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const btnBase = compact
    ? 'w-9 h-9 rounded-lg text-sm'
    : 'flex items-center text-gray-400 hover:text-ziv-cyan transition-colors text-sm font-medium';

  return (
    <button
      onClick={handleShare}
      title="Partager"
      className={compact ? `${btnBase} flex items-center justify-center border transition-all duration-200 shadow-sm hover:shadow-md ${copied ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 bg-white text-gray-500 hover:bg-ziv-cyan hover:text-white hover:border-ziv-cyan'}` : btnBase}
    >
      {compact ? (
        copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />
      ) : (
        <>
          {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Share2 className="h-4 w-4 mr-2" />}
          {copied ? <span className="text-green-500">Copié !</span> : 'Partager'}
        </>
      )}
    </button>
  );
}

export { ShareButton };

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPostBySlug(slug)
      .then(setPost)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | ZIV PropTech`;
      
      const setMetaTag = (property, content) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      setMetaTag('og:title', post.title);
      setMetaTag('og:description', post.meta_description || '');
      setMetaTag('og:type', 'article');
      setMetaTag('og:url', window.location.href);
      if (post.cover_image) {
        setMetaTag('og:image', post.cover_image);
      }
    }
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader2 className="animate-spin text-ziv-cyan h-12 w-12" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Article introuvable'}</h2>
        <Link to="/blog" className="text-ziv-cyan hover:underline flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour au blog
        </Link>
      </div>
    );
  }

  const dateStr = post.published_at || post.created_at;
  const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const readTime = post.read_time_minutes ? `${post.read_time_minutes} min` : '5 min';
  
  const apiUrl = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
  const articleUrl = `${apiUrl}/blog/share/${post.slug}?front=${encodeURIComponent(window.location.origin)}`;

  return (
    <article className="bg-white min-h-screen pt-20">
      <div className="relative w-full h-[40vh] md:h-[50vh] bg-gray-900">
        <img
          src={post.cover_image || 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7'}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 max-w-4xl mx-auto md:left-1/2 md:-translate-x-1/2">
          <Link to="/blog" className="inline-flex items-center text-blue-200 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux articles
          </Link>
          <div className="mb-4">
            <span className="bg-ziv-cyan text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {post.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center text-sm text-gray-300 gap-4">
            <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> {formattedDate}</div>
            <div className="flex items-center"><Clock className="h-4 w-4 mr-2" /> Lecture: {readTime}</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex justify-end mb-8 border-b border-gray-100 pb-4">
          <ShareButton title={post.title} url={articleUrl} />
        </div>
        
        <div
          className="prose prose-lg md:prose-xl max-w-none text-gray-700 leading-relaxed prose-headings:font-heading prose-headings:font-bold prose-headings:text-ziv-navy prose-a:text-ziv-cyan hover:prose-a:text-cyan-600 prose-img:rounded-xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: post.content_html }}
        />

        <div className="mt-16 pt-10 border-t border-gray-200 bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold font-heading text-ziv-navy mb-4">Vous souhaitez digitaliser vos processus ?</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Découvrez comment ZIV PropTech peut vous aider à automatiser votre gestion locative, sécuriser vos projets VEFA ou piloter vos lotissements.</p>
          <Link to="/" className="inline-flex bg-ziv-navy hover:bg-ziv-blue text-white font-bold py-3 px-8 rounded-xl transition duration-300 shadow-md">
            Découvrir nos solutions
          </Link>
        </div>
      </div>
    </article>
  );
}
