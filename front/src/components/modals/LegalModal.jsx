import Modal from './Modal.jsx';
import { legalData } from '../../data/legalData.js';
import { useModal } from '../../context/ModalContext.jsx';

export default function LegalModal() {
  const { legalModal, closeLegal } = useModal();
  const data = legalModal.id ? legalData[legalModal.id] : null;

  return (
    <Modal
      open={legalModal.open}
      onClose={closeLegal}
      maxWidth="sm:max-w-4xl"
      backdrop="bg-gray-900/80"
      closeButtonClass="bg-gray-100 text-gray-600 hover:bg-gray-200"
    >
      {data && (
        <>
          <div className="bg-ziv-navy p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-ziv-cyan rounded-full opacity-20 blur-3xl" />
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold relative z-10">
              {data.title}
            </h2>
            <p className="text-blue-200 mt-2 text-sm relative z-10">
              Édité par ALERTE FONCIER - Côte d'Ivoire
            </p>
          </div>

          <div className="p-6 md:p-10 bg-white max-h-[70vh] overflow-y-auto">
            <div
              className="prose prose-sm sm:prose max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200 text-right">
            <button
              type="button"
              onClick={closeLegal}
              className="bg-ziv-cyan hover:bg-cyan-600 text-white font-bold py-2.5 px-6 rounded-lg transition duration-300 text-sm"
            >
              J'ai compris et j'accepte
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
