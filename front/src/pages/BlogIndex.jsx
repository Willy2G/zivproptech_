import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Loader2, Search } from 'lucide-react';
import { fetchPosts } from '../services/api.js';

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
