import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Loader2, Search, Share2, Facebook, Linkedin, Mail, Link2, Check, MessageCircle } from 'lucide-react';
import { fetchPosts } from '../services/api.js';

function CardShareMenu({ title, slug }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const articleUrl = `${window.location.origin}/blog/${slug}`;
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(title);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
  };

  const links = [
    { name: 'Facebook', icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: 'text-[#1877F2]' },
    {
      name: 'X',
      icon: () => (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'text-black',
    },
    { name: 'LinkedIn', icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, color: 'text-[#0A66C2]' },
    { name: 'WhatsApp', icon: MessageCircle, href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, color: 'text-[#25D366]' },
    { name: 'Email', icon: Mail, href: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}`, color: 'text-gray-600' },
  ];

  return (
    <div ref={ref} className="relative z-10">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-gray-500 hover:text-ziv-cyan hover:bg-white shadow-sm transition-all duration-200"
        title="Partager"
      >
        <Share2 className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-48 animate-in fade-in slide-in-from-top-2">
          {links.map(({ name, icon: Icon, href, color }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${color}`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-gray-700">{name}</span>
            </a>
          ))}
          <button
            onClick={handleCopy}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${copied ? 'text-green-500' : 'text-gray-500'}`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            <span className="text-gray-700">{copied ? 'Copié !' : 'Copier le lien'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function BlogIndex() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');

  useEffect(() => {
    fetchPosts()
      .then(data => setPosts(data.filter(p => p.status === 'published')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Tous', ...new Set(posts.map(p => p.category))];
  
  const filteredPosts = posts.filter(p => {
    const matchCategory = activeCategory === 'Tous' || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-ziv-navy mb-6">
            Le Blog <span className="text-transparent bg-clip-text bg-gradient-to-r from-ziv-cyan to-ziv-blue">PropTech</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Restez informé des dernières tendances immobilières, des réglementations en Côte d'Ivoire, et des innovations technologiques.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat ? 'bg-ziv-cyan text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-ziv-cyan"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-ziv-cyan h-12 w-12" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10">Aucun article trouvé.</div>
            ) : (
              filteredPosts.map(post => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-ziv-cyan/50 transition-all duration-300 group flex flex-col"
                >
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={post.cover_image || 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7'}
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-ziv-navy text-xs font-bold px-3 py-1.5 rounded-lg">
                      {post.category}
                    </div>
                    <div className="absolute top-4 right-4">
                      <CardShareMenu title={post.title} slug={post.slug} />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-ziv-blue transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 line-clamp-3 flex-grow">
                      {post.meta_description}
                    </p>
                    <div className="flex items-center text-xs text-gray-400 mt-auto">
                      <Calendar className="h-4 w-4 mr-1.5" /> 
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

