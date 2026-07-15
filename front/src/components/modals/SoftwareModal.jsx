import { useEffect, useState } from 'react';
import { ArrowDownCircle, CheckCircle, ListChecks, Play, TrendingUp, VideoOff, Loader2 } from 'lucide-react';
import Modal from './Modal.jsx';
import Icon from '../ui/Icon.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { fetchSoftwares } from '../../services/api.js';
import { softwareStylesMap } from '../../utils/softwareStyles.js';

export default function SoftwareModal() {
  const { softwareModal, closeSoftware, selectSoftwareAndScroll } = useModal();
  const [playing, setPlaying] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (softwareModal.open && softwareModal.id) {
      setLoading(true);
      fetchSoftwares()
        .then((softwares) => {
          const software = softwares.find(s => s.id === softwareModal.id);
          if (software) {
            setData({
              id: software.id,
              title: software.name,
              subtitle: software.subtitle,
              description: software.description,
              youtubeId: software.youtube_id,
              videoCover: software.cover_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
              icon: software.icon_name || 'Box',
              features: software.features || [],
              benefits: software.benefits || [],
              iconColor: (softwareStylesMap[software.id] || softwareStylesMap['default']).accent.iconText,
              formValue: software.id
            });
          } else {
            setError("Logiciel introuvable.");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Erreur de chargement.");
          setLoading(false);
        });
    } else {
      setData(null);
      setError(null);
    }
  }, [softwareModal.open, softwareModal.id]);

  // Reinitialise la video a chaque changement de logiciel / fermeture.
  useEffect(() => {
    setPlaying(false);
  }, [softwareModal.id, softwareModal.open]);

  const handleCta = () => {
    closeSoftware();
    // Laisse le temps a la modale de se fermer avant de defiler.
    setTimeout(() => selectSoftwareAndScroll(data?.formValue), 320);
  };

  const isImageLogo = data?.icon && (data.icon.startsWith('http') || data.icon.startsWith('/'));

  return (
    <Modal
      open={softwareModal.open}
      onClose={closeSoftware}
      maxWidth="sm:max-w-5xl"
      backdrop="bg-ziv-navy/80"
    >
      {loading && (
        <div className="flex justify-center items-center h-[50vh] bg-white">
          <Loader2 className="animate-spin text-ziv-cyan h-12 w-12" />
        </div>
      )}

      {error && !loading && (
        <div className="flex justify-center items-center h-[50vh] bg-white text-red-500 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="bg-white">
          {/* Zone media / video */}
          <div className="relative w-full aspect-video md:aspect-[21/9] bg-gray-900 group overflow-hidden flex items-center justify-center">
            {playing && data.youtubeId ? (
              <div className="absolute inset-0 w-full h-full bg-black z-10">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${data.youtubeId}?autoplay=1`}
                  title="Vidéo de présentation"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => data.youtubeId && setPlaying(true)}
                className="absolute inset-0 w-full h-full cursor-pointer"
              >
                <img
                  src={data.videoCover}
                  alt={`Vidéo de présentation ${data.title}`}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                />
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                  {data.youtubeId ? (
                    <>
                      <div className="w-20 h-20 bg-ziv-cyan rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(0,168,181,0.5)] play-button-pulse group-hover:scale-110 transition-transform duration-300">
                        <Play className="h-8 w-8 ml-1" />
                      </div>
                      <span className="mt-4 text-white font-medium text-sm bg-black/50 px-4 py-1 rounded-full backdrop-blur-md">
                        Lancer la vidéo de démonstration
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-gray-500 rounded-full flex items-center justify-center text-white">
                        <VideoOff className="h-8 w-8" />
                      </div>
                      <span className="mt-4 text-white font-medium text-sm bg-black/50 px-4 py-1 rounded-full backdrop-blur-md">
                        Vidéo bientôt disponible
                      </span>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent pointer-events-none" />
              </button>
            )}

            {!playing && (
              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-20 pointer-events-none flex items-center">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg mr-4 flex-shrink-0">
                  {isImageLogo ? (
                    <img src={data.icon} alt="Logo" className="w-8 h-8 object-contain" />
                  ) : (
                    <Icon name={data.icon} className={`h-6 w-6 ${data.iconColor}`} />
                  )}
                </div>
                <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-white leading-tight">
                  {data.title}
                </h2>
              </div>
            )}
          </div>

          {/* Contenu */}
          <div className="px-6 py-10 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-12 flex-grow overflow-y-auto">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-ziv-navy mb-4">{data.subtitle}</h3>
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">{data.description}</p>
              </div>

              <div className="border-t border-gray-100 pt-8">
                <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <ListChecks className="h-5 w-5 mr-2 text-ziv-cyan" /> Toutes les Fonctionnalités
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-start bg-gray-50 p-4 rounded-xl border border-gray-100 h-full hover:border-ziv-cyan/30 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5 text-ziv-cyan mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 leading-relaxed font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 h-fit sticky top-6">
              <h4 className="text-lg font-bold text-gray-900 mb-6">Bénéfices Majeurs</h4>
              <ul className="space-y-4 mb-8">
                {data.benefits.map((b) => (
                  <li key={b} className="flex items-start bg-white rounded-lg p-2">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 border border-green-200">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-800 leading-snug pt-0.5">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500 mb-4 text-center">Passez à la vitesse supérieure</p>
                <button
                  type="button"
                  onClick={handleCta}
                  className="w-full bg-ziv-navy hover:bg-ziv-blue text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex justify-center items-center"
                >
                  Voir les prix & Demander démo
                  <ArrowDownCircle className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
