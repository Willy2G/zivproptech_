import { ModalProvider } from '../context/ModalContext.jsx';

import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';

import { Routes, Route } from 'react-router-dom';
import Home from './Home.jsx';
import BlogIndex from './BlogIndex.jsx';
import BlogPost from './BlogPost.jsx';

import SoftwareModal from '../components/modals/SoftwareModal.jsx';
import BlogModal from '../components/modals/BlogModal.jsx';
import LegalModal from '../components/modals/LegalModal.jsx';
import ExpertModal from '../components/modals/ExpertModal.jsx';

import WhatsAppButton from '../components/widgets/WhatsAppButton.jsx';
import Chatbot from '../components/widgets/Chatbot.jsx';

// Site vitrine public. Le ModalProvider n'englobe que cet espace.
export default function PublicSite() {
  return (
    <ModalProvider>
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </main>

      <Footer />

      {/* Modales (rendues au niveau racine, pilotees par ModalContext) */}
      <SoftwareModal />
      <BlogModal />
      <LegalModal />
      <ExpertModal />

      {/* Widgets flottants */}
      <WhatsAppButton />
      <Chatbot />
    </ModalProvider>
  );
}
