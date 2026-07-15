import { useState, useEffect } from 'react';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import Modal from './Modal.jsx';
import { fetchPosts } from '../../services/api.js';
import { useModal } from '../../context/ModalContext.jsx';

export default function BlogModal() {
  const { blogModal, closeBlog, openExpert } = useModal();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (blogModal.open && blogModal.id) {
      setLoading(true);
      fetchPosts()
        .then((posts) => {
          const post = posts.find(p => p.id === blogModal.id);
          if (post) {
            setData({
              ...post,
              // Mapping properties to match previous structure
              image: post.cover_image || 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7',
              date: post.published_at ? new Date(post.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date inconnue',
              readTime: post.read_time_minutes ? `${post.read_time_minutes} min` : '5 min',
              content: post.content_html
            });
          } else {
            setError("Article introuvable.");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Impossible de charger l'article.");
          setLoading(false);
        });
    } else {
      setData(null);
      setError(null);
    }
  }, [blogModal.open, blogModal.id]);

  const handleExpert = () => {
    closeBlog();
    setTimeout(openExpert, 320);
  };

  return (
    <Modal open={blogModal.open} onClose={closeBlog} maxWidth="sm:max-w-4xl" backdrop="bg-ziv-navy/90">
      {loading && (
        <div className="flex justify-center items-center h-64 bg-white">
          <Loader2 className="animate-spin text-ziv-cyan h-10 w-10" />
        </div>
      )}

      {error && !loading && (
        <div className="flex justify-center items-center h-64 bg-white text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="relative w-full h-64 md:h-80 bg-gray-900">
            <img
              src={data.image}
              alt={data.title}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 pr-6">
              <span className="bg-ziv-cyan text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">
                {data.category}
              </span>
              <h2 className="text-2xl md:text-4xl font-heading font-extrabold text-white leading-tight">
                {data.title}
              </h2>
            </div>
          </div>

          <div className="p-6 md:p-10 bg-white">
            <div className="flex items-center text-sm text-gray-500 mb-8 border-b border-gray-100 pb-4">
              <Calendar className="h-4 w-4 mr-2" /> <span>{data.date}</span>
              <span className="mx-4">•</span>
              <Clock className="h-4 w-4 mr-2" /> <span>{data.readTime}</span>
            </div>

            <div
              className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />

            <div className="mt-10 pt-8 border-t border-gray-100 text-center">
              <p className="text-sm font-bold text-gray-900 mb-4">Cet article vous a intéressé ?</p>
              <button
                type="button"
                onClick={handleExpert}
                className="bg-ziv-navy hover:bg-ziv-blue text-white font-bold py-3 px-8 rounded-xl transition duration-300 shadow-md"
              >
                Échanger avec un expert PropTech
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
