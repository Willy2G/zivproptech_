import { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * Gestion centralisee de l'etat des modales et de la selection logiciel.
 * Evite le "prop drilling" : n'importe quel composant peut ouvrir une modale
 * (carte solution, chatbot, footer...) via useModal().
 */
const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [softwareModal, setSoftwareModal] = useState({ open: false, id: null });
  const [blogModal, setBlogModal] = useState({ open: false, id: null });
  const [legalModal, setLegalModal] = useState({ open: false, id: null });
  const [expertModal, setExpertModal] = useState(false);

  // Logiciel pre-selectionne dans le formulaire de contact (form value).
  const [selectedSoftware, setSelectedSoftware] = useState('');

  const anyOpen = softwareModal.open || blogModal.open || legalModal.open || expertModal;

  // Bloque le scroll du body quand une modale est ouverte.
  useEffect(() => {
    document.body.style.overflow = anyOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [anyOpen]);

  // Ferme toute modale ouverte avec la touche Echap.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSoftwareModal({ open: false, id: null });
        setBlogModal({ open: false, id: null });
        setLegalModal({ open: false, id: null });
        setExpertModal(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openSoftware = useCallback((id) => setSoftwareModal({ open: true, id }), []);
  const closeSoftware = useCallback(() => setSoftwareModal({ open: false, id: null }), []);

  const openBlog = useCallback((id) => setBlogModal({ open: true, id }), []);
  const closeBlog = useCallback(() => setBlogModal({ open: false, id: null }), []);

  const openLegal = useCallback((id) => setLegalModal({ open: true, id }), []);
  const closeLegal = useCallback(() => setLegalModal({ open: false, id: null }), []);

  const openExpert = useCallback(() => setExpertModal(true), []);
  const closeExpert = useCallback(() => setExpertModal(false), []);

  // Pre-remplit le formulaire et fait defiler jusqu'a la section contact.
  const selectSoftwareAndScroll = useCallback((formValue) => {
    if (formValue) setSelectedSoftware(formValue);
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const value = {
    softwareModal,
    blogModal,
    legalModal,
    expertModal,
    selectedSoftware,
    setSelectedSoftware,
    openSoftware,
    closeSoftware,
    openBlog,
    closeBlog,
    openLegal,
    closeLegal,
    openExpert,
    closeExpert,
    selectSoftwareAndScroll,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal doit être utilisé dans un <ModalProvider>');
  return ctx;
}
