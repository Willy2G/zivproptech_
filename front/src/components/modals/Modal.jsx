import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

/**
 * Modale de base reutilisable : gere le montage/demontage, l'animation
 * d'ouverture/fermeture (fade + scale) et la fermeture au clic sur le fond.
 *
 * props :
 *  - open        : booleen d'ouverture (pilote par ModalContext)
 *  - onClose     : callback appele apres l'animation de fermeture
 *  - maxWidth    : classe Tailwind (ex: 'sm:max-w-5xl')
 *  - backdrop    : classe du fond (ex: 'bg-ziv-navy/80')
 *  - closeButton : rendu du bouton de fermeture par defaut (true) ou custom
 */
export default function Modal({
  open,
  onClose,
  children,
  maxWidth = 'sm:max-w-4xl',
  backdrop = 'bg-ziv-navy/80',
  closeButtonClass = 'bg-black/40 text-white hover:bg-black/60',
  contentClass = 'flex flex-col',
}) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    // fermeture : joue l'animation puis demonte
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(t);
  }, [open]);

  const handleClose = () => onClose();

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      <div
        className={`fixed inset-0 ${backdrop} backdrop-blur-sm transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div
            className={`relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all duration-300 sm:my-8 sm:w-full ${maxWidth} border border-gray-100 ${contentClass} ${
              visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <button
              type="button"
              onClick={handleClose}
              className={`absolute right-4 top-4 z-20 rounded-full backdrop-blur-md p-2 focus:outline-none transition-colors ${closeButtonClass}`}
              aria-label="Fermer"
            >
              <X className="h-6 w-6" />
            </button>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
