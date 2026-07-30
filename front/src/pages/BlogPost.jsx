import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Loader2, ArrowLeft, Share2, Facebook, Linkedin, Mail, Link2, Check, MessageCircle } from 'lucide-react';
import { fetchPostBySlug } from '../services/api.js';

function ShareButtons({ title, url, compact = false }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]',
      textColor: 'text-[#1877F2]',
    },
    {
      name: 'X',
      icon: () => (
        <svg viewBox="0 0 24 24" className={compact ? 'h-4 w-4' : 'h-5 w-5'} fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:bg-black hover:text-white hover:border-black',
      textColor: 'text-black',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]',
      textColor: 'text-[#0A66C2]',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-[#25D366] hover:text-white hover:border-[#25D366]',
      textColor: 'text-[#25D366]',
    },
    {
      name: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}`,
      color: 'hover:bg-gray-700 hover:text-white hover:border-gray-700',
      textColor: 'text-gray-600',
    },
  ];

  const btnBase = compact
    ? 'w-9 h-9 rounded-lg text-sm'
    : 'w-10 h-10 rounded-xl text-sm';

  return (
    <div className={`flex items-center ${compact ? 'gap-1.5' : 'gap-2'} flex-wrap`}>
      {shareLinks.map(({ name, icon: Icon, href, color, textColor }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Partager sur ${name}`}
          className={`${btnBase} flex items-center justify-center border border-gray-200 bg-white ${textColor} ${color} transition-all duration-200 shadow-sm hover:shadow-md`}
        >
          <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </a>
      ))}
      <button
        onClick={handleCopy}
        title="Copier le lien"
        className={`${btnBase} flex items-center justify-center border transition-all duration-200 shadow-sm hover:shadow-md ${
          copied
            ? 'bg-green-500 text-white border-green-500'
            : 'border-gray-200 bg-white text-gray-500 hover:bg-ziv-cyan hover:text-white hover:border-ziv-cyan'
        }`}
      >
        {copied ? <Check className={compact ? 'h-4 w-4' : 'h-5 w-5'} /> : <Link2 className={compact ? 'h-4 w-4' : 'h-5 w-5'} />}
      </button>
    </div>
  );
}

export { ShareButtons };

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
  const articleUrl = window.location.href;

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-100 pb-4 gap-3">
          <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Share2 className="h-4 w-4" /> Partager cet article
          </span>
          <ShareButtons title={post.title} url={articleUrl} />
        </div>
        
        <div
          className="prose prose-lg md:prose-xl max-w-none text-gray-700 leading-relaxed prose-headings:font-heading prose-headings:font-bold prose-headings:text-ziv-navy prose-a:text-ziv-cyan hover:prose-a:text-cyan-600 prose-img:rounded-xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: post.content_html }}
        />

        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-10">
            <span className="text-sm font-medium text-gray-500">Vous avez aimé ? Partagez !</span>
            <ShareButtons title={post.title} url={articleUrl} />
          </div>
        </div>

        <div className="pt-2 bg-gray-50 rounded-2xl p-8 text-center">
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
