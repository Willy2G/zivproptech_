import { ArrowRight, Check } from 'lucide-react';
import Icon from '../ui/Icon.jsx';
import { useModal } from '../../context/ModalContext.jsx';

// Carte d'un module logiciel specialise (pilotee par data/modules.js).
export default function ModuleCard({ module }) {
  const { openSoftware } = useModal();
  const a = module.accent;
  
  const isImageLogo = module.icon && (module.icon.startsWith('http') || module.icon.startsWith('/'));

  return (
    <button
      type="button"
      onClick={() => openSoftware(module.modalId)}
      className={`text-left bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] ${a.shadow} transition-all duration-300 cursor-pointer group flex flex-col h-full transform hover:-translate-y-2 relative overflow-hidden w-full`}
    >
      <div
        className={`absolute top-0 left-0 w-full h-1 ${a.bar} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
      />
      {module.tag && (
        <div className={`absolute top-4 right-4 ${a.tagBg} ${a.tagText} text-xs font-bold px-2 py-1 rounded`}>
          {module.tag}
        </div>
      )}

      <div
        className={`w-14 h-14 ${a.iconBg} rounded-xl flex items-center justify-center mb-6 ${a.iconHover} group-hover:text-white transition-colors duration-300 ${a.iconText}`}
      >
        {isImageLogo ? (
          <img src={module.icon} alt="Logo" className="w-10 h-10 object-contain" />
        ) : (
          <Icon name={module.icon} className="h-7 w-7" />
        )}
      </div>
      <h4 className={`text-xl font-bold text-gray-900 mb-3 ${a.titleHover} transition-colors`}>
        {module.title}
      </h4>
      <p className="text-gray-600 text-sm mb-6 flex-grow">{module.description}</p>

      <ul className="text-sm text-gray-500 space-y-2 mb-6 border-t border-gray-50 pt-4">
        {module.features.map((f) => (
          <li key={f} className="flex items-center">
            <Check className={`h-4 w-4 ${a.check} mr-2`} /> {f}
          </li>
        ))}
      </ul>

      <div className={`flex items-center ${a.cta} font-semibold text-sm mt-auto justify-between`}>
        <span className="flex items-center">
          Détails{module.videoComingSoon ? '' : ' & Vidéo'}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
        </span>
        {module.videoComingSoon && (
          <span className="text-[10px] text-gray-400 font-medium border border-gray-200 px-2 py-1 rounded-full bg-gray-50">
            Vidéo à venir
          </span>
        )}
      </div>
    </button>
  );
}
